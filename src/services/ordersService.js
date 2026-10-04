// Servicio de gestión de pedidos, seguimiento de taller y sincronización Cliente-Admin para Platino Perú

export const ORDER_STAGES = [
  {
    id: "recibido",
    label: "Pedido Confirmado",
    shortLabel: "Recibido",
    description: "Orden recibida y validada. Preparando especificaciones y asignando maestro orfebre.",
    icon: "bi-check-circle-fill",
    stepNumber: 1,
    color: "#2563eb",
    bgColor: "#eff6ff",
    badgeClass: "badge-recibido",
  },
  {
    id: "diseno_taller",
    label: "Diseño CAD & Taller",
    shortLabel: "En Taller",
    description: "Modelado 3D, fundición del metal noble elegido y armado estructural de la joya.",
    icon: "bi-hammer",
    stepNumber: 2,
    color: "#d97706",
    bgColor: "#fffbeb",
    badgeClass: "badge-taller",
  },
  {
    id: "engaste_pulido",
    label: "Engaste & Acabado",
    shortLabel: "En Engaste",
    description: "Fijación microscópica de diamantes o gemas preciosas y pulido fino artesanal.",
    icon: "bi-gem",
    stepNumber: 3,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    badgeClass: "badge-engaste",
  },
  {
    id: "control_calidad",
    label: "Control de Calidad & Certificación",
    shortLabel: "En Calidad",
    description: "Inspección gemológica estricta con lupa 10x y emisión del certificado oficial Platino.",
    icon: "bi-shield-check",
    stepNumber: 4,
    color: "#0891b2",
    bgColor: "#ecfeff",
    badgeClass: "badge-calidad",
  },
  {
    id: "listo_envio",
    label: "Listo para Entrega / Despacho",
    shortLabel: "Listo para Entrega",
    description: "Empaque de lujo completado en estuche de madera fina. Listo para recojo o courier blindado.",
    icon: "bi-box-seam",
    stepNumber: 5,
    color: "#059669",
    bgColor: "#ecfdf5",
    badgeClass: "badge-listo",
  },
  {
    id: "entregado",
    label: "Entregado al Cliente",
    shortLabel: "Entregado",
    description: "Joya entregada satisfactoriamente. Cobertura Platino Care y garantía activadas.",
    icon: "bi-patch-check-fill",
    stepNumber: 6,
    color: "#15803d",
    bgColor: "#f0fdf4",
    badgeClass: "badge-entregado",
  },
];

const ORDERS_STORAGE_KEY = "platino_orders_v1";

