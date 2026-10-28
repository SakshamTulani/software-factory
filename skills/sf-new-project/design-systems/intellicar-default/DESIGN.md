---
name: Intellicar default
source: intellicars/fms-ui — apps/web/STYLE_GUIDE.md, src/index.css ([data-theme="intellicar"] blocks), src/branding/default-branding.json
base: shadcn new-york (radix), neutral, CSS variables, Lucide icons
colors:
  light:
    background: oklch(0.98 0 none)        # #F9F9F9 canvas
    foreground: oklch(0.27 0 none)        # #333333 body text
    card: oklch(1 0 none)                 # #FFFFFF panels, popovers, table wraps
    card-foreground: oklch(0.27 0 none)
    popover: oklch(1 0 none)
    popover-foreground: oklch(0.27 0 none)
    primary: oklch(0.58 0.23 17)          # #E40046 Intellicar red (tenant brand)
    primary-foreground: oklch(1 0 none)
    secondary: oklch(0.97 0 none)         # #F5F5F5 secondary control fills
    secondary-foreground: oklch(0.27 0 none)
    muted: oklch(0.97 0 none)
    muted-foreground: oklch(0.51 0 none)  # #666666 placeholders, meta text
    accent: oklch(0.95 0.03 356.28)       # #FFE6EF rose wash: hover, active pill (tenant brand)
    accent-foreground: oklch(0.58 0.23 17)
    destructive: oklch(0.59 0.19 35.9)    # #D64417
    destructive-foreground: oklch(1 0 none)
    border: oklch(0.92 0 none)            # #E5E5E5
    input: oklch(0.92 0 none)
    ring: oklch(0.58 0.23 17)
    sidebar: oklch(1 0 none)
    sidebar-primary: oklch(0.58 0.23 17)
    sidebar-accent: oklch(0.97 0 none)
    sidebar-border: oklch(0.92 0 none)
    brand-light: oklch(0.62 0 none)       # #878787 header and category text
    chart-1: oklch(0.58 0.23 17)
    chart-2: hsl(156 55% 39.2%)           # jade
    chart-3: hsl(232.6 58.5% 59.4%)       # indigo
    chart-4: hsl(39.2 65.4% 47.6%)        # gold
    chart-5: hsl(18.6 84.7% 59%)
  dark:
    background: oklch(0.19 0 none)        # #141414
    foreground: oklch(0.97 0 none)        # #F5F5F5
    card: oklch(0.25 0 none)              # #222222
    card-foreground: oklch(0.97 0 none)
    popover: oklch(0.25 0 none)
    popover-foreground: oklch(0.97 0 none)
    primary: oklch(0.58 0.23 17)          # same red in both modes
    primary-foreground: oklch(1 0 none)
    secondary: oklch(0.29 0 none)
    secondary-foreground: oklch(0.97 0 none)
    muted: oklch(0.29 0 none)
    muted-foreground: oklch(0.7 0 none)   # #AAAAAA
    accent: oklch(0.26 0.07 357.56)
    accent-foreground: oklch(0.97 0 none)
    destructive: oklch(0.59 0.19 35.9)
    destructive-foreground: oklch(1 0 none)
    border: oklch(0.3 0 none)             # #333333
    input: oklch(0.3 0 none)
    ring: oklch(0.58 0.23 17)
    sidebar: oklch(0.22 0 none)
    sidebar-primary: oklch(0.58 0.23 17)
    sidebar-accent: oklch(0.29 0 none)
    sidebar-border: oklch(0.3 0 none)
  fixed:                                  # product tokens, identical for every tenant
    jade: hsl(156 55% 39.2%)              # #2D9B6F EV, success
    gold: hsl(39.2 65.4% 47.6%)           # #C48419 diesel, pending
    rose: hsl(349.5 50.8% 51.4%)          # #E42249 petrol
    indigo: hsl(232.6 58.5% 59.4%)        # #5B6EE4 CNG
    alert-critical: oklch(0.5771 0.245 27.325)
    alert-high: oklch(0.646 0.222 41.116)
    alert-medium: oklch(0.5876 0.1389 241.97)
    alert-low: oklch(0.596 0.1274 163.23)
typography:
  sans: '"DM Sans", system-ui, -apple-system, sans-serif'   # all UI text
  display: '"Syne", sans-serif'                             # auth headers, hero values
  technical: '"Orbitron", monospace'                        # battery %, charge metrics, technical digits
  scale:
    card-title: { size: 14px, weight: 600 }
    body: { size: 13px, weight: 400 }                       # also table cells and nav rows
    table-header: { size: 11px, weight: 700, transform: uppercase, tracking: 0.05em }
    label: { size: 12.5px, weight: 400 }
    nav-category: { size: 13.33px, weight: 400, transform: uppercase }
    badge: { size: 11.5px, weight: 700 }
