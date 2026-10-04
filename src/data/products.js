import { getAssetUrl } from "../utils/assetHelper";

export const METALS = [
  {
    id: "plata-925",
    name: "Plata 925",
    color: "#e4e7e7",
    border: "#cfd3d3",
    group: "Plata",
  },
  {
    id: "plata-950",
    name: "Plata 950",
    color: "#eff2f2",
    border: "#d8dddd",
    group: "Plata",
  },
  {
    id: "plata-950-oro-natural",
    name: "Plata 950 con Oro 18k Natural",
    color: "linear-gradient(135deg, #eff2f2 50%, #e2be82 50%)",
    border: "#c9ba9b",
    group: "Plata con Oro",
  },
  {
    id: "plata-950-oro-amarillo",
    name: "Plata 950 con Oro 18k Amarillo",
    color: "linear-gradient(135deg, #eff2f2 50%, #f6db8d 50%)",
    border: "#cbb779",
    group: "Plata con Oro",
  },
  {
    id: "plata-950-oro-rosa",
    name: "Plata 950 con Oro 18k Rosa",
    color: "linear-gradient(135deg, #eff2f2 50%, #f7c7b2 50%)",
    border: "#cca897",
    group: "Plata con Oro",
  },
  {
    id: "oro-18k-natural",
    name: "Oro 18k Natural",
    color: "#e2be82",
    border: "#c9a15f",
    group: "Oro 18k",
  },
  {
    id: "oro-18k-amarillo",
    name: "Oro 18k Amarillo",
    color: "#f6db8d",
    border: "#d7b355",
    group: "Oro 18k",
  },
  {
    id: "oro-18k-rosa",
    name: "Oro 18k Rosa",
    color: "#f7c7b2",
    border: "#dca188",
    group: "Oro 18k",
  },
  {
    id: "oro-18k-blanco",
    name: "Oro 18k Blanco",
    color: "#e8eaeb",
    border: "#c2c7c8",
    group: "Oro 18k",
  },
  {
    id: "platino",
    name: "Platino",
    color: "#d9ddde",
    border: "#a8b1b4",
    group: "Platino",
  },
];

export const DEFAULT_METAL_IMAGES = {
  "plata-925": "/images/secret-garden-white.jpg",
  "plata-950": "/images/secret-garden-white.jpg",
  "plata-950-oro-natural": "/images/secret-garden-yellow.jpg",
  "plata-950-oro-amarillo": "/images/secret-garden-yellow.jpg",
  "plata-950-oro-rosa": "/images/secret-garden-rose.jpg",
  "oro-18k-natural": "/images/secret-garden-yellow.jpg",
  "oro-18k-amarillo": "/images/secret-garden-yellow.jpg",
  "oro-18k-rosa": "/images/secret-garden-rose.jpg",
  "oro-18k-blanco": "/images/secret-garden-white.jpg",
  "platino": "/images/secret-garden-white.jpg",
};

import { DAMA_SIZES, VARON_SIZES, ASESOR_SIZE_OPTION } from "../services/inventoryService";

export { DAMA_SIZES, VARON_SIZES, ASESOR_SIZE_OPTION };

export const RING_SIZES = [
  ASESOR_SIZE_OPTION,
  ...DAMA_SIZES.map((d) => ({
    id: d.id,
    label: d.label,
    number: d.number,
    stock: "DISPONIBLE",
    available: true,
  })),
];

export const GEM_SHAPES_PRODUCT = [
  { id: "redondo", name: "Redondo", desc: "El corte clásico por excelencia, diseñado para maximizar el fuego y refracción.", ratio: "1.00", popularCarat: "1.00 ct", icon: "bi bi-circle" },
  { id: "oval", name: "Oval", desc: "Silueta alargada que estiliza la mano con brillo suave y elegante.", ratio: "1.35 - 1.50", popularCarat: "1.25 ct", icon: "bi bi-egg" },
  { id: "esmeralda", name: "Esmeralda", desc: "Corte escalonado de gran claridad con reflejos tipo sala de espejos.", ratio: "1.30 - 1.45", popularCarat: "1.50 ct", icon: "bi bi-app" },
  { id: "marquesa", name: "Marquise", desc: "Silueta regia de puntas afiladas con máxima superficie visual por quilate.", ratio: "1.75 - 2.15", popularCarat: "1.05 ct", icon: "bi bi-suit-diamond" },
  { id: "radiante", name: "Radiant", desc: "Esquinas truncadas con patrón de facetas brillantes de destello vibrante.", ratio: "1.20 - 1.35", popularCarat: "1.20 ct", icon: "bi bi-gem" },
  { id: "pera", name: "Pera", desc: "Lágrima luminosa que fusiona la suavidad del redondo con el corte marquesa.", ratio: "1.50 - 1.70", popularCarat: "1.20 ct", icon: "bi bi-droplet" },
  { id: "cojin", name: "Cojín", desc: "Bordes redondeados de inspiración vintage con facetas profundas y luminosas.", ratio: "1.00 - 1.05", popularCarat: "1.30 ct", icon: "bi bi-square" },
  { id: "princesa", name: "Princess", desc: "Corte cuadrado contemporáneo de líneas puras con destello geométrico.", ratio: "1.00 - 1.03", popularCarat: "1.10 ct", icon: "bi bi-bounding-box" },
];

