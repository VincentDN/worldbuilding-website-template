# Worldbuilding website template

Planned development: [Europe 1914 Leaflet atlas roadmap](ROADMAP.md) — geographic historical borders, cities, roads, rivers, Wikipedia-based infoboxes, and Divided States-inspired map presentation.

A static worldbuilding site by Vincent De Nil, based on American Kingdoms. Includes a complete project homepage and a dedicated Leaflet atlas with two illustrative settings and a blank starter.

[Live demo](https://vincentdn.github.io/worldbuilding-website-template/) · [Europe 1936](https://vincentdn.github.io/worldbuilding-website-template/world-map/?map=europe) · [North America 1477](https://vincentdn.github.io/worldbuilding-website-template/world-map/?map=north-america)

**Template code is MIT. Example artwork and setting content retain their respective rights; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).** No build step, map API key, account, or package installation is required.

## Run locally

Serve the repository root with a static HTTP server, for example `python -m http.server 8000`, then open `http://localhost:8000`. Do not open the HTML as a `file://` URL: the atlas fetches local JSON data.

## Homepage features

- Responsive masthead and mobile navigation; cinematic artwork hero and lore introduction.
- Faction cards and featured wiki articles.
- Expandable gallery with keyboard/swipe lightbox, previous/next controls, and full-size artwork.
- Click-to-play project trailer and video carousel. YouTube is contacted only after activation.
- Two atlas preview cards linking to dedicated subpages.
- Merchandise and flag sections with image swaps and example shop links.
- Supporter artwork carousel, about section, team carousel, and discovery cards.
- Community/social links and local-only newsletter demonstration, including a dismissible timed invitation and footer trigger.
- Canonical/Open Graph metadata and JSON-LD for WebSite, WebPage, SoftwareSourceCode, and creator Vincent De Nil. Footer links include Vincent De Nil, The Divided States, and Flagmaker & Print.

American Kingdoms copy is replaced with explicit placeholder/example descriptions. Images, video titles, people, faction names, and outbound destinations remain identifiable as examples. The signup forms validate locally; they never transmit or store email addresses. Connect your own newsletter backend before accepting real subscriptions. No analytics or source-site subscription backend is included.

## Atlas features

| Feature | How it works |
| --- | --- |
| Dedicated atlas | `world-map/`, with scenario selection and a homepage link |
| Examples | Europe 1936, North America 1477, and an empty Earth starter |
| Map modes | Realms/alliance colors and individual culture/reference colors |
| Layers | Established realms, provisional regions, heraldic labels, cities, rivers, and the Europe reference image |
| Discovery | Search, accessible realm picker, clickable territories, hover previews, flags, descriptions, contributor, culture/alliance, wiki and optional shop links |
| Navigation | Reset, zoom/pan, county drill-down, subregion filtering, and return-state restoration |
| Mobile | Automatic lightweight data, canvas rendering, bounded bottom sheet, collision-limited labels; full/light override |
| Music | Optional original ambient loop, volume/play/pause, best-effort session continuity; first visits stay silent |
| Editor | Draw polygons, edit vertices, delete territories, edit metadata, import and export GeoJSON; unsaved-change warning |

Open `world-map/?map=blank&edit=1` to start drawing. `?detail=full` and `?detail=lite` override automatic detail selection; editing always uses full data. On light maps, cities and river overlays are omitted to reduce loading/rendering work.

### Example fidelity

**Europe 1936:** selectable outlines were traced from the supplied “Worldbuilding Map Base - Europe Kaiserreich & 1914” image. It is an illustrative scenario, not a verified canonical 1936 map. Flags are original generic placeholders; alliances, city positions, and river guides are examples. Rivers and colors embedded in the reference image remain visible when overlay layers are hidden; turn off **Reference image** to inspect only the editable layers.

**North America 1477:** uses the American Kingdoms source atlas's geography and example lore. Its source currently depicts 1377; the requested 1477 demo changes the displayed date rather than inventing a century of history. Modern cities and provisional boundaries remain geographic references. Massachusetts opens a separate map of fourteen modern Census counties with fictional titles and heraldry. Only that county dataset is fetched on its subpage.

## Customize

