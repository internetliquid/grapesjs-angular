import { Injectable, signal, computed, type Signal } from '@angular/core';
import grapesjs from 'grapesjs';
import type { Editor, Component, ProjectData } from 'grapesjs';
import type { GrapesJsConfig } from './grapesjs-editor.types';

// Helper: extract the manager type from the Editor, keeping it opaque for ng-packagr
type ManagerOf<K extends keyof Editor> = Editor[K];

@Injectable({ providedIn: 'root' })
export class GrapesJsEditorService {
  private _editor = signal<Editor | null>(null);

  // Read-only editor signal — the source of truth
  readonly editor = this._editor.asReadonly();

  // Derived manager signals — null until editor is initialised.
  // Explicit type annotations avoid ng-packagr TS4094 errors from GrapesJS internal types.
  readonly blockManager: Signal<ManagerOf<'BlockManager'> | null>       = computed(() => this._editor()?.BlockManager    ?? null);
  readonly styleManager: Signal<ManagerOf<'StyleManager'> | null>       = computed(() => this._editor()?.StyleManager    ?? null);
  readonly storageManager: Signal<ManagerOf<'StorageManager'> | null>   = computed(() => this._editor()?.StorageManager  ?? null);
  readonly assetManager: Signal<ManagerOf<'AssetManager'> | null>       = computed(() => this._editor()?.AssetManager    ?? null);
  readonly cssComposer: Signal<ManagerOf<'CssComposer'> | null>         = computed(() => this._editor()?.CssComposer     ?? null);
  readonly traitManager: Signal<ManagerOf<'TraitManager'> | null>       = computed(() => this._editor()?.TraitManager    ?? null);
  readonly selectorManager: Signal<ManagerOf<'SelectorManager'> | null> = computed(() => this._editor()?.SelectorManager ?? null);
  readonly layerManager: Signal<ManagerOf<'LayerManager'> | null>       = computed(() => this._editor()?.LayerManager    ?? null);
  readonly panelManager: Signal<ManagerOf<'Panels'> | null>             = computed(() => this._editor()?.Panels          ?? null);
  readonly commands: Signal<ManagerOf<'Commands'> | null>               = computed(() => this._editor()?.Commands        ?? null);

  // Convenience signals for common state
  readonly isReady = computed(() => this._editor() !== null);
  readonly selectedComponent = signal<Component | null>(null);

  init(config: GrapesJsConfig): Editor {
    if (this._editor()) {
      console.warn('[GrapesJsEditorService] Editor already initialised. Call destroy() first.');
      this.destroy();
    }
    const editor = grapesjs.init(config);
    editor.on('component:selected', (c: Component) => this.selectedComponent.set(c));
    editor.on('component:deselected', () => this.selectedComponent.set(null));
    this._editor.set(editor);
    return editor;
  }

  destroy(): void {
    this._editor()?.destroy();
    this._editor.set(null);
    this.selectedComponent.set(null);
  }

  getHtml(): string | null {
    return this._editor()?.getHtml() ?? null;
  }

  getCss(): string | null {
    return this._editor()?.getCss() ?? null;
  }

  getProjectData(): ProjectData | null {
    return this._editor()?.getProjectData() ?? null;
  }

  loadProjectData(data: ProjectData): void {
    this._editor()?.loadProjectData(data);
  }
}
