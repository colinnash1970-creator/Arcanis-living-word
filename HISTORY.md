# Kaddinghall v1.9.1 — Inn Staffing Correction

Built from the supplied `app.js` and `index.html` v1.6.2 files. Replace both files together. No build step or extra JavaScript dependencies are needed.

## New in v1.9.1 — inn staffing correction

The old placeholder job list assigned roughly one in ten working adults to the single generic town inn, producing the reported 149 staff. This was not based on actual establishments or customer demand.

The generic inn now has a **provisional maximum of eight staff**. A new town assigns up to eight, and future job assignments respect that limit. On first upgrade, the eight default inn workers with the lowest resident IDs keep their jobs; surplus default inn workers become Labourers at Town works. No residents are removed, no wages are charged, and names, ages, household membership, family links, wellbeing and economic state are retained. Custom occupations/workplaces are untouched. The correction is saved and does not repeat on reload.

Eight is a temporary design assumption, not a canon staffing figure. Individual named inns, owners, staffing plans and trading remain future work. Other non-timber occupations still represent broad sectors. There is no new save schema; replace both files and keep your existing save.

## New in v1.9 — families and new homes

- Open **Population**, then a household. Each resident now shows recorded parents, partner, children and guardians. Children in another household and deceased family members are labelled. A Family register summary sits beside the household list.
- Existing households gain provisional family links once. Parents must be at least 18 years older than a child; initial parent gaps above 50 years are left unassigned. Adult partners are seeded only where their ages are reasonably close. These are simulation assumptions, not recovered history. Existing names, ages, occupations, homes, wellbeing and Chronicle text are preserved on upgrade. No past weddings or birth dates are invented.
- Newborns join family records using the existing monthly births. They gain recorded parents where appropriate, otherwise available guardians. Existing deaths update surviving partners and preserve referenced family memorials. Children without resident parents can join known family or an adult guardian; no adults are invented if none remain.
- Grown children become eligible to establish independent homes between ages 20 and 24 (with a 45-year upper limit). They may pair with an unrelated eligible adult or move alone. Shared ancestors, guardians and original households prevent pairing. A move cannot leave young or older dependants without an adult supporter. People caring for minors do not leave through this process.
- At most two new homes form per month. Residents keep their personal names and jobs; the new household is named for its founders and gets a distinct address. Related household branches can naturally share surnames; this is not the old repeating-name generator. A new home arrangement does not represent a charged building project.
- Family updates are grouped into at most one extra monthly Chronicle entry. Household needs follow the new membership. New homes inherit the founders' average wellbeing rather than resetting everyone to a happy score.

**No reset needed.** Back up your save, then replace both files. The existing layout, clock, wellbeing balance and authoritative monthly population/food/timber calculations are retained. Save schema 10 stores the new links and compact, referenced memorials.

**This takes time:** starting children are under adulthood, so new households normally appear after several simulated years, not immediately after upgrading. The +1 Year control can explore that progression, but also advances the whole economy. Newborns and bereavement update family records from the next monthly cycle.

Migration does not assign parentage to existing adults with unknown history. Dating, courtship, divorce, remarriage, inheritance, housing costs and individual purchasing are not simulated in this version. Individually named shops/inns and further career progression remain future work.

## New in v1.8.2 — wellbeing balance fix

Reproduced the reported early-town decline: three manual month advances from a fresh v1.8.1 town put all 750 households in the Struggling band. The flat food-reserve penalty alone set the wellbeing target below Settled, and winter firewood backorders compounded it.

Low food reserves now apply a mild 5-point target penalty rather than 22. Low fuel buffers apply 2 points, or 5 for households with young children or older residents. Serious food shortage risk still applies 35 points; cold-season fuel backorders apply 12 points, or 25 for vulnerable households. Care pressure remains unchanged. This gives different households different cold exposure without introducing random happiness.

In the reproduced three-month test the fix leaves 395 households settled and none struggling; other households still feel recent fuel pressure. Economic state exactly matches the previous version. This is a balance correction, not a promise that shortages can never affect the whole town.

**Keep your save.** Scores, people, names and history are retained on upgrade. Existing low wellbeing recovers gradually (at most one point per Arcanus day) when conditions allow; it will not jump immediately on installation. In the affected baseline save, more than 700 households recovered to Settled after 32 further simulated days. Results depend on the state of your town. Manual advances can move that time forward, but also advance the existing economy as usual.

The layout and save format remain unchanged. No extra resources, money or population changes are introduced.

## New in v1.8.1 — page organisation

- **Overview:** town totals, household wellbeing, food outlook and the three latest Chronicle entries.
- **Population:** wellbeing and occupations alongside the household register on larger screens; stacked panels on phones.
- **Businesses:** timber businesses, sawmills and their monthly ledger.
- **Chronicle:** the latest 20 entries in a dedicated view.
- Clock, Pause/Resume, Controls and the four tabs stay accessible while scrolling.
- **Controls** opens manual time advances, farm construction and save import/export. Reset is tucked under Start over.
- Longer explanations are collapsed. Tabs support arrow keys, Home and End; the selected section remains selected after refreshing its address.

