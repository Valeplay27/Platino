import { getRemoteData, setRemoteData } from "./remoteData";

export const EDUCACION_CATEGORIES = [
  "Todos",
  "Gemología & Diamantes",
  "Guía de Compra",
  "Cuidado & Taller",
  "Tendencias",
  "Orfebrería",
];

export const DEFAULT_EDUCACION_POSTS = [
  {
    id: "post-diamante-natural-vs-lab",
    slug: "diamante-natural-vs-lab-grown",
    title: "Diamante Natural vs. Lab Grown: Guía Definitiva Gemológica",
    subtitle:
      "Descubre las similitudes químicas, ópticas y físicas entre un diamante extraído de la tierra y uno cultivado en laboratorio certificado por GIA o IGI.",
    category: "Gemología & Diamantes",
    author: "Maestro Gemólogo Platino Perú",
    date: "2026-10-15",
    readTime: "5 min de lectura",
    featured: true,
    coverImage: "/images/cat-compromiso.jpg",
    galleryImages: [
      "/images/secret-garden-white.jpg",
      "/images/secret-garden-yellow.jpg",
    ],
    paragraphs: [
      "Tanto el diamante natural como el diamante Lab Grown (cultivado en laboratorio) son 100% carbono cristalizado en sistema cúbico isométrico. Comparten exactamente la misma dureza suprema de 10 en la escala de Mohs, el mismo índice de refracción (2.42) y la misma dispersión de fuego.",
      "La diferencia radica exclusivamente en su origen: mientras que el diamante natural se formó hace miles de millones de años a más de 150 kilómetros bajo la corteza terrestre, el diamante Lab Grown recrea esas mismas condiciones de alta presión y alta temperatura (HPHT) o deposición química de vapor (CVD) en cámaras de alta tecnología.",
      "En Platino Perú entregamos ambas opciones con certificación internacional GIA o IGI e inscripción láser microscópica en el filetín de la piedra, permitiéndote elegir entre el valor histórico y rareza geológica del diamante natural o el mayor quilataje y sostenibilidad de un diamante de laboratorio.",
    ],
    keyTakeaways: [
      "Ambos poseen dureza 10 Mohs y brillan exactamente igual de por vida.",
      "Cada piedra cuenta con certificado GIA / IGI y código grabado con láser en el filetín.",
      "Un diamante Lab Grown permite acceder a un mayor peso en quilates (ct) con el mismo presupuesto.",
    ],
  },
  {
    id: "post-que-es-moissanita",
    slug: "que-es-la-moissanita",
    title: "¿Qué es la Moissanita y cómo se diferencia del Diamante?",
    subtitle:
      "Nacida de las estrellas y perfeccionada para la alta joyería: conoce por qué la moissanita D-VVS1 es una de las gemas más admiradas del mundo.",
    category: "Gemología & Diamantes",
    author: "Laboratorio Gemológico Platino",
    date: "2026-10-12",
    readTime: "4 min de lectura",
    featured: false,
    coverImage: "/images/secret-garden-white.jpg",
    galleryImages: ["/images/cat-promesa.jpg"],
    paragraphs: [
      "Descubierta originalmente en 1893 por el Premio Nobel Henri Moissan en el cráter de un meteorito, la moissanita (carburo de silicio) es una gema preciosa con propiedades ópticas extraordinarias.",
      "Con una dureza de 9.25 en la escala de Mohs —solo superada por el diamante— es ideal para el uso diario en anillos de compromiso y promesa sin perder jamás su transparencia ni rayarse con facilidad.",
      "Su índice de refracción (2.65 - 2.69) es incluso superior al del diamante, lo que produce un destello arcoíris ('fuego') sumamente vivo bajo la luz natural y de salón.",
    ],
    keyTakeaways: [
      "Dureza de 9.25 Mohs: resistencia excepcional para uso diario de por vida.",
      "Mayor dispersión de fuego (destellos cromáticos) que cualquier otra gema incolora.",
      "Alternativa ética, accesible y deslumbrante con grado de color D (incoloro perfecto).",
    ],
  },
  {
    id: "post-cuidado-gemas",
    slug: "correcto-cuidado-de-gemas",
    title: "Correcto Cuidado de Gemas Preciosas y Joyas en Oro 18K",
    subtitle:
      "Consejos prácticos de nuestros maestros orfebres para conservar intacto el brillo espejo de tu sortija y la seguridad de su engaste.",
    category: "Cuidado & Taller",
    author: "Taller de Orfebrería Platino",
    date: "2026-10-08",
    readTime: "4 min de lectura",
    featured: false,
    coverImage: "/images/collar-cristal-blue.jpg",
    galleryImages: ["/images/secret-garden-rose.jpg"],
    paragraphs: [
      "Las joyas en Oro de 18 Quilates y Plata Ley 950 con gemas naturales requieren pequeños hábitos de cuidado para lucir siempre como el primer día en que salieron del taller.",
      "Evita el contacto directo con perfumes, cremas cosméticas, cloro de piscinas o productos abrasivos de limpieza, ya que pueden crear una película opaca debajo del pabellón de la gema y restarle entrada de luz.",
      "Para una limpieza casera segura, sumerge tu joya durante 10 minutos en agua tibia con unas gotas de jabón neutro y frota suavemente la parte posterior de la piedra con un cepillo de cerdas ultra suaves. Además, recuerda acudir una vez al año a nuestras sedes de Lima Centro o Miraflores para tu mantenimiento ultrasónico con Platino Care.",
    ],
    keyTakeaways: [
      "Retira tu anillo antes de realizar actividades de impacto físico o manipular químicos.",
      "Guarda cada pieza de forma individual en su estuche Platino para evitar fricción entre gemas.",
      "Realiza una revisión anual de uñas y engaste con tu garantía Platino Care.",
    ],
  },
  {
    id: "post-tendencias-compromiso",
    slug: "tendencias-anillos-compromiso",
    title: "Tendencias en Anillos de Compromiso 2026: Cortes y Estilos",
    subtitle:
      "Desde el corte Oval y Esmeralda hasta los diseños de 3 piedras y engastes ocultos (Hidden Halo) que marcan pauta este año.",
    category: "Tendencias",
    author: "Dirección de Diseño Platino Perú",
    date: "2026-10-05",
    readTime: "5 min de lectura",
    featured: false,
    coverImage: "/images/secret-garden-rose.jpg",
    galleryImages: ["/images/cat-compromiso.jpg"],
    paragraphs: [
      "Las parejas modernas buscan anillos de compromiso que combinen la atemporalidad clásica con detalles arquitectónicos personalizados que reflejen su propia historia de amor.",
      "Los cortes alargados como el Oval, Marquesa y Esmeralda lideran las preferencias este 2026 gracias a su capacidad de estilizar visualmente la mano y ofrecer una superficie de mesa más amplia por quilate.",
      "En cuanto a metales, el Oro Amarillo 18K y el Oro Rosado 18K viven un gran renacimiento junto con las uñas de platino u oro blanco que mantienen la gema central libre de reflejos cálidos.",
    ],
    keyTakeaways: [
      "Los cortes Oval y Marquesa proyectan mayor tamaño visual y estilizan los dedos.",
      "Las monturas bicolores (brazo en oro amarillo con garras en oro blanco) son tendencia mundial.",
      "Los diseños de 3 piedras simbolizan el pasado, presente y futuro de la pareja.",
    ],
  },
  {
    id: "post-como-tomar-medida",
    slug: "como-tomarme-la-medida",
    title: "¿Cómo tomarme la medida exacta del anillo en casa?",
    subtitle:
      "Método profesional en milímetros y recomendaciones sobre temperatura y anatomía de los nudillos para acertar con la talla ideal.",
    category: "Guía de Compra",
    author: "Asesoría Especializada Platino",
    date: "2026-10-01",
    readTime: "3 min de lectura",
    featured: false,
    coverImage: "/images/cat-boda.jpg",
    galleryImages: [],
    paragraphs: [
      "La forma más precisa de conocer tu talla desde casa es medir el diámetro interno (en milímetros) de un anillo que ya le quede cómodo a la persona en el dedo anular, utilizando una regla milimetrada sin contar los bordes del metal.",
      "Ten en cuenta que los dedos suelen dilatarse ligeramente al final de la tarde o en días cálidos, y contraerse por la mañana o con el frío. Por ello, recomendamos medir a temperatura ambiente al final del día.",
      "Y si se trata de una sorpresa total, no te preocupes: en Platino Perú puedes seleccionar la opción de asesoría de medida en tu compra y cuentas con el primer entallado incluido dentro de tu cobertura Platino Care.",
    ],
    keyTakeaways: [
      "Mide siempre el diámetro interno (por dentro del aro), nunca el borde exterior.",
      "Realiza la medición a temperatura templada, preferiblemente por la tarde.",
      "Cuentas con entallado de ajuste respaldado en nuestras sedes de Lima Centro y Miraflores.",
    ],
  },
];

