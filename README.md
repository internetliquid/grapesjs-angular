# @ilq/grapesjs-angular

[![npm version](https://img.shields.io/npm/v/@ilq/grapesjs-angular)](https://www.npmjs.com/package/@ilq/grapesjs-angular)
[![CI](https://github.com/internetliquid/grapesjs-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/internetliquid/grapesjs-angular/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What is this?

An Angular wrapper for the [GrapesJS](https://grapesjs.com/) web builder framework. Embed a fully functional drag-and-drop page editor in your Angular app with all GrapesJS managers accessible as Angular signals.

## Angular Version Support

| Angular | Supported |
| ------- | --------- |
| 21      | Yes       |
| 20      | Yes       |
| 19 and below | No — requires deprecated APIs (`NgModules`, `ComponentFactoryResolver`) removed in modern Angular |

## Installation

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

| Input     | Type            | Default | Description                                        |
| --------- | --------------- | ------- | -------------------------------------------------- |
| `config`  | `GrapesJsConfig`| `{}`    | GrapesJS editor config (merged with global config) |
| `plugins` | `Plugin[]`      | `[]`    | Additional plugins (appended to global plugins)    |

### Outputs

| Output              | Payload        | Description                              |
| ------------------- | -------------- | ---------------------------------------- |
| `editorReady`       | `Editor`       | Emitted when the editor has loaded       |
| `projectSaved`      | `ProjectData`  | Emitted after project storage completes  |
| `projectLoaded`     | `ProjectData`  | Emitted after project data is loaded     |
| `componentSelected` | `Component`    | Emitted when a component is selected     |
| `blockAdded`        | `Block`        | Emitted when a block is dropped on canvas|

## Service API

`GrapesJsEditorService` is provided in root and exposes:

### Signals

| Signal               | Type                            | Description                          |
| -------------------- | ------------------------------- | ------------------------------------ |
| `editor`             | `Signal<Editor \| null>`        | The GrapesJS editor instance         |
| `isReady`            | `Signal<boolean>`               | Whether the editor is initialised    |
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

Inspired by the original [`@rakutentech/grapesjs-angular`](https://github.com/AlessioRoccolWormo/grapesjs-angular), now archived.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT - Copyright (c) 2026 Internet Liquid LLC. See [LICENSE](LICENSE).
