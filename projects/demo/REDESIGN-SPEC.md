# GrapesJS-Angular demo — visual redesign spec

Bring the demo app (`projects/demo`) up to a single, consistent, tokenized
design system with light + dark themes. The interactive reference mockup is
`redesign-mockup.html` (the editor-chrome redesign that this spec is derived
from) — treat it as the **visual source of truth**. This spec maps that mockup
onto the real Angular demo.

Repo: `grapesjs-angular` · App under test: `projects/demo/src/...`

---

## 1. Why / what's wrong today

The demo currently runs **three clashing visual systems**: a flat `#333` toolbar
with `#555` buttons, near-black custom-UI rails (`#1e1e1e`/`#2a2a2a`), and
GrapesJS's un-themed stock panels in default mode. There are ~17 one-off hex
values and no shared variables (e.g. `app.css` has `#333 #555 #666 #444 #1e1e1e
#2a2a2a #3a3a3a #2b2b2b #9aa #778 #888 #ccc #ddd #141414 #9cd #276ef1`, plus
`#0f0` terminal-green for the HTML output). Save / Get HTML / Reset are visually
identical, so there's no action hierarchy.

Goal: one token set drives the toolbar, **both** custom rails, the export output,
**and** the GrapesJS default-mode panels, with a working light/dark toggle.

---

## 2. Scope

### P0 — must ship
1. Token system (Section 4) in **global** `styles.css`, light + `[data-theme="dark"]`.
2. Rewrite `projects/demo/src/app/app.css` to consume tokens — **zero** hardcoded
   hex left (kill `#0f0`, `#276ef1`, all the greys).
3. Light/dark theme toggle (Section 8), persisted, defaulting to OS preference.
4. Toolbar button hierarchy (Section 6): one primary, neutral secondaries, quiet
   destructive Reset.
5. Theme the GrapesJS **default mode** via its `--gjs-*` CSS variables in global
   `styles.css` (Section 9) so toggling Custom → Default no longer jump-cuts.
6. Typography: Inter (UI) + JetBrains Mono (IDs, selectors, style values, HTML
   output) — Section 5.

### P1 — nice, do if cheap
- Export output as a slide-up dock with a Copy button + light syntax tint
  (replaces the bare `<pre class="html-output">`).
- Convert the single Custom/Default `.toggle` button into a real 2-segment
  control; same for the device picker.
- Selection-badge / block hover-lift polish to match the mockup.

### Non-goals
- No new runtime dependencies (web fonts via `<link>` are fine; see Section 5).
- Don't restructure `app.html` control-flow, the `gjs-*` providers, or `app.ts`
  editor logic. You may **add** CSS classes/attributes and the theme-toggle
  control only.
- The canvas document (the page being built) stays as-is — it is user content,
  not editor chrome. Don't theme the iframe contents.

---

## 3. Angular gotcha — global vs component CSS (read before coding)

The demo uses Angular's default (emulated) view encapsulation, so selectors in
`app.css` are attribute-scoped and only match **Angular-rendered** DOM.

- The **custom-UI** panels are rendered by the providers' Angular templates —
  style them in `app.css` (scoped is fine).
- The **default-mode** GrapesJS panels are created by GrapesJS's own JS — they
  have **no** Angular scoping attributes, so `app.css` rules will NOT reach them.
  All GrapesJS theming (`--gjs-*` vars and any `.gjs-*` overrides) must live in
  **global `styles.css`** (unscoped).
- The design **tokens** must be global too — put them on `:root` in `styles.css`
  so both the component CSS and the GrapesJS vars can reference them.

---

## 4. Design tokens — paste into global `styles.css`

Add **after** the `@import 'grapesjs/dist/css/grapes.min.css';` line so overrides win.

