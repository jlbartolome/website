/** All public asset and internal page URLs must work under a project subpath. */
export function localUrl(path = '', base = import.meta.env.BASE_URL): string {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}
