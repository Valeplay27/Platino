import { apiDelete, apiGet, apiPut } from "./apiClient";

const LOCAL_NS_PREFIX = "platino_local_ns_";
const LOCAL_DIRTY_PREFIX = "platino_dirty_ns_";
const SYNC_PING_KEY = "platino_sync_ping_v1";
const IDB_NAME = "platino_storage_db_v1";
const IDB_STORE = "namespaces";

const cache = new Map();
const pendingWrites = new Map();

const NAMESPACE_EVENTS = {
  catalog: "catalog_updated",
  home_images: "home_images_updated",
  announcement: "announcement_updated",
  announcement_active: "announcement_updated",
  appointments: "citas_updated",
  blocked_slots: "citas_updated",
  orders: "orders_updated",
  inventory: "platino_inventory_updated",
  educacion: "platino_blog_updated",
  nosotros: "platino_nosotros_updated",
  gemstones: "gemstones_updated",
  laboratories: "gemstones_updated",
};

// ========================================================
// 1. PERSISTENCIA LOCAL (localStorage + IndexedDB ilimitado)
// ========================================================
export function readLocalEnvelope(cacheKey) {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(`${LOCAL_NS_PREFIX}${cacheKey}`);
    if (raw === null) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "__ts" in parsed) {
      return parsed;
    }
    return { __ts: 0, data: parsed };
  } catch {
    return undefined;
  }
}

export function readLocalNamespace(cacheKey) {
  const env = readLocalEnvelope(cacheKey);
  return env ? env.data : undefined;
}

export function writeLocalNamespace(cacheKey, value) {
  if (typeof window === "undefined") return;
  const envelope = { __ts: Date.now(), data: value };
  try {
    localStorage.setItem(`${LOCAL_NS_PREFIX}${cacheKey}`, JSON.stringify(envelope));
  } catch {
    // Si supera la cuota de localStorage (~5MB), BORRAR la clave obsoleta de localStorage
    // para que futuras lecturas usen inmediatamente la versión completa de IndexedDB
    try {
      localStorage.removeItem(`${LOCAL_NS_PREFIX}${cacheKey}`);
    } catch {
      // ignore
    }
  }
  writeIdbNamespace(cacheKey, envelope);
}

