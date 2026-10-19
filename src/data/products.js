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

export const MASTER_GEM_SHAPES = [
  {
    id: "oval",
    name: "Oval",
    image: getAssetUrl("/images/gem-shapes/oval.webp"),
    carat: "1.25 ct",
    popularCarat: "1.25 ct",
    subtitle: "Diamante Fino Platino (Corte Brillante Certificado)",
    desc: "Silueta alargada que estiliza la mano con brillo suave y elegante.",
    ratio: "1.35 - 1.50",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-egg",
  },
  {
    id: "redondo",
    name: "Redondo",
    image: getAssetUrl("/images/gem-shapes/redondo.webp"),
    carat: "1.00 ct",
    popularCarat: "1.00 ct",
    subtitle: "Diamante Fino Platino (Corte Brillante Certificado)",
    desc: "El corte clásico por excelencia, diseñado para maximizar el fuego y refracción.",
    ratio: "1.00",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-circle",
  },
  {
    id: "esmeralda",
    name: "Esmeralda",
    image: getAssetUrl("/images/gem-shapes/esmeralda.webp"),
    carat: "1.50 ct",
    popularCarat: "1.50 ct",
    subtitle: "Diamante Fino Platino (Corte Escalonado Certificado)",
    desc: "Corte escalonado de gran claridad con reflejos tipo sala de espejos.",
    ratio: "1.30 - 1.45",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-app",
  },
  {
    id: "marquesa",
    name: "Marquise",
    image: getAssetUrl("/images/gem-shapes/marquesa.webp"),
    carat: "1.05 ct",
    popularCarat: "1.05 ct",
    subtitle: "Diamante Fino Platino (Corte Brillante Modificado)",
    desc: "Silueta regia de puntas afiladas con máxima superficie visual por quilate.",
    ratio: "1.75 - 2.15",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-suit-diamond",
  },
  {
    id: "radiante",
    name: "Radiant",
    image: getAssetUrl("/images/gem-shapes/radiante.webp"),
    carat: "1.20 ct",
    popularCarat: "1.20 ct",
    subtitle: "Diamante Fino Platino (Corte Brillante Híbrido)",
    desc: "Esquinas truncadas con patrón de facetas brillantes de destello vibrante.",
    ratio: "1.20 - 1.35",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-gem",
  },
  {
    id: "pera",
    name: "Pera",
    image: getAssetUrl("/images/gem-shapes/pera.webp"),
    carat: "1.20 ct",
    popularCarat: "1.20 ct",
    subtitle: "Diamante Fino Platino (Corte Lágrima Brillante)",
    desc: "Lágrima luminosa que fusiona la suavidad del redondo con el corte marquesa.",
    ratio: "1.50 - 1.70",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-droplet",
  },
  {
    id: "cojin-alargado",
    name: "Cojín Alargado",
    image: getAssetUrl("/images/gem-shapes/cojin-alargado.webp"),
    carat: "1.40 ct",
    popularCarat: "1.40 ct",
    subtitle: "Diamante Fino Platino (Cushion Modificado)",
    desc: "Elegante variante alargada que combina la suavidad del cojín con la presencia del corte esmeralda.",
    ratio: "1.15 - 1.30",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-square",
  },
  {
    id: "cojin",
    name: "Cojín",
    image: getAssetUrl("/images/gem-shapes/cojin.webp"),
    carat: "1.30 ct",
    popularCarat: "1.30 ct",
    subtitle: "Diamante Fino Platino (Corte Cojín Clásico)",
    desc: "Bordes redondeados de inspiración vintage con facetas profundas y luminosas.",
    ratio: "1.00 - 1.05",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-square",
  },
  {
    id: "princesa",
    name: "Princess",
    image: getAssetUrl("/images/gem-shapes/princesa.webp"),
    carat: "1.10 ct",
    popularCarat: "1.10 ct",
    subtitle: "Diamante Fino Platino (Corte Cuadrado Brillante)",
    desc: "Corte cuadrado contemporáneo de líneas puras con destello geométrico.",
    ratio: "1.00 - 1.03",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-bounding-box",
  },
  {
    id: "asscher",
    name: "Asscher",
    image: getAssetUrl("/images/gem-shapes/asscher.webp"),
    carat: "1.20 ct",
    popularCarat: "1.20 ct",
    subtitle: "Diamante Fino Platino (Corte Art Déco Octogonal)",
    desc: "Corte escalonado octogonal art déco con hipnótico efecto molino de viento.",
    ratio: "1.00",
    extraNote: "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida.",
    icon: "bi bi-app",
  },
];