rounded:
  card: 12px          # --radius 0.75rem
  control: 8px        # inputs, buttons
  small: 6px          # badges, tooltips
  pill: 20px          # status badges
elevation:
  card: "0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 12px 36px 0 rgba(0, 0, 0, 0.08)"
  inset: "inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)"          # table container wrapper
  floating: "0 4px 18px 1px rgba(0, 0, 0, 0.05)"
layout:
  sidebar: 15rem
  sidebar-rail: 4rem
  sidebar-collapsed: 3.375rem
  breakpoints: { sm: 640px, lg: 1024px }
---

# Intellicar default

## Overview

A dense, data-first operations UI for fleet and telematics products: tables, maps, live status and reports. Neutral greys carry the layout. The Intellicar red marks the one thing that is active, selected or primary on screen. Light and dark modes are both first-class.

## Colors

- **Brand vs product tokens.** `primary`, `primary-foreground`, `accent`, `accent-foreground` and the auth panel gradients are **tenant brand**: a client project may override them (see White-label). Everything else, including surfaces, text, borders, alert severities and the fixed accents, is **product** and stays the same for every client.
- **Primary red** is for active navigation, primary CTAs, sorted table headers, focus rings and the first chart series. Use it at most once per region.
- **Accent rose wash** is the background of an active or hovered nav row and of selected items. Text on it uses `accent-foreground`.
- **Fixed accents** mean the same thing everywhere: jade for EV and success, gold for diesel and pending, rose for petrol, indigo for CNG. Alert severities use the `alert-*` tokens only.

## Typography

DM Sans for everything in the product. Syne only for auth screens and large headline values. Orbitron only for technical readouts (battery percentage, charge figures). Body and table text is 13px; the scale in the front matter is complete, so don't add sizes.

## Layout

- App shell: left sidebar (15rem expanded, 4rem rail, 3.375rem collapsed), header, `background` canvas, content in `card` panels.
- Tables sit in a card with the inset shadow. Column headers are 11px bold uppercase with 0.05em tracking.

## Elevation

Three tiers only: `card` for panels, `inset` for table wrappers, `floating` for popovers and floating controls. Overlays (dialog, sheet, popover) keep shadcn's own stacking; never set `z-index` on them.

## Shapes

Radius 12px for cards and wrappers, 8px for inputs and buttons, 6px for small badges and tooltips, 20px pills for status badges. Nothing else.

## Components

| Recipe | Spec |
|---|---|
| Nav row, active | text and icon `primary`, background `accent`, 13px, weight 600 |
| Nav row, inactive | text and icon `muted-foreground`, 13px, weight 400 |
| Nav category header | `brand-light`, 13.33px, weight 400, uppercase, no background |
| User pill (sidebar footer) | text `primary`, background `accent`, 1px border `rgba(228, 0, 70, 0.208)`, radius 9px, 12.5px weight 500 |
| Status badge | pill radius 20px, padding 2px 8px, 11.5px weight 700. Complete: bg `#E4F7EE`, text `#2D9B6F`. Warning: bg `#FCEAEB`, text `#F97316`. Pending: bg `rgba(0,0,0,0.04)`, text `#C9922A` |
| Card | `card` fill, 12px radius, `card` elevation; title 14px weight 600 |
| Button, primary | `Button` default: `primary` fill, 8px radius |

## Do's and Don'ts

- **Do** use semantic tokens (`bg-primary`, `text-muted-foreground`). **Don't** use raw palette classes (`bg-red-500`) or hex values in components.
- **Don't** use primary red for decoration, large fills or more than one CTA per region.
- **Don't** use `dark:` color overrides; tokens already switch with the theme.
- **Don't** introduce a radius, shadow or font size outside this file.
- **Don't** edit `src/index.css` per client. Brand changes go through the branding config (White-label).

## Responsive

- The mobile/desktop split is **below 1024px**. Use the project's `useBreakpoint()` hook and check `!isDesktop`; its `isMobile` means below 640px and is not the same split.
- Render separate mobile and desktop branches (`lg:hidden` / `hidden lg:flex`, or an `isDesktop` conditional) instead of one branch full of conditional classes.

## White-label

A client project rebrands without code changes: brand colors (light and dark `primary`, `primaryForeground`, `accent`, `accentForeground`, auth gradients), logos, favicon, title and auth copy come from a branding JSON loaded at boot and injected as CSS variables. Product tokens are not brandable. Mechanism reference: fms-ui `apps/web/WHITE_LABEL.md`.

## Known Gaps

- Source values are OKLCH in `index.css`; hex values in comments are the style guide's conversions and are approximate.
- fms-ui also defines a generic `.dark` block (near-white primary) for non-Intellicar themes. It is not part of this design system.
- The style guide has no control heights or focus-ring widths; shadcn new-york defaults apply.
