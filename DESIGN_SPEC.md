# The website design — B1

This guide records the design approved by Dr. Jon Lafuente Bartolomé on
**28 October 2026**. Use it when changing a layout or adding a feature so the
website continues to look consistent. For text and image updates, start with
[the content editing guide](docs/CONTENT_EDITING.md).

The exact values are recorded here, in `design-tokens.json` and in the website
code. Editable wording belongs in `src/content/`. The optional old mockups are
historical examples; the current site and this guide describe the approved design.
Later explicit instructions from the owner can change these decisions.

## Direction and palette

A predominantly white and charcoal academic website with restrained EHU identity.
The large scientific figure on the homepage is the main colored element. Forest
green marks links and shows which control is selected or being used. Official
EHU green is reserved for small intentional accents.

| Use | Color code | Name in the stylesheet |
|---|---|---|
| Background | `#FFFFFF` | `--bg` |
| Main text | `#202723` | `--ink` |
| Secondary text | `#626B66` | `--muted` |
| Links and keyboard selection | `#216247` | `--accent` |
| Official EHU Uniberdea | `#5FD790` | `--ehu` |
| Background behind selected text | `#EFF8F2` | `--surface` |
| Decorative dividers | `#DFE6E1` | `--line` |

Only Uniberdea is an official EHU color; the others were chosen to complement it.
The contrast ratios against white are 15.26:1 for main text, 5.51:1 for secondary
text and 7.23:1 for forest green. Uniberdea's ratio is only 1.81:1, so keep it for
small accents rather than small text or the only visible outline of a control.
Underline links in paragraphs. Keep the official EHU SVG unchanged, including
its white background and the clear space around the logo.

## Typography

Use Inter throughout. The font files are included in the project with their Open
Font License (OFL), so visitors do not load them from another service. Use weight
400 for normal text, 400–500 for labels and 600 for headings and the name. Preserve
accents in names. The website formats `ab initio` in italics automatically;
page information for search engines and spoken control labels stay plain text.

The table below keeps the exact settings for future design work. `px` means pixels,
`vw` scales with the browser width, `ch` measures roughly in character widths and
`em` scales with the font size. `clamp()` lets a size grow between a minimum and maximum.

| Element | Desktop | Tablet/mobile behavior |
|---|---|---|
| Name | 27px, weight 600 | 23px; 21px at the narrowest breakpoint |
| Main navigation | 14px | Wraps, retaining 14px and 44px mobile targets |
| Hero heading | `clamp(50px,5.25vw,80px)`, line-height 1.025, tracking −0.05em | 5.5vw at 761–1100px; `clamp(43px,10.5vw,70px)` below that |
| Hero supporting text | Scales from 18 to 24px, muted, line-height 1.55 | 18px, line-height 1.5 on mobile |
| Inner page title | `clamp(42px,4.5vw,56px)` | Existing responsive CSS applies |
| Body prose | 18px, line-height 1.7, maximum 74ch | Same paragraph styling |
| Research theme heading | 32px | Same shared research heading treatment |
| Editorial section heading | 28px | 26px below 760px |
| Resource title | 20px | 19px below 760px |

`src/styles/global.css` contains the complete rules, including the screen widths
where the layout changes.

## Shared layout and controls

Maximum page width 1536px, centered. Side padding is 52px on desktop, 36px below
1100px, 24px below 760px and 20px below 380px. Use whitespace and thin separators.

The header places the name above two quiet affiliation lines, with navigation
beside it on desktop and below it at 1100px and narrower. Affiliation uses 12px
secondary text with 1.6 line-height and an 8px top gap. Its wording and navigation
order are maintained in `src/content/site/main.md`. The current six menu links
are About, Research, Publications, Teaching, Outreach, Join us. About retains `/bio/`.
The footer contains the official logo and email. Full contact details are in About.

The main call-to-action links use a white background, forest-green underlined text,
a 1px neutral border, corners rounded by 4px and 11px × 17px inside spacing.
Pointing at or selecting a link strengthens its border and underline. Keyboard
selection is shown with a 2px forest outline, 5px away from the control. Menu links
show a thin underline when pointed at. Selected text uses charcoal on pale green.

## Homepage

