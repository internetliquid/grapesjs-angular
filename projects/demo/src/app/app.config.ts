import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideGrapesJs } from 'grapesjs-angular';
import gjsBlocksBasic from 'grapesjs-blocks-basic';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideGrapesJs({
      plugins: [gjsBlocksBasic],
      storageManager: false,
    }),
  ],
};
