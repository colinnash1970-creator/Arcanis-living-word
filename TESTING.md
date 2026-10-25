# v1.9.3 validation - 25 October 2026

All 75 simulation/recovery cases and 13 browser cases passed. The accompanying JSON records each result; counts are cases, not individual assertions.

## Simulation coverage

The Node harness executes application functions with a controlled clock, in-memory storage and stub rendering. Browser checks below use the real HTML and JavaScript.

- Fresh initialization and year-long monthly validation for nine recovered/development versions, v1.7 through v1.9.3.
- Generated saves from each version upgrade, preserving existing economy, IDs, ages and membership; v1.7 surname correction remains intentional.
- Six years validated monthly, complete town economy parity against v1.7 and inn staff within the eight-person cap. Result: 3,132 residents, 758 households and 137 family memorials.
- Retained v1.9.2 regressions: debt save recovery; invalid-save atomicity; disabled failed-load mutations; exact original recovery bytes; post-migration failure rollback; backlog capacity/yield/fee checks; constrained yard; clock/pause/DST; family links and custom identities.
- Inn starts with zero accounts and a proprietor from existing staff.
- One day reconciles served visits, capacity, wages, overhead and private cash while town economy/population remain equal to v1.9.2.
- Duplicate day processing is a no-op; skipped inn days reject.
- Full-year inn accounts match across one manual year, twelve months, offline catch-up and daily visits.
- Paused absence preserves accounts; manual advancement still works while paused.
- Legacy offline catch-up runs before inn initialization. A mid-month upgrade records only the remaining days, with no invented earlier income/cost.
- Owner retirement replaces the proprietor using existing eligible workers and reduces capacity when a vacancy remains.
- No eligible proprietor produces no service/wages, with upkeep retained.
- Demand responds to population and wellbeing; capacity bounds served visits.
- Twenty-five months retain the latest 24 ledger rows and lifetime totals. Exactly 24 retained months still reconcile complete lifetime demand.
- Nine inn-specific malformed imports reject without storage changes: missing subsystem, duplicate staff, unknown proprietor, cash mismatch, negative sales, clock mismatch, missing closed month, corrupted wages and corrupted served count.
- Inn export/import and startup reload retain accounts. v1.9.2 rejects schema 11 rather than discarding the inn.

## Browser coverage

Microsoft Edge headless, isolated temporary profile, local HTTP server; no real user save used.

- Startup/version/population; tab and keyboard navigation; page selection after reload; household paging.
- Pause/reload/manual month; farm cost; actual save export and file-input import.
- Failed-load recovery controls and byte-for-byte recovery download; backup import restores controls; invalid stock rejects atomically.
- Treasury debt displays/reloads.
- Four tabs at widths 320, 375, 768 and 1100 without horizontal overflow.
- Inn proprietor name matches an existing resident; eight staff, capacity 48, monthly figures and expanded ledger display correctly.
- Schema-11 file missing inn rejects without overwriting storage.
- Schema-10 upgrade starts zero accounts, retains Treasury and reloads.
- No uncaught JavaScript page errors. Desktop and mobile inn screenshots visually inspected.

Fresh-town first month: 943 served visits, 141.45 gp revenue, 37.72 gp supplies, 72.00 gp wages, 6.00 gp upkeep, 25.73 gp closing cash. This is a deterministic test result, not a promised outcome for existing towns.

## Limits

No live deployment, actual historical user exports, installed offline assets or full closed-loop money simulation. Expected missing manifest/service-worker HTTP responses remain separate from JavaScript errors. Demand, capacities and costs are provisional; customer identity, lodging, supplier inventories and household wallets are not simulated. Historical ledger before upgrade is deliberately absent. Original archives remain unchanged.

