---
name: Intellicar theme
version: 1.0.0
source: Intellicar's product style guide; standards from ui-ux-pro-max's design-system references and taste-skill's app-screens study (see Sources)
base: shadcn new-york (radix), neutral, CSS variables, Lucide icons
colors:
  light:
    background: oklch(0.98 0 none)          # #F9F9F9 canvas
    foreground: oklch(0.27 0 none)          # #333333 primary ink
    card: oklch(1 0 none)                   # #FFFFFF panels, popovers, table wraps
    card-foreground: oklch(0.27 0 none)
    popover: oklch(1 0 none)
    popover-foreground: oklch(0.27 0 none)
    primary: oklch(0.58 0.23 17)            # #E40046 Intellicar red (tenant brand)
    primary-foreground: oklch(1 0 none)     # white on red: 4.79:1
    primary-text: "#E40046"                 # red used as text/links on light surfaces: 4.79:1 on white
    secondary: oklch(0.97 0 none)           # #F5F5F5 secondary control fills
    secondary-foreground: oklch(0.27 0 none)
    muted: oklch(0.97 0 none)
    muted-foreground: oklch(0.51 0 none)    # #666666 secondary ink: 5.74:1 on white
    subtle-foreground: "#707070"            # tertiary ink (headers, meta): 4.95:1 on white
    accent: oklch(0.95 0.03 356.28)         # #FFE6EF rose wash: hover, selected, active nav (tenant brand)
    accent-foreground: "#7A0024"            # text on the rose wash: 9.62:1
    destructive: "#C23B12"                  # 5.35:1 on white
    destructive-foreground: oklch(1 0 none)
    border: oklch(0.92 0 none)              # #E5E5E5 hairlines and card edges (decorative)
    border-strong: "#D4D4D4"                # table header rule, the one heavier line in a block
    input: "#8F8F8F"                        # form-field border: 3.23:1 on white (WCAG 1.4.11)
    ring: oklch(0.58 0.23 17)               # focus ring, 4.79:1 on white
    sidebar: oklch(1 0 none)
    sidebar-primary: oklch(0.58 0.23 17)
    sidebar-accent: oklch(0.97 0 none)
    sidebar-border: oklch(0.92 0 none)
    status:                                 # pill pairs: bg / text, all >= 5.6:1
      success: { bg: "#E4F7EE", fg: "#156040" }
      warning: { bg: "#FEF3E2", fg: "#8A4B08" }
      pending: { bg: "#F5F0E6", fg: "#7A5A12" }
      danger: { bg: "#FDECEC", fg: "#9C1C1C" }
      info: { bg: "#EBEEFD", fg: "#2F3F9E" }
      neutral: { bg: "#F0F0F0", fg: "#4A4A4A" }
    chart:                                  # marks, all >= 3:1 on white
      chart-1: oklch(0.58 0.23 17)          # #E40046 primary series
      chart-2: "#2D9B6F"                    # jade
      chart-3: "#5B6EE4"                    # indigo
      chart-4: "#C48419"                    # gold
      chart-5: "#D65F2A"                    # orange, 3.80:1 on white
      grid: "#EDEDED"
      axis-text: "#707070"
  dark:
    background: oklch(0.19 0 none)          # #141414
    foreground: oklch(0.97 0 none)          # #F5F5F5
    card: oklch(0.25 0 none)                # #222222
    card-foreground: oklch(0.97 0 none)
    popover: oklch(0.25 0 none)
    popover-foreground: oklch(0.97 0 none)
    primary: oklch(0.58 0.23 17)            # same red for fills; white on it 4.79:1
    primary-foreground: oklch(1 0 none)
    primary-text: "#FF5C85"                 # red as text/links on dark: 6.25:1 on bg, 5.40:1 on card
    secondary: oklch(0.29 0 none)
    secondary-foreground: oklch(0.97 0 none)
    muted: oklch(0.29 0 none)
    muted-foreground: oklch(0.7 0 none)     # #AAAAAA 7.93:1 on bg
    subtle-foreground: "#9E9E9E"            # 6.88:1 on bg
    accent: oklch(0.26 0.07 357.56)         # #3A0F1E
    accent-foreground: oklch(0.97 0 none)   # 15.2:1 on accent
    destructive: "#FF7A5C"                  # as text 7.19:1 on bg
    destructive-foreground: "#141414"
    border: oklch(0.3 0 none)               # #333333 hairlines
    border-strong: "#444444"
    input: "#7A7A7A"                        # form-field border: >= 3:1 on card and bg
    ring: "#FF5C85"
    sidebar: oklch(0.22 0 none)
    sidebar-primary: oklch(0.58 0.23 17)
    sidebar-accent: oklch(0.29 0 none)
    sidebar-border: oklch(0.3 0 none)
    status:
      success: { bg: "#12321F", fg: "#7EE2B0" }
      warning: { bg: "#3A2608", fg: "#F6C177" }
      pending: { bg: "#2E2612", fg: "#E6C27A" }
      danger: { bg: "#3D1414", fg: "#FF9A9A" }
      info: { bg: "#1C2250", fg: "#A9B4FF" }
      neutral: { bg: "#2E2E2E", fg: "#D0D0D0" }
    chart:
      chart-1: "#FF5C85"
      chart-2: "#4CC496"
      chart-3: "#8A99F0"
      chart-4: "#E0A43A"
      chart-5: "#F08A5D"
      grid: "#2B2B2B"
      axis-text: "#9E9E9E"
  fixed:                                    # product meanings, identical for every tenant
    fuel-ev: "#2D9B6F"
    fuel-diesel: "#C48419"
    fuel-petrol: "#E42249"
    fuel-cng: "#5B6EE4"
    alert-critical: oklch(0.5771 0.245 27.325)
    alert-high: oklch(0.646 0.222 41.116)
    alert-medium: oklch(0.5876 0.1389 241.97)
    alert-low: oklch(0.596 0.1274 163.23)
