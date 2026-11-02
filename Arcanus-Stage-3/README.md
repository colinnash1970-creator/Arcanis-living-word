# Arcanus Stage 3 — Canon and Living World

Open `index.html` in a browser. No installation, server or internet is needed. Keep the folder together; if using the ZIP, extract it first.

Choose an A.F. year or use the boundary buttons. Search the original 69 canon records below the state panel. “Export state” downloads a derived snapshot; it does not edit the database. The source explorer remains an all-time reference, so its records can mention events later than the selected year.

“Open connected Kaddinghall simulator” opens the existing v1.9.3 town with its canon state connected to the town calendar. Use its World controls to import a previous save. Stage 3 has a separate autosave key (`arcanus-kaddinghall-stage3`) so the old release's saved town is not overwritten. Export saves for backups and transfers; browser storage for local files varies by browser.

## What is canon

The v0.2 data is preserved exactly as parsed from the original explorer: 30 characters, 13 locations, 6 factions, 20 events and 29 relationships. The standalone v0.2 JSON was not located; the supplied JSON is recovered from the explorer's embedded database. Original files and SHA-256 source hashes are included in `originals/` and `SOURCE-MANIFEST.json`.

All 19 established, precisely dated events enter the historical event list at their listed year. Nine events also have explicit state effects in `canon-engine.js`. Events without a supported mechanical consequence remain historical entries; no economy, casualty, alliance or victory effects are invented.

Implemented effects:

| Source event | Derived facts |
|---|---|
| Unification, 0 | Council constituted |
| Elianora physically killed, 792 | Physical state recorded separately from soul state |
| Sternia destroyed, 793 | Settlement destroyed; nexus survives weakened |
| Elianora soul sacrifice, 793 | Soul sacrificed |
| Alaric exiled, 803 | Alaric exiled; Malcolm becomes Temporary High Councillor |
| Alaric dies, 805 | Alaric dead |
| Aldren coronation, 805 | Secret coronation recorded |
| Council abolished, 818 | Institution unconstitutionally abolished |
| Iron Rule, 818 | Malcolm's Iron Rule begun |

Sternia's separate location field says `nexus_condition_after_793`; “weak, unguarded” is therefore applied from 794, without inventing an exact date within 793. Each fact retains its source record and Chronicle page references. Monarch selection uses the existing reign fields, with start inclusive and end exclusive, and does not imply death, public recognition or effective control.

## Time and uncertainty

This is an annual projection: an event is included throughout its listed year. It does not claim a month, day or order between events in the same year. The town retains its original provisional 30-day calendar and starts in 793. Canon state is derived on render as `793 + floor(world.month / 12)` and is recalculated after time changes, imports and reloads. Canon is never written into town economy saves.

Unknown prior states stay unknown: the app does not assert that pre-793 Sternia was intact, wealthy or populated. Last recorded facts persist in later views; persistence is not a forecast or evidence that no later change exists. The original Chronicle extraction is incomplete.

The planned Battle of Kaddinghall in 828 remains excluded even in 828 and later years. There is no button to promote planned lore to confirmed canon, and no battle outcome is generated. Existing experimental town residents and economics are inherited simulator content and are not added to the canon database. No new lore was authored for Stage 3.

## Files and tests

- `index.html`, `canon-data.js`, `canon-engine.js`, `canon-panel.js`: explorer and shared projection engine.
- `ARCANUS_Kielinstria_Canon_v0.2.json`: recovered source database, with original schema version retained.
- `Kaddinghall/`: connected v1.9.3 town.
- `originals/`: unmodified explorer and original town HTML/JavaScript for comparison.
- `tests.cjs`: 11 automated data, boundary, uncertainty, rewind and economy regression checks. Run `node tests.cjs` from this folder.
- `browser-tests.cjs`: 8 offline browser checks, including search, controls, export, mobile width, town save round-trip and year synchronization. Requires Playwright and Edge; set `PLAYWRIGHT_MODULE` and `EDGE_PATH` for another installation. Run `node browser-tests.cjs`.
- `TEST-RESULTS.json`, `BROWSER-TEST-RESULTS.json`: recorded passing results. The round-trip comparison excludes the town's normal refreshed `lastUpdated` timestamp.

Tests include twelve months of complete town-save parity against the original engine. Browser boundary tests set the calendar directly to isolate the integration; they do not claim a 35-year economy endurance test. No PDF re-extraction or independent full Chronicle audit was performed: the existing v0.2 records and page references are the authority for this release.
