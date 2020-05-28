import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

/**
 * This utilizes the capacitor storage plugin. It automatically chooses the best
 * storage for the current device. In browser it will choose local storage.
 * Values will be saved as key-value pairs
 * @param key identifier
 * @param value to be stored
 */
export async function set(key: string, value: any): Promise<void> {
  await Storage.set({
    key,
    value: JSON.stringify(value)
  });
}

export async function get(key: string): Promise<any> {
  const item = await Storage.get({ key });
  return JSON.parse(item.value);
}

export async function remove(key: string): Promise<void> {
  await Storage.remove({
    key
  });
}