typography:
  families:
    sans: '"DM Sans", system-ui, -apple-system, sans-serif'   # every product surface
    display: '"Syne", sans-serif'                             # auth screens only
    mono: 'ui-monospace, "SF Mono", Menlo, monospace'         # IDs, VINs, raw codes
  tabular-figures: required                 # font-variant-numeric: tabular-nums on every number in tables, KPIs and anything that updates
  min-size: 11px
  weights: [400, 500, 600, 700]             # 700 for one job per screen (the page title or money)
  scale:                                    # size / line-height / weight / tracking
    page-title: { size: 22px, line: 28px, weight: 600, tracking: -0.01em }
    kpi-value: { size: 24px, line: 30px, weight: 500 }
    kpi-lead: { size: 30px, line: 36px, weight: 600 }    # the one figure that answers the screen
    section-title: { size: 16px, line: 24px, weight: 600 }
    card-title: { size: 14px, line: 20px, weight: 600 }
    body: { size: 13px, line: 20px, weight: 400 }        # cells, nav rows, paragraphs
    label: { size: 12.5px, line: 18px, weight: 400 }     # form labels, meta
    table-header: { size: 11px, line: 16px, weight: 700, transform: uppercase, tracking: 0.05em }
    caption: { size: 12px, line: 16px, weight: 400 }     # helper text, axis ticks, timestamps
    badge: { size: 11.5px, line: 16px, weight: 600 }
spacing:                                    # 4px base; use only these steps
  scale: [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64]
  card-padding: 20px                        # 16px in dense mode
  card-gap: 16px
  section-gap: 32px
  page-gutter: { desktop: 24px, tablet: 20px, phone: 16px }
  label-to-field: 6px
  field-to-field: 16px
  icon-to-label: 8px
sizing:
  control-height: { sm: 32px, md: 36px, lg: 40px }      # buttons, inputs, selects move together
  hit-target-min: 24px                      # WCAG 2.5.8; 44px on touch-first screens
  icon: { inline: 14px, control: 16px, nav: 18px, empty-state: 20px }
  icon-stroke: 1.75
  table-row: { comfortable: 48px, default: 44px, dense: 36px }
  table-header-row: 40px
  status-pill-height: 22px
  avatar: { sm: 24px, md: 32px }
