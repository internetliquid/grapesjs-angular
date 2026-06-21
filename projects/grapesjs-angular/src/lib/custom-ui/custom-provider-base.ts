import type { Editor } from 'grapesjs';

/**
 * Names of the GrapesJS init-config sections that support a `custom: true` flag
 * for replacing the manager's default UI. `null` is used for providers that only
 * observe manager events without disabling the built-in UI (e.g. Pages, Devices).
 */
export type CustomFlag =
  | 'blockManager'
  | 'layerManager'
  | 'selectorManager'
  | 'styleManager'
  | 'traitManager'
  | 'assetManager'
  | 'modal';

/**
 * Abstract base for every `<gjs-*-provider>` component. `<gjs-editor>` discovers
 * providers via `@ContentChildren(GjsCustomProviderBase)`, reads each one's
 * `customFlag` to build the init config, then calls `wire(editor)` on each after
 * initialisation to attach manager-specific event listeners.
 *
 * Providers register themselves under this token via `useExisting` in their
 * component `providers` array.
 */
export abstract class GjsCustomProviderBase {
  abstract readonly customFlag: CustomFlag | null;
  abstract wire(editor: Editor): void;
}
