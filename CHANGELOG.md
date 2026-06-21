# Changelog

All notable changes to `@ilq/grapesjs-angular` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [2.0.0-beta.2] — 2026-06-21

This release restructures the library to mirror [`@grapesjs/react`](https://github.com/GrapesJS/react), the official React wrapper. A new **custom-UI provider model** lets you compose the entire editor shell — sidebars, blocks, layers, style/trait panels — from Angular templates instead of GrapesJS's built-in panels, reaching feature parity with the React render-props API. **Contains breaking changes vs `2.0.0-beta.1`** (see _Changed_).

### Added

- `<gjs-canvas>` mount-point component enabling custom UI mode — when projected into `<gjs-editor>`, swaps the editor's default container and disables default panels.
- Nine provider components mirroring the `@grapesjs/react` render-props surface, each exposing typed manager state to a projected `<ng-template>`:
  - `<gjs-blocks-provider>` — `BlocksState` (blocks, drag handlers, container, category map)
  - `<gjs-layers-provider>` — `LayersState` (root component, container)
  - `<gjs-selectors-provider>` — `SelectorsState` (selectors, states, targets, mutators, container)
  - `<gjs-styles-provider>` — `StylesState` (visible sectors, container)
  - `<gjs-traits-provider>` — `TraitsState` (current traits, container)
  - `<gjs-pages-provider>` — `PagesState` (pages, selected, mutators)
  - `<gjs-devices-provider>` — `DevicesState` (devices, selected, select)
  - `<gjs-assets-provider>` — `AssetsState` (open, assets, types, select, close, container)
  - `<gjs-modal-provider>` — `ModalState` (open, title, content, attributes, close)
- `*gjsContainer` directive for appending a GrapesJS-owned `HTMLElement` into a host element (Angular equivalent of React's portal `Container`).
- New component outputs: `editorCreated` (fires synchronously after `grapesjs.init()` returns), `projectUpdated` (fires on every `'update'` event with latest `ProjectData`).
- New component inputs: `grapesjsCss` (async `<link>` injection before init), `waitReady` (`boolean | TemplateRef<unknown>` — hide/replace the editor host until `editor.onReady()` fires).
- New service signal `isInitialized` — `true` after `grapesjs.init()` returns.
- Async CDN plugin loading — `plugins` input now accepts `{ id, src, options }` descriptors alongside function references and global names.
- Public types: `PluginToLoad`, `PluginTypeToLoad`, `GrapesPlugin`, `ProjectUpdatePayload`.

### Changed

- **BREAKING vs `2.0.0-beta.1`** — `editorReady` output semantics changed and the earlier-firing name was moved:
  - Output `editorReady` (previously fired on GrapesJS `'load'`) is renamed to `editorLoaded` — same firing point, clearer name.
  - Output `editorReady` now fires on `editor.onReady()` (post-mount, post-storage-load) to match `@grapesjs/react` `onReady` semantics.
- **BREAKING vs `2.0.0-beta.1`** — service signal `isReady` semantics changed:
  - Signal `isReady` (previously flipped after init) is renamed to `isInitialized`.
  - Signal `isReady` now reflects the post-`editor.onReady()` state.
- `plugins` input widened from `Plugin[]` to `PluginTypeToLoad[]` — source-compatible; existing `Plugin[]` assignments still compile.
- `<gjs-editor>` now defaults the GrapesJS init config to `height: '100%'` and `width: '100%'` so the editor fills its host element. GrapesJS's internal default of `height: 900px` was overflowing flex layouts. Consumer config still overrides.

### Fixed

- `<gjs-selectors-provider>` and `<gjs-styles-provider>` now render their projected template on init. In custom-UI mode GrapesJS skips its default panel render — the only place it fires the initial `selector:custom` / `style:custom` event — so these panels stayed empty until a component was selected. Both providers now self-trigger the event on `wire()`, matching `<gjs-traits-provider>`.
- SSR-safe: `<gjs-editor>` no longer calls `grapesjs.init()` or touches DOM APIs when `PLATFORM_ID === 'server'` — the host renders inert and `ngOnDestroy` short-circuits.

## [2.0.0-beta.1] — 2026-04-23

Initial public release on npm. Angular 20+ wrapper for [GrapesJS](https://grapesjs.com/), signals-based, standalone, zoneless-compatible.

- `<gjs-editor>` standalone component with `config` and `plugins` inputs, `editorReady` / `projectSaved` / `projectLoaded` / `componentSelected` / `blockAdded` outputs.
- `GrapesJsEditorService` exposing every GrapesJS manager as a signal, plus `isReady`, `selectedComponent`, and `getHtml` / `getCss` / `getProjectData` / `loadProjectData` helpers.
- `provideGrapesJs(config)` environment provider + `GRAPES_JS_DEFAULT_CONFIG` injection token.

## [2.0.0-alpha.1]

Pre-release development milestone — not published to npm.

- Standalone `<gjs-editor>` component with OnPush change detection.
- `GrapesJsEditorService` with signals for editor state and all GrapesJS managers.
- `provideGrapesJs()` for app-wide default configuration.
- Zoneless-compatible (no Zone.js dependency).

---

Keep the `[Unreleased]` section up-to-date as changes land; move its entries under a new version heading at release time.

[Unreleased]: https://github.com/internetliquid/grapesjs-angular/compare/v2.0.0-beta.2...HEAD
[2.0.0-beta.2]: https://github.com/internetliquid/grapesjs-angular/compare/v2.0.0-beta.1...v2.0.0-beta.2
[2.0.0-beta.1]: https://github.com/internetliquid/grapesjs-angular/releases/tag/v2.0.0-beta.1
