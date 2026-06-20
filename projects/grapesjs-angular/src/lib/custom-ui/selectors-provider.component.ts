import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Editor, Selector, SelectorCustomEventData, State } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface SelectorsState {
  selectors: Selector[];
  states: State[];
  selectedState: string;
  targets: string[];
  addSelector: Editor['Selectors']['addSelected'];
  removeSelector: Editor['Selectors']['removeSelected'];
  setState: Editor['Selectors']['setState'];
  container: HTMLElement | undefined;
}

@Component({
  selector: 'gjs-selectors-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsSelectorsProvider }],
})
export class GjsSelectorsProvider extends GjsCustomProviderBase {
  readonly customFlag = 'selectorManager' as const;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: SelectorsState }>;

  readonly state = signal<SelectorsState | null>(null);

  wire(editor: Editor): void {
    const { Selectors } = editor;
    editor.on(Selectors.events.custom, ({ container }: SelectorCustomEventData) => {
      this.state.set({
        selectors: Selectors.getSelected(),
        states: Selectors.getStates(),
        selectedState: Selectors.getState(),
        targets: Selectors.getSelectedTargets().map((t) => t.getSelectorsString()),
        addSelector: (...args) => Selectors.addSelected(...args),
        removeSelector: (...args) => Selectors.removeSelected(...args),
        setState: (...args) => Selectors.setState(...args),
        container,
      });
    });
    // Custom-UI mode skips GrapesJS's default panel render, which is where the
    // initial selector:custom would normally fire. Trigger it ourselves so the
    // projected template renders its empty state before any component is selected.
    Selectors.__trgCustom();
  }
}
