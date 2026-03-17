# iOS Component Reference

Complete reference for all iOS design system classes available in the mobile app designer canvas. All classes are scoped under `.ios-screen` and use iOS 26 design tokens.

> **Dark mode:** Add `data-theme="dark"` to the screen's `<template>` tag. The canvas applies that theme to the injected `.ios-screen` automatically.
>
> **Icons:** Use Lucide icons for UI iconography. Include `<script src="https://unpkg.com/lucide@latest"></script>` in `index.html`, then use `<i data-lucide="house" class="ios-icon-sm"></i>` or similar. Do not use emoji as interface icons.

## Design Tokens

| Token | Light | Dark |
|-------|-------|------|
| Blue | `#0088FF` | `#0091FF` |
| Green | `#34C759` | `#30D158` |
| Red | `#FF383C` | `#FF4245` |
| Orange | `#FF8D28` | `#FF9230` |
| Yellow | `#FFCC00` | `#FFD600` |
| Purple | `#CB30E0` | `#DB34F2` |
| Pink | `#FF2D55` | `#FF375F` |
| Teal | `#00C3D0` | `#00D2E0` |
| Indigo | `#6155F5` | `#6D7CFF` |
| Cyan | `#00C0E8` | `#3CD3FE` |
| Mint | `#00C8B3` | `#00DAC3` |
| Brown | `#AC7F5E` | `#B78A66` |
| Background | `#FFFFFF` | `#000000` |
| Secondary BG | `#F2F2F7` | `#1C1C1E` |
| Label | `#000000` | `#FFFFFF` |
| Label Secondary | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` |
| Separator | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.12)` |
| Spacing grid | 8px | — |
| Border radius | 10px (standard), 26px (list groups), 34px (action sheets/alerts), 38px (modals/sheets) | — |
| Glass BG | `rgba(250,250,250,0.88)` | `rgba(28,28,30,0.82)` |
| Glass BG Thin | `rgba(250,250,250,0.72)` | `rgba(28,28,30,0.65)` |
| Glass Blur | `blur(20px) saturate(1.8)` | — |
| Glass Shadow | drop shadow + edge highlights | dimmer edges, deeper drop |
| Glass Shadow Elevated | stronger drop shadow + edges | dimmer edges, deeper drop |

---

## Screen Structure

Every screen should follow this structure:

```html
<template id="screen-home">
  <div class="ios-safe-area-top"></div>
  <!-- Navigation bar -->
  <!-- Content -->
  <!-- Tab bar (if applicable) -->
  <div class="ios-safe-area-bottom"></div>
</template>
```

- `.ios-safe-area-top` — 59px spacer for status bar + Dynamic Island
- `.ios-safe-area-bottom` — 34px spacer for home indicator
- Own the page background on a screen wrapper or a top-level surface. Do not rely on `.ios-list` or `.ios-search-bar` to paint the whole screen for you.

---

## Typography

| Class | Size | Weight | Use |
|-------|------|--------|-----|
| `.ios-title-large` | 34px | Bold | Large navigation titles |
| `.ios-title` | 28px | Bold | Section headers |
| `.ios-title-2` | 22px | Bold | Card titles |
| `.ios-title-3` | 20px | Semibold | Subsection headers |
| `.ios-headline` | 17px | Semibold | Emphasized body text |
| `.ios-body` | 17px | Regular | Default body text |
| `.ios-callout` | 16px | Regular | Secondary body text |
| `.ios-subheadline` | 15px | Regular | Subtitles, descriptions |
| `.ios-footnote` | 13px | Regular | Footnotes, list headers |
| `.ios-caption` | 12px | Regular | Timestamps, badges |
| `.ios-caption-2` | 11px | Regular | Smallest text |

```html
<p class="ios-title-large">Settings</p>
<p class="ios-headline">Account</p>
<p class="ios-body">Manage your account settings and preferences.</p>
<p class="ios-caption ios-label-secondary">Last updated 2 hours ago</p>
```

---

## Navigation Bar

In iOS 26 the nav bar itself is **transparent** — it has no background of its own. Individual button groups within the nav bar are rendered as **glass pills** (`.ios-pill`), giving each button cluster a frosted capsule appearance while the bar background remains clear.

### Glass Pill Buttons

Glass pills are the core building block for iOS 26 navigation and toolbars. They use `border-radius: 296px`, 44px height, translucent glass material with backdrop blur.

```html
<!-- Neutral glass pill -->
<span class="ios-pill">Back</span>

<!-- Primary (blue) glass pill -->
<span class="ios-pill ios-pill-primary">Done</span>

<!-- Pill group (multiple icons in one pill) -->
<span class="ios-pill-group">
  <i data-lucide="search" class="ios-pill-icon ios-icon-sm"></i>
  <i data-lucide="plus" class="ios-pill-icon ios-icon-sm"></i>
  <i data-lucide="share" class="ios-pill-icon ios-icon-sm"></i>
</span>
```

### Standard (centered title)

```html
<div class="ios-nav-bar">
  <span class="ios-pill">Back</span>
  <span class="ios-nav-bar-title">Settings</span>
  <span class="ios-pill ios-pill-primary">Edit</span>
</div>
```

