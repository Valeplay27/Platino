import React, { useState, useEffect, useMemo } from "react";
import {
  getPlatinoCareConfig,
  savePlatinoCareConfig,
  resetPlatinoCareConfig,
  getPlatinoCareClients,
  savePlatinoCareClients,
  approvePlatinoCareClientPayment,
  rejectPlatinoCareClientPayment,
  deletePlatinoCareClient,
  registerPlatinoCareClient,
  updatePlatinoCareClientDates,
} from "../services/platinoCareService";

export default function AdminPlatinoCareTab({ isMaster = true }) {
  // Pestaña activa principal: "clients" (Validación por DNI) o "config" (Tarifas y Coberturas)
  const [activeSubTab, setActiveSubTab] = useState("clients");

  // Configuración de Tarifas y Textos
  const [config, setConfig] = useState(() => getPlatinoCareConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewPlan, setPreviewPlan] = useState("plus");
  const [openPreviewAccordion, setOpenPreviewAccordion] = useState(1);

  // Lista de Clientes Platino Care
  const [clients, setClients] = useState(() => getPlatinoCareClients());
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientPlanFilter, setClientPlanFilter] = useState("todos"); // 'todos' | 'cortesia' | 'plus'
  const [clientStatusFilter, setClientStatusFilter] = useState("todos"); // 'todos' | 'pendiente_pago' | 'aprobado' | 'activo'

  // Mensaje / Toast de acción
  const [actionAlert, setActionAlert] = useState(null);

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [calendarClient, setCalendarClient] = useState(null); // Cliente para el modal de calendario de fechas

  // Estado del formulario de fechas de calendario
  const [datesForm, setDatesForm] = useState({
    fechaValidacionGratuidad: "",
    fechaEntallado: "",
    entalladoStatus: "pendiente",
    entalladoDetalle: "",
    fechaLimpieza: "",
    fechaProximoMantenimiento: "",
    notes: "",
  });

  // Estado del formulario para nuevo cliente
  const todayStr = new Date().toISOString().split("T")[0];
  const [newClientData, setNewClientData] = useState({
    dni: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    planType: "plus", // 'cortesia' o 'plus'
    immediateApproval: false,
    orderId: "",
    productName: "Anillo Solitario Platino",
    productMetal: "Oro 18K",
    paymentMethod: "BCP",
    amountPaid: 90,
    fechaValidacionGratuidad: todayStr,
    fechaEntallado: "",
    entalladoStatus: "pendiente",
    entalladoDetalle: "",
    fechaLimpieza: "",
    fechaProximoMantenimiento: "",
    notes: "",
  });

  // Sincronizar reactivamente si cambia la configuración o los clientes
  useEffect(() => {
    const handleConfigUpdate = () => {
      setConfig(getPlatinoCareConfig());
    };
    const handleClientsUpdate = () => {
      setClients(getPlatinoCareClients());
    };

    window.addEventListener("platino_care_updated", handleConfigUpdate);
    window.addEventListener("platino_care_clients_updated", handleClientsUpdate);

    return () => {
      window.removeEventListener("platino_care_updated", handleConfigUpdate);
      window.removeEventListener("platino_care_clients_updated", handleClientsUpdate);
    };
  }, []);

  const showAlert = (message, type = "success") => {
    setActionAlert({ message, type });
    setTimeout(() => {
      setActionAlert(null);
    }, 4500);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes("/")) return dateStr;
    try {
      const parts = dateStr.split("T")[0].split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
        const monthName = months[parseInt(m, 10) - 1] || m;
        return `${d} ${monthName} ${y}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleCopyDni = (dni) => {
    if (!dni) return;
    navigator.clipboard.writeText(String(dni).trim());
    showAlert(`✓ DNI ${dni} copiado al portapapeles.`, "info");
  };

  // Filtrado reactivo de clientes
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = clientSearchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.dni && c.dni.toLowerCase().includes(q)) ||
        (c.clientName && c.clientName.toLowerCase().includes(q)) ||
        (c.orderId && c.orderId.toLowerCase().includes(q)) ||
        (c.productName && c.productName.toLowerCase().includes(q)) ||
        (c.clientEmail && c.clientEmail.toLowerCase().includes(q));

      const matchPlan =
        clientPlanFilter === "todos" || c.planType === clientPlanFilter;

      const matchStatus =
        clientStatusFilter === "todos" ||
        (clientStatusFilter === "pendiente_pago" && c.status === "pendiente_pago") ||
        (clientStatusFilter === "aprobado" && (c.status === "aprobado" || c.status === "activo")) ||
        (clientStatusFilter === "activo" && c.status === "activo");

      return matchSearch && matchPlan && matchStatus;
    });
  }, [clients, clientSearchTerm, clientPlanFilter, clientStatusFilter]);

  // Contadores y métricas rápidas
  const totalCount = clients.length;
  const cortesiasCount = clients.filter((c) => c.planType === "cortesia").length;
  const premiumApprovedCount = clients.filter(
    (c) => c.planType === "plus" && c.status === "aprobado"
  ).length;
  const pendingPaymentCount = clients.filter(
    (c) => c.planType === "plus" && c.status === "pendiente_pago"
  ).length;

  // Acciones sobre clientes
  const handleApprovePayment = (client) => {
    const adminName = isMaster ? "Vladimir (Master Admin)" : "Administración Platino";
    const confirmed = window.confirm(
      `¿Confirmar que el pago de S/. ${client.amountPaid || 90} de ${client.clientName} (DNI ${client.dni}) ha sido verificado con éxito?\n\nAl confirmar, se activarán inmediatamente los beneficios del Plan Platino Care +.`
    );
    if (!confirmed) return;

    const updated = approvePlatinoCareClientPayment(client.id, adminName);
    if (updated) {
      setClients(getPlatinoCareClients());
      if (selectedClientDetail && selectedClientDetail.id === client.id) {
        setSelectedClientDetail(updated);
      }
      showAlert(
        `✓ Pago de ${client.clientName} (DNI ${client.dni}) confirmado con éxito. Beneficios activados.`,
        "success"
      );
    }
  };

  const handleOpenCalendarModal = (client) => {
    setCalendarClient(client);
    setDatesForm({
      fechaValidacionGratuidad: client.fechaValidacionGratuidad || todayStr,
      fechaEntallado: client.fechaEntallado || "",
      entalladoStatus: client.entalladoStatus || "pendiente",
      entalladoDetalle: client.entalladoDetalle || "",
      fechaLimpieza: client.fechaLimpieza || "",
      fechaProximoMantenimiento: client.fechaProximoMantenimiento || "",
      notes: client.notes || "",
    });
  };

  const handleSaveCalendarDates = (e) => {
    e.preventDefault();
    if (!calendarClient) return;

    const updated = updatePlatinoCareClientDates(calendarClient.id, datesForm);
    if (updated) {
      setClients(getPlatinoCareClients());
      if (selectedClientDetail && selectedClientDetail.id === calendarClient.id) {
        setSelectedClientDetail(updated);
      }
      setCalendarClient(null);
      showAlert(`✓ Fechas en calendario actualizadas para ${updated.clientName} (DNI ${updated.dni}).`, "success");
    }
  };

  const handleDeleteClient = (client) => {
    if (
      window.confirm(
        `¿Eliminar el registro de Platino Care para ${client.clientName} (DNI: ${client.dni})? Esta acción no se puede deshacer.`
      )
    ) {
      deletePlatinoCareClient(client.id);
      setClients(getPlatinoCareClients());
      if (selectedClientDetail && selectedClientDetail.id === client.id) {
        setSelectedClientDetail(null);
      }
      if (calendarClient && calendarClient.id === client.id) {
        setCalendarClient(null);
      }
      showAlert(`Registro de ${client.clientName} eliminado del sistema.`, "info");
    }
  };

  const handleCreateClientSubmit = (e) => {
    e.preventDefault();
    if (!newClientData.dni.trim() || !newClientData.clientName.trim()) {
      alert("Por favor completa el DNI y el Nombre del cliente.");
      return;
    }

    const reg = registerPlatinoCareClient({
      dni: newClientData.dni.trim(),
      clientName: newClientData.clientName.trim(),
      clientEmail: newClientData.clientEmail.trim(),
      clientPhone: newClientData.clientPhone.trim(),
      planType: newClientData.planType,
      orderId: newClientData.orderId.trim() || `PLT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: newClientData.productName.trim() || "Joya Platino Perú",
      productMetal: newClientData.productMetal.trim() || "Oro 18K",
      paymentMethod: newClientData.paymentMethod,
      amountPaid: newClientData.planType === "plus" ? Number(newClientData.amountPaid) || 90 : 0,
      fechaValidacionGratuidad: newClientData.planType === "cortesia" ? newClientData.fechaValidacionGratuidad : null,
      fechaEntallado: newClientData.fechaEntallado || null,
      entalladoStatus: newClientData.entalladoStatus || "pendiente",
      entalladoDetalle: newClientData.entalladoDetalle || "",
      fechaLimpieza: newClientData.fechaLimpieza || null,
      fechaProximoMantenimiento: newClientData.fechaProximoMantenimiento || null,
      notes: newClientData.notes.trim(),
    });

    if (newClientData.planType === "plus" && newClientData.immediateApproval) {
      approvePlatinoCareClientPayment(
        reg.id,
        isMaster ? "Vladimir (Master Admin)" : "Administración Platino"
      );
    }

    setClients(getPlatinoCareClients());
    setShowAddModal(false);
    showAlert(
      `✓ Cliente ${newClientData.clientName} (DNI ${newClientData.dni}) registrado con éxito en Platino Care.`,
      "success"
    );

    // Resetear formulario
    setNewClientData({
      dni: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      planType: "plus",
      immediateApproval: false,
      orderId: "",
      productName: "Anillo Solitario Platino",
      productMetal: "Oro 18K",
      paymentMethod: "BCP",
      amountPaid: 90,
      fechaValidacionGratuidad: todayStr,
      fechaEntallado: "",
      entalladoStatus: "pendiente",
      entalladoDetalle: "",
      fechaLimpieza: "",
      fechaProximoMantenimiento: "",
      notes: "",
    });
  };

  const handleExportCSV = () => {
    if (clients.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }
    const headers = ["DNI", "Cliente", "Telefono", "Email", "Plan", "Fecha Gratuidad", "Entallado Fecha", "Entallado Estado", "Limpieza Fecha", "Estado Pago", "Monto S/.", "Pedido", "Joya"];
    const rows = clients.map((c) => [
      c.dni,
      `"${c.clientName || ""}"`,
      `"${c.clientPhone || ""}"`,
      `"${c.clientEmail || ""}"`,
      c.planType === "plus" ? "Platino Care +" : "Plan Gratuito",
      c.fechaValidacionGratuidad || "-",
      c.fechaEntallado || "-",
      c.entalladoStatus || "-",
      c.fechaLimpieza || "-",
      c.status,
      c.amountPaid || 0,
      c.orderId || "-",
      `"${c.productName || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platino_care_garantias_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Guardar configuración de tarifas y textos
  const handleSaveConfig = (e) => {
    e?.preventDefault();
    const updated = savePlatinoCareConfig(config);
    setConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetConfig = () => {
    if (
      window.confirm(
        "¿Deseas restablecer todos los textos y el precio de Platino Care a los valores originales de fábrica?"
      )
    ) {
      const reset = resetPlatinoCareConfig();
      setConfig(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleBenefitChange = (index, field, value) => {
    const newBenefits = [...config.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setConfig({ ...config, benefits: newBenefits });
  };

  const handleAddBenefit = () => {
    const newId = Date.now();
    setConfig({
      ...config,
      benefits: [
        ...config.benefits,
        {
          id: newId,
          title: "Nuevo beneficio de garantía",
          content: "Detalle de cobertura técnica o mantenimiento especializado para la joya.",
          icon: "bi-patch-check-fill",
        },
      ],
    });
  };

  const handleRemoveBenefit = (index) => {
    if (config.benefits.length <= 1) {
      alert("Debe existir al menos un beneficio de garantía registrado.");
      return;
    }
    const newBenefits = config.benefits.filter((_, idx) => idx !== index);
    setConfig({ ...config, benefits: newBenefits });
  };

  return (
    <div className="admin-content-card" style={{ maxWidth: "1380px", margin: "0 auto" }}>
      {/* Encabezado Principal */}
      <div
        style={{
          background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
          color: "#ffffff",
          padding: "26px 30px",
          borderRadius: "12px",
          marginBottom: "22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 10px 25px -5px rgba(17, 59, 58, 0.25)",
        }}
      >
        <div style={{ maxWidth: "780px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                background: "rgba(198, 172, 127, 0.22)",
                color: "#C6AC7F",
                border: "1px solid rgba(198, 172, 127, 0.45)",
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <i className="bi bi-shield-fill-check"></i> PROGRAMA DE GARANTÍA VITALICIA
            </span>
            <span
              style={{
                background: "#22c55e",
                color: "#ffffff",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "10.5px",
                fontWeight: "700",
              }}
            >
              CONTROL POR DNI & CALENDARIO
            </span>
            {pendingPaymentCount > 0 && (
              <span
                style={{
                  background: "#f59e0b",
                  color: "#0f172a",
                  padding: "2px 9px",
                  borderRadius: "10px",
                  fontSize: "10.5px",
                  fontWeight: "800",
                }}
              >
                <i className="bi bi-bell-fill"></i> {pendingPaymentCount} PAGO(S) POR CONFIRMAR
              </span>
            )}
          </div>
          <h2 style={{ fontSize: "26px", margin: "0 0 6px 0", color: "#ffffff", fontWeight: "600" }}>
            Platino Care: Validación por DNI y Control de Garantías
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255, 255, 255, 0.88)", lineHeight: "1.5" }}>
            Supervisa los clientes por DNI, valida quién adquirió el <strong>Plan Gratuito</strong> (marcando en calendario sus fechas de gratuidad, entallado y limpieza de taller) y administra los clientes con <strong>Plan Premium</strong> y la confirmación de sus pagos.
          </p>
        </div>

        {/* Acciones directas de cabecera */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {activeSubTab === "clients" ? (
            <>
              <button
                type="button"
                onClick={handleExportCSV}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <i className="bi bi-file-earmark-excel"></i> Exportar CSV
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{
                  background: "#C6AC7F",
                  color: "#113B3A",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                  transition: "all 0.2s",
                }}
              >
                <i className="bi bi-person-plus-fill"></i> + Registrar / Validar por DNI
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleResetConfig}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  padding: "9px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Restablecer
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                style={{
                  background: "#C6AC7F",
                  color: "#113B3A",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                }}
              >
                <i className="bi bi-floppy-fill"></i> Guardar Tarifas
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selector de Sub-Pestañas */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: "24px",
          paddingBottom: "2px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab("clients")}
          style={{
            background: activeSubTab === "clients" ? "#113B3A" : "transparent",
            color: activeSubTab === "clients" ? "#ffffff" : "#475569",
            border: "none",
            borderRadius: "8px 8px 0 0",
            padding: "11px 22px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            transition: "all 0.2s",
          }}
        >
          <i className="bi bi-person-vcard-fill" style={{ color: activeSubTab === "clients" ? "#C6AC7F" : "#64748b" }}></i>
          Validación de Clientes por DNI & Aprobación de Pagos
          {pendingPaymentCount > 0 && (
            <span
              style={{
                background: "#f59e0b",
                color: "#113B3A",
                padding: "1px 7px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "800",
                marginLeft: "4px",
              }}
            >
              {pendingPaymentCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("config")}
          style={{
            background: activeSubTab === "config" ? "#113B3A" : "transparent",
            color: activeSubTab === "config" ? "#ffffff" : "#475569",
            border: "none",
            borderRadius: "8px 8px 0 0",
            padding: "11px 22px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            transition: "all 0.2s",
          }}
        >
          <i className="bi bi-sliders" style={{ color: activeSubTab === "config" ? "#C6AC7F" : "#64748b" }}></i>
          Tarifas, Textos y Coberturas Generales
        </button>
      </div>

      {/* Alerta de Notificación Temporal */}
      {actionAlert && (
        <div
          style={{
            background:
              actionAlert.type === "success"
                ? "#F2F9F2"
                : actionAlert.type === "warning"
                ? "#fffbeb"
                : "#eff6ff",
            border: `1.5px solid ${
              actionAlert.type === "success"
                ? "#113B3A"
                : actionAlert.type === "warning"
                ? "#f59e0b"
                : "#3b82f6"
            }`,
            color: "#113B3A",
            padding: "13px 18px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontWeight: "600",
            fontSize: "13.5px",
            boxShadow: "0 4px 12px rgba(17, 59, 58, 0.08)",
          }}
        >
          <i
            className={`bi ${
              actionAlert.type === "success"
                ? "bi-check-circle-fill"
                : actionAlert.type === "warning"
                ? "bi-exclamation-triangle-fill"
                : "bi-info-circle-fill"
            }`}
            style={{
              fontSize: "18px",
              color:
                actionAlert.type === "success"
                  ? "#113B3A"
                  : actionAlert.type === "warning"
                  ? "#f59e0b"
                  : "#3b82f6",
            }}
          ></i>
          <span>{actionAlert.message}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-PESTAÑA 1: VALIDACIÓN DE CLIENTES POR DNI & APROBACIÓN DE PAGOS   */}
      {/* ===================================================================== */}
      {activeSubTab === "clients" && (
        <div>
          {/* Métricas y Tarjetas KPI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "16px",
              marginBottom: "22px",
            }}
          >
            {/* Total Clientes */}
            <div
              onClick={() => {
                setClientPlanFilter("todos");
                setClientStatusFilter("todos");
              }}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  background: "#F2F9F2",
                  color: "#113B3A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Total Registros DNI
                </span>
                <h4 style={{ margin: "2px 0 0 0", fontSize: "21px", fontWeight: "800", color: "#113B3A" }}>
                  {totalCount}
                </h4>
              </div>
            </div>

            {/* Plan Gratuito Cortesía */}
            <div
              onClick={() => {
                setClientPlanFilter("cortesia");
                setClientStatusFilter("todos");
              }}
              style={{
                background: clientPlanFilter === "cortesia" ? "#f0fdf4" : "#ffffff",
                border: clientPlanFilter === "cortesia" ? "2px solid #16a34a" : "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <i className="bi bi-gift-fill"></i>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Gratuitos Validados (S/. 0)
                </span>
                <h4 style={{ margin: "2px 0 0 0", fontSize: "21px", fontWeight: "800", color: "#16a34a" }}>
                  {cortesiasCount}
                </h4>
              </div>
            </div>

            {/* Plan Premium Aprobados */}
            <div
              onClick={() => {
                setClientPlanFilter("plus");
                setClientStatusFilter("aprobado");
              }}
              style={{
                background: clientPlanFilter === "plus" && clientStatusFilter === "aprobado" ? "#FDF9F2" : "#ffffff",
                border: clientPlanFilter === "plus" && clientStatusFilter === "aprobado" ? "2px solid #C6AC7F" : "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  background: "#FDF9F2",
                  color: "#C6AC7F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  border: "1px solid #C6AC7F",
                }}
              >
                <i className="bi bi-patch-check-fill"></i>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Premium Pagados (S/. 90)
                </span>
                <h4 style={{ margin: "2px 0 0 0", fontSize: "21px", fontWeight: "800", color: "#113B3A" }}>
                  {premiumApprovedCount}
                </h4>
              </div>
            </div>

            {/* Pendientes de Pago */}
            <div
              onClick={() => {
                setClientPlanFilter("plus");
                setClientStatusFilter("pendiente_pago");
              }}
              style={{
                background: pendingPaymentCount > 0 ? "#fffbeb" : "#ffffff",
                border: clientStatusFilter === "pendiente_pago" ? "2px solid #b45309" : pendingPaymentCount > 0 ? "1.5px solid #f59e0b" : "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "10px",
                  background: pendingPaymentCount > 0 ? "#fef3c7" : "#f1f5f9",
                  color: pendingPaymentCount > 0 ? "#b45309" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Pagos Pendientes
                </span>
                <h4
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "21px",
                    fontWeight: "800",
                    color: pendingPaymentCount > 0 ? "#b45309" : "#64748b",
                  }}
                >
                  {pendingPaymentCount}
                </h4>
              </div>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "14px 18px",
              marginBottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            {/* Buscador */}
            <div style={{ flex: "1 1 300px", position: "relative" }}>
              <i
                className="bi bi-search"
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94a3b8", fontSize: "14px" }}
              ></i>
              <input
                type="text"
                placeholder="Buscar por DNI, cliente, joya o código..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "7px",
                  fontSize: "13.5px",
                  color: "#1e293b",
                  outline: "none",
                }}
              />
            </div>

            {/* Filtros Rápidos */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Plan:</span>
                <select
                  value={clientPlanFilter}
                  onChange={(e) => setClientPlanFilter(e.target.value)}
                  style={{
                    padding: "7px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#113B3A",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="todos">Todos los Planes</option>
                  <option value="cortesia">Plan Gratuito (Cortesía)</option>
                  <option value="plus">Plan Premium (Platino Care +)</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Estado:</span>
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                  style={{
                    padding: "7px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#113B3A",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="pendiente_pago">Pago Pendiente</option>
                  <option value="aprobado">Pago Aprobado / Activo</option>
                </select>
              </div>

              {(clientSearchTerm || clientPlanFilter !== "todos" || clientStatusFilter !== "todos") && (
                <button
                  type="button"
                  onClick={() => {
                    setClientSearchTerm("");
                    setClientPlanFilter("todos");
                    setClientStatusFilter("todos");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "4px 8px",
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Clientes Platino Care Mejorada */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F2F9F2", borderBottom: "2px solid #cbd5e1", color: "#113B3A" }}>
                    <th style={{ padding: "14px 16px", fontWeight: "700" }}>DNI / Cliente</th>
                    <th style={{ padding: "14px 16px", fontWeight: "700" }}>Pedido / Joya</th>
                    <th style={{ padding: "14px 16px", fontWeight: "700" }}>Plan Elegido</th>
                    <th style={{ padding: "14px 16px", fontWeight: "700" }}>Fechas en Calendario & Beneficios</th>
                    <th style={{ padding: "14px 16px", fontWeight: "700" }}>Estado de Pago & Cobertura</th>
                    <th style={{ padding: "14px 16px", fontWeight: "700", textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                        <i className="bi bi-inbox" style={{ fontSize: "34px", display: "block", marginBottom: "8px", color: "#cbd5e1" }}></i>
                        No se encontraron registros de clientes con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const isPlus = client.planType === "plus";
                      const isPending = isPlus && client.status === "pendiente_pago";
                      const isApproved = isPlus && client.status === "aprobado";
                      const isGratuito = client.planType === "cortesia";

                      return (
                        <tr
                          key={client.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: isPending ? "#fffef9" : "#ffffff",
                            transition: "background 0.15s",
                          }}
                        >
                          {/* Columna: DNI / Cliente */}
                          <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "13.5px",
                                  fontWeight: "800",
                                  background: "#f1f5f9",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  color: "#0f172a",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {client.dni}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyDni(client.dni)}
                                title="Copiar DNI"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                  padding: "2px",
                                  fontSize: "13px",
                                }}
                              >
                                <i className="bi bi-copy"></i>
                              </button>
                            </div>
                            <div style={{ fontWeight: "700", color: "#113B3A", fontSize: "14px" }}>
                              {client.clientName}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              {client.clientPhone && (
                                <a
                                  href={`https://wa.me/${client.clientPhone.replace(/\D/g, "")}?text=Estimado(a)%20${encodeURIComponent(client.clientName)},%20le%20saludamos%20de%20Platino%20Perú%20respecto%20a%20su%20garantía%20Platino%20Care.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    color: "#16a34a",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                  title="Enviar WhatsApp"
                                >
                                  <i className="bi bi-whatsapp"></i> {client.clientPhone}
                                </a>
                              )}
                              {client.clientEmail && <span>• {client.clientEmail}</span>}
                            </div>
                          </td>

                          {/* Columna: Pedido / Joya */}
                          <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              <span
                                style={{
                                  background: "#113B3A",
                                  color: "#ffffff",
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  fontFamily: "monospace",
                                }}
                              >
                                {client.orderId || "S/N"}
                              </span>
                            </div>
                            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "13.5px" }}>
                              {client.productName || "Joya Platino"}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#a08453", fontWeight: "700", marginTop: "1px" }}>
                              <i className="bi bi-gem"></i> {client.productMetal || "Oro 18K"}
                            </div>
                          </td>

                          {/* Columna: Plan Elegido */}
                          <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                            {isPlus ? (
                              <div>
                                <span
                                  style={{
                                    background: "#FDF9F2",
                                    color: "#113B3A",
                                    border: "1.5px solid #C6AC7F",
                                    padding: "4px 9px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "800",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <i className="bi bi-shield-fill-check" style={{ color: "#C6AC7F" }}></i>
                                  PLATINO CARE +
                                </span>
                                <div style={{ fontSize: "11.5px", color: "#a08453", fontWeight: "700", marginTop: "3px" }}>
                                  Pago Único S/. {client.amountPaid || 90}
                                </div>
                                <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                                  Cobertura Total Plus
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span
                                  style={{
                                    background: "#f0fdf4",
                                    color: "#166534",
                                    border: "1px solid #bbf7d0",
                                    padding: "4px 9px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <i className="bi bi-gift-fill" style={{ color: "#16a34a" }}></i>
                                  PLAN GRATUITO
                                </span>
                                <div style={{ fontSize: "11.5px", color: "#16a34a", fontWeight: "700", marginTop: "3px" }}>
                                  Cortesía S/. 0
                                </div>
                                <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                                  Entallado (1x) • Limpieza • Ley
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Columna: Fechas en Calendario & Beneficios */}
                          <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {/* Fecha de Validación de Gratuidad / Registro */}
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#113B3A" }}>
                                  <i className="bi bi-calendar-event" style={{ color: "#C6AC7F" }}></i> {isGratuito ? "Gratuidad:" : "Registro:"}
                                </span>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                                  {formatDateDisplay(isGratuito ? client.fechaValidacionGratuidad : client.fechaRegistro) || "Sin fecha"}
                                </span>
                              </div>

                              {/* Beneficio 1: Entallado de Cortesía */}
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "11px", color: "#64748b" }}>
                                  <i className="bi bi-arrows-angle-expand"></i> Entallado (1x):
                                </span>
                                {client.fechaEntallado ? (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      color: "#166534",
                                      background: "#f0fdf4",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    {formatDateDisplay(client.fechaEntallado)} (Realizado)
                                  </span>
                                ) : (
                                  <span style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>
                                    Disponible (90 días)
                                  </span>
                                )}
                              </div>

                              {/* Beneficio 2: Limpieza Ultrasónica */}
                              {client.fechaLimpieza && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                                    <i className="bi bi-stars"></i> Limpieza:
                                  </span>
                                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#0284c7" }}>
                                    {formatDateDisplay(client.fechaLimpieza)}
                                  </span>
                                </div>
                              )}

                              {/* Botón directo para marcar en calendario */}
                              <button
                                type="button"
                                onClick={() => handleOpenCalendarModal(client)}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #cbd5e1",
                                  color: "#113B3A",
                                  padding: "3px 8px",
                                  borderRadius: "5px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  marginTop: "3px",
                                  width: "fit-content",
                                }}
                              >
                                <i className="bi bi-calendar-check-fill" style={{ color: "#C6AC7F" }}></i>
                                Marcar en Calendario
                              </button>
                            </div>
                          </td>

                          {/* Columna: Estado de Pago & Cobertura */}
                          <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                            {isPending && (
                              <div>
                                <span
                                  style={{
                                    background: "#fef3c7",
                                    color: "#b45309",
                                    border: "1.5px solid #f59e0b",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <i className="bi bi-hourglass-top"></i> PAGO PENDIENTE (S/. 90)
                                </span>
                                <div
                                  style={{
                                    marginTop: "5px",
                                    fontSize: "11.5px",
                                    color: "#92400e",
                                    fontWeight: "600",
                                  }}
                                >
                                  Beneficios pendientes de pago
                                </div>
                              </div>
                            )}

                            {isApproved && (
                              <div>
                                <span
                                  style={{
                                    background: "#dcfce7",
                                    color: "#166534",
                                    border: "1px solid #86efac",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <i className="bi bi-check-circle-fill"></i> PAGO CONFIRMADO
                                </span>
                                <div
                                  style={{
                                    marginTop: "4px",
                                    fontSize: "11.5px",
                                    color: "#166534",
                                    fontWeight: "700",
                                  }}
                                >
                                  Beneficios Activos (Platino Care +)
                                </div>
                              </div>
                            )}

                            {isGratuito && (
                              <div>
                                <span
                                  style={{
                                    background: "#f1f5f9",
                                    color: "#113B3A",
                                    border: "1px solid #cbd5e1",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <i className="bi bi-check-lg"></i> GRATUIDAD VALIDADA
                                </span>
                                <div
                                  style={{
                                    marginTop: "4px",
                                    fontSize: "11.5px",
                                    color: "#166534",
                                    fontWeight: "600",
                                  }}
                                >
                                  Beneficios de Taller Activos
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Columna: Acciones */}
                          <td style={{ padding: "14px 16px", verticalAlign: "middle", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              {/* Botón directo de confirmar pago para clientes pendientes */}
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleApprovePayment(client)}
                                  title="Confirmar Pago y Activar Beneficios"
                                  style={{
                                    background: "#16a34a",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "7px 13px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
                                  }}
                                >
                                  <i className="bi bi-check2-circle"></i> Confirmar Pago
                                </button>
                              )}

                              {/* Botón Ver Ficha Detallada */}
                              <button
                                type="button"
                                onClick={() => setSelectedClientDetail(client)}
                                title="Ver Ficha Completa"
                                style={{
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  border: "1px solid #cbd5e1",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <i className="bi bi-eye"></i> Detalle
                              </button>

                              {/* Botón Eliminar */}
                              <button
                                type="button"
                                onClick={() => handleDeleteClient(client)}
                                title="Eliminar Registro"
                                style={{
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  border: "1px solid #fca5a5",
                                  padding: "6px 9px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-PESTAÑA 2: CONFIGURACIÓN GENERAL DE TARIFAS Y COBERTURAS          */}
      {/* ===================================================================== */}
      {activeSubTab === "config" && (
        <div>
          {/* Alerta de Éxito al Guardar Configuración */}
          {saveSuccess && (
            <div
              style={{
                background: "#F2F9F2",
                border: "1.5px solid #113B3A",
                color: "#113B3A",
                padding: "14px 20px",
                borderRadius: "8px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(17, 59, 58, 0.08)",
              }}
            >
              <i className="bi bi-check-circle-fill" style={{ fontSize: "20px", color: "#113B3A" }}></i>
              <span>
                ¡Cambios guardados con éxito! La ficha del producto y el carrito ahora muestran las nuevas tarifas y coberturas de Platino Care.
              </span>
            </div>
          )}

          {/* Grid: Editor a la Izquierda + Live Preview a la Derecha */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "28px", alignItems: "start" }}>
            {/* COLUMNA 1: FORMULARIO DE EDICIÓN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Tarifas y Planes */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "#113B3A",
                    margin: "0 0 16px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bi bi-tags-fill" style={{ color: "#C6AC7F" }}></i>
                  Precios y Configuración de Planes
                </h3>

                {/* Plan Plus */}
                <div
                  style={{
                    background: "#FDF9F2",
                    border: "1.5px solid #C6AC7F",
                    borderRadius: "8px",
                    padding: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "700", color: "#113B3A", fontSize: "14.5px" }}>
                      PLAN PLATINO CARE + (COBERTURA TOTAL)
                    </span>
                    <span
                      style={{
                        background: "#113B3A",
                        color: "#C6AC7F",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      UPGRADE DE PAGO
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                        Precio de Platino Care + (S/.)
                      </label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <span style={{ position: "absolute", left: "10px", fontWeight: "700", color: "#113B3A" }}>S/.</span>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={config.plus.price}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setConfig({
                              ...config,
                              plus: {
                                ...config.plus,
                                price: val,
                                priceFormatted: `S/. ${val}`,
                                subtitle: `PAGO ÚNICO S/. ${val}`,
                              },
                            });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 38px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#113B3A",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        value={config.plus.title}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            plus: { ...config.plus, title: e.target.value },
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                      Descripción / Beneficios Exclusivos de Platino Care +
                    </label>
                    <textarea
                      rows="3"
                      value={config.plus.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          plus: { ...config.plus, description: e.target.value },
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        lineHeight: "1.4",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>

                {/* Plan Cortesía */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "700", color: "#334155", fontSize: "14px" }}>
                      PLAN PLATINO CARE CORTESÍA (INCLUIDO)
                    </span>
                    <span
                      style={{
                        background: "#e2e8f0",
                        color: "#475569",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      GRATIS S/. 0
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        value={config.cortesia.title}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            cortesia: { ...config.cortesia, title: e.target.value },
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                        Subtítulo / Etiqueta de Cortesía
                      </label>
                      <input
                        type="text"
                        value={config.cortesia.subtitle}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            cortesia: { ...config.cortesia, subtitle: e.target.value },
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                      Descripción del Plan Cortesía
                    </label>
                    <textarea
                      rows="2"
                      value={config.cortesia.description}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          cortesia: { ...config.cortesia, description: e.target.value },
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        lineHeight: "1.4",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Beneficios y Acordeones del Producto */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#113B3A",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="bi bi-list-check" style={{ color: "#C6AC7F" }}></i>
                    Coberturas y Acordeones en Ficha de Joya
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    style={{
                      background: "#F2F9F2",
                      color: "#113B3A",
                      border: "1px solid #113B3A",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="bi bi-plus-circle-fill"></i> Añadir Cobertura
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {config.benefits.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      style={{
                        background: "#fbfcfb",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "16px",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#113B3A" }}>
                          Acordeón #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          title="Eliminar este beneficio"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "14px",
                            padding: "2px 6px",
                          }}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                          Título de la Cobertura
                        </label>
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => handleBenefitChange(idx, "title", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "5px",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#113B3A",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                          Explicación / Detalle de la Garantía
                        </label>
                        <textarea
                          rows="2"
                          value={b.content}
                          onChange={(e) => handleBenefitChange(idx, "content", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "5px",
                            fontSize: "12.5px",
                            lineHeight: "1.4",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Términos y Cláusula */}
                <div style={{ marginTop: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                    Nota Legal / Condiciones al Pie
                  </label>
                  <input
                    type="text"
                    value={config.termsNote}
                    onChange={(e) => setConfig({ ...config, termsNote: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* COLUMNA 2: LIVE PREVIEW (CÓMO LO VE EL CLIENTE) */}
            <div style={{ position: "sticky", top: "100px" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #C6AC7F",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(17, 59, 58, 0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "14px",
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bi bi-eye-fill" style={{ color: "#C6AC7F", fontSize: "18px" }}></i>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#113B3A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Vista Previa en Ficha de Joya
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "#FDF9F2",
                      color: "#a08453",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: "700",
                    }}
                  >
                    Paso 3 de Compra
                  </span>
                </div>

                {/* Banner Platino Care Simulado */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#FDF9F2",
                    border: "1px solid rgba(198, 172, 127, 0.4)",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#113B3A",
                      color: "#C6AC7F",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#113B3A" }}>
                      {config.name}
                    </h4>
                    <span style={{ fontSize: "10.5px", color: "#a08453", fontWeight: "700", letterSpacing: "0.06em" }}>
                      {config.tagline}
                    </span>
                  </div>
                </div>

                {/* Acordeones Interactivos en Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                  {config.benefits.map((item, idx) => {
                    const isOpen = openPreviewAccordion === (idx + 1);
                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenPreviewAccordion(isOpen ? null : idx + 1)}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            background: isOpen ? "#F2F9F2" : "#ffffff",
                            border: "none",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12.5px",
                            fontWeight: "600",
                            color: "#113B3A",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={`bi ${item.icon || "bi-check-circle"}`} style={{ color: "#C6AC7F" }}></i>
                            {item.title}
                          </span>
                          <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ fontSize: "11px", color: "#64748b" }}></i>
                        </button>
                        {isOpen && (
                          <div
                            style={{
                              padding: "10px 14px",
                              background: "#ffffff",
                              fontSize: "12px",
                              color: "#475569",
                              lineHeight: "1.45",
                              borderTop: "1px solid #f1f5f9",
                            }}
                          >
                            {item.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Botones de Selección de Plan en Preview */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  {/* Botón Plus */}
                  <button
                    type="button"
                    onClick={() => setPreviewPlan("plus")}
                    style={{
                      border: previewPlan === "plus" ? "2px solid #113B3A" : "1px solid #cbd5e1",
                      background: previewPlan === "plus" ? "#F2F9F2" : "#ffffff",
                      borderRadius: "8px",
                      padding: "12px 10px",
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#113B3A" }}>
                      {config.plus.title}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "#113B3A",
                        color: "#C6AC7F",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      S/. {config.plus.price}
                    </span>
                  </button>

                  {/* Botón Cortesía */}
                  <button
                    type="button"
                    onClick={() => setPreviewPlan("cortesia")}
                    style={{
                      border: previewPlan === "cortesia" ? "2px solid #113B3A" : "1px solid #cbd5e1",
                      background: previewPlan === "cortesia" ? "#F2F9F2" : "#ffffff",
                      borderRadius: "8px",
                      padding: "12px 10px",
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#113B3A" }}>
                      {config.cortesia.title}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#64748b",
                      }}
                    >
                      {config.cortesia.subtitle}
                    </span>
                  </button>
                </div>

                {/* Impacto en el Total */}
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#475569" }}>
                    Seleccionado:{" "}
                    <strong>{previewPlan === "plus" ? "Platino Care +" : "Platino Care Cortesía"}</strong>
                  </span>
                  <span style={{ fontWeight: "800", color: "#113B3A", fontSize: "13px" }}>
                    {previewPlan === "plus" ? `+ S/. ${config.plus.price}` : "+ S/. 0"}
                  </span>
                </div>

                {config.termsNote && (
                  <p style={{ margin: "10px 0 0 0", fontSize: "10.5px", color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>
                    {config.termsNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: REGISTRAR / VALIDAR CLIENTE POR DNI                           */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000005, // Garantiza estar por encima de la barra de navegación del sitio
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              position: "relative",
              background: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.4)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal Fija */}
            <div
              style={{
                background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                color: "#ffffff",
                padding: "18px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bi bi-person-vcard-fill" style={{ color: "#C6AC7F" }}></i>
                  Registrar / Validar Cliente Platino Care
                </h3>
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                  Asocia un DNI al Plan Gratuito (con sus fechas) o registra el Plan Premium
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "16px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Formulario con scroll propio */}
            <form onSubmit={handleCreateClientSubmit} style={{ padding: "22px 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#113B3A", marginBottom: "4px" }}>
                    DNI / Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 47829103"
                    value={newClientData.dni}
                    onChange={(e) => setNewClientData({ ...newClientData, dni: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      fontWeight: "700",
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#113B3A", marginBottom: "4px" }}>
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellidos"
                    value={newClientData.clientName}
                    onChange={(e) => setNewClientData({ ...newClientData, clientName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+51 912 345 678"
                    value={newClientData.clientPhone}
                    onChange={(e) => setNewClientData({ ...newClientData, clientPhone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.pe"
                    value={newClientData.clientEmail}
                    onChange={(e) => setNewClientData({ ...newClientData, clientEmail: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              {/* Selección de Plan */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#113B3A", marginBottom: "8px" }}>
                  Tipo de Plan Platino Care *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label
                    style={{
                      border: newClientData.planType === "cortesia" ? "2px solid #113B3A" : "1px solid #cbd5e1",
                      background: newClientData.planType === "cortesia" ? "#F2F9F2" : "#ffffff",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="radio"
                      name="modalPlanType"
                      checked={newClientData.planType === "cortesia"}
                      onChange={() => setNewClientData({ ...newClientData, planType: "cortesia" })}
                      style={{ marginTop: "3px" }}
                    />
                    <div>
                      <strong style={{ display: "block", fontSize: "13px", color: "#113B3A" }}>
                        Plan Gratuito (Cortesía)
                      </strong>
                      <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>
                        S/. 0 • Validación Inmediata
                      </span>
                    </div>
                  </label>

                  <label
                    style={{
                      border: newClientData.planType === "plus" ? "2px solid #113B3A" : "1px solid #cbd5e1",
                      background: newClientData.planType === "plus" ? "#FDF9F2" : "#ffffff",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="radio"
                      name="modalPlanType"
                      checked={newClientData.planType === "plus"}
                      onChange={() => setNewClientData({ ...newClientData, planType: "plus" })}
                      style={{ marginTop: "3px" }}
                    />
                    <div>
                      <strong style={{ display: "block", fontSize: "13px", color: "#113B3A" }}>
                        Plan Premium (Platino Care +)
                      </strong>
                      <span style={{ fontSize: "11px", color: "#a08453", fontWeight: "700" }}>
                        S/. 90 • Cobertura Plus Total
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Si es Gratuito: Selector de Calendario para Fecha de Gratuidad y Entallado */}
              {newClientData.planType === "cortesia" && (
                <div
                  style={{
                    background: "#F2F9F2",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: "8px",
                    padding: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <i className="bi bi-calendar3" style={{ color: "#166534", fontSize: "16px" }}></i>
                    <strong style={{ fontSize: "13px", color: "#113B3A" }}>
                      Fechas de Beneficios de Cortesía en Calendario
                    </strong>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#166534", marginBottom: "3px" }}>
                        Fecha Validación Gratuidad *
                      </label>
                      <input
                        type="date"
                        value={newClientData.fechaValidacionGratuidad}
                        onChange={(e) => setNewClientData({ ...newClientData, fechaValidacionGratuidad: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          border: "1px solid #86efac",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#113B3A",
                          background: "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#475569", marginBottom: "3px" }}>
                        Fecha Entallado 1x (Opcional)
                      </label>
                      <input
                        type="date"
                        value={newClientData.fechaEntallado}
                        onChange={(e) => setNewClientData({ ...newClientData, fechaEntallado: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "13px",
                          background: "#ffffff",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Si es Premium: Opción de registrar con pago ya recibido */}
              {newClientData.planType === "plus" && (
                <div
                  style={{
                    background: "#FDF9F2",
                    border: "1px solid #C6AC7F",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    marginBottom: "16px",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={newClientData.immediateApproval}
                      onChange={(e) => setNewClientData({ ...newClientData, immediateApproval: e.target.checked })}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <div>
                      <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#113B3A" }}>
                        ✓ Registrar con pago ya recibido (S/. 90)
                      </span>
                      <span style={{ display: "block", fontSize: "11px", color: "#78350f" }}>
                        Marca esta opción si el cliente ya abonó en tienda física o transferencia para activar sus beneficios de inmediato.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Datos de la joya / pedido */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Código de Pedido (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="PLT-2026-XXXX"
                    value={newClientData.orderId}
                    onChange={(e) => setNewClientData({ ...newClientData, orderId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Medio de Pago
                  </label>
                  <select
                    value={newClientData.paymentMethod}
                    onChange={(e) => setNewClientData({ ...newClientData, paymentMethod: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  >
                    <option value="BCP">BCP Transferencia</option>
                    <option value="BBVA">BBVA Transferencia</option>
                    <option value="Interbank">Interbank</option>
                    <option value="Yape">Yape / Plin</option>
                    <option value="IziPay">IziPay / Tarjeta</option>
                    <option value="Efectivo">Efectivo en Tienda</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Nombre de la Joya
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Anillo Solitario Secret Garden"
                    value={newClientData.productName}
                    onChange={(e) => setNewClientData({ ...newClientData, productName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                    Metal / Ley
                  </label>
                  <input
                    type="text"
                    placeholder="Oro 18K / Platino 950"
                    value={newClientData.productMetal}
                    onChange={(e) => setNewClientData({ ...newClientData, productMetal: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Notas / Observaciones
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalles de la garantía o validación..."
                  value={newClientData.notes}
                  onChange={(e) => setNewClientData({ ...newClientData, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Botones de acción del modal */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "9px 18px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#113B3A",
                    color: "#C6AC7F",
                    border: "none",
                    padding: "9px 22px",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Guardar y Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: GESTIÓN DE CALENDARIO DE FECHAS & BENEFICIOS DE TALLER       */}
      {/* ===================================================================== */}
      {calendarClient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000005,
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setCalendarClient(null)}
        >
          <div
            style={{
              position: "relative",
              background: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.4)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div
              style={{
                background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                color: "#ffffff",
                padding: "18px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bi bi-calendar3" style={{ color: "#C6AC7F" }}></i>
                  Calendario de Fechas & Beneficios en Taller
                </h3>
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.85)" }}>
                  Cliente: <strong>{calendarClient.clientName}</strong> (DNI: {calendarClient.dni})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCalendarClient(null)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "16px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Formulario de Fechas */}
            <form onSubmit={handleSaveCalendarDates} style={{ padding: "22px 24px", overflowY: "auto", flex: 1 }}>
              {/* Fecha Validación de Gratuidad */}
              <div style={{ marginBottom: "16px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#113B3A", marginBottom: "6px" }}>
                  <i className="bi bi-patch-check-fill" style={{ color: "#16a34a", marginRight: "6px" }}></i>
                  Fecha de Validación de Gratuidad (DNI)
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="date"
                    value={datesForm.fechaValidacionGratuidad}
                    onChange={(e) => setDatesForm({ ...datesForm, fechaValidacionGratuidad: e.target.value })}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      fontWeight: "700",
                      color: "#113B3A",
                      background: "#ffffff",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setDatesForm({ ...datesForm, fechaValidacionGratuidad: todayStr })}
                    style={{
                      background: "#e2e8f0",
                      border: "none",
                      color: "#334155",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Hoy
                  </button>
                </div>
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                  Fecha en la que el cliente validó su derecho de cortesía al adquirir su joya.
                </span>
              </div>

              {/* Beneficio: Entallado de Cortesía */}
              <div style={{ marginBottom: "16px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "#113B3A", margin: 0 }}>
                    <i className="bi bi-arrows-angle-expand" style={{ color: "#C6AC7F", marginRight: "6px" }}></i>
                    Fecha de Entallado de Cortesía (1 sola vez dentro de 90 días)
                  </label>
                  <select
                    value={datesForm.entalladoStatus}
                    onChange={(e) => setDatesForm({ ...datesForm, entalladoStatus: e.target.value })}
                    style={{
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      borderRadius: "5px",
                      border: "1px solid #cbd5e1",
                      color: datesForm.entalladoStatus === "realizado" ? "#166534" : "#475569",
                      background: datesForm.entalladoStatus === "realizado" ? "#f0fdf4" : "#ffffff",
                    }}
                  >
                    <option value="pendiente">Pendiente de uso</option>
                    <option value="realizado">Realizado en taller</option>
                    <option value="agendado">Agendado para visita</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>
                      Fecha en que se realizó / agendó:
                    </label>
                    <input
                      type="date"
                      value={datesForm.fechaEntallado}
                      onChange={(e) => setDatesForm({ ...datesForm, fechaEntallado: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        background: "#ffffff",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>
                      Detalle (ej. Talla 12 a 13 en Lima Centro):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Talla 12 a 13.5 (Sede Miraflores)"
                      value={datesForm.entalladoDetalle}
                      onChange={(e) => setDatesForm({ ...datesForm, entalladoDetalle: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        background: "#ffffff",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Beneficio: Limpiezas y Mantenimiento Ultrasónico */}
              <div style={{ marginBottom: "16px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#113B3A", marginBottom: "6px" }}>
                  <i className="bi bi-stars" style={{ color: "#0284c7", marginRight: "6px" }}></i>
                  Mantenimiento Ultrasónico & Limpieza Periódica
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>
                      Fecha Última Limpieza / Pulido:
                    </label>
                    <input
                      type="date"
                      value={datesForm.fechaLimpieza}
                      onChange={(e) => setDatesForm({ ...datesForm, fechaLimpieza: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        background: "#ffffff",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>
                      Próximo Mantenimiento Recomendado:
                    </label>
                    <input
                      type="date"
                      value={datesForm.fechaProximoMantenimiento}
                      onChange={(e) => setDatesForm({ ...datesForm, fechaProximoMantenimiento: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        background: "#ffffff",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Notas de Taller */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                  Bitácora de Taller / Historial de Intervenciones
                </label>
                <textarea
                  rows="2"
                  value={datesForm.notes}
                  onChange={(e) => setDatesForm({ ...datesForm, notes: e.target.value })}
                  placeholder="Detalles sobre el ajuste o condición de la joya..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Botones de Acción */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setCalendarClient(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "9px 18px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#113B3A",
                    color: "#C6AC7F",
                    border: "none",
                    padding: "9px 22px",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-calendar-check" style={{ marginRight: "6px" }}></i>
                  Guardar Fechas en Calendario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: VER FICHA DETALLADA DEL CLIENTE PLATINO CARE                 */}
      {/* ===================================================================== */}
      {selectedClientDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000005,
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setSelectedClientDetail(null)}
        >
          <div
            style={{
              position: "relative",
              background: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.4)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Ficha */}
            <div
              style={{
                background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                color: "#ffffff",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span
                    style={{
                      background: "#C6AC7F",
                      color: "#113B3A",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "800",
                      fontFamily: "monospace",
                    }}
                  >
                    DNI: {selectedClientDetail.dni}
                  </span>
                  <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.75)" }}>
                    ID: {selectedClientDetail.id}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#ffffff" }}>
                  {selectedClientDetail.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "16px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido de la Ficha */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Bloque Estado & Beneficios */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  background:
                    selectedClientDetail.planType === "plus" && selectedClientDetail.status === "pendiente_pago"
                      ? "#fffbeb"
                      : "#F2F9F2",
                  border:
                    selectedClientDetail.planType === "plus" && selectedClientDetail.status === "pendiente_pago"
                      ? "1.5px solid #f59e0b"
                      : "1.5px solid #113B3A",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px", color: "#113B3A" }}>
                    {selectedClientDetail.planTitle}
                  </strong>
                  <span
                    style={{
                      background:
                        selectedClientDetail.status === "aprobado" || selectedClientDetail.status === "activo"
                          ? "#16a34a"
                          : "#f59e0b",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {selectedClientDetail.status === "aprobado"
                      ? "PAGO CONFIRMADO"
                      : selectedClientDetail.status === "pendiente_pago"
                      ? "PAGO PENDIENTE"
                      : "GRATUIDAD ACTIVA"}
                  </span>
                </div>

                <div style={{ fontSize: "12.5px", color: "#334155", lineHeight: "1.5" }}>
                  <strong>Estado de Beneficios:</strong>{" "}
                  {selectedClientDetail.canEnjoyBenefits ? (
                    <span style={{ color: "#16a34a", fontWeight: "700" }}>
                      ✓ HABILITADOS (Disponibles para atención técnica en taller)
                    </span>
                  ) : (
                    <span style={{ color: "#b91c1c", fontWeight: "700" }}>
                      Pendientes de confirmación de pago
                    </span>
                  )}
                </div>

                {selectedClientDetail.approvedBy && (
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "4px" }}>
                    Confirmado por: <strong>{selectedClientDetail.approvedBy}</strong> {selectedClientDetail.paymentConfirmedAt && `el ${selectedClientDetail.paymentConfirmedAt}`}
                  </div>
                )}
              </div>

              {/* Grid Fechas en Calendario */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                    Validación Gratuidad
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#113B3A", marginTop: "2px" }}>
                    {formatDateDisplay(selectedClientDetail.fechaValidacionGratuidad) || "N/A (Plan Premium)"}
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                    Entallado 1x Cortesía
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#113B3A", marginTop: "2px" }}>
                    {selectedClientDetail.fechaEntallado ? formatDateDisplay(selectedClientDetail.fechaEntallado) : "Pendiente de uso"}
                  </div>
                  {selectedClientDetail.entalladoDetalle && (
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{selectedClientDetail.entalladoDetalle}</div>
                  )}
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                    Última Limpieza Ultrasónica
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#113B3A", marginTop: "2px" }}>
                    {formatDateDisplay(selectedClientDetail.fechaLimpieza) || "No registrada"}
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                    Joya & Pedido
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#113B3A", marginTop: "2px" }}>
                    {selectedClientDetail.productName} ({selectedClientDetail.productMetal})
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                    {selectedClientDetail.orderId}
                  </div>
                </div>
              </div>

              {/* Notas del Registro */}
              {selectedClientDetail.notes && (
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                    Observaciones y Trazabilidad
                  </span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#334155" }}>
                    {selectedClientDetail.notes}
                  </p>
                </div>
              )}

              {/* Botones de acción en la ficha */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleDeleteClient(selectedClientDetail)}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-trash3"></i> Eliminar Registro
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const cl = selectedClientDetail;
                      setSelectedClientDetail(null);
                      handleOpenCalendarModal(cl);
                    }}
                    style={{
                      background: "#F2F9F2",
                      color: "#113B3A",
                      border: "1px solid #113B3A",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="bi bi-calendar3"></i> Editar Calendario
                  </button>

                  {selectedClientDetail.planType === "plus" && selectedClientDetail.status === "pendiente_pago" && (
                    <button
                      type="button"
                      onClick={() => handleApprovePayment(selectedClientDetail)}
                      style={{
                        background: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 18px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="bi bi-check2-circle"></i> Confirmar Pago
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedClientDetail(null)}
                    style={{
                      background: "#113B3A",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
