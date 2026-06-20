import type { Plugin, PluginOptions } from 'grapesjs';
import { loadScripts } from './dom';

export type GrapesPlugin = string | Plugin<any>;

export type PluginToLoad = {
  id: string;
  src: string;
  options?: PluginOptions;
};

export type PluginTypeToLoad = GrapesPlugin | PluginToLoad | false | null | undefined;

const isPluginToLoad = (plugin: PluginTypeToLoad): plugin is PluginToLoad => {
  return !!(plugin && typeof plugin === 'object' && !Array.isArray(plugin));
};

async function loadPlugins(plugins: PluginToLoad[]) {
  const scripts = plugins.map(({ id, src }) => ({ id, src }));
  const pluginsMap = plugins.reduce<Record<string, PluginToLoad>>((res, item) => {
    res[item.id] = item;
    return res;
  }, {});
  const loaded: PluginToLoad[] = [];
  const failed: PluginToLoad[] = [];
  const results = await loadScripts(scripts);
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      loaded.push(pluginsMap[result.value]);
    } else {
      failed.push(pluginsMap[result.reason]);
    }
  });

  return { loaded, failed };
}

export async function initPlugins(plugins: PluginTypeToLoad[]) {
  const pluginsToInit: PluginTypeToLoad[] = [...plugins];
  const pluginOptions: Record<string, PluginOptions> = {};

  if (pluginsToInit.length) {
    const pluginToLoadMap: Record<string, { index: number; loaded?: boolean }> = {};
    const pluginsToLoad: PluginToLoad[] = [];

    pluginsToInit.forEach((plugin, index) => {
      if (isPluginToLoad(plugin)) {
        pluginToLoadMap[plugin.id] = { index };
        pluginsToLoad.push(plugin);
      }
    });

    if (pluginsToLoad.length) {
      const { loaded } = await loadPlugins(pluginsToLoad);
      loaded.forEach(({ id, options }) => {
        pluginToLoadMap[id].loaded = true;
        pluginOptions[id] = options || {};
      });
    }

    Object.keys(pluginToLoadMap).forEach(id => {
      const plugin = pluginToLoadMap[id];
      if (plugin.loaded) {
        pluginsToInit[plugin.index] = id;
      } else {
        pluginsToInit[plugin.index] = false;
      }
    });
  }

  return {
    plugins: pluginsToInit.filter(Boolean) as GrapesPlugin[],
    pluginOptions,
  };
}
