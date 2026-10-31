import { handleLocalApiFallback } from "./localApiFallback";

const API_BASE_URL = `${import.meta.env.BASE_URL}api`;
const LOCAL_SESSION_KEY = "platino_local_api_session_v1";

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

function getLocalSessionHeader() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email) {
      return JSON.stringify({
        id: parsed.id || 1,
        email: parsed.email,
        name: parsed.name || "Vladimir",
        role: parsed.role || "admin_master",
        sede_id: parsed.sede_id || parsed.sede || null,
      });
    }
  } catch {
    // ignore
  }
  return null;
}

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  // En entorno local sin PHP (Vite dev / preview) o GitHub Pages, usar el motor local directamente
  if (isLocalEnvironment()) {
    const res = await handleLocalApiFallback(path, { method, body });
    return res && typeof res === "object" ? { ...res, __localFallback: true } : res;
  }

  // En servidores Apache/SiteGround, usar POST en lugar de PUT para evitar bloqueos 405/403 de ModSecurity
  const wireMethod = method === "PUT" ? "POST" : method;
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const sessionHeader = getLocalSessionHeader();
  if (sessionHeader) {
    headers["X-Platino-User"] = sessionHeader;
  }

  let response;
  try {
    response = await fetch(buildApiUrl(path), {
      method: wireMethod,
      credentials: "include",
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    const res = await handleLocalApiFallback(path, { method, body });
    return res && typeof res === "object" ? { ...res, __localFallback: true } : res;
  }

  // Si el servidor devuelve 404/405/500+, o 401/403 cuando hay sesión local activa, usar fallback local sin perder datos
  if (
    response.status === 404 ||
    response.status === 405 ||
    response.status >= 500 ||
    ((response.status === 401 || response.status === 403) && sessionHeader && !String(path).startsWith("/auth/login"))
  ) {
    const res = await handleLocalApiFallback(path, { method, body });
    return res && typeof res === "object" ? { ...res, __localFallback: true } : res;
  }

  const payload = response.status === 204 ? {} : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `La solicitud falló (${response.status}).`);
  }
  if (payload === null || typeof payload !== "object") {
    const res = await handleLocalApiFallback(path, { method, body });
    return res && typeof res === "object" ? { ...res, __localFallback: true } : res;
  }
  return payload;
}

export const apiGet = (path, options) => apiRequest(path, options);
export const apiPost = (path, body, options) => apiRequest(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) => apiRequest(path, { ...options, method: "PUT", body });
export const apiDelete = (path, options) => apiRequest(path, { ...options, method: "DELETE" });
