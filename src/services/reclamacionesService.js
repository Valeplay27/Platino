// Servicio de gestión de Reclamaciones conforme al Código de Protección y Defensa del Consumidor (INDECOPI - Ley N° 29571)
// Platino Joyería Perú S.A.C.

const STORAGE_KEY = "platino_reclamaciones_v1";

export const PROVEEDOR_INFO = {
  razonSocial: "PLATINO JOYERÍA PERÚ S.A.C.",
  ruc: "20608945123",
  nombreComercial: "PLATINO PERÚ",
  domicilioFiscal: "Av. José Larco 345, Int. 201, Miraflores, Lima, Perú",
  sedes: [
    {
      id: "miraflores",
      nombre: "Sede Miraflores",
      direccion: "Av. José Larco 345, Miraflores, Lima",
      telefono: "+51 984 281 116",
    },
    {
      id: "lima-centro",
      nombre: "Sede Lima Centro",
      direccion: "Jr. de la Unión 446, Cercado de Lima",
      telefono: "+51 927 357 217",
    },
    {
      id: "virtual",
      nombre: "Tienda Virtual / Plataforma Web",
      direccion: "www.platinoperu.com",
      telefono: "+51 927 357 217",
    },
  ],
};

const DEFAULT_RECLAMACIONES = [
  {
    id: "HR-2026-0042",
    correlativo: 42,
    fecha: "2026-03-28",
    hora: "16:45",
    tipo: "reclamo", // 'reclamo' | 'queja'
    estado: "atendido", // 'pendiente' | 'en_proceso' | 'atendido'
    consumidor: {
      tipoDocumento: "DNI",
      numeroDocumento: "72849102",
      nombres: "Mariana Rojas Velásquez",
      telefono: "+51 981 234 567",
      email: "m.rojas@gmail.com",
      direccion: "Av. Benavides 1240, Dpto 402",
      departamento: "Lima",
      provincia: "Lima",
      distrito: "Miraflores",
      esMenorDeEdad: false,
      apoderado: null,
    },
    bienContratado: {
      tipoBien: "producto", // 'producto' | 'servicio'
      montoReclamado: 2850,
      descripcion: "Anillo Solitario Secret Garden en Oro 18K Blanco - Talla 12",
      sede: "miraflores",
      sedeNombre: "Sede Miraflores",
      numeroPedido: "PLT-2026-8941",
    },
    detalle: {
      motivo: "El ajuste de talla solicitado presentó 1 día hábil adicional al plazo inicial estimado en tienda.",
      pedido: "Coordinación de mantenimiento preventivo y limpieza ultrasónica de cortesía como compensación.",
    },
    respuestaProveedor: {
      fechaRespuesta: "2026-03-31",
      detalle: "Se coordinó con el cliente entrega prioritaria con estuche de lujo y certificado de cortesía Platino Care.",
      responsable: "Atención al Cliente Platino Miraflores",
    },
  },
  {
    id: "HR-2026-0043",
    correlativo: 43,
    fecha: "2026-04-02",
    hora: "11:20",
    tipo: "queja",
    estado: "pendiente",
    consumidor: {
      tipoDocumento: "DNI",
      numeroDocumento: "45902183",
      nombres: "Carlos Eduardo Mendoza",
      telefono: "+51 993 456 789",
      email: "carlos.mendoza@outlook.com",
      direccion: "Jr. Carabaya 580",
      departamento: "Lima",
      provincia: "Lima",
      distrito: "Cercado de Lima",
      esMenorDeEdad: false,
      apoderado: null,
    },
    bienContratado: {
      tipoBien: "servicio",
      montoReclamado: 0,
      descripcion: "Atención y asesoría presencial de joyería en local",
      sede: "lima-centro",
      sedeNombre: "Sede Lima Centro",
      numeroPedido: "",
    },
    detalle: {
      motivo: "Tiempo de espera prolongado en módulo de atención al mediodía debido a alta afluencia de clientes.",
      pedido: "Mejorar la asignación de turnos y habilitar mayor cantidad de asesores en horas punta.",
    },
    respuestaProveedor: null,
  },
];

export const getReclamaciones = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECLAMACIONES));
      return DEFAULT_RECLAMACIONES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RECLAMACIONES;
  } catch (err) {
    console.error("Error al leer libro de reclamaciones:", err);
    return DEFAULT_RECLAMACIONES;
  }
};

export const saveReclamaciones = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("platino_reclamaciones_updated", { detail: list }));
  } catch (err) {
    console.error("Error al guardar reclamaciones:", err);
  }
};

export const createReclamacion = (formData) => {
  const currentList = getReclamaciones();
  const nextCorrelativo = currentList.reduce((max, r) => Math.max(max, r.correlativo || 0), 43) + 1;
  const now = new Date();
  const fechaStr = now.toISOString().split("T")[0];
  const horaStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const idFormatted = `HR-${now.getFullYear()}-${String(nextCorrelativo).padStart(4, "0")}`;

  const sedeObj = PROVEEDOR_INFO.sedes.find((s) => s.id === formData.sedeId) || PROVEEDOR_INFO.sedes[0];

  const newRecord = {
    id: idFormatted,
    correlativo: nextCorrelativo,
    fecha: fechaStr,
    hora: horaStr,
    tipo: formData.tipo || "reclamo", // 'reclamo' o 'queja'
    estado: "pendiente",
    consumidor: {
      tipoDocumento: formData.tipoDocumento || "DNI",
      numeroDocumento: formData.numeroDocumento || "",
      nombres: formData.nombres || "",
      telefono: formData.telefono || "",
      email: formData.email || "",
      direccion: formData.direccion || "",
      departamento: formData.departamento || "Lima",
      provincia: formData.provincia || "Lima",
      distrito: formData.distrito || "",
      esMenorDeEdad: Boolean(formData.esMenorDeEdad),
      apoderado: formData.esMenorDeEdad
        ? {
            nombres: formData.apoderadoNombres || "",
            tipoDocumento: formData.apoderadoTipoDoc || "DNI",
            numeroDocumento: formData.apoderadoNumDoc || "",
            telefono: formData.apoderadoTelefono || "",
          }
        : null,
    },
    bienContratado: {
      tipoBien: formData.tipoBien || "producto", // 'producto' o 'servicio'
      montoReclamado: Number(formData.montoReclamado) || 0,
      descripcion: formData.descripcionBien || "",
      sede: formData.sedeId || "miraflores",
      sedeNombre: sedeObj.nombre,
      numeroPedido: formData.numeroPedido || "",
    },
    detalle: {
      motivo: formData.motivo || "",
      pedido: formData.pedido || "",
    },
    respuestaProveedor: null,
  };

  const updated = [newRecord, ...currentList];
  saveReclamaciones(updated);
  return newRecord;
};

export const updateReclamacionStatus = (id, newStatus, respuestaTexto = null, responsable = "Administración Platino") => {
  const currentList = getReclamaciones();
  const index = currentList.findIndex((r) => r.id === id);
  if (index === -1) return false;

  const item = currentList[index];
  const now = new Date().toISOString().split("T")[0];

  currentList[index] = {
    ...item,
    estado: newStatus,
    respuestaProveedor: respuestaTexto
      ? {
          fechaRespuesta: now,
          detalle: respuestaTexto,
          responsable,
        }
      : item.respuestaProveedor,
  };

  saveReclamaciones(currentList);
  return true;
};
