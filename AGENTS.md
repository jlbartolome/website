# Instructions for coding assistants

This file guides an assistant working on the project. For everyday content editing,
use README.md and docs/CONTENT_EDITING.md. Read those guides, START_HERE.md,
DESIGN_SPEC.md, design-tokens.json, docs/CONTENT_MIGRATION.md and
docs/PACKAGE_VALIDATION.md before editing.

The owner approved the B1 design on 28 October 2026. Continue the existing Astro
site and preserve its presentation during routine maintenance.

## Keep the approved design

- Use only Inter 400/500/600, served from public/fonts with its OFL license.
- Keep white #FFFFFF, main text #202723, secondary text #626B66, forest links
  #216247, EHU Uniberdea #5FD790, pale surface #EFF8F2 and separators #DFE6E1.
- Preserve the homepage arrangement, behavior at different screen sizes and the
  unmodified official EHU SVG.
- Use the current Blender PNG/GLB. Preserve the supplied source, atomic geometry,
  rounded surfaces, six arrows, two rings and transparent faces. Keep outer corner
  atoms/arrows hidden. Keep the PNG available if the model cannot load, rotation
  controlled by the user, keyboard/buttons, normal vertical touch scrolling and
  no automatic animation. Follow docs/HERO_ARTWORK.md; do not replace the geometry
  with generated imagery.

## Keep content separate from presentation

Astro templates control layout. Validated Markdown in src/content/ contains the
editable text and settings, including publications, page copy, identity and menu
links. Use Markdown bodies for paragraphs and YAML frontmatter for short fields.
Do not put editable text back into Astro or duplicate it in JSON.

Preserve the owner's current Markdown edits. The old public site and archives
explain where earlier content came from; they do not override later local changes.
Never invent papers, authors, profile IDs, positions, grants or dates. Keep
publication filenames stable and update research references before hiding or
deleting a selected paper. Record new fact-check dates in the relevant source
notes; docs/PUBLICATION_EVIDENCE.md records existing decisions and unresolved facts.

Use the existing static Astro/plain-CSS setup. Do not add a framework, CMS, backend,
analytics or software dependency without a concrete need. Install with npm ci and
use the Node version in .nvmrc. Never edit dist/, .astro/ or node_modules/ as source.

Use localUrl() from src/lib/urls.ts for public assets and internal links.
contentHref() and the Markdown processor pass local content paths through it.
Use BaseLayout for pages. src/site.config.ts lists the main page addresses;
About keeps /bio/ and /home/ remains another address for the homepage. Update
route checks and the sitemap list when adding pages. Entries in existing
collections can be added, reordered, hidden or removed without template edits.

## Check and explain changes

For implementation changes, run npm run repo:check, npm run check, npm run build,
npm run verify and npm run release:check. After changes to collections, templates
or Markdown processing, also run npm run test:content; it uses a temporary copy.
After changes to links, images or templates, test a project-subpath build and
then restore the root build. Do not remove checks or hide warnings to claim success.

Use docs/QA_CHECKLIST.md for browser, mobile and keyboard review. Report checks
that could not be performed. Generated HTML and still-image inspection do not
establish that browser interaction works.

Write maintenance guides in plain language, explaining necessary technical terms
when they first appear. Keep commands and paths exact and explain what each step
does. Describe the current project rather than appending a history of abandoned
ideas. Keep instructions synchronized with the code.

## GitHub and publishing

Read docs/REPOSITORY.md before staging or publishing. Exclude installed tools,
generated output, credentials, local agent/hosting settings and ignored archives
from commits. Preserve optional reference/ and docs/source-snapshot/ archives
unchanged when present; a fresh copy from Git must work without them. Include both
current Blender sources and the maintained asset/publication source notes.

The default scope is local work and preparation. .github/workflows/check.yml runs
checks only. operations/github-pages.yml is a prepared, inactive publishing
workflow. Publish, create an external repository or change DNS only when the owner
asks. Honor a later explicit launch instruction without repeatedly requesting
the same authorization.
