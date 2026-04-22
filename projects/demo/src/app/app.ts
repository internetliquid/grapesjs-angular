import { Component, inject, signal } from '@angular/core';
import { GrapesJsEditorComponent, GrapesJsEditorService } from 'grapesjs-angular';
import type { Editor, ProjectData } from 'grapesjs';
import { SAMPLE_HTML, SAMPLE_CSS } from './sample-content';

@Component({
  selector: 'demo-root',
  standalone: true,
  imports: [GrapesJsEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private editorService = inject(GrapesJsEditorService);
  protected htmlOutput = signal('');

  onEditorReady(editor: Editor): void {
    editor.setComponents(SAMPLE_HTML);
    editor.setStyle(SAMPLE_CSS);
  }

  onProjectSaved(data: ProjectData): void {
    console.log('[Demo] Project saved', data);
  }

  onProjectLoaded(data: ProjectData): void {
    console.log('[Demo] Project loaded', data);
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
