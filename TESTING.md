# v1.9.2 validation - 25 October 2026

51 simulation/recovery cases and 10 browser cases passed against the final source. Counts are harness cases, not individual assertions. Full results and source snapshots are in the separate validation ZIP.

## Simulation and recovery

The Node harness executes application source with controlled time and in-memory storage. Automatic startup/layout invocation is removed and rendering is stubbed. Startup, validation, import and simulation functions remain executable. Actual browser tests supplement this.

- Initialization and twelve monthly save validations for all eight versions v1.7 through v1.9.2.
- Generated one-month saves from every version upgrade to v1.9.2 preserving economy, IDs, ages and membership. Names compared from v1.7.1 onward; v1.7 surname correction is intentional.
- Six years, validated monthly, with complete economy parity against v1.7 and inn staff never above eight. Final town: 3,132 residents, 758 households, 137 retained memorials.
- One year equals twelve months; sixty-day offline, daily visits and manual advancement agree for economy and population/needs/families.
- Pause skips absence; manual advance works while paused; spring/autumn DST, midnight and backward date handling.
- Import round trip; inconsistent population rejected atomically.
- Initial populations 0, 1 and 5, zero Treasury/food: twelve months, gold -192 preserved, saves round-trip and reload.
- Thirteen invalid-save cases rejected without changes: missing timber, population, orders, ledger or snapshot; negative stock, raw logs, batch, demand, price or ledger income; zero mill capacity; fractional clock day.
- Failed startup preserves original bytes and blocks mutations. Recovery imports restore controls. Injected post-migration validation failure cannot commit caught-up data.
- Raw logs: 90% yield, actual fee charged once, capacity respected, constrained-mill backlog clears, raw inputs cannot overfill constrained yards.
- Debt cannot buy farms; family cycles/related partners rejected; orphan guardians and parental memorials validate; custom names/jobs retained.

## Browser

Headless Microsoft Edge with local HTTP server and isolated temporary profile. No real browser save used.

- Startup/version and rendered population.
- Tabs, Home/End keyboard navigation, selected tab after reload, household paging.
- Pause retained after reload; manual month; farm cost 150.
- Actual export download and file-input import round trip.
- Failed-load controls disabled and exact recovery download.
- Backup import restores controls/population.
- Negative stock file rejected without overwriting storage.
- Debt displayed and reloaded.
- All four tabs at 320, 375, 768 and 1100 pixels: no horizontal overflow, one visible panel.
- Zero uncaught JavaScript page errors. Desktop Overview/recovery and mobile household screenshots inspected.

JavaScript syntax passed. Original archive SHA-256 hashes rechecked during packaging.

## Limits

No actual historical exports, live deployment, manifest or service worker were supplied. Expected missing-file HTTP responses for those offline assets are not counted as JavaScript errors. Offline behavior is not certified. Tests verify specified behavior/preservation, not economic realism or all family scenarios. Automatic save repair, automatic backup slots and debt financing remain outside this release.
