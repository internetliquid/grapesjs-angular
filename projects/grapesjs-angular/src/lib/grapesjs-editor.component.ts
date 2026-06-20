import {
  Component as NgComponent,
  AfterContentInit,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ContentChild,
  ContentChildren,
  QueryList,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  PLATFORM_ID,
  TemplateRef,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type { Editor, ProjectData, Component, Block } from 'grapesjs';
import { GrapesJsEditorService } from './grapesjs-editor.service';
import { GRAPES_JS_DEFAULT_CONFIG } from './grapesjs-editor.tokens';
import type { GrapesJsConfig } from './grapesjs-editor.types';
import { initPlugins, type PluginTypeToLoad } from './utils/plugins';
import { loadStyle } from './utils/dom';
import { GjsCanvas } from './custom-ui/gjs-canvas.component';
import { GjsCustomProviderBase, type CustomFlag } from './custom-ui/custom-provider-base';

export interface ProjectUpdatePayload {
  data: ProjectData;
  editor: Editor;
}

@NgComponent({
  selector: 'gjs-editor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (waitReady && !ready) {
      <div class="gjs-editor-placeholder">
        @if (isTemplate(waitReady)) {
          <ng-container [ngTemplateOutlet]="$any(waitReady)"></ng-container>
        }
      </div>
    }
    <ng-content></ng-content>
    <div
      #gjsContainer
      class="gjs-editor-host"
      [class.gjs-editor-host--hidden]="waitReady && !ready"
      [style.display]="hasCustomCanvas ? 'none' : null"
    ></div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; position: relative; }
    .gjs-editor-host { width: 100%; height: 100%; }
    .gjs-editor-host--hidden { opacity: 0; width: 0; height: 0; overflow: hidden; }
    .gjs-editor-placeholder { width: 100%; height: 100%; }
  `],
})
export class GrapesJsEditorComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  @Input() config: GrapesJsConfig = {};
  @Input() plugins: PluginTypeToLoad[] = [];
  /**
   * URL of the GrapesJS core CSS to inject asynchronously before init.
   * @example 'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
   */
  @Input() grapesjsCss?: string;
  /**
   * When truthy, hides the editor host until `editor.onReady()` fires.
   * Pass a `TemplateRef` to render a custom placeholder in its place.
   */
  @Input() waitReady?: boolean | TemplateRef<unknown>;

  /** Emits synchronously after `grapesjs.init()` returns. */
  @Output() editorCreated = new EventEmitter<Editor>();
  /** Emits on GrapesJS `'load'` event. */
  @Output() editorLoaded = new EventEmitter<Editor>();
  /** Emits once `editor.onReady()` fires — post-mount, post-storage-load. */
  @Output() editorReady = new EventEmitter<Editor>();
  /** Emits on every GrapesJS `'update'` event with the latest project data. */
  @Output() projectUpdated = new EventEmitter<ProjectUpdatePayload>();
  @Output() projectSaved = new EventEmitter<ProjectData>();
  @Output() projectLoaded = new EventEmitter<ProjectData>();
  @Output() componentSelected = new EventEmitter<Component>();
  @Output() blockAdded = new EventEmitter<Block>();

  @ViewChild('gjsContainer', { static: true })
  private defaultContainer!: ElementRef<HTMLDivElement>;

  @ContentChild(GjsCanvas) private projectedCanvas?: GjsCanvas;
  @ContentChildren(GjsCustomProviderBase, { descendants: true })
  private projectedProviders!: QueryList<GjsCustomProviderBase>;

  private editorService = inject(GrapesJsEditorService);
  private defaultConfig = inject(GRAPES_JS_DEFAULT_CONFIG, { optional: true });
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  /** Internal mirror of service `isReady` for OnPush template bindings. */
  protected ready = false;
  protected hasCustomCanvas = false;

  private customFlags: Partial<Record<CustomFlag, true>> = {};
  private providers: readonly GjsCustomProviderBase[] = [];

  isTemplate(val: unknown): val is TemplateRef<unknown> {
    return val instanceof TemplateRef;
  }

  ngAfterContentInit(): void {
    this.hasCustomCanvas = !!this.projectedCanvas;
    this.providers = this.projectedProviders?.toArray() ?? [];
    this.customFlags = {};
    for (const p of this.providers) {
      if (p.customFlag) this.customFlags[p.customFlag] = true;
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // SSR guard — do not touch DOM APIs or load GrapesJS on the server.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.grapesjsCss) {
      try {
        await loadStyle(this.grapesjsCss);
      } catch (err) {
        console.warn('[gjs-editor] Failed to load grapesjsCss:', err);
      }
    }

    const mergedInputPlugins: PluginTypeToLoad[] = [
      ...(this.defaultConfig?.plugins ?? []) as PluginTypeToLoad[],
      ...this.plugins,
    ];
    const { plugins: resolvedPlugins, pluginOptions } = await initPlugins(mergedInputPlugins);

    const mergedConfig: GrapesJsConfig = {
      // Fill the host element by default — without this GrapesJS falls back to
      // its built-in `height: '900px'` and overflows whatever container we mount
      // it in. Consumer config below can still override.
      height: '100%',
      width: '100%',
      ...this.defaultConfig,
      ...this.config,
      container: this.projectedCanvas?.elementRef.nativeElement ?? this.defaultContainer.nativeElement,
      plugins: resolvedPlugins,
      pluginsOpts: {
        ...this.defaultConfig?.pluginsOpts,
        ...this.config.pluginsOpts,
        ...pluginOptions,
      },
    };

    // Merge provider-requested custom UI flags into their manager config sections.
    if (this.customFlags.blockManager) {
      mergedConfig.blockManager = { ...mergedConfig.blockManager, custom: true };
    }
    if (this.customFlags.layerManager) {
      mergedConfig.layerManager = { ...mergedConfig.layerManager, custom: true };
    }
    if (this.customFlags.selectorManager) {
      mergedConfig.selectorManager = { ...mergedConfig.selectorManager, custom: true };
    }
    if (this.customFlags.styleManager) {
      mergedConfig.styleManager = { ...mergedConfig.styleManager, custom: true };
    }
    if (this.customFlags.traitManager) {
      mergedConfig.traitManager = { ...mergedConfig.traitManager, custom: true };
    }
    if (this.customFlags.assetManager) {
      mergedConfig.assetManager = { ...mergedConfig.assetManager, custom: true };
    }
    if (this.customFlags.modal) {
      mergedConfig.modal = { ...mergedConfig.modal, custom: true };
    }
    if (this.projectedCanvas) {
      (mergedConfig as unknown as { customUI: boolean }).customUI = true;
      mergedConfig.panels = { ...mergedConfig.panels, defaults: [] };
    }

    const editor = this.editorService.init(mergedConfig);
    this.editorCreated.emit(editor);

    editor.on('load', () => this.editorLoaded.emit(editor));
    editor.on('storage:end:store', (data: unknown) => this.projectSaved.emit(data as ProjectData));
    editor.on('storage:end:load', (data: unknown) => this.projectLoaded.emit(data as ProjectData));
    editor.on('component:selected', (component: Component) => this.componentSelected.emit(component));
    editor.on('block:drag:stop', (_component: unknown, block: Block) => this.blockAdded.emit(block));
    editor.on('update', () => this.projectUpdated.emit({ data: editor.getProjectData(), editor }));

    // Hand the live editor to each projected provider so it can subscribe to
    // its manager's custom event and populate its state signal.
    for (const p of this.providers) {
      p.wire(editor);
    }

    editor.onReady(() => {
      this.ready = true;
      this.cdr.markForCheck();
      this.editorReady.emit(editor);
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.editorService.destroy();
  }
}
