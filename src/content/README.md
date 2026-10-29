# The website's editable content

This is where you change the words on the website. Open the `.md` files in your
editor, save your changes, and check the running preview. The existing page design
is applied automatically. The [editing guide](../../docs/CONTENT_EDITING.md)
explains the file format and gives examples.

| Folder or file | What you can change |
|---|---|
| `pages/` | Homepage wording, biography, page introductions, titles and section labels |
| `site/main.md` | Name, email, affiliation, menu links and academic profiles |
| `research/` | One file per research theme, including its selected publications |
| `publications/` | One file per paper, with authors, citation and DOI/arXiv links |
| `news/` | One file per homepage announcement; the paragraph below its settings is the summary |
| `courses/` | One file per EHU course, with the description below its settings |
| `workshops/` | One file per teaching workshop or school |
| `outreach/` | One file per coverage item, activity or talk |
| `opportunities/` | One file per Join us section |

To add an entry, copy another file in the same folder and give it a new lowercase
filename with hyphens between words. Keep it directly in that folder. Change its
`order` number to move it, add `draft: true` to hide it, or delete the file to
remove it. These options apply to entries such as papers and courses; keep the
required files in `pages/` and `site/`.

Keep dates in quotes. Before renaming, hiding or deleting a selected publication,
update the research files that name it in their `papers` lists.

This README is only a guide. It does not appear on the website.
