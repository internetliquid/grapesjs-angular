import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Type } from '@angular/core';
import { GrapesJsEditorComponent } from '../grapesjs-editor.component';
import { GrapesJsEditorService } from '../grapesjs-editor.service';
import { GjsBlocksProvider } from './blocks-provider.component';
import { GjsLayersProvider } from './layers-provider.component';
import { GjsSelectorsProvider } from './selectors-provider.component';
import { GjsStylesProvider } from './styles-provider.component';
import { GjsTraitsProvider } from './traits-provider.component';
import { GjsPagesProvider } from './pages-provider.component';
import { GjsDevicesProvider } from './devices-provider.component';
import { GjsAssetsProvider } from './assets-provider.component';
import { GjsModalProvider } from './modal-provider.component';
import { GjsCanvas } from './gjs-canvas.component';

@Component({
  selector: 'custom-ui-test-host',
  standalone: true,
  imports: [
    GrapesJsEditorComponent,
    GjsCanvas,
    GjsBlocksProvider,
    GjsLayersProvider,
    GjsSelectorsProvider,
    GjsStylesProvider,
    GjsTraitsProvider,
    GjsPagesProvider,
    GjsDevicesProvider,
    GjsAssetsProvider,
    GjsModalProvider,
  ],
  template: ``,
})
class CustomUiTestHost {}

function createMockEditor() {
  const listeners = new Map<string, Function[]>();
  const readyHandlers: Function[] = [];
  const managerStub = (customEvent: string, extra: Record<string, unknown> = {}) => ({
    events: { custom: customEvent, all: customEvent },
    __trgCustom: vi.fn(),
    ...extra,
  });
  return {
    on: vi.fn((event: string, handler: Function) => {
      const arr = listeners.get(event) ?? [];
      arr.push(handler);
      listeners.set(event, arr);
    }),
    onReady: vi.fn((handler: Function) => readyHandlers.push(handler)),
    destroy: vi.fn(),
    getProjectData: vi.fn(() => ({ pages: [] })),
    Blocks: managerStub('block:custom'),
    Layers: { ...managerStub('layer:custom'), getRoot: vi.fn(() => ({ id: 'root' })) },
    Selectors: {
      ...managerStub('selector:custom'),
      getSelected: vi.fn(() => []),
      getStates: vi.fn(() => []),
      getState: vi.fn(() => ''),
      getSelectedTargets: vi.fn(() => []),
      addSelected: vi.fn(),
      removeSelected: vi.fn(),
      setState: vi.fn(),
    },
    Styles: { ...managerStub('style:custom'), getSectors: vi.fn(() => []) },
    Traits: { ...managerStub('trait:custom'), getCurrent: vi.fn(() => []) },
    Pages: {
      events: { all: 'page:all' },
      getAll: vi.fn(() => []),
      getSelected: vi.fn(() => undefined),
      select: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
    },
    Devices: {
      events: { all: 'device:all' },
      getDevices: vi.fn(() => []),
      getSelected: vi.fn(() => ({ id: 'desktop' })),
      select: vi.fn(),
    },
    Assets: managerStub('asset:custom'),
    _fire: (event: string, ...args: unknown[]) => listeners.get(event)?.forEach(h => h(...args)),
    _fireReady: () => readyHandlers.forEach(h => h()),
  };
}

function createMockService(mockEditor: ReturnType<typeof createMockEditor>) {
  return {
    init: vi.fn().mockReturnValue(mockEditor),
    destroy: vi.fn(),
  };
}

async function flushInit(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  fixture.detectChanges();
}

async function mountHostWithTemplate(
  template: string,
  mockService: { init: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> },
): Promise<ComponentFixture<CustomUiTestHost>> {
  await TestBed.configureTestingModule({
    imports: [CustomUiTestHost as Type<unknown>],
    providers: [{ provide: GrapesJsEditorService, useValue: mockService }],
  }).compileComponents();
  TestBed.overrideComponent(CustomUiTestHost, { set: { template } });
  const fx = TestBed.createComponent(CustomUiTestHost);
  await flushInit(fx);
  return fx;
}

