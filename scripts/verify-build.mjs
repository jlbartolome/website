// Smoke checks for the static output. Not a substitute for visual
// review, external-link checks, scientific fact checking, or an accessibility audit.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { verifyHeroModel } from './verify-hero.mjs';
import { verifyContent } from './content-files.mjs';

const root = path.resolve('dist');
const release = process.argv.includes('--release');
const failures = [];
const fail = (message) => failures.push(message);
async function exists(file) { try { return (await stat(file)).isFile(); } catch { return false; } }
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const groups = await Promise.all(entries.map((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  return groups.flat();
}
if (!await exists(path.join(root, 'index.html'))) {
  console.error('No dist/index.html. Run npm run build first.'); process.exit(1);
}
const home = await readFile(path.join(root, 'index.html'), 'utf8');
const canonical = home.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
if (!canonical) { console.error('Homepage canonical URL is missing.'); process.exit(1); }
const base = new URL(canonical);
const files = await walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
let checked = 0;
async function checkRef(ref, contextUrl, file) {
  if (!ref || /^(data:|mailto:|tel:)/i.test(ref)) return;
  const url = new URL(ref.replaceAll('&amp;', '&'), contextUrl);
  if (!/^https?:$/.test(url.protocol)) return;
  // Project-path builds must not send local navigation back to the live domain.
  const legacy = url.origin === 'https://www.jonlafuentebartolome.xyz'
    && /^\/(research|publications|bio|teaching|outreach|join-us)\/?$/.test(url.pathname);
  if (url.origin !== base.origin) {
    if (legacy && release) fail(`Legacy navigation remains in ${path.relative(root, file)}: ${ref}`);
    return;
  }
  if (!url.pathname.startsWith(base.pathname)) {
    fail(`URL escapes configured base ${base.pathname}: ${ref}`); return;
  }
  const relative = decodeURIComponent(url.pathname.slice(base.pathname.length));
  let target = path.resolve(root, relative);
  if (target !== root && !target.startsWith(root + path.sep)) { fail(`Unsafe local path: ${ref}`); return; }
  if (!await exists(target)) target = path.join(target, 'index.html');
  checked++;
  if (!await exists(target)) fail(`Missing local target from ${path.relative(root, file)}: ${ref}`);
  else if (url.hash && target.endsWith('.html')) {
    const html = await readFile(target, 'utf8');
    const id = decodeURIComponent(url.hash.slice(1));
    if (!html.includes(`id="${id}"`)) fail(`Missing fragment from ${path.relative(root, file)}: ${ref}`);
  }
}
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const rel = path.relative(root, file).split(path.sep).join('/');
  const context = new URL(rel, base);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`Missing title: ${rel}`);
  if (!/<meta\b[^>]*name="description"[^>]*content="[^"]+"/.test(html)) fail(`Missing description: ${rel}`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) fail(`Expected one H1: ${rel}`);
  for (const match of html.matchAll(/\b(?:href|src|data-model)="([^"]+)"/g)) await checkRef(match[1], context, file);
}
for (const file of files.filter((f) => f.endsWith('.css'))) {
  const context = new URL(path.relative(root, file).split(path.sep).join('/'), base);
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) await checkRef(match[1], context, file);
}
for (const asset of ['fonts/inter-400.ttf', 'fonts/inter-500.ttf', 'fonts/inter-600.ttf', 'fonts/inter-OFL.txt', 'assets/ehu-logo.svg', 'assets/quantum-orbitals-ehu.png', 'assets/quantum-orbitals-ehu.glb', 'licenses/three.txt', '404.html', 'sitemap.xml', 'robots.txt']) {
  if (!await exists(path.join(root, asset))) fail(`Required output missing: ${asset}`);
}
let heroSummary;
try { heroSummary = await verifyHeroModel(path.join(root, 'assets/quantum-orbitals-ehu.glb')); }
catch (error) { fail(`Invalid interactive hero: ${error.message}`); }
if (files.some((file) => /\.blend\d?$/.test(file))) fail('Editable Blender source must not be published.');
if (release) {
  const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
  const allHtml = (await Promise.all(htmlFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  for (const route of ['research', 'publications', 'bio', 'teaching', 'outreach', 'join-us']) {
    if (!await exists(path.join(root, route, 'index.html'))) fail(`Required route missing: /${route}/`);
    const expected = new URL(`${route}/`, base).href;
    const navigation = ['research', 'publications', 'bio'].includes(route) ? home : allHtml;
    if (!navigation.includes(`href="${base.pathname}${route}/"`)) fail(`Navigation not local: /${route}/`);
    if (!sitemap.includes(`<loc>${expected}</loc>`)) fail(`Route missing from sitemap: /${route}/`);
  }
  if (sitemap.includes('/404') || sitemap.includes(`${base.pathname}home/`)) fail('Sitemap includes a noncanonical page.');
  if (!await exists(path.join(root, 'home/index.html'))) fail('Legacy /home alias missing.');
  else if (!(await readFile(path.join(root, 'home/index.html'), 'utf8')).includes(`rel="canonical" href="${base.href}"`)) fail('/home must canonicalize to the root homepage.');
  let publications = [];
  try { publications = (await verifyContent()).publications.filter(({ data }) => !data.draft); }
  catch (error) { fail(`Invalid Markdown content: ${error.message}`); }
  if (publications.length === 0) fail('Publication collection is empty.');
  if (new Set(publications.map((paper) => paper.id)).size !== publications.length) fail('Duplicate publication IDs.');
  const bibliographyPath = path.join(root, 'publications/index.html');
  if (await exists(bibliographyPath)) {
    const bibliography = await readFile(bibliographyPath, 'utf8');
    for (const paper of publications) {
      if (!bibliography.includes(`id="${paper.id}"`)) fail(`Publication not rendered: ${paper.id}`);
    }
  }
}
if (failures.length) {
  console.error(`${release ? 'Release' : 'Build'} checks failed:\n- ${[...new Set(failures)].join('\n- ')}`);
  process.exit(1);
}
console.log(`PASS: ${htmlFiles.length} HTML pages; ${checked} local references; base ${base.href}.`);
console.log(`Hero model verified: ${heroSummary}.`);
if (!release) console.log('Static output verified. Run release:check for route, sitemap and bibliography checks.');
