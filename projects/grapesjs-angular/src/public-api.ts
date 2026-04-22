/*
 * Public API Surface of grapesjs-angular
 */

// Component
export { GrapesJsEditorComponent } from './lib/grapesjs-editor.component';

// Service
export { GrapesJsEditorService } from './lib/grapesjs-editor.service';

// Provider function
export { provideGrapesJs } from './lib/grapesjs-editor.tokens';

// Types
export type {
  GrapesJsConfig,
  GrapesJsModuleConfig,
  GrapesJsEditorRef,
  StorageConfig,
} from './lib/grapesjs-editor.types';
