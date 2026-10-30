import { apiGet, apiPut } from "./apiClient";

const cache = new Map();
const namespaceDefaults = new Map();
const namespaceLoads = new Map();

export function getRemoteData(namespace, fallback, cacheKey = namespace) {
  if (!namespaceDefaults.has(cacheKey)) {
    namespaceDefaults.set(cacheKey, fallback);
  }
  return cache.has(cacheKey) ? cache.get(cacheKey) : fallback;
}

export function setRemoteData(namespace, data, eventName, detail = {}, cacheKey = namespace) {
  cache.set(cacheKey, data);
  if (eventName) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: { ...detail, data } }));
  }
  const pending = apiPut(`/data?namespace=${encodeURIComponent(namespace)}`, { data });
  pending.catch((error) => {
    console.error(`Could not persist ${namespace} on the API:`, error);
    window.dispatchEvent(new CustomEvent("platino_api_error", { detail: { namespace, message: error.message } }));
  });
  return pending;
}

export function updateRemoteCache(namespace, data, eventName, detail = {}, cacheKey = namespace) {
  cache.set(cacheKey, data);
  if (eventName) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: { ...detail, data } }));
  }
}

export function clearRemoteCache(cacheKey) {
  cache.delete(cacheKey);
  namespaceLoads.delete(cacheKey);
}

export async function loadRemoteData(namespace, fallback, cacheKey = namespace) {
  if (!namespaceDefaults.has(cacheKey)) {
    namespaceDefaults.set(cacheKey, fallback);
  }
  if (!namespaceLoads.has(cacheKey)) {
    const pending = apiGet(`/data?namespace=${encodeURIComponent(namespace)}`)
      .then(({ data }) => {
        cache.set(cacheKey, data ?? namespaceDefaults.get(cacheKey));
        window.dispatchEvent(new CustomEvent("platino_data_loaded", { detail: { namespace } }));
      })
      .finally(() => namespaceLoads.delete(cacheKey));
    namespaceLoads.set(cacheKey, pending);
  }
  return namespaceLoads.get(cacheKey);
}

export async function preloadRemoteData(defaults) {
  await Promise.all(Object.entries(defaults).map(([namespace, fallback]) => loadRemoteData(namespace, fallback)));
}

export async function replaceRemoteData(namespace, data, cacheKey = namespace) {
  cache.set(cacheKey, data);
  await apiPut(`/data?namespace=${encodeURIComponent(namespace)}`, { data });
  window.dispatchEvent(new CustomEvent("platino_data_loaded", { detail: { namespace } }));
}
