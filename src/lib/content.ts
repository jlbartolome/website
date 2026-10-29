import { getEntry, type CollectionEntry } from 'astro:content';
import { localUrl } from './urls';

type PageData = CollectionEntry<'pages'>['data'];
export async function getPage<T extends PageData['template']>(id: T) {
  const entry = await getEntry('pages', id);
  if (!entry || entry.data.template !== id) throw new Error(`Missing or incorrect page content: src/content/pages/${id}.md`);
  return { ...entry, data: entry.data as Extract<PageData, { template: T }> };
}
export async function getSite() {
  const entry = await getEntry('site', 'main');
  if (!entry) throw new Error('Missing src/content/site/main.md');
  return entry.data;
}
export function byOrder(a: { id: string; data: { order: number } }, b: { id: string; data: { order: number } }) {
  return a.data.order - b.data.order || a.id.localeCompare(b.id, 'en');
}
/** Content uses /page/ paths; templates add the configured deployment prefix. */
export function contentHref(href: string): string {
  return href.startsWith('/') && !href.startsWith('//') ? localUrl(href) : href;
}