export const getEducacionPosts = () => {
  const stored = getRemoteData("educacion", DEFAULT_EDUCACION_POSTS);
  if (!Array.isArray(stored) || stored.length === 0) {
    return DEFAULT_EDUCACION_POSTS.map((p) => ({ ...p }));
  }
  return stored;
};

export const saveEducacionPosts = (posts) => {
  setRemoteData("educacion", posts, "platino_educacion_updated");
  return true;
};

export const createEducacionPost = (postData) => {
  const posts = getEducacionPosts();
  const cleanTitle = (postData.title || "Nueva Publicación Platino").trim();
  const slug =
    postData.slug ||
    cleanTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    `post-${Date.now()}`;

  const newPost = {
    id: `post-${Date.now()}`,
    slug,
    title: cleanTitle,
    subtitle: (postData.subtitle || "").trim(),
    category: postData.category || "Gemología & Diamantes",
    author: (postData.author || "Maestro Gemólogo Platino Perú").trim(),
    date: postData.date || new Date().toISOString().split("T")[0],
    readTime: (postData.readTime || "4 min de lectura").trim(),
    featured: Boolean(postData.featured),
    coverImage: postData.coverImage || "/images/cat-compromiso.jpg",
    galleryImages: Array.isArray(postData.galleryImages) ? postData.galleryImages.filter(Boolean) : [],
    paragraphs: Array.isArray(postData.paragraphs)
      ? postData.paragraphs.map((p) => String(p).trim()).filter(Boolean)
      : String(postData.paragraphs || "")
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean),
    keyTakeaways: Array.isArray(postData.keyTakeaways)
      ? postData.keyTakeaways.map((k) => String(k).trim()).filter(Boolean)
      : String(postData.keyTakeaways || "")
          .split(/\n+/)
          .map((k) => k.trim())
          .filter(Boolean),
  };

  let updatedPosts = posts.map((p) => (newPost.featured ? { ...p, featured: false } : p));
  updatedPosts = [newPost, ...updatedPosts];
  saveEducacionPosts(updatedPosts);
  return newPost;
};

