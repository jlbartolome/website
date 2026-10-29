# Work on the homepage figure in Blender

The large illustration at the top of the homepage is often called the **hero
figure** in the code. It comes from `small_epolaron.blend`, supplied on
26 October 2026. Blender produces both the still image and the model that visitors
can rotate. You only need Blender when changing this artwork; the existing website
can be edited, built and published without it.

The page starts by showing a **PNG**, an ordinary image with a transparent
background. It then loads a **GLB**, a compact 3D model file, for interaction.
The PNG remains available if the browser cannot display the model.

## Find the right file

| File | Purpose |
|---|---|
| `artwork/hero/small_epolaron.blend` | The original supplied model; keep it unchanged |
| `artwork/hero/website-hero.blend` | The editable scene with the current website styling |
| `scripts/render-hero.py` | Sets up the colors, surfaces and camera, then renders the PNG |
| `scripts/export-hero.py` | Produces the smaller GLB from the styled scene |
| `artwork/hero/geometry-audit.json` | Records geometry checks and arrow positions |
| `artwork/hero/web-export-audit.json` | Records the GLB size, geometry counts and export settings |
| `public/assets/quantum-orbitals-ehu.png` | The published 1448×1086 transparent image |
| `public/assets/quantum-orbitals-ehu.glb` | The published interactive model, about 1.08 MB |
| `src/components/HeroModel.astro`, `src/scripts/hero-model.ts` | The code that displays the figure and handles rotation |

Only the PNG and GLB are published. The Blender originals stay outside `public/`
and `dist/`. The homepage layout, fonts and official logo are controlled separately.

The original Blender file has this SHA-256 checksum, which can be used to confirm
that it has not changed:
`4f0f11370b5a7ae71db91abc1688ffe79493d3f3c38821357cbfca348cef026f`.

## Recreate the current artwork

These commands were tested with Blender 5.2.3 LTS installed on the Mac. Run them
from the project folder containing `package.json`. On another computer, replace
`/Applications/Blender.app/Contents/MacOS/Blender` with its Blender executable path.
Copy each complete command, including the continued lines ending in `\`.

First, render the PNG from the original model:

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background --disable-autoexec artwork/hero/small_epolaron.blend \
  --python scripts/render-hero.py -- \
  --output public/assets/quantum-orbitals-ehu.png \
  --width 1448 --samples 512 \
  --save-blend artwork/hero/website-hero.blend \
  --audit artwork/hero/geometry-audit.json
```

This replaces the website PNG, recreates the styled Blender scene and writes its
geometry report. Always start this render script from the original model: the
script adds the edge guides and circular arrows itself.

Next, export the interactive model from the styled scene:

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background --disable-autoexec artwork/hero/website-hero.blend \
  --python scripts/export-hero.py