This is a presentation-only update. The v1.8 population, wellbeing, economy and clock logic are unchanged, and the save format remains version 9. No reset or new migration is needed for v1.8 saves.

## New in v1.8

- Each household now saves a food outlook, warmth outlook, care pressure, wellbeing score, daily trend and consecutive days of hardship.
- A summary shows average wellbeing and how many households are settled, struggling or under care pressure. Choose **Needs attention** to find households with a reserve warning, care pressure or wellbeing below 65.
- Food security reflects existing town food reserves: at least two months is secure; one to two months is low; below one month is shortage risk. This is an outlook, not an individual pantry inventory.
- Warmth uses saleable seasoned firewood, existing firewood backorders and estimated seasonal demand. Unseasoned wood, construction timber and the municipal emergency reserve are excluded. Cold months raise buffer requirements, especially for households with young children or older residents.
- Care pressure compares children and older residents with potential adult support in the same household. No parent/partner relationships or health diagnoses are inferred.
- Wellbeing begins at 70/100 on upgrade. It trends toward household conditions daily, falls faster under severe pressure and recovers by at most one point per day. Settled is 65 or more; under strain is 35–64; struggling is below 35. There is no invented pre-upgrade hardship history.
- Household status changes produce at most one additional daily Chronicle bulletin. The existing evening scene now reflects household conditions. Older catch-up bulletins and manual advances are condensed.

No additional food, wood, wages, Treasury charges or deaths are generated by this layer. It reads the established economy. Pause/resume and daily catch-up apply to wellbeing too. Existing people, names, occupations, household membership and historical Chronicle entries survive the upgrade. **No reset is required.**

Family relationships and new households were added in v1.9; further career progression and individually simulated shops/inns remain future work.

## Household name correction (v1.7.1)

The original generator repeated 20 surnames. All 750 starting households now receive distinct surnames. Existing v1.7 saves are corrected once, including matching resident surnames, without changing IDs, ages, jobs, addresses, household membership or economy. Custom names and historical Chronicle text are preserved. No reset is needed.

## What changed

- Each resident has a saved ID, name, age, household, occupation and workplace. A new 3,000-person town begins with 750 households; existing towns retain their actual population. Browse ten households per page.
- Residents sleep, eat, work, attend school, run errands and spend time at home. Every seventh town day is a rest day, with essential morning duties. Routines freeze while paused.
- Existing monthly births and deaths update the register, and residents age each month. Names and jobs persist through reloads, exports and imports. Identities are generated only when upgrading or starting a new town.
- New Chronicle entries have Arcanus dates and UK hour/minute stamps. Hourly checks log changes in town activity; two selected household scenes occur at varying minutes each day. Quiet hours generate no filler.
- The Chronicle retains at most 150 entries and displays the newest 20. Existing unstamped entries remain as recorded until they age out normally. Long absences replay only the previous and current day's routines; all elapsed economy days and population months still run. Manual advances condense routine stories.
- The existing food costs, yields, population totals, timber production, sales, orders, cash and ledgers remain authoritative. Resident activities do not charge additional wages or consume extra food or timber.

## Deploy to GitHub Pages

1. Export your current save as a backup.
2. Upload **app.js** and **index.html** into the same published repository folder as the existing files, replacing both. Keep your existing manifest, service worker and other assets.
3. Commit the replacements and wait for your Pages deployment to finish. Open the same site address in the same browser profile; the existing save upgrades automatically.
4. Refresh and check that the page header says **Running v1.9.1 · Inn Staffing Correction**. The HTML requests a new versioned script URL.

If an old offline service worker still serves v1.6.2, update its cache version/precache list or unregister that site's service worker in browser developer tools, then reload online. Do not clear site storage: that contains your save. The supplied baseline did not include `sw.js` or the manifest, so their caching rules were not tested or changed.

The save key remains `arcanus-kaddinghall`. New saves use schema version 10. Export/import moves them between devices. Keep your pre-upgrade export if you might roll back to v1.6.2, v1.7.x or v1.8.x, which cannot import version 10 saves.

## Time and simulation assumptions

UK midnight advances the world date; 30-day months and existing monthly economy rules are retained. Repeated autumn DST minutes are not logged twice. Pause skips elapsed real time when resumed. Manual month/year buttons still work while paused, as before.

Households, names, occupations and scenes are provisional simulation details, not campaign canon. Ageing is monthly; mortality selects older residents first. The household register models partnerships and family links; migration, inheritance and individual purchasing are not yet simulated. Permanent timber assignments reflect the initial staff counts; they do not replace the existing payroll or seasonal-worker calculations.

See TESTING.md for checks performed. Files are prepared for deployment; no repository or live site was modified.



