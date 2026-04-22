import {
  Component as NgComponent,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import type { Editor, ProjectData, Component, Block, Plugin } from 'grapesjs';
import { GrapesJsEditorService } from './grapesjs-editor.service';
import { GRAPES_JS_DEFAULT_CONFIG } from './grapesjs-editor.tokens';
import type { GrapesJsConfig } from './grapesjs-editor.types';

@NgComponent({
  selector: 'gjs-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #gjsContainer class="gjs-editor-host"></div>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .gjs-editor-host { width: 100%; height: 100%; }
  `],
})
export class GrapesJsEditorComponent implements AfterViewInit, OnDestroy {
  @Input() config: GrapesJsConfig = {};
  @Input() plugins: Plugin[] = [];

  @Output() editorReady = new EventEmitter<Editor>();
  @Output() projectSaved = new EventEmitter<ProjectData>();
  @Output() projectLoaded = new EventEmitter<ProjectData>();
  @Output() componentSelected = new EventEmitter<Component>();
  @Output() blockAdded = new EventEmitter<Block>();

  @ViewChild('gjsContainer', { static: true })
  private container!: ElementRef<HTMLDivElement>;

  private editorService = inject(GrapesJsEditorService);
  private defaultConfig = inject(GRAPES_JS_DEFAULT_CONFIG, { optional: true });

  ngAfterViewInit(): void {
    const mergedConfig: GrapesJsConfig = {
      ...this.defaultConfig,
      ...this.config,
      container: this.container.nativeElement,
      plugins: [...(this.defaultConfig?.plugins ?? []), ...this.plugins],
    };
    const editor = this.editorService.init(mergedConfig);

    editor.on('load', () => this.editorReady.emit(editor));
    editor.on('storage:end:store', (data: unknown) => this.projectSaved.emit(data as ProjectData));
    editor.on('storage:end:load', (data: unknown) => this.projectLoaded.emit(data as ProjectData));
    editor.on('component:selected', (component: Component) => this.componentSelected.emit(component));
    editor.on('block:drag:stop', (_component: unknown, block: Block) => this.blockAdded.emit(block));
  }

  ngOnDestroy(): void {
    this.editorService.destroy();
  }
}
