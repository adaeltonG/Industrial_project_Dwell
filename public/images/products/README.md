# Product images

The original seven images were generated on 2026-09-10 using the built-in OpenAI image_gen tool. These are AI-generated illustrative catalog images, not photographs of physical inventory. No external reference images were used.

## Additions: 2026-09-11

The 23 additional products use 12 separately AI-generated images and 11 downloaded stock photographs. All are illustrative demonstration inventory, not verified photographs of the named vendors' products. Stock photographs can differ in material, colour or design; visible brands do not imply endorsement.

The downloaded files, original photo pages, credits where recorded, download URLs and license links are listed in [stock-sources.json](stock-sources.json). Files are hosted locally, not hotlinked. `npm run images:import` reproduces missing stock assets as PNG files without overwriting existing images.

The retained generated images use the following prompt template, with the individual subjects below:

```text
Use case: product-mockup.
Asset type: square ecommerce product photograph matching Dwell's existing neutral sustainable homewares collection.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials and natural textures.
Composition/framing: product centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition. For a set, show only that cohesive set.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded product only; no props, people, surrounding furnishings, overlay text, logos, watermarks, labels, borders, panels or collage.
Subject: [subject below].
Generate one image for [slug].png. Save as a project asset.
```

| Slug | Subject |
| --- | --- |
| cotton-table-runner | One natural oatmeal cotton table runner, narrow rectangular woven textile with neatly hemmed edges, softly folded once to show its full long shape and fabric texture |
| glass-storage-jars | A matching set of exactly three empty clear glass pantry jars in small, medium and large sizes with fitted natural bamboo lids, grouped closely as a single product set |
| terracotta-planter | One empty classic warm terracotta plant pot with slightly flared rim and matching round saucer, fine porous fired-clay texture, no plant |
| reading-lamp | One adjustable matte warm-grey LED desk reading lamp with a compact circular base, slender articulated arm and slim gently angled light head, no surrounding desk objects |
| wireless-keyboard | One compact low-profile wireless keyboard with warm-white keys and a subtle silver aluminium frame, simple understated standard keyboard layout, no brand name |
| usb-c-hub | One compact silver aluminium USB-C multiport hub, with visible USB-A ports, HDMI port and a short built-in USB-C connector cable curved naturally alongside it |
| portable-speaker | One compact cylindrical portable wireless speaker in warm grey woven fabric with matte charcoal trim and small simple top controls |
| charging-stand | One minimalist matte warm-grey angled wireless phone charging stand with a rounded rectangular upright charging pad and stable oval base, empty without a phone |
| laptop-sleeve | One padded oatmeal felt laptop sleeve with a zip closure and a zipped accessory pocket, lying at a natural slight angle, no laptop |
| canvas-tote-bag | One natural unbleached cotton canvas tote bag with two long loop handles, sturdy seams and subtle folds, empty, standing softly upright |
| merino-scarf | One soft oatmeal merino wool scarf folded loosely with a short fringe visible, finely detailed wool fibres and gentle drape |

The twelfth retained image, `stoneware-mug.png`, used this final prompt:

```text
Use case: product-mockup. Asset type: square ecommerce catalogue photograph for Dwell, matching the existing warm cream minimalist product photos in this project. Subject: one hand-glazed cream stoneware mug with a comfortable rounded handle, subtly speckled glaze and a natural unglazed foot. Scene/backdrop: seamless warm cream studio background and surface. Style/medium: highly realistic premium product photography, accurate ceramic texture. Composition: single product centered and fully visible with generous breathing room, gentle elevated three-quarter angle, square image. Lighting: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood. No props, people, text, logos, watermark, labels, panels or collage. Generate one product image only, for stoneware-mug.png. This is a project asset to save, not an inline chat illustration.
```

## Original images

The original seven PNG assets are stored alongside this file. Each original product was generated separately using the following final prompt set. The 2026-09-11 additions are documented below.

## ceramic-pour-over-kettle.png

```text
Use case: product-mockup
Asset type: square ecommerce product photograph for a neutral sustainable homewares collection.
Subject: one cream glazed ceramic gooseneck pour-over kettle with lid and rounded handle, handmade subtly speckled finish.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials.
Composition/framing: single item centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded item only; no props, people, text, logos, watermark or collage.
```

## woven-storage-basket.png

```text
Use case: product-mockup
Asset type: square ecommerce product photograph for a neutral sustainable homewares collection.
Subject: one round woven natural seagrass storage basket with two sturdy loop handles, richly detailed woven fibers.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials.
Composition/framing: single item centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded item only; no props, people, text, logos, watermark or collage.
```

## recycled-wool-throw.png

```text
Use case: product-mockup
Asset type: square ecommerce product photograph for a neutral sustainable homewares collection.
Subject: one folded recycled wool throw blanket in warm oatmeal beige, softly draped fold with short fringe, visibly cozy wool weave.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials.
Composition/framing: single item centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded item only; no props, people, text, logos, watermark or collage.
```

## bamboo-desk-organiser.png

```text
Use case: product-mockup
Asset type: square ecommerce product photograph for a neutral sustainable homewares collection.
Subject: one bamboo desk organiser with a low tray and upright divided compartments, empty, finely grained natural bamboo.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials.
Composition/framing: single item centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded item only; no props, people, text, logos, watermark or collage.
```

## linen-cushion-cover.png

```text
Use case: product-mockup
Asset type: square ecommerce product photograph for a neutral sustainable homewares collection.
Subject: one square cushion displaying a natural warm beige linen cushion cover, subtle seam edge and tactile slub weave.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials.
Composition/framing: single item centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded item only; no props, people, text, logos, watermark or collage.
```

## cast-iron-plant-stand.png

```text
Use case: product-mockup
Asset type: square ecommerce product photograph for a neutral sustainable homewares collection.
Subject: one minimalist black cast iron plant stand, circular top tray on three slender sturdy legs, empty, matte iron.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials.
Composition/framing: single item centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded item only; no props, people, text, logos, watermark or collage.
```

## oak-serving-board.png

```text
Use case: product-mockup
Asset type: square ecommerce product photograph for a neutral sustainable homewares collection.
Subject: one solid oak serving board with rounded edges, short handle and hanging hole, beautiful natural oak grain.
Scene/backdrop: seamless warm cream studio background and surface.
Style/medium: highly realistic premium product photography with accurate materials.
Composition/framing: single item centered, fully visible with generous breathing room, gentle elevated three-quarter camera angle, square composition.
Lighting/mood: soft daylight from upper left, delicate natural contact shadow, quiet warm editorial mood.
Constraints: unbranded item only; no props, people, text, logos, watermark or collage.
```