### Title with subtitle (centered)

```html
<div class="ios-nav-bar" style="min-height:50px;">
  <span class="ios-pill">Back</span>
  <span class="ios-nav-bar-title">Title</span>
  <span class="ios-nav-bar-subtitle">Subtitle</span>
  <span class="ios-pill">Edit</span>
</div>
```

### Large title with subtitle

```html
<div class="ios-nav-bar">
  <span class="ios-pill">Back</span>
  <span class="ios-pill-group">
    <i data-lucide="search" class="ios-pill-icon ios-icon-sm"></i>
    <i data-lucide="plus" class="ios-pill-icon ios-icon-sm"></i>
  </span>
</div>
<div class="ios-nav-bar-large">
  <span class="ios-title-large">Settings</span>
  <span class="ios-nav-bar-large-subtitle">Subtitle</span>
</div>
```

---

## Bottom Toolbar

In iOS 26 the bottom toolbar is **transparent** with glass pill buttons. Pills in the toolbar are 48px tall (vs 44px in the nav bar).

### Buttons

```html
<div class="ios-toolbar">
  <div style="display:flex;gap:12px;">
    <span class="ios-pill"><i data-lucide="share" class="ios-icon-sm"></i></span>
    <span class="ios-pill"><i data-lucide="pencil" class="ios-icon-sm"></i></span>
  </div>
  <div style="display:flex;gap:12px;">
    <span class="ios-pill"><i data-lucide="search" class="ios-icon-sm"></i></span>
    <span class="ios-pill"><i data-lucide="plus" class="ios-icon-sm"></i></span>
  </div>
</div>
```

### Search field

```html
<div class="ios-toolbar" style="gap:12px;">
  <div class="ios-toolbar-search">
    <i data-lucide="search" class="ios-toolbar-search-icon ios-icon-sm"></i>
    <span class="ios-toolbar-search-placeholder">Search</span>
    <i data-lucide="mic" class="ios-toolbar-search-trailing ios-icon-sm"></i>
  </div>
</div>
```

### Page dots

```html
<div class="ios-page-dots">
  <span class="ios-page-dot"></span>
  <span class="ios-page-dot ios-page-dot-active"></span>
  <span class="ios-page-dot"></span>
</div>
```

---

## Tab Bar

In iOS 26 the tab bar is a **floating glass pill** — rounded, translucent, and inset from the screen edges.

```html
<div class="ios-tab-bar" style="position:absolute;bottom:0;left:0;right:0;">
  <a class="ios-tab-bar-item ios-tab-bar-item-active">
    <i data-lucide="house" class="ios-tab-bar-icon ios-icon-sm"></i>
    <span>Home</span>
  </a>
  <a class="ios-tab-bar-item">
    <i data-lucide="search" class="ios-tab-bar-icon ios-icon-sm"></i>
    <span>Search</span>
  </a>
  <a class="ios-tab-bar-item">
    <i data-lucide="user-round" class="ios-tab-bar-icon ios-icon-sm"></i>
    <span>Profile</span>
  </a>
</div>
```

Use Lucide icons for tab icons. Apply `.ios-tab-bar-item-active` to the selected tab. The pill shape, glass blur, and margin are built into the `.ios-tab-bar` class.

If a flow uses a tab bar for primary navigation, render the same tab bar on every top-level destination screen and only change the active item.

If the app uses a custom accent, set it on the screen wrapper so active tabs, buttons, toggles, and other primary states stay consistent:

```html
<div
  class="flex min-h-full flex-col"
  style="--ios-accent:#c89b64;--ios-accent-rgb:200,155,100;background:var(--ios-bg);"
>
  <!-- rest of screen -->
</div>
```

Avoid mixing a custom warm accent with default iOS blue active tabs.

---

## Map

Use the built-in real map surface when a product needs a location view. The canvas loads MapLibre GL JS and OpenFreeMap automatically for any `.ios-map` with `data-map-center`, so the map is rendered from real tiles instead of decorative fake roads.

```html
<div
  class="ios-map"
  data-map-center="-73.9855,40.758"
  data-map-zoom="13.4"
  data-map-bearing="-14"
>
  <button class="ios-map-fab">
    <i data-lucide="locate-fixed" class="ios-icon-sm"></i>
  </button>

  <button class="ios-map-pin ios-map-pin-active" style="top:76px;left:156px;">
    <i data-lucide="car-taxi-front" class="ios-icon-sm"></i>
  </button>
  <button class="ios-map-pin" style="top:144px;left:88px;">
    <i data-lucide="dog" class="ios-icon-sm"></i>
  </button>
  <div class="ios-map-label" style="top:122px;left:182px;">
    <i data-lucide="clock-3" class="ios-icon-sm"></i>
    4 min
  </div>

  <div class="ios-map-card">
    <div class="ios-map-card-row">
      <div>
        <div class="ios-headline">Jay Walker</div>
        <div class="ios-caption ios-label-secondary">2 blocks away</div>
      </div>
      <div class="ios-map-chip">
        <i data-lucide="star" class="ios-icon-sm"></i>
        4.9
      </div>
    </div>
  </div>
</div>
```

Map rules:

