import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import type { GrapesJsModuleConfig } from './grapesjs-editor.types';

export const GRAPES_JS_DEFAULT_CONFIG = new InjectionToken<GrapesJsModuleConfig>(
  'GRAPES_JS_DEFAULT_CONFIG'
);

export function provideGrapesJs(config: GrapesJsModuleConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: GRAPES_JS_DEFAULT_CONFIG, useValue: config },
  ]);
}
