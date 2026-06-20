import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Editor, ModalEventData } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface ModalState {
  open: boolean;
  /** Modal title — a DOM `Node` surfaced by GrapesJS, or the initial empty string. */
  title: Node | string;
  /** Modal content — a DOM `Node` surfaced by GrapesJS, or the initial empty string. */
  content: Node | string;
  attributes: Record<string, unknown>;
  close: () => void;
}

@Component({
  selector: 'gjs-modal-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsModalProvider }],
})
export class GjsModalProvider extends GjsCustomProviderBase {
  readonly customFlag = 'modal' as const;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: ModalState }>;

  readonly state = signal<ModalState | null>({
    open: false,
    title: '',
    content: '',
    attributes: {},
    close: () => undefined,
  });

  wire(editor: Editor): void {
    editor.on('modal', ({ open, title, content, attributes, close }: ModalEventData) => {
      this.state.set({ open, title, content, attributes, close });
    });
  }
}