- `.ios-map` owns the rendered map surface. Set `data-map-center="lng,lat"` and optionally `data-map-zoom`, `data-map-bearing`, `data-map-pitch`, or `data-map-style`.
- The map itself is the background layer. Add cards, chips, pins, and labels as normal HTML overlays on top of it.
- Use `.ios-map-pin`, `.ios-map-pin-active`, `.ios-map-label`, `.ios-map-card`, `.ios-map-chip`, and `.ios-map-fab` for the overlay controls.
- Keep overlays sparse. Let the real geography carry the composition instead of recreating roads manually.

---

## Lists

List groups in iOS 26 are **not glass**. They use a solid white background with 26px border-radius. Cells within the group are transparent.

### Headers

iOS 26 has three header styles. Headers are no longer uppercase.

```html
<!-- Nested (default): 17px Semibold, secondary color -->
<div class="ios-list-header">General</div>

<!-- Prominent: 20px Semibold, primary color, with trailing action -->
<div class="ios-list-header-prominent">
  <span>Prominent Header</span>
  <span class="ios-list-header-action">Action</span>
</div>

<!-- Extra Prominent: 22px Bold, with supertitle + subtitle -->
<div class="ios-list-header-xl">
  <div>
    <div class="ios-list-header-supertitle">Supertitle</div>
    <div>Extra Prominent</div>
    <div class="ios-list-header-subtitle">Subtitle</div>
  </div>
  <span class="ios-list-header-action">Action</span>
</div>
```

### Inset grouped list (most common style)

```html
<div class="ios-list ios-list-inset">
  <div class="ios-list-header">General</div>
  <div class="ios-list-group">
    <div class="ios-list-cell ios-list-cell-has-icon">
      <div class="ios-list-cell-icon ios-bg-orange"><i data-lucide="plane" class="ios-icon-sm" style="color:white;"></i></div>
      <div class="ios-list-cell-detail">
        <span>Airplane Mode</span>
      </div>
    </div>
    <div class="ios-list-cell ios-list-cell-has-icon">
      <div class="ios-list-cell-icon ios-bg-blue"><i data-lucide="wifi" class="ios-icon-sm" style="color:white;"></i></div>
      <div class="ios-list-cell-detail">
        <span>Wi-Fi</span>
        <span class="ios-list-cell-value">Home Network</span>
      </div>
    </div>
  </div>
</div>
```

Add `.ios-list-cell-has-icon` to cells with icons so the separator indents past the icon.

### Cell heights

- Regular cells: 52px (default `.ios-list-cell`)
- Tall cells: 68px (add `.ios-list-cell-tall`) — for rows with subtitle

### Cell with toggle

```html
<div class="ios-list-cell ios-list-cell-has-icon">
  <div class="ios-list-cell-icon ios-bg-orange"><i data-lucide="plane" class="ios-icon-sm" style="color:white;"></i></div>
  <span style="flex:1">Airplane Mode</span>
  <div class="ios-toggle ios-toggle-on"></div>
</div>
```

### Cell with subtitle (tall)

```html
<div class="ios-list-cell ios-list-cell-tall" style="flex-direction:column;align-items:flex-start;justify-content:center;">
  <span class="ios-headline">John Doe</span>
  <span class="ios-list-cell-subtitle">Apple ID, iCloud+, Media & Purchases</span>
</div>
```

### List footer

```html
<div class="ios-list-footer">
  Your personal data is encrypted end-to-end.
</div>
```

---

## Buttons

```html
<!-- Filled (primary action) -->
<button class="ios-btn ios-btn-filled">Continue</button>

<!-- Large filled (full width) -->
<button class="ios-btn ios-btn-filled ios-btn-lg">Sign In</button>

<!-- Gray -->
<button class="ios-btn ios-btn-gray">Cancel</button>

<!-- Tinted -->
<button class="ios-btn ios-btn-tinted">Add to Library</button>

<!-- Plain text -->
<button class="ios-btn ios-btn-plain">Forgot Password?</button>

<!-- Small -->
<button class="ios-btn ios-btn-filled ios-btn-sm">Follow</button>

<!-- Destructive -->
<button class="ios-btn ios-btn-plain ios-btn-destructive">Delete Account</button>
```

---

## Toggle / Switch

```html
<!-- Off -->
<div class="ios-toggle"></div>

<!-- On -->
<div class="ios-toggle ios-toggle-on"></div>
```

---

## Text Field

```html
<input class="ios-text-field" placeholder="Email" />
<input class="ios-text-field" placeholder="Password" type="password" />
```

---

## Search Bar

```html
<div class="ios-search-bar">
  <input class="ios-search-bar-input" placeholder="Search" />
</div>
```

---

## Segmented Control

```html
<div class="ios-segmented-control">
  <button class="ios-segment ios-segment-active">All</button>
  <button class="ios-segment">Missed</button>
</div>
```

---

## Card

```html
<div class="ios-card">
  <p class="ios-headline">Today's Summary</p>
  <p class="ios-body" style="margin-top:8px;">You completed 5 tasks.</p>
</div>
```

---

## Modal

Modals in iOS 26 are **not glass**. They use a solid elevated white surface with 38px border-radius on all corners.

