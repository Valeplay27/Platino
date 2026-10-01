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

  // 2. Secciones Editoriales
  editorialFall: {
    id: "editorialFall",
    label: "Editorial: The Fall Edit",
    section: "Secciones Editoriales",
    description: "Foto editorial principal de la sección de temporada.",
    image: "/images/editorial-fall.jpg",
    title: "The Fall Edit",
    subtitle: "Some designs never go out of style. Discover new classics for the season ahead.",
    link: "/categoria/joyeria",
  },
  showroom: {
    id: "showroom",
    label: "Boutique & Showroom",
    section: "Secciones Editoriales",
    description: "Fotografía del showroom y asesoría presencial de Platino Perú.",
    image: "/images/showroom.jpg",
  },
  ringRender: {
    id: "ringRender",
    label: "Render Selector de Gemas",
    section: "Secciones Editoriales",
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

  // 4. Anillos dignos de obsesión (Estilos)
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

  // 5. Mosaico The New Classics
  mosaic1: {
    id: "mosaic1",
    label: "Mosaico Foto 1",
    section: "Mosaico 'The New Classics'",
    image: "/images/mosaic-1.jpg",
    alt: "Diamond Tennis Necklace",
  },
  mosaic2: {
    id: "mosaic2",
    label: "Mosaico Foto 2",
    section: "Mosaico 'The New Classics'",
    image: "/images/mosaic-2.jpg",
    alt: "Emerald Solitaire Pendant",
  },
  mosaic3: {
    id: "mosaic3",
    label: "Mosaico Foto 3",
    section: "Mosaico 'The New Classics'",
    image: "/images/mosaic-3.jpg",
    alt: "Sapphire & Diamond Band",
  },
  mosaic4: {
    id: "mosaic4",
    label: "Mosaico Foto 4",
    section: "Mosaico 'The New Classics'",
    image: "/images/mosaic-4.jpg",
    alt: "Cocktail Gemstone Rings",
  },
  mosaic5: {
    id: "mosaic5",
    label: "Mosaico Foto 5",
    section: "Mosaico 'The New Classics'",
    image: "/images/mosaic-5.jpg",
    alt: "Ruby Eternity Band",
  },
  mosaic6: {
    id: "mosaic6",
    label: "Mosaico Foto 6",
    section: "Mosaico 'The New Classics'",
    image: "/images/mosaic-6.jpg",
    alt: "Bridal Diamond Collection",
  },
};

// Obtener la configuración actual de imágenes del Inicio
export const getHomeImages = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HOME_IMAGES);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Combinar con los valores por defecto en caso de llaves nuevas
      return { ...DEFAULT_HOME_IMAGES, ...parsed };
    }
    return { ...DEFAULT_HOME_IMAGES };
  } catch (error) {
    console.error("Error loading home images from localStorage", error);
    return { ...DEFAULT_HOME_IMAGES };
  }
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

// Actualizar una sola imagen
export const updateSingleHomeImage = (key, newImageSrc, extraFields = {}) => {
  const current = getHomeImages();
  if (!current[key]) return current;

  const updatedItem = {
    ...current[key],
    ...extraFields,
    image: newImageSrc,
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

export const DEFAULT_ANNOUNCEMENT =
  "¡ÚLTIMAS UNIDADES! Elige tu caja de presentación para tu momento especial.";

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
    window.dispatchEvent(
      new CustomEvent("announcement_updated", { detail: { text: DEFAULT_ANNOUNCEMENT } })
    );
    return DEFAULT_ANNOUNCEMENT;
  } catch (error) {
    console.error("Error resetting announcement text", error);
    return DEFAULT_ANNOUNCEMENT;
  }
};