// Pedidos preconfigurados para demostración y evaluación
const INITIAL_ORDERS = [
  {
    id: "PLT-2026-8941",
    date: "2026-03-25",
    clientName: "Camila Mendoza",
    clientEmail: "cliente@platino.pe",
    clientPhone: "+51 912 345 678",
    deliveryType: "recojo_sede", // 'recojo_sede' | 'envio_domicilio'
    sedeRecojo: "Sede Miraflores - Av. José Larco 880",
    shippingAddress: "",
    stage: "engaste_pulido", // Paso 3
    estimatedCompletion: "10 de Abril, 2026",
    adminNotes: "Montura en Oro 18K Rosa fundida y pulida con éxito. Diamante central de 1.00 ct en proceso de engaste en 4 uñas.",
    lastUpdated: "2026-03-29",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "Tarjeta Visa terminada en •••• 4242",
    total: 4850,
    items: [
      {
        id: "prod-secret-garden",
        name: "Anillo Solitario Secret Garden",
        metal: "Oro 18K Rosa",
        metalId: "oro-18k-rosa",
        tone: "rose",
        size: "12 (Dama)",
        gemstone: "Diamante Natural 1.00 ct - Corte Redondo Brillante (GIA)",
        price: 4850,
        quantity: 1,
        image: "/images/secret-garden-rose.jpg",
        sku: "SG-OR-12",
      },
    ],
    timeline: [
      {
        stage: "recibido",
        date: "2026-03-25 10:30 AM",
        note: "Orden recibida en línea y pago validado.",
      },
      {
        stage: "diseno_taller",
        date: "2026-03-27 02:15 PM",
        note: "Modelado 3D terminado y vaciado en Oro 18K Rosa realizado en taller central.",
      },
      {
        stage: "engaste_pulido",
        date: "2026-03-29 11:00 AM",
        note: "Montura lista; maestro engastador fijando gema central y diamantes laterales.",
      },
    ],
  },
  {
    id: "PLT-2025-4102",
    date: "2025-11-14",
    clientName: "Camila Mendoza",
    clientEmail: "cliente@platino.pe",
    clientPhone: "+51 912 345 678",
    deliveryType: "envio_domicilio",
    sedeRecojo: "",
    shippingAddress: "Av. Del Parque 450, Dpto 802, San Isidro, Lima",
    stage: "entregado", // Paso 6
    estimatedCompletion: "28 de Noviembre, 2025",
    adminNotes: "Entregado a satisfacción con estuche de madera fina, paño de limpieza y tarjeta de garantía Platino Care.",
    lastUpdated: "2025-11-28",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "Transferencia Bancaria BCP",
    total: 3600,
    items: [
      {
        id: "prod-aros-eternidad",
        name: "Aros de Matrimonio Platino Eternidad",
        metal: "Platino 950",
        metalId: "platino",
        tone: "white",
        size: "Dama: 11 / Varón: 18",
        gemstone: "Micro-pavé de Diamantes corte brillante 0.15 ct",
        price: 3600,
        quantity: 1,
        image: "/images/aros-trial-oro-blanco.jpg",
        sku: "ET-PL-11-18",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2025-11-14 09:00 AM", note: "Pedido registrado." },
      { stage: "diseno_taller", date: "2025-11-16 11:20 AM", note: "Fundición en Platino 950 completada." },
      { stage: "engaste_pulido", date: "2025-11-20 04:45 PM", note: "Engaste de diamantes y grabado láser interior." },
      { stage: "control_calidad", date: "2025-11-24 10:00 AM", note: "Inspección gemológica aprobada." },
      { stage: "listo_envio", date: "2025-11-26 03:00 PM", note: "Empacado y despachado con courier blindado." },
      { stage: "entregado", date: "2025-11-28 01:15 PM", note: "Recibido conforme en domicilio por el cliente." },
    ],
  },
  {
    id: "PLT-2026-9023",
    date: "2026-04-01",
    clientName: "Rodrigo Benavides",
    clientEmail: "r.benavides@empresa.pe",
    clientPhone: "+51 998 765 432",
    deliveryType: "envio_domicilio",
    sedeRecojo: "",
    shippingAddress: "Calle Las Begonias 441, Of. 601, San Isidro, Lima",
    stage: "diseno_taller",
    estimatedCompletion: "16 de Abril, 2026",
    adminNotes: "Diseño CAD aprobado por el cliente. Fundiendo montura en Oro 18K Amarillo.",
    lastUpdated: "2026-04-02",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "Tarjeta Mastercard •••• 9811",
    total: 5200,
    items: [
      {
        id: "prod-corona-imperial",
        name: "Anillo de Compromiso Corona Imperial",
        metal: "Oro 18K Amarillo",
        metalId: "oro-18k-amarillo",
        tone: "yellow",
        size: "13 (Dama)",
        gemstone: "Zafiro Azul Real 1.50 ct",
        price: 5200,
        quantity: 1,
        image: "/images/aros-trial-oro-amarillo.jpg",
        sku: "CI-OA-13",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2026-04-01 03:40 PM", note: "Pedido registrado y validado." },
      { stage: "diseno_taller", date: "2026-04-02 10:15 AM", note: "Iniciada fundición en crisol con aleación de Oro 18K Amarillo." },
    ],
  },
];

// Obtener todos los pedidos
export const getOrders = () => {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
};

// Guardar pedidos en localStorage
const saveOrders = (orders) => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent("orders_updated"));
  } catch (err) {
    console.error("Error guardando pedidos en storage:", err);
  }
};

// Obtener pedidos de un cliente por su correo
export const getOrdersByClientEmail = (email) => {
  const all = getOrders();
  if (!email) return all;
  const cleanEmail = email.trim().toLowerCase();
  const directMatches = all.filter((o) => o.clientEmail.toLowerCase() === cleanEmail);
  if (directMatches.length > 0) return directMatches;

  // Si es la cuenta de Vladimir / Admin, o si no tiene órdenes registradas con este correo,
  // mostrar las órdenes de demostración disponibles para que siempre pueda visualizar el detallado y probar los avances
  return all;
};

