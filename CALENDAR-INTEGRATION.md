# Arcanus calendar integration — v1.10.0

The canonical calendar now drives both the original Kaddinghall town and the connected Stage 5 town. This local update was prepared from your repository and matching attached v1.9.3 files. It has not been uploaded or deployed.

## Features

- The town header displays the named date, weekday, 24-hour Starhaven time and watch. Its calendar panel shows season, Aeloria, today's observances/birthdays and the UK reference time.
- Hour, watch, day, month and year controls advance the actual saved world. Month/year controls now use Gregorian-length calendar steps, with the day clamped to the destination month's last valid day where needed.
- Stage 5's canon view follows the calendar year. Its annual precision, unresolved history and planned battle remain unchanged.
- The full calendar browser opens at the town's date, with conversion tools and the searchable 58-record register. Exploring other dates there does not rewind the town or simulate its economy. Its exported exploration state is separate from a town save.
- Time advances only through deliberate controls. No timer, startup, import, focus or device clock adjustment advances the world.

## Install

1. Export your existing town save and retain it for rollback.
2. Upload **every file inside calendar-update** to the repository root, preserving folders and replacing matching files. Include the shared `Calendar/` folder and changed `Arcanus-Stage-5/` files alongside root `app.js`, `index.html`, `sw.js` and `manifest.webmanifest`. The two root files alone are no longer sufficient.
3. Commit and allow the repository's normal GitHub Pages publication to finish.
4. Reopen the same address and check **Running v1.10.0 · Arcanus Calendar**. Reload once more if an old service worker still controls the page. Do not clear browser storage.
5. Confirm population, treasury and businesses, then export a new town save. **Export pre-calendar backup** is available when a prior autosave was upgraded.

The root town address remains https://colinnash1970-creator.github.io/Arcanis-living-word/ and the Stage 5 town remains https://colinnash1970-creator.github.io/Arcanis-living-word/Arcanus-Stage-5/Kaddinghall/. No Pages configuration is changed. The separate full simulator ZIP contains the complete repository without Git metadata: extract and open `index.html` for local use.

## Save migration

Save schema is **12**. Storage keys stay `arcanus-kaddinghall` (root) and `arcanus-kaddinghall-stage3` (Stage 5). Stages 3/4 share Stage 5's key on the same origin: avoid opening older versions against this save. Older releases reject schema 12; rollback requires the old app and a pre-calendar save.

Before first replacing an existing autosave, its exact bytes are retained once under `<save-key>-before-calendar-v12`. If backup fails, loading stops without overwriting the old autosave; recovery export remains available. Failed imports leave the current world and storage intact.

Legacy saves preserve the displayed year/month/day and stored minute. Their year is `793 + floor(legacyMonth / 12)`; no campaign restart in 828 AF is invented. Fresh towns retain the 793 AF epoch and start at 00:00. A legacy Frostveil day absent from the Gregorian-length month is clamped; original day and adjustment are preserved in metadata and disclosed onscreen. Migration processes no elapsed offline time and replays no economic days.

The saved calendar anchor connects the new date to the existing simulated-day counter. Every subsequent crossed midnight advances both once. Inconsistent schema-12 dates, times, anchors or missing inn accounts reject rather than reset. Old Chronicle strings stay untouched; new entries use canonical dates and Starhaven time. Pre-anchor ledger references are labelled legacy accounting days instead of inventing precise historical dates.

## Economic compatibility boundary

Budgets, harvests, population ageing, household updates and financial ledgers retain **30-day accounting periods**. The old economic seasonal multipliers and work/rest schedules remain provisional model assumptions. They are not canonical months, astronomical seasons or weekday rules. This boundary is disclosed in the calendar panel.

A canonical year now runs 365/366 daily steps; twelve old accounting periods still mean 360 days. Equal elapsed simulation days retain identical economic outcomes. Migration does not recalculate balances or ages. Converting agriculture, ageing, rest schedules and account closing to canonical boundaries requires a separate economic-model migration.

## Canon and astronomy

The register preserves all 50 annual observances (5 ancient, 32 religious, 5 historical, 8 kingdom founding), The Hidden Dawn as a separate leap-only record, and 7 separate birthdays. Shared dates stay separate. Origin/birth years suppress premature recurrences; Sula's birth year remains unset.

`Calendar/canon.js` holds user-supplied calendar data. Its `ArcanusCalendarData` namespace avoids collision with Stage 5's existing `ArcanusCanon` projector. `astronomy.js` holds sourced reference data; `engine.js` is the pure calculation module; `town-calendar.js` connects it to saves and actions. Earlier stages, recovery archives and lore JSON are unchanged.

AF + 1198 determines Gregorian weekdays and leaps, including 0 AF = 1198 CE. Starhaven never uses DST. Its UTC offset remains unset canonically; UTC+0 is visibly provisional and configurable, along with northern/southern seasons.

Aeloria's constant 29.53059-day model is anchored to 18 January 2026 at 19:52 UTC. A constant period cannot match all variable Earth phase intervals, so actual 2026 Earth instants are shown separately in UK time. Mean illumination, historical back-projection and non-828 seasonal templates are explicitly approximate. No geography is invented. Sources: [AstroPixels](https://astropixels.com/ephemeris/moon/phases2001.html) and [US National Weather Service](https://www.weather.gov/dvn/Climate_Astronomical_Seasons).

## Verification

```
node --test Calendar/engine.test.js calendar-integration.test.cjs
node Arcanus-Stage-5/tests.cjs
node Arcanus-Stage-5/volume2-tests.cjs
```

Integration checks use generated saves in isolated memory, not your browser save. They cover both town versions, schema-11 migration, unchanged economic values, manual-only time, leap/year-0 boundaries, month/year stepping, daily/yearly equivalence, round-trips, invalid-import atomicity, exact backups and history-engine coexistence.

Browser interaction/layout and installed offline-cache verification remain unperformed: the browser tool blocks local-file URLs and the earlier localhost preview could not connect. The new service-worker cache includes the shared calendar and Stage 5 dependencies, but runtime installation is not claimed verified. The retained browser test source has an updated schema-12 date fixture; it was not run here. Previous release test results are historical evidence, not claims of new browser QA.