export const updateEducacionPost = (id, postData) => {
  const posts = getEducacionPosts();
  const isBecomingFeatured = Boolean(postData.featured);

  const updated = posts.map((post) => {
    if (post.id !== id) {
      return isBecomingFeatured ? { ...post, featured: false } : post;
    }
    return {
      ...post,
      ...postData,
      title: (postData.title ?? post.title).trim(),
      subtitle: (postData.subtitle ?? post.subtitle).trim(),
      category: postData.category ?? post.category,
      author: (postData.author ?? post.author).trim(),
      date: postData.date ?? post.date,
      readTime: (postData.readTime ?? post.readTime).trim(),
      featured: isBecomingFeatured,
      coverImage: postData.coverImage || post.coverImage || "/images/cat-compromiso.jpg",
      galleryImages: Array.isArray(postData.galleryImages)
        ? postData.galleryImages.filter(Boolean)
        : post.galleryImages || [],
      paragraphs: Array.isArray(postData.paragraphs)
        ? postData.paragraphs.map((p) => String(p).trim()).filter(Boolean)
        : String(postData.paragraphs ?? "")
            .split(/\n+/)
            .map((p) => p.trim())
            .filter(Boolean),
      keyTakeaways: Array.isArray(postData.keyTakeaways)
        ? postData.keyTakeaways.map((k) => String(k).trim()).filter(Boolean)
        : String(postData.keyTakeaways ?? "")
            .split(/\n+/)
            .map((k) => k.trim())
            .filter(Boolean),
    };
  });

  saveEducacionPosts(updated);
  return updated.find((p) => p.id === id);
};

export const deleteEducacionPost = (id) => {
  const posts = getEducacionPosts();
  const updated = posts.filter((p) => p.id !== id);
  saveEducacionPosts(updated);
  return updated;
};

export const resetEducacionPosts = () => {
  saveEducacionPosts(DEFAULT_EDUCACION_POSTS);
  return DEFAULT_EDUCACION_POSTS;
};
