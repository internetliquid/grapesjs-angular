import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Editor, Sector, StyleManagerCustomEventData } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface StylesState {
  sectors: Sector[];
  container: HTMLElement | undefined;
}

@Component({
  selector: 'gjs-styles-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsStylesProvider }],
})
export class GjsStylesProvider extends GjsCustomProviderBase {
  readonly customFlag = 'styleManager' as const;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: StylesState }>;

  readonly state = signal<StylesState | null>(null);

  wire(editor: Editor): void {
    const { Styles } = editor;
    editor.on(Styles.events.custom, ({ container }: StyleManagerCustomEventData) => {
      this.state.set({ sectors: Styles.getSectors({ visible: true }), container });
    });
    // Custom-UI mode skips GrapesJS's default panel render, which is where the
    // initial style:custom would normally fire. Trigger it ourselves so the
    // projected template renders its empty state before any component is selected.
    Styles.__trgCustom();
  }
}
