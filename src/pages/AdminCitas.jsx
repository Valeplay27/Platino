import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sedesData } from "../data/sedes";
import {
  TIME_SLOTS,
  getCitas,
  updateCitaStatus,
  deleteCita,
  getBlockedSlots,
  blockSlot,
  unblockSlot,
  unblockFullDay,
  isSlotBlocked,
} from "../services/citasService";
import {
  getCatalogProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  resetToDefaultCatalog,
} from "../services/catalogService";
import {
  getHomeImages,
  updateSingleHomeImage,
  resetHomeImages,
  getAnnouncementText,
  saveAnnouncementText,
  resetAnnouncementText,
  getAnnouncementActive,
  saveAnnouncementActive,
  DEFAULT_ANNOUNCEMENT,
  HOME_SECTIONS,
} from "../services/homeImagesService";
import { useAuth } from "../context/useAuth";
import "../../styles/citas.css";

// Función para obtener la fecha mínima según el tipo de servicio:
// - Gemólogo: 3 días de anticipación
// - Asesoría: 1 día de anticipación (mañana)
const getMinBlockDateString = (type = "gemologo") => {
  const daysAdvance = type === "gemologo" ? 3 : 1;
  const d = new Date();
  d.setDate(d.getDate() + daysAdvance);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AdminCitas() {
  const { user, isAdmin, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState("citas"); // 'citas' | 'catalogo' | 'home_images'
  const [citasList, setCitasList] = useState(() => getCitas());
  const [blockedList, setBlockedList] = useState(() => getBlockedSlots());

  // Estado para Catálogo de Joyas
  const [catalogList, setCatalogList] = useState(() => getCatalogProducts());
  const [catalogFilterCategory, setCatalogFilterCategory] = useState("todas");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estado para Imágenes del Inicio (Home)
  const [homeImagesData, setHomeImagesData] = useState(() => getHomeImages());
  const [homeSectionFilter, setHomeSectionFilter] = useState("todas");
  const [homeImageModalOpen, setHomeImageModalOpen] = useState(false);
  const [editingHomeKey, setEditingHomeKey] = useState(null);
  const [formHomeImageSrc, setFormHomeImageSrc] = useState("");
  const [formHomeImageTitle, setFormHomeImageTitle] = useState("");
  const [formHomeImageSubtitle, setFormHomeImageSubtitle] = useState("");
  const [formHomeImageButtonText, setFormHomeImageButtonText] = useState("");

  // Campos del modal de producto / imagen
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("aros-boda");
  const [formPrice, setFormPrice] = useState("");
  const [formType, setFormType] = useState("anillo");
  const [formBadge, setFormBadge] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("/images/cat-compromiso.jpg");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Filtros de Citas
  const [filterSede, setFilterSede] = useState("todas");
  const [filterService, setFilterService] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Estado para gestión de Bloqueos
  const [blockSedeId, setBlockSedeId] = useState(sedesData[0].id);
  const [blockServiceType, setBlockServiceType] = useState("gemologo"); // "gemologo" | "asesoria"
  const [blockDate, setBlockDate] = useState(() => getMinBlockDateString("gemologo"));
  const [blockReason, setBlockReason] = useState("");
  const [filterBlockService, setFilterBlockService] = useState("todos"); // "todos" | "gemologo" | "asesoria"

  // Estado para la Línea Verde Superior (Barra de Anuncios)
  const [announcementInput, setAnnouncementInput] = useState(() => getAnnouncementText());
  const [announcementActive, setAnnouncementActive] = useState(() => getAnnouncementActive());

  // Cargar datos
  const loadData = () => {
    setCitasList(getCitas());
    setBlockedList(getBlockedSlots());
  };

  const loadCatalogData = () => {
    setCatalogList(getCatalogProducts());
  };

  const loadHomeImagesData = () => {
    setHomeImagesData(getHomeImages());
  };

  const loadAnnouncementData = () => {
    setAnnouncementInput(getAnnouncementText());
    setAnnouncementActive(getAnnouncementActive());
  };

  useEffect(() => {
    window.addEventListener("citas_updated", loadData);
    window.addEventListener("catalog_updated", loadCatalogData);
    window.addEventListener("home_images_updated", loadHomeImagesData);
    window.addEventListener("announcement_updated", loadAnnouncementData);
    return () => {
      window.removeEventListener("citas_updated", loadData);
      window.removeEventListener("catalog_updated", loadCatalogData);
      window.removeEventListener("home_images_updated", loadHomeImagesData);
      window.removeEventListener("announcement_updated", loadAnnouncementData);
    };
  }, []);

  // Manejar cambio de estado de cita
  const handleStatusChange = (id, newStatus) => {
    updateCitaStatus(id, newStatus);
    loadData();
  };

  // Manejar eliminación de cita
  const handleDeleteCita = (id) => {
    if (window.confirm(`¿Estás seguro de eliminar la cita ${id}?`)) {
      deleteCita(id);
      loadData();
    }
  };

  // Bloquear un slot específico para el servicio/rol seleccionado
  const handleBlockSlot = (time) => {
    const defaultReason =
      blockServiceType === "gemologo"
        ? "No disponible para Gemólogo"
        : blockServiceType === "asesoria"
        ? "No disponible para Asesoría General"
        : "Bloqueo por administración";
    const reason = blockReason.trim() || defaultReason;
    blockSlot(blockSedeId, blockDate, time, reason, blockServiceType);
    setBlockReason("");
    loadData();
  };

  // Bloquear día completo para el servicio/rol seleccionado
  const handleBlockFullDay = () => {
    const defaultReason =
      blockServiceType === "gemologo"
        ? "Gemólogo no atiende este día"
        : blockServiceType === "asesoria"
        ? "Sin asesoría este día"
        : "Día no laborable / Evento privado";
    const reason = blockReason.trim() || defaultReason;
    blockSlot(blockSedeId, blockDate, "FULL_DAY", reason, blockServiceType);
    setBlockReason("");
    loadData();
  };

  // Desbloquear día completo para el servicio seleccionado
  const handleUnblockFullDay = () => {
    unblockFullDay(blockSedeId, blockDate, blockServiceType);
    loadData();
  };

  // Desbloquear slot
  const handleUnblock = (blockId) => {
    unblockSlot(blockId);
    loadData();
  };

  // Fecha mínima permitida para bloquear según especialidad
  const minBlockDate = getMinBlockDateString(blockServiceType);

  const handleServiceTypeChange = (newType) => {
    setBlockServiceType(newType);
    const newMin = getMinBlockDateString(newType);
    if (blockDate < newMin) {
      setBlockDate(newMin);
    }
  };

  // Handlers para gestión de Catálogo y Fotos
  const openCreateProductModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("aros-boda");
    setFormPrice("");
    setFormType("anillo");
    setFormBadge("Nuevo");
    setFormDesc("");
    setFormSubtitle("Platino Perú Joyería Fina");
    setFormImage("/images/cat-compromiso.jpg");
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name || "");
    setFormCategory(prod.categories?.[0] || prod.category || "aros-boda");
    setFormPrice(prod.price || "");
    setFormType(prod.type || "anillo");
    setFormBadge(prod.badge || "");
    setFormDesc(prod.description || "");
    setFormSubtitle(prod.subtitle || "");
    setFormImage(prod.image || "/images/cat-compromiso.jpg");
    setProductModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es mayor a 5MB. Por favor elige una imagen más ligera.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      alert("Por favor completa el nombre y el precio de la joya.");
      return;
    }

    const payload = {
      name: formName.trim(),
      subtitle: formSubtitle.trim() || "Platino Perú Colección Exclusiva",
      categories: [formCategory],
      category: formCategory,
      price: Number(formPrice),
      type: formType,
      badge: formBadge.trim(),
      description: formDesc.trim(),
      image: formImage.trim() || "/images/cat-compromiso.jpg",
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      setFeedbackMsg(`Joya "${formName}" e imagen actualizadas con éxito.`);
    } else {
      createProduct(payload);
      setFeedbackMsg(`Nueva joya "${formName}" agregada al catálogo.`);
    }

    setProductModalOpen(false);
    loadCatalogData();
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar la joya "${name}" del catálogo?`)) {
      deleteProduct(id);
      loadCatalogData();
      setFeedbackMsg(`Joya "${name}" eliminada del catálogo.`);
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  const handleResetCatalog = () => {
    if (
      window.confirm(
        "¿Deseas restaurar todas las fotos y joyas del catálogo original? Se restablecerán las piezas de muestra."
      )
    ) {
      resetToDefaultCatalog();
      loadCatalogData();
      setFeedbackMsg("Catálogo e imágenes restauradas al estado original.");
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  // Handlers para Gestión de Imágenes del Inicio
  const handleOpenEditHomeImage = (key, item) => {
    setEditingHomeKey(key);
    setFormHomeImageSrc(item.image || "");
    setFormHomeImageTitle(item.title || item.name || "");
    setFormHomeImageSubtitle(item.subtitle || "");
    setFormHomeImageButtonText(item.buttonText || "");
    setHomeImageModalOpen(true);
  };

  const handleHomeImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es mayor a 5MB. Por favor elige una imagen más ligera.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormHomeImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHomeImage = (e) => {
    e.preventDefault();
    if (!editingHomeKey) return;

    const extras = {};
    if (formHomeImageTitle !== undefined) {
      extras.name = formHomeImageTitle;
      extras.title = formHomeImageTitle;
    }
    if (formHomeImageSubtitle !== undefined) {
      extras.subtitle = formHomeImageSubtitle;
    }
    if (formHomeImageButtonText !== undefined) {
      extras.buttonText = formHomeImageButtonText;
    }

    const updated = updateSingleHomeImage(editingHomeKey, formHomeImageSrc, extras);
    setHomeImagesData(updated);
    setHomeImageModalOpen(false);
    setFeedbackMsg(
      `"${homeImagesData[editingHomeKey]?.label || formHomeImageTitle || editingHomeKey}" actualizado correctamente.`
    );
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSaveSectionHeader = (key, title, subtitle) => {
    const updated = updateSingleHomeImage(key, undefined, { title, subtitle });
    setHomeImagesData(updated);
    setFeedbackMsg("¡Textos de la sección actualizados correctamente!");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSaveFallEditTexts = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateSingleHomeImage("editorialFall", undefined, {
      title: homeImagesData.editorialFall?.title || "The Fall Edit",
      subtitle: homeImagesData.editorialFall?.subtitle || "",
      buttonText: homeImagesData.editorialFall?.buttonText || "SHOP NOW",
    });
    const updated = updateSingleHomeImage("editorialClassics", undefined, {
      title: homeImagesData.editorialClassics?.title || "The New Classics",
    });
    setHomeImagesData(updated);
    setFeedbackMsg("¡Todos los textos de 'The Fall Edit & The New Classics' fueron guardados!");
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleRemoveSecondaryShowroom = () => {
    const updated = updateSingleHomeImage("showroomSecondary", "", {});
    setHomeImagesData(updated);
    setFeedbackMsg("Segunda fotografía del showroom eliminada.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleResetHomeImages = () => {
    if (
      window.confirm(
        "¿Estás seguro de restablecer todas las imágenes del inicio a sus fotografías originales?"
      )
    ) {
      const reset = resetHomeImages();
      setHomeImagesData(reset);
      setFeedbackMsg("Todas las imágenes de inicio fueron restauradas a su estado original.");
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  // Handlers para Barra Verde Superior de Anuncios
  const handleToggleAnnouncementActive = () => {
    const nextState = !announcementActive;
    saveAnnouncementActive(nextState);
    setAnnouncementActive(nextState);
    setFeedbackMsg(
      nextState
        ? "¡Barra superior activada! Ahora es visible en toda la tienda."
        : "Barra superior desactivada. Se ocultó de la tienda."
    );
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleSaveAnnouncement = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = announcementInput.trim();
    if (!clean) {
      alert("El texto del anuncio no puede estar vacío.");
      return;
    }
    saveAnnouncementText(clean);
    setFeedbackMsg("¡Línea verde superior actualizada! Los cambios ya son visibles en toda la tienda.");
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleResetAnnouncement = () => {
    if (
      window.confirm(
        "¿Deseas restaurar el texto original por defecto de la línea verde superior?"
      )
    ) {
      const defaultText = resetAnnouncementText();
      setAnnouncementInput(defaultText);
      setAnnouncementActive(true);
      setFeedbackMsg("Se restauró el texto original y se reactivó la barra verde superior.");
      setTimeout(() => setFeedbackMsg(""), 4500);
    }
  };

  // Filtrado de elementos del Inicio (se omiten encabezados meta y texto del collage)
  const filteredHomeItems = Object.entries(homeImagesData).filter(([key, item]) => {
    if (item.isSectionHeader || key === "editorialClassics" || key === "sectionRingStyles") return false;
    if (homeSectionFilter !== "todas" && item.section !== homeSectionFilter) {
      return false;
    }
    return true;
  });

  // Filtrado de catálogo
  const filteredCatalog = catalogList.filter((p) => {
    if (catalogFilterCategory !== "todas") {
      const matchCat =
        p.category === catalogFilterCategory ||
        p.categories?.includes(catalogFilterCategory);
      if (!matchCat) return false;
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchBadge = p.badge?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchBadge && !matchDesc) return false;
    }
    return true;
  });

  // Filtrado de citas
  const filteredCitas = citasList.filter((c) => {
    if (filterSede !== "todas" && c.sedeId !== filterSede) return false;
    if (filterService !== "todos" && c.serviceType !== filterService) return false;
    if (filterStatus !== "todos" && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.clientName?.toLowerCase().includes(q);
      const matchCode = c.id?.toLowerCase().includes(q);
      const matchObs = c.observation?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchObs) return false;
    }
    return true;
  });

  // Métricas
  const totalCitas = citasList.length;
  const citasGemologo = citasList.filter((c) => c.serviceType === "gemologo").length;
  const citasPendientes = citasList.filter((c) => c.status === "pendiente").length;
  const totalBloqueos = blockedList.length;

  const totalAros = catalogList.filter((p) =>
    p.category?.includes("aros") ||
    p.categories?.some((c) => c.includes("aros") || c.includes("alianzas"))
  ).length;

  const totalCompromiso = catalogList.filter((p) =>
    p.category?.includes("compromiso") ||
    p.category?.includes("promesa") ||
    p.categories?.some((c) => c.includes("compromiso") || c.includes("promesa"))
  ).length;

  const totalJoyeria = catalogList.filter((p) =>
    p.type === "accesorio" ||
    p.category === "joyeria" ||
    p.categories?.some((c) => ["joyeria", "collares", "pulseras", "regalos"].includes(c))
  ).length;

  // Si no ha iniciado sesión como Administrador
  if (!isAdmin) {
    return (
      <div className="admin-citas-page">
        <div className="admin-container" style={{ maxWidth: "560px", margin: "70px auto", textAlign: "center" }}>
          <div className="admin-content-card" style={{ padding: "44px 34px" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "#f4f8f5",
                color: "#0b2820",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "28px",
                border: "1px solid #d4ded8",
              }}
            >
              <i className="bi bi-shield-lock"></i>
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "25px",
                color: "#122820",
                marginBottom: "12px",
              }}
            >
              Panel Administrativo Platino Perú
            </h2>
            <p
              style={{
                color: "#5b6b63",
                fontSize: "13.5px",
                lineHeight: "1.6",
                marginBottom: "28px",
              }}
            >
              Para acceder a la gestión de citas y bloqueo de horarios, debes iniciar sesión con una cuenta de <strong>Administrador</strong>.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "340px", margin: "0 auto" }}>
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="btn-toggle-slot block"
                style={{
                  width: "100%",
                  padding: "13px",
                  fontSize: "13.5px",
                  justifyContent: "center",
                  borderRadius: "8px",
                }}
              >
                <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión como Administrador
              </button>
              <Link
                to="/"
                className="btn-cita-outline"
                style={{
                  width: "100%",
                  textAlign: "center",
                  background: "#fbfcfb",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                Volver a la Joyería
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-citas-page">
      <div className="admin-container">
        {/* Breadcrumb de navegación */}
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px" }}>
          <Link
            to="/"
            style={{
              color: "#137748",
              textDecoration: "none",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="bi bi-house-door"></i> Inicio
          </Link>
          <span style={{ color: "#9aa7a0" }}>/</span>
          <span style={{ color: "#5d6d65", fontWeight: "500" }}>Panel de Administración</span>
        </div>

        {/* Top Header */}
        <div className="admin-top-bar">
          <div className="admin-title-group">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h1>
                {activeTab === "catalogo"
                  ? "Panel Administrativo - Catálogo de Joyas"
                  : activeTab === "home_images"
                  ? "Panel Administrativo - Imágenes del Inicio"
                  : "Panel Administrativo de Citas"}
              </h1>
              <span
                style={{
                  fontSize: "12.5px",
                  background: "#e4f5ec",
                  color: "#137748",
                  padding: "5px 14px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-shield-check"></i> {user?.name || "Vladimir"}
              </span>
            </div>
            <p>
              {activeTab === "catalogo"
                ? "Gestiona el inventario de la tienda, crea nuevas joyas y modifica o sube nuevas fotografías."
                : activeTab === "home_images"
                ? "Cambia las imágenes del inicio: banners de compromiso/boda, categorías, estilos de anillos, editoriales y mosaico."
                : "Gestiona reservas, revisa observaciones de clientes y bloquea u habilita horarios de atención."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${activeTab === "citas" ? "active" : ""}`}
                onClick={() => setActiveTab("citas")}
              >
                <i className="bi bi-calendar2-check"></i> Citas & Bloqueo de Horarios ({totalCitas})
              </button>

              <button
                className={`admin-tab-btn ${activeTab === "catalogo" ? "active" : ""}`}
                onClick={() => setActiveTab("catalogo")}
              >
                <i className="bi bi-gem"></i> Catálogo & Fotos ({catalogList.length})
              </button>

              <button
                className={`admin-tab-btn ${activeTab === "home_images" ? "active" : ""}`}
                onClick={() => setActiveTab("home_images")}
              >
                <i className="bi bi-images"></i> Imágenes del Inicio ({Object.keys(homeImagesData).length})
              </button>
            </div>

            <Link
              to={activeTab === "home_images" ? "/" : "/catalogo"}
              className="btn-cita-outline"
              style={{ background: "white", padding: "10px 18px", fontSize: "13.5px" }}
              title={activeTab === "home_images" ? "Ver Página de Inicio" : "Ver catálogo de la tienda"}
              target="_blank"
            >
              <i className="bi bi-box-arrow-up-right"></i>{" "}
              {activeTab === "home_images" ? "Ver Inicio Público" : "Ver Tienda Pública"}
            </Link>
          </div>
        </div>

        {/* Feedback Alert si hubo cambios */}
        {feedbackMsg && (
          <div
            style={{
              backgroundColor: "#e8f6ed",
              border: "1.5px solid #7bc696",
              color: "#115e34",
              padding: "14px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ fontSize: "18px" }}></i>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Métricas Resumen Dinámicas según la pestaña */}
        {activeTab === "home_images" ? (
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box">
                <i className="bi bi-images"></i>
              </div>
              <div>
                <h3 className="metric-val">{Object.keys(homeImagesData).length}</h3>
                <p className="metric-lbl">Total Imágenes de Portada</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#9c6c0b", background: "#fbf6e9" }}>
                <i className="bi bi-layout-split"></i>
              </div>
              <div>
                <h3 className="metric-val">2</h3>
                <p className="metric-lbl">Banners Hero Principales</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-grid-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">6</h3>
                <p className="metric-lbl">Categorías Destacadas</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#32638e", background: "#edf4fb" }}>
                <i className="bi bi-brush"></i>
              </div>
              <div>
                <h3 className="metric-val">6</h3>
                <p className="metric-lbl">Estilos de Sortijas</p>
              </div>
            </div>
          </div>
        ) : activeTab === "catalogo" ? (
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box">
                <i className="bi bi-gem"></i>
              </div>
              <div>
                <h3 className="metric-val">{catalogList.length}</h3>
                <p className="metric-lbl">Total Joyas en Catálogo</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#9c6c0b", background: "#fbf6e9" }}>
                <i className="bi bi-circle"></i>
              </div>
              <div>
                <h3 className="metric-val">{totalAros}</h3>
                <p className="metric-lbl">Aros de Boda y Alianzas</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-suit-diamond-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">{totalCompromiso}</h3>
                <p className="metric-lbl">Compromiso y Promesa</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#32638e", background: "#edf4fb" }}>
                <i className="bi bi-stars"></i>
              </div>
              <div>
                <h3 className="metric-val">{totalJoyeria}</h3>
                <p className="metric-lbl">Accesorios y Collares</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box">
                <i className="bi bi-calendar3"></i>
              </div>
              <div>
                <h3 className="metric-val">{totalCitas}</h3>
                <p className="metric-lbl">Total de Citas Registradas</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#9c6c0b", background: "#fbf6e9" }}>
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <h3 className="metric-val">{citasPendientes}</h3>
                <p className="metric-lbl">Citas por Confirmar</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-gem"></i>
              </div>
              <div>
                <h3 className="metric-val">{citasGemologo}</h3>
                <p className="metric-lbl">Citas de Gemología</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#b9423c", background: "#fbeeec" }}>
                <i className="bi bi-lock-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">{totalBloqueos}</h3>
                <p className="metric-lbl">Horarios Bloqueados Activos</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 1: GESTIÓN DE CITAS
            ======================================================== */}
        {activeTab === "citas" && (
          <div className="admin-content-card">
            {/* Barra de Filtros */}
            <div className="filters-bar">
              <input
                type="text"
                placeholder="Buscar por cliente, código u observación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-select"
                style={{ minWidth: "320px", flex: "1" }}
              />

              <select
                value={filterSede}
                onChange={(e) => setFilterSede(e.target.value)}
                className="filter-select"
              >
                <option value="todas">Todas las Sedes</option>
                <option value="lima-centro">Sede Lima Centro</option>
                <option value="miraflores">Sede Miraflores</option>
              </select>

              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos los Servicios</option>
                <option value="gemologo">💎 Citas Gemólogo</option>
                <option value="asesoria">💍 Asesoría General</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos los Estados</option>
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>

              <a
                href="#seccion-bloqueos"
                className="btn-catalog-create"
                style={{
                  textDecoration: "none",
                  padding: "10px 18px",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  whiteSpace: "nowrap",
                }}
              >
                <i className="bi bi-slash-circle"></i> Bloquear Horarios ({totalBloqueos})
              </a>
            </div>

            {/* Tabla de Citas */}
            {filteredCitas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "#66756d", fontSize: "15px" }}>
                <i className="bi bi-inbox" style={{ fontSize: "42px", display: "block", marginBottom: "12px", color: "#a5b4ac" }}></i>
                No se encontraron citas con los filtros seleccionados.
              </div>
            ) : (
              <div className="citas-table-responsive">
                <table className="citas-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Cliente y Contacto</th>
                      <th>Sede</th>
                      <th>Fecha y Hora</th>
                      <th>Tipo de Cita</th>
                      <th>Observación / Motivo</th>
                      <th>Estado</th>
                      <th style={{ textAlign: "center" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCitas.map((cita) => (
                      <tr key={cita.id}>
                        <td>
                          <span className="cita-code">{cita.id}</span>
                        </td>

                        <td>
                          <div style={{ fontWeight: "700", fontSize: "15px", color: "#15241e", marginBottom: "3px" }}>
                            {cita.clientName}
                          </div>
                          <div style={{ fontSize: "13px", color: "#137748", marginBottom: "2px" }}>
                            <a
                              href={`https://wa.me/${cita.clientPhone?.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(cita.clientName)},%20te%20contactamos%20de%20Platino%20Perú%20respecto%20a%20tu%20cita%20${cita.id}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#137748", textDecoration: "underline", fontWeight: "600" }}
                            >
                              <i className="bi bi-whatsapp"></i> {cita.clientPhone}
                            </a>
                          </div>
                          <div style={{ fontSize: "12.5px", color: "#68776f" }}>{cita.clientEmail}</div>
                        </td>

                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              background: cita.sedeId === "miraflores" ? "#eaf4ee" : "#f5f1e6",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#1c2b23",
                            }}
                          >
                            {cita.sedeName}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontWeight: "700", fontSize: "15px", color: "#15241e" }}>{cita.date}</div>
                          <div style={{ color: "#3a4c42", fontSize: "13.5px", fontWeight: "500", marginTop: "2px" }}>
                            <i className="bi bi-clock"></i> {cita.time}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>
                            {cita.serviceType === "gemologo" ? (
                              <span style={{ color: "#137748", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <i className="bi bi-gem"></i> Gemólogo
                              </span>
                            ) : (
                              <span style={{ color: "#8a6519", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <i className="bi bi-heart-fill"></i> Asesoría
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Observación del cliente */}
                        <td>
                          <div className="observation-box">
                            {cita.observation || "Sin observaciones adicionales."}
                          </div>
                        </td>

                        <td>
                          <select
                            value={cita.status}
                            onChange={(e) => handleStatusChange(cita.id, e.target.value)}
                            className={`status-badge ${cita.status}`}
                            style={{ border: "none", cursor: "pointer", outline: "none" }}
                          >
                            <option value="confirmada">Confirmada</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </td>

                        <td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <a
                              href={`https://wa.me/${cita.clientPhone?.replace(/\D/g, "")}?text=Estimado(a)%20${encodeURIComponent(cita.clientName)},%20le%20confirmamos%20su%20cita%20${cita.id}%20para%20el%20día%20${cita.date}%20a%20las%20${cita.time}%20en%20nuestra%20${encodeURIComponent(cita.sedeName)}.%20¡Le%20esperamos!`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-icon whatsapp"
                              title="Enviar mensaje de WhatsApp al cliente"
                            >
                              <i className="bi bi-whatsapp"></i>
                            </a>

                            <button
                              onClick={() => handleDeleteCita(cita.id)}
                              className="btn-action-icon delete"
                              title="Eliminar registro de cita"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================
                SECCIÓN INTEGRADA: BLOQUEO DE HORARIOS Y DÍAS
                (EN LA MISMA PESTAÑA DE CITAS)
                ======================================================== */}
            <div
              id="seccion-bloqueos"
              style={{
                marginTop: "48px",
                paddingTop: "36px",
                borderTop: "2px solid #ede8de",
              }}
            >
              <div style={{ marginBottom: "22px" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "24px",
                    color: "var(--platino-green-dark)",
                    margin: "0 0 6px 0",
                  }}
                >
                  Bloquear u Habilitar Horarios de Atención ({blockedList.length} activos)
                </h3>
                <p style={{ fontSize: "14px", color: "#4f5f56", margin: 0, lineHeight: "1.5" }}>
                  Configura la disponibilidad del Gemólogo o de Asesoría General por cada sede. Puedes bloquear horarios puntuales o días completos para controlar cuándo los clientes pueden reservar.
                </p>
              </div>

              <div className="blocking-panel">
                {/* Lado Izquierdo: Configuración del Bloqueo */}
                <div className="blocking-config-box">
                  <h3 className="blocking-config-title">
                    Configurar Disponibilidad y Horarios
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "#66726b", marginBottom: "18px" }}>
                    Define la disponibilidad de horarios por sede y especialidad (Gemólogo vs Asesoría General).
                  </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div className="form-field">
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "6px" }}>
                      Sede a Configurar:
                    </label>
                    <select
                      value={blockSedeId}
                      onChange={(e) => setBlockSedeId(e.target.value)}
                      className="filter-select"
                      style={{ width: "100%" }}
                    >
                      {sedesData.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "6px" }}>
                      Fecha:{" "}
                      <span style={{ fontWeight: "500", fontSize: "12px", color: blockServiceType === "gemologo" ? "#312e81" : "#55635b" }}>
                        ({blockServiceType === "gemologo" ? "Mín. 3 días de anticipación" : "Mín. 1 día de anticipación"})
                      </span>
                    </label>
                    <input
                      type="date"
                      min={minBlockDate}
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="filter-select"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                {/* Selector de Servicio / Rol (Gemólogo vs Asesoría) */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "8px" }}>
                    Especialidad / Servicio a Configurar:
                  </label>
                  <div className="service-selector-group">
                    <button
                      type="button"
                      className={`service-selector-btn ${blockServiceType === "gemologo" ? "active" : ""}`}
                      onClick={() => handleServiceTypeChange("gemologo")}
                    >
                      <span>💎</span> Cita con Gemólogo
                    </button>
                    <button
                      type="button"
                      className={`service-selector-btn ${blockServiceType === "asesoria" ? "active" : ""}`}
                      onClick={() => handleServiceTypeChange("asesoria")}
                    >
                      <span>💍</span> Asesoría General
                    </button>
                  </div>
                </div>

                {/* Banner contextual explicativo según rol */}
                {blockServiceType === "gemologo" && (
                  <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "6px", padding: "11px 14px", marginBottom: "16px", fontSize: "12.5px", color: "#312e81", lineHeight: "1.5" }}>
                    <i className="bi bi-gem"></i> <strong>Modo Gemólogo:</strong> Aquí configuras los horarios en que el gemólogo atiende en <strong>{sedesData.find((s) => s.id === blockSedeId)?.name}</strong>. Bloquear una hora aquí solo inhabilita citas de gemología; las asesorías generales se mantendrán abiertas. (Citas de gemología requieren 3 días de anticipación).
                  </div>
                )}
                {blockServiceType === "asesoria" && (
                  <div style={{ background: "#fdf4ff", border: "1px solid #f5d0fe", borderRadius: "6px", padding: "11px 14px", marginBottom: "16px", fontSize: "12.5px", color: "#701a75", lineHeight: "1.5" }}>
                    <i className="bi bi-clock-history"></i> <strong>Modo Asesoría General:</strong> Configuras turnos para aros de compromiso y joyería comercial en <strong>{sedesData.find((s) => s.id === blockSedeId)?.name}</strong> (citas requieren 1 día de anticipación).
                  </div>
                )}

                <div className="form-field" style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "6px" }}>
                    Motivo del Bloqueo (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder={
                      blockServiceType === "gemologo"
                        ? "Ej. Capacitación de gemología, Salida a campo, No atiende..."
                        : "Ej. Mantenimiento de vitrinas, Ausencia de asesor..."
                    }
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="filter-select"
                    style={{ width: "100%" }}
                  />
                </div>

                {(() => {
                  const isFullDayBlocked = blockedList.some(
                    (b) =>
                      b.sedeId === blockSedeId &&
                      b.date === blockDate &&
                      b.time === "FULL_DAY" &&
                      (!b.serviceType || b.serviceType === "all" || b.serviceType === blockServiceType)
                  );

                  return (
                    <div style={{ display: "grid", gridTemplateColumns: isFullDayBlocked ? "1fr 1fr" : "1fr", gap: "10px", marginBottom: "18px" }}>
                      <button
                        type="button"
                        onClick={handleBlockFullDay}
                        className="btn-toggle-slot block"
                        style={{ width: "100%", padding: "11px", fontSize: "13px", borderRadius: "6px" }}
                      >
                        <i className="bi bi-calendar-x"></i> Bloquear Día ({blockServiceType === "gemologo" ? "Gemólogo" : "Asesoría"})
                      </button>
                      {isFullDayBlocked && (
                        <button
                          type="button"
                          onClick={handleUnblockFullDay}
                          className="btn-toggle-slot unblock"
                          style={{ width: "100%", padding: "11px", fontSize: "13px", borderRadius: "6px" }}
                        >
                          <i className="bi bi-unlock"></i> Desbloquear Día
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Grilla interactiva de horas para la sede, fecha y especialidad seleccionada */}
                <h4 style={{ margin: "24px 0 12px 0", fontSize: "15px", fontWeight: "700", color: "#1c2822" }}>
                  Horarios del día ({blockDate}) — {blockServiceType === "gemologo" ? "💎 Gemólogo" : "💍 Asesoría"}:
                </h4>
                <div className="admin-slots-grid">
                  {TIME_SLOTS.map((time) => {
                    const statusCheck = isSlotBlocked(blockSedeId, blockDate, time, blockServiceType);
                    const isBlocked = statusCheck.blocked;

                    // Verificar si es un bloqueo manual de la lista aplicable al servicio actual
                    const specificBlock = blockedList.find(
                      (b) =>
                        b.sedeId === blockSedeId &&
                        b.date === blockDate &&
                        (b.time === time || b.time === "FULL_DAY") &&
                        (!b.serviceType || b.serviceType === "all" || b.serviceType === blockServiceType)
                    );

                    return (
                      <div
                        key={time}
                        className={`admin-slot-card ${isBlocked ? "is-blocked" : ""}`}
                      >
                        <div>
                          <div className="slot-time-text">{time}</div>
                          {isBlocked ? (
                            <span style={{ fontSize: "11.5px", color: "#b9423c", fontWeight: "500", display: "block", marginTop: "2px" }}>
                              {statusCheck.reason}
                            </span>
                          ) : (
                            <span style={{ fontSize: "11.5px", color: "#1e7048", fontWeight: "600", display: "block", marginTop: "2px" }}>
                              ✓ {blockServiceType === "gemologo" ? "Gemólogo Disponible" : "Asesoría Disponible"}
                            </span>
                          )}
                        </div>

                        {specificBlock ? (
                          <button
                            type="button"
                            onClick={() => handleUnblock(specificBlock.id)}
                            className="btn-toggle-slot unblock"
                            title="Habilitar este horario"
                          >
                            Habilitar
                          </button>
                        ) : isBlocked ? (
                          <span style={{ fontSize: "12px", color: "#77857e", fontWeight: "500" }}>Cita activa</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBlockSlot(time)}
                            className="btn-toggle-slot block"
                            title={`Bloquear horario para ${blockServiceType === "gemologo" ? "Gemólogo" : "Asesoría"}`}
                          >
                            Bloquear
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lado Derecho: Lista de Bloqueos Activos en el Sistema */}
              <div>
                <h3 className="blocking-config-title">
                  Historial de Bloqueos Activos ({blockedList.length})
                </h3>
                <p style={{ fontSize: "14px", color: "#4f5f56", marginBottom: "16px", lineHeight: "1.5" }}>
                  Lista de turnos y días cerrados temporalmente. Puedes filtrarlos por especialidad.
                </p>

                {/* Filtros por servicio para la lista de bloqueos */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {[
                    { id: "todos", label: `Todos (${blockedList.length})` },
                    { id: "gemologo", label: `💎 Gemólogo (${blockedList.filter((b) => b.serviceType === "gemologo").length})` },
                    { id: "asesoria", label: `💍 Asesoría (${blockedList.filter((b) => b.serviceType === "asesoria").length})` },
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setFilterBlockService(pill.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "600",
                        border: filterBlockService === pill.id ? "1.5px solid var(--platino-green-dark)" : "1px solid #d4ded8",
                        background: filterBlockService === pill.id ? "#eef5f1" : "white",
                        color: filterBlockService === pill.id ? "var(--platino-green-dark)" : "#5a6660",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {(() => {
                  const displayedBlocks = blockedList.filter((b) => {
                    if (filterBlockService === "todos") return true;
                    if (filterBlockService === "gemologo") return b.serviceType === "gemologo";
                    if (filterBlockService === "asesoria") return b.serviceType === "asesoria";
                    return true;
                  });

                  if (displayedBlocks.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "40px", background: "#faf8f4", borderRadius: "8px", color: "#77857e", fontSize: "14px" }}>
                        No hay bloqueos activos para el filtro seleccionado.
                      </div>
                    );
                  }

                  return (
                    <div className="active-blocks-list">
                      {displayedBlocks.map((block) => {
                        const sede = sedesData.find((s) => s.id === block.sedeId);
                        return (
                          <div key={block.id} className="active-block-item">
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                <span style={{ fontWeight: "700", fontSize: "14.5px", color: "#15241e" }}>
                                  {sede?.name || block.sedeId}
                                </span>
                                <span
                                  className={`block-service-badge ${
                                    block.serviceType === "gemologo" ? "gemologo" : "asesoria"
                                  }`}
                                >
                                  {block.serviceType === "gemologo" ? "💎 Gemólogo" : "💍 Asesoría"}
                                </span>
                              </div>
                              <div style={{ fontSize: "13px", color: "#4a5951", marginTop: "3px" }}>
                                <i className="bi bi-calendar3"></i> {block.date} &nbsp;·&nbsp;
                                <i className="bi bi-clock"></i>{" "}
                                <strong>{block.time === "FULL_DAY" ? "Día Completo" : block.time}</strong>
                              </div>
                              <div style={{ fontSize: "12.5px", color: "#b9423c", marginTop: "4px", fontWeight: "500" }}>
                                Motivo: {block.reason}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleUnblock(block.id)}
                              className="btn-toggle-slot unblock"
                              title="Eliminar este bloqueo"
                            >
                              <i className="bi bi-unlock"></i> Desbloquear
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ========================================================
            TAB 3: GESTIÓN DE CATÁLOGO & FOTOGRAFÍAS
            ======================================================== */}
        {activeTab === "catalogo" && (
          <div className="admin-content-card">
            {/* Cabecera del catálogo con botones de acción */}
            <div className="admin-catalog-header">
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", margin: "0 0 6px 0", color: "#15241e" }}>
                  Catálogo de Joyas ({filteredCatalog.length})
                </h3>
                <p style={{ fontSize: "14px", color: "#5d6d65", margin: 0 }}>
                  Crea modelos nuevos, modifica descripciones, precios o sube nuevas imágenes desde tu dispositivo.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={openCreateProductModal}
                  className="btn-catalog-create"
                >
                  <i className="bi bi-plus-circle-fill"></i> Crear Nueva Joya
                </button>

                <button
                  type="button"
                  onClick={handleResetCatalog}
                  className="btn-catalog-reset"
                  title="Restablecer fotos y joyas predeterminadas"
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Restaurar Fotos Base
                </button>
              </div>
            </div>

            {/* Barra de Filtros del Catálogo */}
            <div className="filters-bar" style={{ marginBottom: "26px" }}>
              <input
                type="text"
                placeholder="Buscar joya por nombre, descripción o insignia..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="filter-select"
                style={{ minWidth: "320px", flex: "1" }}
              />

              <select
                value={catalogFilterCategory}
                onChange={(e) => setCatalogFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="todas">Todas las Categorías</option>
                <option value="aros-boda">💍 Aros de Boda y Matrimonio</option>
                <option value="anillo-compromiso">💎 Anillos de Compromiso</option>
                <option value="anillo-promesa">✨ Anillos de Promesa</option>
                <option value="aros-alianzas">🤝 Aros de Alianzas</option>
                <option value="joyeria">⭐ Joyería y Accesorios</option>
                <option value="collares">📿 Collares</option>
                <option value="pulseras">💫 Pulseras</option>
                <option value="regalos">🎁 Regalos</option>
              </select>
            </div>

            {/* Grilla de Productos */}
            {filteredCatalog.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "#66756d", fontSize: "15px" }}>
                <i className="bi bi-gem" style={{ fontSize: "42px", display: "block", marginBottom: "12px", color: "#a5b4ac" }}></i>
                No se encontraron joyas en el catálogo con los filtros seleccionados.
              </div>
            ) : (
              <div className="admin-catalog-grid">
                {filteredCatalog.map((prod) => (
                  <div key={prod.id} className="admin-product-card">
                    <div className="admin-product-img-box">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="admin-product-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/cat-compromiso.jpg";
                        }}
                      />
                      {prod.badge && (
                        <span className="admin-product-badge">{prod.badge}</span>
                      )}
                      <span className="admin-product-category-tag">
                        {prod.categories?.[0] || prod.category || prod.type}
                      </span>
                    </div>

                    <div className="admin-product-body">
                      <h4 className="admin-product-title">{prod.name}</h4>
                      <div className="admin-product-price">
                        {prod.priceFormatted || `S/. ${prod.price}`}
                      </div>
                      <p className="admin-product-desc">
                        {prod.description || "Joya artesanal con certificación de pureza."}
                      </p>

                      <div className="admin-product-footer">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(prod)}
                          className="btn-card-edit"
                        >
                          <i className="bi bi-pencil-square"></i> Modificar Foto / Datos
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="btn-card-delete"
                          title="Eliminar del catálogo"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: GESTIÓN DE IMÁGENES DEL INICIO (PORTADA)
            ======================================================== */}
        {activeTab === "home_images" && (
          <div className="admin-content-card">
            {/* Cabecera del panel de imágenes */}
            <div className="admin-catalog-header">
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "22px",
                    margin: "0 0 6px 0",
                    color: "#15241e",
                  }}
                >
                  Imágenes de la Portada / Inicio ({filteredHomeItems.length})
                </h3>
                <p style={{ fontSize: "14px", color: "#5d6d65", margin: 0 }}>
                  Personaliza cualquier fotografía de la página de inicio (banners hero, categorías, estilos de anillos, showroom y mosaicos). Sube fotos desde tu dispositivo o ingresa URLs directas.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  to="/"
                  target="_blank"
                  className="btn-cita-outline"
                  style={{ background: "#f8f7f4", padding: "10px 16px", fontSize: "13px" }}
                  title="Ver cómo queda la página de inicio en tiempo real"
                >
                  <i className="bi bi-eye"></i> Previsualizar Portada
                </Link>

                <button
                  type="button"
                  onClick={handleResetHomeImages}
                  className="btn-card-delete"
                  style={{
                    background: "#fff5f5",
                    color: "#b9423c",
                    border: "1px solid #f2c7c5",
                    padding: "10px 16px",
                    fontSize: "13px",
                  }}
                  title="Restablecer todas las fotos del inicio a las originales"
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Restaurar Originales
                </button>
              </div>
            </div>

            {/* Tarjeta de Gestión de la Línea Verde Superior */}
            <div
              style={{
                background: "linear-gradient(135deg, #f7faf8 0%, #edf6f0 100%)",
                border: "1.5px solid #b7dec5",
                borderRadius: "12px",
                padding: "22px 24px",
                marginTop: "20px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(19, 119, 72, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#0b2820",
                        boxShadow: "0 0 0 3px rgba(11, 40, 32, 0.2)",
                      }}
                    ></span>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "16.5px",
                        fontWeight: "700",
                        color: "#0b2820",
                        letterSpacing: "0.2px",
                      }}
                    >
                      Línea Verde Superior (Barra de Promociones)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#41584b", maxWidth: "700px" }}>
                    Personaliza el texto de la franja verde superior visible en todas las páginas de la tienda (promociones, avisos especiales o anuncios).
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      background: "#e4ece7",
                      borderRadius: "24px",
                      padding: "3px",
                      border: "1px solid #c5d8ce",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!announcementActive) handleToggleAnnouncementActive();
                      }}
                      style={{
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: announcementActive ? "#0b2820" : "transparent",
                        color: announcementActive ? "#ffffff" : "#45584e",
                        boxShadow: announcementActive ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                        transition: "all 0.2s ease",
                      }}
                      title="Activar franja superior en toda la tienda"
                    >
                      <i className="bi bi-check-circle-fill" style={{ color: announcementActive ? "#7ce3a7" : "#8ca095" }}></i>
                      Activo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (announcementActive) handleToggleAnnouncementActive();
                      }}
                      style={{
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: !announcementActive ? "#b9423c" : "transparent",
                        color: !announcementActive ? "#ffffff" : "#45584e",
                        boxShadow: !announcementActive ? "0 2px 6px rgba(185, 66, 60, 0.25)" : "none",
                        transition: "all 0.2s ease",
                      }}
                      title="Desactivar y ocultar franja superior de la tienda"
                    >
                      <i className="bi bi-x-circle-fill" style={{ color: !announcementActive ? "#ffffff" : "#8ca095" }}></i>
                      Inactivo
                    </button>
                  </div>
                </div>
              </div>

              {/* Vista Previa de la Franja Verde */}
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "11.5px",
                    fontWeight: "700",
                    color: "#375043",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    marginBottom: "8px",
                  }}
                >
                  Vista previa en tiempo real:
                </span>
                <div
                  style={{
                    background: announcementActive ? "#0b2820" : "#f5f4f0",
                    color: announcementActive ? "#ffffff" : "#7c8580",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "500",
                    letterSpacing: "0.4px",
                    boxShadow: announcementActive ? "0 2px 6px rgba(0,0,0,0.12)" : "none",
                    border: announcementActive ? "1px solid #144033" : "1.5px dashed #c0b8aa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {!announcementActive && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#b9423c",
                        background: "#fde8e8",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        border: "1px solid #f8b4b4",
                      }}
                    >
                      <i className="bi bi-eye-slash-fill"></i> INACTIVO / OCULTO EN TIENDA
                    </span>
                  )}
                  <span style={{ textDecoration: announcementActive ? "none" : "line-through", opacity: announcementActive ? 1 : 0.7 }}>
                    {announcementInput || DEFAULT_ANNOUNCEMENT}
                  </span>
                </div>
              </div>

              {/* Formulario de guardado */}
              <form
                onSubmit={handleSaveAnnouncement}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 380px" }}>
                  <input
                    type="text"
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    placeholder="Escribe el texto para la barra de promociones..."
                    style={{
                      width: "100%",
                      padding: "11px 15px",
                      border: "1.5px solid #a4d4b8",
                      borderRadius: "6px",
                      fontSize: "13.5px",
                      color: "#15241e",
                      background: "#ffffff",
                      outline: "none",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
                    }}
                    maxLength={160}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "11px 22px",
                    background: "#137748",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(19, 119, 72, 0.25)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#0f5f3a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#137748")}
                >
                  <i className="bi bi-check2-circle" style={{ fontSize: "15px" }}></i>
                  Guardar Texto
                </button>

                <button
                  type="button"
                  onClick={handleResetAnnouncement}
                  className="btn-cita-outline"
                  style={{
                    background: "#ffffff",
                    borderColor: "#cad5ce",
                    color: "#4e6056",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                  title="Restablecer al texto predeterminado"
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Restaurar Original
                </button>
              </form>
            </div>

            {/* Navegador Visual por Secciones del Inicio */}
            <div style={{ margin: "26px 0 20px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#162720" }}>
                  <i className="bi bi-layers-fill" style={{ color: "var(--platino-green-dark)" }}></i> Modificar por Secciones del Inicio:
                </span>
                <span style={{ fontSize: "13px", color: "#6b7a72" }}>
                  Mostrando <strong>{filteredHomeItems.length}</strong> fotos configurables
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {HOME_SECTIONS.map((sec) => {
                  const isActive = homeSectionFilter === sec.section;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setHomeSectionFilter(sec.section)}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "20px",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        border: isActive ? "1.5px solid var(--platino-green-dark)" : "1px solid #d4ded8",
                        background: isActive ? "#0b2820" : "#ffffff",
                        color: isActive ? "#ffffff" : "#45584e",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        transition: "all 0.2s ease",
                        boxShadow: isActive ? "0 2px 8px rgba(11, 40, 32, 0.22)" : "none",
                      }}
                    >
                      <i className={`bi ${sec.icon}`} style={{ color: isActive ? "#7ce3a7" : "#6a7b72" }}></i>
                      {sec.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EDITOR ESPECÍFICO: Anillos dignos de obsesión (Título principal + Subtítulo) */}
            {homeSectionFilter === "Anillos dignos de obsesión" && (
              <div style={{ background: "#fbfaf7", border: "1.5px solid #e7dfd1", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "22px" }}>💍</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "16px", color: "#15241e", fontWeight: "700" }}>
                      Textos del Encabezado de Anillos
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#5d6d65" }}>
                      Personaliza el título principal y subtítulo que se muestran encima de los 6 estilos de anillos.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "5px" }}>
                      Título Principal de la Sección:
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px" }}
                      value={homeImagesData.sectionRingStyles?.title || "Anillos de compromiso dignos de obsesión"}
                      onChange={(e) => {
                        const updated = {
                          ...homeImagesData,
                          sectionRingStyles: {
                            ...homeImagesData.sectionRingStyles,
                            title: e.target.value,
                          },
                        };
                        setHomeImagesData(updated);
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "5px" }}>
                      Subtítulo de la Sección:
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px" }}
                      value={homeImagesData.sectionRingStyles?.subtitle || "Arte y artesanía en cada detalle."}
                      onChange={(e) => {
                        const updated = {
                          ...homeImagesData,
                          sectionRingStyles: {
                            ...homeImagesData.sectionRingStyles,
                            subtitle: e.target.value,
                          },
                        };
                        setHomeImagesData(updated);
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSaveSectionHeader(
                      "sectionRingStyles",
                      homeImagesData.sectionRingStyles?.title || "Anillos de compromiso dignos de obsesión",
                      homeImagesData.sectionRingStyles?.subtitle || "Arte y artesanía en cada detalle."
                    )
                  }
                  style={{
                    background: "#137748",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "5px",
                    padding: "9px 18px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="bi bi-check-lg"></i> Guardar Título y Subtítulo de Sección
                </button>
              </div>
            )}

            {/* VISTA ESPECÍFICA: The Fall Edit & The New Classics (2 Cuadros: 1 de Textos + 1 de las 7 Fotos) */}
            {homeSectionFilter === "The Fall Edit & The New Classics" && (
              <div style={{ marginBottom: "26px" }}>
                {/* CUADRO 1: SOLO TEXTOS DE LA SECCIÓN */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #d8e5df",
                    borderRadius: "10px",
                    padding: "24px",
                    marginBottom: "24px",
                    boxShadow: "0 2px 8px rgba(11, 40, 32, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                    <span style={{ fontSize: "24px" }}>📝</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "17px", color: "#11261e", fontWeight: "700" }}>
                        Cuadro de Textos de la Sección
                      </h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "#5d6d65" }}>
                        Aquí solo modificas los textos y títulos de esta sección (lado izquierdo y lado derecho).
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", marginBottom: "18px" }}>
                    {/* Columna Izquierda: The Fall Edit */}
                    <div style={{ background: "#f8fbf9", border: "1px solid #dbeae2", borderRadius: "8px", padding: "18px" }}>
                      <h5 style={{ margin: "0 0 14px 0", fontSize: "14px", color: "#0c3b28", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="bi bi-fonts"></i> Lado Izquierdo (The Fall Edit)
                      </h5>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#253c30", marginBottom: "4px" }}>
                          Título Principal:
                        </label>
                        <input
                          type="text"
                          className="filter-select"
                          style={{ width: "100%", height: "40px" }}
                          value={homeImagesData.editorialFall?.title || "The Fall Edit"}
                          onChange={(e) => {
                            setHomeImagesData({
                              ...homeImagesData,
                              editorialFall: { ...homeImagesData.editorialFall, title: e.target.value },
                            });
                          }}
                          placeholder="Ej. The Fall Edit"
                        />
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#253c30", marginBottom: "4px" }}>
                          Subtítulo / Párrafo:
                        </label>
                        <textarea
                          className="filter-select"
                          style={{ width: "100%", height: "70px", padding: "8px 12px", resize: "vertical" }}
                          value={homeImagesData.editorialFall?.subtitle || ""}
                          onChange={(e) => {
                            setHomeImagesData({
                              ...homeImagesData,
                              editorialFall: { ...homeImagesData.editorialFall, subtitle: e.target.value },
                            });
                          }}
                          placeholder="Descripción..."
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#253c30", marginBottom: "4px" }}>
                          Texto del Botón:
                        </label>
                        <input
                          type="text"
                          className="filter-select"
                          style={{ width: "100%", height: "40px" }}
                          value={homeImagesData.editorialFall?.buttonText || "SHOP NOW"}
                          onChange={(e) => {
                            setHomeImagesData({
                              ...homeImagesData,
                              editorialFall: { ...homeImagesData.editorialFall, buttonText: e.target.value },
                            });
                          }}
                          placeholder="Ej. SHOP NOW"
                        />
                      </div>
                    </div>

                    {/* Columna Derecha: The New Classics */}
                    <div style={{ background: "#fbfaf7", border: "1px solid #e7ded0", borderRadius: "8px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <h5 style={{ margin: "0 0 14px 0", fontSize: "14px", color: "#1e2e26", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="bi bi-type-italic"></i> Lado Derecho (The New Classics)
                        </h5>

                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#253c30", marginBottom: "4px" }}>
                            Título Central en Cursiva sobre el Collage:
                          </label>
                          <input
                            type="text"
                            className="filter-select"
                            style={{ width: "100%", height: "40px" }}
                            value={homeImagesData.editorialClassics?.title || "The New Classics"}
                            onChange={(e) => {
                              setHomeImagesData({
                                ...homeImagesData,
                                editorialClassics: { ...homeImagesData.editorialClassics, title: e.target.value },
                              });
                            }}
                            placeholder="Ej. The New Classics"
                          />
                          <small style={{ fontSize: "11.5px", color: "#748178", marginTop: "6px", display: "block" }}>
                            Este texto se dibuja en caligrafía script blanca sobre las 6 fotos pegadas del collage.
                          </small>
                        </div>
                      </div>

                      <div style={{ marginTop: "20px", padding: "12px 14px", background: "#f0efe9", borderRadius: "6px", fontSize: "12px", color: "#546259" }}>
                        <i className="bi bi-info-circle"></i> Los cambios de texto se reflejan en tiempo real en la tienda al hacer clic en Guardar.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveFallEditTexts}
                    style={{
                      background: "#137748",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "11px 24px",
                      fontSize: "13.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 2px 6px rgba(19, 119, 72, 0.2)",
                    }}
                  >
                    <i className="bi bi-check2-circle" style={{ fontSize: "16px" }}></i> Guardar Todos los Textos de la Sección
                  </button>
                </div>

                {/* CUADRO 2: CUADRO DE LAS 7 FOTOGRAFÍAS */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #d8e5df",
                    borderRadius: "10px",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(11, 40, 32, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "24px" }}>🖼️</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "17px", color: "#11261e", fontWeight: "700" }}>
                          Cuadro de Fotografías (7 Fotos en total)
                        </h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "#5d6d65" }}>
                          Aquí solo cambias las fotos que se muestran en esta sección: 1 foto editorial izquierda y las 6 fotos del collage pegado derecho.
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", background: "#e8f4ed", color: "#137748", padding: "4px 12px", borderRadius: "12px", fontWeight: "700" }}>
                      1 Foto Editorial + 6 Fotos de Collage
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "20px", alignItems: "stretch" }}>
                    {/* Foto 1: Editorial Izquierda */}
                    <div style={{ border: "1.5px solid #c9dcd1", borderRadius: "8px", overflow: "hidden", background: "#fbfcfb", display: "flex", flexDirection: "column" }}>
                      <div style={{ padding: "12px 16px", background: "#f2f8f4", borderBottom: "1px solid #dbe9df", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "13px", color: "#0c3b28" }}>Foto 1: Editorial Izquierda (The Fall Edit)</strong>
                        <span style={{ fontSize: "11px", background: "#0b2820", color: "#ffffff", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>Principal</span>
                      </div>
                      <div style={{ position: "relative", height: "320px", overflow: "hidden", background: "#0c231b" }}>
                        <img
                          src={homeImagesData.editorialFall?.image || "/images/editorial-fall.jpg"}
                          alt="Foto Editorial"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "/images/editorial-fall.jpg";
                          }}
                        />
                        <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", background: "rgba(11, 40, 32, 0.82)", backdropFilter: "blur(4px)", padding: "10px 14px", borderRadius: "6px", color: "#ffffff" }}>
                          <div style={{ fontSize: "15px", fontFamily: "var(--font-serif)", fontWeight: "600" }}>{homeImagesData.editorialFall?.title || "The Fall Edit"}</div>
                          <div style={{ fontSize: "11.5px", opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{homeImagesData.editorialFall?.subtitle}</div>
                        </div>
                      </div>
                      <div style={{ padding: "14px 16px", background: "#ffffff", borderTop: "1px solid #e7efe9" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditHomeImage("editorialFall", homeImagesData.editorialFall || {})}
                          className="btn-catalog-create"
                          style={{ width: "100%", justifyContent: "center", padding: "9px" }}
                        >
                          <i className="bi bi-camera"></i> Cambiar Foto 1 (Editorial)
                        </button>
                      </div>
                    </div>

                    {/* Fotos 2 a 7: Mosaico 6 Fotos */}
                    <div style={{ border: "1.5px solid #c9dcd1", borderRadius: "8px", overflow: "hidden", background: "#fbfcfb", display: "flex", flexDirection: "column" }}>
                      <div style={{ padding: "12px 16px", background: "#f2f8f4", borderBottom: "1px solid #dbe9df", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "13px", color: "#0c3b28" }}>Fotos 2 a 7: Collage Continuo (The New Classics)</strong>
                        <span style={{ fontSize: "11px", background: "#137748", color: "#ffffff", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>6 Fotos</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: "4px", padding: "8px", background: "#0c231b", flex: 1, minHeight: "320px" }}>
                        {[
                          { key: "mosaic1", num: 2, label: "Pieza 1" },
                          { key: "mosaic2", num: 3, label: "Pieza 2" },
                          { key: "mosaic3", num: 4, label: "Pieza 3" },
                          { key: "mosaic4", num: 5, label: "Pieza 4" },
                          { key: "mosaic5", num: 6, label: "Pieza 5" },
                          { key: "mosaic6", num: 7, label: "Pieza 6" },
                        ].map(({ key, num, label }) => {
                          const item = homeImagesData[key] || {};
                          return (
                            <div
                              key={key}
                              style={{
                                position: "relative",
                                aspectRatio: "1",
                                overflow: "hidden",
                                borderRadius: "3px",
                                background: "#17372b",
                              }}
                            >
                              <img
                                src={item.image || `/images/${key}.jpg`}
                                alt={label}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  e.target.src = "/images/cat-compromiso.jpg";
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "rgba(0, 0, 0, 0.45)",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  padding: "6px",
                                  textAlign: "center",
                                }}
                              >
                                <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                                  Foto {num} ({label})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditHomeImage(key, item)}
                                  style={{
                                    border: "none",
                                    background: "#ffffff",
                                    color: "#0b2820",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <i className="bi bi-camera-fill"></i> Cambiar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ padding: "10px 14px", background: "#f8fbf9", borderTop: "1px solid #e7efe9", fontSize: "12px", color: "#506357", textAlign: "center" }}>
                        <i className="bi bi-magic"></i> Cada una de estas 6 fotos tiene efecto <strong>Zoom interactivo</strong> en la tienda al pasar el mouse.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDITOR ESPECÍFICO: Showroom & Sedes (1 o 2 Fotos Opcionales + Textos) */}
            {homeSectionFilter === "Nuestras Sedes & Showroom" && (
              <div style={{ background: "#fbfaf7", border: "1.5px solid #e7dfd1", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "22px" }}>🏛️</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "16px", color: "#15241e", fontWeight: "700" }}>
                      Textos de la Sección de Sedes y Showroom
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#5d6d65" }}>
                      Configura el título principal, subtítulo y si deseas mostrar 1 o 2 fotografías del Showroom / Sedes en la tienda.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "5px" }}>
                      Título Principal:
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px" }}
                      value={homeImagesData.showroom?.title || "Estamos aquí para ti, en persona y en línea"}
                      onChange={(e) => {
                        const updated = {
                          ...homeImagesData,
                          showroom: {
                            ...homeImagesData.showroom,
                            title: e.target.value,
                          },
                        };
                        setHomeImagesData(updated);
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "5px" }}>
                      Subtítulo / Descripción:
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px" }}
                      value={homeImagesData.showroom?.subtitle || "Ya sea en una tienda cercana a usted o en línea, seleccionamos su cita solo para usted."}
                      onChange={(e) => {
                        const updated = {
                          ...homeImagesData,
                          showroom: {
                            ...homeImagesData.showroom,
                            subtitle: e.target.value,
                          },
                        };
                        setHomeImagesData(updated);
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSaveSectionHeader(
                      "showroom",
                      homeImagesData.showroom?.title || "Estamos aquí para ti, en persona y en línea",
                      homeImagesData.showroom?.subtitle || "Ya sea en una tienda cercana a usted o en línea, seleccionamos su cita solo para usted."
                    )
                  }
                  style={{
                    background: "#137748",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "5px",
                    padding: "9px 18px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="bi bi-check-lg"></i> Guardar Textos de Showroom
                </button>
              </div>
            )}

            {/* Grid de Tarjetas de Imágenes (para todas las demás secciones) */}
            {homeSectionFilter !== "The Fall Edit & The New Classics" && (
              <div className="home-images-grid">
                {filteredHomeItems.map(([key, item]) => {
                  // Caso especial: segunda foto opcional de showroom sin asignar
                  if (key === "showroomSecondary" && !item.image) {
                    return (
                      <div
                        key={key}
                        className="home-image-card"
                        style={{ border: "2px dashed #b5c7bd", background: "#fbfcfb", alignItems: "center", justifyContent: "center", padding: "30px 20px", textAlign: "center" }}
                        >
                        <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#edf4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "var(--platino-green-dark)", marginBottom: "14px" }}>
                          <i className="bi bi-image"></i>
                        </div>
                        <span className="home-section-badge">Nuestras Sedes & Showroom</span>
                        <h4 className="home-image-card-title" style={{ fontSize: "15px", marginTop: "4px" }}>
                          Foto 2 del Showroom (Opcional)
                        </h4>
                        <p className="home-image-card-desc" style={{ fontSize: "12.5px" }}>
                          Actualmente solo se muestra 1 fotografía en la tienda. Si deseas mostrar dos sedes o una vista complementaria en paralelo, sube una 2da foto aquí.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenEditHomeImage(key, item)}
                          className="btn-change-home-image"
                          style={{ marginTop: "10px" }}
                        >
                          <i className="bi bi-plus-circle"></i> Agregar 2da Foto
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="home-image-card">
                      <div className="home-image-card-thumb-wrapper">
                        <img
                          src={item.image}
                          alt={item.label || item.name || key}
                          className="home-image-card-thumb"
                          onError={(e) => {
                            e.target.src = "/images/cat-compromiso.jpg";
                          }}
                        />
                      </div>

                      <div className="home-image-card-body">
                        <span className="home-section-badge">{item.section}</span>
                        <h4 className="home-image-card-title">{item.label || item.name}</h4>
                        <p className="home-image-card-desc">
                          {item.name ? (
                            <>
                              <strong>Título visible abajo:</strong> "{item.name}"
                            </>
                          ) : item.description || item.subtitle || (item.path ? `Enlace: ${item.path}` : "Fotografía destacada del inicio")}
                        </p>

                        <div className="home-image-card-footer">
                          <button
                            type="button"
                            onClick={() => handleOpenEditHomeImage(key, item)}
                            className="btn-change-home-image"
                            title="Cambiar fotografía y título"
                          >
                            <i className="bi bi-camera"></i> Cambiar Foto y Título
                          </button>

                          {key === "showroomSecondary" && item.image && (
                            <button
                              type="button"
                              onClick={handleRemoveSecondaryShowroom}
                              className="btn-card-delete"
                              title="Quitar esta segunda foto (volver a 1 sola foto)"
                              style={{ padding: "8px 12px", fontSize: "12px" }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal de Crear / Modificar Joya e Imagen */}
        {productModalOpen && (
          <div
            className="catalog-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setProductModalOpen(false);
            }}
          >
            <div className="catalog-modal-card" role="dialog" aria-modal="true">
              <button
                className="auth-modal-close"
                onClick={() => setProductModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <div className="catalog-modal-header">
                <h2>
                  {editingProduct
                    ? `Modificar Joya: ${editingProduct.name}`
                    : "Crear Nueva Joya en Catálogo"}
                </h2>
                <p>
                  Actualiza los datos, precio y la fotografía del producto. Los cambios se sincronizan en vivo en la tienda.
                </p>
              </div>

              <form onSubmit={handleSaveProduct} className="catalog-modal-form">
                <div className="catalog-form-row">
                  <div className="catalog-form-group">
                    <label>Nombre de la Joya *</label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      placeholder="Ej. Anillo Solitario Especular"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="catalog-form-group">
                    <label>Categoría Principal *</label>
                    <select
                      className="catalog-form-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required
                    >
                      <option value="aros-boda">Aros de Boda y Matrimonio</option>
                      <option value="anillo-compromiso">Anillo de Compromiso</option>
                      <option value="anillo-promesa">Anillo de Promesa</option>
                      <option value="aros-alianzas">Aros de Alianzas</option>
                      <option value="joyeria">Joyería y Accesorios</option>
                      <option value="collares">Collares</option>
                      <option value="pulseras">Pulseras</option>
                      <option value="regalos">Regalos</option>
                    </select>
                  </div>
                </div>

                <div className="catalog-form-row">
                  <div className="catalog-form-group">
                    <label>Precio en Soles (S/.) *</label>
                    <input
                      type="number"
                      className="catalog-form-input"
                      placeholder="Ej. 2850"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      required
                      min="0"
                    />
                  </div>

                  <div className="catalog-form-group">
                    <label>Tipo de Joya / Flujo *</label>
                    <select
                      className="catalog-form-select"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="anillo">Anillo (Gema + 1 Talla + Platino Care)</option>
                      <option value="aros">Aros de Boda (Doble Talla Dama y Varón)</option>
                      <option value="accesorio">Accesorio (Collar/Pulsera + Empaque de Lujo)</option>
                    </select>
                  </div>
                </div>

                <div className="catalog-form-row">
                  <div className="catalog-form-group">
                    <label>Insignia / Badge (Opcional)</label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      placeholder="Ej. Más vendido, Nuevo, Diamante 1.5ct..."
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                    />
                  </div>

                  <div className="catalog-form-group">
                    <label>Subtítulo de Colección (Opcional)</label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      placeholder="Ej. Platino Perú Joyería Fina"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                    />
                  </div>
                </div>

                {/* SECCIÓN DE MODIFICAR / SUBIR FOTO */}
                <div className="catalog-form-group">
                  <label>Fotografía de la Joya *</label>
                  <div className="catalog-image-section">
                    <div className="catalog-image-preview">
                      <img
                        src={formImage}
                        alt="Vista previa"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/cat-compromiso.jpg";
                        }}
                      />
                    </div>

                    <div className="catalog-image-controls">
                      <div>
                        <label style={{ fontSize: "12px", color: "#55645c", display: "block", marginBottom: "4px" }}>
                          Ruta o URL de Imagen:
                        </label>
                        <input
                          type="text"
                          className="catalog-form-input"
                          placeholder="/images/nombre-joya.jpg o https://..."
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "#137748", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                          <i className="bi bi-cloud-arrow-up"></i> O subir foto desde tu PC / Teléfono:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          style={{ fontSize: "12.5px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="catalog-form-group">
                  <label>Descripción de la Joya</label>
                  <textarea
                    className="catalog-form-textarea"
                    placeholder="Describe los acabados, piedras, características y valor artesanal de la joya..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  ></textarea>
                </div>

                <div className="catalog-modal-actions">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="btn-card-delete"
                    style={{ background: "#f5f7f6", color: "#4f5f57", border: "1px solid #d4ded8" }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn-catalog-create"
                    style={{ padding: "11px 26px" }}
                  >
                    <i className="bi bi-check-lg"></i>{" "}
                    {editingProduct ? "Guardar Cambios" : "Crear Joya"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: EDITAR FOTOGRAFÍA / TEXTOS DEL INICIO
            ======================================================== */}
        {homeImageModalOpen && editingHomeKey && (
          <div
            className="catalog-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setHomeImageModalOpen(false);
            }}
          >
            <div
              className="catalog-modal-card"
              style={{ maxWidth: "600px" }}
              role="dialog"
              aria-modal="true"
            >
              <button
                className="auth-modal-close"
                onClick={() => setHomeImageModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <div className="catalog-modal-header">
                <h2>Cambiar Imagen de Portada</h2>
                <p>
                  <strong>{homeImagesData[editingHomeKey]?.label || editingHomeKey}</strong> &nbsp;·&nbsp;
                  <span style={{ color: "#137748", fontWeight: "600" }}>
                    {homeImagesData[editingHomeKey]?.section}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSaveHomeImage} className="catalog-modal-form">
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "2px solid #ddd",
                      background: "#f9f8f5",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={formHomeImageSrc || "/images/cat-compromiso.jpg"}
                      alt="Vista previa"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "/images/cat-compromiso.jpg";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: "220px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "12.5px",
                          fontWeight: "700",
                          color: "#137748",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        <i className="bi bi-cloud-arrow-up"></i> Subir foto desde tu dispositivo:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHomeImageFileUpload}
                        style={{ fontSize: "12.5px" }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: "12.5px",
                          fontWeight: "600",
                          color: "#304037",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        O ingresar URL de imagen:
                      </label>
                      <input
                        type="text"
                        className="catalog-form-input"
                        placeholder="https://... o /images/..."
                        value={formHomeImageSrc}
                        onChange={(e) => setFormHomeImageSrc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Campo de Título / Nombre visible (se oculta para piezas individuales del mosaico) */}
                {!editingHomeKey?.startsWith("mosaic") && (
                  <div className="catalog-form-group">
                    <label>Título / Nombre inferior visible en la tienda</label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      value={formHomeImageTitle}
                      onChange={(e) => setFormHomeImageTitle(e.target.value)}
                      placeholder="Ej. Anillos solitarios, etc."
                    />
                    <small style={{ fontSize: "11.5px", color: "#65766c", marginTop: "4px", display: "block" }}>
                      Este texto se muestra como título o descripción debajo de la fotografía en la página de inicio.
                    </small>
                  </div>
                )}

                {homeImagesData[editingHomeKey]?.subtitle !== undefined && (
                  <div className="catalog-form-group">
                    <label>Subtítulo o Frase</label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      value={formHomeImageSubtitle}
                      onChange={(e) => setFormHomeImageSubtitle(e.target.value)}
                    />
                  </div>
                )}

                {homeImagesData[editingHomeKey]?.buttonText !== undefined && (
                  <div className="catalog-form-group">
                    <label>Texto del Botón</label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      value={formHomeImageButtonText}
                      onChange={(e) => setFormHomeImageButtonText(e.target.value)}
                    />
                  </div>
                )}

                <div className="catalog-modal-actions">
                  <button
                    type="button"
                    onClick={() => setHomeImageModalOpen(false)}
                    className="btn-card-delete"
                    style={{ background: "#f5f7f6", color: "#4f5f57", border: "1px solid #d4ded8" }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn-catalog-create"
                    style={{ padding: "11px 24px" }}
                  >
                    <i className="bi bi-check-lg"></i> Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
