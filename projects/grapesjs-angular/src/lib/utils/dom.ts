const isString = (value: unknown): value is string => typeof value === 'string';

export const loadStyle = (href: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      return resolve();
    }
    const link = document.createElement('link');
    link.href = href;
    link.rel = 'stylesheet';
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
    document.head.appendChild(link);
  });
};

type ScriptToLoad = { id: string; src: string };

export const loadScript = (src: string | ScriptToLoad): Promise<string> => {
  const scriptToLoad: ScriptToLoad = isString(src) ? { id: src, src } : src;
  return new Promise<string>((res, rej) => {
    if (document.querySelector(`script[src="${scriptToLoad.src}"]`)) {
      return res(scriptToLoad.id);
    }
    const script = document.createElement('script');
    script.src = scriptToLoad.src;
    script.onload = () => res(scriptToLoad.id);
    script.onerror = () => rej(scriptToLoad.id);
    document.head.appendChild(script);
  });
};

export const loadScripts = (scripts: ScriptToLoad[]) => {
  return Promise.allSettled(scripts.map(loadScript));
};
