import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { contentMarkdown } from './scripts/markdown.mjs';

// SITE_URL is an origin, without the repository path. BASE_PATH owns that path.
const site = process.env.SITE_URL || 'https://www.jonlafuentebartolome.xyz';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  markdown: { processor: satteri({ features: { smartPunctuation: false }, hastPlugins: [contentMarkdown(base)] }) },
  build: { format: 'directory' },
});
