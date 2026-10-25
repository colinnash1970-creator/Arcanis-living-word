# Kaddinghall v1.9.3 - The Town Inn

The generic town inn now has a provisional owner-manager, its existing staff, customer demand, private cash and a monthly ledger. Prepared 25 October 2026 from v1.9.2 in a separate copy. No live site or real user save was changed.

## Use it

Open Businesses to see The town inn and its ledger. The owner-manager is one of the existing inn workers, included within the eight-person cap. No person, name, occupation or extra employee is invented. The proprietor is provisional, not an established canon owner.

Accounts begin at zero when an older save is first opened in this version, after its ordinary elapsed-time catch-up. No earlier revenue or bills are reconstructed. Results accumulate with simulated days. The current month and latest 24 completed months are shown; the first month can be partial. The monthly Chronicle adds one inn summary.

The clock, pause/resume and manual time controls also apply to the inn. A manual month advances the whole world, not just this business.

## Provisional trading model

- Capacity: six visits per staff member per day, up to 48 with eight workers.
- Revenue: 15 cp per served visit. Trade supplies: 4 cp per served visit.
- Wages: 30 cp per working staff member each trading day, including the owner-manager. Upkeep: 20 cp per day, even when trading is paused for lack of a proprietor. 100 cp = 1 gp.
- Demand: rounded population x 0.012 x seasonal factor x rest-day factor x wellbeing factor. Seasonal factors are 0.85, 1.00, 1.15 and 1.00; rest days use 1.20, other days 1.00; wellbeing factor is 0.60 + average household wellbeing / 200. Empty towns have zero demand.
- Served visits are limited by demand and available staff capacity. Other visits are counted as turned away, not carried forward as orders.
- Existing inn staff aged 16-64 are eligible for the roster; an owner-manager must be at least 18. The current eligible proprietor stays; if they retire or disappear, the lowest-ID eligible adult worker takes over provisionally. No ownership wealth or inheritance transfer is charged. If none qualifies, service and wages pause, but upkeep continues.
- Cash stays in the private business and may become debt. The model adds no loans, interest, bankruptcy or personal profit withdrawals.

These are simulation assumptions, not recovered historical rates. There are no lodging rooms or individual guest identities yet. Daily staffing allowances are not hourly timesheets; existing narrative routines remain unchanged.

## No duplicate town charges

Visits represent drinks and hospitality, not extra household staple meals. Supply costs represent external trade consumables. The inn's private cash records its own revenue, supplies, wages and upkeep. The town Treasury, food stock and timber accounts receive no additional deduction or income from the inn. Existing residents' daily routines did not charge payroll, so the new inn wages are recorded once.

Customer wallets, supplier balances and employee personal cash are outside the present model. This is not yet a closed money-flow simulation. The six-year regression confirms the existing town economy remains unchanged while the inn accounts run alongside it.

## Install and keep your backup

1. Export your v1.9.2 save and keep it separately for rollback.
2. Replace app.js and index.html together in the same site folder.
3. Keep existing service-worker, manifest and other assets. Do not clear browser storage to refresh the app.
4. Reload the same address/profile and confirm Running v1.9.3. Open Businesses to inspect the inn.
5. Confirm your existing people and town values, then export a new save.

The save key remains arcanus-kaddinghall. Save schema is now 11 because inn accounts must be preserved. Versions through v1.9.2 reject schema 11; do not use a new save to roll back. Generated saves from every recovered version v1.7-v1.9.2 were tested; actual historical user exports were not available. Modern saves missing or inconsistent inn accounts are rejected instead of silently reset.

Offline caching remains unverified because the deployed manifest and service worker were not supplied. No live deployment was performed. The original recovery archives and v1.9.2 package remain unchanged.

See TESTING.md and the validation ZIP for evidence. All rates and identities remain provisional; existing Arcanus canon is not changed.