export const GEM_SHAPES_PRODUCT = MASTER_GEM_SHAPES;

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
  "amor-promesa": {
    title: "Amor y Promesa",
    eyebrow: "Símbolos de Fidelidad y Devoción",
    desc: "Nuestra exclusiva selección que une anillos de promesa y aros de alianzas finas. Joyas que conmemoran la lealtad, los aniversarios y el amor incondicional.",
    banner: "/images/cat-promesa.jpg"
  },
  "amor-y-promesa": {
    title: "Amor y Promesa",
    eyebrow: "Símbolos de Fidelidad y Devoción",
    desc: "Nuestra exclusiva selección que une anillos de promesa y aros de alianzas finas. Joyas que conmemoran la lealtad, los aniversarios y el amor incondicional.",
    banner: "/images/cat-promesa.jpg"
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
    style: "con-pave",
    gem: "diamante",
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
    categories: ["aros-boda", "aros-matrimonio", "aros-alianzas", "alianzas", "aros"],
    type: "aros", // Flujo con Talla Dama y Talla Varón
    style: "clasicos",
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
    style: "solitario",
    gem: "diamante",
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
      { id: "oro-18k-natural", name: "Oro 18k Natural", color: "#e2be82", border: "#c9a15f" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
      { id: "platino-950", name: "Platino 950", color: "#d9ddde", border: "#b0b6b8" },
    ],
    defaultGemShape: "Redondo",
    availableGemShapes: ["redondo", "oval", "esmeralda", "marquesa", "corazon", "princesa"],
    description: "El arquetipo de la propuesta perfecta. Un diamante central elevado sobre seis garras en oro blanco de 18k que deja pasar la máxima cantidad de luz.",
    hasGemSelection: true
  },

  // 4.1. ANILLO TRILOGÍA TRES PIEDRAS (Estilo 3 Piedras)
  {
    id: "anillo-trilogia-tres-piedras",
    name: "Anillo Trilogía Tres Piedras",
    subtitle: '3 Diamantes en "Oro Blanco 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "3-piedras",
    gem: "diamante",
    price: 3850,
    priceFormatted: "S/. 3,850",
    image: "/images/style-tres-piedras.jpg",
    gallery: [
      "/images/style-tres-piedras.jpg",
      "/images/detail-packaging.jpg",
      "/images/detail-bag.jpg"
    ],
    badge: "Trilogía de Amor Eterno",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Redondo",
    availableGemShapes: ["redondo", "oval", "esmeralda"],
    description: "Tres gemas que simbolizan el pasado, el presente y el futuro de una unión inquebrantable. Diamante central de 0.60ct flanqueado por gemas laterales de 0.25ct.",
    hasGemSelection: true
  },

  // 4.2. ANILLO VINTAGE HERITAGE (Estilo Vintage)
  {
    id: "anillo-vintage-heritage",
    name: "Anillo Vintage Heritage Art Déco",
    subtitle: 'Detalle de Orla en "Oro Rosa 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "vintage",
    gem: "diamante",
    price: 3450,
    priceFormatted: "S/. 3,450",
    image: "/images/style-vintage.jpg",
    gallery: [
      "/images/style-vintage.jpg",
      "/images/secret-garden-rose.jpg",
      "/images/detail-box-green.jpg"
    ],
    badge: "Colección Vintage Heritage",
    selectedMetal: "Oro Rosa 18k",
    availableMetals: [
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Marquesa",
    availableGemShapes: ["marquesa", "oval", "redondo", "esmeralda"],
    description: "Inspiración de época con filigrana artesanal y micro engastes milgrain que rinden homenaje a la orfebrería europea de principios de siglo.",
    hasGemSelection: true
  },

  // 4.3. ANILLO MODERNO BISEL SUBLIME (Estilo Moderno)
  {
    id: "anillo-moderno-bisel",
    name: "Anillo Moderno Bisel Sublime",
    subtitle: 'Engaste Contemporáneo en "Oro Natural 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "moderno",
    gem: "diamante",
    price: 2950,
    priceFormatted: "S/. 2,950",
    image: "/images/style-bisel.jpg",
    gallery: [
      "/images/style-bisel.jpg",
      "/images/detail-packaging.jpg"
    ],
    badge: "Diseño Contemporáneo",
    selectedMetal: "Oro 18k Natural",
    availableMetals: [
      { id: "oro-18k-natural", name: "Oro 18k Natural", color: "#e2be82", border: "#c9a15f" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Oval",
    availableGemShapes: ["oval", "redondo", "radiante", "esmeralda"],
    description: "Líneas fluidas y arquitectura minimalista donde el bisel protege suavemente la gema central permitiendo un uso dinámico y seguro de por vida.",
    hasGemSelection: true
  },

  // 4.4. ANILLO COMPROMISO ESMERALDA IMPERIAL (Con Gemas / Esmeralda)
  {
    id: "anillo-compromiso-esmeralda-real",
    name: "Anillo Esmeralda Imperial Colombiana",
    subtitle: 'Corte Esmeralda en "Oro Amarillo 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "con-gemas",
    gem: "esmeralda",
    price: 3600,
    priceFormatted: "S/. 3,600",
    image: "/images/mosaic-3.jpg",
    gallery: [
      "/images/mosaic-3.jpg",
      "/images/cat-promesa.jpg",
      "/images/detail-box-green.jpg"
    ],
    badge: "Esmeralda Colombiana 1.20ct",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-18k-natural", name: "Oro 18k Natural", color: "#e2be82", border: "#c9a15f" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Esmeralda",
    availableGemShapes: ["esmeralda", "oval", "redondo"],
    description: "Esmeralda natural de intenso verde botánico con halo de diamantes talla brillante en engaste pavé, celebrando la nobleza y la prosperidad.",
    hasGemSelection: true
  },

  // 4.5. ANILLO COMPROMISO RUBÍ PASIÓN (Con Gemas / Rubí)
  {
    id: "anillo-compromiso-rubi-pasion",
    name: "Anillo Solitario Rubí Pasión",
    subtitle: 'Rubí Carmesí en "Oro Rosa 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "con-gemas",
    gem: "rubi",
    price: 3750,
    priceFormatted: "S/. 3,750",
    image: "/images/secret-garden-rose.jpg",
    gallery: [
      "/images/secret-garden-rose.jpg",
      "/images/detail-packaging.jpg"
    ],
    badge: "Rubí Natural 0.90ct",
    selectedMetal: "Oro Rosa 18k",
    availableMetals: [
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Oval",
    availableGemShapes: ["oval", "redondo", "corazon"],
    description: "Un fuego interior incomparable. Rubí natural rojo carmesí de gran saturación engastado sobre un brazo floral de oro rosa con diamantes engastados.",
    hasGemSelection: true
  },

  // 4.6. ANILLO COMPROMISO ZAFIRO ROYAL (Con Gemas / Zafiro)
  {
    id: "anillo-compromiso-zafiro-royal",
    name: "Anillo Zafiro Royal Célebre",
    subtitle: 'Zafiro Azul Real en "Oro Blanco 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "con-gemas",
    gem: "zafiro",
    price: 3900,
    priceFormatted: "S/. 3,900",
    image: "/images/mosaic-4.jpg",
    gallery: [
      "/images/mosaic-4.jpg",
      "/images/collar-cristal-blue.jpg",
      "/images/detail-box-green.jpg"
    ],
    badge: "Zafiro Azul Real 1.10ct",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Princesa",
    availableGemShapes: ["princesa", "redondo", "oval", "esmeralda"],
    description: "Homenaje a las coronas reales. Zafiro azul noche de profunda claridad y facetas vivas, flanqueado por diamantes en corte cometa.",
    hasGemSelection: true
  },

  // 4.7. ANILLO DIAMANTE CORTE CORAZÓN (Forma Corazón)
  {
    id: "anillo-corazon-amor-eterno",
    name: "Anillo Diamante Corte Corazón",
    subtitle: 'Silueta Corazón en "Oro Rosa 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "solitario",
    gem: "diamante",
    price: 3250,
    priceFormatted: "S/. 3,250",
    image: "/images/cat-compromiso.jpg",
    gallery: [
      "/images/cat-compromiso.jpg",
      "/images/detail-packaging.jpg"
    ],
    badge: "Corte Corazón 0.85ct",
    selectedMetal: "Oro Rosa 18k",
    availableMetals: [
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Corazón",
    availableGemShapes: ["corazon", "redondo"],
    description: "La encarnación del romance romántico puro. Un diamante tallado en silueta de corazón elevado con cinco garras de precisión y luz cautivadora.",
    hasGemSelection: true
  },

  // 4.8. ANILLO MARQUESA REALEZA (Forma Marquesa)
  {
    id: "anillo-marquesa-realeza",
    name: "Anillo Corte Marquesa Realeza",
    subtitle: 'Silueta Navette en "Plata 950 con Oro 18k"',
    category: "anillo-compromiso",
    categories: ["anillo-compromiso", "anillos-compromiso"],
    type: "anillo",
    style: "solitario",
    gem: "diamante",
    price: 2750,
    priceFormatted: "S/. 2,750",
    image: "/images/hero-compromiso.jpg",
    gallery: [
      "/images/hero-compromiso.jpg",
      "/images/detail-packaging.jpg"
    ],
    badge: "Corte Marquesa 1.00ct",
    selectedMetal: "Plata 950 con Oro 18k Amarillo",
    availableMetals: [
      { id: "plata-950-oro-amarillo", name: "Plata 950 con Oro 18k Amarillo", color: "linear-gradient(135deg, #eff2f2 50%, #f6db8d 50%)", border: "#cbb779" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
    ],
    defaultGemShape: "Marquesa",
    availableGemShapes: ["marquesa", "oval"],
    description: "Silueta navette alargada inspirada en la corte francesa que estiliza los dedos con máxima superficie visual por quilate y elegancia atemporal.",
    hasGemSelection: true
  },

  // 5. AROS ROMANCE CLÁSICO (Aros de Matrimonio)
  {
    id: "aros-romance-clasico",
    name: "Aros Romance Clásico",
    subtitle: 'Aros Confort en "Oro Amarillo 18k"',
    category: "aros-boda",
    categories: ["aros-boda", "aros-matrimonio", "aros-alianzas", "alianzas", "aros"],
    type: "aros",
    style: "clasicos",
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
    categories: ["anillo-promesa", "anillos-promesa", "amor-promesa"],
    type: "anillo",
    style: "gemas-naturales",
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
  },

  // 10. AROS DE BODA CON PEDRERÍA
  {
    id: "aros-boda-pedreria-lux",
    name: "Aros de Boda Pavé Lux",
    subtitle: 'Micro Pavé Diamantado en "Oro Blanco 18k"',
    category: "aros-boda",
    categories: ["aros-boda", "aros-matrimonio", "aros"],
    type: "aros",
    style: "con-pedreria",
    price: 5200,
    priceFormatted: "S/. 5,200",
    image: "/images/cat-alianzas.jpg",
    gallery: ["/images/cat-alianzas.jpg", "/images/aros-trial.jpg"],
    badge: "Pavé de Circonitas Suizas 5A",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Aros nupciales donde la pieza femenina resplandece con delicada pedrería engastada a mano y la pieza masculina luce un diseño confort pulido a espejo.",
    hasDoubleSizes: true
  },

  // 11. AROS DE BODA CON TEXTURA
  {
    id: "aros-boda-textura-laurel",
    name: "Aros de Boda Textura Laurel & Diamantado",
    subtitle: 'Acabado Satinado Mate en "Oro Amarillo 18k"',
    category: "aros-boda",
    categories: ["aros-boda", "aros-matrimonio", "aros"],
    type: "aros",
    style: "con-textura",
    price: 4950,
    priceFormatted: "S/. 4,950",
    image: "/images/aros-trial-oro-amarillo.jpg",
    gallery: ["/images/aros-trial-oro-amarillo.jpg", "/images/secret-garden-yellow.jpg"],
    badge: "Textura Diamantada Artesanal",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-18k-natural", name: "Oro 18k Natural", color: "#e2be82", border: "#c9a15f" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Textura orgánica martillada suave y grabado artesanal de hojas de laurel, con borde biselado brillante para un contraste visual único.",
    hasDoubleSizes: true
  },

  // 12. AROS DE BODA MODERNOS
  {
    id: "aros-boda-moderno-dual",
    name: "Aros de Boda Moderno Bicolor",
    subtitle: 'Diseño Geométrico en "Oro Blanco y Amarillo 18k"',
    category: "aros-boda",
    categories: ["aros-boda", "aros-matrimonio", "aros"],
    type: "aros",
    style: "moderno",
    price: 5400,
    priceFormatted: "S/. 5,400",
    image: "/images/aros-trial-bicolor.jpg",
    gallery: ["/images/aros-trial-bicolor.jpg", "/images/secret-garden-white.jpg"],
    badge: "Diseño Contemporáneo Bicolor",
    selectedMetal: "Oro 18k Bicolor",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950-oro-amarillo", name: "Plata 950 con Oro 18k", color: "linear-gradient(135deg, #eff2f2 50%, #f6db8d 50%)", border: "#cbb779" },
    ],
    description: "Perfil plano con ranura central en bajo relieve que divide dos tonalidades nobles. Vanguardia ergonómica de uso cotidiano.",
    hasDoubleSizes: true
  },

  // 13. AROS DE BODA VINTAGE
  {
    id: "aros-boda-vintage-milgrain",
    name: "Aros de Boda Vintage Milgrain",
    subtitle: 'Borde Perlado en "Oro Rosa 18k"',
    category: "aros-boda",
    categories: ["aros-boda", "aros-matrimonio", "aros"],
    type: "aros",
    style: "vintage",
    price: 5100,
    priceFormatted: "S/. 5,100",
    image: "/images/secret-garden-rose.jpg",
    gallery: ["/images/secret-garden-rose.jpg", "/images/detail-packaging.jpg"],
    badge: "Orfebrería Milgrain Vintage",
    selectedMetal: "Oro Rosa 18k",
    availableMetals: [
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Detalle perimetral con microesferas milgrain inspiradas en la joyería de principios del siglo XX, evocando un romance nostálgico.",
    hasDoubleSizes: true
  },

  // 14. PORTA AROS (Accesorios / Regalos)
  {
    id: "porta-aros-cristal-lujo",
    name: "Alhajero Porta Aros de Cristal y Terciopelo",
    subtitle: "Accesorio Nupcial para Ceremonia",
    category: "regalos",
    categories: ["regalos", "accesorios"],
    type: "porta-aros",
    price: 180,
    priceFormatted: "S/. 180",
    image: "/images/box-presentation.jpg",
    gallery: ["/images/box-presentation.jpg", "/images/detail-box-green.jpg"],
    badge: "Cristal Biselado & Terciopelo Esmeralda",
    selectedMetal: "Latón Enchapado en Oro",
    availableMetals: [{ id: "oro-natural", name: "Enchapado Dorado", color: "#d7b355", border: "#b8933b" }],
    description: "Cofre geométrico de cristal con bordes metálicos dorados y almohadilla de terciopelo esmeralda para presentar los aros en el altar.",
    hasPresentationChoice: false
  },

  // 15. COPAS DECORADAS (Accesorios / Regalos)
  {
    id: "copas-decoradas-nupciales",
    name: "Juego de Copas Nupciales Cristal y Plata",
    subtitle: "Set de Brindis para Novios",
    category: "regalos",
    categories: ["regalos", "accesorios"],
    type: "copas-decoradas",
    price: 240,
    priceFormatted: "S/. 240",
    image: "/images/detail-packaging.jpg",
    gallery: ["/images/detail-packaging.jpg"],
    badge: "Cristal Bohemio & Aplique Plata 950",
    selectedMetal: "Plata 950",
    availableMetals: [{ id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" }],
    description: "Par de copas de cristal europeo para el brindis de boda con delicado monograma y apliques florales forjados en plata peruana.",
    hasPresentationChoice: false
  },

  // 16. CUADROS (Accesorios / Regalos)
  {
    id: "cuadros-conmemorativos-boda",
    name: "Cuadro Conmemorativo Matrimonial Personalizado",
    subtitle: "Recuerdo Artesanal con Votos y Fecha",
    category: "regalos",
    categories: ["regalos", "accesorios"],
    type: "cuadros",
    price: 290,
    priceFormatted: "S/. 290",
    image: "/images/detail-box-green.jpg",
    gallery: ["/images/detail-box-green.jpg"],
    badge: "Personalizado con Caligrafía Dorada",
    selectedMetal: "Madera y Pan de Oro",
    availableMetals: [{ id: "pan-oro", name: "Pan de Oro 18k", color: "#f6db8d", border: "#d7b355" }],
    description: "Cuadro enmarcado con fondo aterciopelado y lámina en pan de oro con nombres grabados y la fecha especial del compromiso o boda.",
    hasPresentationChoice: false
  },

  // 17. JOYERÍA: ARETES PARA BEBÉ (Kids)
  {
    id: "aretes-bebes-bolita-oro",
    name: "Aretes Abridores Bolita Oro 18k",
    subtitle: 'Seguridad Especial en "Oro Amarillo 18k"',
    category: "aretes",
    categories: ["aretes", "joyeria", "kids"],
    type: "aretes-bebes",
    gender: "kids",
    price: 380,
    priceFormatted: "S/. 380",
    image: "/images/cat-pulseras.jpg",
    gallery: ["/images/cat-pulseras.jpg"],
    badge: "Punta Abridora Hipoalergénica",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
    ],
    description: "Aretes clásicos con tuerca a rosca redondeada que no incomoda el descanso. Forjados en oro de 18 quilates 100% libre de níquel.",
    hasPresentationChoice: true
  },

  // 18. JOYERÍA: ARETES PEGADOS
  {
    id: "aretes-pegados-solitarios",
    name: "Aretes Pegados Solitarios de Diamante",
    subtitle: 'Brillo Clásico en "Oro Blanco 18k"',
    category: "aretes",
    categories: ["aretes", "joyeria"],
    type: "aretes-pegados",
    gender: "mujer",
    price: 850,
    priceFormatted: "S/. 850",
    image: "/images/mosaic-6.jpg",
    gallery: ["/images/mosaic-6.jpg"],
    badge: "Corte Brillante 0.40ct Total",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Par de dormilonas de cuatro puntas con ajuste mariposa reforzado. La joya esencial para iluminar el rostro a diario.",
    hasPresentationChoice: true
  },

  // 19. JOYERÍA: ARETES COLGANTES
  {
    id: "aretes-colgantes-cascada",
    name: "Aretes Colgantes Cascada de Zafiros",
    subtitle: 'Diseño de Gala en "Oro Blanco 18k"',
    category: "aretes",
    categories: ["aretes", "joyeria"],
    type: "aretes-colgantes",
    gender: "mujer",
    price: 1450,
    priceFormatted: "S/. 1,450",
    image: "/images/collar-cristal-blue.jpg",
    gallery: ["/images/collar-cristal-blue.jpg"],
    badge: "Zafiros Azules & Diamantes",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Aretes largos articulados que acompañan el movimiento con caída ligera y destellos profundos color azul noche.",
    hasPresentationChoice: true
  },

  // 20. JOYERÍA: RELICARIO
  {
    id: "relicario-corazon-oro",
    name: "Relicario Guardapelo Corazón en Oro 18k",
    subtitle: 'Joya Sentimental en "Oro Amarillo 18k"',
    category: "collares",
    categories: ["collares", "joyeria"],
    type: "collares-relicarios",
    gender: "mujer",
    price: 1650,
    priceFormatted: "S/. 1,650",
    image: "/images/cat-collares.jpg",
    gallery: ["/images/cat-collares.jpg"],
    badge: "Espacio para 2 Fotografías",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Medallón corazón abrible con filigrana repujada en la tapa para conservar retratos de seres queridos cerca del corazón.",
    hasPresentationChoice: true
  },

  // 21. JOYERÍA: PARA ÉL (Cadena y Aros)
  {
    id: "cadena-grumet-varon",
    name: "Cadena Eslabón Grumet 60cm Varón",
    subtitle: 'Plata Ley 950 Maciza',
    category: "joyeria",
    categories: ["joyeria", "cadenas"],
    type: "cadenas",
    gender: "hombre",
    price: 680,
    priceFormatted: "S/. 680",
    image: "/images/style-bisel.jpg",
    gallery: ["/images/style-bisel.jpg"],
    badge: "Eslabón Diamantado Italiano",
    selectedMetal: "Plata Ley 950",
    availableMetals: [
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
    ],
    description: "Cadena de eslabones aplanados con facetas brillantes de 3.5mm de grosor y broche mosquetón reforzado.",
    hasPresentationChoice: true
  },

  // 22. JOYERÍA: TOBILLERAS
  {
    id: "tobillera-esferas-plata",
    name: "Tobillera Esferas de Plata Italiana 925",
    subtitle: "Diseño Liviano de Verano",
    category: "joyeria",
    categories: ["joyeria", "tobilleras"],
    type: "tobilleras",
    gender: "mujer",
    price: 210,
    priceFormatted: "S/. 210",
    image: "/images/cat-pulseras.jpg",
    gallery: ["/images/cat-pulseras.jpg"],
    badge: "Largo Regulable 22-26cm",
    selectedMetal: "Plata 925",
    availableMetals: [{ id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" }],
    description: "Cadena forzada con esferitas pulidas espejadas que aportan un destello coqueto y veraniego.",
    hasPresentationChoice: true
  },

  // 23. ANILLO DE PROMESA CLÁSICO
  {
    id: "anillo-promesa-infinito-oro",
    name: "Anillo de Promesa Infinito Clásico",
    subtitle: 'Símbolo de Promesa en "Oro 18k y Plata 950"',
    category: "anillo-promesa",
    categories: ["anillo-promesa", "anillos-promesa", "amor-promesa"],
    type: "anillo",
    style: "clasicos",
    price: 980,
    priceFormatted: "S/. 980",
    image: "/images/cat-promesa.jpg",
    gallery: ["/images/cat-promesa.jpg", "/images/detail-box-green.jpg"],
    badge: "Circondia Suiza & Silueta Infinita",
    selectedMetal: "Plata 950 con Oro 18k Natural",
    availableMetals: [
      { id: "plata-950-oro-natural", name: "Plata 950 con Oro 18k Natural", color: "linear-gradient(135deg, #eff2f2 50%, #e2be82 50%)", border: "#c9ba9b" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Redondo",
    description: "Silueta atemporal con el lazo infinito central y un brillante central que conmemora el pacto sincero entre dos corazones.",
    hasGemSelection: true
  },

  // 24. ANILLO DE PROMESA SIN PEDRERÍA
  {
    id: "anillo-promesa-nudo-amor",
    name: "Anillo de Promesa Nudo de Amor Puro",
    subtitle: 'Orfebrería Lisa en "Oro Rosa 18k"',
    category: "anillo-promesa",
    categories: ["anillo-promesa", "anillos-promesa", "amor-promesa"],
    type: "anillo",
    style: "sin-pedreria",
    price: 890,
    priceFormatted: "S/. 890",
    image: "/images/secret-garden-rose.jpg",
    gallery: ["/images/secret-garden-rose.jpg", "/images/detail-packaging.jpg"],
    badge: "100% Metal Macizo Pulido Espejo",
    selectedMetal: "Oro Rosa 18k",
    availableMetals: [
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Diseño minimalista de nudo de Hércules forjado sin piedras para uso cómodo ininterrumpido.",
    hasGemSelection: false
  },

  // 25. ANILLO DE PROMESA MODERNO
  {
    id: "anillo-promesa-moderno-onda",
    name: "Anillo de Promesa Onda Serena Moderna",
    subtitle: 'Línea Escultural en "Oro Blanco 18k"',
    category: "anillo-promesa",
    categories: ["anillo-promesa", "anillos-promesa", "amor-promesa"],
    type: "anillo",
    style: "moderno",
    price: 1150,
    priceFormatted: "S/. 1,150",
    image: "/images/style-bisel.jpg",
    gallery: ["/images/style-bisel.jpg"],
    badge: "Diseño Arquitectónico Fluido",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    defaultGemShape: "Oval",
    description: "Curvatura contemporánea que abraza suavemente la mano, con gema engastada en tensión de alta seguridad.",
    hasGemSelection: true
  },

  // 26. ALIANZAS DE AMOR CLÁSICAS
  {
    id: "alianza-amor-clasica-oro",
    name: "Alianzas de Amor Dúo Clásico Media Caña",
    subtitle: 'Par de Alianzas en "Oro Amarillo 18k"',
    category: "alianzas",
    categories: ["alianzas", "aros-alianzas", "amor-promesa", "aros"],
    type: "aros",
    style: "clasicos",
    price: 3200,
    priceFormatted: "S/. 3,200",
    image: "/images/cat-alianzas.jpg",
    gallery: ["/images/cat-alianzas.jpg", "/images/aros-trial-oro-amarillo.jpg"],
    badge: "Par Completo con Grabado Láser",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Alianzas de promesa y amor para parejas que buscan una unión sobria, pulida y confortable.",
    hasDoubleSizes: true
  },

  // 27. ALIANZAS DE AMOR SIN PEDRERÍA
  {
    id: "alianza-amor-sin-pedreria-dual",
    name: "Alianzas de Amor Bicolor Satinadas Sin Pedrería",
    subtitle: 'Acabado Cepillado en "Oro Blanco y Rosa 18k"',
    category: "alianzas",
    categories: ["alianzas", "aros-alianzas", "amor-promesa", "aros"],
    type: "aros",
    style: "sin-pedreria",
    price: 3450,
    priceFormatted: "S/. 3,450",
    image: "/images/aros-trial-bicolor.jpg",
    gallery: ["/images/aros-trial-bicolor.jpg"],
    badge: "Acabado Satinado Mate & Pulido",
    selectedMetal: "Oro 18k Bicolor",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Unión perfecta de dos aleaciones nobles sin gemas, ideal para quienes priorizan resistencia pura y tacto sedoso.",
    hasDoubleSizes: true
  },

  // 28. ALIANZAS DE AMOR MODERNAS
  {
    id: "alianza-amor-moderna-bisel",
    name: "Alianzas de Amor Vanguardia Biselada",
    subtitle: 'Perfil Geométrico en "Oro Blanco 18k"',
    category: "alianzas",
    categories: ["alianzas", "aros-alianzas", "amor-promesa", "aros"],
    type: "aros",
    style: "moderno",
    price: 3600,
    priceFormatted: "S/. 3,600",
    image: "/images/secret-garden-white.jpg",
    gallery: ["/images/secret-garden-white.jpg"],
    badge: "Faceteado Moderno 3D",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Cortes biselados que reflejan destellos dinámicos al compás de cada gesto cotidiano.",
    hasDoubleSizes: true
  },

  // 29. ALIANZAS DE AMOR VINTAGE
  {
    id: "alianza-amor-vintage-corona",
    name: "Alianzas de Amor Corona Vintage Milgrain",
    subtitle: 'Borde Perlado Real en "Oro Rosa 18k"',
    category: "alianzas",
    categories: ["alianzas", "aros-alianzas", "amor-promesa", "aros"],
    type: "aros",
    style: "vintage",
    price: 3800,
    priceFormatted: "S/. 3,800",
    image: "/images/style-vintage.jpg",
    gallery: ["/images/style-vintage.jpg"],
    badge: "Orla Milgrain Clásica",
    selectedMetal: "Oro Rosa 18k",
    availableMetals: [
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Inspirada en las sortijas románticas victorianas con micro cuentas de oro repujadas a mano.",
    hasDoubleSizes: true
  },

  // 30. JOYERÍA: COLLAR RELIGIOSO
  {
    id: "collar-cruz-latina-oro",
    name: "Medalla Cruz Latina Sublime con Diamante",
    subtitle: 'Joya Devocional en "Oro Amarillo 18k"',
    category: "collares",
    categories: ["collares", "joyeria"],
    type: "collares-religiosos",
    gender: "mujer",
    price: 1290,
    priceFormatted: "S/. 1,290",
    image: "/images/cat-collares.jpg",
    gallery: ["/images/cat-collares.jpg"],
    badge: "Cruz Calada & Diamante 0.05ct",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Símbolo de fe y protección con acabado pulido satinado y un diamante en el cruce de brazos.",
    hasPresentationChoice: true
  },

  // 31. JOYERÍA: COLLAR PERSONALIZADO
  {
    id: "collar-nombre-personalizado",
    name: "Gargantilla Nombre Personalizado en Caligrafía Fina",
    subtitle: 'Pieza Hecha a Medida en "Oro Amarillo 18k"',
    category: "collares",
    categories: ["collares", "joyeria"],
    type: "collares-personalizados",
    gender: "mujer",
    price: 990,
    priceFormatted: "S/. 990",
    image: "/images/collar-cristal-blue.jpg",
    gallery: ["/images/collar-cristal-blue.jpg"],
    badge: "Personalización Artesanal Incluida",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Calado de precisión de nombres propios o palabras inspiradoras sobre cadena veneciana con broche de seguridad.",
    hasPresentationChoice: true
  },

  // 32. JOYERÍA: JUEGO COMPLETO
  {
    id: "juego-nupcial-perlas-australianas",
    name: "Juego Nupcial Gargantilla y Aretes de Perla & Brillos",
    subtitle: 'Set de Gala en "Oro Blanco 18k"',
    category: "joyeria",
    categories: ["joyeria", "juegos", "collares", "aretes"],
    type: "juegos",
    gender: "mujer",
    price: 2600,
    priceFormatted: "S/. 2,600",
    image: "/images/cat-collares.jpg",
    gallery: ["/images/cat-collares.jpg", "/images/cat-pulseras.jpg"],
    badge: "Set Dúo Armónico Completo",
    selectedMetal: "Oro Blanco 18k",
    availableMetals: [
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Combinación de colgante solitario y par de pendientes a juego con perlas cultivadas y halo brillante.",
    hasPresentationChoice: true
  },

  // 33. JOYERÍA: AROS CASUALES PARA VARÓN
  {
    id: "aro-casual-varon-plata-oro",
    name: "Aro Casual Varón Confort Fit Plata 950 y Oro 18k",
    subtitle: 'Banda Masculina de Porte Distinguido',
    category: "joyeria",
    categories: ["joyeria", "aros-casuales", "anillos"],
    type: "aros-casuales",
    gender: "hombre",
    price: 750,
    priceFormatted: "S/. 750",
    image: "/images/aros-trial-oro-amarillo.jpg",
    gallery: ["/images/aros-trial-oro-amarillo.jpg"],
    badge: "Interior Bombé Alta Comodidad",
    selectedMetal: "Plata 950 con Oro 18k",
    availableMetals: [
      { id: "plata-950-oro-amarillo", name: "Plata 950 con Oro 18k", color: "linear-gradient(135deg, #eff2f2 50%, #f6db8d 50%)", border: "#cbb779" },
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
    ],
    description: "Sortija sobria para varón con ranura central en bajo relieve y acabado satinado antihuellas.",
    hasPresentationChoice: true
  },

  // 34. JOYERÍA: PULSERA PARA VARÓN
  {
    id: "pulsera-eslabon-hombre-baraka",
    name: "Pulsera de Eslabones Masculinos Baraka en Plata 950",
    subtitle: 'Diseño Macizo con Cierre Box',
    category: "pulseras",
    categories: ["pulseras", "joyeria"],
    type: "pulseras",
    gender: "hombre",
    price: 890,
    priceFormatted: "S/. 890",
    image: "/images/cat-pulseras.jpg",
    gallery: ["/images/cat-pulseras.jpg"],
    badge: "Plata Ley 950 Maciza 21cm",
    selectedMetal: "Plata Ley 950",
    availableMetals: [
      { id: "plata-950", name: "Plata Ley 950", color: "#eff2f2", border: "#d8dddd" },
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
    ],
    description: "Pulsera de estética potente con eslabones pulidos y pernos de acento dorado.",
    hasPresentationChoice: true
  },

  // 35. JOYERÍA: RELOJ ELEGANTE
  {
    id: "reloj-cronografo-platino-swiss",
    name: "Reloj Cronógrafo Crono-Luxe Acero y Zafiro",
    subtitle: 'Edición Especial Limitada Platino Joyeros',
    category: "joyeria",
    categories: ["joyeria", "relojes"],
    type: "relojes",
    gender: "hombre",
    price: 1850,
    priceFormatted: "S/. 1,850",
    image: "/images/box-presentation.jpg",
    gallery: ["/images/box-presentation.jpg"],
    badge: "Cristal de Zafiro Antirreflejo 5ATM",
    selectedMetal: "Acero Quirúrgico y PVD Dorado",
    availableMetals: [
      { id: "acero-oro", name: "Acero y PVD Oro 18k", color: "#d7b355", border: "#b8933b" },
      { id: "acero-plata", name: "Acero Quirúrgico 316L", color: "#eff2f2", border: "#d8dddd" },
    ],
    description: "Movimiento de alta precisión, dial color esmeralda y correa de piel genuina con pespunte artesanal.",
    hasPresentationChoice: true
  },

  // 36. JOYERÍA: ARETES NIÑA
  {
    id: "aretes-nina-mariposa-oro",
    name: "Aretes Niña Mariposa Esmaltada en Oro 18k",
    subtitle: 'Colección Kids con Cierre Seguro',
    category: "aretes",
    categories: ["aretes", "joyeria", "kids"],
    type: "aretes-nina",
    gender: "kids",
    price: 450,
    priceFormatted: "S/. 450",
    image: "/images/cat-pulseras.jpg",
    gallery: ["/images/cat-pulseras.jpg"],
    badge: "Oro 18k & Esmaltado Pastel",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "oro-blanco-18k", name: "Oro Blanco 18k", color: "#e8eaeb", border: "#c2c7c8" },
    ],
    description: "Diseño tierno y seguro para niñas, con mariposas esmaltadas al fuego y broche a presión suave.",
    hasPresentationChoice: true
  },

  // 37. JOYERÍA: CADENA PARA BEBÉ / NIÑOS
  {
    id: "cadena-bebe-angel-guarda",
    name: "Cadenita y Dije Ángel de la Guarda para Bebé",
    subtitle: 'Oro Amarillo 18k Hipoalergénico',
    category: "joyeria",
    categories: ["joyeria", "cadenas", "kids"],
    type: "cadenas",
    gender: "kids",
    price: 620,
    priceFormatted: "S/. 620",
    image: "/images/collar-cristal-blue.jpg",
    gallery: ["/images/collar-cristal-blue.jpg"],
    badge: "Medalla Ángel con Bautizo",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Cadena de eslabón forzado fino de 38cm con dije protector, ideal para regalo de nacimiento o bautizo.",
    hasPresentationChoice: true
  },

  // 38. JOYERÍA: ESCLAVA BEBÉ
  {
    id: "esclava-bebe-identidad-oro",
    name: "Esclava de Identidad Bebé con Placa en Oro 18k",
    subtitle: 'Grabado de Nombre y Fecha de Nacimiento',
    category: "pulseras",
    categories: ["pulseras", "joyeria", "kids"],
    type: "pulseras",
    gender: "kids",
    price: 580,
    priceFormatted: "S/. 580",
    image: "/images/cat-pulseras.jpg",
    gallery: ["/images/cat-pulseras.jpg"],
    badge: "Placa Espejo Grabable",
    selectedMetal: "Oro Amarillo 18k",
    availableMetals: [
      { id: "oro-amarillo-18k", name: "Oro Amarillo 18k", color: "#f6db8d", border: "#d7b355" },
      { id: "oro-rosa-18k", name: "Oro Rosa 18k", color: "#f7c7b2", border: "#dca188" },
      { id: "plata-925", name: "Plata 925", color: "#e4e7e7", border: "#cfd3d3" },
    ],
    description: "Pulserita clásica con placa central pulida para grabar el nombre del recién nacido.",
    hasPresentationChoice: true
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
