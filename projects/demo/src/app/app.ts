import { Component, inject, signal } from '@angular/core';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
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
} from 'grapesjs-angular';
import type { Block, Component as GjsComponent, Editor, ProjectData } from 'grapesjs';
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
  protected htmlOutput = signal('');
  protected customUi = signal(false);
  protected dragging = signal(false);
  protected draggedLabel = signal<string | null>(null);
  protected cursorX = signal(0);
  protected cursorY = signal(0);

  private frameEl: HTMLIFrameElement | null = null;
  private frameDoc: Document | null = null;

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
    editor.setComponents(SAMPLE_HTML);
    editor.setStyle(SAMPLE_CSS);

    // Capture once for cross-frame mousemove tracking during drags.
    this.frameEl = editor.Canvas.getFrameEl() ?? null;

    editor.on('block:drag:start', () => this.dragging.set(true));
    editor.on('block:drag:stop', () => {
      this.dragging.set(false);
      this.draggedLabel.set(null);
      document.removeEventListener('mousemove', this.trackCursor);
      this.frameDoc?.removeEventListener('mousemove', this.trackCursorInFrame);
      this.frameDoc = null;
    });
  }

  /** Block-button mousedown wrapper: capture the label for the floating ghost,
   *  start tracking the cursor in BOTH the host document and the canvas
   *  iframe's document (so the ghost still tracks once the cursor crosses
   *  into the iframe), then forward to GrapesJS via the provider. */
  startBlockDrag(block: Block, ev: MouseEvent, dragStart: (b: Block, e?: Event) => void): void {
    this.draggedLabel.set(block.getLabel());
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

  toggleCustomUi(): void {
    this.customUi.update((v) => !v);
  }

  /** Layers-panel row click. A GrapesJS Component has no `.select()` — selection
   *  goes through the editor, which fires component:selected and refreshes the
   *  Selectors / Styles / Traits panels. */
  selectLayer(c: GjsComponent): void {
    this.editorService.editor()?.select(c);
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

  reset(): void {
    const editor = this.editorService.editor();
    if (!editor) return;
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
