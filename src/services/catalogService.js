import { products as defaultProducts, formatPrice, METALS, DEFAULT_METAL_IMAGES, MASTER_GEM_SHAPES } from "../data/products";

const STORAGE_KEY_CATALOG = "platino_catalog_products_v1";

// Normalizar metales disponibles con los 10 metales oficiales y fotos por metal
const normalizeProductMetals = (prod) => {
  const defaultProdMatch = defaultProducts.find((p) => p.id === prod.id);
  const categories = prod.categories || defaultProdMatch?.categories || [prod.category];
  const metalImages =
    prod.metalImages ||
    defaultProdMatch?.metalImages ||
    (prod.id === "aros-trial" ? DEFAULT_METAL_IMAGES : null);
  const boxImage = prod.boxImage || defaultProdMatch?.boxImage || "/images/detail-box-green.jpg";

  // Reconstruir portafolio de galería unificando foto principal, variantes por metal y caja de presentación
  const metalValues = metalImages && typeof metalImages === "object" ? Object.values(metalImages) : [];
  const existingGallery = Array.isArray(prod.gallery) && prod.gallery.length > 0
    ? prod.gallery
    : (Array.isArray(defaultProdMatch?.gallery) ? defaultProdMatch.gallery : []);
  const allGalleryImgs = [
    prod.image || defaultProdMatch?.image || "/images/cat-compromiso.jpg",
    ...metalValues,
    boxImage,
    ...existingGallery,
  ].filter(Boolean);
  const combinedGallery = Array.from(new Set(allGalleryImgs));

  let finalMetals = METALS;
  if (Array.isArray(prod.availableMetals) && prod.availableMetals.length > 0) {
    const isOldDefault =
      prod.availableMetals.length === 4 &&
      prod.availableMetals.some((m) => m.id === "oro-blanco-18k") &&
      !prod.availableMetals.some((m) => m.id === "oro-18k-blanco");

    if (!isOldDefault) {
      finalMetals = prod.availableMetals.map((m) => {
        const match = METALS.find((def) => def.id === m.id || def.name === m.name);
        return match ? { ...match } : m;
      });
    }
  }

  return {
    ...prod,
    categories,
    availableMetals: finalMetals,
    selectedMetal: prod.selectedMetal || "Oro 18k Blanco",
    metalImages,
    metalPrices: prod.metalPrices || defaultProdMatch?.metalPrices || null,
    boxImage,
    gallery: combinedGallery,
    hasPresentationChoice: prod.hasPresentationChoice ?? true,
    showDeliveryEstimate: prod.showDeliveryEstimate,
    hasGemSelection: prod.hasGemSelection ?? (defaultProdMatch?.hasGemSelection ?? true),
    availableGemShapes: Array.isArray(prod.availableGemShapes) && prod.availableGemShapes.length > 0
      ? prod.availableGemShapes
      : (defaultProdMatch?.availableGemShapes || MASTER_GEM_SHAPES.map((s) => s.id)),
    defaultGemShape: prod.defaultGemShape || defaultProdMatch?.defaultGemShape || "redondo",
    gemShapeConfigs: prod.gemShapeConfigs || defaultProdMatch?.gemShapeConfigs || {},
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
    return { success: true };
  } catch (error) {
    console.error("Error saving catalog to localStorage", error);
    if (error && (error.name === "QuotaExceededError" || error.code === 22)) {
      alert("⚠️ El almacenamiento del navegador se encuentra lleno. Si subiste fotos muy pesadas, por favor usa fotos más ligeras.");
    }
    return { success: false, error };
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
  const finalBoxImage = productData.boxImage || "/images/detail-box-green.jpg";
  const metalValues = productData.metalImages && typeof productData.metalImages === "object"
    ? Object.values(productData.metalImages)
    : [];
  const allGalleryImgs = [
    productData.image || "/images/cat-compromiso.jpg",
    ...metalValues,
    finalBoxImage,
    ...(Array.isArray(productData.gallery) ? productData.gallery : []),
  ].filter(Boolean);
  const combinedGallery = Array.from(new Set(allGalleryImgs));

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
    boxImage: finalBoxImage,
    metalImages: productData.metalImages || null,
    metalPrices: productData.metalPrices || null,
    gallery: combinedGallery,
    badge: productData.badge?.trim() || "Nuevo",
    selectedMetal: productData.selectedMetal || "Oro 18k Blanco",
    availableMetals:
      Array.isArray(productData.availableMetals) && productData.availableMetals.length > 0
        ? productData.availableMetals
        : METALS,
    defaultGemShape: productData.defaultGemShape || "redondo",
    availableGemShapes: Array.isArray(productData.availableGemShapes) && productData.availableGemShapes.length > 0
      ? productData.availableGemShapes
      : MASTER_GEM_SHAPES.map((s) => s.id),
    gemShapeConfigs: productData.gemShapeConfigs || {},
    description: productData.description?.trim() || "Joya artesanal con certificación y acabados de alta calidad.",
    hasGemSelection: productData.hasGemSelection ?? true,
    hasDoubleSizes: productData.hasDoubleSizes ?? false,
    hasPresentationChoice: productData.hasPresentationChoice ?? true,
    presentationOptions: productData.presentationOptions || [
      {
        id: "caja-verde-lujo",
        name: "Caja de Lujo Esmeralda Platino (Recomendado)",
        price: 0,
        image: finalBoxImage,
        description: "Estuche rígido icónico verde esmeralda Platino con interior de gamuza aterciopelada y detalles dorados."
      },
      {
        id: "estuche-terciopelo",
        name: "Estuche de Terciopelo Negro Nupcial",
        price: 25,
        image: "/images/box-presentation.jpg",
        description: "Estuche premium de terciopelo negro mate tacto suave, ideal para pedida de mano y bodas."
      },
      {
        id: "caja-madera",
        name: "Caja de Madera Laqueada con Luz LED Nupcial",
        price: 60,
        image: "/images/detail-packaging.jpg",
        description: "Caja de madera noble con acabado piano brillante e iluminación LED focalizada al abrir para máxima sorpresa."
      }
    ],
    showDeliveryEstimate: productData.showDeliveryEstimate,
    createdAt: new Date().toISOString(),
  };

  const updatedList = [newProduct, ...list];
  const saveRes = saveCatalogProducts(updatedList);
  if (saveRes && saveRes.success === false) {
    return { success: false, error: saveRes.error };
  }
  return { success: true, product: newProduct };
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
  const finalBoxImage = updatedFields.boxImage !== undefined
    ? updatedFields.boxImage
    : (current.boxImage || "/images/detail-box-green.jpg");

  const finalMetalImages = updatedFields.metalImages !== undefined
    ? updatedFields.metalImages
    : (current.metalImages || null);

  const metalValues = finalMetalImages && typeof finalMetalImages === "object"
    ? Object.values(finalMetalImages)
    : [];

  const existingGallery = Array.isArray(updatedFields.gallery) && updatedFields.gallery.length > 0
    ? updatedFields.gallery
    : (Array.isArray(current.gallery) ? current.gallery : []);

  const allGalleryImgs = [
    newImage,
    ...metalValues,
    finalBoxImage,
    ...existingGallery,
  ].filter(Boolean);
  const combinedGallery = Array.from(new Set(allGalleryImgs));

  const updatedProduct = {
    ...current,
    ...updatedFields,
    price: numPrice,
    priceFormatted: formatPrice(numPrice),
    image: newImage,
    boxImage: finalBoxImage,
    gallery: combinedGallery,
    metalImages: finalMetalImages,
    metalPrices: updatedFields.metalPrices !== undefined ? updatedFields.metalPrices : (current.metalPrices || null),
    showDeliveryEstimate: updatedFields.showDeliveryEstimate !== undefined
      ? updatedFields.showDeliveryEstimate
      : current.showDeliveryEstimate,
    hasGemSelection: updatedFields.hasGemSelection !== undefined
      ? updatedFields.hasGemSelection
      : current.hasGemSelection,
    availableGemShapes: updatedFields.availableGemShapes !== undefined
      ? updatedFields.availableGemShapes
      : (current.availableGemShapes || MASTER_GEM_SHAPES.map((s) => s.id)),
    defaultGemShape: updatedFields.defaultGemShape !== undefined
      ? updatedFields.defaultGemShape
      : (current.defaultGemShape || "redondo"),
    gemShapeConfigs: updatedFields.gemShapeConfigs !== undefined
      ? updatedFields.gemShapeConfigs
      : (current.gemShapeConfigs || {}),
    updatedAt: new Date().toISOString(),
  };

  list[index] = updatedProduct;
  const saveRes = saveCatalogProducts(list);
  if (saveRes && saveRes.success === false) {
    return { success: false, error: saveRes.error };
  }
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
