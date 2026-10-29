# Change the website's text and images

Most updates start in `src/content/`. Its `.md` files are ordinary text files
written in **Markdown**, a simple way to add paragraphs, headings, links and
emphasis. The website places that text into the existing design for you.

You can edit these files in your editor without opening the `.astro` page files.
Start the local preview with `npm run dev`, leave it running, and save a content
file to see your change. Nothing is uploaded until you commit and push it; public
updates also require the publishing workflow to be active.

## Find the right file

| What you want to change | File or folder |
|---|---|
| Homepage heading, supporting sentence, button, news count | `src/content/pages/home.md` |
| Name, email, affiliation, menu links, academic profiles | `src/content/site/main.md` |
| Biography, portrait, office and postal address | `src/content/pages/bio.md` |
| Page titles, introductory text, section labels | `src/content/pages/` |
| Research text, icons and selected papers | `src/content/research/` — one file per theme |
| Publications | `src/content/publications/` — one file per paper |
| Homepage news | `src/content/news/` — one file per announcement |
| EHU course descriptions and official links | `src/content/courses/` |
| Teaching workshops and schools | `src/content/workshops/` |
| Coverage, outreach activities and research talks | `src/content/outreach/` |
| Join us sections | `src/content/opportunities/` |

The website calls each group of similar files a **collection**. For repeated items
such as papers or courses, adding a file adds an entry to the existing page;
it does not create a new page address.

## Example: change the homepage sentence

Open `src/content/pages/home.md` and find the line starting with `intro:`.
Replace only the text after the colon, for example:

```yaml
intro: From first principles to emergent phenomena in materials
```

Save the file and look at the homepage in your running preview. You do not need
to run a separate build for each edit.

The optional `keepTogether` line groups the last few words so they stay together
on medium and larger screens. Its text must match the exact end of `intro` to
have an effect. Change it to match your new wording, or remove that line if you
do not need it. It applies above 760px; the whole sentence already stays on one
line above 1100px, so check that a longer sentence still fits.

The main heading is controlled separately by `headingLines`. Each list item is
one heading line. Keep the existing three-line arrangement unless you intend to
change the design.

## Understand the two parts of a Markdown file

Most files have settings at the top and paragraphs underneath. The settings sit
between two lines containing `---`. This part is called **frontmatter**, and its
format is called **YAML**. It holds things such as the title, date and links.
The text after the second `---` is the **body** of the file.

Here is an example research entry:

```markdown
---
title: Theory & Computing
order: 10
icon: /assets/research/theory-computing.svg
iconAlt: A short description of the illustration.
papers:
  - polarons-first-principles
  - epw
---

Write the first paragraph here.

Leave a blank line before the next paragraph. Use **bold**, *italics*,
[linked words](https://example.org), and lists as needed.
```

`title` is the section heading. `order` sets its position. `icon` selects the
illustration, while `iconAlt` describes it for people who cannot see it. The
`papers` list selects publication files by name, without `.md`.

This is an example to explain the format. Keep your actual text when editing an
existing file. If you copy an example, do not copy the surrounding triple-backtick
lines that mark the code box in this guide.

A few formatting details matter:

- Keep the field names, colons and indentation. Use spaces, not tabs.
- Put dates in quotes, such as `date: '2026-10-28'`. Also quote a value containing
  a colon followed by a space, such as `title: 'Lecture: Polarons'`.
- For a long field, use `>-` and indent the following lines by two spaces. For
  example, `lead: >-` lets you write an introduction over several lines in the
  file; the website joins them into one paragraph.
- Paragraphs go in the body for biographies, research themes, courses, Join us
  sections and news summaries. Publications, workshops and outreach entries may
  also have an optional paragraph underneath their settings.
- Page settings in `pages/`, except `bio.md`, use the named fields only. Adding
  text below their settings will not make a new paragraph appear on the page.
- The page already supplies its main heading. For a subheading in body text,
  start with `###`, rather than adding a second `#` heading.

The website italicizes `ab initio` automatically in body text, publication details,
news titles and list entries. Text already in italics is handled too.

## Add or rearrange an entry

To add a paper, course, research theme or other item:

1. Copy an existing `.md` file from the same collection folder.
2. Give the copy a unique lowercase filename, using hyphens between words, such
   as `new-research-theme.md`.
3. Replace its title, settings and paragraphs with your own information.
4. Save it and check the relevant page in the preview.

Keep the files directly inside their collection folder; do not create subfolders.
The filename without `.md` is the entry's **ID**, which other files can use to
refer to it. A research theme automatically gets its own section and a link at
the top of Research. A new opportunity becomes a section on Join us.

For most lists, a smaller `order` number comes first: `10` before `20`. Leaving
gaps makes it easy to insert `15` later. If you omit `order`, the value is 100.
Entries with the same number are sorted by filename.

Publications are grouped by publication status, then newest year; `order` sorts
papers within a year. News is sorted by date, newest first. The homepage's
`newsLimit` setting controls how many news entries are shown.

## Hide or remove an entry

To hide a file's entry without deleting it, add `draft: true` inside its top
settings. Remove that line, or change it to `draft: false`, to show it again.
To remove an entry permanently, delete its file.

This applies to collection entries such as papers and courses. Keep the fixed
configuration files in `pages/` and `site/`; they are required to create the pages.

