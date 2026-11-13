import { getAssetUrl, toCleanAssetPath } from "../utils/assetHelper";
import { getRemoteData, setRemoteData } from "./remoteData";


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
    image: "/images/anillo-9-promesas.jpg",
    path: "/categoria/anillos-promesa",
  },
  catAlianzas: {
    id: "catAlianzas",
    name: "AROS DE ALIANZAS",
    label: "Categoría: Aros de Alianzas",
    section: "Comprar joyas por categoría",
    image: "/images/aros-trial.jpg",
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
  sectionNewModels: {
    id: "sectionNewModels",
    isSectionHeader: true,
    label: "Encabezado de Sección: Nuevos Modelos",
    section: "Nuevos modelos",
    title: "Reciente en Platino Perú",
    subtitle: "Descubre nuestras últimas incorporaciones.",
  },
  jewelryMenuWatches: {
    id: "jewelryMenuWatches",
    label: "Visibilidad de Relojes en el menú Para Él",
    section: "Menú de Joyas",
    active: false,
  },
  newModel1: { id: "newModel1", label: "Nuevo modelo 1", section: "Nuevos modelos", image: "", name: "", productId: "", path: "" },
  newModel2: { id: "newModel2", label: "Nuevo modelo 2", section: "Nuevos modelos", image: "", name: "", productId: "", path: "" },
  newModel3: { id: "newModel3", label: "Nuevo modelo 3", section: "Nuevos modelos", image: "", name: "", productId: "", path: "" },
  newModel4: { id: "newModel4", label: "Nuevo modelo 4", section: "Nuevos modelos", image: "", name: "", productId: "", path: "" },
  newModel5: { id: "newModel5", label: "Nuevo modelo 5", section: "Nuevos modelos", image: "", name: "", productId: "", path: "" },
  newModel6: { id: "newModel6", label: "Nuevo modelo 6", section: "Nuevos modelos", image: "", name: "", productId: "", path: "" },
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

  // 6. MEGAMENÚS DE NAVEGACIÓN (Aros de Boda y Amor y Promesa)
  megamenuPortaAros: {
    id: "megamenuPortaAros",
    label: "Aros de Boda > Porta Aros",
    section: "Megamenú: Aros de Boda & Amor y Promesa",
    menuGroup: "boda",
    menuName: "AROS DE BODA",
    slotName: "PORTA AROS",
    colNumber: 3,
    description: "Tarjeta de imagen de la 3ra columna en el megamenú desplegable de AROS DE BODA.",
    image: "/images/cat-boda.jpg",
    link: "/categoria/regalos?tipo=porta-aros",
  },
  megamenuCopas: {
    id: "megamenuCopas",
    label: "Aros de Boda > Copas Decoradas",
    section: "Megamenú: Aros de Boda & Amor y Promesa",
    menuGroup: "boda",
    menuName: "AROS DE BODA",
    slotName: "COPAS DECORADAS",
    colNumber: 4,
    description: "Tarjeta de imagen de la 4ta columna en el megamenú desplegable de AROS DE BODA.",
    image: "/images/cat-boda.jpg",
    link: "/categoria/regalos?tipo=copas-decoradas",
  },
  megamenuCuadros: {
    id: "megamenuCuadros",
    label: "Aros de Boda > Cuadros",
    section: "Megamenú: Aros de Boda & Amor y Promesa",
    menuGroup: "boda",
    menuName: "AROS DE BODA",
    slotName: "CUADROS",
    colNumber: 5,
    description: "Tarjeta de imagen de la 5ta columna en el megamenú desplegable de AROS DE BODA.",
    image: "/images/cat-boda.jpg",
    link: "/categoria/regalos?tipo=cuadros",
  },
  megamenuPromesaAnillo: {
    id: "megamenuPromesaAnillo",
    label: "Amor y Promesa > Anillo de Promesa",
    section: "Megamenú: Aros de Boda & Amor y Promesa",
    menuGroup: "promesa",
    menuName: "AMOR Y PROMESA",
    slotName: "ANILLO DE PROMESA",
    colNumber: 1,
    description: "Tarjeta de imagen de la 1ra columna en el megamenú desplegable de AMOR Y PROMESA.",
    image: "/images/anillo-9-promesas.jpg",
    link: "/categoria/amor-promesa?subcat=anillo-promesa",
  },
  megamenuAlianzasAros: {
    id: "megamenuAlianzasAros",
    label: "Amor y Promesa > Aros de Alianzas",
    section: "Megamenú: Aros de Boda & Amor y Promesa",
    menuGroup: "promesa",
    menuName: "AMOR Y PROMESA",
    slotName: "AROS DE ALIANZAS",
    colNumber: 4,
    description: "Tarjeta de imagen de la 4ta columna en el megamenú desplegable de AMOR Y PROMESA.",
    image: "/images/aros-trial.jpg",
    link: "/categoria/amor-promesa?subcat=aros-alianzas",
  },
};

