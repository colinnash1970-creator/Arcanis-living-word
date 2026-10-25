# Validation

All checks passed against the user's supplied v1.6.2 baseline.

## Automated simulation checks (45)

1. Fresh population: 3,000 unique saved residents, 750 households, permanent timber assignments and stable reloads.
2. Upgrade: unchanged economy and retained old Chronicle entries.
3. Twelve monthly steps: exact food, population, treasury, farms and full timber-state equality with v1.6.2 after every step.
4. One manual year versus twelve monthly advances: matching economy and residents, without routine log flooding.
5. Hourly changes and minute-stamped scenes: no repeats on polling or reload.
6. Quiet overnight hours: no filler events.
7. Pause/reload/resume: frozen routine time, skipped absence, manual advances still work.
8. 400-day absence: exact baseline economy equality, resident totals reconcile, logs bounded and ledger retained.
9. UK autumn repeated hour and spring missing hour: no duplicate clock processing; midnight advances once.
10. Backward device date: no repeated economy days.
11. Save import round trip: preserved residents, household IDs and economy.
12. Invalid core, population and timber imports: rejected without changing the current world or stored save.
13. Empty and small towns under food shortages: valid households and resident totals after a year.
14. Synthetic legacy versions 1–7 without timber: successful migration and applicable elapsed-day catch-up.

15. All 750 household surnames are distinct and stable across reload/import; 10,000 generated surnames checked for uniqueness.
16. Existing v1.7 names migrate once while preserving resident identities, membership, economy and historical Chronicle entries.
17. Custom household and resident names are preserved during migration.

18. v1.7.1 upgrade: needs added without changing residents, corrected names, economic state or Chronicle history; reload is stable.
19. Food and seasonal warmth thresholds: computed without resource consumption.
20. Gradual wellbeing decline/recovery and idempotent daily assessments.
21. Care pressure follows age composition and household support capacity.
22. Persistent hardship counters, recovery resets and invalid needs import rejection.
23. Identical population/needs state for 60 days of daily visits, one offline catch-up and manual advances; old bulletins condensed.
24. Paused absences and resume leave household wellbeing unchanged.
25. Empty towns and newly created households receive valid needs states.

26. Layout upgrade and tab navigation leave an entire v1.8 saved world unchanged.

27. Mild food/fuel warnings alone keep otherwise supported households above the Settled threshold.
28. Reproduced three-month baseline collapse: 750 struggling before; none struggling after, with unchanged economic state and real fuel pressure still represented.
29. Household vulnerability changes cold exposure; combined severe shortages still cause hardship.
30. An affected v1.8.1 save upgrades without changing saved people or scores and recovers gradually under the revised balance.

31. Family migration preserves existing v1.8.2 people, household membership, wellbeing and history, and is stable on reload.
32. Plausible parent age gaps and unrecorded parentage where uncertain.
33. Newborn family links with unchanged baseline births, deaths and economic state.
34. Unrelated adults form a household, preserving names and occupations; a sole supporter stays with an older dependant.
35. Related adults are not paired; minors cannot form homes; monthly formation is limited.
36. Partner deaths leave surviving partners and children connected to memorial records.
37. Orphaned children move to adult care without inventing people or losing parentage.
38. Deceased children remain recorded for surviving parents.
39. Invalid family imports are rejected without changing the current world or save.
40. Six simulated years validate after each year and exactly match baseline economic state; new households form and survive reloads.
41. Manual and offline advancement produce identical new households and family state.
42. Shared guardians prevent pairing.

43. Fresh towns have eight default inn staff; upgrading v1.9 changes only excess default inn jobs and the migration marker, and reloads are stable.
44. Vacancies can be filled without exceeding the cap; the six-year progression check also verifies the cap after every year.
45. Custom workplaces and occupations are untouched by the correction.

## Browser checks

Ran the actual replacement files from a local HTTP server in headless Microsoft Edge (Chromium): startup/version, household paging and expanded state, pause persistence across reload, manual month advance, ledger expanded state, exported save download and re-import, farm construction, and 375-pixel mobile layout without horizontal overflow. Also checked the wellbeing summary, per-household outlook, Needs attention filter with no matches and with a simulated shortage, and the mobile household panel. No JavaScript page errors occurred. Inspected the rendered mobile page. JavaScript syntax check passed.

## Limits

No live GitHub Pages deployment or supplied historical save files were available. Migration tests used baseline-generated saves and synthetic legacy data. Existing service-worker and manifest files were not supplied; their offline caching behaviour was not validated. No changes were made to the live website.



Layout checks (v1.8.1): all four tabs at 320, 375, 768 and 1100 pixels with no horizontal overflow; exactly one visible tab panel; keyboard Home, End and arrow navigation; section retained on refresh; overview links; sticky controls; collapsed save controls; existing household and ledger interactions. Desktop and mobile layouts visually inspected.


Family browser checks (v1.9): resident partner/children labels and register totals; save export/import with family data; inspected the expanded household on mobile. The existing four-tab, keyboard, responsive-width, pause and control checks passed again.

Inn browser check (v1.9.1): Occupations across town shows Inn worker: 8. The full navigation, family, save and responsive layout checks passed again.
