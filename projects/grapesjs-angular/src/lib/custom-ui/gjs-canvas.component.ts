import { Component, ElementRef, inject } from '@angular/core';

/**
 * Mount-point for GrapesJS's canvas when a consumer is composing a custom UI.
 *
 * When projected as a content child of `<gjs-editor>`, the editor uses this
 * element as the GrapesJS `container` and enables `customUI: true` with empty
 * default panels — letting consumers lay out their own sidebars and toolbars
 * around the canvas using Angular templates.
 *
 * ```html
 * <gjs-editor>
 *   <gjs-canvas class="flex-1"></gjs-canvas>
 *   <gjs-blocks-provider>...</gjs-blocks-provider>
 * </gjs-editor>
 * ```
 */
@Component({
  selector: 'gjs-canvas',
  standalone: true,
  template: '',
  styles: [':host { display: block; width: 100%; height: 100%; }'],
})
export class GjsCanvas {
  readonly elementRef = inject(ElementRef<HTMLElement>);
}
