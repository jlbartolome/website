# What has been checked

The last full technical review was completed on **28 October 2026**, after the
content was moved into Markdown and the project was prepared for GitHub. This
page explains what those results mean and what still needs to be checked by hand.
A successful build is useful evidence, but does not replace opening the website
in a browser or checking its scientific content.

## Automatic checks

The project uses Node 24.22.1 and Astro 7.4.2. `package-lock.json` records the exact
software versions used. At the review, there were 55 Markdown content files:
17 publications, three research themes, two courses, four workshops, thirteen
outreach entries, three Join us sections, four news entries, eight page settings
files and one shared site settings file. These counts will change as you edit.

| Command | What it checks or produces | Result at the review |
|---|---|---|
| `npm ci` | Installs the tools from the recorded versions | Passed |
| `npm run repo:check` | Checks which files would go into Git, documentation links, workflow files and software settings | Passed |
| `npm run check` | Checks the content fields, references between entries and Astro code | Passed |
| `npm run test:content` | Tries editing, adding, ordering, hiding and deleting entries in a temporary copy | Passed |
| `npm run build` | Creates the finished static website | Passed |
| `npm run verify` | Checks local links, page information, images and the interactive model | Passed |
| `npm run release:check` | Also checks the expected pages, menu links, sitemap and publication list | Passed |

The site was built both for a domain's main address and for an extra folder like
`/jon-research-site/`, as used by GitHub project sites. Both produced nine HTML
files and passed checks on 136 local references. Seven main pages appear in the
sitemap, the list used by search engines. `/home/` shows the homepage but identifies
`/` as its preferred address; the “page not found” page is not listed. The normal
root build was restored afterward.

The content tests work in a temporary copy with their own sample text and image.
They do not depend on a particular homepage sentence or course title. They check
formatting, optional notes, selected papers, ordering, hidden entries and deletions.
They also test images and links at both address formats. Mistyped field values,
repeated YAML field names and references to missing papers produce clear errors.

The model check reads the actual GLB: 66,134 triangles, 1,075,880 bytes, eight
translucent faces, the expected visible parts and hidden outer groups. It checks
opacity and that no external files are needed. It cannot check the browser's
3D rendering or the feel of dragging the model.

## Checks that the cleanup preserved the site

The GitHub preparation kept the current Markdown, including your edited homepage
sentence, as well as the page templates and artwork. Only two unused
`.editorial-list` rules were removed from the stylesheet.

All nine generated pages matched the earlier build apart from the automatically
changed stylesheet filename. The published images, SVGs, fonts and model matched
byte for byte. A clean copy containing only the files intended for GitHub also
produced exactly the same finished website.

That clean copy contained 136 files, about 56.6 MiB, including both Blender
sources, scripts and license notices. It built successfully without the optional
historical archives or the original folder's installed tools. `npm ci` and every
check in the table passed there. Astro reported zero errors, warnings or hints
across 37 files. Obsolete instructions, an outdated checksum list and old iteration
notes were removed during preparation.

The workflow in `.github/workflows/check.yml` runs checks only. The publishing
template is still inactive in `operations/`. Preparing the project did not create
a GitHub repository, upload a commit, publish the website or change DNS. Its first
real check run on GitHub can only be confirmed after you upload it.

## Warnings and remaining checks

The build reports that the Three.js file for the interactive figure is larger
than 500 KB even after minification, the step that shortens JavaScript for delivery.
This warning was left visible. The code loads only near the homepage figure and
draws on interaction rather than running a continuous animation. Other pages do
not load that application code.

Installation also reports an existing notice about the optional `fsevents` package's
install script. Installation succeeds; its permission policy was not changed.

The following still require a separate review:

- **Browser behavior:** desktop/mobile layout, keyboard and touch controls, zoom,
  font loading and transparent surfaces. Browser automation was unavailable in the
  session, so the relevant boxes in [the checklist](QA_CHECKLIST.md) remain open.
- **Content and external links:** the build does not verify scientific facts or
  whether another website is available. The [publication notes](PUBLICATION_EVIDENCE.md)
  record the original check dates and details that need another look before launch.
- **The hosted website:** redirects, direct page loads, missing-page behavior,
  HTTPS and your domain must be checked after deployment. A local build cannot
  confirm those hosting settings.

## Run the checks again

Follow [README.md](../README.md) for the commands. To test a GitHub project folder,
use [START_HERE.md](../START_HERE.md), then run `npm run build` to restore the normal
root output. Use [REPOSITORY.md](REPOSITORY.md) when uploading the project and
[DEPLOYMENT.md](../operations/DEPLOYMENT.md) when you are ready to publish.