const RAW_CATEGORY_INFO = {
  "todas": {
    title: "Catálogo Completo de Joyas",
    eyebrow: "Alta Joyería Platino Perú",
    desc: "Explora nuestra selecta colección de aros de boda, sortijas de compromiso en oro de 18 quilates y joyería fina artesanal.",
    banner: "/images/hero-matrimonio.jpg"
  },
  "catalogo": {
    title: "Catálogo Completo de Joyas",
    eyebrow: "Alta Joyería Platino Perú",
    desc: "Explora nuestra selecta colección de aros de boda, sortijas de compromiso en oro de 18 quilates y joyería fina artesanal.",
    banner: "/images/hero-matrimonio.jpg"
  },
  "aros-boda": {
    title: "Aros de Boda y Matrimonio",
    eyebrow: "Símbolo de Amor Eterno",
    desc: "Aros nupciales forjados a mano en oro de 18 quilates y plata ley 950. Diseños serenos y confort ergonómico pensados para acompañarlos toda la vida.",
    banner: "/images/hero-matrimonio.jpg"
  },
  "aros-matrimonio": {
    title: "Aros de Matrimonio",
    eyebrow: "Símbolo de Amor Eterno",
    desc: "Juegos de alianzas para él y para ella con opción de grabado y personalización.",
    banner: "/images/hero-matrimonio.jpg"
  },
  "anillo-compromiso": {
    title: "Anillos de Compromiso",
    eyebrow: "Piezas que Cautivan",
    desc: "Diamantes seleccionados de brillo extraordinario engastados en sortijas atemporales diseñadas con máxima precisión y certificación gemológica.",
    banner: "/images/hero-compromiso.jpg"
  },
  "anillos-compromiso": {
    title: "Anillos de Compromiso",
    eyebrow: "Piezas que Cautivan",
    desc: "Diamantes seleccionados de brillo extraordinario engastados en sortijas atemporales diseñadas con máxima precisión y certificación gemológica.",
    banner: "/images/hero-compromiso.jpg"
  },
  "anillo-promesa": {
    title: "Anillos de Promesa",
    eyebrow: "Una Historia que Comienza",
    desc: "El primer gran paso. Diseños delicados con gemas preciosas que sellan los compromisos más sinceros.",
    banner: "/images/cat-promesa.jpg"
  },
  "anillos-promesa": {
    title: "Anillos de Promesa",
    eyebrow: "Una Historia que Comienza",
    desc: "El primer gran paso. Diseños delicados con gemas preciosas que sellan los compromisos más sinceros.",
    banner: "/images/cat-promesa.jpg"
  },
  "aros-alianzas": {
    title: "Aros de Alianzas",
    eyebrow: "Texturas y Brillo Continuo",
    desc: "Eternity bands y alianzas con pavé de diamantes y zafiros de alta joyería.",
    banner: "/images/cat-alianzas.jpg"
  },
  "alianzas": {
    title: "Alianzas de Amor",
    eyebrow: "Texturas y Brillo Continuo",
    desc: "Eternity bands y alianzas con pavé de diamantes y zafiros de alta joyería.",
    banner: "/images/cat-alianzas.jpg"
  },
  "joyeria": {
    title: "Joyería Fina y Accesorios",
    eyebrow: "Brillo Cotidiano",
    desc: "Collares solitarios, colgantes con cristales de Swarovski, pulseras tennis y piezas maestras en metales nobles.",
    banner: "/images/cat-collares.jpg"
  },
  "accesorios": {
    title: "Accesorios y Joyería",
    eyebrow: "Brillo Cotidiano",
    desc: "Collares solitarios, colgantes con cristales de Swarovski, pulseras tennis y piezas maestras en metales nobles.",
    banner: "/images/cat-collares.jpg"
  },
  "collares": {
    title: "Collares y Dijes",
    eyebrow: "Cerca de tu Corazón",
    desc: "Gargantillas finas, colgantes con gemas naturales y cristales de alta refracción en plata 925 y oro.",
    banner: "/images/cat-collares.jpg"
  },
  "pulseras": {
    title: "Pulseras y Brazaletes",
    eyebrow: "Elegancia en Movimiento",
    desc: "Diseños tennis con circonitas cúbicas y diamantes, trenzados y brazaletes rígidos de porte sofisticado.",
    banner: "/images/cat-pulseras.jpg"
  },
  "regalos": {
    title: "Cajas de Regalo y Presentación",
    eyebrow: "Detalles que Emocionan",
    desc: "Cajas de regalo con acabados en pana verde esmeralda y bolsas de presentación para momentos inolvidables.",
    banner: "/images/box-presentation.jpg"
  }
};