```

Run this export again after rerendering or manually editing `website-hero.blend`,
so the GLB matches the scene you intend to publish.

Finally, check the website:

```bash
npm run check
npm run build
npm run verify
npm run release:check
npm run preview
```

Open the printed preview address. Check the initial image, dragging, touch gestures,
keyboard controls and reset. Press **Ctrl+C** to stop the preview. The automated
checks inspect the model file, but cannot confirm how your browser draws transparent
surfaces or responds to touch.

## Try changes without replacing the current figure

For a quick draft, change the render command's output/quality options to
`--output /tmp/hero-draft.png --width 960 --samples 48` and omit the entire
`--save-blend artwork/hero/website-hero.blend` option. Use a separate audit path,
such as `--audit /tmp/hero-draft-audit.json`, to keep the current report too.
The draft image will be written to `/tmp/`, outside the project.

There are two ways to change the artwork:

- Edit the palette, opacity, sheen, highlight power or camera direction in
  `scripts/render-hero.py`, then rerun the render and export commands.
- Open `artwork/hero/website-hero.blend` in Blender and edit the styled scene by hand.

Keep the original model unchanged in either case. **Rerunning the render script
with `--save-blend` recreates the styled scene from the original, so it replaces
manual edits to that styled copy.** Save those separately if you want to retain them.
The render script removes image text metadata, including local file paths, without
changing the image pixels.

## What the figure should show

Keep the source atomic positions, rounded orbital surfaces, six thick site arrows,
twelve octahedron edges, eight translucent faces and two circular rotation arrows.
The eight outer corner atoms and their arrows stay hidden, but remain available
in the editable scene. Keep the complete figure inside the frame.

The figure uses pale mint and pearl colors with soft white highlights. The octahedron
looks glass-like while allowing the interior to remain visible. Both rings share
the orbital color; shading and transparency can make them appear slightly different.
The small central site carries the official EHU green.

The rings suggest rotation; they do not assert a particular phonon mode. The model
is your scientific illustration. Its filename alone does not identify a material,
orbital quantum number, computational method or numerical result.

## How interaction works

The still image appears first. As the figure approaches the visible part of the
page, the site loads its local Three.js code and the model. The controls appear
only after the model has rendered successfully. Dragging, using the arrow keys
or pressing a rotation button reveals the 3D view. **Home** or **Reset view**
returns to the original image and orientation.

A sideways touch gesture rotates the model; an up/down gesture scrolls the page.
Visitors can still pinch to zoom the page. There is no automatic rotation or
inertia. The page draws a new model view only when the user interacts or resizes
the window. The figure area and five 44px buttons have visible keyboard focus;
spoken instructions are available to screen readers without a visible drag hint.

The PNG also works without JavaScript or if the model download or browser's WebGL
3D support fails. The viewer uses local files, with no remote models, textures,
analytics or content-delivery service. Its JavaScript is included only on `/`
and `/home/`.

## Technical settings for reproducing the appearance

This section is for changes to the Blender scripts or browser renderer.

The source has seven meshes: a central site, six surrounding sites, eight corner
sites, an octahedron with six vertices and eight triangular faces, an orbital
surface mesh, and two arrow groups. The seven original base meshes keep their
vertex coordinates, face connectivity and object transforms. Hash comparisons
in the geometry audit check these before and after styling.

The rounded appearance uses Laplacian smoothing within each original lobe's
bounding box, stored in the reversible `Website rounding` shape key, followed by
Catmull-Clark subdivision. This keeps the lobes' positions and extents tied to the
source. Set the shape key to zero and disable subdivision to inspect the original
surface. The six anion arrows keep their source start positions and cone tips;
the shaft radius is 0.11. The edge-guide radius is 0.04. The camera is orthographic.

| Part | Base color | Appearance settings |
|---|---|---|
| Central site | `#5FD790` | Small official EHU-green accent |
| Orbital surfaces and both rings | `#AED8BF` | Rings use the shared `ORBITAL_GREEN` constant; lobe opacity 0.88 |
| Site arrows | `#6F9580` | Soft shading |
| Surrounding atoms | `#9EC3AD` | Soft shading |
| Octahedron edges | `#94ACA0` | Sheen 0.70, highlight power 40 |
| Octahedron faces | `#D5E6DE` | Opacity 0.34, directional shading 0.14, sheen 0.80, highlight power 5 |

`satin_material()` uses a fixed softbox direction and per-material sheen/power.
The highlights are stored in the model's vertex colors, meaning they rotate with
the geometry. They give a glass-like impression without calculating physical
reflections or refraction. This avoids extra lights, textures and continuous
redrawing. Render and export clamp the shaded colors to the same normalized range
so bright facets remain consistent between PNG and GLB.

The GLB contains 66,134 triangles. Only visible objects are exported; the exporter
does not save over the Blender sources. Rounding and subdivision are applied before
reducing the mesh size. Fourteen disconnected orbital surfaces remain separate
for depth sorting. Linear vertex colors and `KHR_materials_unlit` materials retain
the satin shading. Face opacity stays at 0.34 and lobe opacity at 0.88. Browser
transparency can differ slightly from Blender's ray-traced PNG where surfaces overlap.
The browser's device pixel ratio is capped at 2 to limit rendering work.

`npm run verify` loads the GLB with Three.js and checks geometry, opacity, hidden
groups, the absence of external file requirements and a 1.5 MB size limit.
Three.js's version is recorded in the lockfile; its MIT license is served at
`licenses/three.txt`.

For more detail, see [Blender's command-line rendering documentation](https://docs.blender.org/manual/en/latest/advanced/command_line/render.html)
and the [Three.js documentation](https://threejs.org/docs/).
