# Content sources and decisions

This page records where the website's content came from and which details still
need checking. The original public site was reviewed on **26 October 2026**.
Its six pages beyond the homepage and all 17 listed publications were brought
into this project.

Your current text is in `src/content/`, including the changes you have made since
that review. Use these source notes to understand a factual decision, not to
replace your newer wording with text from the old site.

## Where each page is now

| Original page | Current page address | Editable content |
|---|---|---|
| [Homepage](https://www.jonlafuentebartolome.xyz/) | `/` | `pages/home.md`, `news/` |
| [Legacy home](https://www.jonlafuentebartolome.xyz/home) | `/home/` | Shows the same homepage; `/` is the preferred address |
| [Research](https://www.jonlafuentebartolome.xyz/research) | `/research/` | `pages/research.md`, `research/` |
| [Publications](https://www.jonlafuentebartolome.xyz/publications) | `/publications/` | `pages/publications.md`, `publications/` |
| [Biography](https://www.jonlafuentebartolome.xyz/bio) | `/bio/` | `pages/bio.md`; navigation label About |
| [Teaching](https://www.jonlafuentebartolome.xyz/teaching) | `/teaching/` | `pages/teaching.md`, `courses/`, `workshops/` |
| [Outreach](https://www.jonlafuentebartolome.xyz/outreach) | `/outreach/` | `pages/outreach.md`, `outreach/` |
| [Join us](https://www.jonlafuentebartolome.xyz/join-us) | `/join-us/` | `pages/join-us.md`, `opportunities/` |

Content paths above are relative to `src/content/`. Identity, email, affiliation,
profiles and menu links are in `site/main.md`. The sitemap, which lists pages for
search engines, includes `/` and the six main page addresses. It excludes the
duplicate `/home/` address and the “page not found” page.

The reviewed site did not link to a separate team, openings or CV/download page.
Join us invites project and fellowship enquiries without claiming that a funded
position is available.
The [doctoral thesis](https://addi.ehu.es/handle/10810/50519), recordings and teaching
resources retain their original external destinations. No local CV/PDF was invented.

Raw HTML/text inventories may remain locally in the Git-ignored
`docs/source-snapshot/`; they are not required to build or maintain the site.
The links, dates and notes below keep the source information needed to understand
the content decisions.

## Factual source decisions

These sources were checked on **26 October 2026**. Editing this guide does not
recheck them; record a new check date whenever you verify a fact again.

- Biography dates, positions, thesis supervision and the award followed the owner's
  public Bio page. The full Basque postal address is owner-supplied. “Department of
  Physics & EHU Quantum Center” and the English institution name with `(EHU)` reflect
  the owner's explicit local revisions.
- Profile IDs were recovered from actual public-site links:
  [ORCID](https://orcid.org/0000-0003-4677-3626),
  [EHU research profile](https://ekoizpen-zientifikoa.ehu.eus/investigadores/1014245/detalle),
  [Google Scholar](https://scholar.google.es/citations?user=_J8oG58AAAAJ&hl=es).
  Scholar blocked automated access; link recovery is not a live availability check.
- The [DOE highlight](https://www.energy.gov/science/bes/articles/beyond-simple-electrons-twist-topological-quasiparticles-matter)
  was dated 22 October 2026 on DOE. It is included in news and outreach. Announcement
  dates are kept distinct from paper acceptance dates.
- Two source press dates were corrected against the linked articles:
  [Phys.org, 14 June 2024](https://phys.org/news/2024-06-exploring-polaron-formation-halide-perovskites.html),
  [TACC, 25 June 2024](https://tacc.utexas.edu/news/latest-news/2024/06/25/surprising-vortex-behind-new-solar-cell-and-lighting-materials/).
- Official EHU course guides were retrieved successfully for 2026/27:
  [Solid State Physics II, 26649](https://www.ehu.eus/en/web/graduak/fisikako-gradua/kreditu-eta-irakasgaiak?anyo-academico=20260&asignatura=26649&ciclo=X&curso=4&redirect=consultaAsignatura)
  and [General Physics, 26637](https://www.ehu.eus/en/web/graduak/fisikako-gradua/kreditu-eta-irakasgaiak?anyo-academico=20260&asignatura=26637&ciclo=X&curso=1&redirect=consultaAsignatura).
  Review the academic-year parameter when updating the courses.

## Publication details that still need attention

[PUBLICATION_EVIDENCE.md](PUBLICATION_EVIDENCE.md) records the publisher/arXiv sources and the
26 October 2026 checks for all 17 papers. At that review, the local list contained 15 journal
articles, including one in press, and two preprints with explicit acceptance notes.
Author order, citations, DOI/arXiv links and source-check fields were preserved when
moving each record to its own Markdown file. Research selections reuse those records.

- INTW's journal year is **2026**. Its old arXiv target belonged to the polarons
  review and is omitted. A verified INTW preprint URL remains unknown; do not guess.
- The polarons review and Watching Polarons retain acceptance notes; recheck their
  publisher records for final journal citations before launch.
- Extreme-Band-Gap is recorded as a 2026 journal article in press using the
  owner-supplied Nature DOI. Its final volume/article number was not available in
  the retrieved record; do not infer it.

## Current images and scientific schematics

The portrait and original Blender scene were supplied by the owner. Their current
files, licenses and reproducible workflow are documented in
[ASSET_LICENSES.md](../ASSET_LICENSES.md) and [HERO_ARTWORK.md](HERO_ARTWORK.md).
The homepage shows a Blender PNG image first and loads a GLB model for rotation.
Visitors control the movement; the atomic positions from the original model are unchanged.

Research uses the owner's approved conceptual SVG icons. They do not claim to
reproduce calculated figures or a specific material. Three old Google-hosted research
figures could not be downloaded because access was refused (HTTP 403). They are
not part of the approved design, so recovering them is not a remaining task.

The Theory & Computing icon reads left to right: FM, DW and LP/polaron diagrams,
then an abstract terminal. The topologies were checked on **28 October 2026** against
Figure 14(a), (d), (c) of the owner's
[Polarons from first principles review](https://arxiv.org/html/2512.06176v1#S5.F14).
LP is interpreted as the Landau–Pekar/polaron contribution. The drawings are original
schematics, with consistent coupling vertices; they do not reproduce the source figure.
