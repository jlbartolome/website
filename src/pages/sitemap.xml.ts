import type { APIRoute } from 'astro';
import { localUrl } from '../lib/urls';
import { canonicalRoutes } from '../site.config';

export const GET: APIRoute = ({ site: origin }) => {
  const urls = canonicalRoutes.map((path) => `<url><loc>${new URL(localUrl(path), origin).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
