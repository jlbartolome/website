import type { APIRoute } from 'astro';
import { localUrl } from '../lib/urls';

export const GET: APIRoute = ({ site }) => new Response(
  `User-agent: *\nAllow: /\nSitemap: ${new URL(localUrl('sitemap.xml'), site).href}\n`,
  { headers: { 'Content-Type': 'text/plain' } },
);
