# T-2026-11-18-HOLIDAY — Holiday HQ Herdr layout v1.00

- status: done
- requested by: 龍哥 (Discord #總管)
- scope: a Christmas and New Year Herdr layout, written up as `~/.config/herdr-app/AGENTS.md`
  describes: the layout, its mods, RECIPE.md and preview.png in one public repo with the topic
  `herdr-layout`.

## Decisions (from 龍哥)
- Panes are glass: 50% transparent, dark tint (#03060580, terminal_opacity 0).
- The left sidebar is the same 50% dark glass.
- Fairy lights in many colours, not all red. When an agent is blocked the colours stay and the
  lights blink fast.
- Release as version 1.00.

## Evidence
- `herdr-app check` passed for holiday-brand, holiday-lights and holiday-status.
- `herdr-app status` showed layout "holiday" with no errors, in an isolated test window
  (HERDR_APP_HOME = a scratch folder, HC_SESSION=holiday). The user's own window and sessions
  were not changed.
- Pixel sampling of the screenshots: the sidebar and panes follow the background's gradient
  (glass), and the light strip shows 9 hue groups.
- Countdown checked with node for Nov 18, Dec 24, Dec 26, Dec 31 and Jan 3.
