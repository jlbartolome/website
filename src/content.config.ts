import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const text = z.string().trim().min(1);
const href = text.refine((value) => /^(https?:\/\/|mailto:|\/[^/]|\/$|#)/.test(value), 'Use an https URL, mailto address, /local/path/, or #anchor.');
const link = z.strictObject({ label: text, href });
const ordered = { order: z.number().int().default(100), draft: z.boolean().default(false) };
const section = z.strictObject({ id: text.regex(/^[a-z0-9-]+$/), title: text });
const page = { title: text, description: text, lead: text.optional() };
const listPage = { ...page, sectionNavLabel: text, sections: z.array(section).min(1) };
const loader = (folder: string) => glob({ pattern: '*.md', base: `./src/content/${folder}` });

const site = defineCollection({ loader: loader('site'), schema: z.strictObject({
  name: text, email: z.email(), title: text, description: text,
  affiliation: z.array(text).length(2),
  institution: z.strictObject({ name: text, href: z.url(), logoAlt: text }),
  navigation: z.array(link).min(1), navigationLabel: text, skipLabel: text, profilesLabel: text,
  profiles: z.array(z.strictObject({ name: text, href: z.url(), icon: z.enum(['identity', 'institution', 'scholar']) })),
  publicationLabels: z.strictObject({ publisher: text, publisherAccessible: text, arxiv: text, arxivAccessible: text, preprint: text }),
}) });

const pages = defineCollection({ loader: loader('pages'), schema: ({ image }) => z.discriminatedUnion('template', [
  z.strictObject({ template: z.literal('home'), headingLines: z.array(text).min(1), intro: text, keepTogether: text.optional(), researchLink: link, newsTitle: text, newsLimit: z.number().int().positive(),
    illustration: z.strictObject({ label: text, controlsLabel: text, help: text, controls: z.strictObject({ left: text, up: text, reset: text, down: text, right: text }), resetStatus: text, fallbackStatus: text }),
  }),
  z.strictObject({ template: z.literal('bio'), ...page, portrait: image().optional(), portraitAlt: text, contact: z.strictObject({ title: text, office: text, address: z.array(text).min(1) }) }),
  z.strictObject({ template: z.literal('research'), ...page, sectionNavLabel: text, selectedPublicationsLabel: text, links: z.array(link) }),
  z.strictObject({ template: z.literal('publications'), ...page, sectionNavLabel: text, sections: z.array(section.extend({ status: z.enum(['preprint', 'published']) })).min(1), profile: z.enum(['identity', 'institution', 'scholar']) }),
  z.strictObject({ template: z.literal('teaching'), ...listPage }),
  z.strictObject({ template: z.literal('outreach'), ...listPage }),
  z.strictObject({ template: z.literal('join-us'), ...page, actionLabel: text }),
  z.strictObject({ template: z.literal('not-found'), title: text, intro: text, homeLabel: text }),
]) });

const news = defineCollection({ loader: loader('news'), schema: z.strictObject({
  title: text, date: z.coerce.date(), href, kind: z.enum(['news', 'award']).default('news'),
  draft: z.boolean().default(false), source: z.url(), sourceChecked: text,
}) });
const publications = defineCollection({ loader: loader('publications'), schema: z.strictObject({
  ...ordered, title: text, authors: z.array(text).min(1), year: z.number().int(),
  status: z.enum(['published', 'preprint']), citation: text.optional(), doi: z.url().optional(), arxiv: z.url().optional(), source: z.url(), sourceChecked: text,
}) });
const research = defineCollection({ loader: loader('research'), schema: z.strictObject({
  ...ordered, title: text, icon: href.optional(), iconAlt: text.optional(),
  papers: z.array(reference('publications')).default([]),
}).refine((item) => !item.icon || !!item.iconAlt, 'An illustration requires iconAlt.') });
const courses = defineCollection({ loader: loader('courses'), schema: z.strictObject({ ...ordered, title: text, links: z.array(link).default([]) }) });
const resource = z.strictObject({ ...ordered, title: text, detail: text, date: text.regex(/^\d{4}-\d{2}(?:-\d{2})?$/).optional(), dateLabel: text.optional(), links: z.array(link).default([]) });
const workshops = defineCollection({ loader: loader('workshops'), schema: resource.refine((item) => !!item.date === !!item.dateLabel, 'Set date and dateLabel together.') });
const outreach = defineCollection({ loader: loader('outreach'), schema: resource.extend({ section: text.regex(/^[a-z0-9-]+$/) }).refine((item) => !!item.date === !!item.dateLabel, 'Set date and dateLabel together.') });
const opportunities = defineCollection({ loader: loader('opportunities'), schema: z.strictObject({ ...ordered, title: text }) });

export const collections = { site, pages, news, publications, research, courses, workshops, outreach, opportunities };
