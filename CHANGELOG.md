# Changelog

## 2.0.0-alpha.1

Initial release of `@ilq/grapesjs-angular` — a ground-up Angular 20+ wrapper for GrapesJS.

- Standalone `<gjs-editor>` component with OnPush change detection
- `GrapesJsEditorService` with signals for editor state and all GrapesJS managers
- `provideGrapesJs()` for app-wide default configuration
- Zoneless-compatible (no Zone.js dependency)
- Inputs: `config`, `plugins`
- Outputs: `editorReady`, `projectSaved`, `projectLoaded`, `componentSelected`, `blockAdded`
- Service methods: `init()`, `destroy()`, `getHtml()`, `getCss()`, `getProjectData()`, `loadProjectData()`
