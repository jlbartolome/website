# Save the project on GitHub

This guide takes you from the project folder on your computer to a copy on GitHub.
It also explains how to save and upload later changes. Uploading the project does
not publish the website: that is a separate step in the
[publishing guide](../operations/DEPLOYMENT.md).

A few terms will help:

- **Git** records changes to files on your computer.
- A **repository** is a project folder whose history Git keeps.
- A **commit** is a saved version of the files you have chosen to include, with a
  short message explaining the change.
- **GitHub** stores an online copy of the repository. **Push** means uploading your
  commits to that copy; **clone** means downloading a repository with its history.
- **`main`** is the name we use for the main branch: the version of the project
  that the checks, and later the publishing workflow, will use.

Run the commands below in a terminal opened in the folder containing
`package.json`. Run one line at a time and stop if it reports an error. You need
Git installed, a GitHub account, and the website tools installed with `npm ci`.
See [README.md](../README.md) if you have not opened the website locally yet.

## 1. Check the files before uploading

The project includes the Markdown content, website code, images, fonts, Blender
files, scripts and these guides. It also includes `package-lock.json`, which
records the exact versions of the tools needed to build it.

The `.gitignore` file tells Git which local files to leave out. It excludes:

- Installed tools and generated pages: `node_modules/`, `dist/` and `.astro/`.
- Local settings, passwords or tokens, logs and editor/Blender backup files.
- `reference/`, which holds optional old design examples.
- `docs/source-snapshot/`, which holds optional copies of the original public site.

The two archive folders remain on your computer, but will not appear on GitHub.
The current website works without them. Back them up separately if you want to
keep them for historical reference.

Both current Blender files are included. One preserves your original model; the
other contains the styled scene used for the website. Keeping both makes future
artwork changes possible. The original is about 39 MiB, which is too large for
GitHub's browser upload form. **Use Git or GitHub Desktop to upload this project.**
The files fit GitHub's regular Git limit and do not require Git LFS, its separate
large-file storage system. See [GitHub's file-size limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

Run the website checks in [README.md](../README.md), then:

```bash
npm run repo:check
```

This checks the files Git would include, their sizes, documentation links and
project settings. It also looks for some common forms of accidentally saved
credentials. It works even before you have set up Git for this folder and does
not save a commit or upload anything. To see the complete file list, run:

```bash
npm run repo:check -- --list
```

Review that list yourself as well; the automatic check cannot recognize every
possible password or private file.

## 2. Save the first version on your computer

These instructions assume this folder is not already a Git repository. If you
have already set it up, skip `git init` and keep the existing repository settings.

```bash
git init -b main
npm run repo:check
git add .
git diff --cached --stat
git status --short
```

`git init` starts the repository. `git add .` selects the files for the next commit,
respecting `.gitignore`. The last two commands show what you selected. This is
called **staging**; it has not uploaded anything.

Once the list looks right, save the first commit:

```bash
git commit -m "Add quantum materials research website"
```

If Git asks for your name and email, you can set them for this repository with
the commands below. Replace both example values with the identity you want
attached to your commits, then rerun the commit command above.

```bash
git config user.name "YOUR NAME"
git config user.email "YOUR COMMIT EMAIL"
```

## 3. Create the GitHub copy and upload

In your GitHub account, create a new **empty repository**. Do not ask GitHub to add
a README, license or `.gitignore`: this project already has the files it needs.
Choose whether the repository should be public or private. A public repository
makes the included text, portrait and Blender sources visible as well as the code.
[ASSET_LICENSES.md](../ASSET_LICENSES.md) records the supplied licenses; no single
open-source license has been assigned to the whole project.

Copy the repository's HTTPS URL from GitHub. In the following command, replace
`YOUR_USERNAME` and `YOUR_REPOSITORY` with your actual account and repository names:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

`origin` is Git's nickname for that online copy. The first command records its
address; the second uploads your commits and connects your local `main` branch
to GitHub. Use GitHub's sign-in process or GitHub Desktop for authentication.
Do not put access tokens into project files or the repository URL.

If `origin` already exists, do not replace it blindly. Run `git remote -v` to see
where the project is connected before changing anything.

## 4. Confirm the upload worked

Open the repository on GitHub and check that the files are there. Then open its
**Actions** tab and look for **Check website**. Wait for it to finish successfully.

The instructions for that check are in
[check.yml](../.github/workflows/check.yml). GitHub calls a set of automated steps
like this a **workflow**. This one installs the specified tools and checks the
content and finished website, including links under a GitHub project address.
It runs when you push to `main`, when you propose changes through a pull request,
or when you start it manually. It has read-only repository permission and does
not publish the website. Its first actual GitHub run still needs to be confirmed
after upload.

To publish later, follow [DEPLOYMENT.md](../operations/DEPLOYMENT.md).
The prepared publishing workflow in `operations/github-pages.yml` remains
inactive until you copy it into `.github/workflows/`.

## Save later changes

Edit the Markdown and review it with `npm run dev`. Run the checks from
[README.md](../README.md), then inspect what changed:

```bash
git diff
git status --short
```

When you are satisfied, select the intended files and save a commit. Here is an
example for an edit to the homepage sentence:

```bash
git add src/content/pages/home.md
git commit -m "Update homepage introduction"
git push
```

Use the actual paths of the files you changed and a message that describes your
change. `git add .` is also available when you intend to include every current
change, but review the list before committing. Check the result in GitHub's
Actions tab after the push.

**Once publishing is enabled, pushing to `main` also updates the public website.**
Before that, it only uploads the files and runs checks.

Keep `package-lock.json` with the project and use `npm ci` when setting up another
computer. Updating the website's tools is a separate maintenance task: it may
change the lockfile and requires another round of checks. If the required Node
version changes, keep `.nvmrc` and `package.json` in agreement.
