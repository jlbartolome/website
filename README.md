# Jon Lafuente Bartolomé — research website

This folder contains your website and everything needed to maintain it. Most of
your changes will be to the text files in `src/content/`. The website applies the
existing design automatically, so you can update a sentence, add a paper or change
your biography without editing the page layout.

The site uses **Astro**, a tool that turns those files into web pages. You do not
need to learn Astro to make everyday content changes. The interactive figure on
the homepage is already included; you only need Blender if you want to change it.

## Open the website on your computer

Open a terminal in this project folder: the folder containing `package.json`.
Commands in these guides should be run from there, one line at a time. If a command
reports an error, resolve it before continuing with the next step.

The project uses Node **24.22.1**. Node runs the website tools on your computer;
`npm`, which comes with Node, runs the commands below. You can check your version
with `node --version`. If you use nvm to manage Node, run `nvm install` followed by
`nvm use`; the `.nvmrc` file tells it which version this project needs.

The first time you open the project, install its tools:

```bash
npm ci
```

Then start the preview:

```bash
npm run dev
```

Open the address printed in the terminal. Leave that terminal running while you
edit. Saving a Markdown file updates the preview automatically. Press **Ctrl+C**
in the terminal when you want to stop it. Next time, start it again with
`npm run dev`; you do not need to reinstall the tools for each editing session.

This preview is on your computer. Saving a file here does not change the public website.

## Find what you want to edit

| Task | Where to start |
|---|---|
| Change the homepage heading or supporting sentence | `src/content/pages/home.md` |
| Edit your biography, portrait or postal address | `src/content/pages/bio.md` |
| Change your name, email, affiliation or profile links | `src/content/site/main.md` |
| Add a publication, research theme, course or news item | [Content editing guide](docs/CONTENT_EDITING.md) |
| Understand the folders | [Project guide](START_HERE.md) |
| Upload the project to GitHub | [GitHub guide](docs/REPOSITORY.md) |
| Publish the website and connect your domain | [Publishing guide](operations/DEPLOYMENT.md) |

The [content folder guide](src/content/README.md) gives a shorter map of the
editable files. The [image guide](src/assets/images/README.md) explains how to
replace your portrait and add other figures.

## Check your changes before uploading

Run these after editing the content:

```bash
npm run check
npm run build
npm run verify
npm run release:check
```

`check` looks for mistakes in the files. `build` creates the finished website in
`dist/`. The last two commands check that the finished pages, links, images and
publication list have been generated correctly. They do not publish anything.

To view that finished version, run:

```bash
npm run preview
```

Open the address it prints and stop it with **Ctrl+C** when finished. Unlike the
editing preview, this shows the last build: after further edits, run
`npm run build` again before reviewing them here.

Two additional checks are useful when preparing an upload or changing the code:

| Command | When and why to run it |
|---|---|
| `npm run repo:check` | Before a commit: checks the files that would go into Git, documentation links and project settings |
| `npm run test:content` | After changing how content is handled: tries sample edits, additions and deletions in a temporary copy |

See [what has been tested](docs/PACKAGE_VALIDATION.md) and the
[checks still to do in a browser](docs/QA_CHECKLIST.md).

## Keep the project easy to maintain

GitHub stores the editable project and its history. GitHub Pages publishes the
finished website. The included GitHub check workflow runs tests only; publishing
starts after you activate the separate deployment workflow. Once that is active,
pushing changes to `main` also updates the public website.

The project includes its current images, Blender files and license notices.
Installed tools, generated pages and optional historical archives are excluded
from Git. A new copy downloaded through Git can build without those archives.

For less frequent changes, see the [design guide](DESIGN_SPEC.md),
[Blender figure guide](docs/HERO_ARTWORK.md),
[publication source notes](docs/PUBLICATION_EVIDENCE.md) and
[image and software licenses](ASSET_LICENSES.md).
