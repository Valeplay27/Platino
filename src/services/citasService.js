// Servicio de gestión de citas y bloqueos de horarios para Platino Perú

export const TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  // 1:00 PM - 2:00 PM es refrigerio
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

const CITAS_STORAGE_KEY = "platino_citas_v1";
const BLOCKED_SLOTS_KEY = "platino_blocked_slots_v1";

// Citas iniciales de demostración (exclusivamente Asesoría General)
const INITIAL_CITAS = [
  {
    id: "PLT-1082",
    sedeId: "miraflores",
    sedeName: "Sede Miraflores",
    serviceType: "asesoria",
    serviceTitle: "Cita de Asesoría General",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Mañana
    time: "11:00 AM",
    clientName: "Valeria Mendoza",
    clientPhone: "+51 987 654 321",
    clientEmail: "valeria.mendoza@gmail.com",
    observation: "Ver modelos de sortijas de compromiso y alianzas exclusivas en oro 18k.",
    status: "confirmada", // confirmada, pendiente, cancelada, completada
    createdAt: new Date().toISOString(),
  },
  {
    id: "PLT-1083",
    sedeId: "lima-centro",
    sedeName: "Sede Lima Centro",
    serviceType: "asesoria",
    serviceTitle: "Cita de Asesoría General",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Pasado mañana
    time: "04:00 PM",
    clientName: "Carlos Alarcón",
    clientPhone: "+51 912 345 678",
    clientEmail: "carlos.alarcon@hotmail.com",
    observation: "Ver modelos de aros de matrimonio en oro amarillo 18k con grabado personalizado.",
    status: "pendiente",
    createdAt: new Date().toISOString(),
  },
];

// Bloqueos iniciales de demostración
const INITIAL_BLOCKED = [
  {
    id: "block-1",
    sedeId: "lima-centro",
    date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    time: "10:00 AM",
    serviceType: "asesoria",
    reason: "Capacitación interna de asesores",
    createdAt: new Date().toISOString(),
  },
  {
    id: "block-2",
    sedeId: "miraflores",
    date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    time: "03:00 PM",
    serviceType: "asesoria",
    reason: "Mantenimiento y auditoría de vitrinas",
    createdAt: new Date().toISOString(),
  },
];

export const getCitas = () => {
  try {
    const data = localStorage.getItem(CITAS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(INITIAL_CITAS));
      return INITIAL_CITAS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_CITAS;
  }
};

export const saveCita = (citaData) => {
  const citas = getCitas();
  const newCita = {
    ...citaData,
    id: `PLT-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "confirmada",
    createdAt: new Date().toISOString(),
  };
  const updated = [newCita, ...citas];
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return newCita;
};

export const updateCitaStatus = (id, newStatus) => {
  const citas = getCitas();
  const updated = citas.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const deleteCita = (id) => {
  const citas = getCitas();
  const updated = citas.filter((c) => c.id !== id);
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const getBlockedSlots = () => {
  try {
    const data = localStorage.getItem(BLOCKED_SLOTS_KEY);
    if (!data) {
      localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(INITIAL_BLOCKED));
      return INITIAL_BLOCKED;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_BLOCKED;
  }
};

export const isSlotBlocked = (sedeId, dateStr, timeStr, serviceType = "all") => {
  // 1. Revisar si hay un bloqueo administrativo manual
  const blocked = getBlockedSlots();
  const manualBlock = blocked.find((b) => {
    if (b.sedeId !== sedeId || b.date !== dateStr) return false;
    if (b.time !== timeStr && b.time !== "FULL_DAY") return false;
    // Si el bloqueo aplica a toda la sede (serviceType === "all" o indefinido)
    if (!b.serviceType || b.serviceType === "all") return true;
    // Si se consulta un servicio específico ("gemologo" o "asesoria")
    if (serviceType !== "all" && b.serviceType === serviceType) return true;
    // Si se consulta sin serviceType específico ("all") pero hay bloqueo en ese slot
    if (serviceType === "all") return true;
    return false;
  });

  if (manualBlock) {
    const defaultReason = manualBlock.reason || "No disponible para Asesoría General";
    return {
      blocked: true,
      reason: defaultReason,
      blockId: manualBlock.id,
      serviceType: "asesoria",
    };
  }

  // 2. Revisar si ya existe una cita confirmada o pendiente en ese horario y sede
  const citas = getCitas();
  const booked = citas.find(
    (c) =>
      c.sedeId === sedeId &&
      c.date === dateStr &&
      c.time === timeStr &&
      c.status !== "cancelada"
  );

  if (booked) {
    const bookedLabel = `Horario reservado (${booked.clientName || "Cliente"})`;
    return {
      blocked: true,
      reason: bookedLabel,
      bookedCitaId: booked.id,
      serviceType: "asesoria",
    };
  }

  return { blocked: false, reason: null };
};

export const blockSlot = (
  sedeId,
  dateStr,
  timeStr,
  reason = "Horario no disponible",
  serviceType = "all"
) => {
  const blocked = getBlockedSlots();
  // Evitar duplicados del mismo tipo
  const filtered = blocked.filter(
    (b) =>
      !(
        b.sedeId === sedeId &&
        b.date === dateStr &&
        b.time === timeStr &&
        (b.serviceType || "all") === (serviceType || "all")
      )
  );

  const newBlock = {
    id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sedeId,
    date: dateStr,
    time: timeStr,
    serviceType: serviceType || "all",
    reason,
    createdAt: new Date().toISOString(),
  };
  const updated = [newBlock, ...filtered];
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const unblockSlot = (blockId) => {
  const blocked = getBlockedSlots();
  const updated = blocked.filter((b) => b.id !== blockId);
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const unblockFullDay = (sedeId, dateStr, serviceType = "all") => {
  const blocked = getBlockedSlots();
  const updated = blocked.filter(
    (b) =>
      !(
        b.sedeId === sedeId &&
        b.date === dateStr &&
        (serviceType === "all" || !b.serviceType || b.serviceType === "all" || b.serviceType === serviceType)
      )
  );
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

export const unblockBySlotDetails = (sedeId, dateStr, timeStr, serviceType = "all") => {
  const blocked = getBlockedSlots();
  const updated = blocked.filter(
    (b) =>
      !(
        b.sedeId === sedeId &&
        b.date === dateStr &&
        b.time === timeStr &&
        (serviceType === "all" || !b.serviceType || b.serviceType === "all" || b.serviceType === serviceType)
      )
  );
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("citas_updated"));
  return updated;
};

