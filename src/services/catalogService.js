import { products as defaultProducts, formatPrice, METALS, DEFAULT_METAL_IMAGES, MASTER_GEM_SHAPES } from "../data/products";
import { getRemoteData, setRemoteData } from "./remoteData";

const REMOVED_DEMO_PRODUCT_IDS = new Set([
  "collar-cristal",
  "anillo-9-promesas",
  "aros-trial",
  "anillo-solitario-sublime",
  "anillo-trilogia-tres-piedras",
  "anillo-vintage-heritage",
  "anillo-moderno-bisel",
  "anillo-compromiso-esmeralda-real",
  "anillo-compromiso-rubi-pasion",
  "anillo-compromiso-zafiro-royal",
  "anillo-corazon-amor-eterno",
  "anillo-marquesa-realeza",
  "aros-romance-clasico",
  "anillo-promesa-esmeralda",
  "pulsera-tennis-diamantes",
  "collar-solitario-lagrima",
  "aros-alianza-eterna",
  "aros-boda-pedreria-lux",
  "aros-boda-textura-laurel",
  "aros-boda-moderno-dual",
  "aros-boda-vintage-milgrain",
  "porta-aros-cristal-lujo",
  "copas-decoradas-nupciales",
  "cuadros-conmemorativos-boda",
  "aretes-bebes-bolita-oro",
  "aretes-pegados-solitarios",
  "aretes-colgantes-cascada",
  "relicario-corazon-oro",
  "cadena-grumet-varon",
  "tobillera-esferas-plata",
  "anillo-promesa-infinito-oro",
  "anillo-promesa-nudo-amor",
  "anillo-promesa-moderno-onda",
  "alianza-amor-clasica-oro",
  "alianza-amor-sin-pedreria-dual",
  "alianza-amor-moderna-bisel",
  "alianza-amor-vintage-corona",
  "collar-cruz-latina-oro",
  "collar-nombre-personalizado",
  "juego-nupcial-perlas-australianas",
  "aro-casual-varon-plata-oro",
  "pulsera-eslabon-hombre-baraka",
  "reloj-cronografo-platino-swiss",
  "aretes-nina-mariposa-oro",
  "cadena-bebe-angel-guarda",
  "esclava-bebe-identidad-oro",
]);

const IMG_POOL_PREFIX = "__IMG_POOL_";

// Descomprimir referencias de imágenes deduplicadas al leer un producto
const expandProductImages = (rawProd) => {
  if (!rawProd || !Array.isArray(rawProd._imgPool) || rawProd._imgPool.length === 0) {
    return rawProd;
  }
  const pool = rawProd._imgPool;
  const resolveStr = (val) => {
    if (typeof val === "string" && val.startsWith(IMG_POOL_PREFIX)) {
      const idx = Number(val.slice(IMG_POOL_PREFIX.length));
      if (!Number.isNaN(idx) && pool[idx]) {
        return pool[idx];
      }
    }
    return val;
  };

  const expandedMetalImages = rawProd.metalImages && typeof rawProd.metalImages === "object"
    ? Object.fromEntries(Object.entries(rawProd.metalImages).map(([k, v]) => [k, resolveStr(v)]))
    : rawProd.metalImages;

  const expandedMetalGalleries = rawProd.metalGalleries && typeof rawProd.metalGalleries === "object"
    ? Object.fromEntries(
        Object.entries(rawProd.metalGalleries).map(([k, arr]) => [
          k,
          Array.isArray(arr) ? arr.map(resolveStr) : arr,
        ])
      )
    : rawProd.metalGalleries;

  const expandedGallery = Array.isArray(rawProd.gallery)
    ? rawProd.gallery.map(resolveStr)
    : rawProd.gallery;

  const { _imgPool, ...rest } = rawProd;
  return {
    ...rest,
    image: resolveStr(rawProd.image),
    boxImage: resolveStr(rawProd.boxImage),
    metalImages: expandedMetalImages,
    metalGalleries: expandedMetalGalleries,
    gallery: expandedGallery,
  };
};



