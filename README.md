# @ilq/grapesjs-angular

[![npm version](https://img.shields.io/npm/v/@ilq/grapesjs-angular)](https://www.npmjs.com/package/@ilq/grapesjs-angular)
[![CI](https://github.com/internetliquid/grapesjs-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/internetliquid/grapesjs-angular/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What is this?

An Angular wrapper for the [GrapesJS](https://grapesjs.com/) web builder framework. Embed a fully functional drag-and-drop page editor in your Angular app with all GrapesJS managers accessible as Angular signals.

**[Live Demo →](https://internetliquid.github.io/grapesjs-angular/)**  ·  **[npm package →](https://www.npmjs.com/package/@ilq/grapesjs-angular)**

## Angular Version Support

| Angular | Supported |
| ------- | --------- |
| 21      | Yes       |
| 20      | Yes       |
| 19 and below | No — requires deprecated APIs (`NgModules`, `ComponentFactoryResolver`) removed in modern Angular |

## Installation

> **Pre-release:** the library is in beta — `npm install` gives you the newest beta (the `latest` tag tracks the most recent release until a stable `1.0`).

```bash
npm install @ilq/grapesjs-angular grapesjs
```

Add the GrapesJS CSS to your project:

**angular.json:**

```json
"styles": [
  "node_modules/grapesjs/dist/css/grapes.min.css",
  "src/styles.css"
]
```

**Vite / standalone CSS import:**

```css
@import 'grapesjs/dist/css/grapes.min.css';
```

## Quick Start

**app.config.ts:**

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideGrapesJs } from '@ilq/grapesjs-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideGrapesJs({
      storageManager: false,
    }),
  ],
};
```

**Template:**

```html
<gjs-editor
  (editorReady)="onEditorReady($event)"
  (projectSaved)="onProjectSaved($event)">
</gjs-editor>
```

**Using the service:**

```typescript
import { GrapesJsEditorService } from '@ilq/grapesjs-angular';

export class MyComponent {
  private editorService = inject(GrapesJsEditorService);

  save() {
    const html = this.editorService.getHtml();
    const css = this.editorService.getCss();
    console.log(html, css);
  }
}
```

## Inputs & Outputs

### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `config` | `GrapesJsConfig` | `{}` | GrapesJS editor config (merged with global config) |
| `plugins` | `PluginTypeToLoad[]` | `[]` | Plugins as functions, global names, or `{ id, src, options }` for async CDN loading |
| `grapesjsCss` | `string \| undefined` | — | URL of the GrapesJS core CSS to inject asynchronously before init |
| `waitReady` | `boolean \| TemplateRef<unknown>` | — | Hide the editor host until `editorReady` fires (`editor.onReady()`); pass a `TemplateRef` to show a placeholder |

### Outputs

| Output | Payload | Description |
| --- | --- | --- |
| `editorCreated` | `Editor` | Emitted synchronously after `grapesjs.init()` (pre-`load`) |
| `editorLoaded` | `Editor` | Emitted on the GrapesJS `'load'` event |
| `editorReady` | `Editor` | Emitted once `editor.onReady()` fires (post-mount, post-storage) |
| `projectUpdated` | `{ data: ProjectData; editor: Editor }` | Emitted on every editor `'update'` event |
| `projectSaved` | `ProjectData` | Emitted after project storage completes |
| `projectLoaded` | `ProjectData` | Emitted after project data is loaded |
| `componentSelected` | `Component` | Emitted when a component is selected |
| `blockAdded` | `Block` | Emitted when a block is dropped on canvas |

### Editor lifecycle

Three distinct phases — safe content manipulation should wait for `editorReady`:

1. **`editorCreated`** — the `Editor` instance exists; managers are accessible but the canvas hasn't loaded.
2. **`editorLoaded`** — GrapesJS `'load'` event; the core editor UI is up.
3. **`editorReady`** — `editor.onReady()` callback; mounted, panels built, storage data loaded. Safe to read or manipulate project content.

### Async plugin & CSS loading

Plugins can be a mix of function references, global names, and async CDN descriptors:

```typescript
@Component({
  template: `
    <gjs-editor
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      [plugins]="editorPlugins">
    </gjs-editor>
  `,
})
export class MyEditor {
  editorPlugins: PluginTypeToLoad[] = [
    gjsBlocksBasic,                                    // function reference
    'grapesjs-plugin-forms',                           // global name
    {                                                  // CDN descriptor
      id: 'grapesjs-preset-webpage',
      src: 'https://unpkg.com/grapesjs-preset-webpage',
      options: { /* ... */ },
    },
  ];
}
```

### SSR

`<gjs-editor>` is SSR-safe: when rendered on the server (`PLATFORM_ID === 'server'`) it renders an inert host and never calls `grapesjs.init()`. Combine with `waitReady` to render a placeholder during server rendering and hydration.

## Service API

`GrapesJsEditorService` is provided in root and exposes:

### Signals

| Signal               | Type                            | Description                          |
| -------------------- | ------------------------------- | ------------------------------------ |
| `editor`             | `Signal<Editor \| null>`        | The GrapesJS editor instance         |
| `isInitialized`      | `Signal<boolean>`               | Whether the editor is initialised    |
| `isReady`            | `Signal<boolean>`               | Whether `editor.onReady()` has fired |
| `selectedComponent`  | `Signal<Component \| null>`     | Currently selected component         |
| `blockManager`       | `Signal<BlockManager \| null>`  | Block manager                        |
| `styleManager`       | `Signal<StyleManager \| null>`  | Style manager                        |
| `storageManager`     | `Signal<StorageManager \| null>`| Storage manager                      |
| `assetManager`       | `Signal<AssetManager \| null>`  | Asset manager                        |
| `cssComposer`        | `Signal<CssComposer \| null>`   | CSS composer                         |
| `traitManager`       | `Signal<TraitManager \| null>`  | Trait manager                        |
| `selectorManager`    | `Signal<SelectorManager \| null>`| Selector manager                    |
| `layerManager`       | `Signal<LayerManager \| null>`  | Layer manager                        |
| `panelManager`       | `Signal<Panels \| null>`        | Panel manager                        |
| `commands`           | `Signal<Commands \| null>`      | Commands manager                     |

### Methods

| Method                          | Returns              | Description                      |
| ------------------------------- | -------------------- | -------------------------------- |
| `init(config: GrapesJsConfig)`  | `Editor`             | Initialise the editor            |
| `destroy()`                     | `void`               | Destroy the editor and clean up  |
| `getHtml()`                     | `string \| null`     | Get the editor's HTML output     |
| `getCss()`                      | `string \| null`     | Get the editor's CSS output      |
| `getProjectData()`              | `ProjectData \| null`| Get the full project data        |
| `loadProjectData(data)`         | `void`               | Load project data into the editor|

## Custom UI

By default `<gjs-editor>` renders the full GrapesJS UI (panels, block manager, style manager, etc.) inside its host element. For full control of the editor shell — composing your own sidebars and toolbars with Angular templates — project `<gjs-canvas>` plus one or more provider components as content children:

```typescript
import {
  GrapesJsEditorComponent,
  GjsCanvas,
  GjsBlocksProvider,
  GjsLayersProvider,
  GjsPagesProvider,
  GjsContainerDirective,
} from '@ilq/grapesjs-angular';

@Component({
  imports: [
    GrapesJsEditorComponent,
    GjsCanvas,
    GjsBlocksProvider,
    GjsLayersProvider,
    GjsPagesProvider,
    GjsContainerDirective,
  ],
  template: `
    <gjs-editor>
      <aside class="sidebar">
        <gjs-blocks-provider>
          <ng-template let-ctx>
            @for (block of ctx.blocks; track block.getId()) {
              <button (mousedown)="ctx.dragStart(block, $event)">
                {{ block.getLabel() }}
              </button>
            }
          </ng-template>
        </gjs-blocks-provider>

        <gjs-layers-provider>
          <ng-template let-ctx>
            <div [gjsContainer]="ctx.container"></div>
          </ng-template>
        </gjs-layers-provider>

        <gjs-pages-provider>
          <ng-template let-ctx>
            @for (page of ctx.pages; track page.getId()) {
              <button (click)="ctx.select(page)">
                {{ page.get('name') ?? page.getId() }}
              </button>
            }
          </ng-template>
        </gjs-pages-provider>
      </aside>
      <gjs-canvas class="canvas"></gjs-canvas>
    </gjs-editor>
  `,
})
export class MyEditor {}
```

When `<gjs-canvas>` is present the editor uses it as the GrapesJS container, sets `customUI: true`, and disables the default panels. Each provider discovered via content projection flips the matching `custom*` flag in the init config, then subscribes to its manager's `custom` event and exposes the live state to your projected `<ng-template>`.

### Providers

| Component | State shape | Flips `custom` flag on | Notes |
| --- | --- | --- | --- |
| `<gjs-canvas>` | — | — | Swaps the editor's container and disables default panels |
| `<gjs-blocks-provider>` | `BlocksState` | `blockManager` | `{ blocks, dragStart, dragStop, container, mapCategoryBlocks }` |
| `<gjs-layers-provider>` | `LayersState` | `layerManager` | `{ root, container }` |
| `<gjs-selectors-provider>` | `SelectorsState` | `selectorManager` | `{ selectors, states, selectedState, targets, addSelector, removeSelector, setState, container }` |
| `<gjs-styles-provider>` | `StylesState` | `styleManager` | `{ sectors, container }` |
| `<gjs-traits-provider>` | `TraitsState` | `traitManager` | `{ traits, container }` |
| `<gjs-assets-provider>` | `AssetsState` | `assetManager` | `{ open, assets, types, select, close, container }` |
| `<gjs-modal-provider>` | `ModalState` | `modal` | `{ open, title, content, attributes, close }` |
| `<gjs-pages-provider>` | `PagesState` | — | `{ pages, selected, select, add, remove }` (observer-only) |
| `<gjs-devices-provider>` | `DevicesState` | — | `{ devices, selected, select }` (observer-only) |

### `*gjsContainer`

For providers that expose a `container` (the GrapesJS-owned default panel element), use `[gjsContainer]="ctx.container"` on any host element to mount the default panel inside your own layout. This is a one-directive alternative to building a portal system.

## Multi-Editor

`GrapesJsEditorService` is provided in root, so by default all `<gjs-editor>` instances share one service. For multiple independent editors, provide a separate service per editor:

```typescript
@Component({
  selector: 'app-multi-editor',
  standalone: true,
  imports: [GrapesJsEditorComponent],
  providers: [GrapesJsEditorService],
  template: `<gjs-editor [config]="config"></gjs-editor>`,
})
export class MultiEditorComponent {
  config: GrapesJsConfig = { /* ... */ };
}
```

Each instance of this component gets its own `GrapesJsEditorService`.

## Migrating from @rakutentech/grapesjs-angular

| @rakutentech/grapesjs-angular         | @ilq/grapesjs-angular              |
| -------------------------------------- | ---------------------------------- |
| `GrapesJsEditorModule.forRoot(config)` | `provideGrapesJs(config)`          |
| `GjsEditorComponent`                  | `GrapesJsEditorComponent`          |
| `GjsEditorService`                    | `GrapesJsEditorService`            |
| Constructor injection                 | `inject(GrapesJsEditorService)`    |
| NgModule imports                      | Standalone component imports       |
| Zone.js required                      | Zoneless-compatible                |
| `*ngIf`, `*ngFor`                     | `@if`, `@for` control flow         |
| Observable-based state                | Signal-based state                 |

## Acknowledgements

Inspired by the original [`@rakutentech/grapesjs-angular`](https://github.com/rakutentech/grapesjs-angular), now archived.

The API surface is informed by [`@grapesjs/react`](https://github.com/GrapesJS/react), the official React wrapper, and portions of the plugin and stylesheet loader utilities are adapted from it under the MIT license.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT - Copyright (c) 2026 Internet Liquid LLC. See [LICENSE](LICENSE).
