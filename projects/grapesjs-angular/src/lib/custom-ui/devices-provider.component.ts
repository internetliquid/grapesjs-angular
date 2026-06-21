import { Component, ContentChild, TemplateRef, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Device, Editor } from 'grapesjs';
import { GjsCustomProviderBase } from './custom-provider-base';

export interface DevicesState {
  devices: Device[];
  selected: string;
  select: (deviceId: string) => void;
}

@Component({
  selector: 'gjs-devices-provider',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (state(); as ctx) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: ctx }"></ng-container>
    }
  `,
  providers: [{ provide: GjsCustomProviderBase, useExisting: GjsDevicesProvider }],
})
export class GjsDevicesProvider extends GjsCustomProviderBase {
  // Devices doesn't flip a custom flag — it's an observer-only provider.
  readonly customFlag = null;

  @ContentChild(TemplateRef) tpl!: TemplateRef<{ $implicit: DevicesState }>;

  readonly state = signal<DevicesState | null>(null);

  wire(editor: Editor): void {
    const { Devices } = editor;
    const event = Devices.events.all;

    const push = () => {
      this.state.set({
        devices: Devices.getDevices(),
        selected: (Devices.getSelected()?.id as string | undefined) ?? '',
        select: (id: string) => Devices.select(id),
      });
    };

    editor.on(event, push);
    push();
  }
}