```html
<div class="ios-modal" style="margin:40px 16px;">
  <div style="padding:16px;">
    <p class="ios-title-2" style="text-align:center;">New Event</p>
    <!-- modal content -->
  </div>
</div>
```

---

## Sheet (Bottom Sheet)

iOS 26 has two sheet variants:

### Full Screen Sheet

Full screen sheets are **not glass**. They use a solid elevated white surface with 38px top border-radius and a shadow of `0 15px 75px rgba(0,0,0,0.18)`.

```html
<div class="ios-sheet">
  <div class="ios-sheet-toolbar">
    <div class="ios-sheet-handle"></div>
    <div class="ios-sheet-toolbar-controls">
      <span class="ios-btn-plain ios-label-secondary">Cancel</span>
      <span class="ios-sheet-toolbar-title">Title</span>
      <span class="ios-btn-plain ios-blue" style="font-weight:600;">Done</span>
    </div>
  </div>
  <div style="padding:0 16px 34px;">
    <!-- sheet content -->
  </div>
</div>
```

### Inspector Sheet (Half-Height)

Inspector sheets **are glass**. They use a translucent glass material with 34px top border-radius, 58px bottom border-radius, 6px inset from screen edges, and a shadow of `0 8px 40px rgba(0,0,0,0.12)`. Glass is most visible over colorful backgrounds.

```html
<div class="ios-sheet-inspector">
  <div class="ios-sheet-toolbar">
    <div class="ios-sheet-handle"></div>
    <div class="ios-sheet-toolbar-controls">
      <span class="ios-btn-plain ios-label-secondary">Cancel</span>
      <span class="ios-sheet-toolbar-title">Title</span>
      <span class="ios-btn-plain ios-blue" style="font-weight:600;">Done</span>
    </div>
  </div>
  <div style="padding:0 16px 34px;">
    <!-- sheet content -->
  </div>
</div>
```

### Sheet Toolbar

Use `.ios-sheet-toolbar` with `.ios-sheet-handle` and `.ios-sheet-toolbar-controls` for the standard sheet header. The title is centered with `.ios-sheet-toolbar-title`.

---

## Action Sheet

Action sheets in iOS 26 **are glass**. The action sheet is a single glass container (not two separate groups) with 34px border-radius, 14px padding, and 10px gap between items. Buttons are pill-shaped (100px border-radius), 48px tall, with a background of `rgba(120,120,128,0.16)` and font-weight 500. There are no separators between items.

Use `.ios-action-sheet-title-group` for the optional title/message header block, `.ios-action-sheet-title` for the title text, and `.ios-action-sheet-message` for the message text.

```html
<div class="ios-action-sheet">
  <div class="ios-action-sheet-title-group">
    <p class="ios-action-sheet-title">Choose an action</p>
    <p class="ios-action-sheet-message">Select one of the options below.</p>
  </div>
  <div class="ios-action-sheet-item">Save to Photos</div>
  <div class="ios-action-sheet-item">Copy Link</div>
  <div class="ios-action-sheet-item ios-action-sheet-item-destructive">Delete</div>
  <div class="ios-action-sheet-item ios-action-sheet-cancel">Cancel</div>
</div>
```

---

## Alert

Alerts in iOS 26 **are glass**. They have 34px border-radius, a fixed width of 300px, and pill-shaped buttons (100px border-radius) with 16px gap between actions. Use `.ios-alert-action-primary` for the primary button (solid blue background, white text).

```html
<div class="ios-alert">
  <div class="ios-alert-content">
    <p class="ios-alert-title">Delete Item?</p>
    <p class="ios-alert-message">This action cannot be undone.</p>
  </div>
  <div class="ios-alert-actions">
    <button class="ios-alert-action">Cancel</button>
    <button class="ios-alert-action ios-alert-action-primary ios-alert-action-destructive">Delete</button>
  </div>
</div>
```

---

## Badge

```html
<span class="ios-badge">3</span>
<span class="ios-badge">99+</span>
```

Typically positioned absolutely on tab bar icons or list cells.

---

## Progress Bar

```html
<div class="ios-progress">
  <div class="ios-progress-bar" style="width:65%"></div>
</div>
```

---

## Spinner

```html
<!-- Standard -->
<div class="ios-spinner"></div>

<!-- Large -->
<div class="ios-spinner ios-spinner-lg"></div>
```

---

## Separator

```html
<!-- With horizontal padding (default) -->
<div class="ios-separator"></div>

<!-- Full width -->
<div class="ios-separator ios-separator-full"></div>
```

---

## Color Utilities

### Text colors
`.ios-blue`, `.ios-green`, `.ios-red`, `.ios-orange`, `.ios-yellow`, `.ios-purple`, `.ios-pink`, `.ios-teal`, `.ios-indigo`, `.ios-cyan`, `.ios-mint`, `.ios-brown`

### Background colors
`.ios-bg`, `.ios-bg-secondary`, `.ios-bg-tertiary`, `.ios-bg-blue`, `.ios-bg-green`, `.ios-bg-red`, `.ios-bg-orange`, `.ios-bg-yellow`, `.ios-bg-purple`, `.ios-bg-pink`, `.ios-bg-teal`, `.ios-bg-indigo`, `.ios-bg-cyan`, `.ios-bg-mint`, `.ios-bg-brown`

