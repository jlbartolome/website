// Exercise author edits in a disposable copy, never in the live preview sources.
import assert from 'node:assert/strict';
import { mkdtemp, cp, symlink, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseDocument } from 'yaml';

const project = process.cwd();
const fixture = await mkdtemp(path.join(tmpdir(), 'b1-content-workflow-'));
const file = (relative) => path.join(fixture, relative);
const read = (relative) => readFile(file(relative), 'utf8');
const write = (relative, text) => writeFile(file(relative), text);
const run = (script, env = {}, success = true) => {
  const result = spawnSync('npm', ['run', script], {
    cwd: fixture, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', SITE_URL: 'https://local-preview.example', BASE_PATH: '/', ...env },
  });
  if (success) assert.equal(result.status, 0, `${script} failed:\n${result.stdout}\n${result.stderr}`);
  else assert.notEqual(result.status, 0, `${script} unexpectedly accepted invalid content`);
  return result.stdout + result.stderr;
};
const fixtures = new Map([
  ['publications/fixture-paper', '---\ntitle: Workflow fixture paper\nauthors: [Example Author]\nyear: 2030\nstatus: preprint\norder: 0\nsource: https://example.org/paper\nsourceChecked: "2026-10-28"\n---\n\nOptional **publication note**.\n'],
  ['research/fixture-theme', '---\ntitle: Workflow fixture theme\norder: 0\npapers: [fixture-paper]\n---\n\nMarkdown **emphasis**, ab initio theory, and a [local link](/bio/#contact).\n\n![Existing illustration](/assets/research/many-body.svg)\n\n![Processed photo](../../assets/images/fixture-figure.png)\n'],
  ['research/fixture-theme-later', '---\ntitle: Workflow fixture theme later\norder: 1001\npapers: []\n---\n\nA second theme for the ordering check.\n'],
  ['courses/fixture-course', '---\ntitle: Workflow fixture course\norder: 0\nlinks: []\n---\n\nAn editable course paragraph.\n'],
  ['workshops/fixture-workshop', '---\ntitle: Workflow fixture workshop\ndetail: Example location\norder: 0\n---\n\nAn optional workshop paragraph.\n'],
  ['outreach/fixture-outreach', '---\ntitle: Workflow fixture outreach\nsection: coverage\ndetail: Example publication\norder: 0\n---\n\nAn optional outreach paragraph.\n'],
  ['opportunities/fixture-opportunity', '---\ntitle: Workflow fixture opportunity\norder: 0\n---\n\nAn editable opportunity paragraph.\n'],
  ['news/fixture-news', '---\ntitle: Workflow fixture news\ndate: "2030-01-01"\nhref: https://example.org/news\nsource: https://example.org/news\nsourceChecked: "2026-10-28"\n---\n\nAn editable news summary.\n'],
]);
try {
  for (const directory of ['src', 'scripts']) await cp(path.join(project, directory), file(directory), { recursive: true });
  for (const name of ['package.json', 'astro.config.mjs', 'tsconfig.json']) await cp(path.join(project, name), file(name));
  await symlink(path.join(project, 'node_modules'), file('node_modules'), 'dir');
  await symlink(path.join(project, 'public'), file('public'), 'dir');
  // Own image fixture keeps the test independent of the owner's portrait filename.
  await write('src/assets/images/fixture-figure.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAD0lEQVQImWP4jwMwDKQEAAjcj3HPs8CiAAAAAElFTkSuQmCC', 'base64'));
  for (const [id, text] of fixtures) await write(`src/content/${id}.md`, text);
  const home = await read('src/content/pages/home.md');
  const homeParts = home.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  assert(homeParts, 'Homepage must have Markdown frontmatter');
  const homeFields = parseDocument(homeParts[1]);
  homeFields.set('intro', 'Workflow edited introduction');
  await write('src/content/pages/home.md', `---\n${homeFields.toString()}---\n${homeParts[2]}`);
  await write('src/content/pages/bio.md', (await read('src/content/pages/bio.md')) + '\nWorkflow edited biography.\n');
  run('check');
  run('build');
  run('release:check');
  const routeMarkers = { 'index.html': ['Workflow edited introduction', 'Workflow fixture news', 'An editable news summary.'], 'bio/index.html': ['Workflow edited biography.'], 'research/index.html': ['Workflow fixture theme', 'Workflow fixture paper', '<strong>emphasis</strong>', '<i lang="la">ab initio</i>', 'href="/bio/#contact"', 'src="/assets/research/many-body.svg"', '/_astro/fixture-figure.'], 'publications/index.html': ['id="fixture-paper"', '<strong>publication note</strong>'], 'teaching/index.html': ['Workflow fixture course', 'Workflow fixture workshop', 'An optional workshop paragraph.'], 'outreach/index.html': ['Workflow fixture outreach', 'An optional outreach paragraph.'], 'join-us/index.html': ['Workflow fixture opportunity'] };
  for (const [route, markers] of Object.entries(routeMarkers)) {
    const html = await read(`dist/${route}`);
    for (const marker of markers) assert(html.includes(marker), `${route}: missing ${marker}`);
  }
  const research = await read('dist/research/index.html');
  assert(research.indexOf('id="fixture-theme"') < research.indexOf('id="fixture-theme-later"'), 'order field must control theme order');
  assert(research.includes('href="#fixture-theme"'), 'new theme must appear in section navigation');
  assert(research.includes('max-width:100%;height:auto'), 'Markdown images must fit the prose column');
  console.log('PASS: Markdown edits and additions render across every collection, including inline formatting and local/processed images.');

  run('build', { SITE_URL: 'https://example.github.io', BASE_PATH: '/research-site' });
  run('verify');
  run('release:check');
  const subpath = await read('dist/research/index.html');
  assert(subpath.includes('href="/research-site/bio/#contact"'));
  assert(subpath.includes('src="/research-site/assets/research/many-body.svg"'));
  assert(subpath.includes('/research-site/_astro/fixture-figure.'));
  console.log('PASS: Markdown links, public illustrations and processed images work under a project subpath.');

  for (const [id, text] of fixtures) await write(`src/content/${id}.md`, text.replace('---\n', '---\ndraft: true\n'));
  run('build');
  for (const route of Object.keys(routeMarkers)) assert(!(await read(`dist/${route}`)).includes('Workflow fixture'), `${route}: draft entry visible`);
  run('release:check');
  console.log('PASS: draft entries are hidden from pages, navigation and selected-paper panels.');

  for (const id of fixtures.keys()) await rm(file(`src/content/${id}.md`));
  run('build');
  run('release:check');
  for (const route of Object.keys(routeMarkers)) assert(!(await read(`dist/${route}`)).includes('Workflow fixture'), `${route}: deleted entry visible`);
  console.log('PASS: deleting entries removes them cleanly.');

  const themePath = 'src/content/research/fixture-theme.md';
  await write(themePath, fixtures.get('research/fixture-theme').replace('fixture-paper', 'missing-paper'));
  assert(run('build', {}, false).includes('missing or draft publication'));
  await rm(file(themePath));
  const coursePath = 'src/content/courses/fixture-course.md';
  const course = fixtures.get('courses/fixture-course');
  await write(coursePath, course.replace(/^title:.*$/m, 'title: 123'));
  assert(run('check', {}, false).includes('title'));
  await write(coursePath, course);
  await write(coursePath, course.replace(/^title:.*$/m, 'title: Example\ntitle: Duplicate'));
  assert(run('content:check', {}, false).includes('unique'));
  console.log('PASS: missing selected papers, invalid field types and duplicate YAML keys fail clearly.');
} finally {
  await rm(fixture, { recursive: true, force: true });
}