rounded:
  card: 12px                                # --radius 0.75rem
  control: 8px
  small: 6px                                # tooltips, small tags
  pill: 9999px                              # status pills
  nested-rule: "inner radius = outer radius - padding, never below 4px"
elevation:
  card: "0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 12px 36px 0 rgba(0, 0, 0, 0.08)"
  inset: "inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)"        # table container wrapper
  floating: "0 4px 18px 1px rgba(0, 0, 0, 0.05)"        # menus, popovers, map controls
  dialog: "0 16px 48px 0 rgba(0, 0, 0, 0.16)"
motion:
  duration: { instant: 100ms, fast: 150ms, normal: 200ms, slow: 300ms }
  easing:
    standard: cubic-bezier(0.2, 0, 0, 1)    # moving within the page
    enter: cubic-bezier(0, 0, 0.2, 1)       # appearing (ease-out)
    exit: cubic-bezier(0.4, 0, 1, 1)        # leaving (ease-in); exits take ~2/3 of the enter time
  properties: [opacity, transform, color, background-color, border-color, box-shadow]
  reduced-motion: "replace movement with an opacity change of 100ms or less"
z-index:                                    # named layers only; never a raw number
  base: 0
  map-overlay: 10                           # deck.gl / map controls inside the map
  sticky: 100                               # sticky table headers, page header
  sidebar: 200
  dropdown: 1000
  modal: 1200
  popover: 1300
  toast: 1400
  tooltip: 1500
breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px                                # the mobile/desktop split
  xl: 1280px
  2xl: 1536px
layout:
  sidebar: 15rem
  sidebar-rail: 4rem
  sidebar-collapsed: 3.375rem
  header-height: 56px
  content-max-width: 1600px                 # wider screens add gutter, not columns
density:
  default: default
  modes:
    comfortable: { row: 48px, card-padding: 24px, body: 14px }   # settings, single objects
    default: { row: 44px, card-padding: 20px, body: 13px }       # lists, overviews
    dense: { row: 36px, card-padding: 16px, body: 13px }         # monitoring, live tracking
---

# Intellicar theme

The design system for Intellicar's fleet and telematics products: dense, data-first operations screens (tables, maps, live status, reports) used for long sessions. An agent building UI reads the front matter for every value and the sections below for how to use them. If something isn't specified here, ask; don't invent a value.

## Principles

1. **The data is the interface.** Neutral greys carry the layout; colour marks state, selection or the one primary action. Decoration that carries no information is removed.
2. **One question per screen.** The largest block answers the screen's main question; everything else supports it.
3. **Honest numbers.** Real zeros are printed, missing values are a dash, every figure has its unit, and nothing is rounded into a vanity total.
4. **Calm under live data.** Values update in place with no layout shift, no flashing and no motion that pulls the eye from a moving map.
5. **Accessible by construction.** Every pair in this file meets WCAG 2.2 AA in both themes; components get keyboard, focus and screen-reader behaviour from shadcn/Radix and keep it.

## Colors

- **Brand vs product tokens.** `primary`, `primary-foreground`, `primary-text`, `accent`, `accent-foreground` and the auth panel gradients are **tenant brand**: a client project may override them (see White-label), but must keep every contrast ratio below. Everything else (surfaces, ink, lines, status, charts, alert severities, fuel colours) is **product** and identical for every client.
- **Ink in three tiers.** `foreground` for identity and key numbers, `muted-foreground` for secondary text, `subtle-foreground` for headers, meta and axis text. Never a fourth grey.
- **Lines in three strengths.** `border` for hairlines and card edges, `border-strong` for the one heavier rule in a block (under a table header, a chart baseline), `input` for form-field edges, which must be visible at 3:1.
- **Primary red** is for the active nav item, the one primary button per region, focus rings, the first chart series and links. Red **as text** uses `primary-text` (lighter in dark mode). Never use it for large fills, decoration or as a second accent.
- **Accent rose wash** is the background of an active nav row, a selected row and a hover on list items; text on it is `accent-foreground`.
- **Status** always uses a `status.*` pill pair, never raw hex. Map a domain state to one of: success, warning, pending, danger, info, neutral. Alert severity uses `alert-*` for its dot or bar plus the matching pill (critical/high → danger, medium → warning, low → info).
- **Fuel colours** (EV jade, diesel gold, petrol rose, CNG indigo) mean only fuel type, everywhere.
- **Contrast rules** (WCAG 2.2 AA): text 4.5:1, large text (18px+, or 14px+ at 600) 3:1, icons, field borders, focus rings and chart marks 3:1. Check both themes. A tenant colour that fails is rejected, not adjusted per screen.

