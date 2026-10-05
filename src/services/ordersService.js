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
    sedeId: "miraflores",
    sedeName: "Sede Miraflores",
    sedeRecojo: "Sede Miraflores - Av. José Larco 880",
    shippingAddress: "",
    stage: "engaste_pulido", // Paso 3
    estimatedCompletion: "10 de Abril, 2026",
    adminNotes: "Montura en Oro 18K Rosa fundida y pulida con éxito. Diamante central de 1.00 ct en proceso de engaste en 4 uñas.",
    lastUpdated: "2026-03-29",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "BCP",
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
    id: "PLT-2026-9115",
    date: "2026-03-30",
    clientName: "Valeria Morales",
    clientEmail: "v.morales@gmail.com",
    clientPhone: "+51 984 281 116",
    deliveryType: "recojo_sede",
    sedeId: "miraflores",
    sedeName: "Sede Miraflores",
    sedeRecojo: "Sede Miraflores - Av. José Larco 880",
    shippingAddress: "",
    stage: "control_calidad", // Paso 4
    estimatedCompletion: "12 de Abril, 2026",
    adminNotes: "Engaste de diamantes 100% verificado. En laboratorio para emisión de certificado gemológico.",
    lastUpdated: "2026-04-03",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "IziPay",
    total: 6400,
    items: [
      {
        id: "prod-pulsera-tennis",
        name: "Pulsera Tennis Diamantes Platino",
        metal: "Platino 950",
        metalId: "platino",
        tone: "white",
        size: "17 cm",
        gemstone: "Diamantes corte brillante 2.50 ct total",
        price: 6400,
        quantity: 1,
        image: "/images/cat-pulseras.jpg",
        sku: "PT-PL-17",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2026-03-30 11:20 AM", note: "Pedido registrado y validado en tienda Miraflores." },
      { stage: "diseno_taller", date: "2026-04-01 09:30 AM", note: "Eslabones articulados armados en taller." },
      { stage: "engaste_pulido", date: "2026-04-02 03:00 PM", note: "Engaste de 48 diamantes completado." },
      { stage: "control_calidad", date: "2026-04-03 10:00 AM", note: "En revisión de laboratorio gemológico." },
    ],
  },
  {
    id: "PLT-2025-4102",
    date: "2025-11-14",
    clientName: "Camila Mendoza",
    clientEmail: "cliente@platino.pe",
    clientPhone: "+51 912 345 678",
    deliveryType: "recojo_sede",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    sedeRecojo: "Sede Lima Centro - Jr. de la Unión 540",
    shippingAddress: "",
    stage: "entregado", // Paso 6
    estimatedCompletion: "28 de Noviembre, 2025",
    adminNotes: "Entregado a satisfacción en tienda Lima Centro con estuche de madera fina y tarjeta Platino Care.",
    lastUpdated: "2025-11-28",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "Interbank",
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
      { stage: "listo_envio", date: "2025-11-26 03:00 PM", note: "Empacado listo en vitrina de Lima Centro." },
      { stage: "entregado", date: "2025-11-28 01:15 PM", note: "Entregado a la cliente en local Lima Centro." },
    ],
  },
  {
    id: "PLT-2026-9023",
    date: "2026-04-01",
    clientName: "Rodrigo Benavides",
    clientEmail: "r.benavides@empresa.pe",
    clientPhone: "+51 998 765 432",
    deliveryType: "recojo_sede",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    sedeRecojo: "Sede Lima Centro - Jr. de la Unión 540",
    shippingAddress: "",
    stage: "diseno_taller",
    estimatedCompletion: "16 de Abril, 2026",
    adminNotes: "Diseño CAD aprobado por el cliente. Fundiendo montura en Oro 18K Amarillo en taller de Lima.",
    lastUpdated: "2026-04-02",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "BanBif",
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
  {
    id: "PLT-2026-9240",
    date: "2026-04-03",
    clientName: "Diego Alarcón",
    clientEmail: "d.alarcon@gmail.com",
    clientPhone: "+51 927 357 217",
    deliveryType: "recojo_sede",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    sedeRecojo: "Sede Lima Centro - Jr. de la Unión 540",
    shippingAddress: "",
    stage: "recibido",
    estimatedCompletion: "20 de Abril, 2026",
    adminNotes: "Pedido presencial en tienda Lima Centro. Pago en efectivo recibido en caja.",
    lastUpdated: "2026-04-03",
    paymentStatus: "Pagado (100%)",
    paymentMethod: "Efectivo",
    total: 2800,
    items: [
      {
        id: "prod-solitario-aura",
        name: "Anillo Aura Zafiro Azul",
        metal: "Oro 18K Blanco",
        metalId: "oro-18k-blanco",
        tone: "white",
        size: "14 (Dama)",
        gemstone: "Zafiro Natural 0.80 ct",
        price: 2800,
        quantity: 1,
        image: "/images/cat-compromiso.jpg",
        sku: "AU-OB-14",
      },
    ],
    timeline: [
      { stage: "recibido", date: "2026-04-03 04:30 PM", note: "Orden recibida en tienda física Lima Centro." },
    ],
  },
];