Before hiding, deleting or renaming a selected publication, update any research
file that names it in `papers`. Otherwise the check will report that a research
theme refers to a missing or hidden paper. Use `papers: []` if a theme should have
no selected-publications box. To remove a theme's icon, remove both `icon` and `iconAlt`.

## Add a publication or update its status

Copy a file in `src/content/publications/`. Keep the filename stable after adding
it: research selections and direct links to the paper use that name.

```yaml
---
title: 'The exact verified paper title'
authors:
  - First Author
  - Second Author
year: 2026
status: published
order: 10
citation: 'Verified journal, volume, pages or article number (2026)'
doi: https://doi.org/REPLACE-WITH-VERIFIED-DOI
arxiv: https://arxiv.org/abs/REPLACE-WITH-VERIFIED-ID
source: https://example.org/publisher-record
sourceChecked: '2026-10-28'
---
```

Replace every example value before using this entry. Keep the authors in the
verified order, with their names spelled as in the source. You may omit `citation`,
`doi` or `arxiv` if that information is unavailable. `source` records where you
checked the information, and `sourceChecked` records when; neither is displayed
to visitors.

Use `status: preprint` until publication is confirmed. You can mention acceptance
in `citation` while keeping that status. Once published, update the same file's
status, year, citation and DOI, keeping its arXiv link. Do not add a duplicate
entry or guess a volume or article number. See
[the publication source notes](PUBLICATION_EVIDENCE.md) for the existing decisions,
including INTW's year and missing preprint link.

## News, teaching and outreach

For news, write the short summary below the settings. Keep the title, date, link
and source details at the top. `kind: award` uses the compact award styling;
`kind: news` is the default. Delete the summary paragraph if you only want a title
and link. A news entry appears in the homepage list, not on a separate article page.

Courses have a title, `order`, a list of official links and a description in the
body. Workshops and outreach entries use `title`, `detail`, `links` and optional
`date` / `dateLabel` fields. If you provide a date, include both date fields.
For a month without a known day, use `date: '2026-06'` and `dateLabel: June 2026`.

Each outreach entry uses `section` to choose `coverage`, `activities` or `talks`.
To create another category, first add its ID and title to `sections` in
`src/content/pages/outreach.md`, then use that ID in the entries. The website
adds the heading and the link at the top. Move or delete a category's entries
before removing the category itself.

Teaching's `courses` and `schools` IDs choose its two existing layouts. You can
change their displayed titles, but keep those IDs.

## Add links

For links within this website, start the address with `/`, for example
`[Join us](/join-us/)` or `[Contact](/bio/#contact)`. The `#contact` part jumps to
the Contact section on About. Do not include `.astro`, `.md` or the GitHub
repository folder in a visitor-facing link. The build adds any required hosting
folder automatically. For other websites, use the full `https://` address.

## Replace your portrait or add another image

Your portrait is selected in `src/content/pages/bio.md`:

```yaml
portrait: ../../assets/images/portrait.jpeg
portraitAlt: Jon Lafuente Bartolomé
```

Replace the file at that path, or put a new image in `src/assets/images/` and
update the filename in `portrait`. Astro creates smaller display copies for the
website while keeping your original file. To hide the portrait, remove the
`portrait` line. If you delete the image but leave the line pointing to it, the
build will report a missing image.

To add a figure inside a paragraph, place it in `src/assets/images/` and write:

```markdown
![Describe the figure](../../assets/images/my-figure.png)

*Caption and credit for the figure.*
```

Replace `my-figure.png` with the filename you added. The `../../` part means
“go up two folders”; from the current content folders, this reaches `src/`.
The words in square brackets are the image's alternative text, read by screen
readers and used when an image cannot be displayed.

Put files you want visitors to download unchanged in `public/assets/`. For example,
`[Download](/assets/my-document.pdf)` links to a PDF there, and
`![Description](/assets/my-figure.svg)` displays an SVG there. Record the source
and permission for new images in [ASSET_LICENSES.md](../ASSET_LICENSES.md).
The [image guide](../src/assets/images/README.md) has more detail. The homepage's
Blender figure and official logo are part of the approved design; changing those
needs the separate artwork/design instructions.

## Check an edit

From the project folder, start the editing preview with:

```bash
npm run dev
```

Leave it running while you edit; save files to refresh the preview. Press **Ctrl+C**
to stop it. Before uploading changes, run these one at a time:

```bash
npm run check
npm run build
npm run verify
npm run release:check
```

If a check fails, read the named file and field in the error, correct it and rerun
the command. Common causes are indentation, a repeated field name, a missing image,
an unknown outreach category or a selected paper that has been hidden or deleted.
The checks do not verify scientific claims or whether external websites are reachable.

`npm run test:content` is an additional check for changes to the templates or
content-handling code. It tries sample additions, edits and deletions in a temporary
copy without inserting them into your working content.

The `.astro` files in `src/pages/` and `src/components/` control layout; CSS in
`src/styles/global.css` controls appearance. Entirely new pages or changes to the
interactive figure require code changes. Do not edit `dist/`: it is replaced each
time you build. Follow [the GitHub guide](REPOSITORY.md) to save and upload your edits.

For technical background, see Astro's official
[content collections](https://docs.astro.build/en/guides/content-collections/) and
[Markdown](https://docs.astro.build/en/guides/markdown-content/) documentation.