The large opening area is called the hero. Text occupies about 51% of its desktop
width, beside the complete illustration on a transparent background. Minimum
height is approximately 562px, or 610px on wide screens.
Mobile stacks text above the figure. Preserve the three heading lines specified by
`headingLines` in `src/content/pages/home.md`, including the final standalone line.

The supporting sentence uses its existing font size and stays on one line above
1100px. Below that, natural wrapping applies; the optional `keepTogether` suffix
stays together above 760px only when it exactly matches the end of `intro`.
Keep the wording short enough for the approved desktop text column.

Latest updates use a one-third heading column and two-thirds list on desktop,
stacked on mobile. News titles are 20px/600; supporting text is 16px desktop and
15px mobile. The news count and heading are set in Markdown.

## Interactive artwork

Use `public/assets/quantum-orbitals-ehu.png` (1448×1086 RGBA) and its local GLB
export from the owner-supplied Blender scene. The PNG is the still image; the GLB
is the model visitors rotate. Keep the original atomic positions, the
rounded orbital display treatment, six thick arrows, twelve cage edges, eight
translucent faces and two rotation rings. Outer corner atoms/arrows remain hidden.

The central site uses `#5FD790`; both rings and orbital surfaces share `#AED8BF`.
Faces use pearl-green `#D5E6DE` at 0.34 opacity. The satin surfaces and glass-like
highlights are stored in the model's colors; they do not calculate physical refraction.
Keep the background transparent and the complete figure within a 4:3 display area.
Use `object-fit:contain` in CSS so the figure is not cropped. Do not add a color
filter or tinted background. Reproduction details and all material
parameters are in [HERO_ARTWORK.md](docs/HERO_ARTWORK.md) and the render script.

Show the PNG first, and keep it available if the 3D model cannot load. Load the
viewer as the figure approaches the visible part of the page. Rotate only when
the visitor drags, swipes sideways, uses arrow keys or presses a button. Up/down
touch gestures still scroll the page, and pinch zoom still works. Home/Reset
returns to the original image and orientation. All five controls have 44px touch
areas. There is no automatic animation. Spoken instructions remain available to
screen readers, without a visible drag hint.

## Inner pages

About, Teaching, Outreach and Join us share the `ContentSection` layout: a heading
in the left third and content in the right two thirds, with a 40px gap, 36px/44px
vertical spacing and a thin separator. At 760px, headings move above the content,
with 28px/32px spacing. The shared `ResourceList` uses 13px secondary text for dates
and details, and 14px forest-green links. Show only the date detail the source provides;
for example, do not invent a day when only the month is known.
Teaching and Outreach have section links below their introduction.

About places three SVG profile links directly under its title. These are original
neutral line symbols with visible labels, not modified official logos. Its optional
portrait sits beside the biography at up to 280px, moving above the prose on mobile.
Show the full image without cropping. The portrait field and contact address belong to
`src/content/pages/bio.md`; omitting the image field hides it. Missing referenced
images fail validation. The footer and Join us action use the shared email field.

Research themes share the same heading/body sizing. Their SVG drawings use a
240×160 drawing area (`viewBox`) and display at up to 280px, limited by the heading
column. Mobile places them beside headings at `clamp(112px,30vw,160px)`. Use gray/forest lines,
pale fills and small EHU-green accents. The Theory & Computing icon has FM/DW/LP
schematics on the left and an abstract terminal on the right. Coupling vertices
share EHU fill and forest outlines; the second-order DW vertex retains a hatch.
The terminal's lines stay inside the drawn screen and contain no commands or numbers.

Research selections use one faint `#FAFBFA` panel per theme, 28px below the prose
(24px mobile), with a 1px divider-colored border, 4px radius and 20px × 24px padding
(16px mobile). Panel label: 12px/500 uppercase. Paper titles: 16px/500. Authors,
citations and links: 13px. The full bibliography uses its larger existing typography,
groups papers by status and year, and has no descriptive subtitle.

## When adding something new

Keep text in Markdown, layout in Astro and appearance rules in CSS. Images in the
text should fit the text column. Scientific figures can use colors that convey
their data; they do not have to use only the website's greens. New layouts or
interactive features need code changes and a visual review. Avoid introducing extra
fonts, colored page backgrounds, heavy cards/shadows, automatic animation, analytics,
external font services or a new application framework for routine content edits.
