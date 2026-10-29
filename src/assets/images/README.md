# Add or replace an image

Put photographs and figures for your content in this folder. Use a descriptive
lowercase filename, such as `conference-photo.jpeg` or `polaron-diagram.png`,
then select that file from your Markdown. Keep the original at a useful resolution:
Astro makes the website's display copies for you.

## Your portrait

`portrait.jpeg` is the image you supplied, stored unchanged. The About page
selects it through these settings in `src/content/pages/bio.md`:

```yaml
portrait: ../../assets/images/portrait.jpeg
portraitAlt: Jon Lafuente Bartolomé
```

To replace it, either save your new image under the same filename or add a new
file here and update `portrait` to match. The `portraitAlt` text describes the
image for people who cannot see it. You can also attach an image in chat and ask
Codex to save it in this folder and update the reference.

The page shows the full portrait without cropping, at up to 280px wide. Astro
creates 320px and 640px WebP copies for display, leaving the original untouched.
To hide the portrait, remove the `portrait` setting. If that setting points to a
file that is missing, the build reports an error.

## A figure inside a paragraph

After putting `my-figure.png` in this folder, add this to a content file:

```markdown
![Accurate alternative text](../../assets/images/my-figure.png)

*Caption and credit.*
```

Replace the filename, description and caption with your own. That relative path
works from each current collection folder under `src/content/`. The website
processes the image and keeps it within the text column. Save and inspect it in
the preview before uploading.

## Files visitors should receive unchanged

For a downloadable original or an exact scientific export, use `public/assets/`
instead. Link to it as `[Download](/assets/my-document.pdf)` or display it with
`![Alternative text](/assets/my-figure.svg)`. The site handles the address correctly
on both your own domain and a GitHub project address.

Record the image's source, permission and any required credit in
[ASSET_LICENSES.md](../../../ASSET_LICENSES.md). The official logo and Blender
homepage figure have their own design requirements; see
[the hero guide](../../../docs/HERO_ARTWORK.md) before changing the latter.

For developers adding a new layout, `SiteImage.astro` supports different display
sizes, captions and lossless PNG output. For normal content editing, use the
Markdown instructions above. See [the full editing guide](../../../docs/CONTENT_EDITING.md).
