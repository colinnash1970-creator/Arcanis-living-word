# Stage 4 — World overview

Open index.html, choose a year and select Crown & Council, Places, People, Planned events or History. Places and People include name filters. The original searchable records, readable details and JSON state export remain available below the overview.

## Put it on GitHub

Extract Arcanus-Stage-4.zip. Upload the entire Arcanus-Stage-4 folder to the root of colinnash1970-creator/Arcanis-living-word, alongside Arcanus-Stage-3. Commit the upload. Once GitHub Pages publishes, open:
https://colinnash1970-creator.github.io/Arcanis-living-word/Arcanus-Stage-4/

Keep the files and subfolders together. This release has not been uploaded automatically. The existing Stage 3 and main simulator pages remain available.

## Canon and time

The v0.2 database and Stage 3 projection engine are unchanged. No new lore, family relationships or economic effects were added. Sternia changes in 793; the council changes in 818. The planned 828 battle remains unplayed, even after its proposed year.

Conditions follow the selected year. Unknown conditions say Not recorded. Family links, titles, aliases and geography without effective dates appear in explicitly labelled all-time reference sections. An upcoming recorded birth is marked Not yet born. No death, survival, parentage or effective political power is inferred from succession. An appointment is a recorded event, not a claim of indefinite office-holding.

The projection is annual: it does not invent months, days or an order within one year. Last documented facts persist until a documented change. Persistence is not a forecast, and the extraction remains incomplete. Source references identify pages of the existing Grand Chronicle extraction; no new PDF audit was performed.

## Connected town and saves

The included Kaddinghall simulator displays the same overview using its own calendar. Its mechanics are unchanged. The town retains the Stage 3 autosave key, arcanus-kaddinghall-stage3. When hosted on the same GitHub Pages origin, Stage 3 and Stage 4 share that town save. Avoid running both town versions simultaneously. Export a backup before switching. The main simulator's arcanus-kaddinghall save stays separate; use its Export save and the new town's Import save to transfer it. Local-file browser storage can vary, so use exports for reliable backups.

## Verification

11 core checks and 9 browser checks passed. Tests cover date boundaries and rewind, planned-event exclusion, source preservation, 12-month economic parity, readable records, filters, birth dates, family references, export, invalid input, mobile layouts and town-calendar integration.

Run node tests.cjs for core tests. Browser tests use Playwright and Edge: run node browser-tests.cjs, setting PLAYWRIGHT_MODULE and EDGE_PATH if needed. Results are saved in TEST-RESULTS.json and BROWSER-TEST-RESULTS.json. Browser year-boundary checks isolate calendar rendering; they are not multi-decade economic endurance tests.

Original source copies and their manifest remain included. The standalone v0.2 JSON was recovered exactly from the original explorer's embedded database.