## Typography

- DM Sans for the whole product; Syne only on auth screens; the monospace only for IDs, VINs and raw codes. Never a fourth family.
- Use only the roles in the front matter scale; a screen uses at most 6 of them. Nothing on an app screen is 48px or larger.
- **Tabular figures on every number** in tables, KPIs, timestamps and anything that updates (`tabular-nums`), so digits don't jitter.
- Sentence case everywhere except the table header style (see Deliberate exceptions). Tracking 0 except the table header and page title values given.
- Weight 700 does one job per screen. Don't bold body text for emphasis; use ink tier instead.

## Spacing and layout

- 4px base; only the steps in `spacing.scale`. Card padding 20px (16px dense), card gap 16px, section gap 32px.
- App shell: sidebar (15rem expanded, 4rem rail, 3.375rem collapsed), 56px header, `background` canvas, content in `card` panels, max content width 1600px.
- One left edge and one right edge per block: all right-aligned figures in a card end on the same padding line.
- Group, don't box: several KPIs are one card split by 1px dividers, not one card each.
- Empty space comes from the grid and repeated gaps, never from a stretched card or a column that's empty in every row.

## Density

Density is three settings moved together: row height, card padding and body size, from `density.modes`. Monitoring and live-tracking screens use `dense`; lists and overviews `default`; settings and single-object pages `comfortable`. Never shrink the type and keep the padding.

## Shapes and elevation

- Radius 12px for cards and wrappers, 8px for controls, 6px for tooltips and small tags, full pill for status pills. Nested radii step down (outer minus padding, minimum 4px).
- A surface is separated by a border **or** a shadow, never both, except `card` elevation on the canvas. Real shadows (`floating`, `dialog`) only on things that float.

## Motion

- Durations: 100ms for hover and press feedback, 150ms for small state changes, 200ms for menus and popovers, 300ms for dialogs and side sheets. Nothing longer except a progress indicator.
- Animate only `opacity`, `transform` and colours. Never width, height, top or left.
- Enter with `enter` easing, leave with `exit` at about two-thirds of the enter time.
- Live data never animates: a changed value is replaced in place. A map marker moves to its new position without easing longer than 150ms.
- `prefers-reduced-motion`: replace movement with a short opacity change.

## Z-index

Use only the named layers in the front matter. Overlays built from shadcn (Dialog, Sheet, Popover, Tooltip, Toast) already sit on their layers: don't set `z-index` on them. Map controls use `map-overlay`, sticky headers `sticky`.

## Iconography

- Lucide only, outline, stroke 1.75. Sizes: 14px inline, 16px in controls, 18px in nav, 20px in empty states.
- Icons are grey (`muted-foreground`) by default; colour only when the icon itself is the status. Never an icon in a coloured circle.
- An icon-only button has an `aria-label`; a decorative icon has `aria-hidden="true"`.

## Components

