/*
 * Public API Surface of grapesjs-angular
 */

// Component
export { GrapesJsEditorComponent, type ProjectUpdatePayload } from './lib/grapesjs-editor.component';

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
  PluginToLoad,
  PluginTypeToLoad,
  GrapesPlugin,
} from './lib/grapesjs-editor.types';

// Custom UI surface
export { GjsCustomProviderBase, type CustomFlag } from './lib/custom-ui/custom-provider-base';
export { GjsCanvas } from './lib/custom-ui/gjs-canvas.component';
export { GjsContainerDirective } from './lib/custom-ui/gjs-container.directive';
export { GjsBlocksProvider, type BlocksState, type MapCategoryBlocks } from './lib/custom-ui/blocks-provider.component';
export { GjsLayersProvider, type LayersState } from './lib/custom-ui/layers-provider.component';
export { GjsSelectorsProvider, type SelectorsState } from './lib/custom-ui/selectors-provider.component';
export { GjsStylesProvider, type StylesState } from './lib/custom-ui/styles-provider.component';
export { GjsTraitsProvider, type TraitsState } from './lib/custom-ui/traits-provider.component';
export { GjsPagesProvider, type PagesState } from './lib/custom-ui/pages-provider.component';
export { GjsDevicesProvider, type DevicesState } from './lib/custom-ui/devices-provider.component';
export { GjsAssetsProvider, type AssetsState } from './lib/custom-ui/assets-provider.component';
export { GjsModalProvider, type ModalState } from './lib/custom-ui/modal-provider.component';
