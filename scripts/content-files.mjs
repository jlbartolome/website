import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parseDocument } from 'yaml';

/** Read the same flat Markdown collections used by Astro's glob loader. */
export async function readCollection(collection, root = 'src/content') {
  const folder = join(root, collection);
  const files = await readdir(folder, { withFileTypes: true });
  const entries = [];
  for (const file of files) {
    if (file.isDirectory()) throw new Error(`${folder}: keep entries directly in this folder, not in subfolders.`);
    if (!file.name.endsWith('.md')) continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file.name)) throw new Error(`${folder}/${file.name}: use a lowercase filename with hyphens.`);
    const source = await readFile(join(folder, file.name), 'utf8');
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
    if (!match) throw new Error(`${folder}/${file.name}: expected YAML fields between two --- lines.`);
    const document = parseDocument(match[1]);
    if (document.errors.length) throw new Error(`${folder}/${file.name}: ${document.errors[0].message}`);
    const data = document.toJS();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${folder}/${file.name}: fields must be a YAML mapping.`);
    entries.push({ id: file.name.slice(0, -3), data, body: match[2] });
  }
  return entries;
}
export async function verifyContent(root = 'src/content') {
  const folders = ['site', 'pages', 'news', 'research', 'publications', 'courses', 'workshops', 'outreach', 'opportunities'];
  const collections = Object.fromEntries(await Promise.all(folders.map(async (folder) => [folder, await readCollection(folder, root)])));
  const publications = new Map(collections.publications.map((entry) => [entry.id, entry]));
  for (const theme of collections.research.filter(({ data }) => !data.draft)) {
    const ids = theme.data.papers || [];
    if (new Set(ids).size !== ids.length) throw new Error(`research/${theme.id}.md: duplicate selected publication.`);
    for (const id of ids) {
      const paper = publications.get(id);
      if (!paper || paper.data.draft) throw new Error(`research/${theme.id}.md selects missing or draft publication "${id}". Update its papers list before removing or hiding that paper.`);
    }
  }
  for (const page of collections.pages) {
    const sections = page.data.sections || [];
    if (new Set(sections.map(({ id }) => id)).size !== sections.length) throw new Error(`pages/${page.id}.md: duplicate section IDs.`);
  }
  const outreach = collections.pages.find(({ id }) => id === 'outreach');
  for (const entry of collections.outreach.filter(({ data }) => !data.draft)) {
    if (!outreach?.data.sections?.some(({ id }) => id === entry.data.section)) throw new Error(`outreach/${entry.id}.md: unknown section "${entry.data.section}".`);
  }
  const teaching = collections.pages.find(({ id }) => id === 'teaching');
  for (const [folder, section] of [['courses','courses'], ['workshops','schools']]) {
    if (collections[folder].some(({ data }) => !data.draft) && !teaching?.data.sections?.some(({ id }) => id === section)) throw new Error(`pages/teaching.md is missing the "${section}" section for active ${folder} entries.`);
  }
  if (teaching?.data.sections?.some(({ id }) => !['courses', 'schools'].includes(id))) throw new Error('Teaching supports the courses and schools section IDs. Edit their titles without changing these IDs.');
  const bibliography = collections.pages.find(({ id }) => id === 'publications');
  const statuses = bibliography?.data.sections?.map(({ status }) => status) || [];
  if (new Set(statuses).size !== statuses.length) throw new Error('pages/publications.md: duplicate publication status groups.');
  for (const entry of collections.publications.filter(({ data }) => !data.draft)) {
    if (!statuses.includes(entry.data.status)) throw new Error(`Publication ${entry.id} has no displayed status group.`);
  }
  return collections;
}