| Component | Spec |
|---|---|
| Button | Heights 32/36/40. One `default` (primary red) per region; `secondary` or `outline` for the rest; `ghost` in toolbars. Destructive actions use `destructive` and a confirmation dialog that names the object. Loading: a spinner replaces the icon, label kept, button disabled. |
| Input, select, textarea | Height matches the button size in the same row; `input` border; label above (12.5px), helper text below (12px caption); error text in `destructive` below the field, linked by `aria-describedby`; required fields marked in the label, not by colour. |
| Form | Labels above fields, 6px label-to-field, 16px between fields, one column unless fields are tightly related. Submit on the bottom left of the form. On submit failure, an error summary at the top that links to each field. |
| Table | Header row 40px, 11px uppercase tracked `subtle-foreground` (see Deliberate exceptions), `border-strong` rule under it, no fill band; rows 44px (36 dense, 48 comfortable), `border` dividers, no zebra stripes; hover `accent` at 50%; selected row `accent` with a 2px `primary` left edge. Numbers right-aligned, tabular, fixed decimals per metric; identity column gets the most width; IDs in mono, truncated with a copy button; dates ISO when compared, relative ("2 min ago") for recency. Sticky header on scroll; sort icon on the active column only. Total count shown above the table. |
| Status pill | 22px high, 11.5px/600 text, full radius, `status.*` pair, `white-space: nowrap`, never squeezed. One status mark per row. |
| KPI | Label (12.5px, `muted-foreground`) above value (`kpi-value`); one `kpi-lead` per screen at most. No icon tiles, no sparkline, no tinted tile. Delta optional, 12px, in words with its window ("+12 vs last 7 days"); coloured by good/bad for that metric, grey for zero; "+4 (new)" when the prior was zero. |
| Card | `card` fill, 12px radius, `card` elevation, 20px padding; title `card-title`; actions top right. |
| Nav row | Active: `accent` background, `accent-foreground` text, `primary` icon, 600 weight. Inactive: `muted-foreground`, 400. Category header: `table-header` style without the rule. |
| Tabs | Underline style; active tab `foreground` with a 2px `primary` underline; others `muted-foreground`. |
| Dialog | Title always present (visually hidden if needed); max width 560px for forms; primary action bottom right; Escape and the close button both close; focus returns to the trigger. |
| Toast | Bottom right, 4–6 seconds, `aria-live="polite"`; an undo action for reversible bulk actions; errors that need action stay until dismissed. |
| Tooltip | 12px caption, 6px radius, `popover` surface; never the only place information lives. |

## Data visualisation

- One question per chart; at most 4 hues on a screen; `chart-1` first. Colour never the only signal: add a label, a pattern or a position.
- Lines 2px, straight segments, no area fill by default, no point markers. Bars with 2px radius on the value end only.
- Gridlines: 3–5 horizontal, 1px `chart.grid`; no y-axis line; the baseline is the one `border-strong` line. Ticks 4–7 at round steps, the top tick above the maximum, zero as the baseline for bars and counts; axis text `caption` in `chart.axis-text`, never larger than the data.
- X labels 4–8, horizontal, never rotated; time on a time scale.
- No legend for a single series; otherwise the legend is a small table with values. A donut is a thin ring with no slice labels.
- Tooltips show the exact value with its unit and timestamp.
- Map: vehicle state colours use `status.*` foregrounds; clusters use neutral fills with counts.

## States

| State | Rule |
|---|---|
| Real zero | Printed in the normal style: "0", "0 km", "0%". |
| Missing / not applicable | A `subtle-foreground` em dash "—", never at full value size. |
| Loading | The final layout with each value replaced by a flat `muted` bar at its real size; headers and labels shown at once; no shimmer; no layout shift when data lands. A refresh keeps the old values and updates the freshness stamp. |
| Empty | The block keeps its frame and header and adds one sentence across it, with the next action if there is one ("No trips in this range. Change the dates."). An empty chart draws its zero line. No illustrations. |
| First run | Keep the frame and title; put the first action where the data will appear. |
| Error | Inside the block that failed, never a full-screen banner: one sentence on what failed and when the data was last good, plus a Retry button. `destructive` only on the small icon. |
| Live | A freshness stamp ("Updated 12s ago") on every live block; a 6px `status.success` dot while the socket is connected. |
| Stale | After 2× the expected update interval with no data: the stamp turns `status.warning` with the age; values stay visible and are not greyed out. |
| Disconnected | One banner under the header ("Live updates paused — reconnecting…"), `status.warning` pair, until the socket is back. |

**State priority** when several apply to a control: disabled > loading > active (pressed) > focus > hover > default.

## Interaction states

| State | Rule |
|---|---|
| Hover | Background step (`secondary` on neutral controls, `accent` at 50% on list rows), 100ms. Never the only cue for an action. |
| Focus | `focus-visible` only: 2px `ring`, 2px offset, never removed; sticky headers and toasts must not cover it. |
| Active / pressed | One step darker than hover; no scale transform on dense screens. |
| Selected | `accent` background with `accent-foreground` text (rows add a 2px `primary` left edge). |
| Disabled | 50% opacity, `cursor: not-allowed`, no hover; keep the label legible and explain why nearby when it isn't obvious. |
| Read-only | Plain text, not a disabled input. |

