# Where the images, fonts and software came from

This page records the sources and permissions for the materials included with the
website. Keep these notes when sharing or uploading the project. There is no single
license covering all of the site's text, portrait, Blender models and university
branding; the supplied third-party licenses apply to their own files.

| Material | Source | License or instruction to keep |
|---|---|---|
| Inter 400/500/600 | [Inter project](https://github.com/rsms/inter) | Complete SIL OFL in `public/fonts/inter-OFL.txt` |
| Official EHU SVG | [Official EHU download](https://www.ehu.eus/documents/d/marka/ehu_chillida_ikurra-1) | Unmodified; preserve background/clear space and follow the university's brand rules |
| Portrait JPEG | Supplied by the owner, stored unchanged at `src/assets/images/portrait.jpeg`, 2474×3228 | No photographer credit or open redistribution license supplied; Astro generates display copies |
| Blender hero source | Supplied by the owner: `artwork/hero/small_epolaron.blend` | Preserve unchanged; no open redistribution license supplied |
| Styled Blender scene, PNG and GLB | Derived from that source by the included render/export scripts | Same original geometry with the approved presentation changes; no third-party textures/models |
| Research SVGs | Original hand-authored conceptual schematics in `public/assets/research/` | Scientific conventions recorded in `docs/CONTENT_MIGRATION.md`; not calculated data |
| Profile SVG symbols | Original line symbols in `src/components/ProfileLinks.astro` | Neutral interface symbols, not official profile-service logos |
| Three.js and GLTFLoader | [Three.js project](https://github.com/mrdoob/three.js), exact version recorded in `package-lock.json` | MIT license copied to `public/licenses/three.txt` |

EHU's [brand manual](https://www.ehu.eus/documents/d/marka/markagida_ehu_es), page 51,
identifies Uniberdea as #5FD790 (RGB 95/215/144). Forest, charcoal and pale colors
used alongside it are chosen complements, not additional official brand colors.

When you add an image, keep the original and record who made it, where it came
from, your permission to use it and any required credit. Give it a useful text
description for visitors who cannot see it. Follow the
[image guide](src/assets/images/README.md) for Markdown image paths and the
[hero guide](docs/HERO_ARTWORK.md) for Blender updates. The installed software tools carry their own licenses in their package folders.
The public notices listed above accompany the third-party code and fonts that
visitors receive as part of the website.