export const CATEGORY_INFO = Object.fromEntries(
  Object.entries(RAW_CATEGORY_INFO).map(([k, v]) => [
    k,
    { ...v, banner: getAssetUrl(v.banner) }
  ])
);

const RAW_PRODUCTS = [
  // 1. COLLAR CRISTAL (Screenshot 1: Accesorios)
  {
    id: "collar-cristal",
    name: "Collar Cristal",
    subtitle: "CADENA + DIJE EN PLATA 925",
    category: "collares",
    categories: ["collares", "joyeria", "accesorios", "regalos"],
    type: "accesorio", // Flujo de 2 Pasos
    price: 190,
    priceFormatted: "S/. 190",
    image: "/images/collar-cristal-blue.jpg",
    gallery: [
      "/images/collar-cristal-blue.jpg",
      "/images/detail-box-green.jpg",
      "/images/box-presentation.jpg"
    ],
    badge: "Cristal Blue Swarovski",
    selectedMetal: "Plata 925",
    availableMetals: [
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
    ],
    description: "Cadena de plata italiana 925 acompañada de un dije facetado en forma de corazón en cristal Swarovski azul zafiro. Un detalle radiante y delicado para regalar o complementar tu estilo.",
    hasPresentationChoice: true,
    presentationOptions: [
      { id: "caja-verde-lujo", name: "Caja de Lujo Esmeralda Platino (Recomendado)", price: 0 },
      { id: "estuche-terciopelo", name: "Estuche de Terciopelo Negro con Cinta Dorada", price: 25 },
      { id: "caja-madera", name: "Caja de Madera Laqueada con Luz LED Nupcial", price: 60 }
    ]
  },

  // 2. ANILLO 9 PROMESAS (Screenshot 2: Anillos de compromiso / 3 pasos)
  {
    id: "anillo-9-promesas",
    name: "Anillo 9 Promesas",
    subtitle: 'Anillo de Compromiso en "Oro Amarillo 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso", "anillo-promesa", "anillos-promesa"],
    type: "anillo", // Flujo de 3 Pasos
    price: 2500,
    priceFormatted: "S/. 2,500",
    image: "/images/anillo-9-promesas.jpg",
    gallery: [
      "/images/anillo-9-promesas.jpg",
      "/images/detail-packaging.jpg",
      "/images/detail-bag.jpg"
    ],
    badge: "Rosa 18k | Diseño: 9 Promesas",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "plata-950", name: "Plata 950", color: "#f2f4f4", border: "#d5dada" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "platino-950", name: "Platino 950", color: "#d9ddde", border: "#b0b6b8" },
    ],
    defaultGemShape: "Redondo",
    description: "Inspirado en la promesa eterna de devoción. Presenta un diamante central de corte brillante acompañado de nueve gemas en los brazos que representan fidelidad, amor y perseverancia.",
    hasGemSelection: true
  },

  // 3. AROS TRIAL (Screenshot 3: Aros de Boda / Alianzas)
  {
    id: "aros-trial",
    name: "Aros Trial",
    subtitle: 'Aros en "Oro Amarillo 18k"',
    category: "aros-boda",
    categories: ["aros-boda", "aros-matrimonio", "aros-alianzas", "alianzas"],
    type: "aros", // Flujo con Talla Dama y Talla Varón
    price: 5700,
    priceFormatted: "S/. 5,700",
    image: "/images/secret-garden-rose.jpg",
    gallery: [
      "/images/secret-garden-rose.jpg",
      "/images/secret-garden-white.jpg",
      "/images/secret-garden-yellow.jpg",
      "/images/detail-box-green.jpg"
    ],
    badge: "Diseño: Cañas Plata Ley 950 / Oro 18k",
    selectedMetal: "Oro Rosa 18k",
    availableMetals: [
      { id: "plata-950", name: "Plata Ley 950", color: "#f2f4f4", border: "#d5dada" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
    ],
    metalImages: {
      "plata-925": "/images/secret-garden-white.jpg",
      "plata-950": "/images/secret-garden-white.jpg",
      "oro-18k-blanco": "/images/secret-garden-white.jpg",
      "platino": "/images/secret-garden-white.jpg",
      "oro-18k-amarillo": "/images/secret-garden-yellow.jpg",
      "oro-18k-natural": "/images/secret-garden-yellow.jpg",
      "oro-18k-rosa": "/images/secret-garden-rose.jpg",
      "plata-950-oro-amarillo": "/images/secret-garden-yellow.jpg",
      "plata-950-oro-rosa": "/images/secret-garden-rose.jpg",
      "plata-950-oro-natural": "/images/secret-garden-yellow.jpg",
    },
    defaultGemShape: "Redondo - Zirconita Incolora 2.0mm",
    description: "Juego de aros nupciales de perfil abovedado con grabado interior artesanal de hojas de laurel y acabado satinado mate. Comodidad ergonómica para uso diario sin fricción.",
    hasGemSelection: true,
    hasDoubleSizes: true // Selector Talla Dama Y Talla Varón
  },

  // 4. ANILLO SOLITARIO SUBLIME (Anillo de Compromiso)
  {
    id: "anillo-solitario-sublime",
    name: "Anillo Solitario Sublime",
    subtitle: 'Solitario Clásico en "Oro Blanco 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    price: 3100,
    priceFormatted: "S/. 3,100",
    image: "/images/style-solitarios.jpg",
    gallery: [
      "/images/style-solitarios.jpg",
      "/images/ring-render.png",
      "/images/detail-packaging.jpg"
    ],
    badge: "Diamante Solitario 0.70ct",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "platino-950", name: "Platino 950", color: "#d9ddde", border: "#b0b6b8" },
    ],
    defaultGemShape: "Redondo",
    description: "El arquetipo de la propuesta perfecta. Un diamante central elevado sobre seis garras en oro blanco de 18k que deja pasar la máxima cantidad de luz.",
    hasGemSelection: true
  },

  // 5. AROS ROMANCE CLÁSICO (Aros de Matrimonio)
  {
    id: "aros-romance-clasico",
    name: "Aros Romance Clásico",
    subtitle: 'Aros Confort en "Oro Amarillo 18k"',
    category: "aros-boda",
    categories: ["aros-boda", "aros-matrimonio"],
    type: "aros",
    price: 4800,
    priceFormatted: "S/. 4,800",
    image: "/images/aros-trial-oro-amarillo.jpg",
    gallery: [
      "/images/aros-trial-oro-amarillo.jpg",
      "/images/aros-trial-oro-blanco.jpg",
      "/images/aros-trial-oro-natural.jpg",
      "/images/aros-trial-bicolor.jpg"
    ],
    metalImages: {
      "oro-amarillo-18k": "/images/aros-trial-oro-amarillo.jpg",
      "oro-blanco-18k": "/images/aros-trial-oro-blanco.jpg",
      "plata-950": "/images/aros-trial-oro-blanco.jpg",
      "oro-18k-amarillo": "/images/aros-trial-oro-amarillo.jpg",
      "oro-18k-blanco": "/images/aros-trial-oro-blanco.jpg",
      "oro-18k-natural": "/images/aros-trial-oro-natural.jpg",
      "plata-925": "/images/aros-trial-oro-blanco.jpg",
    },
    badge: "Par de Aros Tradicionales",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950", name: "Plata Ley 950", color: "#f2f4f4", border: "#d5dada" },
    ],
    description: "Diseño tradicional de media caña con acabado pulido espejo. Grabado de nombres y fecha de matrimonio incluido sin costo adicional.",
    hasGemSelection: false,
    hasDoubleSizes: true
  },

  // 6. ANILLO PROMESA ESMERALDA
  {
    id: "anillo-promesa-esmeralda",
    name: "Anillo Promesa Esmeralda",
    subtitle: 'Gema Natural en "Oro Blanco 18k"',
    category: "anillo-promesa",
    categories: ["anillo-promesa", "anillos-promesa"],
    type: "anillo",
    price: 1850,
    priceFormatted: "S/. 1,850",
    image: "/images/cat-promesa.jpg",
    gallery: [
      "/images/cat-promesa.jpg",
      "/images/detail-box-green.jpg",
      "/images/detail-bag.jpg"
    ],
    badge: "Esmeralda Colombiana 0.50ct",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata 950", color: "#f2f4f4", border: "#d5dada" },
    ],
    defaultGemShape: "Esmeralda",
    description: "Una esmeralda verde profunda flanqueada por dos diamantes corte trillón. Una pieza viva con historia y magnetismo.",
    hasGemSelection: true
  },

  // 7. PULSERA TENNIS DIAMANTES
  {
    id: "pulsera-tennis-diamantes",
    name: "Pulsera Tennis Diamantes",
    subtitle: 'Línea de Brillo en "Oro Blanco 18k"',
    category: "pulseras",
    categories: ["pulseras", "joyeria", "accesorios"],
    type: "accesorio",
    price: 3400,
    priceFormatted: "S/. 3,400",
    image: "/images/cat-pulseras.jpg",
    gallery: [
      "/images/cat-pulseras.jpg",
      "/images/detail-box-green.jpg",
      "/images/box-presentation.jpg"
    ],
    badge: "Cierre de Seguridad Doble",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Una hilera continua de circonitas suizas calidad 5A o diamantes cultivados engastados individualmente en garras de cuatro puntas.",
    hasPresentationChoice: true
  },

  // 8. COLLAR SOLITARIO LÁGRIMA
  {
    id: "collar-solitario-lagrima",
    name: "Gargantilla Lágrima Pera",
    subtitle: 'Solitario en "Oro Amarillo 18k"',
    category: "collares",
    categories: ["collares", "joyeria", "accesorios"],
    type: "accesorio",
    price: 1450,
    priceFormatted: "S/. 1,450",
    image: "/images/cat-collares.jpg",
    gallery: [
      "/images/cat-collares.jpg",
      "/images/collar-cristal-blue.jpg",
      "/images/box-presentation.jpg"
    ],
    badge: "Corte Pera 0.80ct",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Colgante con gema en silueta lágrima pera sobre cadena veneciana de 45cm con argolla de regulación.",
    hasPresentationChoice: true
  },

  // 9. AROS ALIANZA ETERNA
  {
    id: "aros-alianza-eterna",
    name: "Aros Alianza Eterna",
    subtitle: 'Eternity Pavé en "Oro Blanco 18k"',
    category: "aros-alianzas",
    categories: ["aros-alianzas", "alianzas", "aros-boda"],
    type: "aros",
    price: 4900,
    priceFormatted: "S/. 4,900",
    image: "/images/cat-alianzas.jpg",
    gallery: [
      "/images/cat-alianzas.jpg",
      "/images/aros-trial.jpg",
      "/images/detail-packaging.jpg"
    ],
    badge: "Pavé de Diamantes 360°",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
    ],
    defaultGemShape: "Redondo",
    description: "Alianza engastada con micro diamantes en carril que recorren toda la circunferencia del aro femenino, combinada con aro masculino con sutil bisel pulido.",
    hasGemSelection: true,
    hasDoubleSizes: true
  }
];

