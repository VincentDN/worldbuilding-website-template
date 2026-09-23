# Europe 1914 Leaflet atlas roadmap

Status: planned. Updated 2026-09-23. This document tracks a fresh implementation; no feature below is complete unless checked.

## Goal

Replace the current traced pixel-map Europe example with a full geographic Leaflet atlas showing Europe in 1914: historical country borders, major cities, roads, rivers, and Wikipedia-based country infoboxes. Use the Divided States map's city-label behavior and overall visual character as a reference while retaining this template's scenario system and editor.

## Starting point

Verified baseline: `4dc6ebc47fc55b1b027a4445b563abfcf725f7df` on `main`. The previous cloud task reported commit `c46cfda`, but it was unavailable in the desktop clone and on GitHub during the recovery audit. Do not assume any of its changes or reported tests survived.

The existing Europe scenario is labeled **Kaiserreich / Europe 1936**. It uses `L.CRS.Simple`, a reference image, 29 traced territories, 10 example cities, and two schematic rivers. Its land and lake collections are empty. There is no road layer and no Wikipedia-linked Europe country data. The shared atlas already supplies search, country selection, layer controls, flags, a responsive details panel, editing, import/export, and full/light data loading.

## Working decisions

- Proposed historical snapshot: **1 January 1914**, before wartime territorial changes. Confirm this baseline during historical research and display the chosen date in the atlas and data metadata.
- Use WGS84 longitude/latitude GeoJSON with a geographic Leaflet projection. Compare a Europe-centered projection with Web Mercator before choosing; do not copy the US-centered projection unchanged.
- Cover Europe with sufficient surrounding geography for context. Record the final extent and handling of transcontinental empires, dependencies, disputed borders, and microstates.
- Retain the old illustrated scenario under an explicit legacy identity if kept. The primary Europe entry should ultimately open the historical atlas.
- Keep runtime data local and versioned. Country infoboxes must work without live Wikipedia requests.
- Develop on a dedicated feature branch (proposed name: `feature/europe-1914-leaflet`). Push each completed milestone and verify its remote commit so progress survives a lost session.

## 1. Establish sources and implementation branch

- [ ] Create the feature branch from current `main` and push the initial checkpoint.
- [ ] Build a country/territory checklist for the selected date and geographic extent.
- [ ] Evaluate historical boundary datasets for date fidelity, resolution, provenance, and redistribution rights. Do not substitute modern borders or infer historical polygons solely from Wikipedia prose.
- [ ] Record source URLs, versions/revisions, retrieval dates, licenses, transformations, and known approximations in a data source manifest.
- [ ] Choose the roads approach after checking historical coverage. Prefer documented period routes. If only modern data is practical, label it **Modern roads — geographic reference**, distinguish it from historical layers, and default it off. Do not present modern highways as 1914 roads.
- [ ] Record projection, extent, historical exceptions, and source decisions alongside the build scripts.

Completion: a documented historical baseline, usable sources, and a remotely saved branch.

## 2. Build geographic borders and physical layers

- [ ] Add a separate `world-map/data/europe-1914/` dataset and scenario configuration.
- [ ] Produce land, lakes, historical territories, and major rivers from geographic source data; remove dependence on the reference raster for this scenario.
- [ ] Add reproducible preparation scripts under `world-map/scripts/`, including clipping, simplification, source pinning/checksums, and full/light outputs.
- [ ] Validate geometry, closed rings, coordinate ranges, stable IDs, shared borders, islands, and unintended gaps/overlaps.
- [ ] Review sensitive historical boundaries against the dated source checklist, including the Balkans, Austria-Hungary, Ottoman Europe, and the western Russian Empire.
- [ ] Add accurate country labels and period flags with attribution; replace the generic example flags for this scenario.

Completion: a selectable, geographically aligned Europe 1914 base map with genuine river/lake geometry and documented limitations.

## 3. Adapt the Divided States map presentation

