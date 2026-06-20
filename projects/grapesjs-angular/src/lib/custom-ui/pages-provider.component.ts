import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Editor, Page } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface PagesState {
  pages: Page[];
  selected?: Page;
  select: Editor['Pages']['select'];
  add: Editor['Pages']['add'];
  remove: Editor['Pages']['remove'];
}

@Component({
  selector: 'gjs-pages-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsPagesProvider }],
})
export class GjsPagesProvider extends GjsCustomProviderBase {
  // Pages doesn't flip a custom flag — it's an observer-only provider.
  readonly customFlag = null;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: PagesState }>;

  readonly state = signal<PagesState | null>(null);

  wire(editor: Editor): void {
    const { Pages } = editor;
    const event = Pages.events.all;

    const push = () => {
      this.state.set({
        pages: Pages.getAll(),
        selected: Pages.getSelected(),
        select: (...args) => Pages.select(...args),
        add: (...args) => Pages.add(...args),
        remove: (...args) => Pages.remove(...args),
      });
    };

    editor.on(event, push);
    push();
  }
}
