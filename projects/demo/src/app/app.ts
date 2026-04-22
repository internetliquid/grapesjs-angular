import { Component, inject, signal } from '@angular/core';
import { GrapesJsEditorComponent, GrapesJsEditorService } from 'grapesjs-angular';
import type { Editor, ProjectData } from 'grapesjs';

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
    console.log('[Demo] Editor ready', editor);
  }

  onProjectSaved(data: ProjectData): void {
    console.log('[Demo] Project saved', data);
  }

  onProjectLoaded(data: ProjectData): void {
    console.log('[Demo] Project loaded', data);
  }

  save(): void {
    const data = this.editorService.getProjectData();
    console.log('[Demo] Save:', data);
  }

  getHtml(): void {
    const html = this.editorService.getHtml() ?? '';
    this.htmlOutput.set(html);
  }

  reset(): void {
    this.editorService.loadProjectData({} as ProjectData);
    this.htmlOutput.set('');
  }
}