| File or folder | Purpose |
| --- | --- |
| `index.html` | Homepage copy, images, links, video embeds, page metadata, JSON-LD |
| `styles.css`, `site.js` | Homepage layout and interactions |
| `examples/american-kingdoms/assets/` | Replaceable source-site example artwork and media thumbnails |
| `assets/` | Original MIT SVG placeholders from the blank starter |
| `world-map/config.js` | Scenario names, dates, data locations, projections, bounds, alliance palettes, submap links |
| `world-map/atlas.js`, `atlas.css` | Shared atlas and editor behavior/style |
| `world-map/data/blank/` | Empty fictional territory/city layers and Natural Earth land |
| `world-map/data/europe/` | Traced image-space territories and example city/river overlays |
| `world-map/data/north-america/` | American Kingdoms full geography and lightweight bundle |
| `world-map/data/massachusetts/` | County example |
| `world-map/assets/` | Reference art, flags, preview, and original ambient audio |
| `world-map/music.js` | Audio source and session continuity |

To add a scenario, add an entry in `config.js`, supply its datasets, and add it to the scenario selector in `world-map/index.html` and the county page. Duplicate a homepage atlas card for its entry point. All assets use relative paths and work beneath a GitHub Pages repository URL. County HTML uses `<base href="../">` so shared assets resolve from `world-map/`.

### Data and editing

Each dataset is a GeoJSON FeatureCollection. Full scenarios load `land`, `lakes`, `rivers`, `territories`, and `cities` `.geojson` files. Lightweight scenarios load `lite.json`, containing `land`, `lakes`, and `territories` FeatureCollections. Update both full and light data when publishing edits. The North America light bundle is simplified source geometry; the smaller Europe/blank/county bundles use their corresponding geometry without the city/river layers.

Territory properties: `id`, `name`, `kind` (`country` or `region`), `canon` (established versus provisional), `color` (hex), `summary`, `culture`, `alliance`, `claim` (contributor), `wiki`, `flag`, `shield`, `flagShopUrl`, `label`, `labelMinZoom`, optional `submap` and `region`. Optional links only appear when configured; no shop URL is fabricated. Text is inserted as plain text and external links are restricted to HTTPS.

**Coordinate systems differ:** Earth/North America/county coordinates are WGS84 `[longitude, latitude]`. Europe uses Leaflet `L.CRS.Simple` image coordinates `[x, y]` on a 1600 × 1548 canvas, with the origin at bottom-left. Image-space files are not geographic GeoJSON. Exports include `coordinateSystem` and `scenario` metadata; imports reject an explicit coordinate-system mismatch. Keep rings closed and use Polygon/MultiPolygon geometry. Import appends territories and assigns fresh IDs where needed; it does not erase existing data.

The editor changes the current tab, not the repository. Export before leaving, review the download, replace the scenario's data, regenerate its light bundle, and commit it to publish. There is no server-side save endpoint.

## Deploy

GitHub Pages publishes this repository from `main`, `/ (root)`. Updates pushed to `main` deploy automatically. `.nojekyll` serves the static files directly.

For your own copy, enable **Settings → Pages → Deploy from a branch → main → / (root)**. Hosting settings are not copied with template files. Replace the canonical URL, social image URLs, JSON-LD IDs, example links, and visible project content before publishing your own world.

## Source and licensing

### SEO cleanup and optional creator credit

Each JSON-LD block has explicit HTML comments for users and their agents. When adapting a copy, remove unrelated example links to Vincent's other projects from the schema and footer, replace the demo identity and URLs, and preserve accurate licensing provenance. [AGENTS.md](AGENTS.md) makes this guidance discoverable to coding agents.

Agents should ask whether the user would like to retain a small link to [vincentdenil.com](https://vincentdenil.com/) and structured-data credit for Vincent De Nil as the original template developer. This public credit is appreciated but optional under MIT. If accepted, keep the Person entity and truthful author/creator attribution for the original template; do not identify Vincent as founder or developer of the downstream user's project. Founder relationships are appropriate only for accurately identified organizations he actually founded. If declined, remove the optional public credit without asking again; retain the required MIT copyright and license notice.

Adapted from [VincentDN/americankingdoms-projectsite](https://github.com/VincentDN/americankingdoms-projectsite), source commit `14045e3f44ba50e7409750e3c66c566c50be542c`. See [LICENSE](LICENSE) for code licensing and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for dependency and example-content notices.
