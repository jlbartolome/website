# Working files for the homepage figure

These files let you change or recreate the homepage figure in Blender. You do
not need to open them, or install Blender, to edit text or build the website.

| File | Why it is kept |
|---|---|
| `small_epolaron.blend` | Your original supplied model; keep this unchanged |
| `website-hero.blend` | The editable scene with the website's colors, camera and surface styling |
| `geometry-audit.json` | Measurements and checks showing that the original geometry was preserved |
| `web-export-audit.json` | Measurements and settings for the smaller model used by the browser |

Both Blender files belong in Git so future artwork changes do not require
reconstructing the model. Blender's automatic `.blend1` and `.blend2` backup
copies are excluded from Git.

Visitors receive the PNG image and GLB model in `public/assets/`; the files in
this working folder are not included in the published website. GLB is the file
format used for the interactive 3D model.

Follow [the figure guide](../../docs/HERO_ARTWORK.md) for exact rendering and
export commands. It also explains an important choice: editing the styled scene
by hand versus recreating it from the original with the render script.
