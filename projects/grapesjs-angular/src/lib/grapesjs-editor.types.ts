import type { EditorConfig, Editor, ProjectData, Component, Block, Plugin } from 'grapesjs';

/** Config passed to grapesjs.init() — re-exported with `container` made optional
 * since the component sets it from the ViewChild */
export type GrapesJsConfig = Omit<EditorConfig, 'container'> & {
  container?: string | HTMLElement;
};

/** Config accepted by provideGrapesJs() — same shape, container always optional */
export type GrapesJsModuleConfig = GrapesJsConfig;

/** Convenience ref returned from the service for consumers that need raw editor access */
export type GrapesJsEditorRef = Editor;

/** Storage config shape for convenience typing */
export type StorageConfig = EditorConfig['storageManager'];

// Re-export GrapesJS types consumers commonly need so they don't have to
// import directly from 'grapesjs'
export type { Editor, ProjectData, Component, Block, Plugin };
