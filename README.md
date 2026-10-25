# Kaddinghall v1.9.2 - Save Recovery & Timber Repair

Prepared 25 October 2026 from recovered v1.9.1. This is a replacement-file package, not a deployment. Original archives remain unchanged.

## Changes

- Negative Treasury balances remain recorded as debt and can be saved/reloaded. No debt is erased or money invented. Food imports and farm construction require available funds; ordinary income offsets debt. Overview explains the negative balance. No interest, loan or bankruptcy system is added.
- Failed loads disable time/building controls and open recovery controls. Export downloads the original serialized data, including malformed JSON. A valid backup import restores controls; Reset requires confirmation.
- Startup/import catch-up cannot autosave a partially migrated candidate. Validation completes before persistence; rejected imports restore the previous world and leave storage untouched.
- Modern saves require population, clock, timber, orders, ledger and (after timber has started) month-snapshot data. Physical stocks, prices, demand, staffing and capacity receive stricter validation. Business cash and Treasury may be negative; physical resources may not.
- Each business mills its raw-log backlog before new cutting. Old saves do not distinguish ordinary and specialist backlog, so it conservatively uses the manual mill, which supports both types. Capacity, 90% yield and actual fees apply once. New cutting retains the 80/20 split. Yard space reserves raw input volume to avoid overfilling when mills are constrained.

The standard six-year run retained exactly the same date, population totals, food, Treasury, farms and full timber state as v1.7 at every monthly checkpoint. Existing backlog or constrained yards can now produce intentionally different results. Family rules, wellbeing and the eight-worker inn cap are unchanged.

## Install

1. Export your existing save and keep the backup separately.
2. Replace app.js and index.html together in the existing site folder. No build step or extra runtime dependency is needed.
3. Keep existing service-worker, manifest and other assets. This package does not supply or change them. Update their caches separately if needed; do not clear site storage to refresh the application.
4. Reload the same address in the same browser profile and confirm the running version is v1.9.2 - Save Recovery & Timber Repair (displayed with a middle dot).
5. Check your town and export a new save. If recovery mode appears, export the original data before importing a backup or resetting.

Different site addresses do not share browser saves: use Export/Import to move a town. No live site or real user save was modified during development.

## Compatibility

Save key: arcanus-kaddinghall. Schema remains 10: no extra persisted fields are required. Negative gold already existed in the simulation; this release fixes validation to preserve it. Generated saves from every recovered version v1.7-v1.9.1 and v1.9.2 itself were tested. Actual historical exports were unavailable.

Versions before v1.9 reject schema 10. v1.9/v1.9.1 may reject negative-Treasury saves, even though they can generate them. Keep a pre-upgrade export for rollback. Incomplete/physically invalid modern saves are intentionally rejected instead of having missing economic data silently rebuilt.

## Evidence and limitations

See TESTING.md for this release's independent results and the separate validation ZIP for scripts, source snapshots and JSON results. HISTORY.md and HISTORICAL-TESTING.md preserve inherited documentation only.

Offline caching remains unverified. The recovered package references sw.js and manifest.webmanifest but includes neither; local tests received expected missing-file responses. Obtain the deployed assets before certifying offline behavior. No replacement cache strategy was invented.

No new shops, inn economics, individual spending, family features or canon changes are included.
