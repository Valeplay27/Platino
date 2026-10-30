const API_BASE_URL = `${import.meta.env.BASE_URL}api`;

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const payload = response.status === 204 ? {} : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `La solicitud falló (${response.status}).`);
  }
  return payload;
}

export const apiGet = (path, options) => apiRequest(path, options);
export const apiPost = (path, body, options) => apiRequest(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) => apiRequest(path, { ...options, method: "PUT", body });
export const apiDelete = (path, options) => apiRequest(path, { ...options, method: "DELETE" });
