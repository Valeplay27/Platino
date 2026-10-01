import { getAssetUrl } from "../utils/assetHelper";

const STORAGE_KEY_HOME_IMAGES = "platino_home_images_v1";

export const DEFAULT_HOME_IMAGES = {
  // 1. Hero Principal
  heroCompromiso: {
    id: "heroCompromiso",
    label: "Banner Hero: Compromiso",
    section: "Banners Principales (Hero)",
    description: "Fondo para la tarjeta de Compromiso en la cabecera del inicio.",
    image: "/images/hero-compromiso.jpg",
    title: "Compromiso",
    buttonText: "Ver Colección",
    link: "/categoria/anillos-compromiso",
  },
  heroMatrimonio: {
    id: "heroMatrimonio",
    label: "Banner Hero: Matrimonio",
    section: "Banners Principales (Hero)",
    description: "Fondo para la tarjeta de Matrimonio en la cabecera del inicio.",
    image: "/images/hero-matrimonio.jpg",
    title: "Matrimonio",
    buttonText: "Ver Colección",
    link: "/categoria/aros-boda",
  },

  // 2. The Fall Edit & The New Classics (7 Fotos en total)
  editorialFall: {
    id: "editorialFall",
    label: "Foto 1 (Izquierda): The Fall Edit",
    section: "The Fall Edit & The New Classics",
    description: "Foto editorial principal de la temporada con texto y botón 'Shop Now'.",
    image: "/images/editorial-fall.jpg",
    title: "The Fall Edit",
    subtitle: "Some designs never go out of style. Discover new classics for the season ahead.",
    buttonText: "Shop Now",
    link: "/categoria/joyeria",
  },
  editorialClassics: {
    id: "editorialClassics",
    isSectionHeader: true,
    label: "Texto Central: The New Classics",
    section: "The Fall Edit & The New Classics",
    description: "Tipografía script central sobre el collage de 6 fotos pegadas.",
    title: "The New Classics",
    link: "/categoria/joyeria",
  },
  showroom: {
    id: "showroom",
    label: "Foto 1 (Principal): Boutique y Showroom",
    section: "Nuestras Sedes & Showroom",
    description: "Fotografía principal del showroom y asesoría presencial de Platino Perú.",
    image: "/images/showroom.jpg",
    title: "Estamos aquí para ti, en persona y en línea",
    subtitle: "Ya sea en una tienda cercana a usted o en línea, seleccionamos su cita solo para usted.",
  },
  showroomSecondary: {
    id: "showroomSecondary",
    label: "Foto 2 (Opcional): Segunda Sede o Vista adicional",
    section: "Nuestras Sedes & Showroom",
    description: "Segunda fotografía opcional para mostrar ambas sedes en paralelo.",
    image: "",
  },
  ringRender: {
    id: "ringRender",
    label: "Render Sortija Selector de Gemas",
    section: "Selector de Gemas / Corte",
    description: "Imagen de la sortija en platino para el selector de corte.",
    image: "/images/ring-render.png",
  },

  // 3. Comprar joyas por categoría
  catCompromiso: {
    id: "catCompromiso",
    name: "ANILLO DE COMPROMISO",
    label: "Categoría: Anillo de Compromiso",
    section: "Comprar joyas por categoría",
    image: "/images/cat-compromiso.jpg",
    path: "/categoria/anillos-compromiso",
  },
  catBoda: {
    id: "catBoda",
    name: "AROS DE BODA",
    label: "Categoría: Aros de Boda",
    section: "Comprar joyas por categoría",
    image: "/images/cat-boda.jpg",
    path: "/categoria/aros-boda",
  },
  catPromesa: {
    id: "catPromesa",
    name: "ANILLO DE PROMESA",
    label: "Categoría: Anillo de Promesa",
    section: "Comprar joyas por categoría",
    image: "/images/cat-promesa.jpg",
    path: "/categoria/anillos-promesa",
  },
  catAlianzas: {
    id: "catAlianzas",
    name: "AROS DE ALIANZAS",
    label: "Categoría: Aros de Alianzas",
    section: "Comprar joyas por categoría",
    image: "/images/cat-alianzas.jpg",
    path: "/categoria/alianzas",
  },
  catPulseras: {
    id: "catPulseras",
    name: "PULSERAS",
    label: "Categoría: Pulseras",
    section: "Comprar joyas por categoría",
    image: "/images/cat-pulseras.jpg",
    path: "/categoria/pulseras",
  },
  catCollares: {
    id: "catCollares",
    name: "COLLARES",
    label: "Categoría: Collares",
    section: "Comprar joyas por categoría",
    image: "/images/cat-collares.jpg",
    path: "/categoria/collares",
  },

  // 4. Anillos dignos de obsesión (Encabezado + Estilos)
  sectionRingStyles: {
    id: "sectionRingStyles",
    isSectionHeader: true,
    label: "Encabezado de Sección: Anillos",
    section: "Anillos dignos de obsesión",
    title: "Anillos de compromiso dignos de obsesión",
    subtitle: "Arte y artesanía en cada detalle.",
  },
  styleNaturaleza: {
    id: "styleNaturaleza",
    name: "Anillos inspirados en la naturaleza",
    label: "Estilo: Naturaleza",
    section: "Anillos dignos de obsesión",
    image: "/images/style-naturaleza.jpg",
    path: "/categoria/anillos-naturaleza",
  },
  styleVintage: {
    id: "styleVintage",
    name: "Anillos antiguos y vintage",
    label: "Estilo: Vintage",
    section: "Anillos dignos de obsesión",
    image: "/images/style-vintage.jpg",
    path: "/categoria/anillos-vintage",
  },
  styleTresPiedras: {
    id: "styleTresPiedras",
    name: "Anillos de tres piedras",
    label: "Estilo: Tres piedras",
    section: "Anillos dignos de obsesión",
    image: "/images/style-tres-piedras.jpg",
    path: "/categoria/anillos-tres-piedras",
  },
  styleSolitarios: {
    id: "styleSolitarios",
    name: "Anillos solitarios",
    label: "Estilo: Solitarios",
    section: "Anillos dignos de obsesión",
    image: "/images/style-solitarios.jpg",
    path: "/categoria/anillos-solitarios",
  },
  styleNupciales: {
    id: "styleNupciales",
    name: "Conjuntos nupciales",
    label: "Estilo: Nupciales",
    section: "Anillos dignos de obsesión",
    image: "/images/style-nupciales.jpg",
    path: "/categoria/conjuntos-nupciales",
  },
  styleBisel: {
    id: "styleBisel",
    name: "Anillos de bisel",
    label: "Estilo: Bisel",
    section: "Anillos dignos de obsesión",
    image: "/images/style-bisel.jpg",
    path: "/categoria/anillos-bisel",
  },

  // 5. The New Classics (Las 6 piezas del collage pegado)
  mosaic1: {
    id: "mosaic1",
    label: "Foto 2 (Mosaico): Collar de Diamantes",
    section: "The Fall Edit & The New Classics",
    description: "Pieza 1 de The New Classics (superior izquierda).",
    image: "/images/mosaic-1.jpg",
    alt: "Diamond Tennis Necklace",
  },
  mosaic2: {
    id: "mosaic2",
    label: "Foto 3 (Mosaico): Dije Solitario Esmeralda",
    section: "The Fall Edit & The New Classics",
    description: "Pieza 2 de The New Classics (superior centro).",
    image: "/images/mosaic-2.jpg",
    alt: "Emerald Solitaire Pendant",
  },
  mosaic3: {
    id: "mosaic3",
    label: "Foto 4 (Mosaico): Anillos de Oro Apilables",
    section: "The Fall Edit & The New Classics",
    description: "Pieza 3 de The New Classics (superior derecha).",
    image: "/images/mosaic-3.jpg",
    alt: "Gold Ring Stack",
  },
  mosaic4: {
    id: "mosaic4",
    label: "Foto 5 (Mosaico): Sortijas Gemas Verde y Azul",
    section: "The Fall Edit & The New Classics",
    description: "Pieza 4 de The New Classics (inferior izquierda).",
    image: "/images/mosaic-4.jpg",
    alt: "Cocktail Gemstone Rings",
  },
  mosaic5: {
    id: "mosaic5",
    label: "Foto 6 (Mosaico): Aros Eternidad Rubí y Zafiro",
    section: "The Fall Edit & The New Classics",
    description: "Pieza 5 de The New Classics (inferior centro).",
    image: "/images/mosaic-5.jpg",
    alt: "Ruby Eternity Band",
  },
  mosaic6: {
    id: "mosaic6",
    label: "Foto 7 (Mosaico): Pulsera Tenis y Aretes",
    section: "The Fall Edit & The New Classics",
    description: "Pieza 6 de The New Classics (inferior derecha).",
    image: "/images/mosaic-6.jpg",
    alt: "Bridal Diamond Collection",
  },
};

