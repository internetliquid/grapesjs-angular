import {
  Component,
  ContentChild,
  TemplateRef,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Block, BlocksCustomData, Editor } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export type MapCategoryBlocks = Map<string, Block[]>;

export interface BlocksState {
  blocks: Block[];
  dragStart: (block: Block, ev?: Event) => void;
  dragStop: (cancel?: boolean) => void;
  container: HTMLElement | undefined;
  mapCategoryBlocks: MapCategoryBlocks;
}

@Component({
  selector: 'gjs-blocks-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsBlocksProvider }],
})
export class GjsBlocksProvider extends GjsCustomProviderBase {
  readonly customFlag = 'blockManager' as const;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: BlocksState }>;

  readonly state = signal<BlocksState | null>(null);

  wire(editor: Editor): void {
    editor.on(editor.Blocks.events.custom, (payload: BlocksCustomData) => {
      const mapCategoryBlocks: MapCategoryBlocks = new Map();
      for (const block of payload.blocks) {
        const label = block.getCategoryLabel();
        const existing = mapCategoryBlocks.get(label);
        if (existing) existing.push(block);
        else mapCategoryBlocks.set(label, [block]);
      }
      this.state.set({
        blocks: payload.blocks,
        dragStart: payload.dragStart,
        dragStop: payload.dragStop,
        container: payload.container,
        mapCategoryBlocks,
      });
    });
    editor.Blocks.__trgCustom();
  }
}
