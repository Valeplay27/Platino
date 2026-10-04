import { products as defaultProducts, formatPrice, METALS, DEFAULT_METAL_IMAGES } from "../data/products";

const STORAGE_KEY_CATALOG = "platino_catalog_products_v1";

// Normalizar metales disponibles con los 10 metales oficiales y fotos por metal
const normalizeProductMetals = (prod) => {
  const defaultProdMatch = defaultProducts.find((p) => p.id === prod.id);
  const categories = prod.categories || defaultProdMatch?.categories || [prod.category];
  const metalImages =
    prod.metalImages ||
    defaultProdMatch?.metalImages ||
    (prod.id === "aros-trial" ? DEFAULT_METAL_IMAGES : null);

  if (Array.isArray(prod.availableMetals) && prod.availableMetals.length > 0) {
    // Si tiene la configuración antigua de 4 metales por defecto, actualizar a los 10 oficiales
    const isOldDefault =
      prod.availableMetals.length === 4 &&
      prod.availableMetals.some((m) => m.id === "oro-blanco-18k") &&
      !prod.availableMetals.some((m) => m.id === "oro-18k-blanco");

    if (isOldDefault) {
      return {
        ...prod,
        categories,
        availableMetals: METALS,
        selectedMetal: prod.selectedMetal || "Oro 18k Blanco",
        metalImages,
      };
    }

    // Asegurar que cada metal tenga las propiedades oficiales actualizadas
    const enriched = prod.availableMetals.map((m) => {
      const match = METALS.find((def) => def.id === m.id || def.name === m.name);
      return match ? { ...match } : m;
    });

    return {
      ...prod,
      categories,
      availableMetals: enriched,
      metalImages,
    };
  }

  // Si no tiene metales definidos, asignar los 10 oficiales
  return {
    ...prod,
    categories,
    availableMetals: METALS,
    selectedMetal: prod.selectedMetal || "Oro 18k Blanco",
    metalImages,
  };
};

// Cargar catálogo desde localStorage o inicializar con valores por defecto
export const getCatalogProducts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATALOG);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length >= defaultProducts.length) {
        return parsed.map(normalizeProductMetals);
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Combinar productos personalizados con las joyas oficiales por defecto
        const merged = [...parsed];
        defaultProducts.forEach((dp) => {
          if (!merged.some((p) => p.id === dp.id)) {
            merged.push(dp);
          }
        });
        const normalized = merged.map(normalizeProductMetals);
        localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(normalized));
        return normalized;
      }
    }
    // Inicializar por primera vez
    const initialized = defaultProducts.map(normalizeProductMetals);
    localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(initialized));
    return initialized;
  } catch (error) {
    console.error("Error reading catalog from localStorage", error);
    return defaultProducts.map(normalizeProductMetals);
  }
};

// Guardar lista en localStorage y notificar a la app
export const saveCatalogProducts = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent("catalog_updated", { detail: { products: list } })
    );
  } catch (error) {
    console.error("Error saving catalog to localStorage", error);
  }
};

// Obtener un producto por ID
export const getProductById = (id) => {
  const list = getCatalogProducts();
  return list.find((p) => p.id === id) || null;
};

// Crear nuevo producto en el catálogo
export const createProduct = (productData) => {
  const list = getCatalogProducts();

  // Generar ID único
  const cleanId = (
    productData.id ||
    productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") ||
    `joya-${Date.now()}`
  ) + `-${Date.now().toString().slice(-4)}`;

  const numPrice = Number(productData.price) || 0;

  const newProduct = {
    id: cleanId,
    name: productData.name.trim(),
    subtitle: productData.subtitle?.trim() || "Platino Perú Colección Exclusiva",
    categories: Array.isArray(productData.categories) && productData.categories.length > 0
      ? productData.categories
      : [productData.category || "joyeria"],
    type: productData.type || "anillo",
    price: numPrice,
    priceFormatted: formatPrice(numPrice),
    image: productData.image || "/images/cat-compromiso.jpg",
    metalImages: productData.metalImages || null,
    gallery: Array.isArray(productData.gallery) && productData.gallery.length > 0
      ? productData.gallery
      : [productData.image || "/images/cat-compromiso.jpg"],
    badge: productData.badge?.trim() || "Nuevo",
    selectedMetal: productData.selectedMetal || "Oro 18k Blanco",
    availableMetals:
      Array.isArray(productData.availableMetals) && productData.availableMetals.length > 0
        ? productData.availableMetals
        : METALS,
    defaultGemShape: productData.defaultGemShape || "Redondo",
    description: productData.description?.trim() || "Joya artesanal con certificación y acabados de alta calidad.",
    hasGemSelection: productData.hasGemSelection ?? true,
    hasDoubleSizes: productData.hasDoubleSizes ?? false,
    createdAt: new Date().toISOString(),
  };

  const updatedList = [newProduct, ...list];
  saveCatalogProducts(updatedList);
  return newProduct;
};

// Modificar un producto existente (incluyendo su imagen y variantes por metal)
export const updateProduct = (id, updatedFields) => {
  const list = getCatalogProducts();
  const index = list.findIndex((p) => p.id === id);

  if (index === -1) {
    return { success: false, error: "Producto no encontrado" };
  }

  const current = list[index];
  const numPrice = updatedFields.price !== undefined
    ? Number(updatedFields.price)
    : current.price;

  const newImage = updatedFields.image !== undefined ? updatedFields.image : current.image;

  // Actualizar galería si la imagen principal cambió y no se proveyó una nueva galería
  let newGallery = updatedFields.gallery || current.gallery;
  if (updatedFields.image && (!updatedFields.gallery || updatedFields.gallery.length === 0)) {
    newGallery = [newImage, ...(current.gallery?.slice(1) || [])];
  }

  const updatedProduct = {
    ...current,
    ...updatedFields,
    price: numPrice,
    priceFormatted: formatPrice(numPrice),
    image: newImage,
    gallery: newGallery,
    metalImages: updatedFields.metalImages !== undefined ? updatedFields.metalImages : (current.metalImages || null),
    updatedAt: new Date().toISOString(),
  };

  list[index] = updatedProduct;
  saveCatalogProducts(list);
  return { success: true, product: updatedProduct };
};

// Eliminar un producto del catálogo
export const deleteProduct = (id) => {
  const list = getCatalogProducts();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length) {
    return false;
  }
  saveCatalogProducts(filtered);
  return true;
};

// Restaurar catálogo predeterminado
export const resetToDefaultCatalog = () => {
  saveCatalogProducts(defaultProducts);
  return defaultProducts;
};