// Obtener la configuración actual de imágenes del Inicio
export const getHomeImages = () => {
  let data = { ...DEFAULT_HOME_IMAGES };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HOME_IMAGES);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Combinar con los valores por defecto en caso de llaves nuevas
      data = { ...DEFAULT_HOME_IMAGES, ...parsed };
    }
  } catch (error) {
    console.error("Error loading home images from localStorage", error);
  }

  // Resolver rutas relativas para soportar GitHub Pages (BASE_URL)
  const resolved = {};
  for (const [key, item] of Object.entries(data)) {
    resolved[key] = {
      ...item,
      image: item?.image ? getAssetUrl(item.image) : item?.image,
    };
  }
  return resolved;
};

// Guardar y notificar cambios
export const saveHomeImages = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY_HOME_IMAGES, JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent("home_images_updated", { detail: { images: data } })
    );
  } catch (error) {
    console.error("Error saving home images to localStorage", error);
  }
};

export const HOME_SECTIONS = [
  { id: "all", name: "Todas las Secciones", section: "todas", icon: "bi-grid-fill" },
  { id: "hero", name: "1. Banners Hero", section: "Banners Principales (Hero)", icon: "bi-star-fill" },
  { id: "rings", name: "2. Anillos Dinos de Obsesión", section: "Anillos dignos de obsesión", icon: "bi-gem" },
  { id: "fall_classics", name: "3. The Fall Edit & The New Classics (7 Fotos)", section: "The Fall Edit & The New Classics", icon: "bi-images" },
  { id: "sedes", name: "4. Showroom & Sedes (1 o 2 Fotos)", section: "Nuestras Sedes & Showroom", icon: "bi-geo-alt-fill" },
  { id: "categories", name: "5. Categorías de Joyas", section: "Comprar joyas por categoría", icon: "bi-tags-fill" },
  { id: "gems", name: "6. Selector de Gemas", section: "Selector de Gemas / Corte", icon: "bi-diamond-fill" },
];