// Función para determinar con certeza la sede asociada a una orden
export const getOrderSedeId = (order) => {
  if (!order) return "lima-centro";
  if (order.sedeId === "miraflores" || order.sedeId === "lima-centro") return order.sedeId;
  if (order.sede === "miraflores" || order.sede === "lima-centro") return order.sede;
  const str = `${order.sedeRecojo || ""} ${order.shippingAddress || ""} ${order.adminNotes || ""}`.toLowerCase();
  if (str.includes("miraflores") || str.includes("larco")) return "miraflores";
  return "lima-centro";
};

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
      // Asegurar que las órdenes iniciales de prueba estén presentes para cada sede
      const existingIds = new Set(parsed.map((o) => o.id));
      const merged = [...parsed];
      INITIAL_ORDERS.forEach((initOrder) => {
        if (!existingIds.has(initOrder.id)) {
          merged.push(initOrder);
        }
      });
      return merged.map((order) => ({
        ...order,
        sedeId: getOrderSedeId(order),
        paymentMethod: PAYMENT_METHODS.includes(order.paymentMethod)
          ? order.paymentMethod
          : normalizePaymentMethod(order.paymentMethod),
      }));
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

export const PAYMENT_STATUSES = [
  { id: "Pagado (100%)", label: "Pagado (100%)", color: "#15803d", bgColor: "#dcfce7", icon: "bi-check-circle-fill" },
  { id: "Pendiente de Validación", label: "Pendiente de Validación", color: "#b45309", bgColor: "#fef3c7", icon: "bi-hourglass-split" },
  { id: "Pago Parcial (50%)", label: "Pago Parcial (50%)", color: "#1d4ed8", bgColor: "#dbeafe", icon: "bi-pie-chart-fill" },
  { id: "Pendiente de Pago", label: "Pendiente de Pago", color: "#b91c1c", bgColor: "#fee2e2", icon: "bi-x-circle-fill" },
];

export const PAYMENT_METHODS = [
  "BanBif",
  "Banco de la Nación",
  "BCP",
  "Interbank",
  "IziPay",
  "Pichincha",
  "Fondo Platino",
  "Efectivo",
];

