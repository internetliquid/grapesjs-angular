import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { GrapesJsEditorComponent } from './grapesjs-editor.component';
import { GrapesJsEditorService } from './grapesjs-editor.service';
import { GRAPES_JS_DEFAULT_CONFIG } from './grapesjs-editor.tokens';

function createMockEditor() {
  const eventHandlers = new Map<string, Function>();
  const readyHandlers: Function[] = [];
  return {
    on: vi.fn((event: string, handler: Function) => {
      eventHandlers.set(event, handler);
    }),
    onReady: vi.fn((handler: Function) => {
      readyHandlers.push(handler);
    }),
    destroy: vi.fn(),
    getProjectData: vi.fn(() => ({ pages: [] })),
    _fireEvent: (event: string, ...args: unknown[]) => {
      const handler = eventHandlers.get(event);
      if (handler) handler(...args);
    },
    _fireReady: () => readyHandlers.forEach(h => h()),
  };
}

function createMockService(mockEditor: ReturnType<typeof createMockEditor>) {
  return {
    init: vi.fn().mockReturnValue(mockEditor),
    destroy: vi.fn(),
  };
}

/**
 * The component's ngAfterViewInit is async (awaits initPlugins). Angular fires it
 * during detectChanges, but the awaited microtasks resolve after. Flush them.
 */
async function flushInit(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  // Two flushes: one for the loadStyle promise (if used), one for initPlugins.
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  fixture.detectChanges();
}

describe('GrapesJsEditorComponent', () => {
  let component: GrapesJsEditorComponent;
  let fixture: ComponentFixture<GrapesJsEditorComponent>;
  let mockService: ReturnType<typeof createMockService>;
  let mockEditor: ReturnType<typeof createMockEditor>;

  beforeEach(async () => {
    mockEditor = createMockEditor();
    mockService = createMockService(mockEditor);

    await TestBed.configureTestingModule({
      imports: [GrapesJsEditorComponent],
      providers: [
        { provide: GrapesJsEditorService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GrapesJsEditorComponent);
    component = fixture.componentInstance;
  });

  it('renders without error with an empty config input', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
  });

  it('calls editorService.init() in ngAfterViewInit', async () => {
    await flushInit(fixture);
    expect(mockService.init).toHaveBeenCalled();
    const config = mockService.init.mock.calls[0][0];
    expect(config.container).toBeInstanceOf(HTMLDivElement);
  });

  it('calls editorService.destroy() in ngOnDestroy', async () => {
    await flushInit(fixture);
    component.ngOnDestroy();
    expect(mockService.destroy).toHaveBeenCalled();
  });

  it('emits editorCreated synchronously with the editor instance', async () => {
    const createdSpy = vi.fn();
    component.editorCreated.subscribe(createdSpy);
    await flushInit(fixture);
    expect(createdSpy).toHaveBeenCalledWith(mockEditor);
  });

  it('emits editorLoaded when the GrapesJS load event fires', async () => {
    const loadedSpy = vi.fn();
    component.editorLoaded.subscribe(loadedSpy);
    await flushInit(fixture);
    mockEditor._fireEvent('load');
    expect(loadedSpy).toHaveBeenCalledWith(mockEditor);
  });

  it('emits editorReady after editor.onReady fires', async () => {
    const readySpy = vi.fn();
    component.editorReady.subscribe(readySpy);
    await flushInit(fixture);
    expect(readySpy).not.toHaveBeenCalled();
    mockEditor._fireReady();
    expect(readySpy).toHaveBeenCalledWith(mockEditor);
  });

  it('emits projectUpdated on editor update event with project data', async () => {
    const updatedSpy = vi.fn();
    component.projectUpdated.subscribe(updatedSpy);
    await flushInit(fixture);
    mockEditor._fireEvent('update');
    expect(updatedSpy).toHaveBeenCalledWith({
      data: { pages: [] },
      editor: mockEditor,
    });
  });

  it('merges GRAPES_JS_DEFAULT_CONFIG with the config input, input wins on conflicts', async () => {
    const defaultConfig = {
      height: '500px',
      width: '100%',
      plugins: ['defaultPlugin' as any],
    };

    mockEditor = createMockEditor();
    mockService = createMockService(mockEditor);
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [GrapesJsEditorComponent],
      providers: [
        { provide: GrapesJsEditorService, useValue: mockService },
        { provide: GRAPES_JS_DEFAULT_CONFIG, useValue: defaultConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GrapesJsEditorComponent);
    component = fixture.componentInstance;
    component.config = { height: '800px' };
    component.plugins = ['inputPlugin' as any];

    await flushInit(fixture);

    const config = mockService.init.mock.calls[0][0];
    expect(config.height).toBe('800px');
    expect(config.width).toBe('100%');
    expect(config.plugins).toContain('defaultPlugin');
    expect(config.plugins).toContain('inputPlugin');
  });

  it('passes function plugins through unchanged to editorService.init', async () => {
    const fnPlugin = () => {};
    component.plugins = [fnPlugin as any];
    await flushInit(fixture);
    const config = mockService.init.mock.calls[0][0];
    expect(config.plugins).toContain(fnPlugin);
  });

  it('skips init() on non-browser platforms (SSR safe)', async () => {
    mockEditor = createMockEditor();
    mockService = createMockService(mockEditor);
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [GrapesJsEditorComponent],
      providers: [
        { provide: GrapesJsEditorService, useValue: mockService },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();

    const ssrFixture = TestBed.createComponent(GrapesJsEditorComponent);
    await flushInit(ssrFixture);

    expect(mockService.init).not.toHaveBeenCalled();
  });
});