### Grouped backgrounds
`.ios-bg-grouped`, `.ios-bg-grouped-secondary`, `.ios-bg-grouped-tertiary`

### Label colors
`.ios-label-secondary`, `.ios-label-tertiary`, `.ios-label-quaternary`

---

## Liquid Glass (iOS 26)

Liquid Glass is used selectively in iOS 26 — not universally. The following components **use glass**: action sheets, alerts, the tab bar, cards, and any element with an explicit `.ios-glass` class. The following components use **solid surfaces, not glass**: nav bars (transparent bar with glass pill buttons), list groups (solid white, 26px radius), sheets (solid elevated white, 38px top radius), and modals (solid elevated white, 38px radius). Standard buttons, toggles, text fields, segmented controls, and progress bars use simple fills — they are NOT glass.

The explicit `.ios-glass` class and its size variants (`.ios-glass-sm`, `.ios-glass-md`, `.ios-glass-lg`) are available for custom containers that need a glass treatment.

### Glass container

```html
<!-- Base glass panel -->
<div class="ios-glass ios-glass-md">
  <p class="ios-headline">Glass Panel</p>
  <p class="ios-body" style="margin-top:4px;">Content on a translucent surface.</p>
</div>
```

Size variants: `.ios-glass-sm` (10px radius), `.ios-glass-md` (20px radius), `.ios-glass-lg` (22px radius). All use the same `blur(20px) saturate(1.8)` backdrop filter.

### Glass buttons

```html
<!-- Neutral glass button -->
<button class="ios-btn-glass">Cancel</button>

<!-- Primary glass button (blue tinted) -->
<button class="ios-btn-glass ios-btn-glass-primary">Continue</button>
```

Standard buttons (`.ios-btn-filled`, `.ios-btn-gray`, `.ios-btn-tinted`) use simple fills with capsule (pill) shape — they are NOT glass. Use `.ios-btn-glass` for Liquid Glass buttons.

### Combining glass with other elements

Glass works best over colorful or image backgrounds. The effect is subtle over white backgrounds and pronounced over gradients or images:

```html
<div style="position:relative;background:linear-gradient(135deg,#667eea,#764ba2);padding:40px 16px;border-radius:12px;">
  <div class="ios-glass ios-glass-lg">
    <p class="ios-headline" style="color:white;">Floating card</p>
  </div>
</div>
```

### Key design notes

- Glass surfaces are **near-opaque frosted** (88% light / 82% dark), not see-through
- Glass is most visible over colorful or image backgrounds
- Buttons use capsule (pill) shape with `border-radius: 1000px`
- Action sheets and alerts use 34px border-radius; sheets use 38px top corner radius; modals use 38px border-radius
- Nav bar: transparent background; individual button groups are glass pills
- List groups: solid white, 26px border-radius; cells within are transparent
- Segmented controls use 22px container radius with pill-shaped segments

---

## Slider

```html
<div class="ios-slider">
  <div class="ios-slider-track">
    <div class="ios-slider-track-fill" style="width:50%"></div>
    <div class="ios-slider-thumb" style="left:50%"></div>
  </div>
</div>
```

- `.ios-slider` — container row, 52px height, 16px horizontal padding
- `.ios-slider-track` — 6px tall track with rounded ends, background `rgba(120,120,120,0.2)`
- `.ios-slider-track-fill` — filled portion of the track, uses `var(--ios-blue)`; set `width` via inline style
- `.ios-slider-thumb` — 38x24px pill-shaped knob (white, dual shadow); set `left` via inline style to match fill width

### With min/max labels

```html
<div style="display:flex;align-items:center;gap:8px;padding:0 16px;">
  <span class="ios-caption ios-label-secondary">0</span>
  <div class="ios-slider" style="padding:0;">
    <div class="ios-slider-track">
      <div class="ios-slider-track-fill" style="width:30%"></div>
      <div class="ios-slider-thumb" style="left:30%"></div>
    </div>
  </div>
  <span class="ios-caption ios-label-secondary">100</span>
</div>
```

---

## Combining with Tailwind

The iOS classes work alongside Tailwind utility classes. Use Tailwind for layout (flex, grid, spacing, sizing) and iOS classes for component styling:

```html
<div class="flex flex-col gap-4 p-4">
  <div class="ios-card">
    <p class="ios-headline">Card Title</p>
    <p class="ios-body mt-2">Card content here.</p>
  </div>
</div>
```

Use Tailwind for:
- Layout: `flex`, `grid`, `gap-*`, `justify-*`, `items-*`
- Spacing: `p-*`, `m-*`, `px-*`, `py-*`
- Sizing: `w-*`, `h-*`, `min-h-*`
- Positioning: `relative`, `absolute`, `fixed`
- Display: `hidden`, `block`, `inline-flex`

Use iOS classes for:
- Component appearance (buttons, lists, cards, etc.)
- Typography styles
- Color tokens
- Native-looking UI chrome

---

## Stepper

A compact increment/decrement control (92x32 pill).

