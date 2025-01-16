import fs from 'fs';
import path from 'path';

const store = path.join('store', 'plugins.json');

// Ensure the plugins file exists
if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

const readPlugins = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writePlugins = (plugins) => fs.writeFileSync(store, JSON.stringify(plugins, null, 2));

/**
 * Adds a new plugin to the database.
 * @param {string} name - The name of the plugin.
 * @returns {Promise<Object>} - The added plugin.
 */
export async function addPlugin(name) {
  const plugins = readPlugins();
  const newPlugin = { name };

  // Check if plugin already exists
  if (plugins.some((plugin) => plugin.name === name)) {
    throw new Error('Plugin already exists');
  }

  plugins.push(newPlugin);
  writePlugins(plugins);
  return newPlugin;
}

/**
 * Updates an existing plugin by its name.
 * @param {string} name - The name of the plugin to update.
 * @param {string} newName - The new name for the plugin.
 * @returns {Promise<Object>} - The updated plugin.
 */
export async function updatePlugin(name, newName) {
  const plugins = readPlugins();
  const pluginIndex = plugins.findIndex((plugin) => plugin.name === name);

  if (pluginIndex === -1) {
    throw new Error('Plugin not found');
  }

  plugins[pluginIndex].name = newName;
  writePlugins(plugins);
  return plugins[pluginIndex];
}

/**
 * Removes a plugin from the database.
 * @param {string} name - The name of the plugin to remove.
 * @returns {Promise<boolean>} - Returns true if the plugin was removed, false otherwise.
 */
export async function removePlugin(name) {
  const plugins = readPlugins();
  const pluginIndex = plugins.findIndex((plugin) => plugin.name === name);

  if (pluginIndex === -1) {
    return false;
  }

  plugins.splice(pluginIndex, 1);
  writePlugins(plugins);
  return true;
}

/**
 * Retrieves all plugins from the database.
 * @returns {Promise<Array>} - An array of all plugins.
 */
export async function getPlugins() {
  return readPlugins();
}
