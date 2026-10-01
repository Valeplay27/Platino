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
  DEFAULT_ANNOUNCEMENT,
} from "../services/homeImagesService";
import { useAuth } from "../context/useAuth";
import "../../styles/citas.css";

// Función para obtener fecha local de mañana
const getTomorrowLocalDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
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
  const [blockDate, setBlockDate] = useState(() => getTomorrowLocalDateString());
  const [blockReason, setBlockReason] = useState("");

  // Estado para la Línea Verde Superior (Barra de Anuncios)
  const [announcementInput, setAnnouncementInput] = useState(() => getAnnouncementText());

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

  // Bloquear un slot específico
  const handleBlockSlot = (time) => {
    const reason = blockReason.trim() || "Bloqueo por administración";
    blockSlot(blockSedeId, blockDate, time, reason);
    setBlockReason("");
    loadData();
  };

  // Bloquear día completo
  const handleBlockFullDay = () => {
    const reason = blockReason.trim() || "Día no laborable / Evento privado";
    blockSlot(blockSedeId, blockDate, "FULL_DAY", reason);
    setBlockReason("");
    loadData();
  };

  // Desbloquear slot
  const handleUnblock = (blockId) => {
    unblockSlot(blockId);
    loadData();
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
    if (formHomeImageTitle) {
      if (homeImagesData[editingHomeKey]?.name !== undefined) {
        extras.name = formHomeImageTitle;
      }
      if (homeImagesData[editingHomeKey]?.title !== undefined) {
        extras.title = formHomeImageTitle;
      }
    }
    if (formHomeImageSubtitle && homeImagesData[editingHomeKey]?.subtitle !== undefined) {
      extras.subtitle = formHomeImageSubtitle;
    }
    if (formHomeImageButtonText && homeImagesData[editingHomeKey]?.buttonText !== undefined) {
      extras.buttonText = formHomeImageButtonText;
    }

    const updated = updateSingleHomeImage(editingHomeKey, formHomeImageSrc, extras);
    setHomeImagesData(updated);
    setHomeImageModalOpen(false);
    setFeedbackMsg(
      `Imagen de "${homeImagesData[editingHomeKey]?.label || editingHomeKey}" actualizada correctamente.`
    );
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
      setFeedbackMsg("Se restauró el texto original de la barra verde superior.");
      setTimeout(() => setFeedbackMsg(""), 4500);
    }
  };

  // Filtrado de elementos del Inicio
  const filteredHomeItems = Object.entries(homeImagesData).filter(([, item]) => {
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
                  Selecciona la sede y la fecha para inspeccionar los horarios. Puedes bloquear horas puntuales o el día completo para que ningún cliente pueda agendar en esos momentos.
                </p>
              </div>

              <div className="blocking-panel">
                {/* Lado Izquierdo: Configuración del Bloqueo */}
                <div className="blocking-config-box">
                  <h3 className="blocking-config-title">
                    Configurar Bloqueo
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "#66726b", marginBottom: "18px" }}>
                    Cierra turnos de atención para capacitaciones, feriados o mantenimiento.
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
                      Fecha:
                    </label>
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="filter-select"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div className="form-field" style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "6px" }}>
                    Motivo del Bloqueo (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Capacitación de gemología, Auditoría, Feriado..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="filter-select"
                    style={{ width: "100%" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBlockFullDay}
                  className="btn-toggle-slot block"
                  style={{ width: "100%", padding: "12px", fontSize: "13.5px", borderRadius: "6px" }}
                >
                  <i className="bi bi-calendar-x"></i> Bloquear Día Completo para esta Sede
                </button>

                {/* Grilla interactiva de horas para la sede y fecha seleccionada */}
                <h4 style={{ margin: "24px 0 12px 0", fontSize: "15px", fontWeight: "700", color: "#1c2822" }}>
                  Horarios del día ({blockDate}):
                </h4>
                <div className="admin-slots-grid">
                  {TIME_SLOTS.map((time) => {
                    const statusCheck = isSlotBlocked(blockSedeId, blockDate, time);
                    const isBlocked = statusCheck.blocked;

                    // Verificar si es un bloqueo manual de la lista
                    const specificBlock = blockedList.find(
                      (b) =>
                        b.sedeId === blockSedeId &&
                        b.date === blockDate &&
                        (b.time === time || b.time === "FULL_DAY")
                    );

                    return (
                      <div
                        key={time}
                        className={`admin-slot-card ${isBlocked ? "is-blocked" : ""}`}
                      >
                        <div>
                          <div className="slot-time-text">{time}</div>
                          {isBlocked ? (
                            <span style={{ fontSize: "11.5px", color: "#b9423c", fontWeight: "500" }}>
                              {statusCheck.reason}
                            </span>
                          ) : (
                            <span style={{ fontSize: "11.5px", color: "#1e7048", fontWeight: "600" }}>
                              Disponible
                            </span>
                          )}
                        </div>

                        {specificBlock ? (
                          <button
                            type="button"
                            onClick={() => handleUnblock(specificBlock.id)}
                            className="btn-toggle-slot unblock"
                            title="Desbloquear este horario para permitir citas"
                          >
                            Desbloquear
                          </button>
                        ) : isBlocked ? (
                          <span style={{ fontSize: "12px", color: "#77857e", fontWeight: "500" }}>Cita activa</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBlockSlot(time)}
                            className="btn-toggle-slot block"
                            title="Bloquear este horario a los clientes"
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
                <p style={{ fontSize: "14px", color: "#4f5f56", marginBottom: "20px", lineHeight: "1.5" }}>
                  Lista de todos los intervalos y días que la administración ha cerrado temporalmente.
                </p>

                {blockedList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", background: "#faf8f4", borderRadius: "8px", color: "#77857e", fontSize: "14px" }}>
                    No hay bloqueos manuales activos en el sistema. Todos los horarios regulares están libres.
                  </div>
                ) : (
                  <div className="active-blocks-list">
                    {blockedList.map((block) => {
                      const sede = sedesData.find((s) => s.id === block.sedeId);
                      return (
                        <div key={block.id} className="active-block-item">
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "14.5px", color: "#15241e" }}>
                              {sede?.name || block.sedeId}
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
                )}
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
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      background: "#0b2820",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      letterSpacing: "0.3px",
                    }}
                  >
                    <i className="bi bi-broadcast" style={{ color: "#7ce3a7" }}></i> Barra de Promociones Activa
                  </span>
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
                    background: "#0b2820",
                    color: "#ffffff",
                    padding: "9px 18px",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "500",
                    letterSpacing: "0.4px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    border: "1px solid #144033",
                  }}
                >
                  <span>{announcementInput || DEFAULT_ANNOUNCEMENT}</span>
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

            {/* Filtros de sección del Inicio */}
            <div className="catalog-admin-filters" style={{ marginTop: "18px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e2e26" }}>
                  Filtrar por Sección:
                </span>
                <select
                  value={homeSectionFilter}
                  onChange={(e) => setHomeSectionFilter(e.target.value)}
                  className="filter-select"
                  style={{ minWidth: "260px" }}
                >
                  <option value="todas">Todas las Secciones del Inicio</option>
                  <option value="Banners Principales (Hero)">Banners Principales (Hero)</option>
                  <option value="Comprar joyas por categoría">Comprar joyas por categoría</option>
                  <option value="Anillos dignos de obsesión">Anillos dignos de obsesión</option>
                  <option value="Secciones Editoriales">Secciones Editoriales & Boutique</option>
                  <option value="Mosaico 'The New Classics'">Mosaico 'The New Classics'</option>
                </select>

                <span style={{ fontSize: "13px", color: "#6b7a72", marginLeft: "auto" }}>
                  Mostrando {filteredHomeItems.length} elementos configurables
                </span>
              </div>
            </div>

            {/* Grid de Tarjetas de Imágenes */}
            <div className="home-images-grid">
              {filteredHomeItems.map(([key, item]) => (
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
                      {item.description || item.subtitle || (item.path ? `Enlace: ${item.path}` : "Fotografía destacada del inicio")}
                    </p>

                    <div className="home-image-card-footer">
                      <button
                        type="button"
                        onClick={() => handleOpenEditHomeImage(key, item)}
                        className="btn-change-home-image"
                        title="Cambiar fotografía y textos"
                      >
                        <i className="bi bi-camera"></i> Cambiar Imagen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

                {/* Campos condicionales si el elemento admite texto */}
                {(homeImagesData[editingHomeKey]?.title !== undefined ||
                  homeImagesData[editingHomeKey]?.name !== undefined) && (
                  <div className="catalog-form-group">
                    <label>Título / Nombre visible en la tarjeta</label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      value={formHomeImageTitle}
                      onChange={(e) => setFormHomeImageTitle(e.target.value)}
                    />
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
