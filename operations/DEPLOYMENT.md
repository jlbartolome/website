# Publish the website with GitHub Pages

GitHub Pages can host this website at **www.jonlafuentebartolome.xyz**. You can
keep your domain with its current provider. The work is to upload the project,
turn on publishing, test the new site, and then point your domain to it.

First complete [the GitHub guide](../docs/REPOSITORY.md). The project currently
includes a workflow that only runs checks. This guide explains how to activate
the separate publishing workflow. Preparing these files has not published the
site or changed your domain. GitHub's instructions were reviewed on 28 October 2026;
the official links at the end are useful if its settings screens change.

## 1. Check the website on your computer

Open a terminal in the project folder containing `package.json`. Use Node 24.22.1
as described in [README.md](../README.md). Run these commands one at a time, and
resolve any error before continuing:

```bash
npm ci
npm run repo:check
npm run check
npm run test:content
npm run build
npm run verify
npm run release:check
npm run preview
```

The last command prints a local address. Open it and review the finished website,
including the mobile layout and figure controls. Use [the checklist](../docs/QA_CHECKLIST.md)
to record the checks, and revisit the publication details marked as unresolved in
[the source notes](../docs/PUBLICATION_EVIDENCE.md). Press **Ctrl+C** to stop the preview.

`build` creates the finished website in `dist/`. Only that folder is published.
The editable Markdown, Blender originals and documentation stay in the repository.
GitHub serves the finished files, so you do not need to leave a server running on
your own computer.

## 2. Turn on publishing in GitHub

In your repository on GitHub, open **Settings → Pages**. Under **Build and
deployment**, set **Source** to **GitHub Actions**. Pages availability for private
repositories depends on your GitHub plan. A private source repository does not
by itself make the published website private.

Back in your local project folder, run:

```bash
cp operations/github-pages.yml .github/workflows/pages.yml
git add .github/workflows/pages.yml
git commit -m "Enable GitHub Pages deployment"
git push
```

The first command activates the prepared workflow by copying it to the folder
GitHub reads. The other commands save and upload it. It expects the main branch
to be named `main`, as in the GitHub guide.

**From this point on, pushing to `main` will also publish the website if its checks
pass.** The publishing workflow checks and builds the site, uploads `dist/` and
asks GitHub Pages to serve it. The separate **Check website** workflow continues
to run as well.

## 3. Test the GitHub address first

Open the repository's **Actions** tab. Find **Publish Astro website** and wait
for a successful run. The run or the Pages settings will show the website address.
An upload completing successfully does not by itself mean publishing has finished.

Review that address on a computer and a phone. Open each page directly and refresh
it. Check the fonts, portrait, links and interactive figure. Try an address that
does not exist to see the site's “page not found” page. Check `/research` and
`/research/`, and the equivalent Publications and About addresses, so old links
continue to work.

Keep your existing domain pointing to the old website during this review.

If you want to test the same kind of address locally, use the example in
[START_HERE.md](../START_HERE.md). It checks the extra folder that appears in a
GitHub project address, such as `/jon-research-site/`.

## 4. Connect your domain

**DNS** is the set of records that tells browsers where to find your domain.
You change these records through your domain or DNS provider. They can also
control email and other services, so only change the records intended for the website.

Use `www.jonlafuentebartolome.xyz` as the main website address. The version without
`www`, `jonlafuentebartolome.xyz`, is called the **apex domain** in GitHub's instructions.

1. Save a copy of the existing website DNS records and keep the old site available.
   That gives you a way back if the move needs to be undone.
2. Follow [GitHub's domain verification instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
   to confirm that you own the domain. In the repository's **Settings → Pages**,
   set **Custom domain** to `www.jonlafuentebartolome.xyz`. Do this before pointing
   the website's DNS records to GitHub.
3. Rebuild on GitHub with the new address: open **Actions → Publish Astro website →
   Run workflow**, choose `main` and start the run. The workflow reads the Pages
   settings so the new build uses your domain for page links and search-engine information.
4. At your DNS provider, set the **CNAME** record for `www` to
   `YOUR_USERNAME.github.io`, replacing `YOUR_USERNAME` with your real GitHub account.
   The value has no `https://` and no repository name. Configure the domain without
   `www` using [GitHub's current DNS instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
   so visitors are redirected to the `www` address too.
5. Leave email and unrelated records unchanged, including MX, SPF, DKIM and DMARC.
6. Once GitHub has issued the certificate, enable **Enforce HTTPS** in Pages settings.
   Check both versions of your domain, direct page links, images and navigation.
   Confirm that the sitemap and preferred page addresses now use your custom domain.

For this GitHub Actions setup, you do not need to create a file named `CNAME` in
the project. The DNS record and GitHub's Custom domain setting are what matter;
GitHub ignores a `CNAME` file in the uploaded website for this type of workflow.

Keep the old site until the new one is working reliably. If you need to return
to it, restore the website DNS values you saved in step 1.

## What happens when you edit later

Edit the Markdown, preview and check your changes, then commit and push them as
explained in [the GitHub guide](../docs/REPOSITORY.md). GitHub rebuilds and publishes
the site automatically. Check the Actions result if the public website has not
updated. Your local `npm run dev` preview does not upload changes by itself.

## Technical details for future maintenance

You can skip this section when publishing with the prepared workflow.

The workflow uses checkout v7, setup-node v7, configure-pages v5,
upload-pages-artifact v4 and deploy-pages v4. These are the selected versions,
not a promise that they will remain the latest. Check the official action
repositories before updating them.

`actions/configure-pages` reads the Pages address settings and supplies `origin`
and `base_path`. The build receives these as `SITE_URL` and `BASE_PATH`.
`SITE_URL` is the website address without a folder; `BASE_PATH` is the folder part,
or `/` when using your custom domain. This lets the same project work at both addresses.

To use another static hosting service, install the specified Node version, run
`npm ci` and the project checks, then build with `SITE_URL` and `BASE_PATH` set for
that host. Upload only `dist/`. Follow that provider's HTTPS and domain instructions.

## Official references

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Configure Pages outputs](https://github.com/actions/configure-pages/blob/v5/action.yml)
- [Checkout](https://github.com/actions/checkout) and [Setup Node](https://github.com/actions/setup-node)
- [Custom domain management](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Astro GitHub Pages deployment](https://docs.astro.build/en/guides/deploy/github/)