| Class | Purpose |
|-------|---------|
| `.ios-stepper` | Outer container — 92x32px pill with `border-radius: 100px` |
| `.ios-stepper-btn` | Each half (46x32). SF Pro Semibold 17px, color `var(--ios-label)` |
| `.ios-stepper-separator` | Centered 1x24px divider, `rgba(60,60,67,0.3)`, `border-radius: 8px` |

### Basic usage

```html
<div class="ios-stepper">
  <div class="ios-stepper-btn">&minus;</div>
  <div class="ios-stepper-separator"></div>
  <div class="ios-stepper-btn">+</div>
</div>
```

### Inside a list cell

```html
<div class="ios-list-cell">
  <span class="ios-body" style="flex:1">Quantity</span>
  <div class="ios-stepper">
    <div class="ios-stepper-btn">&minus;</div>
    <div class="ios-stepper-separator"></div>
    <div class="ios-stepper-btn">+</div>
  </div>
</div>
```

Dark mode is automatic via `data-theme="dark"` on the screen's `<template>` parent.

---

## Context Menu

Context menus appear on long-press, showing a glass menu with optional preview area, quick action pills, and a list of menu items. The container is 250px wide with 34px border-radius.

| Class | Purpose |
|-------|---------|
| `.ios-context-menu` | Outer flex column, 250px wide, 8px gap, centers children |
| `.ios-context-menu-preview` | Optional preview card — 220x160px, white bg, 30px radius, inset shadow |
| `.ios-context-menu-actions` | Horizontal quick-action row — 6px gap, 10px horizontal padding |
| `.ios-context-menu-action` | Quick-action pill — 56px tall, 20px radius, glass bg |
| `.ios-context-menu-action-icon` | Icon inside pill — 13px, blue |
| `.ios-context-menu-action-label` | Label inside pill — SF Pro Medium 12px |
| `.ios-context-menu-items` | Glass menu body — 34px radius, 10px vertical padding |
| `.ios-context-menu-item` | Menu row — 40px height, 17px font, 8px gap, icon + label |
| `.ios-context-menu-item-icon` | 28px-wide icon column |
| `.ios-context-menu-item-destructive` | Red text (`#ff383c`) |
| `.ios-context-menu-item-disabled` | Grey text (`#bfbfbf`), no pointer events |
| `.ios-context-menu-separator` | 21px-tall divider with 1px `#e6e6e6` line |
| `.ios-context-menu-section-title` | SF Pro Medium 13px, grey (`#bfbfbf`) |

### Basic usage

```html
<div class="ios-context-menu">
  <div class="ios-context-menu-items">
    <div class="ios-context-menu-item">
      <span class="ios-context-menu-item-icon">📋</span>
      Copy
    </div>
    <div class="ios-context-menu-item">
      <span class="ios-context-menu-item-icon">📌</span>
      Pin
    </div>
    <div class="ios-context-menu-separator"></div>
    <div class="ios-context-menu-item ios-context-menu-item-destructive">
      <span class="ios-context-menu-item-icon">🗑️</span>
      Delete
    </div>
  </div>
</div>
```

### With preview and quick actions

```html
<div class="ios-context-menu">
  <div class="ios-context-menu-preview">Preview</div>
  <div class="ios-context-menu-actions">
    <div class="ios-context-menu-action">
      <span class="ios-context-menu-action-icon">❤️</span>
      <span class="ios-context-menu-action-label">Like</span>
    </div>
    <div class="ios-context-menu-action">
      <span class="ios-context-menu-action-icon">📤</span>
      <span class="ios-context-menu-action-label">Share</span>
    </div>
  </div>
  <div class="ios-context-menu-items">
    <div class="ios-context-menu-item">
      <span class="ios-context-menu-item-icon">📋</span>
      Copy
    </div>
  </div>
</div>
```

Dark mode is automatic via `data-theme="dark"` on the screen's `<template>` parent.

---

## Keyboard

System keyboard for text input screens. Supports alphabetic, numeric, and autocorrection layouts.

| Class | Purpose |
|-------|---------|
| `.ios-keyboard` | Container — full width, column flex, 4px row gap, secondary bg |
| `.ios-keyboard-row` | Row — flex with 6px gap |
| `.ios-keyboard-key` | Standard letter key — flex:1, 45px tall, 8px radius, glass fill, SF Compact 23px |
| `.ios-keyboard-key-wide` | Mode-switch key (e.g. "123") — 44px wide fixed, glass-thin fill |
| `.ios-keyboard-key-action` | Shift / delete — 44px wide fixed, glass-thin fill |
| `.ios-keyboard-key-space` | Space bar — flex:1, 45px tall, glass fill |
| `.ios-keyboard-key-return` | Return key — 92px wide, blue fill, white text, 600 weight |
| `.ios-keyboard-suggestions` | Autocorrection bar — 25px tall, 3 equal `<span>` children, 1px dividers at 10% opacity |
| `.ios-keyboard-numeric` | Modifier on `.ios-keyboard` — keys become 50px tall, 8.5px radius |

### Alphabetic Layout

