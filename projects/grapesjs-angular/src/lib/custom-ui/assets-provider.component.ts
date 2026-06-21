import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Asset, AssetsCustomData, Editor } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface AssetsState {
  open: boolean;
  assets: Asset[];
  types: string[];
  select: (asset: Asset, complete?: boolean) => void;
  close: () => void;
  container: HTMLElement | undefined;
}

@Component({
  selector: 'gjs-assets-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsAssetsProvider }],
})
export class GjsAssetsProvider extends GjsCustomProviderBase {
  readonly customFlag = 'assetManager' as const;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: AssetsState }>;

  // Start with a closed default so consumers can render a hidden panel.
  readonly state = signal<AssetsState | null>({
    open: false,
    assets: [],
    types: [],
    select: () => undefined,
    close: () => undefined,
    container: undefined,
  });

  wire(editor: Editor): void {
    editor.on(editor.Assets.events.custom, ({ open, assets, types, select, close, container }: AssetsCustomData) => {
      this.state.set({ open, assets, types, select, close, container });
    });
  }
}