```css
:root {
  /* surfaces */
  --app-bg:    oklch(95.5% 0.005 250);   /* canvas backdrop */
  --panel:     oklch(99.2% 0.002 250);   /* toolbar + rails */
  --panel-2:   oklch(97% 0.004 250);     /* insets, tiles, inputs */
  --panel-3:   oklch(94.2% 0.006 250);   /* hover */
  /* text */
  --fg:        oklch(26% 0.02 255);
  --fg-2:      oklch(47% 0.016 255);     /* muted */
  --fg-3:      oklch(60% 0.012 255);     /* faint / captions */
  /* lines */
  --border:    oklch(89% 0.007 255);
  --border-2:  oklch(83% 0.009 255);
  /* accent — GrapesJS "grape" violet; the ONE brand signal */
  --accent:        oklch(52% 0.17 300);  /* fill (primary button) */
  --accent-strong: oklch(47% 0.16 300);  /* accent text/icons on light */
  --accent-ink:    oklch(99% 0.01 300);  /* text on accent fill */
  --accent-wash:   color-mix(in oklab, var(--accent) 14%, transparent);
  /* canvas selection — deliberately a DIFFERENT hue from accent */
  --select:      oklch(60% 0.17 250);
  --select-wash: color-mix(in oklab, var(--select) 12%, transparent);
  /* status */
  --success:   oklch(58% 0.13 155);
  --warn:      oklch(66% 0.15 52);
  --danger:    oklch(57% 0.19 25);
  /* effects */
  --shadow-pop: 0 12px 32px oklch(20% 0.03 255 / .18), 0 2px 6px oklch(20% 0.03 255 / .12);
  /* type */
  --font-ui:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
  /* radii */
  --r1: 6px; --r2: 8px; --r3: 10px; --r4: 14px;
}

html[data-theme="dark"] {
  --app-bg:    oklch(16.5% 0.012 260);
  --panel:     oklch(21.5% 0.013 260);
  --panel-2:   oklch(25.5% 0.013 260);
  --panel-3:   oklch(30% 0.015 260);
  --fg:        oklch(93% 0.01 250);
  --fg-2:      oklch(71% 0.014 250);
  --fg-3:      oklch(56% 0.014 250);
  --border:    oklch(30% 0.014 260);
  --border-2:  oklch(38% 0.016 260);
  --accent:        oklch(72% 0.16 300);
  --accent-strong: oklch(78% 0.15 300);
  --accent-ink:    oklch(22% 0.05 300);
  --accent-wash:   color-mix(in oklab, var(--accent) 18%, transparent);
  --select:      oklch(70% 0.15 250);
  --select-wash: color-mix(in oklab, var(--select) 18%, transparent);
  --success:   oklch(72% 0.14 155);
  --warn:      oklch(76% 0.15 62);
  --danger:    oklch(68% 0.17 25);
  --shadow-pop: 0 16px 40px oklch(0% 0 0 / .5), 0 2px 8px oklch(0% 0 0 / .4);
}
```

Also set the app surface + font globally:

```css
html, body { background: var(--app-bg); color: var(--fg); }
body { font-family: var(--font-ui); -webkit-font-smoothing: antialiased; }
```

**Token-usage rules** (carry over from the mockup):
- Accent appears at most ~2 places per view: the **primary** toolbar button and
  the **active page** marker. Do NOT tint every panel header with accent.
- Canvas/component **selection** uses `--select` (blue), never `--accent`. The
  two must never be the same colour.
- Status colours only for real status (errors, save success). Default panel
  header icons are `--fg-3`, not accent.

---

## 5. Typography

Add to `projects/demo/src/index.html` `<head>` (or self-host the woff2 under
`public/` if you prefer no CDN):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;510;560;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- UI text: `var(--font-ui)`.
- Mono (`var(--font-mono)`): the HTML export output, selector chips, style
  property values, layer tag labels, any IDs/hashes. Use
  `font-variant-numeric: tabular-nums` on numerics.
- Uppercase panel labels (`.panel h3`/`h4`): keep uppercase but set
  `letter-spacing: 0.085em` (current is fine; ensure ≥ 0.06em). Size 11px.

---