export const products = RAW_PRODUCTS.map((p) => ({
  ...p,
  image: getAssetUrl(p.image),
  gallery: (p.gallery || []).map((img) => getAssetUrl(img)),
}));

export const formatPrice = (price) => `S/. ${price.toLocaleString("es-PE")}`;

export const FAQS = [
  {
    q: "¿Se puede cambiar el tamaño de este anillo de compromiso?",
    a: "Sí, todos nuestros anillos cuentan con servicio de entallado. En Platino Perú ofrecemos un primer entallado de cortesía para asegurar el ajuste perfecto en tu dedo o el de tu pareja."
  },
  {
    q: "¿Cómo mejora este ajuste solitario inspirado en la naturaleza la piedra central?",
    a: "El diseño eleva sutilmente la gema central para permitir una mayor entrada y refracción de luz desde todos los ángulos, magnificando el fuego, brillo y destello característico de las piezas de alta joyería."
  },
  {
    q: "¿En qué formas y tipos de piedra central se puede colocar este anillo?",
    a: "Nuestros artesanos pueden adaptar la montura a gemas en corte Redondo, Princesa, Esmeralda, Pera, Marquesa, Cojín u Oval, ya sea en diamantes naturales certificados, diamantes cultivados o gemas preciosas como esmeraldas y zafiros."
  },
  {
    q: "¿Qué alianzas de boda combinan bien con este anillo de solitario?",
    a: "Diseñamos nuestras sortijas para que coincidan al ras con bandas lisas tradicionales, aros con textura o alianzas con pavé de diamantes, creando un conjunto nupcial armonioso y ergonómico."
  },
  {
    q: "¿Este anillo de compromiso es lo suficientemente duradero para el uso diario?",
    a: "Absolutamente. Forjamos nuestras joyas en Oro de 18 Quilates y Platino 950, aleaciones nobles con la densidad y tenacidad ideales para acompañarte toda la vida sin perder su estructura ni brillo."
  }
];
