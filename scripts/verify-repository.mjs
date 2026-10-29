// Validate the files Git would include, including before a local repository exists.
// Uses a disposable Git directory when needed; never stages or commits project files.
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseDocument } from 'yaml';

const root = process.cwd();
const failures = [];
let temporary;
let gitArgs = [];
const git = (args) => execFileSync('git', [...gitArgs, ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try {
  try {
    const top = git(['rev-parse', '--show-toplevel']).trim();
    if (path.resolve(top) !== root) throw new Error('Run repo:check at the repository root containing package.json.');
  } catch (error) {
    if (!error.stderr?.toString().includes('not a git repository')) throw error;
    temporary = await mkdtemp(path.join(tmpdir(), 'website-repository-check-'));
    execFileSync('git', ['init', '--bare', '--quiet', temporary], { stdio: 'pipe' });
    gitArgs = [`--git-dir=${temporary}`, `--work-tree=${root}`];
  }
  const files = [...new Set(git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean))].sort();
  const fileSet = new Set(files);
  const forbidden = /(^|\/)(node_modules|dist|\.astro|\.git|\.openai|\.codex|\.agents|\.aws|\.vscode|\.idea|__pycache__)(\/|$)|(^|\/)(\.DS_Store|\.npmrc|\.env(?:\..*)?)$|\.blend\d+$|\.py[co]$|\.log$/;
  const required = ['package.json', 'package-lock.json', '.nvmrc', '.gitignore', '.gitattributes', 'README.md', 'AGENTS.md', 'src/content.config.ts', 'src/content/pages/home.md', 'src/content/site/main.md', 'public/assets/quantum-orbitals-ehu.png', 'public/assets/quantum-orbitals-ehu.glb', 'public/assets/ehu-logo.svg', 'public/fonts/inter-OFL.txt', 'public/licenses/three.txt', 'artwork/hero/small_epolaron.blend', 'artwork/hero/website-hero.blend', '.github/workflows/check.yml', 'operations/github-pages.yml'];
  for (const file of required) if (!fileSet.has(file)) failures.push(`Required file missing from commit candidates: ${file}`);
  let totalBytes = 0;
  let largest = { file: '', bytes: 0 };
  for (const file of files) {
    if (file === '.env.example') continue;
    if (forbidden.test(file) || file.startsWith('reference/') || file.startsWith('docs/source-snapshot/')) failures.push(`Generated/local-only file would be committed: ${file}`);
    const info = await stat(file).catch(() => null);
    if (!info) { failures.push(`Tracked file is missing: ${file}`); continue; }
    totalBytes += info.size;
    if (info.size > largest.bytes) largest = { file, bytes: info.size };
    if (info.size > 100 * 1024 * 1024) failures.push(`File exceeds GitHub's regular Git limit: ${file}`);
    if (!/\.(md|astro|[cm]?js|ts|json|ya?ml|css|svg|py|txt)$/.test(file)) continue;
    const source = await readFile(file, 'utf8');
    const secret = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b|\bAKIA[A-Z0-9]{16}\b/;
    if (secret.test(source)) failures.push(`Possible credential in ${file}; inspect locally before committing.`);
    if (/\/Users\/[\w.-]+\//.test(source)) failures.push(`Personal filesystem path in ${file}`);
    if (file.endsWith('.md') && (!file.startsWith('src/content/') || file.endsWith('/README.md'))) {
      const prose = source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '').replace(/`[^`\n]+`/g, '');
      for (const match of prose.matchAll(/!?\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)) {
        const href = match[1] || match[2];
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) continue;
        const local = decodeURIComponent(href.split(/[?#]/)[0]);
        if (!local) continue;
        const target = path.relative(root, path.resolve(path.dirname(file), local)).split(path.sep).join('/');
        if (!fileSet.has(target) && !files.some((candidate) => candidate.startsWith(`${target}/`))) failures.push(`Documentation link will not exist in a fresh clone: ${file} → ${href}`);
      }
    }
  }
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
  assert.deepEqual(pkg.dependencies, lock.packages[''].dependencies, 'Dependency declarations differ from lockfile');
  assert.deepEqual(pkg.devDependencies, lock.packages[''].devDependencies, 'Development dependencies differ from lockfile');
  assert(pkg.engines.node.includes((await readFile('.nvmrc', 'utf8')).trim()), 'Node pin differs from package.json');
  JSON.parse(await readFile('design-tokens.json', 'utf8'));
  for (const file of ['.github/workflows/check.yml', 'operations/github-pages.yml']) {
    const doc = parseDocument(await readFile(file, 'utf8'));
    if (doc.errors.length) throw new Error(`${file}: ${doc.errors[0].message}`);
    const workflow = doc.toJS();
    assert(workflow.on && workflow.jobs, `${file}: missing workflow triggers/jobs`);
    for (const job of Object.values(workflow.jobs)) {
      for (const step of job.steps || []) {
        for (const match of (step.run || '').matchAll(/npm run ([\w:-]+)/g)) {
          if (!pkg.scripts[match[1]]) failures.push(`${file} calls undefined npm script: ${match[1]}`);
        }
      }
    }
  }
  if (failures.length) throw new Error([...new Set(failures)].join('\n'));
  console.log(`PASS: ${files.length} commit candidates, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB; documentation links, workflows, lockfile and exclusions checked.`);
  console.log(`Largest file: ${largest.file} (${(largest.bytes / 1024 / 1024).toFixed(1)} MiB). Use Git or GitHub Desktop to upload.`);
  if (process.argv.includes('--list')) console.log(files.join('\n'));
} catch (error) {
  console.error(`Repository checks failed:\n${error.message}`);
  process.exitCode = 1;
} finally {
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
