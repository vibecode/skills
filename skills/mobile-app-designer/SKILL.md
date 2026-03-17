---
name: mobile-app-designer
description: Design mobile app screens on a Figma-like interactive canvas with iOS design system components. Use when the user wants to design, prototype, wireframe, mock up, redesign, or compare a mobile app UI, including turning a product brief, PM notes, rough feature request, or local docs file into a believable iPhone app flow. Trigger for new concepts, feature explorations, redesigns, variants, or visual mocks for investor reviews and product planning. Do NOT use for building functional mobile apps (Swift, React Native, Flutter), generating production code, or backend/API work — this skill produces static visual mockups only.
---

# Mobile App Designer

Design native-looking iOS app screens on a Figma-like infinite canvas — entirely local, no server required. Generate an HTML file with screen content; the bundled canvas app renders iPhone 15 Pro frames with pan/zoom, draggable frame repositioning, hover highlights, and editable screen titles (double-click to rename).

## Design operating mode

This skill should behave like a product designer with strong taste, not just an HTML assembler.

- Treat the user's request as a product/design brief
- Make reasonable assumptions and move forward instead of asking many clarifying questions
- Prefer polished, production-quality mobile UI over low-fidelity wireframes unless the user explicitly asks for wireframes
- Produce a coherent app flow, not isolated screens with no relationship to each other
- Preserve continuity across screens: information architecture, navigation model, visual language, copy tone, icon style, spacing rhythm, and component usage should stay consistent
- Use native iOS patterns by default; do not drift into generic web UI
- Optimize for clarity, hierarchy, and one primary action per screen

## Style brief

When designing a mobile app experience:

- Infer the app's primary user, core job-to-be-done, and usage context from the prompt
- Choose a clear product direction quickly instead of exploring every possibility
- Design the smallest set of screens that makes the concept feel complete, usually 3 to 7 screens
- Make each screen feel intentionally composed, with a strong focal point and obvious primary action
- Favor realistic product copy, believable data, and concrete UI states over placeholder text
- Use spacing, typography, grouping, and color to create strong visual hierarchy
- Keep screens visually differentiated by purpose, but unified by one design system
- Default to modern, tasteful, high-signal aesthetics; avoid clutter, filler cards, and repetitive sections
- If the prompt is underspecified, fill in sensible product details silently and continue
- If multiple interpretations are plausible, pick the strongest one and execute it well

## Workflow

For a new app or feature:

1. Infer the product concept, target user, and core flow.
2. Decide the minimum useful screen set.
3. Establish a visual direction:
   typography tone, color story, chrome style, density, icon treatment, and how glass is used.
4. Lay out the primary screen first.
5. Build supporting screens that feel like natural continuations of the same app.
6. Ensure navigation and state transitions are obvious from the set of frames.

### Handling briefs, notes, and missing inputs

- If the user references a PRD, PM brief, notes file, screenshot, or rough feature request, treat that artifact as design input rather than as a reason to stop
- Read the referenced artifact when it exists and extract the product goal, target user, priority flows, and any explicit constraints
- If the referenced file is missing, inaccessible, or vague, do not abandon the design task; say so briefly, make sensible product assumptions, and continue unless the user explicitly wants you to wait
- When a brief is rough or incomplete, convert it into a stronger product direction instead of mirroring its ambiguity on the canvas
- If the artifact contains too much detail, simplify ruthlessly and keep only the parts that materially change the screens

For edits:

- Preserve the existing flow and visual language unless the user asks for a broader redesign
- Change only the requested aspects, but carry those changes through consistently
- Avoid accidental regressions in spacing, hierarchy, or navigational structure
- Before finishing an edit, verify that navigation, visual rhythm, copy tone, icon style, and component choices still feel like one product

For variants:

- Make the differences legible at a glance
- Vary one or two major design dimensions on purpose, such as layout, color system, or content density
- Do not generate near-duplicates

## Screen quality bar

Every screen should satisfy these checks:

