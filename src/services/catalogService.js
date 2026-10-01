import { products as defaultProducts, formatPrice } from "../data/products";

const STORAGE_KEY_CATALOG = "platino_catalog_products_v1";

// Cargar catálogo desde localStorage o inicializar con valores por defecto
export const getCatalogProducts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATALOG);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length >= defaultProducts.length) {
        return parsed;
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Combinar productos personalizados con las joyas oficiales por defecto
        const merged = [...parsed];
        defaultProducts.forEach((dp) => {
          if (!merged.some((p) => p.id === dp.id)) {
            merged.push(dp);
          }
        });
        localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(merged));
        return merged;
      }
    }
    // Inicializar por primera vez
    localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(defaultProducts));
    return defaultProducts;
  } catch (error) {
    console.error("Error reading catalog from localStorage", error);
    return defaultProducts;
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
    gallery: Array.isArray(productData.gallery) && productData.gallery.length > 0
      ? productData.gallery
      : [productData.image || "/images/cat-compromiso.jpg"],
    badge: productData.badge?.trim() || "Nuevo",
    selectedMetal: productData.selectedMetal || "Oro Blanco 18k",
    availableMetals: productData.availableMetals || [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
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

// Modificar un producto existente (incluyendo su imagen)
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
