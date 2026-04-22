import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrapesJsEditorComponent } from './grapesjs-editor.component';
import { GrapesJsEditorService } from './grapesjs-editor.service';
import { GRAPES_JS_DEFAULT_CONFIG } from './grapesjs-editor.tokens';

function createMockService() {
  return {
    init: vi.fn().mockReturnValue({
      on: vi.fn(),
      destroy: vi.fn(),
    }),
    destroy: vi.fn(),
  };
}

describe('GrapesJsEditorComponent', () => {
  let component: GrapesJsEditorComponent;
  let fixture: ComponentFixture<GrapesJsEditorComponent>;
  let mockService: ReturnType<typeof createMockService>;

  beforeEach(async () => {
    mockService = createMockService();

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

  it('calls editorService.init() in ngAfterViewInit', () => {
    fixture.detectChanges();
    expect(mockService.init).toHaveBeenCalled();
    const config = mockService.init.mock.calls[0][0];
    expect(config.container).toBeInstanceOf(HTMLDivElement);
  });

  it('calls editorService.destroy() in ngOnDestroy', () => {
    fixture.detectChanges();
    component.ngOnDestroy();
    expect(mockService.destroy).toHaveBeenCalled();
  });

  it('emits editorReady when the GrapesJS load event fires', () => {
    const editorReadySpy = vi.fn();
    component.editorReady.subscribe(editorReadySpy);

    const mockEditor = {
      on: vi.fn(),
      destroy: vi.fn(),
    };
    mockService.init.mockReturnValue(mockEditor);

    fixture.detectChanges();

    // Find the 'load' handler and call it
    const loadCall = mockEditor.on.mock.calls.find(
      (call: unknown[]) => call[0] === 'load'
    );
    expect(loadCall).toBeDefined();
    loadCall![1]();
    expect(editorReadySpy).toHaveBeenCalledWith(mockEditor);
  });

  it('merges GRAPES_JS_DEFAULT_CONFIG with the config input, input wins on conflicts', async () => {
    const defaultConfig = {
      height: '500px',
      width: '100%',
      plugins: ['defaultPlugin' as any],
    };

    // Recreate TestBed with default config
    mockService = createMockService();
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

    fixture.detectChanges();

    const config = mockService.init.mock.calls[0][0];
    // Input wins on conflicts
    expect(config.height).toBe('800px');
    // Default config values preserved when not overridden
    expect(config.width).toBe('100%');
    // Plugins are merged (default + input)
    expect(config.plugins).toContain('defaultPlugin');
    expect(config.plugins).toContain('inputPlugin');
  });
});