// Normalizar metales disponibles con los 10 metales oficiales y fotos por metal
const normalizeProductMetals = (rawProd) => {
  const prod = expandProductImages(rawProd);
  const defaultProdMatch = defaultProducts.find((p) => p.id === prod.id);
  const categories = prod.categories || defaultProdMatch?.categories || [prod.category];
  const metalImages =
    prod.metalImages ||
    defaultProdMatch?.metalImages ||
    (prod.id === "aros-trial" ? DEFAULT_METAL_IMAGES : null);
  const metalGalleries = prod.metalGalleries || defaultProdMatch?.metalGalleries || null;
  const boxImage = prod.boxImage || defaultProdMatch?.boxImage || "/images/detail-box-green.jpg";

  // Reconstruir portafolio de galería unificando foto principal, secuencias por metal y caja de presentación
  const metalGalleryValues =
    metalGalleries && typeof metalGalleries === "object"
      ? Object.values(metalGalleries).flat().filter((v) => typeof v === "string" && v.trim())
      : [];
  const metalValues = metalImages && typeof metalImages === "object" ? Object.values(metalImages) : [];
  const existingGallery = Array.isArray(prod.gallery) && prod.gallery.length > 0
    ? prod.gallery
    : (Array.isArray(defaultProdMatch?.gallery) ? defaultProdMatch.gallery : []);
  const allGalleryImgs = [
    prod.image || defaultProdMatch?.image || "/images/cat-compromiso.jpg",
    ...metalGalleryValues,
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
    metalGalleries,
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

// Cargar catálogo remoto (sin productos de demostración)
export const getCatalogProducts = () => {
  const parsed = getRemoteData("catalog", defaultProducts);
  if (Array.isArray(parsed)) {
    return parsed
      .filter((p) => p && !REMOVED_DEMO_PRODUCT_IDS.has(p.id))
      .map(normalizeProductMetals);
  }
  return [];
};

export const saveCatalogProducts = (list) => {
  const normalized = (Array.isArray(list) ? list : [])
    .filter((p) => p && !REMOVED_DEMO_PRODUCT_IDS.has(p.id))
    .map(normalizeProductMetals);
  setRemoteData("catalog", normalized, "catalog_updated", { products: normalized });
  return { success: true };
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
  const metalGalleryValues =
    productData.metalGalleries && typeof productData.metalGalleries === "object"
      ? Object.values(productData.metalGalleries).flat().filter((v) => typeof v === "string" && v.trim())
      : [];
  const metalValues = productData.metalImages && typeof productData.metalImages === "object"
    ? Object.values(productData.metalImages)
    : [];
  const allGalleryImgs = [
    productData.image || "/images/cat-compromiso.jpg",
    ...metalGalleryValues,
    ...metalValues,
    finalBoxImage,
    ...(Array.isArray(productData.gallery) ? productData.gallery : []),
  ].filter(Boolean);
  const combinedGallery = Array.from(new Set(allGalleryImgs));

  const newProduct = {
    ...productData,
    id: cleanId,
    name: productData.name.trim(),
    subtitle: productData.subtitle?.trim() || "Platino Perú Colección Exclusiva",
    category: productData.category || (Array.isArray(productData.categories) && productData.categories[0]) || "joyeria",
    categories: Array.isArray(productData.categories) && productData.categories.length > 0
      ? productData.categories
      : [productData.category || "joyeria"],
    subtype: productData.subtype || "",
    subtypeOptionId: productData.subtypeOptionId || "",
    gender: productData.gender || "",
    style: productData.style || "",
    gem: productData.gem || "",
    type: productData.type || "anillo",
    price: numPrice,
    priceFormatted: formatPrice(numPrice),
    image: productData.image || "/images/cat-compromiso.jpg",
    boxImage: finalBoxImage,
    metalImages: productData.metalImages || null,
    metalGalleries: productData.metalGalleries || null,
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

  const finalMetalGalleries = updatedFields.metalGalleries !== undefined
    ? updatedFields.metalGalleries
    : (current.metalGalleries || null);

  const metalGalleryValues =
    finalMetalGalleries && typeof finalMetalGalleries === "object"
      ? Object.values(finalMetalGalleries).flat().filter((v) => typeof v === "string" && v.trim())
      : [];

  const metalValues = finalMetalImages && typeof finalMetalImages === "object"
    ? Object.values(finalMetalImages)
    : [];

  const existingGallery = Array.isArray(updatedFields.gallery) && updatedFields.gallery.length > 0
    ? updatedFields.gallery
    : (Array.isArray(current.gallery) ? current.gallery : []);

  const allGalleryImgs = [
    newImage,
    ...metalGalleryValues,
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
    metalGalleries: finalMetalGalleries,
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

// Restaurar catálogo predeterminado (vacío sin productos de prueba)
export const resetToDefaultCatalog = () => {
  saveCatalogProducts([]);
  return [];
};
