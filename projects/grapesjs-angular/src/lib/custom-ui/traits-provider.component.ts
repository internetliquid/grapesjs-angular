import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Editor, Trait, TraitCustomData } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface TraitsState {
  traits: Trait[];
  container: HTMLElement | undefined;
}

@Component({
  selector: 'gjs-traits-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsTraitsProvider }],
})
export class GjsTraitsProvider extends GjsCustomProviderBase {
  readonly customFlag = 'traitManager' as const;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: TraitsState }>;

  readonly state = signal<TraitsState | null>(null);

  wire(editor: Editor): void {
    const { Traits } = editor;
    editor.on(Traits.events.custom, ({ container }: TraitCustomData) => {
      this.state.set({ traits: Traits.getCurrent(), container });
    });
    Traits.__trgCustom();
  }
}
