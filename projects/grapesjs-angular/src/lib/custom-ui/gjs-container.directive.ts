import { Directive, ElementRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

/**
 * Append a GrapesJS-owned `HTMLElement` (e.g. the block-manager container
 * surfaced on a provider's state) into the directive's host element.
 *
 * ```html
 * <gjs-blocks-provider>
 *   <ng-template let-ctx>
 *     <div [gjsContainer]="ctx.container"></div>
 *   </ng-template>
 * </gjs-blocks-provider>
 * ```
 *
 * Consumers who render blocks themselves don't need this — it's a convenience
 * for mounting the default container into a chosen slot without building a
 * portal system.
 */
@Directive({
  selector: '[gjsContainer]',
  standalone: true,
})
export class GjsContainerDirective implements OnChanges {
  @Input('gjsContainer') container?: HTMLElement | null;

  private host = inject(ElementRef<HTMLElement>);

  ngOnChanges(changes: SimpleChanges): void {
    if (!('container' in changes)) return;
    const el = this.host.nativeElement;
    // Clear any previously attached container before appending the new one.
    while (el.firstChild) el.removeChild(el.firstChild);
    if (this.container) el.appendChild(this.container);
  }
}