// Actualizar una sola imagen o textos
export const updateSingleHomeImage = (key, newImageSrc, extraFields = {}) => {
  const current = getHomeImages();
  const baseItem = current[key] || DEFAULT_HOME_IMAGES[key] || {};

  const updatedItem = {
    ...baseItem,
    ...extraFields,
    ...(newImageSrc !== undefined ? { image: newImageSrc } : {}),
  };

  const updatedAll = {
    ...current,
    [key]: updatedItem,
  };

  saveHomeImages(updatedAll);
  return updatedAll;
};

// Restaurar imágenes de inicio a su estado original
export const resetHomeImages = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_HOME_IMAGES);
    window.dispatchEvent(
      new CustomEvent("home_images_updated", { detail: { images: DEFAULT_HOME_IMAGES } })
    );
    return { ...DEFAULT_HOME_IMAGES };
  } catch (error) {
    console.error("Error resetting home images", error);
    return { ...DEFAULT_HOME_IMAGES };
  }
};

// ========================================================
// LÍNEA VERDE SUPERIOR (BARRA DE ANUNCIOS GLOBAL)
// ========================================================
const STORAGE_KEY_ANNOUNCEMENT = "platino_announcement_text_v1";
const STORAGE_KEY_ANNOUNCEMENT_ACTIVE = "platino_announcement_active_v1";

export const DEFAULT_ANNOUNCEMENT =
  "¡ÚLTIMAS UNIDADES! Elige tu caja de presentación para tu momento especial.";

export const getAnnouncementActive = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENT_ACTIVE);
    if (stored !== null && stored !== undefined) {
      return stored === "true";
    }
    return true; // Activo por defecto
  } catch (error) {
    console.error("Error reading announcement active state", error);
    return true;
  }
};

export const saveAnnouncementActive = (isActive) => {
  try {
    const val = isActive ? "true" : "false";
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENT_ACTIVE, val);
    window.dispatchEvent(
      new CustomEvent("announcement_updated", { detail: { active: isActive } })
    );
    return isActive;
  } catch (error) {
    console.error("Error saving announcement active state", error);
    return isActive;
  }
};

export const getAnnouncementText = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENT);
    if (stored !== null && stored !== undefined) {
      return stored;
    }
    return DEFAULT_ANNOUNCEMENT;
  } catch (error) {
    console.error("Error reading announcement from localStorage", error);
    return DEFAULT_ANNOUNCEMENT;
  }
};

export const saveAnnouncementText = (text) => {
  try {
    const cleanText = text.trim();
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENT, cleanText);
    window.dispatchEvent(
      new CustomEvent("announcement_updated", { detail: { text: cleanText } })
    );
    return cleanText;
  } catch (error) {
    console.error("Error saving announcement to localStorage", error);
    return text;
  }
};

export const resetAnnouncementText = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENT);
    localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENT_ACTIVE);
    window.dispatchEvent(
      new CustomEvent("announcement_updated", { detail: { text: DEFAULT_ANNOUNCEMENT, active: true } })
    );
    return DEFAULT_ANNOUNCEMENT;
  } catch (error) {
    console.error("Error resetting announcement text", error);
    return DEFAULT_ANNOUNCEMENT;
  }
};