function removeLocalNamespace(cacheKey) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${LOCAL_NS_PREFIX}${cacheKey}`);
    localStorage.removeItem(`${LOCAL_DIRTY_PREFIX}${cacheKey}`);
  } catch {
    // ignore
  }
  deleteIdbNamespace(cacheKey);
}

function markDirty(cacheKey, isDirty) {
  if (typeof window === "undefined") return;
  try {
    if (isDirty) {
      localStorage.setItem(`${LOCAL_DIRTY_PREFIX}${cacheKey}`, String(Date.now()));
    } else {
      localStorage.removeItem(`${LOCAL_DIRTY_PREFIX}${cacheKey}`);
    }
  } catch {
    // ignore
  }
}

function isNamespaceDirty(cacheKey) {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(`${LOCAL_DIRTY_PREFIX}${cacheKey}`));
  } catch {
    return false;
  }
}

// IndexedDB para catálogos e imágenes de alta resolución (>5MB)
let idbPromise = null;
function getIdb() {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.resolve(null);
  if (!idbPromise) {
    idbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return idbPromise;
}

export async function readIdbEnvelope(cacheKey) {
  const db = await getIdb();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(cacheKey);
      req.onsuccess = () => {
        const res = req.result;
        if (res && typeof res === "object" && "__ts" in res) {
          resolve(res);
        } else if (res !== undefined) {
          resolve({ __ts: 0, data: res });
        } else {
          resolve(undefined);
        }
      };
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export async function readIdbNamespace(cacheKey) {
  const env = await readIdbEnvelope(cacheKey);
  return env ? env.data : undefined;
}

export async function writeIdbNamespace(cacheKey, value) {
  const db = await getIdb();
  if (!db) return;
  try {
    const envelope = value && typeof value === "object" && "__ts" in value ? value : { __ts: Date.now(), data: value };
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(envelope, cacheKey);
  } catch {
    // ignore
  }
}

export async function deleteIdbNamespace(cacheKey) {
  const db = await getIdb();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(cacheKey);
  } catch {
    // ignore
  }
}

function dispatchNamespaceEvents(namespace, cacheKey, data, customEventName = null, customEventDetail = undefined) {
  if (typeof window === "undefined") return;
  const eventsToFire = new Set();
  if (customEventName) eventsToFire.add(customEventName);
  if (NAMESPACE_EVENTS[namespace]) eventsToFire.add(NAMESPACE_EVENTS[namespace]);

  eventsToFire.forEach((evt) => {
    window.dispatchEvent(
      new CustomEvent(evt, customEventDetail !== undefined ? { detail: customEventDetail } : { detail: { namespace, data } })
    );
  });
  window.dispatchEvent(new CustomEvent("platino_data_loaded", { detail: { namespace, cacheKey, data } }));
}

// ========================================================
// 2. SINCRONIZACIÓN EN TIEMPO REAL ENTRE PESTAÑAS
// ========================================================
let syncChannel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new window.BroadcastChannel("platino_sync_channel");
    syncChannel.onmessage = (event) => {
      const msg = event?.data;
      if (!msg || !msg.cacheKey) return;
      if (msg.action === "clear") {
        cache.delete(msg.cacheKey);
        return;
      }
      if (msg.value !== undefined) {
        cache.set(msg.cacheKey, msg.value);
        dispatchNamespaceEvents(msg.namespace || msg.cacheKey, msg.cacheKey, msg.value, msg.eventName);
      }
    };
  } catch {
    syncChannel = null;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", async (event) => {
    if (!event.key) return;
    if (event.key.startsWith(LOCAL_NS_PREFIX)) {
      const cacheKey = event.key.slice(LOCAL_NS_PREFIX.length);
      const localVal = readLocalNamespace(cacheKey);
      if (localVal !== undefined) {
        cache.set(cacheKey, localVal);
        dispatchNamespaceEvents(cacheKey, cacheKey, localVal);
      }
    } else if (event.key === SYNC_PING_KEY && event.newValue) {
      try {
        const ping = JSON.parse(event.newValue);
        if (ping?.cacheKey) {
          let val = readLocalNamespace(ping.cacheKey);
          if (val === undefined) {
            val = await readIdbNamespace(ping.cacheKey);
          }
          if (val !== undefined) {
            cache.set(ping.cacheKey, val);
            dispatchNamespaceEvents(ping.namespace || ping.cacheKey, ping.cacheKey, val, ping.eventName);
          }
        }
      } catch {
        // ignore
      }
    }
  });
}

function broadcastNamespaceChange(namespace, cacheKey, value, eventName = null) {
  if (typeof window === "undefined") return;
  try {
    syncChannel?.postMessage({ action: "set", namespace, cacheKey, value, eventName });
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(
      SYNC_PING_KEY,
      JSON.stringify({ namespace, cacheKey, eventName, ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

// ========================================================
// 3. API PÚBLICA DE REMOTEDATA
// ========================================================
export const loadRemoteData = async (namespace, fallback, cacheKey = namespace) => {
  // 1. Verificar primero copia local en localStorage e IndexedDB y tomar la más reciente
  const localEnv = readLocalEnvelope(cacheKey);
  const idbEnv = await readIdbEnvelope(cacheKey);

  let localVal = undefined;
  if (idbEnv && localEnv) {
    localVal = (idbEnv.__ts || 0) >= (localEnv.__ts || 0) ? idbEnv.data : localEnv.data;
  } else if (idbEnv) {
    localVal = idbEnv.data;
  } else if (localEnv) {
    localVal = localEnv.data;
  }

  if (localVal !== undefined && !cache.has(cacheKey)) {
    cache.set(cacheKey, localVal);
  }

  // 2. Consultar al servidor
  let response = null;
  try {
    response = await apiGet(`/data?namespace=${encodeURIComponent(namespace)}`);
  } catch (err) {
    console.warn(`Error loading remote namespace ${namespace}, using local cache:`, err);
  }

  const remoteVal = response?.data;
  const dirty = isNamespaceDirty(cacheKey);

  let finalValue;
  if (dirty && localVal !== undefined && localVal !== null) {
    // Hay cambios locales pendientes de sincronizar al servidor
    finalValue = localVal;
    persistNamespace(namespace, localVal, cacheKey).catch(() => {});
  } else if (remoteVal !== null && remoteVal !== undefined) {
    // Si el servidor devolvió un catálogo o imágenes vacías pero localmente hay guardados recientes, preservar los locales
    const isRemoteCatalogEmpty =
      namespace === "catalog" && Array.isArray(remoteVal) && remoteVal.length === 0 && Array.isArray(localVal) && localVal.length > 0;
    const isRemoteHomeEmpty =
      namespace === "home_images" && (!remoteVal || Object.keys(remoteVal).length === 0) && localVal && Object.keys(localVal).length > 0;

    if (isRemoteCatalogEmpty || isRemoteHomeEmpty) {
      finalValue = localVal;
      persistNamespace(namespace, localVal, cacheKey).catch(() => {});
    } else {
      finalValue = remoteVal;
      writeLocalNamespace(cacheKey, remoteVal);
    }
  } else if (localVal !== undefined && localVal !== null) {
    // El servidor devolvió null (BD vacía), pero hay datos guardados localmente: usarlos y subirlos al servidor
    finalValue = localVal;
    persistNamespace(namespace, localVal, cacheKey).catch(() => {});
  } else {
    finalValue = fallback;
  }

  cache.set(cacheKey, finalValue);
  dispatchNamespaceEvents(namespace, cacheKey, finalValue);
  return finalValue;
};

const persistNamespace = (namespace, value, cacheKey = namespace) => {
  const previous = pendingWrites.get(cacheKey) || Promise.resolve();
  const next = previous
    .catch(() => {})
    .then(async () => {
      const res = await apiPut(`/data?namespace=${encodeURIComponent(namespace)}`, { data: value });
      if (!res?.__localFallback) {
        markDirty(cacheKey, false);
      }
      return res;
    })
    .catch((error) => {
      console.error(`Failed to persist ${namespace}:`, error);
      // Mantener marcado como dirty para reintentar pero no bloquear la interfaz pues ya está guardado localmente
      markDirty(cacheKey, true);
      return { success: true, __localSaved: true };
    });
  pendingWrites.set(cacheKey, next);
  return next;
};

export const getRemoteData = (namespace, fallback, cacheKey = namespace) => {
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const localVal = readLocalNamespace(cacheKey);
  if (localVal !== undefined && localVal !== null) {
    cache.set(cacheKey, localVal);
    // Verificación asíncrona en IndexedDB por si los datos superaron la cuota de localStorage
    readIdbEnvelope(cacheKey).then((idbEnv) => {
      const localEnv = readLocalEnvelope(cacheKey);
      if (idbEnv && (!localEnv || (idbEnv.__ts || 0) > (localEnv.__ts || 0))) {
        cache.set(cacheKey, idbEnv.data);
        dispatchNamespaceEvents(namespace, cacheKey, idbEnv.data);
      }
    });
    return localVal;
  }
  // Si no está en localStorage (ej. limpiado por sobrepasar cuota 5MB), buscar en IndexedDB
  readIdbNamespace(cacheKey).then((idbVal) => {
    if (idbVal !== undefined && idbVal !== null) {
      cache.set(cacheKey, idbVal);
      dispatchNamespaceEvents(namespace, cacheKey, idbVal);
    }
  });
  return fallback;
};

export const setRemoteData = (namespace, value, eventName = null, eventDetail = undefined, cacheKey = namespace) => {
  cache.set(cacheKey, value);
  markDirty(cacheKey, true);
  writeLocalNamespace(cacheKey, value);
  dispatchNamespaceEvents(namespace, cacheKey, value, eventName, eventDetail);
  broadcastNamespaceChange(namespace, cacheKey, value, eventName);
  return persistNamespace(namespace, value, cacheKey);
};

export const updateRemoteCache = (cacheKey, value, eventName = null, eventDetail = undefined) => {
  cache.set(cacheKey, value);
  writeLocalNamespace(cacheKey, value);
  dispatchNamespaceEvents(cacheKey, cacheKey, value, eventName, eventDetail);
  broadcastNamespaceChange(cacheKey, cacheKey, value, eventName);
  return value;
};

export const clearRemoteData = (namespace, eventName = null, eventDetail = undefined, cacheKey = namespace) => {
  cache.delete(cacheKey);
  removeLocalNamespace(cacheKey);
  if (eventName) {
    window.dispatchEvent(new CustomEvent(eventName, eventDetail !== undefined ? { detail: eventDetail } : undefined));
  }
  broadcastNamespaceChange(namespace, cacheKey, undefined, eventName);
  return apiDelete(`/data?namespace=${encodeURIComponent(namespace)}`).catch((error) => {
    console.error(`Failed to delete ${namespace}:`, error);
  });
};

export const clearRemoteCache = (cacheKey = null) => {
  if (cacheKey) {
    cache.delete(cacheKey);
    return;
  }
  cache.clear();
};
