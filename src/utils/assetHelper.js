/**
 * Resuelve rutas de archivos estáticos (imágenes en public/) respetando el BASE_URL
 * de Vite de manera idempotente (no duplica /Platino/ aunque se invoque varias veces).
 */
export function getAssetUrl(path) {
  if (!path || typeof path !== "string") return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;

  // Si la ruta ya empieza con el base, retornar tal cual
  if (cleanBase !== "/" && path.startsWith(cleanBase)) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const baseSegment = cleanBase.replace(/^\/|\/$/g, "");
  if (baseSegment && cleanPath.startsWith(baseSegment + "/")) {
    return "/" + cleanPath;
  }

  return `${cleanBase}${cleanPath}`;
}
