# Checks before publishing or changing the design

Last full review: **28 October 2026**. A tick means there is evidence that the
check passed; an empty box means it still needs to be done. The design has been
approved, but a full browser and accessibility review is a separate task.
See [what has been tested](PACKAGE_VALIDATION.md) for details.

You can work through this list as you prepare to launch. Keep the remaining boxes
open until you have actually checked them, and note the date when you complete a review.

## Project files and automatic checks

- [x] The recorded Node version and `npm ci` install the required tools successfully.
- [x] The files intended for Git, documentation links and workflow settings pass checks.
- [x] Content fields, references and Astro code pass checks.
- [x] Sample content edits, additions and deletions work in a temporary test copy.
- [x] The site builds and passes checks at both a domain's root and a GitHub project folder.
- [x] The seven main pages, the extra `/home/` address and the “page not found” page are generated.
- [x] Markdown links and image addresses work with both hosting address formats.
- [x] Research selections refer to the correct publication files; author order and DOI/arXiv links are preserved.
- [x] The cleanup preserves the current text, active styling, portrait, icons, official logo and homepage figure.
- [x] Blender sources, render/export scripts and license notices are included.
- [x] Installed tools, generated output, local settings, backups and optional archives stay out of Git.
- [x] The active GitHub workflow checks only; the publishing template remains inactive.
- [ ] After upload, confirm that **Check website** succeeds on GitHub itself.

## Look at the pages and try the controls

- [ ] Open every page on a desktop, a tablet and a phone. Also check narrow widths
  of 390px and 320px. Look for clipped text, crowded menus, long author lists and
  content that forces the page to scroll sideways.
- [ ] Confirm that Inter loads at weights 400, 500 and 600, and that the pages match
  [the approved design](../DESIGN_SPEC.md).
- [ ] Check that the whole homepage figure is visible on its transparent background,
  and that the official logo retains the space around it.
- [ ] Rotate the figure by dragging, with arrow keys and with each of the five
  buttons. Check that Home and Reset view return it to the initial view.
- [ ] On a phone, check that sideways gestures rotate the figure while up/down
  gestures scroll the page. Check that pinch zoom still works.
- [ ] Check that the still image remains visible with JavaScript disabled, with
  WebGL 3D support unavailable, and when the model cannot download.
- [ ] Use Tab to move through the page. Check the skip link, sensible control order,
  visible selection outlines and useful names announced by a screen reader.
- [ ] Check readability at 200% zoom and with the device's reduced-motion setting enabled.
- [ ] Review image descriptions and captions, then try contact, email and academic profile links.
- [ ] Repeat the relevant checks at a GitHub project address as well as at the domain root.

Browser access was unavailable in the automated session. Inspecting generated files
or still images does not complete these checks, so the boxes above remain open.

## Review the information

- [ ] Read the current text, affiliation, postal address and news.
- [ ] Recheck DOI, arXiv and profile links. Check whether final journal citations
  are available for the two accepted preprints and the article in press.
- [x] INTW uses the verified year 2026. The incorrect arXiv link to the review has
  been removed; a genuine optional INTW preprint link remains unknown.
- [ ] Check that the two official EHU course links use the intended academic year.
- [ ] Check that new figures have a recorded source/permission, useful descriptions
  for visitors who cannot see them, and any required visible credit.

The research icons are approved conceptual drawings. Recovering unavailable images
from the old website is not required for this version.

## Check the published site and domain

- [ ] Open the temporary GitHub Pages address on a computer and phone. Open inner
  pages directly and refresh them.
- [ ] Try page addresses with and without the final slash, `/home/`, and an address
  that does not exist. Confirm that the expected page or missing-page message appears.
- [ ] Save the old website DNS records and keep the old site available before moving the domain.
- [ ] Run a new deployment after setting the custom domain in GitHub Pages.
- [ ] Check both `www` and the domain without it, HTTPS, the preferred page addresses
  used by search engines, the sitemap, images and menu links.
- [ ] Confirm that email and unrelated DNS records were preserved.

Use [the publishing guide](../operations/DEPLOYMENT.md) for the steps. Uploading
source files to GitHub alone does not complete the hosting or domain checks.
