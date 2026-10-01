/**
 * Limpia y normaliza una ruta de asset a su forma canónica relativa (/images/ejemplo.jpg).
 * Elimina prefijos duplicados o de repositorio (como /Platino/ o Platino/Platino/).
 */
export function toCleanAssetPath(path) {
  if (!path || typeof path !== "string") return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  let clean = path.trim().replace(/^\/+/, "");

  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const baseSegment = cleanBase.replace(/^\/|\/$/g, "");

  const segments = ["Platino"];
  if (baseSegment && !segments.includes(baseSegment)) {
    segments.push(baseSegment);
  }

  const prefixRegex = new RegExp(`^(${segments.join("|")})\\/`, "i");
  while (prefixRegex.test(clean)) {
    clean = clean.replace(prefixRegex, "");
  }

  return `/${clean}`;
}

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
  const cleanRelative = toCleanAssetPath(path).replace(/^\/+/, "");
  return `${cleanBase}${cleanRelative}`;
}