## 6. Toolbar (`app.css` `.toolbar` + `app.html` minimal class adds)

Real toolbar markup today: `Save`, `Get HTML`, `Reset` buttons, the
`gjs-devices-provider` select, and the Custom/Default `.toggle` button. There is
**no logo** in the real toolbar — nothing to remove there (the mockup's wordmark
is demo chrome only; optionally add a plain text `GrapesJS Angular` label, no
icon tile).

| Element | Treatment |
|---|---|
| `.toolbar` | `background: var(--panel)`; `border-bottom: 1px solid var(--border)`; height ~52px; `align-items:center; gap:6px; padding:0 14px` |
| `Get HTML` (export = primary) | accent fill: `background:var(--accent); color:var(--accent-ink); border:0`. Add class `btn-primary` in `app.html`. |
| `Save` (secondary) | `background:var(--panel-2); border:1px solid var(--border); color:var(--fg)`; hover `--panel-3` |
| `Reset` (quiet/destructive) | ghost: transparent bg/border; text `--fg-2`; hover bg `--panel-2`, text `--danger` |
| `.toggle` (Custom/Default) | neutral segmented look (not accent). P1: make it a real 2-segment control. |
| `.device-select` | styled `select`: `--panel-2` bg, `--border`, `--r2`, custom chevron, mono optional |
| theme toggle (new) | 32×32 icon button, sun/moon, `--fg-2`, hover `--panel-2` (Section 8) |

Buttons share: height 32px, `border-radius: var(--r2)`, `font: 510 12.5px ...`,
`:active { transform: translateY(1px) }`, focus ring
`box-shadow: 0 0 0 3px var(--accent-wash)`.

---

## 7. Custom-UI panels — token map (`app.css`)

Replace every hardcoded value with the token. Key selectors that exist today:

| Selector(s) | Replace with |
|---|---|
| `.custom-sidebar`, `.custom-sidebar-left/right` | bg `--panel`; borders `--border` |
| `.panel`, `.panel:last-child` border | `--border` |
| `.panel h3` | `--fg-2`, uppercase, `letter-spacing:.085em`, 11px |
| `.panel h4` | `--fg-3` |
| `.muted` | `--fg-3` |
| `.panel li` / `:hover` / `.active` | text `--fg-2`; hover/active bg `--panel-2`, text `--fg`; active gets a 2.5px `--accent` left bar |
| `.block` | bg `--panel-2`, border `--border`, text `--fg-2`, `--r2`; hover bg `--panel-3`, border `--border-2`, `translateY(-1px)` |
| `.block.is-source` | `opacity:.35` (keep) |
| `.panel button` (e.g. `+ Page`) | secondary button tokens |
| `.layer-row` / `:hover` / active | text `--fg-2`; hover `--panel-2`; active bg `--select-wash`, text `--fg`; tag label mono `--fg-3` |
| `.layer-children` border | `--border` |
| `.chip` | bg `--accent-wash`, text `--accent-strong`, border `color-mix(--accent 35%, transparent)`, mono, pill |
| `.state-select`, `.trait input`, selects | `.ctl` style: `--panel-2`/`--border`/`--r2`; focus border `--accent` + `--accent-wash` ring |
| `.property-list` / `code` | mono; remove the `!important` pile-up by scoping; value text `--accent-strong` or `--fg`; code bg `--panel-2` |
| `.trait span` | `--fg-3`, uppercase, `letter-spacing:.05em` |
| `.drop-indicator` border + `.drop-hint` | `--accent` (action) — was `#276ef1` |
| `.drag-ghost` | bg `--accent`, text `--accent-ink` — was `#276ef1` |
| `.overlay` | `background: oklch(0% 0 0 / .5)` |
| `.overlay-card` | bg `--panel`, border `--border`, `--shadow-pop`, `--r3` |
| `.asset-tile` / `:hover` | bg `--panel-2`, border `--border`; hover border `--accent` |
| `.html-output` | bg `--panel-2`, text `--fg-2`, mono — **delete `color:#0f0`** |

