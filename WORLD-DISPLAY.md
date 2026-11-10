# Main world screen — calendar display

Open **index.html** to open the Arcanus Living World Simulator. Kaddinghall is a section within the world, not the landing page.

The top calendar displays exactly this order:

1. Simulation time in 24-hour HH:MM.
2. Arcanian Watch.
3. Aeloria's current lunar phase.
4. Arcanian weekday.
5. Full date: day number, named month and AF year.

All five fields read from the same saved simulation calendar. A step from either the world screen or its embedded Kaddinghall town refreshes the display. Campaign time remains manual; “automatic update” means the display reacts to simulation changes, not that real-world time advances the campaign.

The world screen uses the existing Stage 5 town save (`arcanus-kaddinghall-stage3`). It retains that save's current date rather than resetting it to 828 AF. The original root town is also retained under `Kaddinghall/`, with its original separate save key, for compatibility. The two old town save keys are not silently merged.

The calendar engine, astronomy reference data and canonical event data are byte-for-byte unchanged from v1.10.0. The new code is presentation and a parent/town message bridge. Canon history remains an annual view at the simulation year.

The display responds to time actions, imports and other town actions that refresh its calendar. Independent browser tabs do not continuously synchronize; use one world simulator tab at a time. The existing astronomical approximations, provisional UTC alignment and 30-day economic accounting boundaries still apply.

## Installation

For local use, extract the complete ZIP and open `index.html`. Keep all folders together. For GitHub, upload the contents of the folder to the repository root, preserving paths; the main site's `index.html` is now the world screen. Export your existing save before deploying. No upload or live deployment has been performed here.

## Verification

Run `node --test world-display.test.cjs` for field order, live refresh, midnight/year rollover, lunar phase changes, shared time-control routing, message isolation and asset links. Calendar engine checks remain in `Calendar/engine.test.js`. Browser visual inspection remains unavailable because the available browser tool blocks local-file URLs; these are logic/integration checks, not a claim of visual QA.
