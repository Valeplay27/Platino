// Servicio de gestión de Reclamaciones conforme al Código de Protección y Defensa del Consumidor (INDECOPI - Ley N° 29571)
// Platino Joyería Perú S.A.C.
import { apiPost } from "./apiClient";
import { getRemoteData, setRemoteData, updateRemoteCache } from "./remoteData";

export const PROVEEDOR_INFO = {
  razonSocial: "PLATINO JOYERÍA PERÚ S.A.C.",
  ruc: "20608945123",
  nombreComercial: "PLATINO PERÚ",
  domicilioFiscal: "Av. José Larco 345, Int. 201, Miraflores, Lima, Perú",
  sedes: [
    {
      id: "miraflores",
      nombre: "Sede Miraflores",
      direccion: "Av. José Larco 345 Tda S-9, Miraflores, Lima",
      telefono: "+51 984 281 116",
    },
    {
      id: "lima-centro",
      nombre: "Sede Lima Centro",
      direccion: "Jr. de la Unión 446 Tda 128, Cercado de Lima",
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

export const getReclamaciones = () => {
  const parsed = getRemoteData("reclamations", []);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveReclamaciones = (list) => {
  setRemoteData("reclamations", list, "platino_reclamaciones_updated");
};

export const createReclamacion = async (formData) => {
  const currentList = getReclamaciones();
  const nextCorrelativo = currentList.reduce((max, r) => Math.max(max, r.correlativo || 0), 0) + 1;
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

  const { reclamation } = await apiPost("/public/reclamations", { reclamation: newRecord });
  updateRemoteCache("reclamations", [reclamation, ...currentList], "platino_reclamaciones_updated");
  return reclamation;
};

export const updateReclamacionStatus = (id, newStatus, respuestaTexto = null, responsable = "Administración Platino") => {
  const currentList = getReclamaciones();
  const index = currentList.findIndex((r) => r.id === id);
  if (index === -1) return false;

  const item = currentList[index];
  const now = new Date().toISOString().split("T")[0];
  const respuestaProveedor = respuestaTexto
    ? {
        fechaRespuesta: now,
        detalle: respuestaTexto,
        responsable,
      }
    : item.respuestaProveedor;

  currentList[index] = {
    ...item,
    estado: newStatus,
    respuestaProveedor,
  };

  updateRemoteCache("reclamations", currentList, "platino_reclamaciones_updated");
  apiPost("/admin/reclamations/mutate", { id, estado: newStatus, respuestaProveedor })
    .then(({ data }) => {
      if (Array.isArray(data)) updateRemoteCache("reclamations", data, "platino_reclamaciones_updated");
    })
    .catch((error) => {
      console.error("Could not update reclamation status:", error);
      window.dispatchEvent(new CustomEvent("platino_api_error", { detail: { namespace: "reclamations", message: error.message } }));
    });
  return true;
};