```html
<div class="ios-keyboard">
  <div class="ios-keyboard-row">
    <div class="ios-keyboard-key">Q</div>
    <!-- ... 10 keys total -->
  </div>
  <div class="ios-keyboard-row" style="padding:0 18px;">
    <!-- 9 keys (A–L) -->
  </div>
  <div class="ios-keyboard-row">
    <div class="ios-keyboard-key-action">&#x21E7;</div>
    <!-- 7 keys (Z–M) -->
    <div class="ios-keyboard-key-action">&#x232B;</div>
  </div>
  <div class="ios-keyboard-row">
    <div class="ios-keyboard-key-wide">123</div>
    <div class="ios-keyboard-key-wide">&#x1F310;</div>
    <div class="ios-keyboard-key-space">space</div>
    <div class="ios-keyboard-key-return">return</div>
  </div>
</div>
```

### With Suggestions

```html
<div class="ios-keyboard">
  <div class="ios-keyboard-suggestions">
    <span>the</span><span>I</span><span>to</span>
  </div>
  <!-- rows... -->
</div>
```

### Numeric Layout

```html
<div class="ios-keyboard ios-keyboard-numeric">
  <div class="ios-keyboard-row">
    <div class="ios-keyboard-key">1</div>
    <div class="ios-keyboard-key">2</div>
    <div class="ios-keyboard-key">3</div>
  </div>
  <!-- 4 rows x 3 columns -->
</div>
```

---

## Menu

Standalone dropdown menus **are glass**. They use 34px border-radius and glass material. Menu items are 40px rows with 17px font, an optional 28px icon column, and 8px gap. Separators are 1px `#e6e6e6` lines with 8px margin. The edit bar variant is a 44px-tall pill (`border-radius: 100px`) with actions separated by 1px vertical dividers.

| Class | Purpose |
|-------|---------|
| `.ios-menu` | Glass container — 250px min-width, 34px radius, 10px vertical padding |
| `.ios-menu-item` | Menu row — 17px font, 10px vertical padding, 16px horizontal margin |
| `.ios-menu-item-destructive` | Red text for destructive actions |
| `.ios-menu-icon` | 28px-wide icon column |
| `.ios-menu-item-label` | Flex-1 label text |
| `.ios-menu-shortcut` | Right-aligned shortcut text — 15px, secondary color |
| `.ios-menu-submenu-chevron` | Right-aligned chevron for submenus — SF Pro Bold 15px |
| `.ios-menu-separator` | 1px horizontal divider |
| `.ios-menu-edit-bar` | Pill toolbar — 44px tall, 100px radius, glass bg |
| `.ios-menu-action` | Action inside edit bar — 15px font, separated by 1px borders |

### Basic menu

```html
<div class="ios-menu">
  <div class="ios-menu-item">
    <span class="ios-menu-item-label">Copy</span>
  </div>
  <div class="ios-menu-item">
    <span class="ios-menu-item-label">Paste</span>
  </div>
  <div class="ios-menu-separator"></div>
  <div class="ios-menu-item ios-menu-item-destructive">
    <span class="ios-menu-item-label">Delete</span>
  </div>
</div>
```

### With icons and submenu

```html
<div class="ios-menu">
  <div class="ios-menu-item">
    <span class="ios-menu-icon">📋</span>
    <span class="ios-menu-item-label">Copy</span>
  </div>
  <div class="ios-menu-item">
    <span class="ios-menu-icon">🔀</span>
    <span class="ios-menu-item-label">Sort By</span>
    <span class="ios-menu-submenu-chevron">›</span>
  </div>
</div>
```

### Edit bar

```html
<div class="ios-menu-edit-bar">
  <span class="ios-menu-action">Cut</span>
  <span class="ios-menu-action">Copy</span>
  <span class="ios-menu-action">Paste</span>
  <span class="ios-menu-action">Select All</span>
</div>
```

Dark mode is automatic via `data-theme="dark"` on the screen's `<template>` parent.

---

## Picker

iOS 26 provides three picker variants: wheel pickers, inline date pickers (calendar grid), and compact date pickers (collapsed pill triggers).

### Wheel Picker

Multiple scrollable columns for selecting values (time, custom lists). Each column is a `.ios-picker-wheel` inside a `.ios-picker` container. Items are 44px tall, 20px Regular. The selected item uses `.ios-picker-selected` (gray fill, 8px radius). Fade gradients on top/bottom are built in via pseudo-elements.

```html
<div class="ios-picker">
  <div class="ios-picker-wheel">
    <div class="ios-picker-item">9</div>
    <div class="ios-picker-item ios-picker-selected">10</div>
    <div class="ios-picker-item">11</div>
  </div>
  <div class="ios-picker-wheel">
    <div class="ios-picker-item">00</div>
    <div class="ios-picker-item ios-picker-selected">15</div>
    <div class="ios-picker-item">30</div>
  </div>
</div>
```

### Date Picker (Calendar Grid)

Inline calendar with a 7-column grid layout. Cells are 44x44px circles. Today is highlighted with `.ios-calendar-day-today` (blue text, light blue circle). Selected day uses `.ios-calendar-day-selected` (solid blue circle, white text). Out-of-month days use `.ios-calendar-day-outside`.