Selection of a component on the canvas (GrapesJS selection outline) → `--select`
(see Section 9 for default mode).

---

## 8. Theme toggle (`app.ts` + `app.html`)

`app.ts`:
```ts
import { DOCUMENT } from '@angular/common';
// ...
private doc = inject(DOCUMENT);
protected theme = signal<'light' | 'dark'>('light');

constructor() {
  const saved = localStorage.getItem('gjs-demo-theme');
  const initial = saved ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  this.setTheme(initial as 'light' | 'dark');
}
toggleTheme(): void { this.setTheme(this.theme() === 'dark' ? 'light' : 'dark'); }
private setTheme(t: 'light' | 'dark'): void {
  this.theme.set(t);
  this.doc.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('gjs-demo-theme', t); } catch {}
}
```
`app.html` — add to the toolbar:
```html
<button class="icon-btn" (click)="toggleTheme()" [attr.aria-label]="'Toggle theme'">
  <!-- inline sun/moon SVG switched on theme() -->
</button>
```
(Prefer inline monoline SVGs over glyphs — see the mockup's sun/moon paths.) Set
`data-theme` on `<html>` (documentElement), not on `demo-root`, so the GrapesJS
panels inherit it.

---

## 9. GrapesJS default-mode theming (global `styles.css`)

GrapesJS exposes CSS custom properties. **Verify the exact names for the
installed version** first:

```
grep -o '\-\-gjs-[a-z0-9-]*' node_modules/grapesjs/dist/css/grapes.min.css | sort -u
```

Then map our tokens onto them globally (typical set — adjust to what the grep
returns):

```css
:root {
  --gjs-primary-color:    var(--panel);     /* panel backgrounds */
  --gjs-secondary-color:  var(--fg-2);      /* icons / labels */
  --gjs-tertiary-color:   var(--accent);    /* links / active */
  --gjs-quaternary-color: var(--accent-strong); /* hover/active accent */
  --gjs-font-color:        var(--fg);
  --gjs-font-color-active: var(--fg);
  --gjs-main-dark-color:   var(--panel-2);
  --gjs-main-light-color:  var(--panel);
}
```

For anything the variables don't reach (some elements use fixed colours), add a
small set of scoped `.gjs-*` overrides in **global** `styles.css` — e.g.
`.gjs-pn-panel`, `.gjs-sm-sector-title`, `.gjs-block`, `.gjs-layer-title`,
toolbars, and the canvas selection/badge colours (target the badge/highlight to
`--select`). Keep it to what's needed to make the two modes read as one product;
don't rebuild GrapesJS.

Acceptance for this section: flipping Custom → Default in either theme shows the
same palette, type, and border language — no stock-grey panels.

---

## 10. Details / a11y
- Contrast: body text ≥ 4.5:1, large/UI ≥ 3:1, in both themes (the tokens are
  tuned for this; verify after wiring).
- Visible focus ring on all interactive controls: `0 0 0 3px var(--accent-wash)`.
- Respect `prefers-reduced-motion` for the hover lifts / dock slide.
- Keep existing keyboard/drag behaviour intact.

---

## 11. Acceptance criteria
- [ ] `npm run build` (or `ng build demo`) passes; app runs via the demo's start script.
- [ ] No hardcoded hex in `app.css` except inside `var(--token)` definitions
      (`grep -nE '#[0-9a-fA-F]{3,8}' projects/demo/src/app/app.css` → only token defs, ideally none).
- [ ] `#0f0` and `#276ef1` are gone.
- [ ] Theme toggle flips the whole editor (toolbar + both rails + GrapesJS
      panels) and persists across reload.
- [ ] Custom and Default modes share one visual language in both themes.
- [ ] Save / Get HTML / Reset have clear primary / secondary / quiet hierarchy.
- [ ] HTML export output is mono on a panel surface (no terminal green).
- [ ] No console errors; drag-ghost, drop-indicator, asset/modal overlays still work.
