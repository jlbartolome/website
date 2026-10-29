# How the project is organized

For everyday editing, start with [README.md](README.md) and the
[content editing guide](docs/CONTENT_EDITING.md). This page explains where the
other files belong, so you can find your way around the project.

The design was approved on 28 October 2026. Text and images can be updated while
keeping that design. The files in `src/content/` contain your current wording;
the old public website is only a source record and should not replace your later edits.

## The folders you will use most

| Folder | What it contains |
|---|---|
| `src/content/` | Text for each page, contact details, menu links, publications, news, courses and other entries |
| `src/assets/images/` | Your portrait and any new photographs or figures you add to the text |
| `public/assets/` | The homepage figure, research icons, official logo and any downloads served unchanged |
| `docs/` | Editing instructions, checks and notes about where the content came from |
| `operations/` | Instructions and a prepared workflow for publishing the site |

To add an item, copy a Markdown file in the relevant content folder. Use its
`order` number to change its position, `draft: true` to hide it, or delete the file
to remove it. Selected papers in Research refer to filenames in the Publications
folder. The editing guide gives examples and explains how to keep those links working.

Adding another publication or course uses the existing layout. Adding a completely
new page or a new kind of layout also requires changes to the website code.

## Files that control how the website works

You normally only need these when changing the design or adding a feature.

| Location | What it does |
|---|---|
| `src/pages/` | Creates each page address and arranges its content; also creates the search-engine files |
| `src/components/`, `src/layouts/` | Shared pieces, such as the header, footer and publication entries |
| `src/styles/global.css` | Colors, sizes, spacing and adjustments for different screen sizes |
| `src/content.config.ts` | Defines which fields each kind of Markdown file accepts |
| `src/lib/` | Reads content and makes links work at different website addresses |
| `src/site.config.ts` | Lists the main pages included in the sitemap, the page list used by search engines |
| `src/scripts/hero-model.ts` | Makes the homepage figure rotate when you interact with it |
| `artwork/hero/`, `scripts/*hero*` | Blender originals and instructions for producing the website figure |
| `scripts/` | Automated content, build, repository and model checks |
| `public/fonts/`, `public/licenses/` | Local font files and license notices; keep these with the project |
| `.github/workflows/check.yml` | Tells GitHub how to check changes; does not publish the website |
| `operations/github-pages.yml` | Prepared publishing instructions for GitHub Actions; inactive in this folder |

Astro creates `dist/` and `.astro/`; `npm ci` installs tools into `node_modules/`.
Do not edit these folders to change the website. They are recreated when needed
and are excluded from Git.

You may also have `reference/` and `docs/source-snapshot/` locally. These hold old
design examples and copies of the original website. They stay out of Git and are
not needed to build the current site. Keep a separate backup if you want to retain them.

## Check links at a GitHub project address

Your own domain puts the homepage at `/`. A GitHub project address may put it
under a folder, such as `/jon-research-site/`. The site is written to support both.
The helper `localUrl()` adds that folder where needed, including to links written
in Markdown. You do not add it manually to each content link.

After changing page addresses, images, templates or the way content is read, test
this second form. From the project folder, run the following commands one at a time:

```bash
SITE_URL=https://example.github.io BASE_PATH=/jon-research-site npm run build
npm run verify
npm run release:check
SITE_URL=https://example.github.io BASE_PATH=/jon-research-site npm run preview
```

These are local tests: they do not upload anything to `example.github.io`.
Open the local preview at `/jon-research-site/`. In these commands, `SITE_URL`
is the website address without a folder, and `BASE_PATH` is the folder part.
Each setting applies only to the command on the same line.

Stop the preview with **Ctrl+C**, then restore the usual build:

```bash
npm run build
```

The default address settings are in `astro.config.mjs`.

## Uploading and publishing

Follow [the GitHub guide](docs/REPOSITORY.md) to save the project on GitHub.
Follow [the publishing guide](operations/DEPLOYMENT.md) when you want it to become
a public website. Use [the checklist](docs/QA_CHECKLIST.md) to record the browser
and hosting checks before connecting your domain.
