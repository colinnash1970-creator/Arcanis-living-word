# Calendar integration update

The connected Kaddinghall town now uses the shared ../Calendar module and schema-12 manual calendar saves. Upload Calendar, the root service worker/manifest, and the changed Stage 5 files together. See [the integration guide](../CALENDAR-INTEGRATION.md). Canon and source records are unchanged.

The clock/save notes in the older release record below are superseded by that guide.

---

# Arcanus Stage 5 — Volume II canon expansion

Open index.html to explore the expanded database. World foundations explains the Keys, lattice and setting rules. Open questions keeps unresolved material visible. History now separates precise annual events from undated and approximate reference history. The searchable explorer has category and canon-status filters.

## Upload to GitHub

Extract Arcanus-Stage-5.zip. On the repository's main upload page, upload the whole Arcanus-Stage-5 folder alongside Stage 4, keeping all files and subfolders together. Commit the upload. Once GitHub Pages publishes, open:
https://colinnash1970-creator.github.io/Arcanis-living-word/Arcanus-Stage-5/

No upload has been made automatically. Earlier stages remain available.

## Source and preservation

Volume II, The Foundations of Creation, was inspected in the complete 103-page Grand Chronicle: combined PDF pages 11–21, corresponding to Volume II pages 1–11. Text was extracted and the substantive pages 13–20 were visually checked. This release expands the existing v0.2 extraction, not all twelve volumes.

All 69 original records and their existing fields are retained. Eight receive additional, separately sourced reference notes. The original 29 relationships are retained, and the explicitly stated twin relationship between Kielinya and Danel adds one. Malcolm’s Brightblade birth name, later Darkbane name and royal succession distinctions are preserved.

The active database is ARCANUS_Canon_v0.3.json. The v0.2 JSON is retained as an unchanged baseline. VOLUME-II-AUDIT.json records additions, source pages, source hash and counts. VOLUME-II-REVIEW.html is the readable audit, also supplied as Markdown. Existing source copies and their manifest remain in the package.

## Dates and open questions

No automatic world-state effects were added. The original precisely dated events already cover the source’s established 0 and 793 A.F. events. Newly added events are undated, approximate, planned or unresolved. Sula’s approximately 10,000 and 9,994 B.F. dates remain approximate. The seven-years-per-Arcanium-day relationship is a setting reference, not a replacement for the town clock.

No direct contradiction requiring a change to an existing v0.2 field was found in the reviewed material. The main unresolved issue is the completion/play status of the 793–828 reconstruction sequence. Its stated facts are retained, but it is not counted as completed history. Other open items are deliberate source limits, not errors to fill with invented lore.

The unresolved sequence is available as a reference; no completed-history effect is inferred. Arcanium time is not simulated by changing the town calendar. No new economic, battle, divine or lattice-damage mechanics are invented. Source assertions without dates remain all-time reference notes and are visibly labelled.

## Town saves

The town engine is unchanged from Stage 4. Stage 5 uses the same arcanus-kaddinghall-stage3 autosave key as Stages 3 and 4. On the same GitHub Pages origin these versions share one town save. Export a backup before switching, and avoid running multiple town versions simultaneously. The original root simulator's arcanus-kaddinghall save remains separate; use export/import to transfer it. Local-file storage varies by browser.

## Tests

- node tests.cjs: 11 baseline and town-economy checks.
- node volume2-tests.cjs: 11 source-preservation, date-precision, reference and expansion checks.
- node browser-tests.cjs: 16 browser checks. Requires Playwright and Edge; set PLAYWRIGHT_MODULE and EDGE_PATH for other installations.

All 38 passed. Results are in TEST-RESULTS.json, VOLUME-II-TEST-RESULTS.json and BROWSER-TEST-RESULTS.json. Screenshots document the mobile overview, foundations and review sections. Browser boundary tests isolate calendar rendering; they are not multi-decade economic endurance tests.

Stage 5 currently covers the Volume II increment. Volumes III–XII are not yet extracted.