- It is obvious what the screen is for within 2 seconds
- The primary action is visually dominant
- The layout has clean alignment and consistent spacing
- Important information is chunked into digestible groups
- Empty, loading, or secondary states are shown when they materially help the concept
- The screen looks like a real mobile product, not a generic dashboard pasted into a phone frame

## Definition of done

Before considering the task complete, check the output against this bar:

- The screen set tells a coherent product story from first frame to last frame
- Each screen has a distinct role in the flow; there are no filler screens
- Typography, spacing, iconography, and color choices feel intentional rather than default
- The result feels native to iPhone conventions even when the product concept is novel
- If the user asked for a brief-driven design, the most important ideas from the brief are visibly reflected in the frames
- If assumptions were needed, they improve the product direction instead of making it generic

## Scaffolding a new design project

When the user asks to design a mobile app:

1. Create the project directory:
```bash
mkdir -p <project-name>
```

2. Copy the canvas bundle from this skill's assets:
```bash
cp "<skill-assets-dir>/canvas.min.js" <project-name>/canvas.min.js
```

The `<skill-assets-dir>` is the `assets/` folder inside this skill's installation directory (same folder as this SKILL.md, then `assets/`).

3. Write `index.html` using the template below

4. Open in the browser:
```bash
open <project-name>/index.html
```

The expected deliverable is a local project folder with `index.html` at the root and `canvas.min.js` beside it. Unless the user asked for something narrower, finish by telling them where the project lives and that the canvas supports pan, zoom, drag, and inline title editing.

## index.html template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>APP_NAME — Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Manifest: lists all screens -->
  <script id="manifest" type="application/json">
  {
    "screens": [
      { "id": "SCREEN_ID", "title": "Screen Title" }
    ]
  }
  </script>

  <!-- Screen templates -->
  <template id="screen-SCREEN_ID">
    <div class="ios-safe-area-top"></div>
    <!-- Screen content here -->
    <div class="ios-safe-area-bottom"></div>
  </template>

  <div id="canvas-root"></div>
  <script src="canvas.min.js"></script>
</body>
</html>
```

Replace `APP_NAME`, `SCREEN_ID`, and screen content. Add one `<template>` per screen and a matching entry in the manifest.

## Writing screens

Each screen is a `<template id="screen-{id}">` tag. The template content is injected into an iPhone 15 Pro frame (393×852px viewport) with a white background.

### Screen structure

```html
<template id="screen-home">
  <div class="ios-safe-area-top"></div>

  <!-- Nav bar -->
  <div class="ios-nav-bar">
    <span></span>
    <span class="ios-nav-bar-title">Home</span>
    <span class="ios-btn-plain ios-blue">Edit</span>
  </div>

  <!-- Scrollable content -->
  <div class="flex flex-col">
    <!-- Your content using iOS classes + Tailwind -->
  </div>

  <!-- Tab bar (if needed) -->
  <div class="ios-tab-bar" style="position:absolute;bottom:0;left:0;right:0;">
    <a class="ios-tab-bar-item ios-tab-bar-item-active">
      <span class="ios-tab-bar-icon">🏠</span>
      <span>Home</span>
    </a>
    <a class="ios-tab-bar-item">
      <span class="ios-tab-bar-icon">⚙️</span>
      <span>Settings</span>
    </a>
  </div>

  <div class="ios-safe-area-bottom"></div>
