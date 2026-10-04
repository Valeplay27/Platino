// Servicio de gestión de productos favoritos por usuario para Platino Perú

const STORAGE_PREFIX = "platino_favorites_";

// Favoritos iniciales para el cliente de prueba (cliente@platino.pe)
const INITIAL_DEMO_FAVORITES = [
  {
    id: "prod-secret-garden",
    name: "Anillo Solitario Secret Garden",
    price: 4850,
    image: "/images/secret-garden-white.jpg",
    metal: "Oro 18k Blanco",
    category: "Solitarios",
    type: "anillo",
    subtitle: "Solitario de Diamante 1.00 ct",
    addedAt: "2026-03-20",
  },
  {
    id: "aros-trial",
    name: "Aros Trial",
    price: 5700,
    image: "/images/aros-trial-blanco.jpg",
    metal: "Oro 18k Blanco",
    category: "Matrimonio",
    type: "aros",
    subtitle: "Dúo Matrimonial Alta Gama",
    addedAt: "2026-03-22",
  },
];

/**
 * Obtiene la lista de favoritos de un usuario según su correo
 */
export const getUserFavorites = (userEmail) => {
  if (!userEmail) return [];
  const cleanEmail = userEmail.trim().toLowerCase();
  const key = `${STORAGE_PREFIX}${cleanEmail}`;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (cleanEmail === "cliente@platino.pe") {
        localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_FAVORITES));
        return INITIAL_DEMO_FAVORITES;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error al obtener favoritos:", e);
    return [];
  }
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
  const key = `${STORAGE_PREFIX}${cleanEmail}`;
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
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("platino_favorites_updated", { detail: { email: cleanEmail } }));
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
  const key = `${STORAGE_PREFIX}${cleanEmail}`;
  const list = getUserFavorites(userEmail);

  const updated = list.filter((item) => String(item.id) !== String(productId));
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("platino_favorites_updated", { detail: { email: cleanEmail } }));
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