// Avanzar al siguiente paso del proceso de fabricación
export const advanceOrderStep = (orderId) => {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return null;

  const currentIdx = ORDER_STAGES.findIndex((s) => s.id === order.stage);
  if (currentIdx === -1 || currentIdx >= ORDER_STAGES.length - 1) {
    return ORDER_STAGES[ORDER_STAGES.length - 1];
  }

  const nextStage = ORDER_STAGES[currentIdx + 1];
  const autoNotes = {
    diseno_taller: "Diseño 3D CAD aprobado por el cliente. Fundición iniciada en crisol del taller central.",
    engaste_pulido: "Montura fundida con éxito. Maestro engastador montando diamantes y realizando pulido fino.",
    control_calidad: "Engaste completado. La joya ingresó a laboratorio para inspección gemológica y certificado GIA.",
    listo_envio: "Control de calidad 100% aprobado. Empacado en estuche de madera fina listo para entrega o despacho.",
    entregado: "Joya entregada conforme al cliente. Garantía y cobertura Platino Care activadas de por vida.",
  };

  const newNote = autoNotes[nextStage.id] || `El pedido avanzó a la etapa de ${nextStage.label}.`;
  updateOrderStatus(orderId, nextStage.id, newNote);
  return nextStage;
};

// Retroceder un paso del proceso de fabricación (para pruebas y ajustes)
export const stepBackOrderStep = (orderId) => {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return null;

  const currentIdx = ORDER_STAGES.findIndex((s) => s.id === order.stage);
  if (currentIdx <= 0) return ORDER_STAGES[0];

  const prevStage = ORDER_STAGES[currentIdx - 1];
  updateOrderStatus(orderId, prevStage.id, `Regresado a fase de ${prevStage.label} para ajustes adicionales.`);
  return prevStage;
};

// Obtener un pedido específico por ID
export const getOrderById = (orderId) => {
  const all = getOrders();
  return all.find((o) => o.id === orderId) || null;
};

// Obtener información de una etapa
export const getOrderStageInfo = (stageId) => {
  return (
    ORDER_STAGES.find((s) => s.id === stageId) || {
      id: stageId,
      label: stageId,
      shortLabel: stageId,
      description: "",
      icon: "bi-info-circle",
      stepNumber: 1,
      color: "#6b7280",
      bgColor: "#f3f4f6",
      badgeClass: "badge-default",
    }
  );
};

// Actualizar el estado / etapa de un pedido (por parte del Administrador)
export const updateOrderStatus = (orderId, newStage, adminNotes = null) => {
  const all = getOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  const currentOrder = all[index];
  const stageInfo = getOrderStageInfo(newStage);
  const now = new Date();
  const formattedDate = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  // Actualizar notas de admin si se proporcionan, sino conservar las anteriores
  const updatedNotes = adminNotes !== null ? adminNotes : currentOrder.adminNotes;

  // Agregar al historial de timeline si es una etapa nueva
  const timeline = Array.isArray(currentOrder.timeline) ? [...currentOrder.timeline] : [];
  const alreadyInTimeline = timeline.some((t) => t.stage === newStage);

  if (!alreadyInTimeline) {
    timeline.push({
      stage: newStage,
      date: formattedDate,
      note: adminNotes || `El pedido avanzó a la etapa de ${stageInfo.label}.`,
    });
  }

  all[index] = {
    ...currentOrder,
    stage: newStage,
    adminNotes: updatedNotes,
    lastUpdated: now.toISOString().split("T")[0],
    timeline,
  };

  saveOrders(all);
  return true;
};

// Crear nuevo pedido (desde Checkout o Admin)
export const createOrder = (orderData) => {
  const all = getOrders();
  const newId = `PLT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const newOrder = {
    id: newId,
    date: todayStr,
    clientName: orderData.clientName || "Cliente Platino",
    clientEmail: orderData.clientEmail || "cliente@platino.pe",
    clientPhone: orderData.clientPhone || "+51 912 345 678",
    deliveryType: orderData.deliveryType || "recojo_sede",
    sedeRecojo: orderData.sedeRecojo || "Sede Miraflores - Av. José Larco 880",
    shippingAddress: orderData.shippingAddress || "",
    stage: "recibido",
    estimatedCompletion: orderData.estimatedCompletion || "15 días hábiles",
    adminNotes: "Pedido ingresado al sistema. En espera de asignación de maestro joyero.",
    lastUpdated: todayStr,
    paymentStatus: "Pagado (100%)",
    paymentMethod: orderData.paymentMethod || "Pasarela Web Segura",
    total: orderData.total || 0,
    items: orderData.items || [],
    timeline: [
      {
        stage: "recibido",
        date: `${todayStr} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        note: "Pedido confirmado y registrado en el taller de orfebrería.",
      },
    ],
  };

  all.unshift(newOrder);
  saveOrders(all);
  return newOrder;
};

// Eliminar pedido (función administrativa)
export const deleteOrder = (orderId) => {
  const all = getOrders();
  const filtered = all.filter((o) => o.id !== orderId);
  saveOrders(filtered);
  return true;
};
