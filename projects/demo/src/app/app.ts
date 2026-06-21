import { Component, inject, signal } from '@angular/core';
import { DOCUMENT, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import {
  GrapesJsEditorComponent,
  GrapesJsEditorService,
  GjsCanvas,
  GjsBlocksProvider,
  GjsLayersProvider,
  GjsPagesProvider,
  GjsDevicesProvider,
  GjsSelectorsProvider,
  GjsStylesProvider,
  GjsTraitsProvider,
  GjsAssetsProvider,
  GjsModalProvider,
  GjsContainerDirective,
  type GrapesJsConfig,
} from 'grapesjs-angular';
import type { Block, Component as GjsComponent, Editor, ProjectData, Property } from 'grapesjs';
import { SAMPLE_HTML, SAMPLE_CSS } from './sample-content';

@Component({
  selector: 'demo-root',
  standalone: true,
  imports: [
    KeyValuePipe,
    NgTemplateOutlet,
    GrapesJsEditorComponent,
    GjsCanvas,
    GjsBlocksProvider,
    GjsLayersProvider,
    GjsPagesProvider,
    GjsDevicesProvider,
    GjsSelectorsProvider,
    GjsStylesProvider,
    GjsTraitsProvider,
    GjsAssetsProvider,
    GjsModalProvider,
    GjsContainerDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private editorService = inject(GrapesJsEditorService);
  private doc = inject(DOCUMENT);
  private sanitizer = inject(DomSanitizer);
  /** Memoized block icons — the media SVG is trusted (GrapesJS-authored) and
   *  block-stable, so sanitize once per block id rather than every render. */
  private blockIconCache = new Map<string, SafeHtml>();
  /** The component currently selected on the canvas (null = nothing selected).
   *  Drives the inspector's empty state. */
  protected selectedComponent = this.editorService.selectedComponent;
  protected theme = signal<'light' | 'dark'>('light');

  /** Curated style manager so the inspector renders differentiated, typed
   *  controls (sliders / colour swatches / segmented / selects) instead of a
   *  wall of identical inputs. Drives both custom and default UI. */
  protected gjsConfig: GrapesJsConfig = {
    styleManager: {
      sectors: [
        {
          name: 'Typography',
          open: true,
          properties: [
            { property: 'font-size', type: 'slider', units: ['px'], min: 8, max: 96 },
            {
              property: 'font-weight',
              type: 'select',
              default: '400',
              options: [
                { id: '300', label: 'Light' },
                { id: '400', label: 'Regular' },
                { id: '500', label: 'Medium' },
                { id: '600', label: 'Semibold' },
                { id: '700', label: 'Bold' },
              ],
            },
            { property: 'color', type: 'color' },
            { property: 'line-height', type: 'slider', units: [''], min: 0.8, max: 3, step: 0.1 },
            {
              property: 'text-align',
              type: 'radio',
              default: 'left',
              options: [
                { id: 'left', label: 'Left' },
                { id: 'center', label: 'Center' },
                { id: 'right', label: 'Right' },
                { id: 'justify', label: 'Justify' },
              ],
            },
          ],
        },
        {
          name: 'Background',
          open: true,
          properties: [{ property: 'background-color', type: 'color' }],
        },
        {
          name: 'Spacing',
          open: true,
          properties: [
            { property: 'padding', type: 'slider', units: ['px'], min: 0, max: 120 },
            { property: 'margin', type: 'slider', units: ['px'], min: 0, max: 120 },
          ],
        },
      ],
    },
  };
  protected htmlOutput = signal('');
  protected customUi = signal(false);
  protected dragging = signal(false);
  protected draggedLabel = signal<string | null>(null);
  protected draggedIcon = signal<SafeHtml | null>(null);
  protected cursorX = signal(0);
  protected cursorY = signal(0);

  private frameEl: HTMLIFrameElement | null = null;
  private frameDoc: Document | null = null;

  /** Holds the project across a Custom <-> Default UI switch (each switch
   *  recreates the editor). null = first load, so seed the sample content. */
  private savedProject: ProjectData | null = null;

  private trackCursor = (e: MouseEvent) => {
    this.cursorX.set(e.clientX);
    this.cursorY.set(e.clientY);
  };

  /** mousemove inside the canvas iframe — its clientX/Y is iframe-local, so we
   *  translate to viewport coords using the iframe's bounding rect. */
  private trackCursorInFrame = (e: MouseEvent) => {
    if (!this.frameEl) return;
    const rect = this.frameEl.getBoundingClientRect();
    this.cursorX.set(rect.left + e.clientX);
    this.cursorY.set(rect.top + e.clientY);
  };

  onEditorReady(editor: Editor): void {
    // Restore the in-progress project when switching Custom <-> Default UI;
    // only seed the sample on first load (savedProject === null).
    if (this.savedProject) {
      editor.loadProjectData(this.savedProject);
    } else {
      editor.setComponents(SAMPLE_HTML);
      editor.setStyle(SAMPLE_CSS);
    }

    // Capture once for cross-frame mousemove tracking during drags.
    this.frameEl = editor.Canvas.getFrameEl() ?? null;

    editor.on('block:drag:start', () => this.dragging.set(true));
    // In custom-UI mode the block drag ends via the sorter — `block:drag:stop`
    // does NOT fire here — so clean up on `sorter:drag:end` instead.
    editor.on('sorter:drag:end', () => this.endBlockDrag());
    // Auto-select whatever the drag just added, so its styles/traits populate
    // without a second click. This fires before sorter:drag:end (while the drag
    // is still flagged), and is a no-op for non-drag additions (e.g. seeding).
    editor.on('component:add', (component: GjsComponent) => {
      if (this.dragging()) editor.select(component);
    });
  }

  /** Reset all drag state. Called on sorter:drag:end (drop or cancel). */
  private endBlockDrag(): void {
    this.dragging.set(false);
    this.draggedLabel.set(null);
    this.draggedIcon.set(null);
    document.removeEventListener('mousemove', this.trackCursor);
    this.frameDoc?.removeEventListener('mousemove', this.trackCursorInFrame);
    this.frameDoc = null;
  }

  /** Block-button mousedown wrapper: capture the label for the floating ghost,
   *  start tracking the cursor in BOTH the host document and the canvas
   *  iframe's document (so the ghost still tracks once the cursor crosses
   *  into the iframe), then forward to GrapesJS via the provider. */
  startBlockDrag(block: Block, ev: MouseEvent, dragStart: (b: Block, e?: Event) => void): void {
    this.draggedLabel.set(block.getLabel());
    this.draggedIcon.set(this.blockIcon(block));
    this.cursorX.set(ev.clientX);
    this.cursorY.set(ev.clientY);
    document.addEventListener('mousemove', this.trackCursor);

    // The iframe's contentDocument can be replaced (e.g. on Reset), so re-grab
    // it lazily here rather than caching at editorReady time.
    this.frameDoc = this.frameEl?.contentDocument ?? null;
    this.frameDoc?.addEventListener('mousemove', this.trackCursorInFrame);

    dragStart(block, ev);
  }

  onProjectSaved(data: ProjectData): void {
    console.log('[Demo] Project saved', data);
  }

  onProjectLoaded(data: ProjectData): void {
    console.log('[Demo] Project loaded', data);
  }

  constructor() {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('gjs-demo-theme');
    } catch {
      /* storage unavailable (private mode / SSR) — fall back to OS preference */
    }
    const prefersDark =
      typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme((saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light'));
  }

  setCustomUi(custom: boolean): void {
    if (custom === this.customUi()) return;
    // Snapshot the project before the switch tears down this editor instance,
    // so the next one restores it (see onEditorReady) instead of re-seeding.
    this.savedProject = this.editorService.getProjectData();
    this.customUi.set(custom);
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private setTheme(t: 'light' | 'dark'): void {
    this.theme.set(t);
    this.doc.documentElement.setAttribute('data-theme', t);
    try {
      localStorage.setItem('gjs-demo-theme', t);
    } catch {
      /* ignore persistence failures */
    }
  }

  /** Layers-panel row click. A GrapesJS Component has no `.select()` — selection
   *  goes through the editor, which fires component:selected and refreshes the
   *  Selectors / Styles / Traits panels. */
  selectLayer(c: GjsComponent): void {
    this.editorService.editor()?.select(c);
  }

  /** Layer-tree children, minus GrapesJS's non-layerable nodes — chiefly the
   *  textnodes that otherwise surface as meaningless "Box" rows. Mirrors
   *  GrapesJS's own layer manager, which hides them. */
  layerChildren(c: GjsComponent): GjsComponent[] {
    return c.components().filter((child: GjsComponent) => child.get('layerable') !== false);
  }

  // ── Style-inspector control helpers (wrap GrapesJS's dynamic Property API) ──

  /** Numeric part of a slider property's value, for the range input. */
  sliderValue(prop: Property): number {
    return parseFloat(String(prop.getValue() ?? '')) || 0;
  }

  /** A slider property's min/max/step (from the curated config). */
  sliderAttr(prop: Property, key: 'min' | 'max' | 'step'): number {
    const v = (prop as unknown as { get(k: string): unknown }).get(key);
    return typeof v === 'number' ? v : key === 'max' ? 100 : key === 'step' ? 1 : 0;
  }

  /** Apply a slider value back to the property, re-attaching its unit. */
  setSlider(prop: Property, raw: string): void {
    const p = prop as unknown as { getUnit?(): string; get(k: string): unknown };
    const units = p.get('units');
    const unit = p.getUnit?.() || (Array.isArray(units) ? (units[0] as string) : '') || '';
    prop.upValue(raw + unit);
  }

  /** Convert a property's colour value to a hex the `<input type=color>` accepts. */
  colorHex(prop: Property): string {
    const v = String(prop.getValue() ?? '');
    if (v[0] === '#') return v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v.slice(0, 7);
    const m = v.match(/\d+/g);
    if (m && m.length >= 3) return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('');
    return '#000000';
  }

  /** Options / labels for select & radio properties (PropertySelect API). */
  propOptions(prop: Property): unknown[] {
    return (prop as unknown as { getOptions?(): unknown[] }).getOptions?.() ?? [];
  }
  optionId(prop: Property, opt: unknown): string {
    return (prop as unknown as { getOptionId(o: unknown): string }).getOptionId(opt);
  }
  optionLabel(prop: Property, opt: unknown): string {
    return (prop as unknown as { getOptionLabel(o: unknown): string }).getOptionLabel(opt);
  }

  /** The block's icon (its GrapesJS `media` SVG), for the block tiles. */
  blockIcon(block: Block): SafeHtml {
    const id = block.getId();
    let icon = this.blockIconCache.get(id);
    if (!icon) {
      icon = this.sanitizer.bypassSecurityTrustHtml(String(block.get('media') ?? ''));
      this.blockIconCache.set(id, icon);
    }
    return icon;
  }

  isNode(value: unknown): value is Node {
    return value instanceof Node;
  }

  save(): void {
    const data = this.editorService.getProjectData();
    if (!data) return;
    this.downloadFile('grapesjs-project.json', JSON.stringify(data, null, 2), 'application/json');
  }

  getHtml(): void {
    const html = this.editorService.getHtml() ?? '';
    const css = this.editorService.getCss() ?? '';
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GrapesJS Export</title>
  <style>${css}</style>
</head>
<body>${html}</body>
</html>`;
    this.htmlOutput.set(fullHtml);
    this.downloadFile('grapesjs-export.html', fullHtml, 'text/html');
  }

  copyHtml(): void {
    const html = this.htmlOutput();
    if (html) navigator.clipboard?.writeText(html);
  }

  reset(): void {
    const editor = this.editorService.editor();
    if (!editor) return;
    this.savedProject = null;
    editor.setComponents(SAMPLE_HTML);
    editor.setStyle(SAMPLE_CSS);
    this.htmlOutput.set('');
  }

  private downloadFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