</template>
```

### Key rules

- Always include `.ios-safe-area-top` (59px) at the top — the Dynamic Island is rendered by the frame
- Include `.ios-safe-area-bottom` (34px) at the bottom for the home indicator
- Use iOS component classes for native appearance (see Component Reference below)
- Use Tailwind utilities for layout: `flex`, `gap-*`, `p-*`, `mt-*`, etc.
- Use emoji or inline SVG for icons
- The viewport is 393×852px — do not set width/height on the template root

### Positioning tab bars

Tab bars in iOS 26 are floating glass pills. Pin them to the bottom:
```html
<div class="ios-tab-bar" style="position:absolute;bottom:0;left:0;right:0;">
```

When a screen has a tab bar, add bottom padding to the content area so it doesn't overlap:
```html
<div class="flex flex-col" style="padding-bottom:83px;">
```

### Using Liquid Glass

Add `.ios-glass` to any container for a translucent blurred surface. Combine with size variants (`.ios-glass-sm`, `.ios-glass-md`, `.ios-glass-lg`) for preset blur, padding, and border-radius. Use `.ios-btn-glass` / `.ios-btn-glass-primary` for glass-style buttons.

### Dark mode

Add `data-theme="dark"` to the `.ios-screen` element. All color tokens switch to their dark-mode values automatically.

## Canvas interactions

The canvas supports Figma-like interactions out of the box:

- **Pan**: Click and drag on the background, or two-finger swipe
- **Zoom**: Pinch-to-zoom or Ctrl/Cmd+scroll
- **Hover**: Frames show a blue highlight border on hover
- **Drag frames**: Click and drag a frame's bezel to reposition it on the canvas
- **Rename**: Double-click a frame's title to edit it inline

Inform the user about these interactions when opening a design for the first time.

## Adding and editing screens

1. Add a new `<template id="screen-{id}">` tag
2. Add a corresponding entry to the manifest JSON: `{ "id": "...", "title": "..." }`
3. Tell the user to refresh their browser

When editing an existing screen, modify its `<template>` content. No manifest change needed unless the title changes.

## Component quick reference

| Component | Classes |
|-----------|---------|
| Nav Bar | `.ios-nav-bar`, `.ios-nav-bar-title`, `.ios-nav-bar-large` |
| Tab Bar | `.ios-tab-bar`, `.ios-tab-bar-item`, `.ios-tab-bar-item-active` |
| List | `.ios-list`, `.ios-list-inset`, `.ios-list-group`, `.ios-list-cell`, `.ios-list-cell-detail` |
| Buttons | `.ios-btn` + `.ios-btn-filled` / `.ios-btn-gray` / `.ios-btn-tinted` / `.ios-btn-plain` |
| Liquid Glass | `.ios-glass` + `.ios-glass-sm` / `.ios-glass-md` / `.ios-glass-lg`, `.ios-btn-glass`, `.ios-btn-glass-primary` |
| Toggle | `.ios-toggle`, `.ios-toggle-on` |
| Text Field | `.ios-text-field` |
| Search | `.ios-search-bar`, `.ios-search-bar-input` |
| Segments | `.ios-segmented-control`, `.ios-segment`, `.ios-segment-active` |
| Card | `.ios-card` |
| Sheet | `.ios-sheet`, `.ios-sheet-handle` |
| Alert | `.ios-alert`, `.ios-alert-actions`, `.ios-alert-action` |
| Badge | `.ios-badge` |
| Progress | `.ios-progress`, `.ios-progress-bar` |
| Spinner | `.ios-spinner` |
| Typography | `.ios-title-large`, `.ios-title`, `.ios-headline`, `.ios-body`, `.ios-caption`, `.ios-footnote` |
| Colors | `.ios-blue`, `.ios-green`, `.ios-red`, `.ios-cyan`, `.ios-mint`, `.ios-brown`, `.ios-bg-blue`, `.ios-bg-secondary`, `.ios-bg-cyan`, `.ios-bg-mint`, `.ios-bg-brown`, etc. |
| Separator | `.ios-separator` |

For full HTML examples of every component, read the reference file at `references/ios-components.md` in this skill's directory.

## Example: 2-screen Todo app

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Todo App — Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <script id="manifest" type="application/json">
  {
    "screens": [
      { "id": "tasks", "title": "Tasks" },
      { "id": "new-task", "title": "New Task" }
    ]
  }
  </script>

  <template id="screen-tasks">
    <div class="ios-safe-area-top"></div>
    <div class="ios-nav-bar">
      <span class="ios-btn-plain ios-blue">Edit</span>
      <span></span>
      <span class="ios-btn-plain ios-blue">＋</span>
    </div>
    <div class="ios-nav-bar-large">
      <span class="ios-title-large">Tasks</span>
    </div>
    <div class="ios-search-bar">
      <input class="ios-search-bar-input" placeholder="Search tasks" />
    </div>
    <div class="ios-list ios-list-inset" style="padding-bottom:83px;">
      <div class="ios-list-header">TODAY</div>
      <div class="ios-list-group">
        <div class="ios-list-cell">
          <span style="margin-right:12px;font-size:20px;">☑️</span>
          <div>
            <p class="ios-body" style="text-decoration:line-through;color:var(--ios-label-secondary);">Buy groceries</p>
          </div>
        </div>
        <div class="ios-list-cell">
          <span style="margin-right:12px;font-size:20px;">⬜</span>
          <div>
            <p class="ios-body">Review pull requests</p>
            <p class="ios-caption ios-label-secondary">Due by 5:00 PM</p>
          </div>
        </div>
        <div class="ios-list-cell">
          <span style="margin-right:12px;font-size:20px;">⬜</span>
          <div>
            <p class="ios-body">Call dentist</p>
            <p class="ios-caption ios-label-secondary">High priority</p>
          </div>
        </div>
      </div>
      <div class="ios-list-header">TOMORROW</div>
      <div class="ios-list-group">
        <div class="ios-list-cell">
          <span style="margin-right:12px;font-size:20px;">⬜</span>
          <div>
            <p class="ios-body">Team standup</p>
            <p class="ios-caption ios-label-secondary">9:00 AM</p>
          </div>
        </div>
      </div>
    </div>
    <div class="ios-tab-bar" style="position:absolute;bottom:0;left:0;right:0;">
      <a class="ios-tab-bar-item ios-tab-bar-item-active">
        <span class="ios-tab-bar-icon">📋</span>
        <span>Tasks</span>
      </a>
      <a class="ios-tab-bar-item">
        <span class="ios-tab-bar-icon">📅</span>
        <span>Calendar</span>
      </a>
      <a class="ios-tab-bar-item">
        <span class="ios-tab-bar-icon">⚙️</span>
        <span>Settings</span>
      </a>
    </div>
    <div class="ios-safe-area-bottom"></div>
  </template>

  <template id="screen-new-task">
    <div class="ios-safe-area-top"></div>
    <div class="ios-nav-bar">
      <span class="ios-btn-plain ios-blue">Cancel</span>
      <span class="ios-nav-bar-title">New Task</span>
      <span class="ios-btn-plain ios-blue" style="font-weight:600;">Add</span>
    </div>
    <div class="flex flex-col gap-4 p-4">
      <input class="ios-text-field" placeholder="Task name" />
      <input class="ios-text-field" placeholder="Notes" />
      <div class="ios-list ios-list-inset" style="padding:0;">
        <div class="ios-list-group">
          <div class="ios-list-cell">
            <div class="ios-list-cell-icon ios-bg-red">📅</div>
            <div class="ios-list-cell-detail">
              <span>Date</span>
              <span class="ios-list-cell-value">Today</span>
            </div>
          </div>
          <div class="ios-list-cell">
            <div class="ios-list-cell-icon ios-bg-orange">🔔</div>
            <div class="ios-list-cell-detail">
              <span>Reminder</span>
              <span class="ios-list-cell-value">None</span>
            </div>
          </div>
          <div class="ios-list-cell">
            <div class="ios-list-cell-icon ios-bg-blue">🏷️</div>
            <div class="ios-list-cell-detail">
              <span>Priority</span>
              <span class="ios-list-cell-value">Medium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ios-safe-area-bottom"></div>
  </template>

  <div id="canvas-root"></div>
  <script src="canvas.min.js"></script>
</body>
</html>
```

---