Inspected reference: [Divided States map source at `252282e`](https://github.com/VincentDN/dividedstates-projectsite/tree/252282e2cfd8998d1b10ed7688144c5e21acbe76/world-map).

| Reference implementation | Adaptation |
| --- | --- |
| `atlas.js`: `updateCapitalVisibility()` | Persistent city chips with zoom-dependent opacity and scale. The source uses zoom 5–8, opacity floor 0.35, and scale 0.55–1; recalibrate for Europe's projection and density. |
| `atlas.css`: `.capital-mark`, `.capital-dot` | Dark compact label backgrounds, diamond markers, uppercase type, and correctly sized inline-flex chips. |
| Separate land, water, territory, roads, and labels panes | Keep decorative geometry and labels from intercepting country clicks; ensure rivers remain visible above country fills. |
| Muted territory colors, dark sea, grain, vignette, blue rivers, dashed red roads | Create a coherent Europe theme; keep textures subtle and text readable on phones. |
| Responsive details panel and top-right zoom controls | Preserve usable map space and prevent controls overlapping the mobile infobox. |
| `scripts/build-mobile-map.py` and light bundle loader | Adapt simplification/loading techniques while preserving access to requested cities, roads, and rivers. |

- [ ] Check source licensing before copying code or assets and preserve required notices. Reimplement behavior where reuse rights are unclear.
- [ ] Add the visual theme and zoom-dependent city labels to the shared atlas through scenario options.
- [ ] Add capital/major-city tiers, historical display names, search aliases, and source records; use period population only when supported by a dated source.
- [ ] Add label priority and collision handling for dense Europe. The inspected Divided States city-label routine does not provide collision avoidance.
- [ ] Keep labels stable during zoom/pan, respect reduced motion, and ensure city overlays do not block country selection.
- [ ] Review desktop and mobile screenshots against the Divided States reference and tune typography, contrast, texture, and density.

Completion: recognizable Divided States-inspired presentation, readable major-city labels, and reliable country interaction.

## 4. Add roads and complete layer controls

- [ ] Generate the approved road dataset with provenance and historical/reference status.
- [ ] Add independent roads, rivers, cities, borders, and country-label controls; persist their state through navigation.
- [ ] Use zoom-dependent line weights and visibility so roads support orientation without overwhelming borders.
- [ ] Retain cities in lightweight mode. Simplify or load optional road/river layers on demand instead of silently removing them.

The Divided States `build-roads.py` selects **modern US major highways** from Natural Earth. Its clipping/simplification workflow is a reference, not a source of historical European routes.

Completion: all requested layers are available, legible, and accurately described on desktop and mobile.

## 5. Build Wikipedia-based country infoboxes

- [ ] Define structured local records keyed by territory ID: historical name, flag, capital(s), government, head of state at the snapshot date, short summary, and sources. Include population/area only with their date and geographic scope.
- [ ] Research the historical polity's Wikipedia article, rather than relying on the modern state's current infobox.
- [ ] Save source article URLs, revision IDs/permalinks, access dates, and attribution/license details for adapted text and flag media.
- [ ] Write concise summaries and identify omissions or uncertainty instead of inventing values.
- [ ] Extend the existing details panel with labeled fields and visible source links, safe text rendering, keyboard access, and a usable mobile layout.
- [ ] Verify every selectable country has a matching record and opens the correct infobox from both search and map selection.

Completion: locally available, sourced historical infoboxes for every country in scope.

## 6. Validate and publish

- [ ] Check historical data coverage, geometry, required properties, source references, and full/light consistency.
- [ ] Exercise search, country selection, labels across zoom levels, layer toggles, mobile taps, infobox scrolling, reset, and direct scenario links.
- [ ] Verify editor/export/import coordinate metadata for the new geographic scenario; check North America, Massachusetts, blank, and retained legacy Europe for regressions.
- [ ] Test cold loading, missing optional layers, and constrained mobile rendering. Record transfer sizes and interaction measurements, then set budgets from the first working dataset.
- [ ] Update homepage map cards, scenario selector, README, source manifest, and third-party notices to accurately describe Europe 1914 and any road limitations.
- [ ] Review the complete branch diff and validation evidence, merge to `main`, and verify the remote SHA and GitHub Pages result.

Completion: the published map contains geographic 1914 borders, major cities with readable zoom-aware labels, roads with explicit provenance, real rivers, and sourced country infoboxes. No completion claim depends on an unpushed local commit.

## Next action

Start milestone 1: establish the feature branch, historical boundary sources, and road-data feasibility. Update this checklist and record the remote checkpoint after each milestone.
