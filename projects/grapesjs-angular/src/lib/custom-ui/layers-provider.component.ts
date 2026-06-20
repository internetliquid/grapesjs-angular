import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Component as GjsComponent, Editor, LayerCustomEventData } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface LayersState {
  root?: GjsComponent;
  container: HTMLElement | undefined;
}

@Component({
  selector: 'gjs-layers-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsLayersProvider }],
})
export class GjsLayersProvider extends GjsCustomProviderBase {
  readonly customFlag = 'layerManager' as const;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: LayersState }>;

  readonly state = signal<LayersState | null>(null);

  wire(editor: Editor): void {
    const { Layers } = editor;
    editor.on(Layers.events.custom, ({ container }: LayerCustomEventData) => {
      this.state.set({ root: Layers.getRoot(), container });
    });
    Layers.__trgCustom({});
  }
}
