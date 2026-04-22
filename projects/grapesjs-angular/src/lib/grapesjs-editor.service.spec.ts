import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GrapesJsEditorService } from './grapesjs-editor.service';

// Mock grapesjs module
vi.mock('grapesjs', () => {
  return {
    default: {
      init: vi.fn(),
    },
  };
});

import grapesjs from 'grapesjs';

function createMockEditor() {
  const eventHandlers = new Map<string, Function>();
  return {
    on: vi.fn((event: string, handler: Function) => {
      eventHandlers.set(event, handler);
    }),
    destroy: vi.fn(),
    getHtml: vi.fn(() => '<div>test</div>'),
    getCss: vi.fn(() => '.test { color: red; }'),
    getProjectData: vi.fn(() => ({ pages: [] })),
    loadProjectData: vi.fn(),
    BlockManager: { getAll: vi.fn() },
    StyleManager: { getAll: vi.fn() },
    StorageManager: { getAll: vi.fn() },
    AssetManager: { getAll: vi.fn() },
    CssComposer: { getAll: vi.fn() },
    TraitManager: { getAll: vi.fn() },
    SelectorManager: { getAll: vi.fn() },
    LayerManager: { getAll: vi.fn() },
    Panels: { getAll: vi.fn() },
    Commands: { getAll: vi.fn() },
    _fireEvent: (event: string, ...args: unknown[]) => {
      const handler = eventHandlers.get(event);
      if (handler) handler(...args);
    },
  };
}

describe('GrapesJsEditorService', () => {
  let service: GrapesJsEditorService;
  let mockEditor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    mockEditor = createMockEditor();
    vi.mocked(grapesjs.init).mockReturnValue(mockEditor as any);

    TestBed.configureTestingModule({});
    service = TestBed.inject(GrapesJsEditorService);
  });

  it('init() sets the editor signal to a non-null Editor instance', () => {
    expect(service.editor()).toBeNull();
    service.init({ container: document.createElement('div') });
    expect(service.editor()).not.toBeNull();
    expect(grapesjs.init).toHaveBeenCalled();
  });

  it('init() warns and reinitialises if called when already initialised', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    service.init({ container: document.createElement('div') });
    service.init({ container: document.createElement('div') });
    expect(warnSpy).toHaveBeenCalledWith(
      '[GrapesJsEditorService] Editor already initialised. Call destroy() first.'
    );
    expect(mockEditor.destroy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('destroy() sets the editor signal back to null', () => {
    service.init({ container: document.createElement('div') });
    expect(service.editor()).not.toBeNull();
    service.destroy();
    expect(service.editor()).toBeNull();
  });

  it('blockManager computed is null before init, non-null after', () => {
    expect(service.blockManager()).toBeNull();
    service.init({ container: document.createElement('div') });
    expect(service.blockManager()).not.toBeNull();
  });

  it('storageManager computed is null before init, non-null after', () => {
    expect(service.storageManager()).toBeNull();
    service.init({ container: document.createElement('div') });
    expect(service.storageManager()).not.toBeNull();
  });

  it('getHtml() returns null before init', () => {
    expect(service.getHtml()).toBeNull();
  });

  it('getProjectData() returns null before init', () => {
    expect(service.getProjectData()).toBeNull();
  });

  it('selectedComponent updates when GrapesJS fires component:selected', () => {
    service.init({ container: document.createElement('div') });
    expect(service.selectedComponent()).toBeNull();
    const mockComponent = { getId: () => '123' };
    mockEditor._fireEvent('component:selected', mockComponent);
    expect(service.selectedComponent()).toBe(mockComponent);
  });
});
