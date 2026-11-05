// Servicio de gestión de productos favoritos por usuario para Platino Perú

import { getRemoteData, setRemoteData } from "./remoteData";

/**
 * Obtiene la lista de favoritos de un usuario según su correo
 */
export const getUserFavorites = (userEmail) => {
  if (!userEmail) return [];
  const cleanEmail = userEmail.trim().toLowerCase();
  const cacheKey = `favorites_${cleanEmail}`;
  const fallback = [];
  let res = getRemoteData("favorites", fallback, cacheKey);

  // Verificación y respaldo por persistencia local directa (evita que un refresco limpie la lista)
  if (!res || !Array.isArray(res) || res.length === 0) {
    try {
      const raw = localStorage.getItem(`platino_local_ns_${cacheKey}`) ||
                  localStorage.getItem(`platino_favorites_${cleanEmail}`) ||
                  localStorage.getItem(`favorites_${cleanEmail}`) ||
                  localStorage.getItem("platino_favorites");
      if (raw) {
        const parsed = JSON.parse(raw);
        const data = parsed && typeof parsed === "object" && "__ts" in parsed ? parsed.data : parsed;
        if (Array.isArray(data) && data.length > 0) {
          res = data;
          setRemoteData("favorites", data, "platino_favorites_updated", { email: cleanEmail }, cacheKey);
        }
      }
    } catch {
      // ignore
    }
  }

  return Array.isArray(res) ? res : [];
};

/**
 * Comprueba si un producto ya está en favoritos
 */
export const isUserFavorite = (userEmail, productId) => {
  if (!userEmail || !productId) return false;
  const list = getUserFavorites(userEmail);
  return list.some((item) => String(item.id) === String(productId));
};

/**
 * Agrega un producto a la lista de favoritos
 */
export const addToFavorites = (userEmail, product) => {
  if (!userEmail || !product || !product.id) return false;
  const cleanEmail = userEmail.trim().toLowerCase();
  const cacheKey = `favorites_${cleanEmail}`;
  const list = getUserFavorites(userEmail);

  if (!list.some((item) => String(item.id) === String(product.id))) {
    const updated = [
      {
        id: product.id,
        name: product.name || "Joya Platino",
        price: product.price || 0,
        image: product.image || "/images/secret-garden-white.jpg",
        metal: product.metal || product.selectedMetal?.name || "Oro 18k",
        metalId: product.metalId || product.selectedMetal?.id || "oro-18k-blanco",
        category: product.category || "Joyería Fina",
        type: product.type || "anillo",
        subtitle: product.subtitle || "",
        addedAt: new Date().toISOString(),
      },
      ...list,
    ];
    try {
      localStorage.setItem(`platino_favorites_${cleanEmail}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setRemoteData("favorites", updated, "platino_favorites_updated", { email: cleanEmail }, cacheKey);
    return true;
  }
  return false;
};

/**
 * Remueve un producto de favoritos
 */
export const removeFromFavorites = (userEmail, productId) => {
  if (!userEmail || !productId) return false;
  const cleanEmail = userEmail.trim().toLowerCase();
  const cacheKey = `favorites_${cleanEmail}`;
  const list = getUserFavorites(userEmail);

  const updated = list.filter((item) => String(item.id) !== String(productId));
  try {
    localStorage.setItem(`platino_favorites_${cleanEmail}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
  setRemoteData("favorites", updated, "platino_favorites_updated", { email: cleanEmail }, cacheKey);
  return true;
};

/**
 * Alterna (toggle) el estado de favorito
 * Retorna true si quedó agregado, false si fue removido
 */
export const toggleUserFavorite = (userEmail, product) => {
  if (!userEmail || !product || !product.id) return false;
  const exists = isUserFavorite(userEmail, product.id);
  if (exists) {
    removeFromFavorites(userEmail, product.id);
    return false;
  } else {
    addToFavorites(userEmail, product);
    return true;
  }
};

/**
 * Retorna la cantidad de productos favoritos
 */
export const getFavoriteCount = (userEmail) => {
  if (!userEmail) return 0;
  return getUserFavorites(userEmail).length;
};
