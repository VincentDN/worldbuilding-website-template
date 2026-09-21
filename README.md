# Worldbuilding website template

A static, one-page home for a fictional world, adapted from [American Kingdoms](https://american-kingdoms.com/) by Vincent De Nil. Includes a project introduction, faction carousel, gallery with an accessible image viewer, project cards, community section, and an embedded Leaflet world atlas.

**MIT licensed. No build step, account, API key, or package installation required.** All runtime assets are included locally, including Leaflet and the map's geography. The default page makes no requests to third-party services.

[View the live demo](https://vincentdn.github.io/worldbuilding-website-template/)

## Start locally

1. Use this repository as a template, fork it, or download a ZIP.
2. Serve the repository folder with any static HTTP server. For example, with Python installed:

   ```sh
   python -m http.server 8000
   ```

3. Open `http://localhost:8000`.

Use an HTTP server rather than opening `index.html` directly: browsers restrict loading the atlas's GeoJSON over `file://`.

## Make it yours

| File | What to change |
| --- | --- |
| `index.html` | Project name, page title and description, navigation, premise, faction cards, gallery, projects, contact details, and footer |
| `styles.css` | Colors and spacing in `:root`, typography, and layout |
| `assets/` | Replace the original SVG placeholders with your own art and favicon; update paths, dimensions, and alt text in the HTML |
| `data/territories.geojson` | Your fictional borders; empty by default |
| `data/places.geojson` | Your settlements and points of interest; empty by default |
| `map.js` | Initial map bounds, colors, zoom limits, and map behavior |

Duplicate an `<article class="faction-card">` to add a faction. Duplicate a gallery `<figure>` to add artwork. Its link points to the full-size image; its `<img>` can point to a smaller preview. Gallery captions and image descriptions are reused in the viewer. Navigation, content, and gallery links remain usable without JavaScript; the atlas requires it.

The placeholder copy intentionally includes no live signup form, shop, social accounts, video embeds, or wiki links. Replace the copy and add your own working links when those destinations exist. No American Kingdoms artwork, lore, music, branding, subscription backend, or analytics configuration is included.

## Add to the atlas

The atlas uses a local Natural Earth land layer with a standard Leaflet geographic map. Pan by dragging, zoom with the controls, and return with **Reset view**. Scroll-wheel zoom is disabled so the map does not interrupt page scrolling. The location list below the map provides keyboard-accessible alternatives to clicking features.

The two author-owned data files start as empty GeoJSON FeatureCollections. Toggle **Show example realm & settlement** to preview the separate example files; this does not change or save your data. Copy features from those examples into your own files and edit them, or export your own GeoJSON from a map editor.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Your settlement",
        "description": "Its story begins here."
      },
      "geometry": { "type": "Point", "coordinates": [-2, 50] }
    }
  ]
}
```

GeoJSON coordinates are **[longitude, latitude]** in WGS84, not pixel coordinates. Territory features use `Polygon` or `MultiPolygon` geometry and may have a six-digit hex `color` property, such as `"#b31f34"`. Close each polygon ring by repeating its first coordinate at the end. Names and descriptions are displayed as plain text, not interpreted as HTML.

The example option and its loading block in `map.js` can be removed together; also remove `examplesToggle` and simplify `updateIndex()` to include every entry. This starter is a viewer, not a browser-based map editor; edit the data files to save changes.

For a completely invented geography, replace `data/land.geojson` with your own geographic GeoJSON. A hand-drawn image map needs a separate Leaflet `L.CRS.Simple` / `L.imageOverlay` setup and pixel-based coordinates; it is not a drop-in replacement for this geographic atlas.

## Publish

Upload the repository contents to any static host; the publish directory is the repository root and there is no build command. All local asset and data URLs are relative, so the template also works in a subdirectory.

This repository's demo is published with GitHub Pages from `main` at `/ (root)`. Updates pushed to `main` deploy automatically. The `.nojekyll` file tells Pages to serve the static files directly.

For your own copy: in **Settings → Pages**, choose **Deploy from a branch**, select `main`, and select `/ (root)`. The expected project URL is `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Enable Pages separately for each new repository; hosting settings are not copied with the template.

Before sharing, replace the placeholder content, check your links, set the page description, and add your own canonical and social-preview metadata once your public domain is known.

## Licensing and provenance

- Template code and included original SVG placeholders: [MIT](LICENSE), copyright 2026 Vincent De Nil.
- Leaflet 1.9.4: BSD 2-Clause; its license is preserved in [vendor/leaflet-LICENSE](vendor/leaflet-LICENSE).
- Natural Earth geography: public domain. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The layout and palette were adapted from [`VincentDN/americankingdoms-projectsite`](https://github.com/VincentDN/americankingdoms-projectsite), commit `14045e3f44ba50e7409750e3c66c566c50be542c`. The original site's content and assets are not relicensed by this template. Keep the MIT copyright and permission notice in copies or substantial portions of the template, and retain the Leaflet notices when distributing it. You may replace the visible template credit in the footer.
