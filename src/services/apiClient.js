import { handleLocalApiFallback } from "./localApiFallback";

const API_BASE_URL = `${import.meta.env.BASE_URL}api`;

function buildApiUrl(path) {
  const [pathname, query = ""] = String(path || "/").split("?");
  const params = new URLSearchParams(query);
  params.set("route", pathname);
  return `${API_BASE_URL}/index.php?${params.toString()}`;
}

function isLocalEnvironment() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.endsWith(".github.io")
  );
}

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  // En entorno local sin PHP (Vite dev / preview) o GitHub Pages, usar el motor local directamente
  if (isLocalEnvironment()) {
    return handleLocalApiFallback(path, { method, body });
  }

  let response;
  try {
    response = await fetch(buildApiUrl(path), {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    return handleLocalApiFallback(path, { method, body });
  }

  // Si un servidor estático devuelve 404/405 o la BD aún no está configurada (500+), usar fallback local
  if (response.status === 404 || response.status === 405 || response.status >= 500) {
    return handleLocalApiFallback(path, { method, body });
  }

  const payload = response.status === 204 ? {} : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `La solicitud falló (${response.status}).`);
  }
  if (payload === null || typeof payload !== "object") {
    return handleLocalApiFallback(path, { method, body });
  }
  return payload;
}

export const apiGet = (path, options) => apiRequest(path, options);
export const apiPost = (path, body, options) => apiRequest(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) => apiRequest(path, { ...options, method: "PUT", body });
export const apiDelete = (path, options) => apiRequest(path, { ...options, method: "DELETE" });
