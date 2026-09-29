import {
  createStore,
  get as idbGet,
  set as idbSet,
  del as idbDel,
  update as idbUpdate,
  getMany as idbGetMany,
  setMany as idbSetMany,
  type UseStore,
} from 'idb-keyval'

// Keep upstream backup field names while isolating browser data from the personal site.
export const STORAGE_NAMESPACE = 'yuansays-words'
export const storageKey = (key: IDBValidKey): string => `${STORAGE_NAMESPACE}:${String(key)}`
let store: UseStore | undefined

function getStore(): UseStore {
  return (store ??= createStore(STORAGE_NAMESPACE, 'state'))
}

export function get<T = any>(key: IDBValidKey): Promise<T | undefined> {
  return idbGet<T>(storageKey(key), getStore())
}

export function set(key: IDBValidKey, value: unknown): Promise<void> {
  return idbSet(storageKey(key), value, getStore())
}

export function del(key: IDBValidKey): Promise<void> {
  return idbDel(storageKey(key), getStore())
}

export function update<T = any>(key: IDBValidKey, updater: (value: T | undefined) => T): Promise<void> {
  return idbUpdate<T>(storageKey(key), updater, getStore())
}

export function getMany<T = any>(keys: IDBValidKey[]): Promise<(T | undefined)[]> {
  return idbGetMany<T>(keys.map(storageKey), getStore())
}

/** One IndexedDB transaction: a failed restore never leaves half of a backup installed. */
export function setMany(entries: [IDBValidKey, unknown][]): Promise<void> {
  return idbSetMany(entries.map(([key, value]) => [storageKey(key), value]), getStore())
}
