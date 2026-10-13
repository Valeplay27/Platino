import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
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
import {
  DAMA_SIZES,
  VARON_SIZES,
  getProductStock,
  updateProductStock,
  updateSingleStockItem,
  updateMultipleStockItems,
  copyProductStockToTargets,
  saveAllInventory,
  getAllStoredInventory,
  getProductTotalStockStats,
  generateDefaultProductStock,
} from "../services/inventoryService";
import {
  getOrders,
  updateOrderStatus,
  ORDER_STAGES,
  getOrderStageInfo,
  getClientStageInfo,
  deleteOrder,
  updateOrderPayment,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  getOrderSedeId,
  WORKSHOP_JEWELERS,
  WORKSHOP_PROCESSES,
  WORKSHOP_DELIVERY_CHOICES,
  WORKSHOP_BOX_OPTIONS,
  updateOrderWorkshopFields,
} from "../services/ordersService";
import { METALS, formatPrice, MASTER_GEM_SHAPES } from "../data/products";
import { DiamondCutIcon } from "../components/GemstoneIcons";
import { useAuth } from "../context/useAuth";
import {
  ADMIN_ACCOUNTS,
  getAdminAccounts,
  updateAdminPassword,
  PERMISSIONS_CATALOG,
  getPermissionsMatrix,
  savePermissionsMatrix,
  isMasterAdmin,
  hasPermission,
  requestPermission,
  getPermissionRequests,
  approvePermissionRequest,
  rejectPermissionRequest,
  toggleUserPermission,
  getActivePendingRequest,
  getDailyAdminRecoveryCodeInfo,
  validateDailyAdminRecoveryCode,
  rotateDailyAdminRecoveryCode,
  getPasswordRecoveryLogs,
} from "../services/permissionsService";
import { getReclamaciones } from "../services/reclamacionesService";
import AdminReclamacionesTab from "../components/AdminReclamacionesTab";
import AdminPlatinoCareTab from "../components/AdminPlatinoCareTab";
import AdminGemstonesTab from "../components/AdminGemstonesTab";
import { compressImageFile } from "../utils/imageCompressor";
import "../../styles/citas.css";
import "../../styles/orders.css";

// Función para obtener la fecha mínima para bloqueo (1 día de anticipación a partir de mañana)
const getMinBlockDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ========================================================
// ICONOS SVG LUXURY PARA LA BARRA DE CATEGORÍAS
// (Anillos, Collares, Aretes, Pulseras, Otros)
// ========================================================
const AnillosIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5l2.2 2.5H9.8L12 2.5z" />
    <circle cx="12" cy="14" r="7" />
  </svg>
);

const CollaresIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4c0 7 3.5 13 8 13s8-6 8-13" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const AretesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3v3a3 3 0 0 0-3 3c0 2 1.5 3.5 3 3.5s3-1.5 3-3.5a3 3 0 0 0-3-3" />
    <path d="M17 3v3a3 3 0 0 0-3 3c0 2 1.5 3.5 3 3.5s3-1.5 3-3.5a3 3 0 0 0-3-3" />
  </svg>
);

const PulserasIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7.5" strokeDasharray="2.5 3" />
    <circle cx="12" cy="4.5" r="1.5" fill="currentColor" />
    <circle cx="19.5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="19.5" r="1.5" fill="currentColor" />
    <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const OtrosIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const TodasIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const PRODUCT_CATEGORY_GROUPS = [
  { id: "anillos", label: "Anillos", Icon: AnillosIcon },
  { id: "collares", label: "Collares", Icon: CollaresIcon },
  { id: "aretes", label: "Aretes", Icon: AretesIcon },
  { id: "pulseras", label: "Pulseras", Icon: PulserasIcon },
  { id: "otros", label: "Otros", Icon: OtrosIcon },
];

const getProductCategoryGroup = (prod) => {
  if (!prod) return "otros";
  const cat = (prod.category || "").toLowerCase();
  const cats = Array.isArray(prod.categories) ? prod.categories.map((c) => String(c).toLowerCase()) : [];
  const type = (prod.type || "").toLowerCase();
  const name = (prod.name || "").toLowerCase();

  const all = [cat, ...cats, type, name].join(" ");

  if (
    all.includes("anillo") ||
    all.includes("aro") ||
    all.includes("boda") ||
    all.includes("matrimonio") ||
    all.includes("alianza") ||
    all.includes("promesa") ||
    all.includes("solitario")
  ) {
    return "anillos";
  }
  if (all.includes("collar") || all.includes("dije") || all.includes("gargantilla")) {
    return "collares";
  }
  if (all.includes("arete") || all.includes("pendiente") || all.includes("dormilona")) {
    return "aretes";
  }
  if (all.includes("pulsera") || all.includes("brazalete") || all.includes("esclava")) {
    return "pulseras";
  }
  return "otros";
};