```html
<div class="ios-calendar">
  <div class="ios-calendar-header">
    <span class="ios-blue">‹</span>
    <span>March 2026</span>
    <span class="ios-blue">›</span>
  </div>
  <div class="ios-calendar-weekdays">
    <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
  </div>
  <div class="ios-calendar-grid">
    <div class="ios-calendar-day">1</div>
    <div class="ios-calendar-day ios-calendar-day-today">4</div>
    <div class="ios-calendar-day ios-calendar-day-selected">15</div>
    <!-- ... -->
  </div>
</div>
```

### Compact Date Picker (Date Pills)

Collapsed date/time selectors shown as pills in list rows. Use `.ios-date-pill` for the pill and `.ios-date-pill-active` for the currently expanded pill (solid blue, white text). Pills are 34px tall with 100px border-radius. Typically placed inside `.ios-list-cell` rows with 52px min-height.

```html
<div class="ios-list-cell" style="min-height:52px;">
  <div class="ios-list-cell-detail">
    <span>Starts</span>
    <div style="display:flex;gap:8px;">
      <span class="ios-date-pill ios-date-pill-active">Mar 15, 2026</span>
      <span class="ios-date-pill">10:00 AM</span>
    </div>
  </div>
</div>
```

| Class | Description |
|-------|-------------|
| `.ios-picker` | Flex container for wheel columns |
| `.ios-picker-wheel` | Single scrollable column (220px tall, fade edges) |
| `.ios-picker-item` | Individual row (44px, 20px Regular) |
| `.ios-picker-selected` | Selected row highlight (gray fill, 8px radius) |
| `.ios-date-pill` | Compact date/time pill (34px, 100px radius) |
| `.ios-date-pill-active` | Active pill (blue bg, white text) |
| `.ios-calendar` | Calendar container (16px horizontal padding) |
| `.ios-calendar-header` | Month/year header with nav arrows |
| `.ios-calendar-weekdays` | 7-column weekday labels (13px Semibold) |
| `.ios-calendar-grid` | 7-column day grid (7px row gap) |
| `.ios-calendar-day` | Day cell (44x44px circle, 20px) |
| `.ios-calendar-day-today` | Today highlight (blue text, light blue circle) |
| `.ios-calendar-day-selected` | Selected day (solid blue circle, white text) |
| `.ios-calendar-day-outside` | Out-of-month day (tertiary color) |

---

## Color Picker

A bottom sheet color picker with grid, spectrum, and sliders tabs. Uses a glass background with 34px top border-radius.

### Grid view (default)

```html
<div class="ios-color-picker">
  <div class="ios-color-picker-grabber"></div>
  <div class="ios-color-picker-segments">
    <div class="ios-color-picker-segment ios-color-picker-segment-active">Grid</div>
    <div class="ios-color-picker-segment">Spectrum</div>
    <div class="ios-color-picker-segment">Sliders</div>
  </div>
  <div class="ios-color-picker-grid">
    <!-- 10 rows x 12 columns of swatches -->
    <div class="ios-color-picker-swatch" style="background:#000;"></div>
    <div class="ios-color-picker-swatch ios-color-picker-swatch-selected" style="background:#007aff;"></div>
    <!-- ... -->
  </div>
</div>
```

### With opacity slider

```html
<div class="ios-color-picker-opacity">
  <div class="ios-color-picker-opacity-gradient" style="background:linear-gradient(to right, transparent, #007aff);"></div>
  <div class="ios-color-picker-opacity-knob" style="left:calc(80% - 18px);"></div>
</div>
```

### Saved swatches

```html
<div class="ios-color-picker-saved">
  <div class="ios-color-picker-preview" style="background:#007aff;"></div>
  <div class="ios-color-picker-saved-dots">
    <div class="ios-color-picker-dot ios-color-picker-dot-selected" style="background:#007aff;"></div>
    <div class="ios-color-picker-dot" style="background:#ff3b30;"></div>
    <div class="ios-color-picker-dot" style="background:#34c759;"></div>
  </div>
</div>
```

| Class | Description |
|-------|-------------|
| `.ios-color-picker` | Sheet container (706px, glass bg, 34px top radius) |
| `.ios-color-picker-grabber` | Drag handle (36x5px, rounded pill) |
| `.ios-color-picker-segments` | Tab bar (36px, pill shape, 3 segments) |
| `.ios-color-picker-segment` | Individual tab |
| `.ios-color-picker-segment-active` | Selected tab (white fill, shadow) |
| `.ios-color-picker-grid` | 12x10 CSS grid (18px border-radius, no gaps) |
| `.ios-color-picker-swatch` | Grid cell (flex:1, 30px tall) |
| `.ios-color-picker-swatch-selected` | Selected swatch (3px white outline) |
| `.ios-color-picker-opacity` | Opacity slider track (40px, checkerboard bg) |
| `.ios-color-picker-opacity-gradient` | Color gradient overlay on slider |
| `.ios-color-picker-opacity-knob` | Slider thumb (36px circle, white) |
| `.ios-color-picker-preview` | Large color preview (82x82px, 18px radius) |
| `.ios-color-picker-saved` | Saved swatches row (preview + dots) |
| `.ios-color-picker-saved-dots` | Dot container (flex, 8px gap) |
| `.ios-color-picker-dot` | Saved color dot (30px circle) |
| `.ios-color-picker-dot-selected` | Selected dot (3px white outline) |