describe('Custom UI — provider discovery and config merging', () => {
  let mockEditor: ReturnType<typeof createMockEditor>;
  let mockService: ReturnType<typeof createMockService>;

  beforeEach(async () => {
    mockEditor = createMockEditor();
    mockService = createMockService(mockEditor);
    await TestBed.resetTestingModule();
  });

  it('BlocksProvider sets blockManager.custom=true in init config', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-blocks-provider><ng-template let-ctx></ng-template></gjs-blocks-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].blockManager).toEqual({ custom: true });
  });

  it('LayersProvider sets layerManager.custom=true', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-layers-provider><ng-template let-ctx></ng-template></gjs-layers-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].layerManager).toEqual({ custom: true });
  });

  it('SelectorsProvider sets selectorManager.custom=true', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-selectors-provider><ng-template let-ctx></ng-template></gjs-selectors-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].selectorManager).toEqual({ custom: true });
  });

  it('StylesProvider sets styleManager.custom=true', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-styles-provider><ng-template let-ctx></ng-template></gjs-styles-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].styleManager).toEqual({ custom: true });
  });

  it('TraitsProvider sets traitManager.custom=true', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-traits-provider><ng-template let-ctx></ng-template></gjs-traits-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].traitManager).toEqual({ custom: true });
  });

  it('AssetsProvider sets assetManager.custom=true', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-assets-provider><ng-template let-ctx></ng-template></gjs-assets-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].assetManager).toEqual({ custom: true });
  });

  it('ModalProvider sets modal.custom=true', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-modal-provider><ng-template let-ctx></ng-template></gjs-modal-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].modal).toEqual({ custom: true });
  });

  it('PagesProvider does NOT flip a custom flag (observer-only)', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-pages-provider><ng-template let-ctx></ng-template></gjs-pages-provider></gjs-editor>`,
      mockService,
    );
    const cfg = mockService.init.mock.calls[0][0];
    expect(cfg.blockManager).toBeUndefined();
    expect(cfg.layerManager).toBeUndefined();
  });

  it('DevicesProvider does NOT flip a custom flag (observer-only)', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-devices-provider><ng-template let-ctx></ng-template></gjs-devices-provider></gjs-editor>`,
      mockService,
    );
    expect(mockService.init.mock.calls[0][0].blockManager).toBeUndefined();
  });

  it('multiple providers merge their flags into one config without interfering', async () => {
    await mountHostWithTemplate(
      `
        <gjs-editor>
          <gjs-blocks-provider><ng-template let-ctx></ng-template></gjs-blocks-provider>
          <gjs-layers-provider><ng-template let-ctx></ng-template></gjs-layers-provider>
          <gjs-styles-provider><ng-template let-ctx></ng-template></gjs-styles-provider>
        </gjs-editor>
      `,
      mockService,
    );
    const cfg = mockService.init.mock.calls[0][0];
    expect(cfg.blockManager).toEqual({ custom: true });
    expect(cfg.layerManager).toEqual({ custom: true });
    expect(cfg.styleManager).toEqual({ custom: true });
    expect(cfg.selectorManager).toBeUndefined();
  });

  it('<gjs-canvas> swaps the container, sets customUI=true, and empties default panels', async () => {
    await mountHostWithTemplate(
      `<gjs-editor><gjs-canvas></gjs-canvas></gjs-editor>`,
      mockService,
    );
    const cfg = mockService.init.mock.calls[0][0];
    expect(cfg.customUI).toBe(true);
    expect(cfg.panels).toEqual({ defaults: [] });
    expect((cfg.container as HTMLElement).tagName.toLowerCase()).toBe('gjs-canvas');
  });
});

describe('Custom UI — provider wire() state updates', () => {
  it('BlocksProvider.state updates when custom event fires, with category map built', () => {
    const provider = new GjsBlocksProvider();
    const editor = createMockEditor();
    provider.wire(editor as any);
    const block = (cat: string, id: string) => ({
      getCategoryLabel: () => cat,
      getId: () => id,
    }) as any;
    const blocks = [block('basic', 'a'), block('basic', 'b'), block('typo', 'c')];
    editor._fire('block:custom', {
      blocks,
      container: document.createElement('div'),
      dragStart: () => {},
      dragStop: () => {},
      drag: () => {},
      bm: {} as any,
    });
    const state = provider.state();
    expect(state).not.toBeNull();
    expect(state!.blocks).toHaveLength(3);
    expect(state!.mapCategoryBlocks.get('basic')).toHaveLength(2);
    expect(state!.mapCategoryBlocks.get('typo')).toHaveLength(1);
  });

  it('LayersProvider.state exposes root and container on custom event', () => {
    const provider = new GjsLayersProvider();
    const editor = createMockEditor();
    provider.wire(editor as any);
    const container = document.createElement('div');
    editor._fire('layer:custom', { container, root: { id: 'root' } as any });
    const state = provider.state();
    expect(state!.container).toBe(container);
    expect(state!.root).toEqual({ id: 'root' });
  });

  it('PagesProvider.state populates immediately and on page:all events', () => {
    const provider = new GjsPagesProvider();
    const editor = createMockEditor();
    provider.wire(editor as any);
    expect(provider.state()).not.toBeNull();
    expect(provider.state()!.pages).toEqual([]);
    editor.Pages.getAll = vi.fn(() => [{ id: 'p1' }]) as any;
    editor._fire('page:all');
    expect(provider.state()!.pages).toEqual([{ id: 'p1' }]);
  });

  it('SelectorsProvider.wire() triggers the initial custom event so the panel renders before any selection', () => {
    // In custom-UI mode GrapesJS skips its default panel render, so it never
    // fires selector:custom on init. The provider must self-trigger or its
    // projected <ng-template> never instantiates (panel renders empty).
    const provider = new GjsSelectorsProvider();
    const editor = createMockEditor();
    provider.wire(editor as any);
    expect(editor.Selectors.__trgCustom).toHaveBeenCalledTimes(1);
  });

  it('StylesProvider.wire() triggers the initial custom event so the panel renders before any selection', () => {
    const provider = new GjsStylesProvider();
    const editor = createMockEditor();
    provider.wire(editor as any);
    expect(editor.Styles.__trgCustom).toHaveBeenCalledTimes(1);
  });

  it('ModalProvider.state flips open on modal event', () => {
    const provider = new GjsModalProvider();
    const editor = createMockEditor();
    provider.wire(editor as any);
    expect(provider.state()!.open).toBe(false);
    editor._fire('modal', {
      open: true,
      title: document.createTextNode('Hi'),
      content: document.createTextNode('body'),
      attributes: {},
      close: () => {},
    });
    expect(provider.state()!.open).toBe(true);
  });
});