// Obtener la configuración actual de imágenes del Inicio
export const getHomeImages = () => {
  const data = { ...DEFAULT_HOME_IMAGES, ...getRemoteData("home_images", DEFAULT_HOME_IMAGES) };

  // Evitar que queden marcadores de posición antiguos tipo "COLOCAR IMAGEN"
  if (data.megamenuPromesaAnillo?.image && data.megamenuPromesaAnillo.image.includes("cat-promesa.jpg")) {
    data.megamenuPromesaAnillo.image = "/images/anillo-9-promesas.jpg";
  }
  if (data.megamenuAlianzasAros?.image && data.megamenuAlianzasAros.image.includes("cat-alianzas.jpg")) {
    data.megamenuAlianzasAros.image = "/images/aros-trial.jpg";
  }
  if (data.catPromesa?.image && data.catPromesa.image.includes("cat-promesa.jpg")) {
    data.catPromesa.image = "/images/anillo-9-promesas.jpg";
  }
  if (data.catAlianzas?.image && data.catAlianzas.image.includes("cat-alianzas.jpg")) {
    data.catAlianzas.image = "/images/aros-trial.jpg";
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

// Guardar y notificar cambios (guardando siempre rutas relativas limpias para que no dependan del host)
export const saveHomeImages = (data) => {
  const toStore = {};
  for (const [key, item] of Object.entries(data)) {
    toStore[key] = {
      ...item,
      image: item?.image ? toCleanAssetPath(item.image) : item?.image,
    };
  }
  setRemoteData("home_images", toStore, "home_images_updated", { images: data });
};

export const HOME_SECTIONS = [
  { id: "all", name: "Todas las Secciones", section: "todas", icon: "bi-grid-fill" },
  { id: "megamenus", name: "★ Megamenús (Aros de Boda & Amor y Promesa)", section: "Megamenú: Aros de Boda & Amor y Promesa", icon: "bi-menu-app-fill" },
  { id: "jewelry_menu", name: "Menú de Joyas", section: "Menú de Joyas", icon: "bi-gem" },
  { id: "hero", name: "1. Banners Hero", section: "Banners Principales (Hero)", icon: "bi-star-fill" },
  { id: "rings", name: "2. Anillos Dinos de Obsesión", section: "Anillos dignos de obsesión", icon: "bi-gem" },
  { id: "new_models", name: "3. Nuevos Modelos", section: "Nuevos modelos", icon: "bi-stars" },
  { id: "fall_classics", name: "4. The Fall Edit & The New Classics (7 Fotos)", section: "The Fall Edit & The New Classics", icon: "bi-images" },
  { id: "sedes", name: "5. Showroom & Sedes (1 o 2 Fotos)", section: "Nuestras Sedes & Showroom", icon: "bi-geo-alt-fill" },
  { id: "categories", name: "6. Categorías de Joyas", section: "Comprar joyas por categoría", icon: "bi-tags-fill" },
  { id: "gems", name: "7. Selector de Gemas", section: "Selector de Gemas / Corte", icon: "bi-diamond-fill" },
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
  saveHomeImages(DEFAULT_HOME_IMAGES);
  return { ...DEFAULT_HOME_IMAGES };
};

// ========================================================
// LÍNEA VERDE SUPERIOR (BARRA DE ANUNCIOS GLOBAL)
// ========================================================
export const DEFAULT_ANNOUNCEMENT =
  "¡ÚLTIMAS UNIDADES! Elige tu caja de presentación para tu momento especial.";

export const getAnnouncementActive = () => {
  return getRemoteData("announcement_active", true);
};

export const saveAnnouncementActive = (isActive) => {
  setRemoteData("announcement_active", Boolean(isActive), "announcement_updated", { active: Boolean(isActive) });
  return Boolean(isActive);
};

export const getAnnouncementText = () => {
  return getRemoteData("announcement", DEFAULT_ANNOUNCEMENT);
};

export const saveAnnouncementText = (text) => {
  const cleanText = text.trim();
  setRemoteData("announcement", cleanText, "announcement_updated", { text: cleanText });
  return cleanText;
};

export const resetAnnouncementText = () => {
  saveAnnouncementText(DEFAULT_ANNOUNCEMENT);
  saveAnnouncementActive(true);
  return DEFAULT_ANNOUNCEMENT;
};
