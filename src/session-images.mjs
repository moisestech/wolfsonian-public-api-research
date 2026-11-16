/** Local presentation images. IndexedDB only: nothing is uploaded or committed. */

import { imageKeys, photoKeys } from './archive-society.mjs';

const DB_NAME = 'archive-session-images';
const STORE = 'files';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function isTiff(file) {
  return file.type === 'image/tiff' || /\.tiff?$/i.test(file.name || '');
}

export function isDrawable(file) {
  if (!file || isTiff(file) || file.size <= 0 || file.size > 10 * 1024 * 1024) return false;
  if (/^image\/(png|jpeg|webp)$/.test(file.type)) return true;
  const generic = !file.type || file.type === 'application/octet-stream';
  return generic && /\.(png|jpe?g|webp)$/i.test(file.name || '');
}

export function urlFor(map, record) {
  return photoKeys(record || {}).map(key => map.get(key)).find(Boolean) || '';
}

async function writeBlob(blob, keys) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    for (const key of keys) store.put(blob, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function rememberImage(file, extraKeys, map, urls) {
  const keys = [...new Set([...imageKeys(file.name), ...(extraKeys || [])])].filter(Boolean);
  if (!keys.length) return [];
  const url = URL.createObjectURL(file);
  urls.add(url);
  for (const key of keys) map.set(key, url);
  try { await writeBlob(file, keys); } catch { /* The picture still shows for this page view. */ }
  return keys;
}

export async function loadImages(map, urls) {
  let db;
  try { db = await openDb(); } catch { return 0; }
  const rows = await new Promise((resolve, reject) => {
    const found = [];
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      found.push([String(cursor.key), cursor.value]);
      cursor.continue();
    };
    tx.oncomplete = () => resolve(found);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  for (const [key, blob] of rows) {
    const url = URL.createObjectURL(blob);
    urls.add(url);
    map.set(key, url);
  }
  return rows.length;
}

export async function clearStoredImages(map, urls) {
  for (const url of urls) URL.revokeObjectURL(url);
  urls.clear();
  map.clear();
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch { /* Memory is already empty. */ }
}