export default function AdminCitas() {
  const { user, isAdmin, openAuthModal, usersDb, findUserByDniOrEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromLocation = useCallback(() => {
    if (location.pathname === "/admin/pedidos") return "pedidos";
    if (location.pathname === "/admin/inventario") return "inventario";
    if (
      location.pathname === "/admin/finanzas" ||
      location.pathname === "/admin/ganancias" ||
      location.pathname === "/admin/pagos"
    )
      return "finanzas";
    if (
      location.pathname === "/admin/catalogo" ||
      location.pathname === "/admin/portafolio"
    )
      return "catalogo";
    if (
      location.pathname === "/admin/imagenes" ||
      location.pathname === "/admin/banners" ||
      location.pathname === "/admin/home"
    )
      return "home_images";
    if (
      location.pathname === "/admin/permisos" ||
      searchParams.get("tab") === "permisos"
    )
      return "permisos";
    if (
      location.pathname === "/admin/claves" ||
      searchParams.get("tab") === "claves"
    )
      return "claves";
    if (
      location.pathname === "/admin/reclamaciones" ||
      location.pathname === "/admin/libro-reclamaciones" ||
      searchParams.get("tab") === "reclamaciones" ||
      searchParams.get("tab") === "libro-reclamaciones"
    )
      return "reclamaciones";
    if (
      location.pathname === "/admin/platino-care" ||
      location.pathname === "/admin/care" ||
      searchParams.get("tab") === "platino_care" ||
      searchParams.get("tab") === "care" ||
      searchParams.get("tab") === "platino-care"
    )
      return "platino_care";
    if (
      location.pathname === "/admin/gemas" ||
      location.pathname === "/admin/diamantes" ||
      searchParams.get("tab") === "gemas" ||
      searchParams.get("tab") === "diamantes"
    )
      return "gemas";
    if (
      searchParams.get("tab") === "finanzas" ||
      searchParams.get("tab") === "ganancias" ||
      searchParams.get("tab") === "pagos"
    )
      return "finanzas";
    if (searchParams.get("tab")) return searchParams.get("tab");
    if (user && !isMasterAdmin(user)) {
      return "permisos";
    }
    return "citas";
  }, [location.pathname, searchParams, user]);

  const [activeTab, setActiveTab] = useState(getTabFromLocation);

  useEffect(() => {
    setActiveTab(getTabFromLocation());
  }, [getTabFromLocation]);

  // Estados de Permisos & Sedes para Vladimir y los Administradores de Lima y Miraflores
  const [permissionsMatrix, setPermissionsMatrix] = useState(() => getPermissionsMatrix());
  const [permissionRequests, setPermissionRequests] = useState(() => getPermissionRequests());
  const [reasonInputState, setReasonInputState] = useState({});
  const [requestsFilterStatus, setRequestsFilterStatus] = useState("pendientes"); // 'pendientes' | 'aprobadas' | 'rechazadas' | 'todas'

  // Estados para Gestión de Contraseñas de Sedes (Vladimir)
  const [adminAccountsList, setAdminAccountsList] = useState(() => getAdminAccounts());
  const [editingPasswordEmail, setEditingPasswordEmail] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [passwordChangeFeedback, setPasswordChangeFeedback] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Estados para el Validador y Clave Diaria de Recuperación de Clientes (Admin Principal Vladimir)
  const [dailyCodeInfo, setDailyCodeInfo] = useState(() => getDailyAdminRecoveryCodeInfo());
  const [recoveryLogs, setRecoveryLogs] = useState(() => getPasswordRecoveryLogs());
  const [copiedDailyCode, setCopiedDailyCode] = useState(false);
  const [validatorDniInput, setValidatorDniInput] = useState("");
  const [validatorCodeInput, setValidatorCodeInput] = useState("");
  const [validatorResult, setValidatorResult] = useState(null);

  // Estado del Libro de Reclamaciones (INDECOPI)
  const [reclamacionesList, setReclamacionesList] = useState(() => getReclamaciones());

  // Escuchar actualizaciones de permisos, solicitudes y contraseñas en tiempo real (incluyendo cruce entre pestañas)
  useEffect(() => {
    const handlePermUpdate = () => {
      setPermissionsMatrix(getPermissionsMatrix());
    };
    const handleReqUpdate = () => {
      setPermissionRequests(getPermissionRequests());
    };
    const handleCredsUpdate = () => {
      setAdminAccountsList(getAdminAccounts());
    };
    const handleDailyCodeUpdate = () => {
      setDailyCodeInfo(getDailyAdminRecoveryCodeInfo());
    };
    const handleRecoveryLogsUpdate = () => {
      setRecoveryLogs(getPasswordRecoveryLogs());
    };
    const handleRecUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setReclamacionesList(e.detail);
      } else {
        setReclamacionesList(getReclamaciones());
      }
    };
    const handleCrossTabStorage = (e) => {
      if (!e.key || e.key.includes("permission") || e.key.includes("admin") || e.key.includes("recovery")) {
        setPermissionsMatrix(getPermissionsMatrix());
        setPermissionRequests(getPermissionRequests());
        setAdminAccountsList(getAdminAccounts());
        setDailyCodeInfo(getDailyAdminRecoveryCodeInfo());
        setRecoveryLogs(getPasswordRecoveryLogs());
      }
    };
    window.addEventListener("platino_permissions_updated", handlePermUpdate);
    window.addEventListener("platino_permission_requests_updated", handleReqUpdate);
    window.addEventListener("platino_admin_credentials_updated", handleCredsUpdate);
    window.addEventListener("platino_daily_recovery_code_updated", handleDailyCodeUpdate);
    window.addEventListener("platino_password_recovery_logs_updated", handleRecoveryLogsUpdate);
    window.addEventListener("platino_reclamaciones_updated", handleRecUpdate);
    window.addEventListener("storage", handleCrossTabStorage);
    return () => {
      window.removeEventListener("platino_permissions_updated", handlePermUpdate);
      window.removeEventListener("platino_permission_requests_updated", handleReqUpdate);
      window.removeEventListener("platino_admin_credentials_updated", handleCredsUpdate);
      window.removeEventListener("platino_daily_recovery_code_updated", handleDailyCodeUpdate);
      window.removeEventListener("platino_password_recovery_logs_updated", handleRecoveryLogsUpdate);
      window.removeEventListener("platino_reclamaciones_updated", handleRecUpdate);
      window.removeEventListener("storage", handleCrossTabStorage);
    };
  }, []);

  // Determinar usuario efectivo según la sesión iniciada
  const isRealMaster = isMasterAdmin(user);
  const effectiveUser = user || ADMIN_ACCOUNTS[0];
  const isEffectiveMaster = isMasterAdmin(effectiveUser);
  const isMaster = isEffectiveMaster;

  const userHasPermission = (permKey) => {
    return hasPermission(effectiveUser, permKey);
  };

  const pendingRequestsCount = useMemo(() => {
    return permissionRequests.filter((r) => r.status === "pendiente").length;
  }, [permissionRequests]);

  const [citasList, setCitasList] = useState(() => getCitas());
  const [blockedList, setBlockedList] = useState(() => getBlockedSlots());

  // Estado para Pedidos y Proceso de Fabricación en Taller
  const [ordersList, setOrdersList] = useState(() => getOrders());
  const [orderStageFilter, setOrderStageFilter] = useState("todos");
  const [orderClientFilter, setOrderClientFilter] = useState("todos"); // 'todos' | 'camila'
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderNotesState, setOrderNotesState] = useState({});
  const [activeEditingNoteId, setActiveEditingNoteId] = useState(null);

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
  const [formCategoryGroup, setFormCategoryGroup] = useState("anillos");
  const [formCategory, setFormCategory] = useState("aros-boda");
  const [formPrice, setFormPrice] = useState("");
  const [formType, setFormType] = useState("anillo");
  const [formBadge, setFormBadge] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("/images/cat-compromiso.jpg");
  const [formImageWhite, setFormImageWhite] = useState("/images/cat-compromiso.jpg");
  const [formImageYellow, setFormImageYellow] = useState("");
  const [formImageRose, setFormImageRose] = useState("");
  const [formBoxImage, setFormBoxImage] = useState("/images/detail-box-green.jpg");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formAvailableMetals, setFormAvailableMetals] = useState(() => METALS.map((m) => m.id));
  const [formSelectedMetal, setFormSelectedMetal] = useState("Oro 18k Blanco");
  const [formMetalPrices, setFormMetalPrices] = useState({});
  const [formMetalImages, setFormMetalImages] = useState({});
  const [formShowDeliveryEstimate, setFormShowDeliveryEstimate] = useState(true);
  const [formHasGemSelection, setFormHasGemSelection] = useState(true);
  const [formAvailableGemShapes, setFormAvailableGemShapes] = useState(() => (Array.isArray(MASTER_GEM_SHAPES) ? MASTER_GEM_SHAPES.map((s) => s.id) : []));
  const [formDefaultGemShape, setFormDefaultGemShape] = useState("redondo");
  const [formGemShapeConfigs, setFormGemShapeConfigs] = useState({});
  const [formActiveGemShapeTab, setFormActiveGemShapeTab] = useState("redondo");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Filtros de Citas
  const [filterSede, setFilterSede] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Estado para gestión de Bloqueos (exclusivamente Asesoría General)
  const [blockSedeId, setBlockSedeId] = useState(sedesData[0].id);
  const [blockDate, setBlockDate] = useState(() => getMinBlockDateString("asesoria"));
  const [blockReason, setBlockReason] = useState("");

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

  // Estado para Inventario & Control de Stock por Tallas (Bodega, Sede Lima Centro, Sede Miraflores)
  const [selectedInventoryProductId, setSelectedInventoryProductId] = useState(() => {
    try {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const urlProd = params?.get("prod");
      if (urlProd && catalogList.some((p) => p.id === urlProd)) return urlProd;

      const lastViewed = typeof window !== "undefined" ? localStorage.getItem("platino_last_viewed_product_id") : null;
      if (lastViewed && catalogList.some((p) => p.id === lastViewed)) return lastViewed;
    } catch {
      // ignore
    }
    // Priorizar productos con tallas oficiales (anillos y aros)
    const ringProd = catalogList.find((p) => p.type === "anillo" || p.type === "aros" || p.hasDoubleSizes);
    return ringProd?.id || catalogList[0]?.id || "anillo-9-promesas";
  });
  const [inventoryGenderTab, setInventoryGenderTab] = useState("dama"); // 'dama' | 'varon'
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("todas");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventorySavedFeedback, setInventorySavedFeedback] = useState("");
  const [allInventoryMap, setAllInventoryMap] = useState(() => getAllStoredInventory());

  // Detectar parámetros en URL para navegación directa a pestañas y joyas (ej: ?tab=inventario&prod=anillo-9-promesas)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const prodParam = params.get("prod");
      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (prodParam && catalogList.some((p) => p.id === prodParam)) {
        setSelectedInventoryProductId(prodParam);
      }
    } catch {
      // ignore
    }
  }, [catalogList]);

  // Productos filtrados por categoría en el panel de inventario
  const inventoryCategoryProducts = useMemo(() => {
    if (inventoryCategoryFilter === "todas") return catalogList;
    return catalogList.filter((p) => getProductCategoryGroup(p) === inventoryCategoryFilter);
  }, [catalogList, inventoryCategoryFilter]);

  const handleSelectInventoryCategory = (catId) => {
    setInventoryCategoryFilter(catId);
    const subset = catId === "todas" ? catalogList : catalogList.filter((p) => getProductCategoryGroup(p) === catId);
    if (subset.length > 0 && !subset.some((p) => p.id === selectedInventoryProductId)) {
      setSelectedInventoryProductId(subset[0].id);
    }
  };

  const loadOrdersData = () => {
    setOrdersList(getOrders());
  };

  useEffect(() => {
    window.addEventListener("citas_updated", loadData);
    window.addEventListener("catalog_updated", loadCatalogData);
    window.addEventListener("home_images_updated", loadHomeImagesData);
    window.addEventListener("announcement_updated", loadAnnouncementData);
    window.addEventListener("orders_updated", loadOrdersData);

    const loadInventoryData = () => {
      setAllInventoryMap(getAllStoredInventory());
    };
    window.addEventListener("platino_inventory_updated", loadInventoryData);
    const handleStorageChange = (e) => {
      if (!e.key || e.key === "platino_inventory_stock_v1" || e.key.includes("inventory")) {
        loadInventoryData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", loadInventoryData);
    document.addEventListener("visibilitychange", loadInventoryData);

    return () => {
      window.removeEventListener("citas_updated", loadData);
      window.removeEventListener("catalog_updated", loadCatalogData);
      window.removeEventListener("home_images_updated", loadHomeImagesData);
      window.removeEventListener("announcement_updated", loadAnnouncementData);
      window.removeEventListener("orders_updated", loadOrdersData);
      window.removeEventListener("platino_inventory_updated", loadInventoryData);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", loadInventoryData);
      document.removeEventListener("visibilitychange", loadInventoryData);
    };
  }, []);

  // Manejadores para actualizar proceso de pedidos (Admin)
  const handleUpdateOrderStage = (orderId, newStage) => {
    const success = updateOrderStatus(orderId, newStage);
    if (success) {
      const stageInfo = getOrderStageInfo(newStage);
      setFeedbackMsg(`✓ Estado del pedido ${orderId} actualizado a: "${stageInfo.label}". El cliente ve este avance en tiempo real en su portal.`);
      setTimeout(() => setFeedbackMsg(""), 6000);
    }
  };

  const handleUpdateWorkshopField = (orderId, fieldName, value) => {
    updateOrderWorkshopFields(orderId, { [fieldName]: value });
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, [fieldName]: value } : o))
    );
  };

  const handleSaveOrderNote = (orderId) => {
    const noteText = orderNotesState[orderId];
    if (noteText !== undefined) {
      const order = ordersList.find((o) => o.id === orderId);
      if (order) {
        updateOrderStatus(orderId, order.stage, noteText);
        setFeedbackMsg(`✓ Actualización de taller guardada para el pedido ${orderId}.`);
        setTimeout(() => setFeedbackMsg(""), 5000);
        setActiveEditingNoteId(null);
      }
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el pedido ${orderId}?`)) {
      deleteOrder(orderId);
      setFeedbackMsg(`✓ Pedido ${orderId} eliminado del sistema.`);
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  // Control estricto de sede: Cada admin solo ve la información de su propia sede (Lima solo Lima, Miraflores solo Miraflores)
  const isGlobalOrdersView = isEffectiveMaster || effectiveUser?.sede === "global";
  const isSedeRestricted = Boolean(effectiveUser?.sede && effectiveUser.sede !== "global");
  const userAssignedSede = isSedeRestricted ? effectiveUser.sede : null;
  const activeBlockSedeId = isSedeRestricted ? userAssignedSede : blockSedeId;

  // Sincronizar sede seleccionada para bloqueos y filtros con la sede asignada del admin
  useEffect(() => {
    if (userAssignedSede) {
      setBlockSedeId(userAssignedSede);
      setFilterSede(userAssignedSede);
    }
  }, [userAssignedSede]);

  // Bloqueos activos visibles exclusivamente para la sede asignada (o todos si es Vladimir / Master)
  const effectiveBlockedList = useMemo(() => {
    if (!isSedeRestricted) return blockedList;
    return blockedList.filter((b) => b.sedeId === userAssignedSede);
  }, [blockedList, isSedeRestricted, userAssignedSede]);

  // Pedidos pertenecientes a la sede asignada (o todos si es Vladimir / Master)
  const effectiveSedeOrders = useMemo(() => {
    if (isGlobalOrdersView || !userAssignedSede) {
      return ordersList;
    }
    return ordersList.filter((o) => getOrderSedeId(o) === userAssignedSede);
  }, [ordersList, isGlobalOrdersView, userAssignedSede]);

  // Pedidos filtrados según controles de búsqueda y pestañas
  const filteredOrders = useMemo(() => {
    return effectiveSedeOrders.filter((order) => {
      if (orderStageFilter !== "todos" && order.stage !== orderStageFilter) {
        return false;
      }
      if (orderClientFilter === "camila") {
        if (order.clientEmail.toLowerCase() !== "cliente@platino.pe") return false;
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.trim().toLowerCase();
        const matchCode = order.id.toLowerCase().includes(q);
        const matchName = order.clientName.toLowerCase().includes(q);
        const matchEmail = order.clientEmail.toLowerCase().includes(q);
        const matchPhone = (order.clientPhone || "").toLowerCase().includes(q);
        const matchItem = order.items.some((it) => it.name.toLowerCase().includes(q));
        if (!matchCode && !matchName && !matchEmail && !matchPhone && !matchItem) {
          return false;
        }
      }
      return true;
    });
  }, [effectiveSedeOrders, orderStageFilter, orderClientFilter, orderSearchQuery]);

  // Producto activo para gestión de inventario
  const currentInventoryProduct = catalogList.find((p) => p.id === selectedInventoryProductId) || catalogList[0];
  const currentProductStock = useMemo(() => {
    if (!currentInventoryProduct) return generateDefaultProductStock("temp", true);
    const existing = allInventoryMap[currentInventoryProduct.id];
    if (existing && existing.dama && existing.varon) {
      return existing;
    }
    return getProductStock(currentInventoryProduct.id, currentInventoryProduct.hasDoubleSizes);
  }, [currentInventoryProduct, allInventoryMap]);

  // KPIs globales de inventario de toda la tienda
  const inventoryKpis = useMemo(() => {
    let bodega = 0;
    let limaCentro = 0;
    let miraflores = 0;
    let totalPieces = 0;

    catalogList.forEach((prod) => {
      const stock = allInventoryMap[prod.id] || getProductStock(prod.id, prod.hasDoubleSizes);
      const stats = getProductTotalStockStats(stock);
      bodega += stats.totalBodega;
      limaCentro += stats.totalLimaCentro;
      miraflores += stats.totalMiraflores;
      totalPieces += stats.grandTotal;
    });

    return { bodega, limaCentro, miraflores, totalPieces };
  }, [catalogList, allInventoryMap]);

  // Permisos de edición por almacén para el usuario activo
  const canEditBodega = userHasPermission("inventario_global");
  const canEditLima = userHasPermission("inventario_global") || effectiveUser?.sede === "lima-centro";
  const canEditMiraflores = userHasPermission("inventario_global") || effectiveUser?.sede === "miraflores";

  // Modificar stock individual en tiempo real
  const handleStockCellChange = (gender, sizeNum, locationId, value) => {
    if (!currentInventoryProduct) return;
    if (locationId === "bodega" && !canEditBodega) {
      alert("Acceso Restringido: No tienes autorización para modificar Bodega Central. Solicita el permiso a Vladimir.");
      return;
    }
    if (locationId === "lima-centro" && !canEditLima) {
      alert("Acceso Restringido: No tienes autorización para modificar el inventario de Lima Centro.");
      return;
    }
    if (locationId === "miraflores" && !canEditMiraflores) {
      alert("Acceso Restringido: No tienes autorización para modificar el inventario de Miraflores.");
      return;
    }
    const num = Math.max(0, parseInt(value, 10) || 0);
    updateSingleStockItem(currentInventoryProduct.id, gender, sizeNum, locationId, num);
    setAllInventoryMap(getAllStoredInventory());
  };

  // Botón rápido +/-
  const handleStockStepChange = (gender, sizeNum, locationId, delta) => {
    if (!currentInventoryProduct) return;
    const currentQty = currentProductStock?.[gender]?.[sizeNum]?.[locationId] || 0;
    const nextQty = Math.max(0, currentQty + delta);
    handleStockCellChange(gender, sizeNum, locationId, nextQty);
  };

  // Modificar stock en múltiples almacenes en un solo paso atómico (ej: +1 Sedes)
  const handleStockStepMultiple = (gender, sizeNum, deltasMap) => {
    if (!currentInventoryProduct) return;
    for (const loc of Object.keys(deltasMap)) {
      if (loc === "bodega" && !canEditBodega) {
        alert("Acceso Restringido: No tienes autorización para modificar Bodega Central.");
        return;
      }
      if (loc === "lima-centro" && !canEditLima) {
        alert("Acceso Restringido: No tienes autorización para modificar el inventario de Lima Centro.");
        return;
      }
      if (loc === "miraflores" && !canEditMiraflores) {
        alert("Acceso Restringido: No tienes autorización para modificar el inventario de Miraflores.");
        return;
      }
    }
    updateMultipleStockItems(currentInventoryProduct.id, gender, sizeNum, deltasMap, true);
    setAllInventoryMap(getAllStoredInventory());
  };

  // Copiar stock de la joya actual a todos los modelos de anillos y aros
  const handleCopyStockToAllRings = () => {
    if (!currentInventoryProduct) return;
    if (!userHasPermission("inventario_global")) {
      alert("Acceso Restringido: Solo Vladimir o usuarios con permiso global pueden sincronizar existencias a todo el catálogo.");
      return;
    }
    const ringIds = catalogList
      .filter((p) => p.type === "anillo" || p.type === "aros" || p.hasDoubleSizes || (p.categories && p.categories.some((c) => c.includes("anillo") || c.includes("aros"))))
      .map((p) => p.id);

    if (window.confirm(`¿Deseas sincronizar la configuración de stock de "${currentInventoryProduct.name}" a los ${ringIds.length} modelos de anillos y aros del catálogo?`)) {
      copyProductStockToTargets(currentInventoryProduct.id, ringIds);
      setAllInventoryMap(getAllStoredInventory());
      setInventorySavedFeedback(`✓ ¡El stock de "${currentInventoryProduct.name}" se sincronizó con éxito a los ${ringIds.length} modelos de anillos y aros!`);
      setTimeout(() => setInventorySavedFeedback(""), 5000);
    }
  };

  // Acciones en lote: +X a un almacén para todas las tallas
  const handleBatchSupplyLocation = (gender, locationId, amount) => {
    if (!currentInventoryProduct) return;
    if (locationId === "bodega" && !canEditBodega) {
      alert("Acceso Restringido: No tienes autorización para modificar Bodega Central.");
      return;
    }
    if (locationId === "lima-centro" && !canEditLima) {
      alert("Acceso Restringido: No tienes autorización para modificar el inventario de Lima Centro.");
      return;
    }
    if (locationId === "miraflores" && !canEditMiraflores) {
      alert("Acceso Restringido: No tienes autorización para modificar el inventario de Miraflores.");
      return;
    }
    const sizes = gender === "dama" ? DAMA_SIZES : VARON_SIZES;
    const stockCopy = JSON.parse(JSON.stringify(currentProductStock));
    if (!stockCopy[gender]) stockCopy[gender] = {};

    sizes.forEach((sz) => {
      if (!stockCopy[gender][sz.number]) {
        stockCopy[gender][sz.number] = { bodega: 0, "lima-centro": 0, miraflores: 0 };
      }
      const cur = stockCopy[gender][sz.number][locationId] || 0;
      stockCopy[gender][sz.number][locationId] = Math.max(0, cur + amount);
    });

    updateProductStock(currentInventoryProduct.id, stockCopy);
    setInventorySavedFeedback(`¡Se añadieron +${amount} unidades a ${locationId === "bodega" ? "Bodega" : locationId === "lima-centro" ? "Sede Lima Centro" : "Sede Miraflores"} en todas las tallas de ${gender === "dama" ? "Dama" : "Varón"}!`);
    setTimeout(() => setInventorySavedFeedback(""), 4000);
  };

  // Restablecer stock sugerido de la joya
  const handleResetCurrentInventory = () => {
    if (!currentInventoryProduct) return;
    if (window.confirm(`¿Deseas restablecer el inventario sugerido para ${currentInventoryProduct.name}?`)) {
      const def = generateDefaultProductStock(currentInventoryProduct.id, currentInventoryProduct.hasDoubleSizes);
      updateProductStock(currentInventoryProduct.id, def);
      setInventorySavedFeedback(`¡Inventario base restablecido para ${currentInventoryProduct.name}!`);
      setTimeout(() => setInventorySavedFeedback(""), 4000);
    }
  };

  const handleSaveInventoryNotice = () => {
    saveAllInventory(allInventoryMap);
    setInventorySavedFeedback("✓ ¡Inventario sincronizado y guardado con éxito en todo el catálogo y módulos!");
    setTimeout(() => setInventorySavedFeedback(""), 4000);
  };

  // Manejadores de Permisos y Autorizaciones (Vladimir)
  const handleApproveRequest = (reqId) => {
    const res = approvePermissionRequest(reqId, user?.name || "Vladimir");
    if (res.success) {
      setPermissionRequests(getPermissionRequests());
      setPermissionsMatrix(getPermissionsMatrix());
      setFeedbackMsg(`✓ Solicitud aprobada con éxito. El permiso ha sido concedido.`);
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  const handleRejectRequest = (reqId) => {
    const res = rejectPermissionRequest(reqId, user?.name || "Vladimir");
    if (res.success) {
      setPermissionRequests(getPermissionRequests());
      setPermissionsMatrix(getPermissionsMatrix());
      setFeedbackMsg(`✕ Solicitud rechazada y permiso revocado en el cruce de sedes.`);
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  const handleTogglePermission = (targetEmail, permKey, granted) => {
    toggleUserPermission(targetEmail, permKey, granted);
    setPermissionsMatrix(getPermissionsMatrix());
    setPermissionRequests(getPermissionRequests());
    setFeedbackMsg(
      granted
        ? `✓ Permiso concedido y sincronizado con la sede.`
        : `↺ Permiso revocado. La sede deberá solicitar autorización nuevamente.`
    );
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleSendPermissionRequest = (permKey) => {
    const reason = (reasonInputState[permKey] || "").trim();
    if (!reason) {
      alert("Por favor, indica brevemente para qué necesitas este permiso en tu sede antes de enviar la solicitud.");
      return;
    }
    const res = requestPermission({
      user: effectiveUser,
      permissionKey: permKey,
      reason,
    });
    if (res.success) {
      setPermissionRequests(getPermissionRequests());
      setFeedbackMsg(`📨 Solicitud de permiso enviada a Administración Central con éxito. Estado: Pendiente de aprobación.`);
      setReasonInputState((prev) => ({ ...prev, [permKey]: "" }));
      setTimeout(() => setFeedbackMsg(""), 4500);
    } else {
      alert(res.error || "No se pudo enviar la solicitud");
    }
  };

  // Manejadores para Cambio de Contraseñas de Administradores (Vladimir)
  const handleToggleShowPassword = (email) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const handleCopyPassword = (email, password) => {
    try {
      navigator.clipboard.writeText(password);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleStartEditPassword = (email) => {
    setEditingPasswordEmail(email);
    setNewPasswordInput("");
    setPasswordChangeFeedback("");
  };

  const handleCancelEditPassword = () => {
    setEditingPasswordEmail(null);
    setNewPasswordInput("");
  };

  const handleGeneratePassword = (sede) => {
    const isLima = sede === "lima-centro";
    const prefix = isLima ? "Lima" : sede === "miraflores" ? "Miraflores" : "Vladimir";
    const year = "2026";
    const symbols = ["*", "#", "!", "$", "@"];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    setNewPasswordInput(`${prefix}${sym}${year}${randNum}`);
  };

  const handleSavePassword = (email, name) => {
    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      alert("Por favor ingresa una contraseña válida de al menos 4 caracteres.");
      return;
    }
    const res = updateAdminPassword(email, newPasswordInput.trim());
    if (res.success) {
      setPasswordChangeFeedback(`✓ Contraseña de ${name} actualizada exitosamente.`);
      setEditingPasswordEmail(null);
      setNewPasswordInput("");
      setAdminAccountsList(getAdminAccounts());
      setTimeout(() => setPasswordChangeFeedback(""), 6000);
    } else {
      alert(res.error || "No se pudo actualizar la contraseña.");
    }
  };

  // Manejadores para el Validador y Clave Diaria de Recuperación de Clientes (Admin Principal Vladimir)
  const handleCopyDailyRecoveryCode = (codeStr) => {
    const targetCode = codeStr || dailyCodeInfo.code;
    try {
      navigator.clipboard.writeText(targetCode);
      setCopiedDailyCode(true);
      setTimeout(() => setCopiedDailyCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleRotateDailyRecoveryCode = () => {
    const updatedInfo = rotateDailyAdminRecoveryCode();
    setDailyCodeInfo(updatedInfo);
    setValidatorCodeInput(updatedInfo.code);
    setValidatorResult(null);
    setFeedbackMsg(
      `🔑 Nueva clave diaria generada para hoy (${updatedInfo.displayDate}): ${updatedInfo.code} (${updatedInfo.formattedCode})`
    );
    setTimeout(() => setFeedbackMsg(""), 5000);
  };

  const lookedUpValidatorClient = useMemo(() => {
    const q = validatorDniInput.trim();
    if (!q || !findUserByDniOrEmail) return null;
    const found = findUserByDniOrEmail(q);
    if (found && found.role !== "admin") return found;
    return null;
  }, [validatorDniInput, findUserByDniOrEmail, usersDb]);

  const handleRunAdminCodeValidator = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const currentDaily = getDailyAdminRecoveryCodeInfo();
    setDailyCodeInfo(currentDaily);

    const codeToTest = (validatorCodeInput || currentDaily.code).trim();
    const isCodeValid = validateDailyAdminRecoveryCode(codeToTest);
    const q = validatorDniInput.trim();

    if (!isCodeValid) {
      setValidatorResult({
        valid: false,
        title: "✕ Código Inválido o de Otra Fecha",
        message: `El código ingresado ("${codeToTest}") no coincide con la clave vigente del día de hoy (${currentDaily.code} / ${currentDaily.formattedCode}).`,
      });
      return;
    }

    if (q) {
      const client = findUserByDniOrEmail ? findUserByDniOrEmail(q) : null;
      if (!client || client.role === "admin") {
        setValidatorResult({
          valid: false,
          title: "⚠️ Clave Diaria Válida, pero DNI / Correo No Registrado",
          message: `La clave diaria (${currentDaily.code}) es correcta, pero no existe ningún cliente registrado con el DNI o correo "${q}".`,
        });
        return;
      }

      setValidatorResult({
        valid: true,
        title: "✓ ¡Validación Exitosa! Cliente y Clave Diaria Verificados",
        message: `El cliente ${client.name} (DNI: ${client.dni || "Registrado"} • ${client.email}) está verificado. Facilítale el código ${currentDaily.code} para que valide su acceso e ingrese su nueva contraseña dos veces.`,
        client,
        code: currentDaily.code,
      });
      return;
    }

    setValidatorResult({
      valid: true,
      title: "✓ ¡Validación Exitosa de Clave Diaria!",
      message: `La clave ${currentDaily.code} (${currentDaily.formattedCode}) está activa y validada hoy (${currentDaily.displayDate}). Puedes facilitarla al cliente que olvidó su contraseña.`,
      code: currentDaily.code,
    });
  };


  // Exportar reporte de inventario y stock por tallas a Excel (.xls) y CSV
  const handleExportStockExcel = (mode = "current", format = "xls") => {
    if (!userHasPermission("descargar_excel")) {
      alert("Acceso Restringido: No tienes autorización para exportar a Excel. Solicita la aprobación a Vladimir.");
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const productsToExport =
      mode === "current" && currentInventoryProduct
        ? [currentInventoryProduct]
        : catalogList;

    if (format === "csv") {
      const headers = [
        "Joya / Producto",
        "Categoría",
        "Tipo Talla",
        "Talla Oficial",
        "Diámetro (mm)",
        "Bodega Central",
        "Sede Lima Centro",
        "Sede Miraflores",
        "Stock Total",
        "Estado Disponibilidad",
      ];

      const csvRows = [headers.map((h) => `"${h}"`).join(";")];

      productsToExport.forEach((prod) => {
        const stock = allInventoryMap[prod.id] || getProductStock(prod.id, prod.hasDoubleSizes);
        const categoryLabel = PRODUCT_CATEGORY_GROUPS.find((c) => c.id === getProductCategoryGroup(prod))?.label || "Joya";

        DAMA_SIZES.forEach((sz) => {
          const item = stock?.dama?.[sz.number] || { bodega: 0, "lima-centro": 0, miraflores: 0 };
          const b = Number(item.bodega) || 0;
          const lc = Number(item["lima-centro"]) || 0;
          const m = Number(item.miraflores) || 0;
          const tot = b + lc + m;
          const estado = tot > 3 ? "Disponible" : tot > 0 ? "Últimas Unidades" : "Agotado";
          csvRows.push([
            `"${prod.name}"`,
            `"${categoryLabel}"`,
            `"Dama"`,
            `"${sz.label}"`,
            `"${sz.diameter}"`,
            b,
            lc,
            m,
            tot,
            `"${estado}"`,
          ].join(";"));
        });

        VARON_SIZES.forEach((sz) => {
          const item = stock?.varon?.[sz.number] || { bodega: 0, "lima-centro": 0, miraflores: 0 };
          const b = Number(item.bodega) || 0;
          const lc = Number(item["lima-centro"]) || 0;
          const m = Number(item.miraflores) || 0;
          const tot = b + lc + m;
          const estado = tot > 3 ? "Disponible" : tot > 0 ? "Últimas Unidades" : "Agotado";
          csvRows.push([
            `"${prod.name}"`,
            `"${categoryLabel}"`,
            `"Varón"`,
            `"${sz.label}"`,
            `"${sz.diameter}"`,
            b,
            lc,
            m,
            tot,
            `"${estado}"`,
          ].join(";"));
        });
      });

      const csvContent = "\uFEFF" + csvRows.join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const filename =
        mode === "current" && currentInventoryProduct
          ? `Inventario_Tallas_${currentInventoryProduct.name.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.csv`
          : `Inventario_General_Tallas_Platino_${dateStr}.csv`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setInventorySavedFeedback(`✓ Archivo CSV descargado con éxito: "${filename}"`);
      setTimeout(() => setInventorySavedFeedback(""), 5000);
      return;
    }

    // Formato Excel .xls nativo con estilos
    let rowsHtml = "";
    let grandBodega = 0;
    let grandLima = 0;
    let grandMiraflores = 0;
    let grandTotal = 0;

    productsToExport.forEach((prod) => {
      const stock = allInventoryMap[prod.id] || getProductStock(prod.id, prod.hasDoubleSizes);
      const categoryLabel = PRODUCT_CATEGORY_GROUPS.find((c) => c.id === getProductCategoryGroup(prod))?.label || "Joya";

      DAMA_SIZES.forEach((sz) => {
        const item = stock?.dama?.[sz.number] || { bodega: 0, "lima-centro": 0, miraflores: 0 };
        const b = Number(item.bodega) || 0;
        const lc = Number(item["lima-centro"]) || 0;
        const m = Number(item.miraflores) || 0;
        const tot = b + lc + m;
        grandBodega += b;
        grandLima += lc;
        grandMiraflores += m;
        grandTotal += tot;

        const estado = tot > 3 ? "Disponible" : tot > 0 ? "Últimas Unidades" : "Agotado";
        const estadoColor = tot > 3 ? "#15803d" : tot > 0 ? "#b45309" : "#b91c1c";

        rowsHtml += `
          <tr>
            <td>${prod.name}</td>
            <td>${categoryLabel}</td>
            <td>Dama</td>
            <td style="text-align: center; font-weight: bold;">${sz.label}</td>
            <td style="text-align: center;">${sz.diameter}</td>
            <td style="text-align: right;">${b}</td>
            <td style="text-align: right;">${lc}</td>
            <td style="text-align: right;">${m}</td>
            <td style="text-align: right; font-weight: bold;">${tot}</td>
            <td style="color: ${estadoColor}; font-weight: bold;">${estado}</td>
          </tr>
        `;
      });

      VARON_SIZES.forEach((sz) => {
        const item = stock?.varon?.[sz.number] || { bodega: 0, "lima-centro": 0, miraflores: 0 };
        const b = Number(item.bodega) || 0;
        const lc = Number(item["lima-centro"]) || 0;
        const m = Number(item.miraflores) || 0;
        const tot = b + lc + m;
        grandBodega += b;
        grandLima += lc;
        grandMiraflores += m;
        grandTotal += tot;

        const estado = tot > 3 ? "Disponible" : tot > 0 ? "Últimas Unidades" : "Agotado";
        const estadoColor = tot > 3 ? "#15803d" : tot > 0 ? "#b45309" : "#b91c1c";

        rowsHtml += `
          <tr>
            <td>${prod.name}</td>
            <td>${categoryLabel}</td>
            <td>Varón</td>
            <td style="text-align: center; font-weight: bold;">${sz.label}</td>
            <td style="text-align: center;">${sz.diameter}</td>
            <td style="text-align: right;">${b}</td>
            <td style="text-align: right;">${lc}</td>
            <td style="text-align: right;">${m}</td>
            <td style="text-align: right; font-weight: bold;">${tot}</td>
            <td style="color: ${estadoColor}; font-weight: bold;">${estado}</td>
          </tr>
        `;
      });
    });

    const filename =
      mode === "current" && currentInventoryProduct
        ? `Inventario_Tallas_${currentInventoryProduct.name.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}.xls`
        : `Inventario_General_Tallas_Platino_${dateStr}.xls`;

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Inventario Tallas</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #137748; color: #ffffff; font-weight: bold; padding: 8px; border: 1px solid #0f5c38; font-family: Arial, sans-serif; font-size: 11pt; }
          td { padding: 6px 8px; border: 1px solid #d4ded8; font-family: Arial, sans-serif; font-size: 10pt; }
        </style>
      </head>
      <body>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <td colspan="10" style="background-color: #0f2a24; color: #ffffff; font-size: 15pt; font-weight: bold; text-align: center; padding: 12px;">
              PLATINO PERÚ - REPORTE DE INVENTARIO Y STOCK POR TALLAS
            </td>
          </tr>
          <tr>
            <td colspan="5" style="background-color: #f4f8f6; font-size: 10pt; color: #374940;">
              <strong>Fecha de Emisión:</strong> ${dateStr} ${timeStr} | <strong>Administrador:</strong> ${user?.name || "Vladimir"}
            </td>
            <td colspan="5" style="background-color: #f4f8f6; font-size: 10pt; color: #374940; text-align: right;">
              <strong>Total Modelos en Reporte:</strong> ${productsToExport.length} joyas
            </td>
          </tr>
          <tr>
            <td colspan="10" style="background-color: #e8f4ee; padding: 8px; font-size: 10.5pt;">
              <strong>Resumen de Existencias:</strong> Bodega Central: <strong>${grandBodega}</strong> unds | Sede Lima Centro: <strong>${grandLima}</strong> unds | Sede Miraflores: <strong>${grandMiraflores}</strong> unds | <strong>Stock Total: ${grandTotal} piezas</strong>
            </td>
          </tr>
          <tr>
            <th>Joya / Producto</th>
            <th>Categoría</th>
            <th>Tipo Talla</th>
            <th>Talla Oficial</th>
            <th>Diámetro</th>
            <th>Bodega Central</th>
            <th>Sede Lima Centro</th>
            <th>Sede Miraflores</th>
            <th>Stock Total</th>
            <th>Estado</th>
          </tr>
          ${rowsHtml}
          <tr style="background-color: #f0f7f3; font-weight: bold;">
            <td colspan="5" style="text-align: right;">TOTAL GENERAL:</td>
            <td style="text-align: right;">${grandBodega}</td>
            <td style="text-align: right;">${grandLima}</td>
            <td style="text-align: right;">${grandMiraflores}</td>
            <td style="text-align: right;">${grandTotal}</td>
            <td>-</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setInventorySavedFeedback(`✓ Archivo Excel descargado con éxito: "${filename}"`);
    setTimeout(() => setInventorySavedFeedback(""), 5000);
  };

  // ========================================================
  // CONTROL DE PAGOS Y VALIDACIÓN DE PEDIDOS (ADMIN)
  // ========================================================
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("todos");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [editingPaymentNotes, setEditingPaymentNotes] = useState({});
  const [activeEditingPaymentNoteId, setActiveEditingPaymentNoteId] = useState(null);

  const paymentsKpis = useMemo(() => {
    let totalCobrado = 0;
    let totalPendiente = 0;
    let totalFacturado = 0;
    let countPagados = 0;
    let countPendientes = 0;

    effectiveSedeOrders.forEach((order) => {
      const orderTotal = Number(order.total) || 0;
      totalFacturado += orderTotal;
      if (order.paymentStatus === "Pagado (100%)") {
        totalCobrado += orderTotal;
        countPagados += 1;
      } else {
        totalPendiente += orderTotal;
        countPendientes += 1;
      }
    });

    return {
      totalCobrado,
      totalPendiente,
      totalFacturado,
      countPagados,
      countPendientes,
      totalOrders: effectiveSedeOrders.length,
    };
  }, [effectiveSedeOrders]);

  const filteredPaymentOrders = useMemo(() => {
    return effectiveSedeOrders.filter((order) => {
      if (paymentStatusFilter === "pagados" && order.paymentStatus !== "Pagado (100%)") {
        return false;
      }
      if (paymentStatusFilter === "pendientes" && order.paymentStatus === "Pagado (100%)") {
        return false;
      }
      if (paymentStatusFilter === "por_validar" && order.paymentStatus !== "Pendiente de Validación") {
        return false;
      }
      if (paymentSearchQuery.trim()) {
        const q = paymentSearchQuery.trim().toLowerCase();
        const matchCode = (order.id || "").toLowerCase().includes(q);
        const matchName = (order.clientName || "").toLowerCase().includes(q);
        const matchEmail = (order.clientEmail || "").toLowerCase().includes(q);
        const matchPhone = (order.clientPhone || "").toLowerCase().includes(q);
        const matchMethod = (order.paymentMethod || "").toLowerCase().includes(q);
        const matchItem = (order.items || []).some((it) => (it.name || "").toLowerCase().includes(q));
        if (!matchCode && !matchName && !matchEmail && !matchPhone && !matchMethod && !matchItem) {
          return false;
        }
      }
      return true;
    });
  }, [ordersList, paymentStatusFilter, paymentSearchQuery]);

  const handleUpdatePaymentStatus = (orderId, newStatus) => {
    const current = ordersList.find((o) => o.id === orderId);
    if (!current) return;
    const success = updateOrderPayment(orderId, newStatus, current.paymentMethod, current.paymentNotes);
    if (success) {
      setOrdersList(getOrders());
      setFeedbackMsg(`✓ Estado de pago actualizado para ${orderId}: "${newStatus}".`);
      setTimeout(() => setFeedbackMsg(""), 4500);
    }
  };

  const handleUpdatePaymentMethod = (orderId, newMethod) => {
    const current = ordersList.find((o) => o.id === orderId);
    if (!current) return;
    const success = updateOrderPayment(orderId, current.paymentStatus, newMethod, current.paymentNotes);
    if (success) {
      setOrdersList(getOrders());
      setFeedbackMsg(`✓ Medio de pago actualizado para ${orderId}: "${newMethod}".`);
      setTimeout(() => setFeedbackMsg(""), 4500);
    }
  };

  const handleSavePaymentNotes = (orderId) => {
    const current = ordersList.find((o) => o.id === orderId);
    if (!current) return;
    const note = editingPaymentNotes[orderId];
    if (note !== undefined) {
      const success = updateOrderPayment(orderId, current.paymentStatus, current.paymentMethod, note);
      if (success) {
        setOrdersList(getOrders());
        setFeedbackMsg(`✓ Comprobante / N° de operación guardado para ${orderId}.`);
        setTimeout(() => setFeedbackMsg(""), 4500);
        setActiveEditingPaymentNoteId(null);
      }
    }
  };

  // Manejar cambio de estado de cita
  const handleStatusChange = (id, newStatus) => {
    const target = citasList.find((c) => c.id === id);
    if (isSedeRestricted && target && target.sedeId !== userAssignedSede) {
      alert("Acceso Restringido: Solo puedes gestionar citas pertenecientes a tu sede asignada.");
      return;
    }
    updateCitaStatus(id, newStatus);
    loadData();
  };

  // Manejar eliminación de cita
  const handleDeleteCita = (id) => {
    const target = citasList.find((c) => c.id === id);
    if (isSedeRestricted && target && target.sedeId !== userAssignedSede) {
      alert("Acceso Restringido: Solo puedes gestionar citas pertenecientes a tu sede asignada.");
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar la cita ${id}?`)) {
      deleteCita(id);
      loadData();
    }
  };

  // Bloquear un slot específico para Asesoría General
  const handleBlockSlot = (time) => {
    const reason = blockReason.trim() || "No disponible para Asesoría General";
    blockSlot(activeBlockSedeId, blockDate, time, reason, "asesoria");
    setBlockReason("");
    loadData();
  };

  // Bloquear día completo para Asesoría General
  const handleBlockFullDay = () => {
    const reason = blockReason.trim() || "Sin asesoría este día / Cerrado";
    blockSlot(activeBlockSedeId, blockDate, "FULL_DAY", reason, "asesoria");
    setBlockReason("");
    loadData();
  };

  // Desbloquear día completo para Asesoría General
  const handleUnblockFullDay = () => {
    unblockFullDay(activeBlockSedeId, blockDate, "asesoria");
    loadData();
  };

  // Desbloquear slot
  const handleUnblock = (blockId) => {
    const target = blockedList.find((b) => b.id === blockId);
    if (isSedeRestricted && target && target.sedeId !== userAssignedSede) {
      alert("Acceso Restringido: Solo puedes gestionar los bloqueos de tu sede asignada.");
      return;
    }
    unblockSlot(blockId);
    loadData();
  };

  // Fecha mínima permitida para bloquear (1 día de anticipación a partir de mañana)
  const minBlockDate = getMinBlockDateString("asesoria");

  // Handlers para gestión de Catálogo y Fotos
  const openCreateProductModal = (preselectedCategory = null) => {
    setEditingProduct(null);
    setFormName("");
    const initialGroup =
      preselectedCategory && preselectedCategory !== "todas"
        ? (PRODUCT_CATEGORY_GROUPS.some((g) => g.id === preselectedCategory) ? preselectedCategory : "anillos")
        : (catalogFilterCategory !== "todas" && PRODUCT_CATEGORY_GROUPS.some((g) => g.id === catalogFilterCategory) ? catalogFilterCategory : "anillos");

    setFormCategoryGroup(initialGroup);
    if (initialGroup === "anillos") {
      setFormCategory("anillo-compromiso");
      setFormType("anillo");
    } else if (initialGroup === "collares") {
      setFormCategory("collares");
      setFormType("accesorio");
    } else if (initialGroup === "aretes") {
      setFormCategory("aretes");
      setFormType("accesorio");
    } else if (initialGroup === "pulseras") {
      setFormCategory("pulseras");
      setFormType("accesorio");
    } else {
      setFormCategory("joyeria");
      setFormType("accesorio");
    }

    setFormPrice("");
    setFormBadge("Nuevo");
    setFormDesc("");
    setFormSubtitle("Platino Perú Joyería Fina");
    const initImg =
      initialGroup === "collares"
        ? "/images/cat-collares.jpg"
        : initialGroup === "pulseras"
        ? "/images/cat-pulseras.jpg"
        : "/images/cat-compromiso.jpg";
    setFormImage(initImg);
    setFormImageWhite(initImg);
    setFormImageYellow("");
    setFormImageRose("");
    setFormBoxImage("/images/detail-box-green.jpg");
    const initMetals = METALS.map((m) => m.id);
    setFormAvailableMetals(initMetals);
    setFormSelectedMetal("Oro 18k Blanco");
    const initPrices = {};
    const initImages = {};
    initMetals.forEach((mId) => {
      initPrices[mId] = "";
      initImages[mId] = ""; // Vacío por defecto: obliga a subir una foto individual por cada material
    });
    setFormMetalPrices(initPrices);
    setFormMetalImages(initImages);
    setFormShowDeliveryEstimate(initialGroup !== "anillos");
    setFormHasGemSelection(initialGroup === "anillos");
    const masterShapes = Array.isArray(MASTER_GEM_SHAPES) ? MASTER_GEM_SHAPES : [];
    const allShapeIds = masterShapes.map((s) => s.id);
    setFormAvailableGemShapes(allShapeIds);
    setFormDefaultGemShape("redondo");
    setFormGemShapeConfigs({});
    setFormActiveGemShapeTab("redondo");
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name || "");
    const group = getProductCategoryGroup(prod);
    setFormCategoryGroup(group);
    setFormCategory(prod.categories?.[0] || prod.category || (group === "anillos" ? "anillo-compromiso" : group));
    setFormPrice(prod.price || "");
    setFormType(prod.type || (group === "anillos" ? "anillo" : "accesorio"));
    setFormBadge(prod.badge || "");
    setFormDesc(prod.description || "");
    setFormSubtitle(prod.subtitle || "");

    const baseImg = prod.image || "/images/cat-compromiso.jpg";
    setFormImage(baseImg);
    setFormBoxImage(prod.boxImage || prod.presentationImage || "/images/detail-box-green.jpg");
    setFormShowDeliveryEstimate(
      prod.showDeliveryEstimate !== undefined
        ? !!prod.showDeliveryEstimate
        : (prod.type === "accesorio" || group !== "anillos")
    );

    // Extraer y normalizar los materiales disponibles del producto
    let metalIds = [];
    if (Array.isArray(prod.availableMetals) && prod.availableMetals.length > 0) {
      metalIds = prod.availableMetals.map((m) => (typeof m === "string" ? m : m.id));
    } else {
      metalIds = METALS.map((m) => m.id);
    }
    const normalizedIds = metalIds.map((id) => {
      if (id === "oro-blanco-18k") return "oro-18k-blanco";
      if (id === "oro-amarillo-18k") return "oro-18k-amarillo";
      if (id === "oro-rosa-18k") return "oro-18k-rosa";
      return id;
    });
    const finalIds = normalizedIds.filter((id) => METALS.some((m) => m.id === id));
    const finalMetals = finalIds.length > 0 ? finalIds : METALS.map((m) => m.id);
    setFormAvailableMetals(finalMetals);

    const defaultMetal = prod.selectedMetal || "Oro 18k Blanco";
    setFormSelectedMetal(defaultMetal);

    const existingPrices = prod.metalPrices || {};
    const existingImages = prod.metalImages || {};
    const editPrices = {};
    const editImages = {};

    finalMetals.forEach((mId) => {
      let p = existingPrices[mId];
      if (p === undefined && mId === "oro-18k-blanco") p = existingPrices["oro-blanco-18k"];
      if (p === undefined && mId === "oro-18k-amarillo") p = existingPrices["oro-amarillo-18k"];
      if (p === undefined && mId === "oro-18k-rosa") p = existingPrices["oro-rosa-18k"];
      editPrices[mId] = p !== undefined && p !== null ? String(p) : (prod.price ? String(prod.price) : "");

      // Foto estrictamente individual por cada material (sin agrupar en solo 3 imágenes)
      let img = existingImages[mId] || "";
      if (!img && mId === "oro-18k-blanco") img = existingImages["oro-blanco-18k"] || "";
      if (!img && mId === "oro-18k-amarillo") img = existingImages["oro-amarillo-18k"] || "";
      if (!img && mId === "oro-18k-rosa") img = existingImages["oro-rosa-18k"] || "";
      editImages[mId] = img;
    });

    setFormMetalPrices(editPrices);
    setFormMetalImages(editImages);

    // Siluetas y formas de gemas para este modelo
    const hasGems = prod.hasGemSelection !== undefined 
      ? !!prod.hasGemSelection 
      : (prod.type === "anillo" || group === "anillos");
    setFormHasGemSelection(hasGems);
    const masterShapes = Array.isArray(MASTER_GEM_SHAPES) ? MASTER_GEM_SHAPES : [];
    const allShapeIds = masterShapes.map((s) => s.id);
    const rawAvail = Array.isArray(prod.availableGemShapes) && prod.availableGemShapes.length > 0
      ? prod.availableGemShapes
      : (Array.isArray(prod.gemShapes) && prod.gemShapes.length > 0 ? prod.gemShapes : allShapeIds);
    const validAvail = rawAvail.filter((id) => allShapeIds.includes(id));
    const finalAvail = validAvail.length > 0 ? validAvail : allShapeIds;
    setFormAvailableGemShapes(finalAvail);
    const defShape = prod.defaultGemShape && finalAvail.includes(prod.defaultGemShape)
      ? prod.defaultGemShape
      : (finalAvail[0] || "redondo");
    setFormDefaultGemShape(defShape);
    setFormGemShapeConfigs(prod.gemShapeConfigs && typeof prod.gemShapeConfigs === "object" ? { ...prod.gemShapeConfigs } : {});
    setFormActiveGemShapeTab(defShape);

    setProductModalOpen(true);
  };

  const handleSelectFormCategoryGroup = (groupId) => {
    setFormCategoryGroup(groupId);
    if (groupId === "anillos") {
      setFormCategory("anillo-compromiso");
      setFormType("anillo");
    } else if (groupId === "collares") {
      setFormCategory("collares");
      setFormType("accesorio");
    } else if (groupId === "aretes") {
      setFormCategory("aretes");
      setFormType("accesorio");
    } else if (groupId === "pulseras") {
      setFormCategory("pulseras");
      setFormType("accesorio");
    } else {
      setFormCategory("joyeria");
      setFormType("accesorio");
    }
  };

  const handleToggleMetal = (metalId) => {
    setFormAvailableMetals((prev) => {
      if (prev.includes(metalId)) {
        if (prev.length <= 1) {
          alert("La joya debe tener al menos 1 material disponible.");
          return prev;
        }
        const updated = prev.filter((id) => id !== metalId);
        const removedMetal = METALS.find((m) => m.id === metalId);
        if (removedMetal && formSelectedMetal === removedMetal.name) {
          const firstRemain = METALS.find((m) => updated.includes(m.id));
          if (firstRemain) setFormSelectedMetal(firstRemain.name);
        }
        return updated;
      } else {
        setFormMetalPrices((prevP) => ({
          ...prevP,
          [metalId]: prevP[metalId] !== undefined && prevP[metalId] !== "" ? prevP[metalId] : (formPrice || ""),
        }));
        setFormMetalImages((prevI) => ({
          ...prevI,
          [metalId]: prevI[metalId] || "",
        }));
        return [...prev, metalId];
      }
    });
  };

  const handleSelectAllMetals = () => {
    const allIds = METALS.map((m) => m.id);
    setFormAvailableMetals(allIds);
    setFormMetalPrices((prevP) => {
      const nextP = { ...prevP };
      allIds.forEach((id) => {
        if (!nextP[id]) nextP[id] = formPrice || "";
      });
      return nextP;
    });
    setFormMetalImages((prevI) => {
      const nextI = { ...prevI };
      allIds.forEach((id) => {
        if (!nextI[id]) nextI[id] = "";
      });
      return nextI;
    });
  };

  const handleSelectOnlyGold = () => {
    const goldIds = METALS.filter((m) => m.group === "Oro 18k").map((m) => m.id);
    setFormAvailableMetals(goldIds);
    if (!goldIds.some((id) => METALS.find((m) => m.id === id)?.name === formSelectedMetal)) {
      setFormSelectedMetal("Oro 18k Amarillo");
    }
  };

  const handleSelectSilverAndMixed = () => {
    const silverIds = METALS.filter((m) => m.group === "Plata" || m.group === "Plata con Oro").map((m) => m.id);
    setFormAvailableMetals(silverIds);
    if (!silverIds.some((id) => METALS.find((m) => m.id === id)?.name === formSelectedMetal)) {
      setFormSelectedMetal("Plata 950");
    }
  };

  const handleMetalPriceChange = (metalId, val) => {
    setFormMetalPrices((prev) => ({
      ...prev,
      [metalId]: val,
    }));
    const metalObj = METALS.find((m) => m.id === metalId);
    if (metalObj && metalObj.name === formSelectedMetal) {
      setFormPrice(val);
    } else if (!formPrice) {
      setFormPrice(val);
    }
  };

  const handleApplyPriceToAll = (sourcePrice) => {
    if (!sourcePrice || isNaN(Number(sourcePrice)) || Number(sourcePrice) <= 0) {
      alert("Por favor ingresa un precio numérico válido mayor a 0 antes de aplicar a todos.");
      return;
    }
    const updated = { ...formMetalPrices };
    formAvailableMetals.forEach((id) => {
      updated[id] = sourcePrice;
    });
    setFormMetalPrices(updated);
    setFormPrice(sourcePrice);
  };

  const handleMetalImageChange = (metalId, val) => {
    setFormMetalImages((prev) => ({
      ...prev,
      [metalId]: val,
    }));
  };

  const handleMetalFileUpload = async (metalId, e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setFormMetalImages((prev) => ({
          ...prev,
          [metalId]: compressed,
        }));
      } catch (err) {
        alert(err.message || "Error al procesar la imagen del material.");
      }
    }
  };

  const handleBoxImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setFormBoxImage(compressed);
      } catch (err) {
        alert(err.message || "Error al procesar la imagen.");
      }
    }
  };

  const handleToggleGemShape = (shapeId) => {
    setFormAvailableGemShapes((prev) => {
      if (prev.includes(shapeId)) {
        if (prev.length <= 1) {
          alert("Debes mantener al menos una silueta de gema disponible para este modelo.");
          return prev;
        }
        const updated = prev.filter((id) => id !== shapeId);
        if (formDefaultGemShape === shapeId) {
          setFormDefaultGemShape(updated[0]);
        }
        if (formActiveGemShapeTab === shapeId) {
          setFormActiveGemShapeTab(updated[0]);
        }
        return updated;
      } else {
        return [...prev, shapeId];
      }
    });
  };

  const handleSelectDefaultGemShape = (shapeId) => {
    setFormDefaultGemShape(shapeId);
    if (!formAvailableGemShapes.includes(shapeId)) {
      setFormAvailableGemShapes((prev) => [...prev, shapeId]);
    }
    setFormActiveGemShapeTab(shapeId);
  };

  const handleGemShapeConfigChange = (shapeId, field, val) => {
    setFormGemShapeConfigs((prev) => ({
      ...prev,
      [shapeId]: {
        ...(prev[shapeId] || {}),
        [field]: val,
      },
    }));
  };

  const handleResetGemShapeConfig = (shapeId) => {
    setFormGemShapeConfigs((prev) => {
      const copy = { ...prev };
      delete copy[shapeId];
      return copy;
    });
  };

  const handleSelectAllGemShapes = () => {
    const allIds = (Array.isArray(MASTER_GEM_SHAPES) ? MASTER_GEM_SHAPES : []).map((s) => s.id);
    setFormAvailableGemShapes(allIds);
  };

  const handleSelectClassicGemShapes = () => {
    const classic = ["redondo", "oval", "esmeralda", "princesa"];
    const allIds = (Array.isArray(MASTER_GEM_SHAPES) ? MASTER_GEM_SHAPES : []).map((s) => s.id);
    const validClassic = classic.filter((id) => allIds.includes(id));
    setFormAvailableGemShapes(validClassic);
    if (!validClassic.includes(formDefaultGemShape)) {
      setFormDefaultGemShape(validClassic[0] || "redondo");
    }
    if (!validClassic.includes(formActiveGemShapeTab)) {
      setFormActiveGemShapeTab(validClassic[0] || "redondo");
    }
  };

  const getShapeEffectiveConfig = (shapeId) => {
    const base = (Array.isArray(MASTER_GEM_SHAPES) ? MASTER_GEM_SHAPES : []).find((s) => s.id === shapeId) || {};
    const custom = formGemShapeConfigs[shapeId] || {};
    return {
      ...base,
      ...custom,
      carat: custom.carat !== undefined ? custom.carat : (base.carat || base.popularCarat || ""),
      subtitle: custom.subtitle !== undefined ? custom.subtitle : (base.subtitle || ""),
      desc: custom.desc !== undefined ? custom.desc : (base.desc || ""),
      ratio: custom.ratio !== undefined ? custom.ratio : (base.ratio || ""),
      extraNote: custom.extraNote !== undefined ? custom.extraNote : (base.extraNote || ""),
    };
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Por favor completa el nombre de la joya.");
      return;
    }

    if (formAvailableMetals.length === 0) {
      alert("Por favor selecciona al menos un material disponible para la joya.");
      return;
    }

    // 1. Validar OBLIGATORIAMENTE que cada material seleccionado tenga precio en Soles > 0
    for (const mId of formAvailableMetals) {
      const metalObj = METALS.find((m) => m.id === mId) || { name: mId };
      const rawPrice = formMetalPrices[mId];
      const numPrice = Number(rawPrice);
      if (rawPrice === undefined || rawPrice === null || String(rawPrice).trim() === "" || isNaN(numPrice) || numPrice <= 0) {
        alert(`⚠️ Falta el valor (precio) para el material "${metalObj.name}". Cada material seleccionado debe tener un precio en Soles (S/.) mayor a 0.`);
        return;
      }
    }

    // 2. Validar OBLIGATORIAMENTE que cada material seleccionado tenga fotografía asignada
    for (const mId of formAvailableMetals) {
      const metalObj = METALS.find((m) => m.id === mId) || { name: mId };
      const imgVal = formMetalImages[mId];
      if (!imgVal || !imgVal.trim()) {
        alert(`⚠️ Falta la fotografía obligatoria para el material "${metalObj.name}". Es obligatorio asignar una foto para cada material seleccionado.`);
        return;
      }
    }

    const activeMetalsObjects = METALS.filter((m) => formAvailableMetals.includes(m.id));
    const fallbackMetalName = activeMetalsObjects[0]?.name || "Oro 18k Blanco";
    const finalSelectedMetal = activeMetalsObjects.some((m) => m.name === formSelectedMetal)
      ? formSelectedMetal
      : fallbackMetalName;

    const isRingGroup = formCategoryGroup === "anillos";
    const isArosType = formType === "aros" || formCategory === "aros-boda" || formCategory === "aros-alianzas";

    const metalPricesMap = {};
    const metalImagesMap = {};
    formAvailableMetals.forEach((mId) => {
      metalPricesMap[mId] = Number(formMetalPrices[mId]);
      metalImagesMap[mId] = formMetalImages[mId].trim();
    });

    const defaultMetalObj = activeMetalsObjects.find((m) => m.name === finalSelectedMetal) || activeMetalsObjects[0];
    const defaultMetalId = defaultMetalObj?.id || formAvailableMetals[0];
    const mainPrice = metalPricesMap[defaultMetalId] || Number(formPrice) || 0;
    const mainImg = metalImagesMap[defaultMetalId] || Object.values(metalImagesMap)[0] || "/images/cat-compromiso.jpg";

    // Retrocompatibilidad con aliases white, yellow, rose
    const whiteId = formAvailableMetals.find((id) => ["oro-18k-blanco", "plata-950", "plata-925", "platino"].includes(id));
    const yellowId = formAvailableMetals.find((id) => ["oro-18k-amarillo", "oro-18k-natural", "plata-950-oro-amarillo", "plata-950-oro-natural"].includes(id));
    const roseId = formAvailableMetals.find((id) => ["oro-18k-rosa", "plata-950-oro-rosa"].includes(id));

    if (whiteId) metalImagesMap.white = metalImagesMap[whiteId];
    if (yellowId) metalImagesMap.yellow = metalImagesMap[yellowId];
    if (roseId) metalImagesMap.rose = metalImagesMap[roseId];

    const finalBoxImage = formBoxImage.trim() || "/images/detail-box-green.jpg";
    const allImagesToInclude = [
      mainImg,
      ...Object.values(metalImagesMap).filter((v) => typeof v === "string"),
      finalBoxImage,
      ...(Array.isArray(editingProduct?.gallery) ? editingProduct.gallery : [])
    ].filter(Boolean);
    const baseGallery = Array.from(new Set(allImagesToInclude));

    const payload = {
      name: formName.trim(),
      subtitle: formSubtitle.trim() || "Platino Perú Colección Exclusiva",
      categories: Array.from(new Set([formCategory, formCategoryGroup, ...(editingProduct?.categories || [])])),
      category: formCategory,
      price: mainPrice,
      metalPrices: metalPricesMap,
      type: formType,
      hasDoubleSizes: isArosType,
      hasGemSelection: formHasGemSelection,
      availableGemShapes: formAvailableGemShapes,
      defaultGemShape: formDefaultGemShape,
      gemShapeConfigs: formGemShapeConfigs,
      badge: formBadge.trim(),
      description: formDesc.trim(),
      image: mainImg,
      boxImage: finalBoxImage,
      gallery: baseGallery,
      metalImages: metalImagesMap,
      availableMetals: activeMetalsObjects,
      selectedMetal: finalSelectedMetal,
      showDeliveryEstimate: isRingGroup ? false : formShowDeliveryEstimate,
      hasPresentationChoice: true,
      presentationOptions: [
        {
          id: "caja-verde-lujo",
          name: "Caja de Lujo Esmeralda Platino (Recomendado)",
          price: 0,
          image: finalBoxImage,
          description: "Estuche rígido icónico verde esmeralda Platino con interior de gamuza aterciopelada y detalles dorados."
        },
        {
          id: "estuche-terciopelo",
          name: "Estuche de Terciopelo Negro Nupcial",
          price: 25,
          image: "/images/box-presentation.jpg",
          description: "Estuche premium de terciopelo negro mate tacto suave, ideal para pedida de mano y bodas."
        },
        {
          id: "caja-madera",
          name: "Caja de Madera Laqueada con Luz LED Nupcial",
          price: 60,
          image: "/images/detail-packaging.jpg",
          description: "Caja de madera noble con acabado piano brillante e iluminación LED focalizada al abrir para máxima sorpresa."
        }
      ],
    };

    if (editingProduct) {
      const res = updateProduct(editingProduct.id, payload);
      if (res && res.error) {
        alert(typeof res.error === "string" ? res.error : "Error al actualizar la joya en el almacenamiento.");
        return;
      }
      setFeedbackMsg(`Joya "${formName}" actualizada con éxito.`);
    } else {
      const res = createProduct(payload);
      if (res && res.error) {
        alert(typeof res.error === "string" ? res.error : "Error al guardar la joya en el almacenamiento.");
        return;
      }
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

  const handleHomeImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1600, 1200, 0.82);
        setFormHomeImageSrc(compressed);
      } catch (err) {
        alert(err.message || "Error al procesar la imagen del inicio.");
      }
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
      const pCat = (p.category || "").toLowerCase();
      const pCats = Array.isArray(p.categories) ? p.categories.map((c) => String(c).toLowerCase()) : [];
      const pType = (p.type || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      const group = getProductCategoryGroup(p);

      if (catalogFilterCategory === "aros-boda") {
        const isBoda =
          pCat === "aros-boda" ||
          pCat === "aros-matrimonio" ||
          pCat === "aros" ||
          pCats.includes("aros-boda") ||
          pCats.includes("aros-matrimonio") ||
          pCats.includes("aros") ||
          pType === "aros" ||
          pName.includes("aros") ||
          pName.includes("boda") ||
          pName.includes("matrimonio");
        if (!isBoda) return false;
      } else if (catalogFilterCategory === "aros-alianzas") {
        const isAlianza =
          pCat === "aros-alianzas" ||
          pCat === "alianzas" ||
          pCats.includes("aros-alianzas") ||
          pCats.includes("alianzas") ||
          pName.includes("alianza");
        if (!isAlianza) return false;
      } else if (catalogFilterCategory === "anillo-compromiso") {
        const isCompromiso =
          pCat === "anillo-compromiso" ||
          pCat === "anillos-compromiso" ||
          pCats.includes("anillo-compromiso") ||
          pCats.includes("anillos-compromiso") ||
          pName.includes("compromiso");
        if (!isCompromiso) return false;
      } else if (catalogFilterCategory === "anillo-promesa") {
        const isPromesa =
          pCat === "anillo-promesa" ||
          pCat === "anillos-promesa" ||
          pCats.includes("anillo-promesa") ||
          pCats.includes("anillos-promesa") ||
          pName.includes("promesa");
        if (!isPromesa) return false;
      } else {
        const matchCat =
          pCat === catalogFilterCategory ||
          pCats.includes(catalogFilterCategory) ||
          group === catalogFilterCategory;
        if (!matchCat) return false;
      }
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

  // Determinar filtro activo de sede: si el admin pertenece a una sede específica, queda restringido al 100% a esa sede
  const activeSedeFilter = isSedeRestricted ? userAssignedSede : filterSede;

  // Filtrado de citas
  const filteredCitas = citasList.filter((c) => {
    if (activeSedeFilter !== "todas" && c.sedeId !== activeSedeFilter) return false;
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

  // Citas base para el admin según su sede asignada
  const baseCitasForAdmin = useMemo(() => {
    if (!isSedeRestricted) return citasList;
    return citasList.filter((c) => c.sedeId === userAssignedSede);
  }, [citasList, isSedeRestricted, userAssignedSede]);

  // Métricas
  const totalCitas = baseCitasForAdmin.length;
  const citasConfirmadas = baseCitasForAdmin.filter((c) => c.status === "confirmada").length;
  const citasPendientes = baseCitasForAdmin.filter((c) => c.status === "pendiente").length;
  const totalBloqueos = effectiveBlockedList.length;

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

  // Renderizado del Guard de Permisos cuando un Administrador de Sede intenta acceder a una sección restringida
  const renderAccessGuard = (permKey, permTitle, permDesc) => {
    const pending = getActivePendingRequest(effectiveUser, permKey);
    const reasonVal = reasonInputState[permKey] || "";

    return (
      <div className="admin-content-card admin-perm-guard-card">
        <div className="perm-guard-hero">
          <div className="perm-guard-icon-box">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <div className="perm-guard-hero-text">
            <span className="perm-guard-badge">Acceso Restringido</span>
            <h2>Requiere Autorización de Vladimir</h2>
            <p>
              Esta sección (<strong>{permTitle}</strong>) requiere aprobación directa de Vladimir (Super Administrador Principal).
            </p>
          </div>
        </div>

        <div className="perm-guard-details-grid">
          <div className="perm-guard-detail-item">
            <span className="detail-lbl">Administrador Actual</span>
            <strong>{effectiveUser?.name || "Administrador"}</strong>
            <span className="detail-sub">{effectiveUser?.email}</span>
          </div>
          <div className="perm-guard-detail-item">
            <span className="detail-lbl">Sede Asignada</span>
            <strong>{effectiveUser?.sedeLabel || "Sede Local"}</strong>
            <span className="detail-sub">Ámbito de operación local</span>
          </div>
          <div className="perm-guard-detail-item">
            <span className="detail-lbl">Permiso Requerido</span>
            <strong>{permTitle}</strong>
            <span className="detail-sub">{permDesc}</span>
          </div>
        </div>

        {pending ? (
          <div className="perm-guard-pending-box">
            <div className="pending-status-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="pending-status-info">
              <h4>Solicitud en Revisión por Vladimir</h4>
              <p>
                Enviaste una solicitud para este permiso el{" "}
                <strong>
                  {new Date(pending.createdAt).toLocaleString("es-PE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </strong>
                . Vladimir puede aprobarla en 1 clic desde su panel de control.
              </p>
              {pending.reason && (
                <div className="pending-reason-quote">
                  <em>"{pending.reason}"</em>
                </div>
              )}
              <span className="pending-pill">
                <i className="bi bi-clock-history"></i> Estado: Pendiente de Aprobación
              </span>
            </div>
          </div>
        ) : (
          <div className="perm-guard-request-form">
            <h3>
              <i className="bi bi-send-check"></i> Solicitar Permiso a Vladimir
            </h3>
            <p>
              Escribe el motivo o justificación de tu solicitud para que Vladimir la revise y apruebe:
            </p>
            <textarea
              className="perm-guard-textarea"
              placeholder="Ejemplo: Necesito acceso a finanzas para validar los pagos (BCP, Interbank, IziPay, Efectivo) de los clientes atendidos en Lima Centro..."
              rows={3}
              value={reasonVal}
              onChange={(e) =>
                setReasonInputState((prev) => ({ ...prev, [permKey]: e.target.value }))
              }
            />
            <div className="perm-guard-actions">
              <button
                type="button"
                className="btn-perm-submit-request"
                onClick={() => handleSendPermissionRequest(permKey)}
              >
                <i className="bi bi-shield-plus"></i> Enviar Solicitud a Vladimir
              </button>
              <button
                type="button"
                className="btn-perm-back-citas"
                onClick={() => setActiveTab("permisos")}
              >
                <i className="bi bi-key-fill"></i> Ir a Solicitud de Permisos
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizado de la Pestaña de Permisos & Sedes para Vladimir y Solicitud de Permisos para Sedes
  const renderPermisosTab = () => {
    if (!isEffectiveMaster) {
      const currentSedeEmail = effectiveUser?.email?.toLowerCase() || "";
      const myActivePermissions = permissionsMatrix[currentSedeEmail] || [];
      const myRequests = permissionRequests.filter(
        (r) => r.userEmail?.toLowerCase() === currentSedeEmail
      );
      const myPendingCount = myRequests.filter((r) => r.status === "pendiente").length;

      const MODULE_PURPOSE_DETAILS = {
        citas: {
          purpose: "Permite ver la agenda de clientes de tu sede, confirmar o reprogramar citas presenciales y bloquear horarios de atención.",
          suggestedReason: `Necesito gestionar y confirmar las citas agendadas por los clientes en ${effectiveUser?.sedeLabel || "mi sede"}.`,
        },
        pedidos: {
          purpose: "Permite supervisar la fabricación de joyas en taller (Recibido, Taller, Engaste, Calidad y Entrega) y añadir notas de orfebrería.",
          suggestedReason: `Necesito actualizar el estado de fabricación y entrega de los pedidos asignados a ${effectiveUser?.sedeLabel || "mi sede"}.`,
        },
        inventario: {
          purpose: "Permite administrar y actualizar las unidades en stock por tallas de Dama y Varón disponibles físicamente en la vitrina de tu sede.",
          suggestedReason: `Necesito actualizar el conteo físico de anillos y tallas disponibles en ${effectiveUser?.sedeLabel || "mi sede"}.`,
        },
        finanzas: {
          purpose: "Permite auditar órdenes de compra, verificar comprobantes de pago (BCP, Interbank, IziPay, Efectivo) y confirmar pagos al 100%.",
          suggestedReason: `Necesito validar en tiempo real los pagos y transferencias de clientes atendidos en ${effectiveUser?.sedeLabel || "mi sede"}.`,
        },
        catalogo: {
          purpose: "Permite publicar nuevas joyas en el catálogo oficial, configurar metales, quilates, siluetas y actualizar precios de venta.",
          suggestedReason: `Solicito acceso para registrar nuevas piezas de joyería y actualizar fotografías del catálogo desde ${effectiveUser?.sedeLabel || "mi sede"}.`,
        },
        home_images: {
          purpose: "Permite renovar los banners principales de la página de inicio, imágenes promocionales y la barra superior de anuncios.",
          suggestedReason: `Necesito actualizar los banners promocionales y anuncios de campaña vigentes para los clientes.`,
        },
        nosotros: {
          purpose: "Permite editar la sección institucional 'Nosotros', hitos históricos y fotografías del taller de Platino Perú.",
          suggestedReason: `Solicito permiso para actualizar la información institucional e imágenes de nuestra sede en la página Nosotros.`,
        },
        citas_global: {
          purpose: "Permite visualizar y coordinar reservas de clientes en todas las sedes de Platino Perú (Lima Centro y Miraflores) simultáneamente.",
          suggestedReason: `Necesito consultar disponibilidad de horarios en la otra sede para derivar clientes que buscan atención inmediata.`,
        },
        inventario_global: {
          purpose: "Permite consultar y modificar el stock de Bodega Central y de otras sedes para coordinar traslados de tallas entre tiendas.",
          suggestedReason: `Solicito autorización para gestionar traslados de stock desde Bodega Central hacia la vitrina de ${effectiveUser?.sedeLabel || "mi sede"}.`,
        },
        descargar_excel: {
          purpose: "Permite descargar reportes de inventario por tallas y registros operativos en formato oficial Excel (.xls / .csv).",
          suggestedReason: `Necesito exportar el reporte mensual de stock y tallas de ${effectiveUser?.sedeLabel || "mi sede"} en Excel.`,
        },
        reclamaciones: {
          purpose: "Permite revisar hojas de reclamación y quejas registradas conforme a INDECOPI y redactar la respuesta legal.",
          suggestedReason: `Solicito acceso para dar seguimiento a un reclamo presentado por un cliente atendido en ${effectiveUser?.sedeLabel || "mi sede"}.`,
        },
      };

      return (
        <div>
          {/* Banner Superior del Portal de Solicitud de Permisos de Sede */}
          <div
            style={{
              background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
              borderRadius: "16px",
              padding: "26px 28px",
              color: "#ffffff",
              marginBottom: "26px",
              boxShadow: "0 10px 25px rgba(17, 59, 58, 0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "18px",
            }}
          >
            <div style={{ maxWidth: "680px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "rgba(198, 172, 127, 0.22)",
                    color: "#e6cfa8",
                    border: "1px solid rgba(198, 172, 127, 0.45)",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <i className="bi bi-shield-plus"></i> SOLICITUD DE PERMISOS & CRUCE CON ADMIN CENTRAL
                </span>
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.14)",
                    color: "#ffffff",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11.5px",
                    fontWeight: "700",
                  }}
                >
                  <i className="bi bi-geo-alt-fill" style={{ color: "#C6AC7F" }}></i> {effectiveUser?.sedeLabel || "Sede Asignada"}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "23px",
                  margin: "0 0 6px 0",
                  color: "#ffffff",
                  fontWeight: "600",
                }}
              >
                Solicitud de Permisos y Cruce de Aprobación con Vladimir
              </h3>
              <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.86)", margin: 0, lineHeight: "1.55" }}>
                Desde este apartado <strong>únicamente puedes solicitar permisos</strong> indicando para qué los necesitas. Cada solicitud se envía en tiempo real al panel de <strong>Administración Central (Vladimir)</strong>, quien acepta o deniega la autorización.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                padding: "12px 18px",
                borderRadius: "12px",
              }}
            >
              <div style={{ textAlign: "center", paddingRight: "12px", borderRight: "1px solid rgba(255,255,255,0.18)" }}>
                <span style={{ display: "block", fontSize: "20px", fontWeight: "800", color: "#86efac" }}>
                  {myActivePermissions.length}
                </span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
                  Aceptados
                </span>
              </div>
              <div style={{ textAlign: "center", paddingLeft: "4px" }}>
                <span style={{ display: "block", fontSize: "20px", fontWeight: "800", color: "#fde68a" }}>
                  {myPendingCount}
                </span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
                  En Revisión
                </span>
              </div>
            </div>
          </div>

          {/* Catálogo de Módulos: Explicación de para qué sirve cada uno y formulario exclusivo de solicitud */}
          <div
            className="admin-content-card"
            style={{
              marginBottom: "26px",
              padding: "26px",
              borderRadius: "16px",
              border: "1.5px solid #e2e8f0",
            }}
          >
            <div style={{ marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: "18px", color: "#0f172a", margin: "0 0 4px", fontWeight: "700" }}>
                <i className="bi bi-grid-1x2-fill" style={{ color: "#113B3A", marginRight: "8px" }}></i>
                Solicitar Permisos de Módulos (Cruce con Administración Central)
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Revisa para qué sirve cada permiso, redacta el motivo por el cual tu sede lo requiere y envía la solicitud para que Vladimir la acepte desde su panel.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "18px",
              }}
            >
              {PERMISSIONS_CATALOG.map((perm) => {
                const isGranted = myActivePermissions.includes(perm.key);
                const pendingReq = getActivePendingRequest(effectiveUser, perm.key);
                const lastApprovedReq = myRequests.find(
                  (r) => r.permissionKey === perm.key && r.status === "aprobado"
                );
                const lastRejectedReq = myRequests.find(
                  (r) => r.permissionKey === perm.key && r.status === "rechazado"
                );
                const details = MODULE_PURPOSE_DETAILS[perm.key] || {
                  purpose: perm.description,
                  suggestedReason: `Solicito acceso al módulo ${perm.name} para las operaciones de ${effectiveUser?.sedeLabel || "mi sede"}.`,
                };
                const currentReason = reasonInputState[perm.key] || "";

                return (
                  <div
                    key={perm.key}
                    style={{
                      background: isGranted ? "#f8fdfb" : pendingReq ? "#fffdf5" : "#ffffff",
                      border: `1.5px solid ${
                        isGranted ? "#a7f3d0" : pendingReq ? "#fde68a" : "#e2e8f0"
                      }`,
                      borderRadius: "14px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                      boxShadow: "0 3px 10px rgba(15, 23, 42, 0.03)",
                    }}
                  >
                    <div>
                      {/* Encabezado de la tarjeta del permiso */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "10px",
                              background: isGranted ? "#dcfce7" : pendingReq ? "#fef3c7" : "#f1f5f9",
                              color: isGranted ? "#166534" : pendingReq ? "#b45309" : "#113B3A",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "19px",
                              flexShrink: 0,
                            }}
                          >
                            <i className={`bi ${perm.icon}`}></i>
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: "#64748b",
                                display: "block",
                              }}
                            >
                              {perm.category}
                            </span>
                            <h4 style={{ margin: 0, fontSize: "15.5px", color: "#0f172a", fontWeight: "700" }}>
                              {perm.name}
                            </h4>
                          </div>
                        </div>

                        {isGranted ? (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#166534",
                              border: "1px solid #86efac",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: "800",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <i className="bi bi-check-circle-fill"></i> Aceptado por Admin
                          </span>
                        ) : pendingReq ? (
                          <span
                            style={{
                              background: "#fef3c7",
                              color: "#92400e",
                              border: "1px solid #fde68a",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: "800",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <i className="bi bi-hourglass-split"></i> En Revisión
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: "700",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <i className="bi bi-lock-fill"></i> Requiere Permiso
                          </span>
                        )}
                      </div>

                      {/* Explicación clara de PARA QUÉ ES este permiso */}
                      <div
                        style={{
                          background: isGranted ? "rgba(255,255,255,0.8)" : "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "11px 13px",
                          marginBottom: "4px",
                        }}
                      >
                        <div style={{ fontSize: "11px", fontWeight: "800", color: "#113B3A", textTransform: "uppercase", marginBottom: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
                          <i className="bi bi-info-circle-fill" style={{ color: "#C6AC7F" }}></i>
                          ¿Para qué sirve este permiso?
                        </div>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", lineHeight: "1.5" }}>
                          {details.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Pie de tarjeta según estado del cruce con Vladimir: Aceptado / En Revisión / Solicitar Permiso */}
                    {isGranted ? (
                      <div
                        style={{
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          borderRadius: "10px",
                          padding: "11px 13px",
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "#065f46", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <i className="bi bi-shield-fill-check" style={{ color: "#059669", fontSize: "14px" }}></i>
                          Permiso Aceptado por {lastApprovedReq?.resolvedBy || "Vladimir (Admin Central)"}
                        </div>
                        {lastApprovedReq?.reason && (
                          <div style={{ fontSize: "11.5px", color: "#047857", fontStyle: "italic", marginBottom: "4px" }}>
                            Motivo autorizado: "{lastApprovedReq.reason}"
                          </div>
                        )}
                        <div style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>
                          ✓ Validado en el cruce de permisos con Administración Central
                          {lastApprovedReq?.resolvedAt
                            ? ` (${new Date(lastApprovedReq.resolvedAt).toLocaleDateString("es-PE")})`
                            : ""}
                        </div>
                      </div>
                    ) : pendingReq ? (
                      <div
                        style={{
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: "10px",
                          padding: "11px 13px",
                        }}
                      >
                        <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#92400e", marginBottom: "4px" }}>
                          <i className="bi bi-send-check-fill"></i> Solicitud en Bandeja de Vladimir:
                        </div>
                        <div style={{ fontSize: "12px", color: "#78350f", fontStyle: "italic", marginBottom: "6px" }}>
                          "{pendingReq.reason}"
                        </div>
                        <div style={{ fontSize: "11px", color: "#b45309", fontWeight: "600" }}>
                          ⏳ Esperando que Vladimir acepte el permiso en su panel de control
                        </div>
                      </div>
                    ) : (
                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                        {lastRejectedReq && (
                          <div
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              borderRadius: "8px",
                              padding: "8px 10px",
                              marginBottom: "8px",
                              fontSize: "11.5px",
                              color: "#991b1b",
                            }}
                          >
                            <strong><i className="bi bi-x-circle-fill"></i> Solicitud previa no aceptada por {lastRejectedReq.resolvedBy || "Vladimir"}:</strong>{" "}
                            Puedes enviar una nueva solicitud detallando el motivo.
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", gap: "6px", flexWrap: "wrap" }}>
                          <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#0f172a" }}>
                            ¿Para qué necesitas este permiso? *
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setReasonInputState((prev) => ({
                                ...prev,
                                [perm.key]: details.suggestedReason,
                              }))
                            }
                            style={{
                              background: "#f1f5f9",
                              color: "#113B3A",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              padding: "2px 8px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                            title="Usar motivo sugerido para este módulo"
                          >
                            <i className="bi bi-magic"></i> Autocompletar motivo
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          placeholder={`Ej: ${details.suggestedReason}`}
                          value={currentReason}
                          onChange={(e) =>
                            setReasonInputState((prev) => ({
                              ...prev,
                              [perm.key]: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12px",
                            marginBottom: "8px",
                            resize: "vertical",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => handleSendPermissionRequest(perm.key)}
                          style={{
                            width: "100%",
                            background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "9px",
                            padding: "9px 14px",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "7px",
                            boxShadow: "0 3px 10px rgba(17, 59, 58, 0.16)",
                          }}
                        >
                          <i className="bi bi-shield-plus" style={{ color: "#C6AC7F" }}></i>
                          Solicitar Permiso a Vladimir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de Solicitudes de esta Sede */}
          <div
            className="admin-content-card"
            style={{
              padding: "24px",
              borderRadius: "16px",
              border: "1.5px solid #e2e8f0",
            }}
          >
            <h3 style={{ fontSize: "17px", color: "#0f172a", margin: "0 0 6px", fontWeight: "700" }}>
              <i className="bi bi-clock-history" style={{ color: "#113B3A", marginRight: "8px" }}></i>
              Historial de Solicitudes y Cruce de Respuestas ({effectiveUser?.sedeLabel || "tu Sede"})
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
              Registro de todos los permisos solicitados desde tu cuenta, el motivo ("para qué se solicitó") y la respuesta del cruce con Administración Central (Vladimir).
            </p>

            {myRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 16px", background: "#f8fafc", borderRadius: "12px", color: "#64748b", fontSize: "13.5px" }}>
                Aún no has enviado solicitudes de permisos desde esta sede.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "240px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{req.permissionName}</strong>
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                          • {new Date(req.createdAt).toLocaleDateString("es-PE")}
                        </span>
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#334155" }}>
                        <strong>Para qué se solicitó:</strong> "{req.reason}"
                      </div>
                    </div>

                    <div>
                      {req.status === "aprobado" ? (
                        <span style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "700" }}>
                          <i className="bi bi-check-circle-fill"></i> Aceptado por {req.resolvedBy || "Vladimir"}
                        </span>
                      ) : req.status === "rechazado" ? (
                        <span style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "700" }}>
                          <i className="bi bi-x-circle-fill"></i> Rechazado por {req.resolvedBy || "Vladimir"}
                        </span>
                      ) : (
                        <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "700" }}>
                          <i className="bi bi-hourglass-split"></i> Pendiente de Aceptación de Vladimir
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    const countPendientes = permissionRequests.filter((r) => r.status === "pendiente").length;
    const countAprobadas = permissionRequests.filter((r) => r.status === "aprobado").length;
    const countRechazadas = permissionRequests.filter((r) => r.status === "rechazado").length;

    const filteredRequests = permissionRequests.filter((r) => {
      if (requestsFilterStatus === "pendientes") return r.status === "pendiente";
      if (requestsFilterStatus === "aprobadas") return r.status === "aprobado";
      if (requestsFilterStatus === "rechazadas") return r.status === "rechazado";
      return true;
    });

    const handleApproveAllPending = () => {
      const pendingList = permissionRequests.filter((r) => r.status === "pendiente");
      if (pendingList.length === 0) return;
      pendingList.forEach((req) => {
        approvePermissionRequest(req.id, user?.name || "Vladimir");
      });
      setPermissionRequests(getPermissionRequests());
      setPermissionsMatrix(getPermissionsMatrix());
      setFeedbackMsg(`✓ Se aprobaron las ${pendingList.length} solicitudes pendientes y se habilitaron sus permisos.`);
      setTimeout(() => setFeedbackMsg(""), 4500);
    };

    const handleBulkSetUserPermissions = (targetEmail, targetName, mode) => {
      const allKeys = PERMISSIONS_CATALOG.map((p) => p.key);
      if (mode === "all") {
        allKeys.forEach((key) => {
          toggleUserPermission(targetEmail, key, true);
        });
      } else {
        allKeys.forEach((key) => {
          toggleUserPermission(targetEmail, key, false);
        });
      }
      setPermissionsMatrix(getPermissionsMatrix());
      setPermissionRequests(getPermissionRequests());
      setFeedbackMsg(
        mode === "all"
          ? `✓ Todos los permisos fueron aprobados y habilitados para ${targetName}.`
          : `↺ Se revocaron todos los permisos de ${targetName}. Ahora deberá solicitarlos nuevamente.`
      );
      setTimeout(() => setFeedbackMsg(""), 4000);
    };

    return (
      <div>
        {/* Banner Ejecutivo del Centro de Seguridad & Gobernanza */}
        <div
          style={{
            background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
            borderRadius: "16px",
            padding: "24px 28px",
            color: "#ffffff",
            marginBottom: "26px",
            boxShadow: "0 10px 25px rgba(17, 59, 58, 0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "rgba(198, 172, 127, 0.22)",
                  color: "#e6cfa8",
                  border: "1px solid rgba(198, 172, 127, 0.45)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <i className="bi bi-shield-check"></i> CENTRO DE SEGURIDAD & ACCESOS MASTER
              </span>
              {countPendientes > 0 && (
                <span
                  style={{
                    background: "rgba(239, 68, 68, 0.25)",
                    color: "#fecaca",
                    border: "1px solid rgba(252, 165, 165, 0.4)",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  ● {countPendientes} {countPendientes === 1 ? "solicitud pendiente" : "solicitudes pendientes"}
                </span>
              )}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "23px",
                margin: "0 0 6px 0",
                color: "#ffffff",
                fontWeight: "600",
              }}
            >
              Autorizaciones y Matriz de Permisos por Sede
            </h3>
            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.85)", margin: 0, lineHeight: "1.5" }}>
              Aprueba o deniega solicitudes de acceso en tiempo real y configura los módulos habilitados para Lima Centro y Miraflores.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {countPendientes > 0 && (
              <button
                type="button"
                onClick={handleApproveAllPending}
                style={{
                  background: "#C6AC7F",
                  color: "#113B3A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "11px 18px",
                  fontSize: "12.5px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.2s ease",
                }}
                title="Aprobar todas las solicitudes pendientes en un solo clic"
              >
                <i className="bi bi-check2-all" style={{ fontSize: "16px" }}></i>
                Aprobar Todas ({countPendientes})
              </button>
            )}
          </div>
        </div>

        {/* Sección 1: Bandeja de Solicitudes de Permisos */}
        <div
          className="admin-content-card"
          style={{
            marginBottom: "26px",
            padding: "26px",
            borderRadius: "16px",
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "22px",
              paddingBottom: "18px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                  color: "#C6AC7F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(17, 59, 58, 0.16)",
                }}
              >
                <i className="bi bi-inbox-fill"></i>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "18px", color: "#0f172a", margin: 0, fontWeight: "700" }}>
                    Bandeja de Solicitudes de Acceso
                  </h2>
                  <span
                    style={{
                      background: "#f1f5f9",
                      color: "#334155",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {permissionRequests.length} registradas
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Revisa y aprueba o rechaza en tiempo real las solicitudes enviadas por los administradores de sede.
                </p>
              </div>
            </div>

            {/* Píldoras Segmentadas de Filtro de Estado */}
            <div
              style={{
                display: "inline-flex",
                background: "#f1f5f9",
                padding: "4px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                gap: "4px",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  id: "pendientes",
                  label: "Pendientes",
                  count: countPendientes,
                  icon: "bi-hourglass-split",
                  activeBg: "#113B3A",
                  activeColor: "#ffffff",
                  badgeBg: "#C6AC7F",
                  badgeColor: "#113B3A",
                },
                {
                  id: "aprobadas",
                  label: "Aprobadas",
                  count: countAprobadas,
                  icon: "bi-check-circle-fill",
                  activeBg: "#0f766e",
                  activeColor: "#ffffff",
                  badgeBg: "rgba(255,255,255,0.22)",
                  badgeColor: "#ffffff",
                },
                {
                  id: "rechazadas",
                  label: "Rechazadas",
                  count: countRechazadas,
                  icon: "bi-x-circle-fill",
                  activeBg: "#991b1b",
                  activeColor: "#ffffff",
                  badgeBg: "rgba(255,255,255,0.22)",
                  badgeColor: "#ffffff",
                },
                {
                  id: "todas",
                  label: "Todas",
                  count: permissionRequests.length,
                  icon: "bi-collection-fill",
                  activeBg: "#334155",
                  activeColor: "#ffffff",
                  badgeBg: "rgba(255,255,255,0.22)",
                  badgeColor: "#ffffff",
                },
              ].map((tab) => {
                const isAct = requestsFilterStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRequestsFilterStatus(tab.id)}
                    style={{
                      border: "none",
                      borderRadius: "9px",
                      padding: "8px 14px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      background: isAct ? tab.activeBg : "transparent",
                      color: isAct ? tab.activeColor : "#475569",
                      boxShadow: isAct ? "0 2px 8px rgba(15, 23, 42, 0.16)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i
                      className={`bi ${tab.icon}`}
                      style={{
                        color: isAct
                          ? tab.id === "pendientes"
                            ? "#C6AC7F"
                            : "#ffffff"
                          : "#64748b",
                        fontSize: "13px",
                      }}
                    ></i>
                    <span>{tab.label}</span>
                    <span
                      style={{
                        background: isAct ? tab.badgeBg : "#e2e8f0",
                        color: isAct ? tab.badgeColor : "#334155",
                        padding: "1px 7px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "800",
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div
              style={{
                padding: "42px 24px",
                textAlign: "center",
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: "14px",
                border: "1.5px dashed #cbd5e1",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  margin: "0 auto 12px",
                }}
              >
                <i className="bi bi-check2-all"></i>
              </div>
              <strong style={{ display: "block", fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>
                Bandeja al día
              </strong>
              <span style={{ fontSize: "13px" }}>
                No hay solicitudes {requestsFilterStatus === "pendientes" ? "pendientes de revisión en este momento" : "en esta categoría"}.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredRequests.map((req) => {
                const isPending = req.status === "pendiente";
                const isApproved = req.status === "aprobado";
                const permInfo = PERMISSIONS_CATALOG.find((p) => p.key === req.permissionKey);

                return (
                  <div
                    key={req.id}
                    style={{
                      background: isPending ? "#fffdf9" : "#ffffff",
                      border: isPending
                        ? "1.5px solid #e6cfa8"
                        : isApproved
                        ? "1.5px solid #bbf7d0"
                        : "1.5px solid #fecaca",
                      borderLeft: isPending
                        ? "5px solid #C6AC7F"
                        : isApproved
                        ? "5px solid #16a34a"
                        : "5px solid #dc2626",
                      borderRadius: "14px",
                      padding: "20px 22px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "18px",
                      boxShadow: "0 3px 10px rgba(15, 23, 42, 0.03)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ flex: "1 1 480px" }}>
                      {/* Primera línea: Usuario, Sede, Permiso Solicitado y Estado */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "#113B3A",
                            color: "#C6AC7F",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            fontSize: "14px",
                            flexShrink: 0,
                          }}
                        >
                          {(req.userName || "A").charAt(0).toUpperCase()}
                        </div>

                        <strong style={{ fontSize: "16px", color: "#0f172a", fontWeight: "800" }}>
                          {req.userName}
                        </strong>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            fontWeight: "700",
                            background: "#ecfdf5",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                            padding: "4px 11px",
                            borderRadius: "999px",
                          }}
                        >
                          <i className="bi bi-geo-alt-fill"></i> {req.userSedeLabel}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            background: "#f1f5f9",
                            color: "#1e293b",
                            border: "1px solid #cbd5e1",
                            padding: "4px 12px",
                            borderRadius: "999px",
                          }}
                        >
                          <i className={`bi ${permInfo?.icon || "bi-key-fill"}`} style={{ color: "#113B3A" }}></i>
                          Permiso: {req.permissionName}
                        </span>

                        {isApproved && (
                          <span
                            style={{
                              fontSize: "11.5px",
                              background: "#dcfce7",
                              color: "#166534",
                              border: "1px solid #86efac",
                              padding: "3px 10px",
                              borderRadius: "999px",
                              fontWeight: "800",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <i className="bi bi-check-circle-fill"></i> Aprobada
                          </span>
                        )}

                        {!isPending && !isApproved && (
                          <span
                            style={{
                              fontSize: "11.5px",
                              background: "#fee2e2",
                              color: "#991b1b",
                              border: "1px solid #fca5a5",
                              padding: "3px 10px",
                              borderRadius: "999px",
                              fontWeight: "800",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <i className="bi bi-x-circle-fill"></i> Rechazada
                          </span>
                        )}
                      </div>

                      {/* Motivo justificado */}
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderLeft: "3px solid #113B3A",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          fontSize: "13px",
                          color: "#334155",
                          marginBottom: "10px",
                          lineHeight: "1.5",
                        }}
                      >
                        <strong style={{ color: "#0f172a" }}>Motivo indicado:</strong> "{req.reason}"
                      </div>

                      {/* Metadatos de correo y fecha */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "#64748b" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <i className="bi bi-envelope" style={{ color: "#113B3A" }}></i> {req.userEmail}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <i className="bi bi-clock" style={{ color: "#113B3A" }}></i> Enviada:{" "}
                          {new Date(req.createdAt).toLocaleString("es-PE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        {req.resolvedAt && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#0f766e", fontWeight: "600" }}>
                            <i className="bi bi-shield-check"></i> Resuelta por {req.resolvedBy} (
                            {new Date(req.resolvedAt).toLocaleString("es-PE", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botones Ejecutivos de Acción */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req.id)}
                            title="Conceder y activar este permiso inmediatamente"
                            style={{
                              background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                              color: "#ffffff",
                              border: "1px solid #C6AC7F",
                              borderRadius: "10px",
                              padding: "11px 20px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              boxShadow: "0 4px 12px rgba(17, 59, 58, 0.22)",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <i className="bi bi-shield-fill-check" style={{ color: "#C6AC7F", fontSize: "15px" }}></i>
                            Aprobar Permiso
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectRequest(req.id)}
                            title="Denegar esta solicitud de permiso"
                            style={{
                              background: "#fff1f2",
                              color: "#be123c",
                              border: "1.5px solid #fecdd3",
                              borderRadius: "10px",
                              padding: "11px 18px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <i className="bi bi-x-circle"></i>
                            Rechazar
                          </button>
                        </>
                      ) : isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleRejectRequest(req.id)}
                          style={{
                            background: "#f8fafc",
                            color: "#64748b",
                            border: "1px solid #cbd5e1",
                            borderRadius: "9px",
                            padding: "8px 14px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="Cambiar estado a Rechazada"
                        >
                          <i className="bi bi-arrow-counterclockwise"></i> Marcar Rechazada
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req.id)}
                          style={{
                            background: "#ecfdf5",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                            borderRadius: "9px",
                            padding: "8px 14px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="Aprobar y conceder este permiso ahora"
                        >
                          <i className="bi bi-check2-circle"></i> Aprobar Ahora
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sección 2: Matriz Interactiva de Permisos */}
        <div
          className="admin-content-card"
          style={{
            marginBottom: "26px",
            padding: "26px",
            borderRadius: "16px",
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: "#e6f0ee",
                  color: "#113B3A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-grid-3x3-gap-fill"></i>
              </div>
              <div>
                <h2 style={{ fontSize: "18px", color: "#0f172a", margin: 0, fontWeight: "700" }}>
                  Matriz de Permisos por Administrador
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Activa o desactiva directamente cualquier módulo o utiliza los botones de acción rápida por sede.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "12px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "999px", fontWeight: "700" }}>
                <i className="bi bi-shield-check"></i> Master = Control Permanente
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#ecfdf5", color: "#047857", padding: "4px 10px", borderRadius: "999px", fontWeight: "700" }}>
                <i className="bi bi-toggle-on"></i> Sincronización Instantánea
              </span>
            </div>
          </div>

          <div className="perm-matrix-wrapper" style={{ borderRadius: "12px", overflowX: "auto", border: "1px solid #e2e8f0" }}>
            <table className="admin-perm-matrix-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                  <th style={{ minWidth: "240px", padding: "14px 16px", textAlign: "left" }}>Administrador & Acciones Rápidas</th>
                  <th style={{ minWidth: "135px", padding: "14px 12px", textAlign: "left" }}>Sede Asignada</th>
                  {PERMISSIONS_CATALOG.map((p) => (
                    <th key={p.key} title={p.description} style={{ textAlign: "center", padding: "12px 10px", minWidth: "105px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            background: "#e6f0ee",
                            color: "#113B3A",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                          }}
                        >
                          <i className={`bi ${p.icon}`}></i>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b", lineHeight: "1.2" }}>
                          {p.shortLabel}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ADMIN_ACCOUNTS.map((acc) => {
                  const isMaster = acc.email === "vladimiryt18@gmail.com";
                  const userPerms = permissionsMatrix[acc.email] || [];

                  return (
                    <tr
                      key={acc.email}
                      style={{
                        background: isMaster ? "#fffdf7" : "#ffffff",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: isMaster ? 0 : "10px" }}>
                          <span style={{ fontSize: "22px" }}>{acc.avatarBadge}</span>
                          <div>
                            <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>{acc.name}</strong>
                            <div style={{ fontSize: "11.5px", color: "#64748b" }}>{acc.email}</div>
                          </div>
                        </div>

                        {!isMaster && (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => handleBulkSetUserPermissions(acc.email, acc.name, "all")}
                              style={{
                                background: "#ecfdf5",
                                color: "#047857",
                                border: "1px solid #a7f3d0",
                                borderRadius: "6px",
                                padding: "4px 9px",
                                fontSize: "10.5px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="Conceder todos los permisos a esta sede"
                            >
                              <i className="bi bi-check2-all"></i> Habilitar Todo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkSetUserPermissions(acc.email, acc.name, "revoke")}
                              style={{
                                background: "#fff1f2",
                                color: "#be123c",
                                border: "1px solid #fecdd3",
                                borderRadius: "6px",
                                padding: "4px 9px",
                                fontSize: "10.5px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="Revocar todos los permisos de esta sede para que deba solicitarlos nuevamente"
                            >
                              <i className="bi bi-x-circle"></i> Revocar Todo
                            </button>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        <span
                          style={{
                            fontSize: "11.5px",
                            background: isMaster ? "#fef3c7" : "#e6f0ee",
                            color: isMaster ? "#92400e" : "#113B3A",
                            border: `1px solid ${isMaster ? "#fde68a" : "#b8d4ce"}`,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontWeight: "700",
                            display: "inline-block",
                          }}
                        >
                          {acc.sedeLabel}
                        </span>
                      </td>

                      {PERMISSIONS_CATALOG.map((p) => {
                        const hasThis = isMaster || userPerms.includes(p.key);

                        return (
                          <td key={p.key} style={{ textAlign: "center", padding: "12px 8px" }}>
                            {isMaster ? (
                              <span
                                title="Vladimir tiene control maestro permanente"
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  border: "1px solid #fde68a",
                                  padding: "4px 10px",
                                  borderRadius: "999px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <i className="bi bi-shield-check"></i> Total
                              </span>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                <label className="perm-switch-toggle" style={{ cursor: "pointer" }}>
                                  <input
                                    type="checkbox"
                                    checked={hasThis}
                                    onChange={(e) =>
                                      handleTogglePermission(acc.email, p.key, e.target.checked)
                                    }
                                    title={`${hasThis ? "Revocar" : "Conceder"} ${p.name} a ${acc.name}`}
                                    style={{ width: "17px", height: "17px", accentColor: "#113B3A", cursor: "pointer" }}
                                  />
                                </label>
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    color: hasThis ? "#047857" : "#94a3b8",
                                  }}
                                >
                                  {hasThis ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado exclusivo de la Pestaña "Validador de Clave Diaria" en Administración Central
  const renderClavesTab = () => {
    if (!isEffectiveMaster) {
      return renderAccessGuard(
        "permisos",
        "Validador de Clave Diaria",
        "Apartado exclusivo de Administración Central (Vladimir) para consultar y validar la clave diaria de recuperación de clientes."
      );
    }

    return (
      <div>
        {/* Banner Ejecutivo del Validador de Clave Diaria */}
        <div
          style={{
            background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
            borderRadius: "16px",
            padding: "24px 28px",
            color: "#ffffff",
            marginBottom: "26px",
            boxShadow: "0 10px 25px rgba(17, 59, 58, 0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "rgba(198, 172, 127, 0.22)",
                  color: "#e6cfa8",
                  border: "1px solid rgba(198, 172, 127, 0.45)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <i className="bi bi-key-fill"></i> ADMINISTRACIÓN CENTRAL • VALIDADOR DE CLAVE DIARIA
              </span>
              <span
                style={{
                  background: "rgba(34, 197, 94, 0.22)",
                  color: "#bbf7d0",
                  border: "1px solid rgba(134, 239, 172, 0.4)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                ● Clave Hoy ({dailyCodeInfo.displayDate}): {dailyCodeInfo.code}
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "23px",
                margin: "0 0 6px 0",
                color: "#ffffff",
                fontWeight: "600",
              }}
            >
              Validador de Clave Diaria de Recuperación de Clientes
            </h3>
            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.85)", margin: 0, lineHeight: "1.5" }}>
              Consulta, copia y valida la <strong>Clave Diaria de Recuperación</strong> para los clientes registrados que olvidaron su clave (el código se renueva automáticamente cada día a las 00:00 hrs).
            </p>
          </div>
        </div>

        {/* Sección 1: Validador de Clave Diaria para Recuperación de Contraseñas de Clientes */}
        <div
          id="admin-daily-code-validator"
          className="admin-content-card"
          style={{
            marginBottom: "26px",
            padding: "26px",
            borderRadius: "16px",
            background: "linear-gradient(180deg, #fffdf9 0%, #ffffff 100%)",
            border: "2px solid #e6cfa8",
            boxShadow: "0 8px 24px rgba(17, 59, 58, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid #f3ead8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "13px",
                  background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                  color: "#C6AC7F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(17, 59, 58, 0.2)",
                }}
              >
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "18.5px", color: "#0f172a", margin: 0, fontWeight: "800" }}>
                    Validador de Clave Diaria — Recuperación de Contraseña de Clientes
                  </h2>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #fde68a",
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="bi bi-arrow-repeat"></i> Cambia a Diario Automáticamente
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Cuando un cliente con DNI registrado olvida su contraseña, facilítale la <strong>Clave Diaria de Hoy</strong>. Al validarla en la página, podrá ingresar su nueva contraseña y repetirla para confirmar.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                padding: "7px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "800",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="bi bi-calendar-check-fill"></i> Vigente Hoy: {dailyCodeInfo.displayDate}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "22px",
              alignItems: "stretch",
            }}
          >
            {/* Columna 1: Clave Diaria Activa del Admin Principal */}
            <div
              style={{
                background: "linear-gradient(135deg, #113B3A 0%, #164947 100%)",
                borderRadius: "14px",
                padding: "22px",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 8px 20px rgba(17, 59, 58, 0.16)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#e6cfa8",
                    }}
                  >
                    🔑 CLAVE DIARIA DEL ADMIN PRINCIPAL
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "rgba(255,255,255,0.14)",
                      padding: "3px 9px",
                      borderRadius: "999px",
                      fontWeight: "700",
                    }}
                  >
                    Rotación 24h (00:00 hrs)
                  </span>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1.5px solid rgba(198, 172, 127, 0.55)",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "32px",
                      fontWeight: "900",
                      letterSpacing: "6px",
                      color: "#C6AC7F",
                      lineHeight: "1.1",
                      marginBottom: "6px",
                    }}
                  >
                    {dailyCodeInfo.code}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.82)", fontWeight: "600" }}>
                    Formato alternativo aceptado: <strong>{dailyCodeInfo.formattedCode}</strong>
                  </div>
                </div>

                <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.86)", margin: "0 0 16px", lineHeight: "1.5" }}>
                  Esta clave se genera automáticamente para la fecha <strong>{dailyCodeInfo.displayDate}</strong> y caduca al finalizar el día. Si deseas cambiarla ahora mismo, usa el botón de rotación.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleCopyDailyRecoveryCode(dailyCodeInfo.code)}
                  style={{
                    flex: "1 1 160px",
                    background: copiedDailyCode ? "#22c55e" : "#C6AC7F",
                    color: copiedDailyCode ? "#ffffff" : "#113B3A",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <i className={`bi ${copiedDailyCode ? "bi-check2-circle" : "bi-clipboard-check-fill"}`}></i>
                  {copiedDailyCode ? "¡Código Copiado!" : "Copiar Código Diario"}
                </button>

                <button
                  type="button"
                  onClick={handleRotateDailyRecoveryCode}
                  style={{
                    flex: "1 1 150px",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.28)",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    transition: "all 0.2s ease",
                  }}
                  title="Generar una nueva clave diaria inmediatamente"
                >
                  <i className="bi bi-arrow-clockwise"></i> Rotar Clave Hoy
                </button>
              </div>
            </div>

            {/* Columna 2: Validador Interactivo de Clave y DNI de Cliente */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                borderRadius: "14px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <form onSubmit={handleRunAdminCodeValidator}>
                <h3 style={{ fontSize: "15.5px", color: "#0f172a", margin: "0 0 6px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bi bi-person-check-fill" style={{ color: "#113B3A" }}></i>
                  Validador de Clave y Verificación de DNI del Cliente
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 14px", lineHeight: "1.45" }}>
                  Verifica que el DNI del cliente esté registrado en la página y comprueba la validez del código diario antes de facilitárselo.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>
                      DNI (8 dígitos) o Correo del Cliente
                    </label>
                    <input
                      type="text"
                      value={validatorDniInput}
                      onChange={(e) => {
                        setValidatorDniInput(e.target.value);
                        setValidatorResult(null);
                      }}
                      placeholder="Ej. 74829103 o correo..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "9px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13px",
                        fontWeight: "600",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>
                      Clave Diaria a Validar
                    </label>
                    <input
                      type="text"
                      value={validatorCodeInput}
                      onChange={(e) => {
                        setValidatorCodeInput(e.target.value.toUpperCase());
                        setValidatorResult(null);
                      }}
                      placeholder={`Hoy: ${dailyCodeInfo.code}`}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "9px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13.5px",
                        fontFamily: "monospace",
                        fontWeight: "800",
                        letterSpacing: "1.5px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Previsualización instantánea si el DNI coincide con un cliente */}
                {validatorDniInput.trim().length >= 3 && (
                  <div
                    style={{
                      marginBottom: "12px",
                      padding: "9px 12px",
                      borderRadius: "9px",
                      fontSize: "12px",
                      background: lookedUpValidatorClient ? "#f0fdf4" : "#fffbeb",
                      border: `1px solid ${lookedUpValidatorClient ? "#86efac" : "#fde68a"}`,
                      color: lookedUpValidatorClient ? "#166534" : "#92400e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {lookedUpValidatorClient ? (
                      <>
                        <span>
                          <strong>✓ Cliente encontrado:</strong> {lookedUpValidatorClient.name} (DNI:{" "}
                          <strong>{lookedUpValidatorClient.dni || "S/N"}</strong> • {lookedUpValidatorClient.email})
                        </span>
                        <span style={{ fontWeight: "800", fontSize: "11px", background: "#dcfce7", padding: "2px 8px", borderRadius: "999px" }}>
                          Apto para recuperar clave
                        </span>
                      </>
                    ) : (
                      <span>
                        <i className="bi bi-exclamation-circle"></i> No se encontró cliente con "{validatorDniInput.trim()}". (Prueba ej. DNI <strong>74829103</strong>)
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "11px 16px",
                      background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="bi bi-patch-check-fill" style={{ color: "#C6AC7F" }}></i>
                    Validar Clave y Cliente
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setValidatorCodeInput(dailyCodeInfo.code);
                      if (!validatorDniInput) setValidatorDniInput("74829103");
                    }}
                    style={{
                      padding: "11px 14px",
                      background: "#f8fafc",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                    title="Autocompletar con la clave de hoy"
                  >
                    Usar Clave de Hoy
                  </button>
                </div>
              </form>

              {validatorResult && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: validatorResult.valid ? "#ecfdf5" : "#fef2f2",
                    border: `1.5px solid ${validatorResult.valid ? "#6ee7b7" : "#fecaca"}`,
                    color: validatorResult.valid ? "#065f46" : "#991b1b",
                    fontSize: "12.5px",
                    lineHeight: "1.45",
                  }}
                >
                  <strong style={{ display: "block", fontSize: "13px", marginBottom: "3px" }}>
                    {validatorResult.title}
                  </strong>
                  <span>{validatorResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Historial de Recuperaciones de Contraseña realizadas con el Código del Admin */}
          {recoveryLogs.length > 0 && (
            <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#334155", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <i className="bi bi-clock-history" style={{ color: "#113B3A" }}></i>
                Últimas Recuperaciones de Contraseña Validadas ({recoveryLogs.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recoveryLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#0f172a" }}>{log.userName}</strong>{" "}
                      <span style={{ color: "#475569", fontWeight: "700" }}>(DNI: {log.dni})</span> •{" "}
                      <span style={{ color: "#64748b" }}>{log.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          border: "1px solid #86efac",
                          padding: "2px 9px",
                          borderRadius: "999px",
                          fontWeight: "800",
                          fontSize: "11px",
                        }}
                      >
                        ✓ Validación Exitosa (Código: {log.codeUsed})
                      </span>
                      <span style={{ color: "#64748b" }}>
                        {new Date(log.recoveredAt).toLocaleString("es-PE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
              <h1>
                {activeTab === "catalogo"
                  ? "Panel Administrativo - Catálogo de Joyas"
                  : activeTab === "inventario"
                  ? "Control de Inventario - Stock por Tallas (Bodega & Sedes)"
                  : activeTab === "pedidos"
                  ? "Control de Pedidos y Fabricación en Taller"
                  : activeTab === "home_images"
                  ? "Panel Administrativo - Imágenes del Inicio"
                  : activeTab === "finanzas"
                  ? "Control de Pagos & Validación de Pedidos"
                  : activeTab === "permisos"
                  ? isEffectiveMaster
                    ? "Gestión de Permisos & Sedes (Panel de Vladimir)"
                    : `Solicitud de Permisos & Accesos (${effectiveUser?.sedeLabel || "Sede"})`
                  : activeTab === "claves"
                  ? "Validador de Clave Diaria (Administración Central)"
                  : activeTab === "reclamaciones"
                  ? "Libro de Reclamaciones Virtual - Supervisión Legal (INDECOPI)"
                  : activeTab === "platino_care"
                  ? "Gestión y Tarifas de Platino Care (Garantías)"
                  : activeTab === "gemas"
                  ? "Gestión y Creación de Diamantes & Gemas Certificadas"
                  : "Panel Administrativo de Citas"}
              </h1>
              {isMaster ? (
                <span className="admin-role-badge master">
                  <i className="bi bi-patch-check-fill"></i> Vladimir (Admin Master)
                </span>
              ) : (effectiveUser?.sede === "lima-centro" || userAssignedSede === "lima-centro") ? (
                <span className="admin-role-badge sede">
                  <i className="bi bi-geo-alt-fill"></i> Admin Sede Lima Centro
                </span>
              ) : (
                <span className="admin-role-badge sede">
                  <i className="bi bi-geo-alt-fill"></i> Admin Sede Miraflores
                </span>
              )}
            </div>
            <p>
              {activeTab === "catalogo"
                ? "Gestiona el catálogo de la tienda, crea nuevas joyas y modifica o sube nuevas fotografías."
                : activeTab === "inventario"
                ? "Controla el stock físico de cada joya por tallas: Dama (05 al 27) y Varón (10 al 37) en Bodega, Sede Lima Centro y Sede Miraflores."
                : activeTab === "pedidos"
                ? "Gestiona los pedidos de clientes, actualiza en tiempo real la etapa de fabricación de las joyas (Taller, Engaste, Calidad, Envío) y agrega notas de orfebrería."
                : activeTab === "home_images"
                ? "Cambia las imágenes del inicio: banners de compromiso/boda, categorías, estilos de anillos, editoriales y mosaico."
                : activeTab === "finanzas"
                ? "Supervisa los pedidos de los clientes, valida si el pago fue realizado y confirma por qué medio de pago se efectuó la transacción (BanBif, Banco de la Nación, BCP, Interbank, IziPay, Pichincha, Fondo Platino, Efectivo)."
                : activeTab === "permisos"
                ? isEffectiveMaster
                  ? "Supervisa autorizaciones, aprueba solicitudes de administradores de sede y administra la matriz de accesos."
                  : "Revisa para qué sirve cada módulo administrativo del sistema y envía solicitudes justificadas a Administración Central."
                : activeTab === "claves"
                ? "Consulta y valida la clave diaria de recuperación de clientes (cambia automáticamente todos los días a las 00:00 hrs)."
                : activeTab === "reclamaciones"
                ? "Auditoría oficial del Libro de Reclamaciones conforme a la Ley N° 29571. Revisa quejas y reclamos y registra la respuesta legal del proveedor (plazo máximo: 15 días hábiles)."
                : activeTab === "platino_care"
                ? "Configura las coberturas del programa de garantía oficial Platino Care, precios y planes visibles en la tienda."
                : activeTab === "gemas"
                ? "Crea y administra gemas con atributos GIA/IGI, pureza, quilates, dimensiones, corte y fotografías de alta resolución."
                : "Gestiona reservas, revisa observaciones de clientes y bloquea u habilita horarios de atención."}
            </p>
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
        {activeTab === "reclamaciones" ? (
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#C6AC7F", background: "#FDF9F2", border: "1px solid rgba(198, 172, 127, 0.4)" }}>
                <i className="bi bi-book-half"></i>
              </div>
              <div>
                <h3 className="metric-val">{reclamacionesList.length}</h3>
                <p className="metric-lbl">Total Hojas Registradas</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#b91c1c", background: "#fee2e2" }}>
                <i className="bi bi-clock-history"></i>
              </div>
              <div>
                <h3 className="metric-val" style={{ color: "#b91c1c" }}>
                  {reclamacionesList.filter((r) => r.estado === "pendiente").length}
                </h3>
                <p className="metric-lbl">Pendientes de Respuesta</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#d97706", background: "#fef3c7" }}>
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <h3 className="metric-val" style={{ color: "#d97706" }}>
                  {reclamacionesList.filter((r) => r.estado === "en_proceso").length}
                </h3>
                <p className="metric-lbl">En Trámite / Proceso</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <h3 className="metric-val" style={{ color: "#166e37" }}>
                  {reclamacionesList.filter((r) => r.estado === "atendido").length}
                </h3>
                <p className="metric-lbl">Atendidos Formalmente</p>
              </div>
            </div>
          </div>
        ) : activeTab === "permisos" ? (
          isEffectiveMaster ? (
            <div className="admin-metrics-row">
              <div
                className="metric-card"
                onClick={() => setRequestsFilterStatus("todas")}
                style={{
                  cursor: "pointer",
                  border: requestsFilterStatus === "todas" ? "2px solid #113B3A" : undefined,
                  transition: "all 0.2s ease",
                }}
                title="Ver todas las solicitudes"
              >
                <div className="metric-icon-box" style={{ color: "#113B3A", background: "#e6f0ee" }}>
                  <i className="bi bi-shield-shaded"></i>
                </div>
                <div>
                  <h3 className="metric-val">3</h3>
                  <p className="metric-lbl">Cuentas Oficiales (Vladimir + 2 Sedes)</p>
                </div>
              </div>

              <div
                className="metric-card"
                onClick={() => setRequestsFilterStatus("pendientes")}
                style={{
                  cursor: "pointer",
                  border: requestsFilterStatus === "pendientes" ? "2px solid #C6AC7F" : undefined,
                  background: requestsFilterStatus === "pendientes" ? "#fffdf9" : undefined,
                  transition: "all 0.2s ease",
                }}
                title="Filtrar solicitudes pendientes"
              >
                <div className="metric-icon-box" style={{ color: "#b91c1c", background: "#fee2e2" }}>
                  <i className="bi bi-bell-fill"></i>
                </div>
                <div>
                  <h3 className="metric-val" style={{ color: "#b91c1c" }}>{pendingRequestsCount}</h3>
                  <p className="metric-lbl">Solicitudes Pendientes</p>
                </div>
              </div>

              <div
                className="metric-card"
                onClick={() => setRequestsFilterStatus("aprobadas")}
                style={{
                  cursor: "pointer",
                  border: requestsFilterStatus === "aprobadas" ? "2px solid #059669" : undefined,
                  transition: "all 0.2s ease",
                }}
                title="Filtrar solicitudes aprobadas"
              >
                <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div>
                  <h3 className="metric-val">{permissionRequests.filter((r) => r.status === "aprobado").length}</h3>
                  <p className="metric-lbl">Solicitudes Aprobadas</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ color: "#8a6d3b", background: "#f4efe6" }}>
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <h3 className="metric-val">2 Sedes</h3>
                  <p className="metric-lbl">Lima Centro y Miraflores</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-metrics-row">
              <div className="metric-card">
                <div className="metric-icon-box" style={{ color: "#113B3A", background: "#e6f0ee" }}>
                  <i className="bi bi-grid-1x2-fill"></i>
                </div>
                <div>
                  <h3 className="metric-val">{PERMISSIONS_CATALOG.length}</h3>
                  <p className="metric-lbl">Módulos Sujetos a Permiso</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ color: "#d97706", background: "#fef3c7" }}>
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <div>
                  <h3 className="metric-val" style={{ color: "#d97706" }}>
                    {permissionRequests.filter((r) => r.userEmail?.toLowerCase() === effectiveUser?.email?.toLowerCase() && r.status === "pendiente").length}
                  </h3>
                  <p className="metric-lbl">En Revisión por Vladimir</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div>
                  <h3 className="metric-val" style={{ color: "#166e37" }}>
                    {(permissionsMatrix[effectiveUser?.email?.toLowerCase() || ""] || []).length}
                  </h3>
                  <p className="metric-lbl">Aceptados por Vladimir</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box" style={{ color: "#b91c1c", background: "#fee2e2" }}>
                  <i className="bi bi-lock-fill"></i>
                </div>
                <div>
                  <h3 className="metric-val" style={{ color: "#b91c1c" }}>
                    {Math.max(0, PERMISSIONS_CATALOG.length - (permissionsMatrix[effectiveUser?.email?.toLowerCase() || ""] || []).length)}
                  </h3>
                  <p className="metric-lbl">Sin Permiso (Por Solicitar)</p>
                </div>
              </div>
            </div>
          )
        ) : activeTab === "finanzas" ? (
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-check2-circle"></i>
              </div>
              <div>
                <h3 className="metric-val" style={{ color: "#15803d" }}>{formatPrice(paymentsKpis.totalCobrado)}</h3>
                <p className="metric-lbl">Total Pagos Validados</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#b45309", background: "#fef3c7" }}>
                <i className="bi bi-clock-history"></i>
              </div>
              <div>
                <h3 className="metric-val" style={{ color: "#b45309" }}>{formatPrice(paymentsKpis.totalPendiente)}</h3>
                <p className="metric-lbl">Pendientes por Validar</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#0f2a24", background: "#e8f3ee" }}>
                <i className="bi bi-cash-stack"></i>
              </div>
              <div>
                <h3 className="metric-val">{formatPrice(paymentsKpis.totalFacturado)}</h3>
                <p className="metric-lbl">Total Ventas Registradas</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#32638e", background: "#edf4fb" }}>
                <i className="bi bi-box-seam"></i>
              </div>
              <div>
                <h3 className="metric-val">{paymentsKpis.totalOrders}</h3>
                <p className="metric-lbl">Pedidos ({paymentsKpis.countPagados} Validados / {paymentsKpis.countPendientes} Pend.)</p>
              </div>
            </div>
          </div>
        ) : activeTab === "home_images" ? (
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
        ) : activeTab === "pedidos" ? (
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#0f2a24", background: "#e8f3ee" }}>
                <i className="bi bi-box-seam"></i>
              </div>
              <div>
                <h3 className="metric-val">{effectiveSedeOrders.length}</h3>
                <p className="metric-lbl">Total de Pedidos en Sistema</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#9c6c0b", background: "#fbf6e9" }}>
                <i className="bi bi-hammer"></i>
              </div>
              <div>
                <h3 className="metric-val">
                  {effectiveSedeOrders.filter((o) => o.stage === "diseno_taller" || o.stage === "recibido").length}
                </h3>
                <p className="metric-lbl">En Fundición / Taller</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#7e22ce", background: "#f3e8ff" }}>
                <i className="bi bi-gem"></i>
              </div>
              <div>
                <h3 className="metric-val">
                  {effectiveSedeOrders.filter((o) => o.stage === "engaste_pulido").length}
                </h3>
                <p className="metric-lbl">En Engaste & Acabado</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-patch-check-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">
                  {effectiveSedeOrders.filter((o) => o.stage === "entregado" || o.stage === "listo_envio").length}
                </h3>
                <p className="metric-lbl">Listos & Entregados</p>
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
        ) : activeTab === "inventario" ? (
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#0f2a24", background: "#e8f3ee" }}>
                <i className="bi bi-boxes"></i>
              </div>
              <div>
                <h3 className="metric-val">{inventoryKpis.totalPieces}</h3>
                <p className="metric-lbl">Total Joyas en Físico</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#9c6c0b", background: "#fbf6e9" }}>
                <i className="bi bi-building"></i>
              </div>
              <div>
                <h3 className="metric-val">{inventoryKpis.bodega}</h3>
                <p className="metric-lbl">Bodega Central</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">{inventoryKpis.limaCentro}</h3>
                <p className="metric-lbl">Sede Lima Centro</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#32638e", background: "#edf4fb" }}>
                <i className="bi bi-pin-map-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">{inventoryKpis.miraflores}</h3>
                <p className="metric-lbl">Sede Miraflores</p>
              </div>
            </div>
          </div>
        ) : activeTab === "platino_care" || activeTab === "gemas" || activeTab === "home_images" || activeTab === "claves" ? null : (
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
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">{citasConfirmadas}</h3>
                <p className="metric-lbl">Citas Confirmadas</p>
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
          !userHasPermission("citas") && !isEffectiveMaster ? (
            renderAccessGuard(
              "citas",
              "Citas & Horarios",
              "Permite gestionar la agenda y turnos de atención al cliente en tu sede."
            )
          ) : (
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

              {isSedeRestricted ? (
                <div
                  style={{
                    padding: "9px 14px",
                    background: "#eef6f1",
                    border: "1.5px solid #a4d4b8",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    color: "#137748",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    whiteSpace: "nowrap",
                  }}
                  title={`Sede asignada: ${effectiveUser?.sedeLabel}`}
                >
                  <i className="bi bi-geo-alt-fill"></i> {effectiveUser?.sedeLabel || (userAssignedSede === "lima-centro" ? "Sede Lima Centro" : "Sede Miraflores")}
                </div>
              ) : (
                <select
                  value={filterSede}
                  onChange={(e) => setFilterSede(e.target.value)}
                  className="filter-select"
                >
                  <option value="todas">Todas las Sedes</option>
                  <option value="lima-centro">Sede Lima Centro</option>
                  <option value="miraflores">Sede Miraflores</option>
                </select>
              )}



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
                            <span style={{ color: "#137748", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <i className="bi bi-heart-fill"></i> Asesoría General
                            </span>
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
                  Bloquear u Habilitar Horarios de Atención ({effectiveBlockedList.length} activos)
                </h3>
                <p style={{ fontSize: "14px", color: "#4f5f56", margin: 0, lineHeight: "1.5" }}>
                  {isSedeRestricted
                    ? `Configura la disponibilidad de Asesoría General para ${effectiveUser?.sedeLabel || "tu sede"}.`
                    : "Configura la disponibilidad de Asesoría General por cada sede. Puedes bloquear horarios puntuales o días completos para controlar cuándo los clientes pueden reservar."}
                </p>
              </div>

              <div className="blocking-panel">
                {/* Lado Izquierdo: Configuración del Bloqueo */}
                <div className="blocking-config-box">
                  <h3 className="blocking-config-title">
                    Configurar Disponibilidad y Horarios
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "#66726b", marginBottom: "18px" }}>
                    Gestiona la disponibilidad de turnos de Asesoría General.
                  </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div className="form-field">
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "6px" }}>
                      Sede a Configurar:
                    </label>
                    {isSedeRestricted ? (
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "#eef6f1",
                          border: "1.5px solid #a4d4b8",
                          borderRadius: "6px",
                          fontWeight: "700",
                          color: "#137748",
                          fontSize: "13.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        title={`Sede asignada: ${effectiveUser?.sedeLabel}`}
                      >
                        <i className="bi bi-geo-alt-fill"></i> {effectiveUser?.sedeLabel || (userAssignedSede === "lima-centro" ? "Sede Lima Centro" : "Sede Miraflores")}
                      </div>
                    ) : (
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
                    )}
                  </div>

                  <div className="form-field">
                    <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "6px" }}>
                      Fecha:{" "}
                      <span style={{ fontWeight: "500", fontSize: "12px", color: "#55635b" }}>
                        (Mín. 1 día de anticipación)
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

                {/* Nota informativa de Asesoría General */}
                <div style={{ background: "#fdf4ff", border: "1px solid #f5d0fe", borderRadius: "6px", padding: "11px 14px", marginBottom: "16px", fontSize: "12.5px", color: "#701a75", lineHeight: "1.5" }}>
                  <i className="bi bi-clock-history"></i> <strong>Atención en Sede:</strong> Configuras turnos de Asesoría General para aros de compromiso y alta joyería en <strong>{sedesData.find((s) => s.id === activeBlockSedeId)?.name || effectiveUser?.sedeLabel}</strong> (reservas con mínimo 1 día de anticipación).
                </div>

                <div className="form-field" style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#1e2e26", marginBottom: "6px" }}>
                    Motivo del Bloqueo (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mantenimiento de vitrinas, Ausencia de asesor, Inventario..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="filter-select"
                    style={{ width: "100%" }}
                  />
                </div>

                {(() => {
                  const isFullDayBlocked = effectiveBlockedList.some(
                    (b) =>
                      b.sedeId === activeBlockSedeId &&
                      b.date === blockDate &&
                      b.time === "FULL_DAY"
                  );

                  return (
                    <div style={{ display: "grid", gridTemplateColumns: isFullDayBlocked ? "1fr 1fr" : "1fr", gap: "10px", marginBottom: "18px" }}>
                      <button
                        type="button"
                        onClick={handleBlockFullDay}
                        className="btn-toggle-slot block"
                        style={{ width: "100%", padding: "11px", fontSize: "13px", borderRadius: "6px" }}
                      >
                        <i className="bi bi-calendar-x"></i> Bloquear Día Completo
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

                {/* Grilla interactiva de horas para la sede y fecha seleccionada */}
                <h4 style={{ margin: "24px 0 12px 0", fontSize: "15px", fontWeight: "700", color: "#1c2822" }}>
                  Horarios del día ({blockDate}) — 💍 Asesoría General:
                </h4>
                <div className="admin-slots-grid">
                  {TIME_SLOTS.map((time) => {
                    const statusCheck = isSlotBlocked(activeBlockSedeId, blockDate, time, "asesoria");
                    const isBlocked = statusCheck.blocked;

                    // Verificar si es un bloqueo manual de la lista aplicable
                    const specificBlock = effectiveBlockedList.find(
                      (b) =>
                        b.sedeId === activeBlockSedeId &&
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
                            <span style={{ fontSize: "11.5px", color: "#b9423c", fontWeight: "500", display: "block", marginTop: "2px" }}>
                              {statusCheck.reason}
                            </span>
                          ) : (
                            <span style={{ fontSize: "11.5px", color: "#1e7048", fontWeight: "600", display: "block", marginTop: "2px" }}>
                              ✓ Asesoría Disponible
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
                            title="Bloquear horario para Asesoría General"
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
                  Historial de Bloqueos Activos ({effectiveBlockedList.length})
                </h3>
                <p style={{ fontSize: "14px", color: "#4f5f56", marginBottom: "16px", lineHeight: "1.5" }}>
                  {isSedeRestricted
                    ? `Lista de turnos y días cerrados temporalmente en ${effectiveUser?.sedeLabel || "tu sede"}.`
                    : "Lista de turnos y días cerrados temporalmente en las sedes."}
                </p>

                {effectiveBlockedList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", background: "#faf8f4", borderRadius: "8px", color: "#77857e", fontSize: "14px" }}>
                    No hay bloqueos activos registrados.
                  </div>
                ) : (
                  <div className="active-blocks-list">
                    {effectiveBlockedList.map((block) => {
                      const sede = sedesData.find((s) => s.id === block.sedeId);
                      return (
                        <div key={block.id} className="active-block-item">
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                              <span style={{ fontWeight: "700", fontSize: "14.5px", color: "#15241e" }}>
                                {sede?.name || block.sedeId}
                              </span>
                              <span className="block-service-badge asesoria">
                                💍 Asesoría General
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
                )}
              </div>
            </div>
          </div>
        </div>
        )
      )}

        {/* ========================================================
            TAB 3: GESTIÓN DE CATÁLOGO & FOTOGRAFÍAS
            ======================================================== */}
        {activeTab === "catalogo" && (
          !userHasPermission("catalogo") ? (
            renderAccessGuard(
              "catalogo",
              "Edición de Joyas & Precios",
              "Permite crear nuevas joyas en el catálogo, subir fotos y actualizar precios de venta."
            )
          ) : (
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
                  onClick={() => openCreateProductModal(catalogFilterCategory)}
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

            {/* Barra de Categorías Segmentada Estilo Luxury (Anillos, Collares, Aretes, Pulseras, Otros) */}
            <div className="category-segmented-bar">
              <div
                className={`category-seg-item ${catalogFilterCategory === "todas" ? "active" : ""}`}
                onClick={() => setCatalogFilterCategory("todas")}
                title="Mostrar todas las piezas"
              >
                <span className="category-seg-icon"><TodasIcon /></span>
                <span>Todas</span>
                <span className="category-seg-badge">{catalogList.length}</span>
              </div>
              {PRODUCT_CATEGORY_GROUPS.map(({ id, label, Icon }) => {
                const count = catalogList.filter((p) => getProductCategoryGroup(p) === id).length;
                const isAct = catalogFilterCategory === id;
                return (
                  <div
                    key={id}
                    className={`category-seg-item ${isAct ? "active" : ""}`}
                    onClick={() => setCatalogFilterCategory(id)}
                    title={`Filtrar por ${label}`}
                  >
                    <span className="category-seg-icon"><Icon /></span>
                    <span>{label}</span>
                    <span className="category-seg-badge">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Barra de Búsqueda y Subfiltros del Catálogo */}
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
                <option value="todas">Todas las Subcategorías</option>
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

                      {/* Preview de Materiales Disponibles */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "8px 0", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "#607267", fontWeight: "600" }}>
                          Materiales ({(prod.availableMetals || METALS).length}):
                        </span>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          {(prod.availableMetals || METALS).slice(0, 7).map((m) => (
                            <span
                              key={m.id || m.name}
                              title={m.name}
                              style={{
                                width: "13px",
                                height: "13px",
                                borderRadius: "50%",
                                background: m.color || "#e8eaeb",
                                border: `1px solid ${m.border || "#c2c7c8"}`,
                                display: "inline-block",
                              }}
                            />
                          ))}
                          {(prod.availableMetals || METALS).length > 7 && (
                            <span style={{ fontSize: "10px", color: "#607267", fontWeight: "600" }}>
                              +{(prod.availableMetals || METALS).length - 7}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="admin-product-footer">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(prod)}
                          className="btn-card-action-primary"
                          title="Modificar descripción, precios y fotografías por cada material"
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span>Modificar Joya & Fotos</span>
                        </button>

                        <div className="admin-card-secondary-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInventoryProductId(prod.id);
                              setActiveTab("inventario");
                            }}
                            className="btn-card-action-stock"
                            title="Gestionar stock de Bodega y Sedes por Tallas"
                          >
                            <i className="bi bi-boxes"></i>
                            <span>Stock por Tallas</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="btn-card-action-delete"
                            title="Eliminar producto del catálogo"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )
        )}

        {/* ========================================================
            TAB: CONTROL DE INVENTARIO Y STOCK POR TALLAS
            (Bodega, Sede Lima Centro, Sede Miraflores)
            ======================================================== */}
        {activeTab === "inventario" && (
          !userHasPermission("inventario") && !isEffectiveMaster ? (
            renderAccessGuard(
              "inventario",
              "Inventario & Stock",
              "Permite administrar el inventario y stock de piezas y tallas en tu sede."
            )
          ) : (
          <div className="admin-content-card">
            {/* Cabecera del Panel de Inventario */}
            <div className="admin-catalog-header" style={{ marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", margin: "0 0 6px 0", color: "#15241e" }}>
                  Control de Stock por Tallas & Almacenes ({catalogList.length} Joyas)
                </h3>
                <p style={{ fontSize: "14px", color: "#5d6d65", margin: 0 }}>
                  Gestiona las existencias físicas en <strong>Bodega Central</strong> y en las sedes de <strong>Lima Centro</strong> y <strong>Miraflores</strong> para Tallas de Dama (05 al 27) y Varón (10 al 37).
                </p>
              </div>

              <div className="inventory-header-actions">
                <button
                  type="button"
                  onClick={() => handleExportStockExcel("current")}
                  className="btn-inv-excel"
                  title="Descargar tabla de tallas y stock de esta joya en Excel (.xls)"
                >
                  <i className="bi bi-file-earmark-excel-fill"></i>
                  Descargar Excel (Esta Joya)
                </button>

                <button
                  type="button"
                  onClick={() => handleExportStockExcel("all")}
                  className="btn-inv-all"
                  title="Descargar el inventario completo de todas las joyas de la tienda en Excel (.xls)"
                >
                  <i className="bi bi-file-earmark-spreadsheet-fill"></i>
                  Descargar Todo el Inventario
                </button>

                <button
                  type="button"
                  onClick={() => openCreateProductModal(inventoryCategoryFilter)}
                  className="btn-catalog-create btn-inv-create"
                >
                  <i className="bi bi-plus-circle-fill"></i> Crear Nueva Joya
                </button>

                <button
                  type="button"
                  onClick={handleSaveInventoryNotice}
                  className="btn-inventory-save-main btn-inv-sync"
                >
                  <i className="bi bi-check2-circle"></i> Sincronizar Inventario
                </button>
              </div>
            </div>

            {/* Cuadrícula Superior de KPIs Globales */}
            <div className="inventory-kpi-grid">
              <div className="inventory-kpi-card">
                <div className="inventory-kpi-icon bodega">
                  <i className="bi bi-building-fill"></i>
                </div>
                <div className="inventory-kpi-info">
                  <h4>Bodega Central</h4>
                  <div className="inventory-kpi-num">{inventoryKpis.bodega}</div>
                  <p className="inventory-kpi-sub">Almacén principal</p>
                </div>
              </div>

              <div className="inventory-kpi-card">
                <div className="inventory-kpi-icon lima">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className="inventory-kpi-info">
                  <h4>Sede Lima Centro</h4>
                  <div className="inventory-kpi-num">{inventoryKpis.limaCentro}</div>
                  <p className="inventory-kpi-sub">Jr. de la Unión 446</p>
                </div>
              </div>

              <div className="inventory-kpi-card">
                <div className="inventory-kpi-icon miraflores">
                  <i className="bi bi-gem"></i>
                </div>
                <div className="inventory-kpi-info">
                  <h4>Sede Miraflores</h4>
                  <div className="inventory-kpi-num">{inventoryKpis.miraflores}</div>
                  <p className="inventory-kpi-sub">Av. Larco 345</p>
                </div>
              </div>

              <div className="inventory-kpi-card">
                <div className="inventory-kpi-icon total">
                  <i className="bi bi-boxes"></i>
                </div>
                <div className="inventory-kpi-info">
                  <h4>Stock Total Global</h4>
                  <div className="inventory-kpi-num">{inventoryKpis.totalPieces}</div>
                  <p className="inventory-kpi-sub">Total piezas registradas</p>
                </div>
              </div>
            </div>

            {/* Mensaje de feedback tras guardar o surtir */}
            {inventorySavedFeedback && (
              <div
                style={{
                  background: "#e6f6ee",
                  color: "#0f6c3e",
                  border: "1px solid #b7e4ce",
                  padding: "12px 18px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <i className="bi bi-check-circle-fill" style={{ fontSize: "16px" }}></i>
                {inventorySavedFeedback}
              </div>
            )}

            {/* Filtro por Categorías para Inventario */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#223b2f" }}>
                  <i className="bi bi-filter"></i> Filtrar Joyas por Categoría:
                </span>
                <span style={{ fontSize: "12px", color: "#137748", fontWeight: "600" }}>
                  Mostrando: {inventoryCategoryFilter === "todas" ? "Todas las Joyas" : PRODUCT_CATEGORY_GROUPS.find((c) => c.id === inventoryCategoryFilter)?.label} ({inventoryCategoryProducts.length} disponibles)
                </span>
              </div>
              <div className="category-segmented-bar">
                <div
                  className={`category-seg-item ${inventoryCategoryFilter === "todas" ? "active" : ""}`}
                  onClick={() => handleSelectInventoryCategory("todas")}
                  title="Mostrar todas las piezas"
                >
                  <span className="category-seg-icon"><TodasIcon /></span>
                  <span>Todas</span>
                  <span className="category-seg-badge">{catalogList.length}</span>
                </div>
                {PRODUCT_CATEGORY_GROUPS.map(({ id, label, Icon }) => {
                  const count = catalogList.filter((p) => getProductCategoryGroup(p) === id).length;
                  const isAct = inventoryCategoryFilter === id;
                  return (
                    <div
                      key={id}
                      className={`category-seg-item ${isAct ? "active" : ""}`}
                      onClick={() => handleSelectInventoryCategory(id)}
                      title={`Filtrar por ${label}`}
                    >
                      <span className="category-seg-icon"><Icon /></span>
                      <span>{label}</span>
                      <span className="category-seg-badge">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selector de Joya Activa */}
            <div className="inventory-product-card-selector">
              <div className="inventory-active-prod-info">
                <img
                  src={currentInventoryProduct?.image || "/images/cat-compromiso.jpg"}
                  alt={currentInventoryProduct?.name}
                  className="inventory-active-prod-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/cat-compromiso.jpg";
                  }}
                />
                <div className="inventory-prod-meta">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0 }}>{currentInventoryProduct?.name || "Selecciona una Joya"}</h3>
                    {currentInventoryProduct?.id && (
                      <Link
                        to={`/producto/${currentInventoryProduct.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-batch-action"
                        style={{
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "3px 10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#137748",
                          background: "#eef6f1",
                          border: "1px solid #b7d6c5",
                        }}
                        title="Ver cómo se muestra el stock en la tienda pública"
                      >
                        <i className="bi bi-box-arrow-up-right"></i> Ver en Tienda
                      </Link>
                    )}
                  </div>
                  <p style={{ marginTop: "4px", marginBottom: 0 }}>
                    {currentInventoryProduct?.priceFormatted || (currentInventoryProduct?.price ? formatPrice(currentInventoryProduct.price) : "S/. 0")} •{" "}
                    {currentInventoryProduct?.categories?.[0] || currentInventoryProduct?.type || "Joya"}
                    {currentInventoryProduct?.hasDoubleSizes ? " (Modelo con Doble Talla Dama y Varón)" : " (Anillo individual)"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleCopyStockToAllRings}
                  disabled={!canEditBodega}
                  className="btn-batch-action"
                  style={{
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: canEditBodega ? "#fdf8ee" : "#f1f3f2",
                    border: canEditBodega ? "1px solid #e8d7b3" : "1px solid #d0d7d3",
                    color: canEditBodega ? "#8a661c" : "#8a9690",
                    cursor: canEditBodega ? "pointer" : "not-allowed",
                    opacity: canEditBodega ? 1 : 0.6,
                  }}
                  title={canEditBodega ? "Aplica la configuración de existencias de esta joya a todos los anillos y aros de la tienda" : "Requiere autorización de Vladimir para modificar masivamente el catálogo"}
                >
                  <i className="bi bi-intersect"></i> Copiar a todos los anillos {!canEditBodega && "🔒"}
                </button>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#37473f" }}>
                    Cambiar Joya:
                  </label>
                  <select
                    value={selectedInventoryProductId}
                    onChange={(e) => setSelectedInventoryProductId(e.target.value)}
                    className="filter-select"
                    style={{ minWidth: "260px" }}
                  >
                    {inventoryCategoryProducts.length === 0 ? (
                      <option value="">No hay joyas en esta categoría</option>
                    ) : (
                      inventoryCategoryProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.priceFormatted || formatPrice(p.price)})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Notificación rápida si el usuario estaba viendo otra joya en la tienda */}
              {(() => {
                const lastViewedId = typeof window !== "undefined" ? localStorage.getItem("platino_last_viewed_product_id") : null;
                const lastProd = lastViewedId && lastViewedId !== currentInventoryProduct?.id ? catalogList.find((p) => p.id === lastViewedId) : null;
                if (!lastProd) return null;
                return (
                  <div style={{ width: "100%", marginTop: "8px", background: "#f0f7f3", border: "1px dashed #7eb499", padding: "8px 14px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#1e4d35" }}>
                      <i className="bi bi-clock-history"></i> Joya vista recientemente en la tienda: <strong>{lastProd.name}</strong>
                    </span>
                    <button
                      type="button"
                      className="btn-batch-action"
                      style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "600", background: "#ffffff", border: "1px solid #7eb499", color: "#137748" }}
                      onClick={() => setSelectedInventoryProductId(lastProd.id)}
                    >
                      Editar {lastProd.name}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Pestañas de Género: Dama (05-27) vs Varón (10-37) */}
            <div className="inventory-gender-tabs">
              <button
                type="button"
                className={`inventory-gender-tab-btn ${inventoryGenderTab === "dama" ? "active" : ""}`}
                onClick={() => setInventoryGenderTab("dama")}
              >
                <i className="bi bi-gender-female"></i> Tallas de Dama (05 hasta el 27) — {DAMA_SIZES.length} tallas
              </button>

              <button
                type="button"
                className={`inventory-gender-tab-btn ${inventoryGenderTab === "varon" ? "active" : ""}`}
                onClick={() => setInventoryGenderTab("varon")}
              >
                <i className="bi bi-gender-male"></i> Tallas de Varón (10 hasta el 37) — {VARON_SIZES.length} tallas
              </button>

              {/* Buscador de talla específico y botón Descargar Excel */}
              <div className="inventory-gender-toolbar">
                <button
                  type="button"
                  onClick={() => handleExportStockExcel("current")}
                  className="btn-inv-excel-table"
                  title={userHasPermission("descargar_excel") ? "Descargar las tallas de esta joya en Excel (.xls)" : "Requiere autorización de Vladimir para exportar"}
                  style={{ opacity: userHasPermission("descargar_excel") ? 1 : 0.7 }}
                >
                  <i className="bi bi-file-earmark-excel-fill"></i> Descargar Excel Tallas
                  {!userHasPermission("descargar_excel") && (
                    <span style={{ fontSize: "11px", marginLeft: "4px" }}>🔒</span>
                  )}
                </button>

                <input
                  type="text"
                  placeholder="Buscar talla (ej. 05, 14)..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="filter-select inventory-search-size"
                />
              </div>
            </div>

            {/* Aviso de Inventario Local para administradores de sede */}
            {!userHasPermission("inventario_global") && (
              <div style={{ background: "#f0f7f3", border: "1.5px dashed #7eb499", padding: "10px 16px", borderRadius: "8px", margin: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "13px", color: "#137748" }}>
                  <i className="bi bi-geo-alt-fill"></i> <strong>Modo Sede Local ({effectiveUser?.sedeLabel})</strong>: Solo puedes editar las existencias físicas de tu sede. Bodega Central y otras sedes están protegidas.
                </div>
                <button
                  type="button"
                  onClick={() => handleSendPermissionRequest("inventario_global")}
                  style={{ background: "#ffffff", border: "1px solid #7eb499", color: "#137748", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <i className="bi bi-shield-plus"></i> Solicitar Inventario Global a Vladimir
                </button>
              </div>
            )}

            {/* Hint de desplazamiento para celulares */}
            <div className="inventory-mobile-scroll-hint">
              <i className="bi bi-arrows-expand"></i> Desliza la tabla hacia los lados para ver Bodega, Lima Centro y Miraflores
            </div>

            {/* Tabla de Stock por Tallas */}
            <div className="inventory-table-wrap">
              <table className="inventory-stock-table">
                <thead>
                  <tr>
                    <th className="inventory-col-talla" style={{ width: "160px" }}>Talla Oficial</th>
                    <th style={{ width: "130px" }}>Diámetro Int.</th>
                    <th style={{ width: "160px" }}>
                      <span style={{ color: "#3b5bdb" }}>
                        <i className="bi bi-building-fill"></i> Bodega {!canEditBodega && "🔒"}
                      </span>
                    </th>
                    <th style={{ width: "170px" }}>
                      <span style={{ color: "#137748" }}>
                        <i className="bi bi-geo-alt-fill"></i> Sede Lima Centro {!canEditLima && "🔒"}
                      </span>
                    </th>
                    <th style={{ width: "170px" }}>
                      <span style={{ color: "#7950f2" }}>
                        <i className="bi bi-gem"></i> Sede Miraflores {!canEditMiraflores && "🔒"}
                      </span>
                    </th>
                    <th style={{ width: "120px" }}>Total</th>
                    <th style={{ width: "150px" }}>Disponibilidad</th>
                    <th style={{ width: "170px" }}>Acción Rápida</th>
                  </tr>
                </thead>
                <tbody>
                  {(inventoryGenderTab === "dama" ? DAMA_SIZES : VARON_SIZES)
                    .filter((sz) => !inventorySearch || sz.label.toLowerCase().includes(inventorySearch.toLowerCase()) || sz.number.includes(inventorySearch))
                    .map((sz) => {
                      const item = currentProductStock?.[inventoryGenderTab]?.[sz.number] || { bodega: 0, "lima-centro": 0, miraflores: 0 };
                      const b = item.bodega || 0;
                      const lc = item["lima-centro"] || 0;
                      const m = item.miraflores || 0;
                      const tot = b + lc + m;

                      let statusBadge = "out";
                      let statusText = "Agotado (0)";
                      if (tot > 3) {
                        statusBadge = "available";
                        statusText = `Disponible (${tot})`;
                      } else if (tot > 0) {
                        statusBadge = "low";
                        statusText = `Últimas (${tot})`;
                      }

                      return (
                        <tr key={sz.number}>
                          <td className="inventory-col-talla">
                            <span className="talla-badge-pill">{sz.label}</span>
                          </td>
                          <td style={{ color: "#5d6d65", fontSize: "12px" }}>
                            {sz.diameter}
                          </td>
                          {/* Almacén 1: Bodega */}
                          <td>
                            <div className="inventory-input-group">
                              <button
                                type="button"
                                className="inventory-step-btn"
                                disabled={!canEditBodega}
                                onClick={() => handleStockStepChange(inventoryGenderTab, sz.number, "bodega", -1)}
                                title={canEditBodega ? "Reducir 1 en Bodega" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditBodega ? 1 : 0.4 }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                className="inventory-num-input"
                                value={b}
                                disabled={!canEditBodega}
                                title={canEditBodega ? "Editar stock de Bodega" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditBodega ? 1 : 0.6, cursor: canEditBodega ? "text" : "not-allowed" }}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleStockCellChange(inventoryGenderTab, sz.number, "bodega", e.target.value)}
                              />
                              <button
                                type="button"
                                className="inventory-step-btn"
                                disabled={!canEditBodega}
                                onClick={() => handleStockStepChange(inventoryGenderTab, sz.number, "bodega", 1)}
                                title={canEditBodega ? "Añadir 1 en Bodega" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditBodega ? 1 : 0.4 }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          {/* Almacén 2: Sede Lima Centro */}
                          <td>
                            <div className="inventory-input-group">
                              <button
                                type="button"
                                className="inventory-step-btn"
                                disabled={!canEditLima}
                                onClick={() => handleStockStepChange(inventoryGenderTab, sz.number, "lima-centro", -1)}
                                title={canEditLima ? "Reducir 1 en Sede Lima Centro" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditLima ? 1 : 0.4 }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                className="inventory-num-input"
                                value={lc}
                                disabled={!canEditLima}
                                title={canEditLima ? "Editar stock Lima Centro" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditLima ? 1 : 0.6, cursor: canEditLima ? "text" : "not-allowed" }}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleStockCellChange(inventoryGenderTab, sz.number, "lima-centro", e.target.value)}
                              />
                              <button
                                type="button"
                                className="inventory-step-btn"
                                disabled={!canEditLima}
                                onClick={() => handleStockStepChange(inventoryGenderTab, sz.number, "lima-centro", 1)}
                                title={canEditLima ? "Añadir 1 en Sede Lima Centro" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditLima ? 1 : 0.4 }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          {/* Almacén 3: Sede Miraflores */}
                          <td>
                            <div className="inventory-input-group">
                              <button
                                type="button"
                                className="inventory-step-btn"
                                disabled={!canEditMiraflores}
                                onClick={() => handleStockStepChange(inventoryGenderTab, sz.number, "miraflores", -1)}
                                title={canEditMiraflores ? "Reducir 1 en Sede Miraflores" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditMiraflores ? 1 : 0.4 }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                className="inventory-num-input"
                                value={m}
                                disabled={!canEditMiraflores}
                                title={canEditMiraflores ? "Editar stock Miraflores" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditMiraflores ? 1 : 0.6, cursor: canEditMiraflores ? "text" : "not-allowed" }}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => handleStockCellChange(inventoryGenderTab, sz.number, "miraflores", e.target.value)}
                              />
                              <button
                                type="button"
                                className="inventory-step-btn"
                                disabled={!canEditMiraflores}
                                onClick={() => handleStockStepChange(inventoryGenderTab, sz.number, "miraflores", 1)}
                                title={canEditMiraflores ? "Añadir 1 en Sede Miraflores" : "Requiere autorización de Vladimir"}
                                style={{ opacity: canEditMiraflores ? 1 : 0.4 }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          {/* Total */}
                          <td>
                            <strong style={{ fontSize: "14px", color: tot > 0 ? "#137748" : "#c53030" }}>
                              {tot}
                            </strong>
                          </td>
                          {/* Badge */}
                          <td>
                            <span className={`inv-status-badge ${statusBadge}`}>
                              <i className={tot > 0 ? "bi bi-check-circle-fill" : "bi bi-x-circle-fill"}></i>{" "}
                              {statusText}
                            </span>
                          </td>
                          {/* Acciones Rápidas */}
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="btn-batch-action"
                                disabled={!canEditBodega}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  opacity: canEditBodega ? 1 : 0.4,
                                  cursor: canEditBodega ? "pointer" : "not-allowed",
                                }}
                                onClick={() => handleStockStepChange(inventoryGenderTab, sz.number, "bodega", 1)}
                                title={canEditBodega ? "Añadir +1 pieza a Bodega" : "Requiere autorización de Vladimir"}
                              >
                                +1 Bod {!canEditBodega && "🔒"}
                              </button>
                              {canEditBodega ? (
                                <button
                                  type="button"
                                  className="btn-batch-action"
                                  style={{ padding: "4px 8px", fontSize: "11px" }}
                                  onClick={() => {
                                    handleStockStepMultiple(inventoryGenderTab, sz.number, { "lima-centro": 1, miraflores: 1 });
                                  }}
                                  title="Añadir +1 pieza a cada sede"
                                >
                                  +1 Sedes
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-batch-action"
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    background: "#eef6f1",
                                    borderColor: "#a4d4b8",
                                    color: "#137748",
                                    fontWeight: "600",
                                  }}
                                  onClick={() => {
                                    const mySede = effectiveUser?.sede;
                                    if (mySede) {
                                      handleStockStepChange(inventoryGenderTab, sz.number, mySede, 1);
                                    }
                                  }}
                                  title={`Añadir +1 pieza a ${effectiveUser?.sedeLabel || "mi sede"}`}
                                >
                                  +1 Mi Sede
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Barra de Acciones Masivas / Lote */}
            <div className="inventory-batch-bar">
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#4f5f57" }}>
                  <i className="bi bi-magic"></i> Abastecimiento Rápido:
                </span>
                {canEditBodega ? (
                  <>
                    <button
                      type="button"
                      className="btn-batch-action"
                      onClick={() => handleBatchSupplyLocation(inventoryGenderTab, "bodega", 2)}
                    >
                      <i className="bi bi-building-add"></i> +2 Bodega (Todas las tallas)
                    </button>

                    <button
                      type="button"
                      className="btn-batch-action"
                      onClick={() => {
                        handleBatchSupplyLocation(inventoryGenderTab, "lima-centro", 1);
                        handleBatchSupplyLocation(inventoryGenderTab, "miraflores", 1);
                      }}
                    >
                      <i className="bi bi-geo-alt"></i> +1 a Cada Sede (Todas las tallas)
                    </button>

                    <button
                      type="button"
                      className="btn-batch-action"
                      onClick={handleResetCurrentInventory}
                      style={{ color: "#8a5024" }}
                    >
                      <i className="bi bi-arrow-counterclockwise"></i> Restablecer Stock Base
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-batch-action"
                    style={{
                      background: "#eef6f1",
                      borderColor: "#a4d4b8",
                      color: "#137748",
                      fontWeight: "600",
                    }}
                    onClick={() => {
                      const mySede = effectiveUser?.sede;
                      if (mySede) {
                        handleBatchSupplyLocation(inventoryGenderTab, mySede, 1);
                      }
                    }}
                  >
                    <i className="bi bi-geo-alt-fill"></i> +1 a Todas las Tallas ({effectiveUser?.sedeLabel || "Mi Sede"})
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveInventoryNotice}
                className="btn-inventory-save-main"
              >
                <i className="bi bi-check2-all"></i> Guardar Cambios de Inventario
              </button>
            </div>
          </div>
          )
        )}

        {/* ========================================================
            TAB 3: GESTIÓN DE IMÁGENES DEL INICIO (PORTADA)
            ======================================================== */}
        {activeTab === "home_images" && (
          !userHasPermission("home_images") ? (
            renderAccessGuard(
              "home_images",
              "Banners & Portada de Inicio",
              "Permite editar imágenes de inicio, colecciones, anillos de compromiso y anuncios."
            )
          ) : (
          <div className="admin-content-card" style={{ padding: "28px" }}>
            {/* Banner Ejecutivo de Gestión Editorial & Portada */}
            <div
              style={{
                background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                borderRadius: "16px",
                padding: "24px 28px",
                color: "#ffffff",
                marginBottom: "24px",
                boxShadow: "0 10px 25px rgba(17, 59, 58, 0.14)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "18px",
              }}
            >
              <div style={{ maxWidth: "680px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "rgba(198, 172, 127, 0.22)",
                      color: "#e6cfa8",
                      border: "1px solid rgba(198, 172, 127, 0.45)",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    <i className="bi bi-images"></i> GESTIÓN EDITORIAL & PORTADA WEB
                  </span>
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      color: "#d1fae5",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {filteredHomeItems.length} bloques visuales en vista
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "24px",
                    margin: "0 0 6px 0",
                    color: "#ffffff",
                    fontWeight: "600",
                  }}
                >
                  Imágenes y Textos de la Portada Principal
                </h3>
                <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.85)", margin: 0, lineHeight: "1.5" }}>
                  Personaliza la franja promocional superior, banners hero, colecciones destacadas, estilos de anillos y fotografías de showroom en tiempo real.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={handleResetHomeImages}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#fecaca",
                    border: "1px solid rgba(254, 202, 202, 0.35)",
                    borderRadius: "10px",
                    padding: "11px 18px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  title="Restablecer todas las fotos del inicio a las originales de fábrica"
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Restaurar Imágenes Originales
                </button>
              </div>
            </div>

            {/* Tarjeta Ejecutiva de la Línea Verde Superior (Barra de Promociones) */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "28px",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                      color: "#C6AC7F",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(17, 59, 58, 0.18)",
                    }}
                  >
                    <i className="bi bi-megaphone-fill"></i>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "16.5px",
                          fontWeight: "700",
                          color: "#0f172a",
                        }}
                      >
                        Franja Promocional Superior (Top Bar)
                      </h4>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background: announcementActive ? "#ecfdf5" : "#fef2f2",
                          color: announcementActive ? "#047857" : "#b91c1c",
                          border: `1px solid ${announcementActive ? "#a7f3d0" : "#fecaca"}`,
                        }}
                      >
                        {announcementActive ? "● Visible en toda la web" : "○ Oculto en la tienda"}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b", maxWidth: "680px" }}>
                      Configura el mensaje destacado que aparece en la parte más alta de todas las páginas (promociones de temporada, envíos o beneficios Platino).
                    </p>
                  </div>
                </div>

                {/* Selector segmentado Activo / Inactivo */}
                <div
                  style={{
                    display: "inline-flex",
                    background: "#f1f5f9",
                    borderRadius: "12px",
                    padding: "4px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!announcementActive) handleToggleAnnouncementActive();
                    }}
                    style={{
                      border: "none",
                      borderRadius: "9px",
                      padding: "7px 16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: announcementActive ? "#113B3A" : "transparent",
                      color: announcementActive ? "#ffffff" : "#64748b",
                      boxShadow: announcementActive ? "0 2px 6px rgba(17, 59, 58, 0.22)" : "none",
                      transition: "all 0.2s ease",
                    }}
                    title="Mostrar barra promocional en la tienda"
                  >
                    <i className="bi bi-eye-fill" style={{ color: announcementActive ? "#6ee7b7" : "#94a3b8" }}></i>
                    Visible
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (announcementActive) handleToggleAnnouncementActive();
                    }}
                    style={{
                      border: "none",
                      borderRadius: "9px",
                      padding: "7px 16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: !announcementActive ? "#991b1b" : "transparent",
                      color: !announcementActive ? "#ffffff" : "#64748b",
                      boxShadow: !announcementActive ? "0 2px 6px rgba(153, 27, 27, 0.25)" : "none",
                      transition: "all 0.2s ease",
                    }}
                    title="Ocultar barra promocional en toda la tienda"
                  >
                    <i className="bi bi-eye-slash-fill" style={{ color: !announcementActive ? "#ffffff" : "#94a3b8" }}></i>
                    Oculto
                  </button>
                </div>
              </div>

              {/* Simulador de Vista Previa Real */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="bi bi-display" style={{ color: "#113B3A" }}></i> Simulación en Tiempo Real:
                  </span>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    {(announcementInput || "").length}/160 caracteres
                  </span>
                </div>

                <div
                  style={{
                    background: announcementActive
                      ? "linear-gradient(90deg, #0b2820 0%, #113B3A 50%, #0b2820 100%)"
                      : "#f8fafc",
                    color: announcementActive ? "#ffffff" : "#94a3b8",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontSize: "12.5px",
                    fontWeight: "500",
                    letterSpacing: "0.5px",
                    boxShadow: announcementActive ? "0 4px 12px rgba(11, 40, 32, 0.16)" : "none",
                    border: announcementActive ? "1px solid #1a5654" : "1.5px dashed #cbd5e1",
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
                        fontSize: "10.5px",
                        fontWeight: "800",
                        color: "#b91c1c",
                        background: "#fee2e2",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        border: "1px solid #fecaca",
                      }}
                    >
                      OCULTO
                    </span>
                  )}
                  <span style={{ textDecoration: announcementActive ? "none" : "line-through", opacity: announcementActive ? 1 : 0.7 }}>
                    {announcementInput || DEFAULT_ANNOUNCEMENT}
                  </span>
                </div>
              </div>

              {/* Plantillas Rápidas de Anuncio */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b" }}>
                  <i className="bi bi-lightning-charge-fill" style={{ color: "#C6AC7F" }}></i> Textos sugeridos:
                </span>
                {[
                  "Termina pronto: Recibe unos pendientes de diamantes cultivados en laboratorio con compras superiores a $1,000.",
                  "Envío asegurado de cortesía a todo el Perú y Garantía Platino Care incluida en cada joya.",
                  "Agenda tu cita privada en nuestros Showrooms de Miraflores o San Isidro · Atención personalizada.",
                ].map((presetText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAnnouncementInput(presetText)}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "999px",
                      padding: "4px 12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#334155",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Opción {idx + 1}
                  </button>
                ))}
              </div>

              {/* Formulario de guardado del anuncio */}
              <form
                onSubmit={handleSaveAnnouncement}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 360px", position: "relative" }}>
                  <input
                    type="text"
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    placeholder="Escribe el mensaje para la barra superior de la tienda..."
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      color: "#0f172a",
                      background: "#ffffff",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    maxLength={160}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 22px",
                    background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(17, 59, 58, 0.2)",
                  }}
                >
                  <i className="bi bi-check2-circle" style={{ color: "#C6AC7F", fontSize: "15px" }}></i>
                  Publicar Texto
                </button>

                <button
                  type="button"
                  onClick={handleResetAnnouncement}
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    color: "#475569",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  title="Restablecer al mensaje predeterminado"
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Restaurar
                </button>
              </form>
            </div>

            {/* Navegador Visual por Secciones del Inicio */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "18px 20px",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="bi bi-grid-1x2-fill" style={{ color: "#113B3A", fontSize: "16px" }}></i>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                    Filtrar por Sección de la Portada
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#113B3A",
                    background: "#e6f0ee",
                    padding: "4px 12px",
                    borderRadius: "999px",
                  }}
                >
                  Mostrando <strong>{filteredHomeItems.length}</strong> elementos configurables
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
                        padding: "10px 16px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        border: isActive ? "1.5px solid #113B3A" : "1px solid #dbe2ea",
                        background: isActive
                          ? "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)"
                          : "#ffffff",
                        color: isActive ? "#ffffff" : "#334155",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                        boxShadow: isActive ? "0 4px 12px rgba(17, 59, 58, 0.2)" : "0 1px 2px rgba(0,0,0,0.03)",
                      }}
                    >
                      <i className={`bi ${sec.icon}`} style={{ color: isActive ? "#C6AC7F" : "#64748b", fontSize: "14px" }}></i>
                      {sec.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EDITOR ESPECÍFICO: Anillos dignos de obsesión (Título principal + Subtítulo) */}
            {homeSectionFilter === "Anillos dignos de obsesión" && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "22px 24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "#f4efe6",
                        color: "#8a6d3b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      💍
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                        Encabezado de la Sección: Estilos de Anillos
                      </h4>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                        Personaliza el título principal y subtítulo que aparecen encima de las 6 siluetas de anillos.
                      </p>
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
                      background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 18px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      boxShadow: "0 4px 10px rgba(17, 59, 58, 0.18)",
                    }}
                  >
                    <i className="bi bi-check2-circle" style={{ color: "#C6AC7F" }}></i> Guardar Encabezado
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Título Principal de la Sección
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px", borderRadius: "8px" }}
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
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Subtítulo Descriptivo
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px", borderRadius: "8px" }}
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
              </div>
            )}

            {/* VISTA ESPECÍFICA: The Fall Edit & The New Classics (2 Cuadros: 1 de Textos + 1 de las 7 Fotos) */}
            {homeSectionFilter === "The Fall Edit & The New Classics" && (
              <div style={{ marginBottom: "26px" }}>
                {/* CUADRO 1: SOLO TEXTOS DE LA SECCIÓN */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "24px",
                    marginBottom: "24px",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: "#e6f0ee",
                          color: "#113B3A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        <i className="bi bi-journal-richtext"></i>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "16.5px", color: "#0f172a", fontWeight: "700" }}>
                          Textos Editoriales de la Sección
                        </h4>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                          Configura los títulos y llamados a la acción del bloque izquierdo (The Fall Edit) y derecho (The New Classics).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveFallEditTexts}
                      style={{
                        background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "11px 22px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(17, 59, 58, 0.2)",
                      }}
                    >
                      <i className="bi bi-check2-circle" style={{ color: "#C6AC7F", fontSize: "15px" }}></i>
                      Guardar Textos Editoriales
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                    {/* Columna Izquierda: The Fall Edit */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px" }}>
                      <h5 style={{ margin: "0 0 14px 0", fontSize: "13.5px", color: "#113B3A", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="bi bi-layout-sidebar"></i> Bloque Izquierdo (The Fall Edit)
                      </h5>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                          Título Principal:
                        </label>
                        <input
                          type="text"
                          className="filter-select"
                          style={{ width: "100%", height: "40px", borderRadius: "8px" }}
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
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                          Subtítulo / Párrafo:
                        </label>
                        <textarea
                          className="filter-select"
                          style={{ width: "100%", height: "72px", padding: "8px 12px", resize: "vertical", borderRadius: "8px" }}
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
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                          Texto del Botón:
                        </label>
                        <input
                          type="text"
                          className="filter-select"
                          style={{ width: "100%", height: "40px", borderRadius: "8px" }}
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
                    <div style={{ background: "#fdfbf7", border: "1px solid #e7dfd1", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <h5 style={{ margin: "0 0 14px 0", fontSize: "13.5px", color: "#113B3A", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                          <i className="bi bi-grid-3x2-gap-fill" style={{ color: "#C6AC7F" }}></i> Bloque Derecho (Collage The New Classics)
                        </h5>

                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                            Título Central en Cursiva sobre el Collage:
                          </label>
                          <input
                            type="text"
                            className="filter-select"
                            style={{ width: "100%", height: "40px", borderRadius: "8px" }}
                            value={homeImagesData.editorialClassics?.title || "The New Classics"}
                            onChange={(e) => {
                              setHomeImagesData({
                                ...homeImagesData,
                                editorialClassics: { ...homeImagesData.editorialClassics, title: e.target.value },
                              });
                            }}
                            placeholder="Ej. The New Classics"
                          />
                          <small style={{ fontSize: "11.5px", color: "#64748b", marginTop: "6px", display: "block" }}>
                            Este texto se superpone en tipografía script blanca sobre el mosaico de 6 fotografías.
                          </small>
                        </div>
                      </div>

                      <div style={{ marginTop: "20px", padding: "12px 14px", background: "#f4efe6", borderRadius: "8px", fontSize: "12px", color: "#5c4b2b", border: "1px solid #e6dac6" }}>
                        <i className="bi bi-stars"></i> Los cambios se actualizan instantáneamente en la portada al guardar.
                      </div>
                    </div>
                  </div>
                </div>

                {/* CUADRO 2: CUADRO DE LAS 7 FOTOGRAFÍAS */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "24px",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: "#113B3A",
                          color: "#C6AC7F",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        <i className="bi bi-camera-fill"></i>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "16.5px", color: "#0f172a", fontWeight: "700" }}>
                          Mosaico Fotográfico Editorial (7 Fotografías)
                        </h4>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                          Actualiza la fotografía principal izquierda o cualquiera de las 6 piezas del collage derecho.
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: "11.5px", background: "#e6f0ee", color: "#113B3A", padding: "5px 12px", borderRadius: "999px", fontWeight: "700" }}>
                      1 Foto Editorial + 6 Fotos de Collage
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", alignItems: "stretch" }}>
                    {/* Foto 1: Editorial Izquierda */}
                    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", background: "#ffffff", display: "flex", flexDirection: "column" }}>
                      <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>Foto 1: Editorial Izquierda (The Fall Edit)</strong>
                        <span style={{ fontSize: "10.5px", background: "#113B3A", color: "#C6AC7F", padding: "3px 9px", borderRadius: "999px", fontWeight: "700" }}>Principal</span>
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
                        <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", background: "rgba(17, 59, 58, 0.88)", backdropFilter: "blur(6px)", padding: "12px 16px", borderRadius: "10px", color: "#ffffff", border: "1px solid rgba(198, 172, 127, 0.35)" }}>
                          <div style={{ fontSize: "15px", fontFamily: "var(--font-serif)", fontWeight: "600", color: "#e6cfa8" }}>{homeImagesData.editorialFall?.title || "The Fall Edit"}</div>
                          <div style={{ fontSize: "11.5px", opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{homeImagesData.editorialFall?.subtitle}</div>
                        </div>
                      </div>
                      <div style={{ padding: "14px 16px", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditHomeImage("editorialFall", homeImagesData.editorialFall || {})}
                          style={{
                            width: "100%",
                            padding: "11px 16px",
                            background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 4px 10px rgba(17, 59, 58, 0.16)",
                          }}
                        >
                          <i className="bi bi-camera-fill" style={{ color: "#C6AC7F" }}></i> Cambiar Fotografía Principal
                        </button>
                      </div>
                    </div>

                    {/* Fotos 2 a 7: Mosaico 6 Fotos */}
                    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", background: "#ffffff", display: "flex", flexDirection: "column" }}>
                      <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>Fotos 2 a 7: Collage Continuo (The New Classics)</strong>
                        <span style={{ fontSize: "10.5px", background: "#e6f0ee", color: "#113B3A", padding: "3px 9px", borderRadius: "999px", fontWeight: "700" }}>6 Piezas</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: "6px", padding: "10px", background: "#0f241d", flex: 1, minHeight: "320px" }}>
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
                                borderRadius: "6px",
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
                                  background: "linear-gradient(to top, rgba(11, 40, 32, 0.85) 0%, rgba(11, 40, 32, 0.25) 100%)",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: "6px",
                                  padding: "10px 6px",
                                  textAlign: "center",
                                }}
                              >
                                <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#e6cfa8" }}>
                                  Foto {num} · {label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditHomeImage(key, item)}
                                  style={{
                                    border: "1px solid rgba(198, 172, 127, 0.5)",
                                    background: "#ffffff",
                                    color: "#113B3A",
                                    padding: "5px 10px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
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
                      <div style={{ padding: "11px 14px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", fontSize: "12px", color: "#475569", textAlign: "center" }}>
                        <i className="bi bi-magic" style={{ color: "#113B3A" }}></i> Las 6 fotografías forman un collage interactivo con zoom en la portada.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDITOR ESPECÍFICO: Showroom & Sedes (1 o 2 Fotos Opcionales + Textos) */}
            {homeSectionFilter === "Nuestras Sedes & Showroom" && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "22px 24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "#f4efe6",
                        color: "#8a6d3b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      🏛️
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                        Textos de Nuestras Sedes y Showroom
                      </h4>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                        Configura el título principal, subtítulo y administra 1 o 2 fotografías del Showroom en la portada.
                      </p>
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
                      background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 18px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      boxShadow: "0 4px 10px rgba(17, 59, 58, 0.18)",
                    }}
                  >
                    <i className="bi bi-check2-circle" style={{ color: "#C6AC7F" }}></i> Guardar Textos de Showroom
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Título Principal
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px", borderRadius: "8px" }}
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
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Subtítulo / Descripción
                    </label>
                    <input
                      type="text"
                      className="filter-select"
                      style={{ width: "100%", height: "42px", borderRadius: "8px" }}
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
              </div>
            )}

            {/* Grid de Tarjetas de Imágenes (para todas las demás secciones) */}
            {homeSectionFilter !== "The Fall Edit & The New Classics" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                  gap: "22px",
                }}
              >
                {filteredHomeItems.map(([key, item]) => {
                  // Caso especial: segunda foto opcional de showroom sin asignar
                  if (key === "showroomSecondary" && !item.image) {
                    return (
                      <div
                        key={key}
                        style={{
                          border: "2px dashed #cbd5e1",
                          borderRadius: "16px",
                          background: "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "32px 24px",
                          textAlign: "center",
                          minHeight: "340px",
                        }}
                      >
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            background: "#e6f0ee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            color: "#113B3A",
                            marginBottom: "14px",
                          }}
                        >
                          <i className="bi bi-image"></i>
                        </div>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#113B3A",
                            background: "#e6f0ee",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            marginBottom: "8px",
                          }}
                        >
                          Nuestras Sedes & Showroom
                        </span>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "4px 0 8px 0" }}>
                          2da Fotografía de Showroom (Opcional)
                        </h4>
                        <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 18px 0", lineHeight: "1.5" }}>
                          Actualmente se muestra 1 fotografía principal. Sube una segunda imagen si deseas exhibir dos sedes en paralelo.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenEditHomeImage(key, item)}
                          style={{
                            background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "11px 20px",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 12px rgba(17, 59, 58, 0.18)",
                          }}
                        >
                          <i className="bi bi-plus-circle-fill" style={{ color: "#C6AC7F" }}></i> Agregar 2da Fotografía
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={key}
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "16px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          height: "220px",
                          background: "#0f172a",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.label || item.name || key}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.target.src = "/images/cat-compromiso.jpg";
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background: "rgba(17, 59, 58, 0.9)",
                            backdropFilter: "blur(6px)",
                            color: "#e6cfa8",
                            border: "1px solid rgba(198, 172, 127, 0.4)",
                            padding: "4px 11px",
                            borderRadius: "999px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.section}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "18px 20px",
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "16px",
                              fontWeight: "700",
                              color: "#0f172a",
                              fontFamily: "var(--font-serif)",
                            }}
                          >
                            {item.label || item.name}
                          </h4>

                          <div
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              color: "#475569",
                              marginBottom: "16px",
                              lineHeight: "1.45",
                            }}
                          >
                            {item.name ? (
                              <>
                                <span style={{ color: "#64748b", fontWeight: "600" }}>Título en tienda:</span>{" "}
                                <strong style={{ color: "#0f172a" }}>"{item.name}"</strong>
                              </>
                            ) : (
                              item.description ||
                              item.subtitle ||
                              (item.path ? `Ruta destino: ${item.path}` : "Fotografía destacada de portada")
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditHomeImage(key, item)}
                            style={{
                              flex: 1,
                              padding: "11px 16px",
                              background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "10px",
                              fontSize: "12.5px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              boxShadow: "0 4px 10px rgba(17, 59, 58, 0.16)",
                              transition: "all 0.2s ease",
                            }}
                            title="Cambiar fotografía y textos asociados"
                          >
                            <i className="bi bi-camera-fill" style={{ color: "#C6AC7F" }}></i>
                            Cambiar Foto y Título
                          </button>

                          {key === "showroomSecondary" && item.image && (
                            <button
                              type="button"
                              onClick={handleRemoveSecondaryShowroom}
                              style={{
                                background: "#fef2f2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                borderRadius: "10px",
                                padding: "11px 14px",
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                              title="Quitar esta segunda foto (volver a 1 sola foto)"
                            >
                              <i className="bi bi-trash3-fill"></i>
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
          )
        )}

        {/* ========================================================
            TAB 5: GESTIÓN DE PEDIDOS Y CONTROL DE PROCESO DE TALLER
            ======================================================== */}
        {activeTab === "pedidos" && (
          !userHasPermission("pedidos") && !userHasPermission("pedidos_global") && !isEffectiveMaster ? (
            renderAccessGuard(
              "pedidos",
              "Supervisión de Pedidos en Taller",
              "Permite supervisar los pedidos de clientes, notas de orfebrería y avance de fabricación en taller."
            )
          ) : (
          <div className="admin-content-card" style={{ padding: "28px" }}>
            {/* Banner Ejecutivo de Control de Taller */}
            <div
              style={{
                background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                color: "#ffffff",
                padding: "24px 28px",
                borderRadius: "12px",
                marginBottom: "22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "18px",
                boxShadow: "0 10px 25px -5px rgba(17, 59, 58, 0.22)",
              }}
            >
              <div style={{ maxWidth: "780px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "rgba(198, 172, 127, 0.22)",
                      color: "#C6AC7F",
                      border: "1px solid rgba(198, 172, 127, 0.45)",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    <i className="bi bi-hammer"></i> ORFEBRERÍA & TRAZABILIDAD DE TALLER
                  </span>
                  <span
                    style={{
                      background: "#22c55e",
                      color: "#ffffff",
                      padding: "2px 9px",
                      borderRadius: "10px",
                      fontSize: "10.5px",
                      fontWeight: "700",
                    }}
                  >
                    {filteredOrders.length} PEDIDO(S) EN VISTA
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "24px",
                    margin: "0 0 6px 0",
                    color: "#ffffff",
                    fontWeight: "600",
                  }}
                >
                  Control de Pedidos y Fabricación en Taller
                </h3>
                <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.86)", margin: 0, lineHeight: "1.5" }}>
                  Gestiona las <strong>6 etapas internas de orfebrería</strong> (Recibido, Taller, Engaste, Calidad, Listo y Entregado). El portal del cliente unifica automáticamente Taller, Engaste y Calidad bajo la etapa <strong>"En Proceso" (4 pasos)</strong>.
                </p>
              </div>
            </div>

            {/* Barra de Búsqueda y Pipeline Interactivo de Fases */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "18px 20px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
                {/* Buscador */}
                <div style={{ flex: "1 1 320px", position: "relative" }}>
                  <i
                    className="bi bi-search"
                    style={{ position: "absolute", left: "14px", top: "11px", color: "#94a3b8", fontSize: "14px" }}
                  ></i>
                  <input
                    type="text"
                    placeholder="Buscar por código (PLT-2026), cliente, correo o joya..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 36px 9px 38px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#1e293b",
                      outline: "none",
                      background: "#f8fafc",
                    }}
                  />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "9px",
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                </div>

                {/* Botón Todos */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {(orderStageFilter !== "todos" || orderSearchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderStageFilter("todos");
                        setOrderClientFilter("todos");
                        setOrderSearchQuery("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "4px 8px",
                      }}
                    >
                      Limpiar filtros
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStageFilter("todos");
                      setOrderClientFilter("todos");
                    }}
                    style={{
                      background: orderStageFilter === "todos" ? "#113B3A" : "#f1f5f9",
                      color: orderStageFilter === "todos" ? "#C6AC7F" : "#334155",
                      border: orderStageFilter === "todos" ? "1.5px solid #113B3A" : "1px solid #cbd5e1",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                    }}
                  >
                    <i className="bi bi-layers-fill"></i> Todos los Pedidos ({effectiveSedeOrders.length})
                  </button>
                </div>
              </div>

              {/* Pipeline de Fases de Fabricación */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
                  gap: "8px",
                  marginTop: "14px",
                  paddingTop: "14px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                {ORDER_STAGES.map((stg) => {
                  const count = effectiveSedeOrders.filter((o) => o.stage === stg.id).length;
                  const isActive = orderStageFilter === stg.id;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => setOrderStageFilter(isActive ? "todos" : stg.id)}
                      style={{
                        background: isActive ? "#113B3A" : "#ffffff",
                        color: isActive ? "#ffffff" : "#334155",
                        border: isActive ? "1.5px solid #C6AC7F" : "1px solid #e2e8f0",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: isActive ? "700" : "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "6px",
                        transition: "all 0.15s",
                        boxShadow: isActive ? "0 4px 10px rgba(17, 59, 58, 0.18)" : "none",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <i className={`bi ${stg.icon}`} style={{ color: isActive ? "#C6AC7F" : stg.color }}></i>
                        <span>{stg.stepNumber}. {stg.shortLabel}</span>
                      </span>
                      <span
                        style={{
                          background: isActive ? "#C6AC7F" : "#f1f5f9",
                          color: isActive ? "#113B3A" : "#475569",
                          padding: "1px 7px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: "800",
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listado de Pedidos */}
            {filteredOrders.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e7e3dc",
                  borderRadius: "12px",
                  padding: "60px 24px",
                  textAlign: "center",
                }}
              >
                <i className="bi bi-box-seam" style={{ fontSize: "40px", color: "#b5c0ba", marginBottom: "12px", display: "block" }}></i>
                <h4 style={{ fontFamily: "var(--font-serif)", color: "#15241e", margin: "0 0 6px" }}>
                  No se encontraron pedidos con estos filtros
                </h4>
                <p style={{ color: "#68776f", fontSize: "13.5px", margin: "0 0 16px" }}>
                  Prueba cambiando la búsqueda o restableciendo los filtros de etapa.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOrderStageFilter("todos");
                    setOrderClientFilter("todos");
                    setOrderSearchQuery("");
                  }}
                  style={{
                    background: "#113B3A",
                    color: "#C6AC7F",
                    border: "none",
                    padding: "9px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {filteredOrders.map((order) => {
                  const currentStageInfo = getOrderStageInfo(order.stage);
                  const clientStageInfo = getClientStageInfo(order.stage);
                  const isEditingThisNote = activeEditingNoteId === order.id;

                  const currentIdx = ORDER_STAGES.findIndex((s) => s.id === order.stage);
                  const prevStage = currentIdx > 0 ? ORDER_STAGES[currentIdx - 1] : null;
                  const nextStage = currentIdx >= 0 && currentIdx < ORDER_STAGES.length - 1 ? ORDER_STAGES[currentIdx + 1] : null;

                  return (
                    <article
                      key={order.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        overflow: "hidden",
                        boxShadow: "0 4px 16px rgba(15, 42, 36, 0.05)",
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      {/* Cabecera de la Orden */}
                      <div
                        style={{
                          padding: "18px 22px",
                          background: "#fcfbf9",
                          borderBottom: "1px solid #ede8df",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "14px",
                        }}
                      >
                        {/* Cliente */}
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div
                            style={{
                              width: "46px",
                              height: "46px",
                              borderRadius: "50%",
                              background: "#113B3A",
                              color: "#C6AC7F",
                              border: "2px solid #C6AC7F",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "17px",
                              fontWeight: "800",
                              flexShrink: 0,
                            }}
                          >
                            {order.clientName ? order.clientName.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: "16px", color: "#113B3A", fontWeight: "700" }}>
                                {order.clientName}
                              </strong>
                              {order.clientDni && (
                                <span
                                  style={{
                                    background: "#f1f5f9",
                                    color: "#334155",
                                    border: "1px solid #cbd5e1",
                                    padding: "1px 7px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  DNI: {order.clientDni}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              {order.clientEmail && (
                                <span>
                                  <i className="bi bi-envelope" style={{ marginRight: "4px" }}></i>
                                  {order.clientEmail}
                                </span>
                              )}
                              {order.clientPhone && (
                                <span>
                                  • <i className="bi bi-telephone" style={{ marginRight: "4px" }}></i>
                                  {order.clientPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Metadata del Pedido y Estados */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <div style={{ textAlign: "right" }}>
                            <span
                              style={{
                                background: "#113B3A",
                                color: "#C6AC7F",
                                padding: "3px 9px",
                                borderRadius: "5px",
                                fontSize: "13px",
                                fontWeight: "800",
                                fontFamily: "monospace",
                                display: "inline-block",
                              }}
                            >
                              {order.id}
                            </span>
                            <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px" }}>
                              <i className="bi bi-calendar3"></i> {order.date}
                            </div>
                          </div>

                          {/* Estado Taller Interno + Vista Cliente */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                            <span
                              style={{
                                background: currentStageInfo.bgColor || "#f0fdf4",
                                color: currentStageInfo.color || "#166534",
                                border: `1px solid ${currentStageInfo.color || "#166534"}40`,
                                padding: "5px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "700",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <i className={`bi ${currentStageInfo.icon}`}></i>
                              Taller: {currentStageInfo.label}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#475569",
                                background: "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontWeight: "600",
                              }}
                            >
                              <i className="bi bi-eye" style={{ color: "#113B3A", marginRight: "3px" }}></i>
                              Cliente ve: <strong>Paso {clientStageInfo.stepNumber}/4 ({clientStageInfo.shortLabel})</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* STEPPER INTERACTIVO DE 6 ETAPAS DE TALLER & BOTONES DE ACCIÓN */}
                      <div style={{ padding: "18px 22px", background: "#ffffff", borderBottom: "1px solid #f1f5f9" }}>
                        {/* Barra Superior de Control de Etapa */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px",
                            marginBottom: "14px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className="bi bi-sliders2" style={{ color: "#113B3A", fontSize: "16px" }}></i>
                            <span style={{ fontSize: "13px", fontWeight: "800", color: "#113B3A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Progreso de Fabricación en Taller (Paso {currentStageInfo.stepNumber} de 6)
                            </span>
                          </div>

                          {/* Botones de Acción de Avance / Retroceso + Selector */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            {prevStage && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStage(order.id, prevStage.id)}
                                title={`Volver a: ${prevStage.label}`}
                                style={{
                                  background: "#f8fafc",
                                  color: "#475569",
                                  border: "1px solid #cbd5e1",
                                  padding: "7px 12px",
                                  borderRadius: "7px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  transition: "all 0.15s",
                                }}
                              >
                                <i className="bi bi-arrow-left-short" style={{ fontSize: "15px" }}></i>
                                {prevStage.shortLabel}
                              </button>
                            )}

                            <select
                              id={`stage-select-${order.id}`}
                              value={order.stage}
                              onChange={(e) => handleUpdateOrderStage(order.id, e.target.value)}
                              style={{
                                padding: "7px 12px",
                                border: "1.5px solid #113B3A",
                                borderRadius: "7px",
                                fontSize: "12.5px",
                                fontWeight: "700",
                                color: "#113B3A",
                                background: "#F2F9F2",
                                cursor: "pointer",
                                outline: "none",
                              }}
                            >
                              {ORDER_STAGES.map((stg) => (
                                <option key={stg.id} value={stg.id}>
                                  Paso {stg.stepNumber}: {stg.label}
                                </option>
                              ))}
                            </select>

                            {nextStage ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStage(order.id, nextStage.id)}
                                style={{
                                  background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                                  color: "#C6AC7F",
                                  border: "1px solid #C6AC7F",
                                  padding: "7px 15px",
                                  borderRadius: "7px",
                                  fontSize: "12.5px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  boxShadow: "0 3px 10px rgba(17, 59, 58, 0.2)",
                                  transition: "all 0.2s",
                                }}
                              >
                                <span>Avanzar a: {nextStage.shortLabel}</span>
                                <i className="bi bi-arrow-right-circle-fill"></i>
                              </button>
                            ) : (
                              <span
                                style={{
                                  background: "#dcfce7",
                                  color: "#166534",
                                  border: "1px solid #86efac",
                                  padding: "6px 12px",
                                  borderRadius: "7px",
                                  fontSize: "12px",
                                  fontWeight: "800",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <i className="bi bi-patch-check-fill"></i> Joya Entregada
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nodos Interactivos de las 6 Fases */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                            gap: "8px",
                          }}
                        >
                          {ORDER_STAGES.map((stg, idx) => {
                            const isCurrent = order.stage === stg.id;
                            const isCompleted = currentIdx > idx;
                            return (
                              <button
                                key={stg.id}
                                type="button"
                                onClick={() => handleUpdateOrderStage(order.id, stg.id)}
                                style={{
                                  border: isCurrent
                                    ? "2px solid #C6AC7F"
                                    : isCompleted
                                    ? "1px solid #86efac"
                                    : "1px solid #e2e8f0",
                                  background: isCurrent
                                    ? "#113B3A"
                                    : isCompleted
                                    ? "#f0fdf4"
                                    : "#f8fafc",
                                  color: isCurrent
                                    ? "#ffffff"
                                    : isCompleted
                                    ? "#166534"
                                    : "#64748b",
                                  padding: "10px 10px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  transition: "all 0.15s",
                                  position: "relative",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span
                                    style={{
                                      fontSize: "10.5px",
                                      fontWeight: "800",
                                      color: isCurrent ? "#C6AC7F" : isCompleted ? "#16a34a" : "#94a3b8",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Fase {stg.stepNumber}
                                  </span>
                                  {isCompleted && <i className="bi bi-check-circle-fill" style={{ color: "#16a34a", fontSize: "13px" }}></i>}
                                  {isCurrent && (
                                    <span
                                      style={{
                                        background: "#C6AC7F",
                                        color: "#113B3A",
                                        fontSize: "9px",
                                        fontWeight: "800",
                                        padding: "1px 5px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      ACTUAL
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: "12px", fontWeight: isCurrent ? "700" : "600", display: "flex", alignItems: "center", gap: "5px" }}>
                                  <i className={`bi ${stg.icon}`} style={{ color: isCurrent ? "#C6AC7F" : "inherit" }}></i>
                                  <span>{stg.shortLabel}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Asignación Interna de Taller: Fases 2, 3 y 4 (Joyero, Proceso, Envío/Calidad y Cofre) */}
                      <div className="workshop-phases-container">
                        {/* Fila superior: Selectores de Fase 2, Fase 3 y Fase 4 */}
                        <div className="workshop-grid-fases">
                          {/* FASE 2: TALLER */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="workshop-badge-fase">
                              FASE 2: TALLER
                            </span>
                            <div style={{ position: "relative", flex: 1 }}>
                              <i
                                className="bi bi-person-fill"
                                style={{
                                  position: "absolute",
                                  left: "11px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#0f172a",
                                  fontSize: "14px",
                                  pointerEvents: "none",
                                }}
                              ></i>
                              <select
                                className="workshop-select-field"
                                value={order.workshopJeweler || ""}
                                onChange={(e) => handleUpdateWorkshopField(order.id, "workshopJeweler", e.target.value)}
                              >
                                <option value="">Elegir Joyero</option>
                                {WORKSHOP_JEWELERS.map((jeweler) => (
                                  <option key={jeweler} value={jeweler}>
                                    {jeweler}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* FASE 3 */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="workshop-badge-fase" style={{ padding: "10px 24px" }}>
                              FASE 3
                            </span>
                            <div style={{ position: "relative", flex: 1 }}>
                              <i
                                className="bi bi-person-fill"
                                style={{
                                  position: "absolute",
                                  left: "11px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#0f172a",
                                  fontSize: "14px",
                                  pointerEvents: "none",
                                }}
                              ></i>
                              <select
                                className="workshop-select-field"
                                value={order.workshopProcess || ""}
                                onChange={(e) => handleUpdateWorkshopField(order.id, "workshopProcess", e.target.value)}
                              >
                                <option value="">Elegir Proceso</option>
                                {WORKSHOP_PROCESSES.map((proc) => (
                                  <option key={proc} value={proc}>
                                    {proc}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* FASE 4 */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="workshop-badge-fase" style={{ padding: "10px 24px" }}>
                              FASE 4
                            </span>
                            <div style={{ position: "relative", flex: 1 }}>
                              <i
                                className="bi bi-person-fill"
                                style={{
                                  position: "absolute",
                                  left: "11px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#0f172a",
                                  fontSize: "14px",
                                  pointerEvents: "none",
                                }}
                              ></i>
                              <select
                                className="workshop-select-field"
                                value={order.workshopDispatch || ""}
                                onChange={(e) => handleUpdateWorkshopField(order.id, "workshopDispatch", e.target.value)}
                              >
                                <option value="">Elegir</option>
                                {WORKSHOP_DELIVERY_CHOICES.map((choice) => (
                                  <option key={choice} value={choice}>
                                    {choice}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Fila inferior: Notas internas (2 columnas) y Cofre (1 columna) */}
                        <div className="workshop-grid-inputs">
                          <div>
                            <input
                              type="text"
                              className="workshop-input-field"
                              placeholder="Escribir Notas Internas (Grabación, detalles adicionales)"
                              value={order.workshopInternalNotes || ""}
                              onChange={(e) => handleUpdateWorkshopField(order.id, "workshopInternalNotes", e.target.value)}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              className="workshop-input-field"
                              placeholder="Cofre"
                              list={`box-suggestions-${order.id}`}
                              value={order.workshopBox || ""}
                              onChange={(e) => handleUpdateWorkshopField(order.id, "workshopBox", e.target.value)}
                            />
                            <datalist id={`box-suggestions-${order.id}`}>
                              {WORKSHOP_BOX_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                      </div>

                      {/* Bitácora / Nota Oficial del Taller para el Cliente */}
                      <div style={{ padding: "16px 22px", background: "#fbfcfb", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#113B3A", display: "inline-flex", alignItems: "center", gap: "7px" }}>
                              <i className="bi bi-journal-text" style={{ color: "#C6AC7F", fontSize: "15px" }}></i>
                              Bitácora Oficial del Taller (Visible para el Cliente):
                            </span>
                            {!isEditingThisNote && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderNotesState({
                                    ...orderNotesState,
                                    [order.id]: order.adminNotes || "",
                                  });
                                  setActiveEditingNoteId(order.id);
                                }}
                                style={{
                                  border: "1px solid #113B3A",
                                  background: "#F2F9F2",
                                  color: "#113B3A",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  padding: "5px 12px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <i className="bi bi-pencil-square"></i> Redactar / Editar Nota
                              </button>
                            )}
                          </div>

                          {isEditingThisNote ? (
                            <div>
                              {/* Plantillas Rápidas de 1 Clic */}
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", alignSelf: "center" }}>
                                  Plantillas rápidas:
                                </span>
                                {[
                                  "Montura en metal precioso fundida y en proceso de pulido artesanal.",
                                  "Gema central seleccionada y en proceso de engaste microscópico en taller.",
                                  "Pieza en control de calidad gemológico y calibración de acabados.",
                                  "Joya lista en su estuche de lujo con certificado oficial Platino Care.",
                                ].map((tpl, tIdx) => (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={() =>
                                      setOrderNotesState({
                                        ...orderNotesState,
                                        [order.id]: tpl,
                                      })
                                    }
                                    style={{
                                      background: "#f8fafc",
                                      border: "1px solid #cbd5e1",
                                      color: "#334155",
                                      padding: "3px 9px",
                                      borderRadius: "12px",
                                      fontSize: "11px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    + {tpl.slice(0, 34)}...
                                  </button>
                                ))}
                              </div>

                              <textarea
                                className="admin-notes-textarea"
                                value={orderNotesState[order.id] !== undefined ? orderNotesState[order.id] : order.adminNotes || ""}
                                onChange={(e) =>
                                  setOrderNotesState({
                                    ...orderNotesState,
                                    [order.id]: e.target.value,
                                  })
                                }
                                placeholder="Escribe el reporte de taller que verá el cliente..."
                                style={{
                                  width: "100%",
                                  padding: "10px 12px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "8px",
                                  fontSize: "13px",
                                  minHeight: "70px",
                                  marginBottom: "10px",
                                }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <button
                                  type="button"
                                  onClick={() => setActiveEditingNoteId(null)}
                                  style={{
                                    border: "1px solid #cbd5e1",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    padding: "7px 14px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveOrderNote(order.id)}
                                  style={{
                                    background: "#113B3A",
                                    color: "#C6AC7F",
                                    border: "none",
                                    padding: "7px 16px",
                                    borderRadius: "6px",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <i className="bi bi-check2-circle"></i> Publicar Nota al Cliente
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5", fontStyle: order.adminNotes ? "normal" : "italic" }}>
                              {order.adminNotes || "Sin notas adicionales registradas para esta orden."}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Detalle de Piezas de Joyería en el Pedido */}
                      <div style={{ padding: "16px 22px" }}>
                        <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                          Piezas de Joyería en este Pedido ({order.items.length}):
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {order.items.map((it, iIdx) => (
                            <div
                              key={iIdx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                padding: "10px 14px",
                                background: "#f8fafc",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <img
                                src={it.image || "/images/secret-garden-white.jpg"}
                                alt={it.name}
                                style={{
                                  width: "52px",
                                  height: "52px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "1px solid #cbd5e1",
                                  background: "#ffffff",
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = "/images/secret-garden-white.jpg";
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: "14px", color: "#113B3A", display: "block" }}>
                                  {it.name}
                                </strong>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                                  {it.metal && (
                                    <span style={{ background: "#FDF9F2", border: "1px solid #C6AC7F", color: "#113B3A", padding: "1px 7px", borderRadius: "4px", fontWeight: "700" }}>
                                      {it.metal}
                                    </span>
                                  )}
                                  {it.size && (
                                    <span style={{ background: "#e2e8f0", padding: "1px 7px", borderRadius: "4px", fontWeight: "600" }}>
                                      Talla: {it.size}
                                    </span>
                                  )}
                                  {it.engraving && (
                                    <span style={{ background: "#fef3c7", color: "#92400e", padding: "1px 7px", borderRadius: "4px", fontWeight: "700" }}>
                                      <i className="bi bi-pen-fill" style={{ marginRight: "3px" }}></i>
                                      Grabado: «{it.engraving}»
                                    </span>
                                  )}
                                  {it.platinoCareTitle && (
                                    <span style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "4px", fontWeight: "600" }}>
                                      <i className="bi bi-shield-check" style={{ marginRight: "3px" }}></i>
                                      {it.platinoCareTitle}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "14.5px", fontWeight: "800", color: "#113B3A" }}>
                                  {formatPrice(it.price * (it.quantity || 1))}
                                </span>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>
                                  Cant: {it.quantity || 1}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer con Botones de Acción Mejorados */}
                      <div
                        style={{
                          background: "#f8fafc",
                          padding: "14px 22px",
                          borderTop: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", fontSize: "12.5px", color: "#475569" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <i className="bi bi-geo-alt-fill" style={{ color: "#113B3A" }}></i>
                            <strong>
                              {order.deliveryType === "recojo_sede"
                                ? `Retiro: ${order.sedeRecojo}`
                                : `Envío: ${order.shippingAddress || "Domicilio registrado"}`}
                            </strong>
                          </span>

                          {order.deliveryDays && (
                            <span
                              style={{
                                background: order.deliveryDays === 7 ? "#fffbeb" : "#f0fdf4",
                                color: order.deliveryDays === 7 ? "#b45309" : "#15803d",
                                border: `1px solid ${order.deliveryDays === 7 ? "#fde68a" : "#bbf7d0"}`,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "11.5px",
                              }}
                            >
                              <i className="bi bi-clock-history" style={{ marginRight: "4px" }}></i>
                              {order.deliveryDays === 7 ? "Plazo: 7 días hábiles (Ajuste Taller)" : "Plazo: 2 días hábiles (Exprés)"}
                            </span>
                          )}

                          <span>
                            <i className="bi bi-credit-card" style={{ color: "#113B3A", marginRight: "4px" }}></i>
                            {order.paymentMethod || "Pasarela Web"}
                          </span>

                          {order.total && (
                            <span style={{ fontWeight: "800", color: "#113B3A", fontSize: "13.5px" }}>
                              Total: {formatPrice(order.total)}
                            </span>
                          )}
                        </div>

                        {/* Botones de Acción Ejecutivos */}
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <a
                            href={`https://wa.me/${(order.clientPhone || "").replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(order.clientName)},%20te%20saludamos%20de%20Platino%20Perú.%20Te%20informamos%20que%20tu%20pedido%20${order.id}%20se%20encuentra%20en%20la%20fase:%20${encodeURIComponent(clientStageInfo.label)}.`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: "#16a34a",
                              color: "#ffffff",
                              textDecoration: "none",
                              padding: "7px 14px",
                              borderRadius: "7px",
                              fontSize: "12.5px",
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
                            }}
                            title="Notificar avance al cliente por WhatsApp"
                          >
                            <i className="bi bi-whatsapp"></i> Notificar por WhatsApp
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            style={{
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              padding: "7px 13px",
                              borderRadius: "7px",
                              fontSize: "12.5px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                            title="Eliminar este pedido del sistema"
                          >
                            <i className="bi bi-trash3"></i> Eliminar Pedido
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          )
        )}

        {/* ========================================================
            TAB: CONTROL DE PAGOS Y VALIDACIÓN DE PEDIDOS (ADMIN)
            ======================================================== */}
        {activeTab === "finanzas" && (
          !userHasPermission("finanzas") ? (
            renderAccessGuard(
              "finanzas",
              "Control de Pagos & Validación de Pedidos",
              "Supervisa los pagos de los pedidos de clientes, verifica si el pago fue realizado y confirma por qué medio se efectuó (BanBif, Banco de la Nación, BCP, Interbank, IziPay, Pichincha, Fondo Platino, Efectivo)."
            )
          ) : (
          <div className="admin-content-card payment-management-section">
            {/* Cabecera Concisa */}
            <div className="payment-management-header">
              <div>
                <h3 className="payment-management-title">
                  <i className="bi bi-wallet2" style={{ color: "#137748" }}></i>
                  Control de Pagos & Validación de Clientes
                </h3>
                <p className="payment-management-desc">
                  Monitorea los pedidos realizados, valida si fueron pagados y confirma el medio de pago utilizado por cada cliente.
                </p>
              </div>
              <span className="payment-admin-badge">
                <i className="bi bi-lock-fill"></i> Solo visible para Administrador
              </span>
            </div>


            {/* Barra de Filtros y Búsqueda */}
            <div className="payment-filters-toolbar">
              <div className="payment-filter-btns-wrap">
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter("todos")}
                  className={`payment-filter-btn ${paymentStatusFilter === "todos" ? "active" : ""}`}
                >
                  Todos ({effectiveSedeOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter("pagados")}
                  className={`payment-filter-btn btn-pagados ${paymentStatusFilter === "pagados" ? "active" : ""}`}
                >
                  <i className="bi bi-check-circle-fill"></i>
                  Pagados ({paymentsKpis.countPagados})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter("por_validar")}
                  className={`payment-filter-btn btn-validar ${paymentStatusFilter === "por_validar" ? "active" : ""}`}
                >
                  <i className="bi bi-hourglass-split"></i>
                  Por Validar ({paymentsKpis.countPendientes})
                </button>
              </div>

              {/* Input Búsqueda */}
              <div className="payment-search-wrap">
                <i className="bi bi-search payment-search-icon"></i>
                <input
                  type="text"
                  placeholder="Buscar cliente, código o medio de pago..."
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                  className="payment-search-input"
                />
              </div>
            </div>

            {/* Listado de Pedidos y Validación de Pagos */}
            {filteredPaymentOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#fbfcfc", borderRadius: "10px", border: "1px dashed #d5ded9" }}>
                <i className="bi bi-inbox" style={{ fontSize: "36px", color: "#95a89e", display: "block", marginBottom: "8px" }}></i>
                <p style={{ margin: 0, fontSize: "14px", color: "#607469", fontWeight: "500" }}>
                  No se encontraron pedidos con los criterios de búsqueda actuales.
                </p>
              </div>
            ) : (
              <div className="payment-orders-list">
                {filteredPaymentOrders.map((order) => {
                  const isPaid = order.paymentStatus === "Pagado (100%)";
                  const currentStatusConfig = PAYMENT_STATUSES.find((s) => s.id === order.paymentStatus) || {
                    label: order.paymentStatus || "Por Validar",
                    color: isPaid ? "#15803d" : "#b45309",
                    bgColor: isPaid ? "#dcfce7" : "#fef3c7",
                    icon: isPaid ? "bi-check-circle-fill" : "bi-clock-history",
                  };

                  const cleanPhone = (order.clientPhone || "").replace(/[^0-9]/g, "");
                  const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(order.clientName || "Cliente")},%20te%20saludamos%20de%20Platino%20sobre%20tu%20pedido%20${encodeURIComponent(order.id)}` : null;

                  return (
                    <article
                      key={order.id}
                      className={`payment-order-card ${isPaid ? "is-paid" : "is-pending"}`}
                    >
                      {/* Cabecera del pedido */}
                      <div className={`payment-order-topbar ${isPaid ? "paid" : "pending"}`}>
                        <div className="payment-order-topbar-meta">
                          <span className="payment-order-id">
                            Pedido {order.id}
                          </span>
                          <span className="payment-order-date">
                            <i className="bi bi-calendar3"></i> {order.date}
                          </span>
                          <span className="payment-order-delivery">
                            <i className="bi bi-geo-alt-fill"></i>
                            {order.deliveryType === "recojo_sede" ? `Recojo: ${order.sedeRecojo || "Sede Miraflores"}` : `Envío: ${order.shippingAddress || "Domicilio"}`}
                          </span>
                        </div>

                        {/* Badge de Estado de Pago actual */}
                        <div
                          className="payment-status-badge"
                          style={{
                            background: currentStatusConfig.bgColor,
                            color: currentStatusConfig.color,
                            border: `1px solid ${currentStatusConfig.color}40`,
                          }}
                        >
                          <i className={`bi ${currentStatusConfig.icon}`}></i>
                          <span>{currentStatusConfig.label}</span>
                        </div>
                      </div>

                      {/* Cuerpo de detalles en dos columnas */}
                      <div className="payment-order-body-grid">
                        {/* Columna Izquierda: Datos del Cliente y Joyas */}
                        <div className="payment-order-col-client">
                          {/* Datos del Cliente */}
                          <div className="payment-client-box">
                            <span className="payment-section-tag">
                              Datos del Cliente:
                            </span>
                            <div className="payment-client-row">
                              <div>
                                <strong className="payment-client-name">{order.clientName}</strong>
                                <span className="payment-client-detail">
                                  <i className="bi bi-envelope"></i>{order.clientEmail}
                                </span>
                                <span className="payment-client-detail">
                                  <i className="bi bi-telephone"></i>{order.clientPhone || "No registrado"}
                                </span>
                              </div>
                              {whatsappLink && (
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="payment-whatsapp-btn"
                                  title="Enviar mensaje de WhatsApp al cliente"
                                >
                                  <i className="bi bi-whatsapp"></i> WhatsApp
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Joyas compradas */}
                          <div className="payment-items-box">
                            <div className="payment-section-tag">
                              Joyas en la compra ({order.items.length}):
                            </div>
                            <div className="payment-items-list">
                              {order.items.map((it, iIdx) => (
                                <div key={iIdx} className="payment-item-row">
                                  <img
                                    src={it.image || "/images/secret-garden-white.jpg"}
                                    alt={it.name}
                                    className="payment-item-img"
                                    onError={(e) => {
                                      e.currentTarget.src = "/images/secret-garden-white.jpg";
                                    }}
                                  />
                                  <div className="payment-item-info">
                                    <strong className="payment-item-title">
                                      {it.name}
                                    </strong>
                                    <span className="payment-item-meta">
                                      {it.metal || "Oro 18k"} • Cant: {it.quantity || 1}
                                    </span>
                                  </div>
                                  <strong className="payment-item-price">
                                    {formatPrice((it.price || 0) * (it.quantity || 1))}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Columna Derecha: Validación de Pago, Medio de Pago & Monto Total */}
                        <div className="payment-order-col-actions">
                          {/* Monto Total de Ventas */}
                          <div className="payment-total-row">
                            <span className="payment-total-lbl">Total Ventas (Importe):</span>
                            <span className="payment-total-val">
                              {formatPrice(order.total)}
                            </span>
                          </div>

                          {/* Control de Validación de Pago */}
                          <div className="payment-control-group">
                            <div className="payment-control-lbl-row">
                              <label className="payment-control-label">
                                Estado del Pago:
                              </label>
                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePaymentStatus(order.id, "Pagado (100%)")}
                                  className="payment-quick-validate-btn"
                                  title="Validar el pago al 100% de inmediato"
                                >
                                  <i className="bi bi-check2"></i> Validar Pago
                                </button>
                              )}
                            </div>
                            <select
                              value={order.paymentStatus || "Pendiente de Validación"}
                              onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                              className={`payment-status-select ${isPaid ? "paid" : "pending"}`}
                            >
                              {PAYMENT_STATUSES.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Control de Medio de Pago */}
                          <div className="payment-control-group">
                            <label className="payment-control-label">
                              Medio de Pago Utilizado:
                            </label>
                            <select
                              value={order.paymentMethod || "BCP"}
                              onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                              className="payment-method-select"
                            >
                              {PAYMENT_METHODS.map((pm) => (
                                <option key={pm} value={pm}>
                                  {pm}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Notas de Comprobante / N° de Operación */}
                          <div className="payment-voucher-box">
                            {activeEditingPaymentNoteId === order.id ? (
                              <div>
                                <label className="payment-voucher-label">
                                  N° de Operación o Referencia de Voucher:
                                </label>
                                <input
                                  type="text"
                                  value={editingPaymentNotes[order.id] !== undefined ? editingPaymentNotes[order.id] : (order.paymentNotes || "")}
                                  onChange={(e) => setEditingPaymentNotes({ ...editingPaymentNotes, [order.id]: e.target.value })}
                                  placeholder="Ej: BCP N° 492019 / Op. Interbank / IziPay / Efectivo"
                                  className="payment-voucher-input"
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                  <button
                                    type="button"
                                    onClick={() => setActiveEditingPaymentNoteId(null)}
                                    className="payment-voucher-cancel-btn"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSavePaymentNotes(order.id)}
                                    className="payment-voucher-save-btn"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                                <span style={{ color: "#61736a" }}>
                                  Ref / Voucher:{" "}
                                  <strong style={{ color: "#1a382d" }}>
                                    {order.paymentNotes || "Sin registrar"}
                                  </strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPaymentNotes({ ...editingPaymentNotes, [order.id]: order.paymentNotes || "" });
                                    setActiveEditingPaymentNoteId(order.id);
                                  }}
                                  className="payment-voucher-edit-btn"
                                >
                                  {order.paymentNotes ? "Modificar" : "+ Registrar Ref"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          )
        )}

        {/* ========================================================
            TAB 6: GESTIÓN DE PERMISOS & SEDES (VLADIMIR MASTER)
            ======================================================== */}
        {activeTab === "permisos" && renderPermisosTab()}

        {/* ========================================================
            TAB 6B: CLAVES & VALIDADOR DIARIO (VLADIMIR MASTER)
            ======================================================== */}
        {activeTab === "claves" && renderClavesTab()}

        {/* ========================================================
            TAB 7: LIBRO DE RECLAMACIONES (VLADIMIR MASTER O CON PERMISO)
            ======================================================== */}
        {activeTab === "reclamaciones" && (
          !userHasPermission("reclamaciones") && !isEffectiveMaster ? (
            renderAccessGuard(
              "reclamaciones",
              "Libro de Reclamaciones (INDECOPI)",
              "Permite revisar hojas de reclamación y quejas registradas conforme a INDECOPI y redactar la respuesta legal."
            )
          ) : (
            <AdminReclamacionesTab isMaster={isEffectiveMaster || userHasPermission("reclamaciones")} />
          )
        )}

        {/* ========================================================
            TAB 8: GESTIÓN DE PLATINO CARE Y GARANTÍAS
            ======================================================== */}
        {activeTab === "platino_care" && (
          <AdminPlatinoCareTab isMaster={isEffectiveMaster} />
        )}

        {/* ========================================================
            TAB 9: GESTIÓN DE GEMAS & DIAMANTES CERTIFICADOS
            ======================================================== */}
        {activeTab === "gemas" && (
          <AdminGemstonesTab isMaster={isEffectiveMaster} />
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
                {/* 1. SELECTOR DE CATEGORÍA CON BARRA SEGMENTADA */}
                <div className="catalog-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ margin: 0, fontWeight: "700", color: "#162e24", fontSize: "13.5px" }}>
                      1. Categoría de la Joya *
                    </label>
                    <span style={{ fontSize: "12px", color: "var(--platino-green-dark)", fontWeight: "700" }}>
                      Activo: {PRODUCT_CATEGORY_GROUPS.find((c) => c.id === formCategoryGroup)?.label || "Anillos"}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#5d6d65", margin: "0 0 6px 0" }}>
                    Selecciona el tipo de joya para habilitar sus opciones (tallas oficiales de dama/varón, gemas o accesorios de lujo):
                  </p>

                  <div className="category-segmented-bar category-modal-bar">
                    {PRODUCT_CATEGORY_GROUPS.map(({ id, label, Icon }) => {
                      const isAct = formCategoryGroup === id;
                      return (
                        <div
                          key={id}
                          className={`category-seg-item ${isAct ? "active" : ""}`}
                          onClick={() => handleSelectFormCategoryGroup(id)}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="category-seg-icon"><Icon /></span>
                          <span>{label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subcategorías si es Anillos */}
                  {formCategoryGroup === "anillos" && (
                    <div className="category-subtypes-chips">
                      <span style={{ fontSize: "11.5px", color: "#5d6d65", alignSelf: "center", marginRight: "4px" }}>
                        Subtipo de Anillo:
                      </span>
                      {[
                        { id: "anillo-compromiso", label: "💍 Anillo de Compromiso", type: "anillo" },
                        { id: "aros-boda", label: "💒 Aros de Boda (Doble Talla)", type: "aros" },
                        { id: "anillo-promesa", label: "✨ Anillo de Promesa", type: "anillo" },
                        { id: "aros-alianzas", label: "🤝 Alianzas (Doble Talla)", type: "aros" },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          className={`category-subtype-btn ${formCategory === sub.id ? "active" : ""}`}
                          onClick={() => {
                            setFormCategory(sub.id);
                            setFormType(sub.type);
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Subcategorías si es Otros */}
                  {formCategoryGroup === "otros" && (
                    <div className="category-subtypes-chips">
                      <span style={{ fontSize: "11.5px", color: "#5d6d65", alignSelf: "center", marginRight: "4px" }}>
                        Subtipo:
                      </span>
                      {[
                        { id: "joyeria", label: "⭐ Joyería General", type: "accesorio" },
                        { id: "regalos", label: "🎁 Regalos", type: "accesorio" },
                        { id: "gemas", label: "💎 Gemas Sueltas", type: "accesorio" },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          className={`category-subtype-btn ${formCategory === sub.id ? "active" : ""}`}
                          onClick={() => {
                            setFormCategory(sub.id);
                            setFormType(sub.type);
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. DATOS BÁSICOS DE LA JOYA */}
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

                {/* 3. PRIMERO: SELECCIÓN DE MATERIALES DISPONIBLES */}
                <div className="product-metals-box">
                  <div className="product-metals-header">
                    <div className="product-metals-title">
                      <i className="bi bi-gem"></i>
                      <span>3. Elige los Materiales que tiene esta Joya *</span>
                      <span className="product-metals-badge">
                        {formAvailableMetals.length} de {METALS.length} seleccionados
                      </span>
                    </div>

                    <div className="product-metals-presets">
                      <button
                        type="button"
                        className="btn-metal-preset"
                        onClick={handleSelectAllMetals}
                        title="Habilitar todos los 10 materiales"
                      >
                        Todos (10)
                      </button>
                      <button
                        type="button"
                        className="btn-metal-preset"
                        onClick={handleSelectOnlyGold}
                        title="Habilitar solo Oro 18k"
                      >
                        Solo Oros (4)
                      </button>
                      <button
                        type="button"
                        className="btn-metal-preset"
                        onClick={handleSelectSilverAndMixed}
                        title="Habilitar Platas y combinados Plata con Oro"
                      >
                        Platas y Mixtos (5)
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: "12px", color: "#5d6e65", margin: 0 }}>
                    Marca los materiales disponibles para esta pieza. Abajo se habilitarán dinámicamente <strong>únicamente las casillas de fotografía</strong> que corresponden a los materiales que elijas:
                  </p>

                  <div className="product-metals-grid">
                    {METALS.map((metal) => {
                      const isChecked = formAvailableMetals.includes(metal.id);
                      return (
                        <div
                          key={metal.id}
                          className={`metal-item-toggle ${isChecked ? "active" : ""}`}
                          onClick={() => handleToggleMetal(metal.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="metal-item-checkbox"
                          />
                          <div
                            className="metal-item-swatch"
                            style={{
                              background: metal.color,
                              border: `1.5px solid ${metal.border}`,
                            }}
                          />
                          <div className="metal-item-info">
                            <span className="metal-item-name">{metal.name}</span>
                            <span className="metal-item-group">{metal.group}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selector de Metal Predeterminado */}
                  <div className="product-default-metal-picker">
                    <label>
                      <i className="bi bi-star"></i> Metal preseleccionado por defecto al abrir el producto:
                    </label>
                    <select
                      value={formSelectedMetal}
                      onChange={(e) => setFormSelectedMetal(e.target.value)}
                    >
                      {METALS.filter((m) => formAvailableMetals.includes(m.id)).map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. VALOR (PRECIO EN S/.) Y FOTOGRAFÍA OBLIGATORIA POR CADA MATERIAL SELECCIONADO */}
                <div className="metal-photos-box">
                  <div className="metal-photos-header">
                    <div className="metal-photos-title">
                      <i className="bi bi-camera-fill" style={{ color: "#113B3A", fontSize: "17px" }}></i>
                      <span style={{ fontWeight: "700", color: "#113B3A" }}>
                        4. Fotografía y Valor Obligatorio por Cada Material ({formAvailableMetals.length} materiales) *
                      </span>
                    </div>
                    <span className="metal-photos-badge" style={{ background: "#e8f2ec", color: "#113B3A", fontWeight: "600" }}>
                      <i className="bi bi-check2-circle"></i> 1 Foto y 1 Precio por cada material
                    </span>
                  </div>

                  <p style={{ fontSize: "12.5px", color: "#4f6057", margin: 0, lineHeight: 1.45 }}>
                    <strong>No se limitan a 3 imágenes</strong>: cada material seleccionado tiene su propia fotografía individual obligatoria y su valor en Soles (S/.). Sube o ingresa la foto para cada uno de los materiales que habilitaste en el Paso 3.
                  </p>

                  {/* Barra de Atajos Rápidos para Precios */}
                  {formPrice && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", background: "#f2eee7", padding: "8px 12px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#172b22" }}>
                        ⚡ Atajo para precios:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyPriceToAll(formPrice)}
                        className="btn-apply-all-price"
                        title={`Copiar S/. ${formPrice} a todos los materiales seleccionados`}
                      >
                        <i className="bi bi-copy"></i> Aplicar S/. {formPrice} como precio base a todos
                      </button>
                    </div>
                  )}

                  {formAvailableMetals.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#8a9690", fontSize: "13px" }}>
                      👆 Marca al menos un material en el paso 3 para configurar sus fotos y precios.
                    </div>
                  ) : (
                    <div className="metals-pricing-photos-grid">
                      {formAvailableMetals.map((mId) => {
                        const metal = METALS.find((m) => m.id === mId) || { id: mId, name: mId, color: "#e4e7e7", border: "#cfd3d3", group: "General" };
                        const isDefault = formSelectedMetal === metal.name;
                        const currentPrice = formMetalPrices[mId] ?? "";
                        const currentImg = formMetalImages[mId] || "";

                        return (
                          <div
                            key={metal.id}
                            className={`metal-config-card ${isDefault ? "is-default" : ""}`}
                          >
                            {/* Cabecera del material */}
                            <div className="metal-config-card-head">
                              <div className="metal-config-title-wrap">
                                <div
                                  className="metal-config-swatch"
                                  style={{
                                    background: metal.color,
                                    border: `1.5px solid ${metal.border}`,
                                  }}
                                />
                                <div>
                                  <div className="metal-config-name">{metal.name}</div>
                                  <div className="metal-config-group">{metal.group}</div>
                                </div>
                              </div>
                              {isDefault && (
                                <span style={{ fontSize: "10px", background: "#fdf3d8", color: "#826312", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", border: "1px solid #e7d69e" }}>
                                  ⭐ Por defecto
                                </span>
                              )}
                            </div>

                            {/* Campo de Precio por este material */}
                            <div className="metal-price-field">
                              <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#173628", display: "flex", justifyContent: "space-between" }}>
                                <span>Precio en Soles (S/.) *</span>
                                {currentPrice && (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyPriceToAll(currentPrice)}
                                    style={{ background: "none", border: "none", color: "#0d5c36", fontSize: "10.5px", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                                    title="Copiar este valor a todos los materiales seleccionados"
                                  >
                                    Copiar a todos
                                  </button>
                                )}
                              </label>
                              <div className="metal-price-input-row">
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#506258" }}>S/.</span>
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  required
                                  className="metal-price-input"
                                  placeholder="Ej. 2950"
                                  value={currentPrice}
                                  onChange={(e) => handleMetalPriceChange(metal.id, e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Campo de Foto Obligatoria por este material */}
                            <div className="metal-photo-field" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#173628" }}>
                                Foto Obligatoria para {metal.name} *
                              </label>

                              {/* Preview de la foto */}
                              <div className="metal-photo-preview" style={{ height: "135px" }}>
                                {currentImg ? (
                                  <img
                                    src={currentImg}
                                    alt={`Foto ${metal.name}`}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/images/cat-compromiso.jpg";
                                    }}
                                  />
                                ) : (
                                  <div className="metal-photo-preview-placeholder">
                                    <i className="bi bi-camera" style={{ fontSize: "24px", color: "#d9534f" }}></i>
                                    <span style={{ color: "#d9534f", fontWeight: "600" }}>Foto requerida</span>
                                  </div>
                                )}
                              </div>

                              {/* Input de URL / Ruta */}
                              <input
                                type="text"
                                className="catalog-form-input"
                                style={{ fontSize: "11.5px", padding: "6px 8px" }}
                                placeholder={`/images/... o https:// para ${metal.name}`}
                                value={currentImg}
                                onChange={(e) => handleMetalImageChange(metal.id, e.target.value)}
                                required
                              />

                              {/* Botón de subir archivo con compresión */}
                              <label className="btn-upload-metal-file" style={{ padding: "6px 10px", fontSize: "11.5px" }}>
                                <i className="bi bi-cloud-arrow-up-fill"></i> Subir foto de {metal.name}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleMetalFileUpload(metal.id, e)}
                                  style={{ display: "none" }}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5. SILUETAS Y FORMAS DE GEMA PARA ESTE MODELO (PASO 2) */}
                <div className="product-gem-shapes-config-card" style={{
                  background: "#fbf9f6",
                  border: "1.5px solid #d4e2db",
                  borderRadius: "12px",
                  padding: "18px",
                  marginTop: "16px",
                  marginBottom: "20px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="bi bi-gem" style={{ color: "#113B3A", fontSize: "20px" }}></i>
                      <strong style={{ fontSize: "14px", color: "#113B3A" }}>5. Siluetas y Formas de Gema para este Modelo (Paso 2)</strong>
                    </div>
                    <span style={{ fontSize: "11px", background: "#edf5f0", color: "#113B3A", padding: "3px 8px", borderRadius: "4px", fontWeight: "600" }}>
                      Paso 2 de Personalización
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", color: "#5d6d65", margin: "0 0 12px", lineHeight: "1.45" }}>
                    Configura las siluetas de diamantes o gemas disponibles específicamente para este diseño y personaliza los textos técnicos e informativos que se mostrarán en vivo al cliente en el <strong>Paso 2: Elige la Forma de tu Gema</strong>.
                  </p>

                  {/* Toggle para habilitar/deshabilitar gemas en este producto */}
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: formHasGemSelection ? "#edf5f0" : "#f1f5f3",
                    border: formHasGemSelection ? "1px solid #b7d6c5" : "1px solid #d4dfd9",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "14px"
                  }}>
                    <input
                      type="checkbox"
                      checked={formHasGemSelection}
                      onChange={(e) => setFormHasGemSelection(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#113B3A", cursor: "pointer" }}
                    />
                    <div>
                      <strong style={{ fontSize: "13px", color: "#113B3A" }}>
                        Habilitar Selección de Siluetas de Gemas (Paso 2 activo)
                      </strong>
                      <div style={{ fontSize: "11.5px", color: "#586960", marginTop: "2px" }}>
                        {formHasGemSelection
                          ? "El cliente verá el selector de siluetas de gemas con las opciones y textos personalizados configurados abajo."
                          : "Desactivado: El cliente pasará directamente del metal/tallas a complementos/estuches (sin paso de gemas)."}
                      </div>
                    </div>
                  </label>

                  {formHasGemSelection && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {/* Barra de acciones rápidas */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2ece6" }}>
                        <div style={{ fontSize: "12px", color: "#113B3A", fontWeight: "600" }}>
                          Siluetas habilitadas: <span style={{ color: "#137748", fontWeight: "700" }}>{formAvailableGemShapes.length} de {MASTER_GEM_SHAPES.length}</span>
                          {" • "}
                          Silueta inicial por defecto: <span style={{ textTransform: "capitalize", fontWeight: "700" }}>{MASTER_GEM_SHAPES.find((s) => s.id === formDefaultGemShape)?.name || formDefaultGemShape}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={handleSelectAllGemShapes}
                            style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #113B3A", background: "#ffffff", color: "#113B3A", cursor: "pointer", fontWeight: "600" }}
                          >
                            Habilitar Todas (10)
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectClassicGemShapes}
                            style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #113B3A", background: "#ffffff", color: "#113B3A", cursor: "pointer", fontWeight: "600" }}
                          >
                            Solo Clásicas (4)
                          </button>
                        </div>
                      </div>

                      {/* Cuadrícula de siluetas */}
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#163a2c", marginBottom: "8px" }}>
                          1. Siluetas Habilitadas y Selección de Silueta Inicial:
                        </div>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))",
                          gap: "8px"
                        }}>
                          {MASTER_GEM_SHAPES.map((shape) => {
                            const isAvail = formAvailableGemShapes.includes(shape.id);
                            const isDefault = formDefaultGemShape === shape.id;
                            const isTabActive = formActiveGemShapeTab === shape.id;
                            const hasCustomText = Boolean(formGemShapeConfigs[shape.id] && Object.keys(formGemShapeConfigs[shape.id]).length > 0);

                            return (
                              <div
                                key={shape.id}
                                onClick={() => setFormActiveGemShapeTab(shape.id)}
                                style={{
                                  background: isTabActive ? "#edf5f0" : (isAvail ? "#ffffff" : "#f7f7f7"),
                                  border: isTabActive ? "2px solid #113B3A" : (isAvail ? "1px solid #c7dcd0" : "1px dashed #d1d5db"),
                                  borderRadius: "8px",
                                  padding: "8px 10px",
                                  cursor: "pointer",
                                  opacity: isAvail ? 1 : 0.65,
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                  flexDirection: "column",
                                  position: "relative"
                                }}
                              >
                                {hasCustomText && (
                                  <span
                                    title="Tiene textos informativos personalizados"
                                    style={{
                                      position: "absolute",
                                      top: "4px",
                                      right: "4px",
                                      width: "7px",
                                      height: "7px",
                                      borderRadius: "50%",
                                      background: "#c5a059"
                                    }}
                                  />
                                )}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                                  <label
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ display: "flex", alignItems: "center", cursor: "pointer", margin: 0 }}
                                    title={isAvail ? "Desmarcar para ocultar este corte en la tienda" : "Marcar para ofrecer este corte"}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isAvail}
                                      onChange={() => handleToggleGemShape(shape.id)}
                                      style={{ width: "15px", height: "15px", accentColor: "#113B3A", cursor: "pointer" }}
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectDefaultGemShape(shape.id);
                                    }}
                                    title={isDefault ? "Silueta inicial por defecto" : "Establecer como silueta inicial por defecto"}
                                    style={{
                                      background: isDefault ? "#113B3A" : "transparent",
                                      color: isDefault ? "#ffffff" : "#617169",
                                      border: isDefault ? "none" : "1px solid #d4dfd9",
                                      borderRadius: "4px",
                                      padding: "1px 5px",
                                      fontSize: "10px",
                                      fontWeight: "600",
                                      cursor: "pointer"
                                    }}
                                  >
                                    {isDefault ? "★ Defecto" : "Hacer def."}
                                  </button>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {shape.image ? (
                                      <img
                                        src={shape.image}
                                        alt={shape.name}
                                        style={{ width: "22px", height: "22px", objectFit: "contain" }}
                                        onError={(e) => { e.target.style.display = "none"; }}
                                      />
                                    ) : (
                                      <DiamondCutIcon shape={shape.id} size={20} />
                                    )}
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: isTabActive ? "700" : "600", color: "#163a2c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {shape.name}
                                  </span>
                                </div>

                                {isTabActive && (
                                  <span style={{ fontSize: "9.5px", color: "#137748", fontWeight: "700", marginTop: "4px" }}>
                                    ✏️ Editando textos
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Editor de textos informativos de la forma activa */}
                      {formActiveGemShapeTab && (() => {
                        const activeShape = MASTER_GEM_SHAPES.find((s) => s.id === formActiveGemShapeTab) || MASTER_GEM_SHAPES[0];
                        const customConf = formGemShapeConfigs[activeShape.id] || {};
                        const effective = getShapeEffectiveConfig(activeShape.id);
                        const hasOverrides = Object.keys(customConf).length > 0;

                        return (
                          <div style={{
                            background: "#ffffff",
                            border: "1px solid #cfe0d6",
                            borderRadius: "10px",
                            padding: "14px 16px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "12px", borderBottom: "1px solid #edf2ef", paddingBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#edf5f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {activeShape.image ? (
                                    <img src={activeShape.image} alt={activeShape.name} style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                                  ) : (
                                    <DiamondCutIcon shape={activeShape.id} size={20} />
                                  )}
                                </div>
                                <strong style={{ fontSize: "13.5px", color: "#113B3A" }}>
                                  2. Personalizar Textos para Corte {activeShape.name}
                                </strong>
                              </div>
                              {hasOverrides && (
                                <button
                                  type="button"
                                  onClick={() => handleResetGemShapeConfig(activeShape.id)}
                                  style={{
                                    fontSize: "11px",
                                    color: "#991b1b",
                                    background: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    borderRadius: "6px",
                                    padding: "3px 8px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                  }}
                                >
                                  ↺ Restaurar textos originales de {activeShape.name}
                                </button>
                              )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                              <div>
                                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#173628", display: "block", marginBottom: "3px" }}>
                                  Badge de Quilataje / Medida (Ej. 1.00 ct)
                                </label>
                                <input
                                  type="text"
                                  className="catalog-form-input"
                                  style={{ fontSize: "12px", padding: "6px 10px" }}
                                  placeholder={activeShape.popularCarat || activeShape.carat || "1.00 ct"}
                                  value={customConf.carat !== undefined ? customConf.carat : ""}
                                  onChange={(e) => handleGemShapeConfigChange(activeShape.id, "carat", e.target.value)}
                                />
                                <span style={{ fontSize: "10.5px", color: "#718279" }}>Píldora destacada junto al nombre del corte</span>
                              </div>

                              <div>
                                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#173628", display: "block", marginBottom: "3px" }}>
                                  Subtítulo de Certificación / Calidad
                                </label>
                                <input
                                  type="text"
                                  className="catalog-form-input"
                                  style={{ fontSize: "12px", padding: "6px 10px" }}
                                  placeholder={activeShape.subtitle || "Diamante Fino Platino (Corte Brillante Certificado)"}
                                  value={customConf.subtitle !== undefined ? customConf.subtitle : ""}
                                  onChange={(e) => handleGemShapeConfigChange(activeShape.id, "subtitle", e.target.value)}
                                />
                                <span style={{ fontSize: "10.5px", color: "#718279" }}>Línea descriptiva bajo el nombre</span>
                              </div>

                              <div>
                                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#173628", display: "block", marginBottom: "3px" }}>
                                  Proporción Recomendada (Ratio)
                                </label>
                                <input
                                  type="text"
                                  className="catalog-form-input"
                                  style={{ fontSize: "12px", padding: "6px 10px" }}
                                  placeholder={activeShape.ratio || "1.00 - 1.05"}
                                  value={customConf.ratio !== undefined ? customConf.ratio : ""}
                                  onChange={(e) => handleGemShapeConfigChange(activeShape.id, "ratio", e.target.value)}
                                />
                                <span style={{ fontSize: "10.5px", color: "#718279" }}>Etiqueta de proporción técnica recomendada</span>
                              </div>

                              <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#173628", display: "block", marginBottom: "3px" }}>
                                  Descripción Técnica del Corte
                                </label>
                                <textarea
                                  className="catalog-form-input"
                                  rows={2}
                                  style={{ fontSize: "12px", padding: "6px 10px", width: "100%", resize: "vertical" }}
                                  placeholder={activeShape.desc || "Máxima refracción y brillo fuego simétrico icónico."}
                                  value={customConf.desc !== undefined ? customConf.desc : ""}
                                  onChange={(e) => handleGemShapeConfigChange(activeShape.id, "desc", e.target.value)}
                                />
                                <span style={{ fontSize: "10.5px", color: "#718279" }}>Párrafo central con detalles ópticos o estilísticos</span>
                              </div>

                              <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#173628", display: "block", marginBottom: "3px" }}>
                                  Nota de Taller y Engaste (Garantía)
                                </label>
                                <textarea
                                  className="catalog-form-input"
                                  rows={2}
                                  style={{ fontSize: "12px", padding: "6px 10px", width: "100%", resize: "vertical" }}
                                  placeholder={activeShape.extraNote || "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida."}
                                  value={customConf.extraNote !== undefined ? customConf.extraNote : ""}
                                  onChange={(e) => handleGemShapeConfigChange(activeShape.id, "extraNote", e.target.value)}
                                />
                                <span style={{ fontSize: "10.5px", color: "#718279" }}>Texto al pie sobre la confección artesanal en taller</span>
                              </div>
                            </div>

                            {/* VISTA PREVIA EN VIVO DE LA TARJETA EXACTA DE LA FOTO */}
                            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed #d4e2db" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#113B3A" }}>
                                  👁️ Vista Previa en Vivo (Tarjeta del Paso 2 como la verá el cliente):
                                </span>
                                <span style={{ fontSize: "10.5px", color: "#137748", fontWeight: "600" }}>
                                  Corte {activeShape.name}
                                </span>
                              </div>

                              <div style={{
                                background: "#f6f9f7",
                                border: "1px solid #d4e2db",
                                borderRadius: "10px",
                                padding: "14px 16px"
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    background: "#eaf3ee",
                                    border: "1px solid #c7ded2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                  }}>
                                    {activeShape.image ? (
                                      <img
                                        src={activeShape.image}
                                        alt={activeShape.name}
                                        style={{ width: "30px", height: "30px", objectFit: "contain" }}
                                        onError={(e) => { e.target.style.display = "none"; }}
                                      />
                                    ) : (
                                      <DiamondCutIcon shape={activeShape.id} size={30} />
                                    )}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f2a24" }}>
                                        Corte {activeShape.name}
                                      </span>
                                      {effective.carat && (
                                        <span style={{
                                          fontSize: "11px",
                                          fontWeight: "700",
                                          color: "#0f2a24",
                                          background: "#e2eee7",
                                          padding: "2px 8px",
                                          borderRadius: "12px",
                                          border: "1px solid #b8d9c7"
                                        }}>
                                          {effective.carat}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#617169", marginTop: "2px" }}>
                                      {effective.subtitle || "Diamante Fino Platino (Corte Brillante Certificado)"}
                                    </div>
                                  </div>
                                </div>
                                {effective.desc && (
                                  <p style={{ margin: "10px 0 6px", fontSize: "12.5px", color: "#3c4842", lineHeight: "1.5" }}>
                                    {effective.desc}
                                  </p>
                                )}
                                {effective.ratio && (
                                  <div style={{
                                    display: "inline-block",
                                    margin: "4px 0 6px",
                                    padding: "3px 10px",
                                    background: "#eef5f1",
                                    borderRadius: "6px",
                                    fontSize: "11.5px",
                                    color: "#163a2c",
                                    border: "1px solid #cfe0d6"
                                  }}>
                                    <span>Proporción recomendada: <strong>{effective.ratio}</strong></span>
                                  </div>
                                )}
                                <p style={{ margin: "6px 0 0", fontSize: "11.5px", color: "#6d7a74", lineHeight: "1.45" }}>
                                  {effective.extraNote || "Montado bajo microscopio por nuestros maestros orfebres para garantizar el máximo reflejo de luz y seguridad de engaste de por vida."}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 6. CAJA / ESTUCHE DE PRESENTACIÓN DE LA JOYA */}
                <div className="product-box-config-card" style={{
                  background: "#fbf9f6",
                  border: "1.5px solid #e7dcce",
                  borderRadius: "12px",
                  padding: "18px",
                  marginTop: "16px",
                  marginBottom: "20px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="bi bi-box2-heart-fill" style={{ color: "#c5a059", fontSize: "20px" }}></i>
                      <strong style={{ fontSize: "14px", color: "#113B3A" }}>6. Caja de Presentación / Estuche del Producto</strong>
                    </div>
                    <span style={{ fontSize: "11px", background: "#edf5f0", color: "#113B3A", padding: "3px 8px", borderRadius: "4px", fontWeight: "600" }}>
                      Visible en Portafolio y Paso 2
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", color: "#5d6d65", margin: "0 0 14px", lineHeight: "1.45" }}>
                    Configura la foto de la caja o estuche de regalo que se agregará al portafolio de la joya y se mostrará al cliente en el <strong>Paso 2: Complementos y Estuche</strong>.
                  </p>

                  <div className="product-box-layout">
                    {/* Vista previa de la caja */}
                    <div className="product-box-preview">
                      <img
                        src={formBoxImage || "/images/detail-box-green.jpg"}
                        alt="Caja de presentación"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/detail-box-green.jpg"; }}
                      />
                    </div>

                    <div className="product-box-controls">
                      <div className="product-box-presets">
                        <button
                          type="button"
                          onClick={() => setFormBoxImage("/images/detail-box-green.jpg")}
                          className="btn-box-preset"
                          style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #113B3A", background: formBoxImage === "/images/detail-box-green.jpg" ? "#113B3A" : "#ffffff", color: formBoxImage === "/images/detail-box-green.jpg" ? "#ffffff" : "#113B3A", cursor: "pointer", fontWeight: "600" }}
                        >
                          Caja Verde Platino
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormBoxImage("/images/box-presentation.jpg")}
                          className="btn-box-preset"
                          style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #113B3A", background: formBoxImage === "/images/box-presentation.jpg" ? "#113B3A" : "#ffffff", color: formBoxImage === "/images/box-presentation.jpg" ? "#ffffff" : "#113B3A", cursor: "pointer", fontWeight: "600" }}
                        >
                          Estuche Terciopelo Negro
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormBoxImage("/images/detail-packaging.jpg")}
                          className="btn-box-preset"
                          style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #113B3A", background: formBoxImage === "/images/detail-packaging.jpg" ? "#113B3A" : "#ffffff", color: formBoxImage === "/images/detail-packaging.jpg" ? "#ffffff" : "#113B3A", cursor: "pointer", fontWeight: "600" }}
                        >
                          Caja Madera LED
                        </button>
                      </div>

                      <div className="product-box-input-row">
                        <input
                          type="text"
                          className="catalog-form-input"
                          style={{ fontSize: "12px", padding: "8px 12px", flex: 1 }}
                          placeholder="Ruta o URL de la caja (Ej. /images/detail-box-green.jpg)"
                          value={formBoxImage}
                          onChange={(e) => setFormBoxImage(e.target.value)}
                        />
                        <label className="btn-upload-box-file" style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          background: "#edf5f0",
                          color: "#113B3A",
                          border: "1px solid #b7d6c5",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          whiteSpace: "nowrap"
                        }}>
                          <i className="bi bi-cloud-arrow-up-fill"></i> Subir Foto de Caja
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBoxImageFileUpload}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Tiempo de Entrega Rápida (Opcional para Accesorios) */}
                <div style={{
                  background: formCategoryGroup === "anillos" ? "#fbfaf7" : "#fdfbf7",
                  border: "1.5px solid #e7dfd1",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "20px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ flex: 1, minWidth: "240px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="bi bi-lightning-charge-fill" style={{ color: "#d97706", fontSize: "18px" }}></i>
                        <strong style={{ fontSize: "13.5px", color: "#113B3A" }}>
                          7. Mostrar Tarjeta de Tiempo de Entrega Rápida (2 o 7 días)
                        </strong>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#5d6d65", lineHeight: "1.4" }}>
                        {formCategoryGroup === "anillos"
                          ? "Desactivado por regla para sortijas de compromiso, aros de boda y alianzas (fabricación a medida en taller)."
                          : "Opcional para accesorios (collares, pulseras, aretes). Puedes activar o desactivar esta opción según disponibilidad."}
                      </p>
                    </div>

                    <label style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: formCategoryGroup === "anillos" ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      background: "#ffffff",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd7ce"
                    }}>
                      <input
                        type="checkbox"
                        checked={formCategoryGroup === "anillos" ? false : formShowDeliveryEstimate}
                        disabled={formCategoryGroup === "anillos"}
                        onChange={(e) => setFormShowDeliveryEstimate(e.target.checked)}
                        style={{ width: "17px", height: "17px", accentColor: "#113B3A", cursor: formCategoryGroup === "anillos" ? "not-allowed" : "pointer" }}
                      />
                      <span style={{ color: formCategoryGroup === "anillos" ? "#94a3b8" : formShowDeliveryEstimate ? "#137748" : "#991b1b" }}>
                        {formCategoryGroup === "anillos" ? "Desactivado (Anillos)" : (formShowDeliveryEstimate ? "Opción Activa" : "Desactivada")}
                      </span>
                    </label>
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
            style={{ zIndex: 1000005, paddingTop: "32px", paddingBottom: "32px" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setHomeImageModalOpen(false);
            }}
          >
            <div
              className="catalog-modal-card"
              style={{
                maxWidth: "620px",
                borderRadius: "18px",
                overflow: "hidden",
                padding: 0,
                border: "1px solid rgba(198, 172, 127, 0.35)",
                boxShadow: "0 24px 48px rgba(15, 23, 42, 0.28)",
              }}
              role="dialog"
              aria-modal="true"
            >
              {/* Cabecera Ejecutiva del Modal */}
              <div
                style={{
                  background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                  padding: "22px 26px",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(198, 172, 127, 0.22)",
                      color: "#e6cfa8",
                      border: "1px solid rgba(198, 172, 127, 0.45)",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "10.5px",
                      fontWeight: "700",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    {homeImagesData[editingHomeKey]?.section || "Portada de Inicio"}
                  </span>
                  <h2 style={{ margin: 0, fontSize: "20px", fontFamily: "var(--font-serif)", color: "#ffffff" }}>
                    Actualizar Fotografía y Textos
                  </h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "rgba(255, 255, 255, 0.85)" }}>
                    Bloque seleccionado: <strong>{homeImagesData[editingHomeKey]?.label || editingHomeKey}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setHomeImageModalOpen(false)}
                  aria-label="Cerrar modal"
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSaveHomeImage} className="catalog-modal-form" style={{ padding: "24px 26px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "stretch",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "165px",
                      height: "165px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "2px solid #cbd5e1",
                      background: "#0f172a",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
                      minWidth: "230px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#0f172a",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        1. Subir nueva imagen desde tu equipo:
                      </span>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "10px 14px",
                          background: "#e6f0ee",
                          color: "#113B3A",
                          border: "1.5px dashed #113B3A",
                          borderRadius: "10px",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        <i className="bi bi-cloud-arrow-up-fill" style={{ fontSize: "16px" }}></i>
                        Seleccionar Archivo de Imagen
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHomeImageFileUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#334155",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        2. O pegar enlace / ruta directa:
                      </label>
                      <input
                        type="text"
                        className="catalog-form-input"
                        style={{ borderRadius: "8px", fontSize: "12.5px" }}
                        placeholder="https://... o /images/..."
                        value={formHomeImageSrc}
                        onChange={(e) => setFormHomeImageSrc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Campo de Título / Nombre visible (se oculta para piezas individuales del mosaico) */}
                {!editingHomeKey?.startsWith("mosaic") && (
                  <div className="catalog-form-group" style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "700", color: "#0f172a", fontSize: "12.5px" }}>
                      Título / Nombre visible en la tienda
                    </label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      style={{ borderRadius: "10px" }}
                      value={formHomeImageTitle}
                      onChange={(e) => setFormHomeImageTitle(e.target.value)}
                      placeholder="Ej. Anillos solitarios, etc."
                    />
                    <small style={{ fontSize: "11.5px", color: "#64748b", marginTop: "4px", display: "block" }}>
                      Este texto se muestra como encabezado o etiqueta debajo de la fotografía en la portada.
                    </small>
                  </div>
                )}

                {homeImagesData[editingHomeKey]?.subtitle !== undefined && (
                  <div className="catalog-form-group" style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "700", color: "#0f172a", fontSize: "12.5px" }}>
                      Subtítulo o Frase Descriptiva
                    </label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      style={{ borderRadius: "10px" }}
                      value={formHomeImageSubtitle}
                      onChange={(e) => setFormHomeImageSubtitle(e.target.value)}
                    />
                  </div>
                )}

                {homeImagesData[editingHomeKey]?.buttonText !== undefined && (
                  <div className="catalog-form-group" style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "700", color: "#0f172a", fontSize: "12.5px" }}>
                      Texto del Botón de Acción
                    </label>
                    <input
                      type="text"
                      className="catalog-form-input"
                      style={{ borderRadius: "10px" }}
                      value={formHomeImageButtonText}
                      onChange={(e) => setFormHomeImageButtonText(e.target.value)}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "22px",
                    paddingTop: "16px",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setHomeImageModalOpen(false)}
                    style={{
                      background: "#f8fafc",
                      color: "#475569",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "10px",
                      padding: "11px 20px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #113B3A 0%, #1a5654 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "11px 24px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(17, 59, 58, 0.22)",
                    }}
                  >
                    <i className="bi bi-check2-circle" style={{ color: "#C6AC7F", fontSize: "15px" }}></i>
                    Guardar Cambios
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