## Accessibility

- WCAG 2.2 AA in both themes (see Colors). Every interactive element reachable by keyboard in visual order; a skip link to the main content; headings in order with one `h1` per screen.
- Hit targets at least 24×24px (44px on touch-first screens). Drag interactions (map selection, reordering) always have a non-drag alternative.
- Form errors are announced (`aria-live` or focus moved to the error summary); toasts use `aria-live="polite"`.
- Charts and the map have a text or table alternative for their key numbers.

## Dark mode

- Neutral darks (`#141414` canvas, `#222222` cards), never navy or tinted. Elevation is a lighter surface, not a stronger shadow.
- Red as text switches to `primary-text`; status pills use their dark pairs; chart colours their dark set. Every ratio is checked in dark mode separately.
- No `dark:` colour overrides in components: tokens switch with the theme.

## Responsive

- The mobile/desktop split is **below 1024px** (`lg`). Use one breakpoint helper for it across the app, so every screen switches at the same width.
- Render separate mobile and desktop branches (`lg:hidden` / `hidden lg:flex`, or an `isDesktop` conditional) instead of one branch full of conditional classes.
- Below `lg`, tables become cards with the identity and status first; the sidebar becomes a sheet; dense mode is not used.

## White-label

A client may override only the tenant brand tokens: light and dark `primary`, `primary-foreground`, `primary-text`, `accent` and `accent-foreground`, plus logos, favicon and product name. Override them in one place (the project's theme tokens or a branding config), never per component. Product tokens are not brandable. A tenant palette must pass the same contrast checks before it ships.

## Do's and Don'ts

- **Do** use semantic tokens (`bg-primary`, `text-muted-foreground`). **Don't** use raw palette classes (`bg-red-500`) or hex in components.
- **Don't** add a colour, radius, shadow, spacing step, font size or z-index outside this file.
- **Don't** use primary red for decoration, large fills or more than one primary button per region.
- **Don't** use `dark:` colour overrides or edit `src/index.css` per client.
- **Don't** ship the tells of generated dashboards: gradients, glass, glowing borders, icons in coloured circles, a sparkline or a green "+x%" pill on every KPI, rainbow charts, smoothed area charts with dots, a big total inside a fat donut, emoji, "Welcome back" greetings, lorem ipsum or placeholder people, pagination under a five-row list, or Export/Share buttons that do nothing.
- **Don't** hide information in a tooltip or behind hover only.

## Deliberate exceptions

These differ from the dashboard study the standards borrow from, and are kept because they are how Intellicar's product already looks:

- **Uppercase, tracked 11px table headers** (the study prefers sentence case).
- **The rose wash on the active nav row** (the study prefers a neutral pill).

## Pre-delivery checklist

Before a UI change is done:

- [ ] Every value comes from this file's front matter; no raw hex, px or z-index in components.
- [ ] Contrast checked in light and dark for any new colour pair.
- [ ] Keyboard: every action reachable, visible focus ring, focus returns after dialogs.
- [ ] Loading, empty, error and (for live data) stale states are built, not just the happy path.
- [ ] Numbers are tabular, right-aligned in tables, with units and fixed decimals.
- [ ] Works below 1024px (the mobile branch) and at 1600px+.
- [ ] No layout shift when data loads or updates.
- [ ] `web-design-guidelines` review run on the changed files.

## Known gaps

- Some tokens are written in OKLCH and others in hex; hex values in OKLCH comments are conversions and approximate.

## Sources

- Values: Intellicar's product style guide.
- Token structure (z-index scale, durations, state priority, row heights): nextlevelbuilder/ui-ux-pro-max-skill, `design-system/references` (MIT).
- Dashboard rules (KPIs, tables, pills, charts, density, states, generated-dashboard tells): leonxlnx/taste-skill, `references/app-screens.md` (MIT).
- Contrast ratios computed with the WCAG 2.x relative-luminance formula.