export const PAYMENT_METHODS_DATA = [
  {
    id: "BCP",
    name: "BCP",
    badge: "Inmediato",
    category: "Transferencia Bancaria",
    description: "Transferencia directa a cuenta corriente Soles / Dólares BCP",
    icon: "bi-bank",
    instructions: "Transfiere vía App BCP o agente a nuestra Cta. Cte. Soles: 194-8291048-0-12 (CCI: 00219400829104801290).",
  },
  {
    id: "Interbank",
    name: "Interbank",
    badge: "Directo",
    category: "Transferencia Bancaria",
    description: "Transferencia directa o interbancaria Interbank",
    icon: "bi-building-fill",
    instructions: "Transfiere desde tu banca móvil Interbank a nuestra Cta. Cte. Soles: 200-3001847192 (CCI: 00320000300184719245).",
  },
  {
    id: "BanBif",
    name: "BanBif",
    badge: "Banca Exclusiva",
    category: "Transferencia Bancaria",
    description: "Abono o transferencia a cuenta corriente BanBif",
    icon: "bi-bank2",
    instructions: "Transfiere vía BanBif a nuestra Cta. Cte. Soles: 007-001928471-9 (CCI: 03800700192847190011).",
  },
  {
    id: "Banco de la Nación",
    name: "Banco de la Nación",
    badge: "Nacional",
    category: "Depósito / Transferencia",
    description: "Depósito en ventanilla, agente o transferencia BN",
    icon: "bi-building",
    instructions: "Abono o depósito en ventanilla o agente Banco de la Nación a la Cta. Institucional: 04-019-382910.",
  },
  {
    id: "IziPay",
    name: "IziPay",
    badge: "Pasarela Segura",
    category: "Pasarela & Tarjetas",
    description: "Pago seguro con tarjeta Débito / Crédito vía pasarela IziPay",
    icon: "bi-credit-card-2-front-fill",
    instructions: "Procesamiento 100% encriptado con tarjetas Visa, Mastercard o Amex a través del terminal / pasarela virtual IziPay.",
  },
  {
    id: "Pichincha",
    name: "Pichincha",
    badge: "Red Pichincha",
    category: "Transferencia Bancaria",
    description: "Transferencia a cuenta empresarial Banco Pichincha",
    icon: "bi-credit-card",
    instructions: "Transfiere desde la banca móvil Pichincha o interbancario a la Cta.: 0011-0982736182 (CCI: 01100110982736182390).",
  },
  {
    id: "Fondo Platino",
    name: "Fondo Platino",
    badge: "Línea Joyera",
    category: "Financiamiento & Saldo",
    description: "Crédito corporativo directo o saldo a favor Fondo Platino",
    icon: "bi-gem",
    instructions: "Aplica tu línea de crédito o fondo a favor de taller Platino. Un asesor confirmará tu código corporativo.",
  },
  {
    id: "Efectivo",
    name: "Efectivo",
    badge: "En Boutique",
    category: "Pago Presencial",
    description: "Pago en efectivo en tienda física o al coordinar entrega",
    icon: "bi-cash-stack",
    instructions: "Cancela en efectivo directamente en caja en nuestra boutique de Miraflores o Lima Centro al retirar tu joya.",
  },
];

export const normalizePaymentMethod = (pm) => {
  if (!pm) return "BCP";
  const str = String(pm).trim().toLowerCase();
  if (str.includes("banbif")) return "BanBif";
  if (str.includes("nacion") || str.includes("nación")) return "Banco de la Nación";
  if (str.includes("interbank")) return "Interbank";
  if (str.includes("bcp") || str.includes("transferencia")) return "BCP";
  if (str.includes("izipay") || str.includes("tarjeta") || str.includes("pos") || str.includes("visa") || str.includes("mastercard") || str.includes("datafono") || str.includes("datáfono")) return "IziPay";
  if (str.includes("pichincha")) return "Pichincha";
  if (str.includes("fondo platino") || str.includes("fondo")) return "Fondo Platino";
  if (str.includes("efectivo") || str.includes("cash")) return "Efectivo";
  if (str.includes("plin")) return "Interbank";
  if (str.includes("yape")) return "BCP";
  return "BCP";
};

// Actualizar estado de pago y medio de pago (Administrador)
export const updateOrderPayment = (orderId, paymentStatus, paymentMethod = null, paymentNotes = null) => {
  const all = getOrders();
  const index = all.findIndex((o) => o.id === orderId);
  if (index === -1) return false;

  const currentOrder = all[index];
  all[index] = {
    ...currentOrder,
    paymentStatus: paymentStatus || currentOrder.paymentStatus,
    paymentMethod: paymentMethod !== null ? paymentMethod : currentOrder.paymentMethod,
    paymentNotes: paymentNotes !== null ? paymentNotes : (currentOrder.paymentNotes || ""),
    lastUpdated: new Date().toISOString().split("T")[0],
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
    paymentMethod: orderData.paymentMethod || "BCP",
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
