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
  deleteOrder,
  updateOrderPayment,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  getOrderSedeId,
} from "../services/ordersService";
import { METALS, formatPrice } from "../data/products";
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
} from "../services/permissionsService";
import { getReclamaciones } from "../services/reclamacionesService";
import AdminReclamacionesTab from "../components/AdminReclamacionesTab";
import AdminPlatinoCareTab from "../components/AdminPlatinoCareTab";
import AdminGemstonesTab from "../components/AdminGemstonesTab";
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
  const { user, isAdmin, openAuthModal } = useAuth();
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
    return searchParams.get("tab") || "citas";
  }, [location.pathname, searchParams]);

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

  // Estado del Libro de Reclamaciones (INDECOPI)
  const [reclamacionesList, setReclamacionesList] = useState(() => getReclamaciones());

  // Escuchar actualizaciones de permisos, solicitudes y contraseñas en tiempo real
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
    const handleRecUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setReclamacionesList(e.detail);
      } else {
        setReclamacionesList(getReclamaciones());
      }
    };
    window.addEventListener("platino_permissions_updated", handlePermUpdate);
    window.addEventListener("platino_permission_requests_updated", handleReqUpdate);
    window.addEventListener("platino_admin_credentials_updated", handleCredsUpdate);
    window.addEventListener("platino_reclamaciones_updated", handleRecUpdate);
    return () => {
      window.removeEventListener("platino_permissions_updated", handlePermUpdate);
      window.removeEventListener("platino_permission_requests_updated", handleReqUpdate);
      window.removeEventListener("platino_admin_credentials_updated", handleCredsUpdate);
      window.removeEventListener("platino_reclamaciones_updated", handleRecUpdate);
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
  const [formShowDeliveryEstimate, setFormShowDeliveryEstimate] = useState(true);
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
      setFeedbackMsg(`✕ Solicitud rechazada.`);
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  const handleTogglePermission = (targetEmail, permKey, granted) => {
    toggleUserPermission(targetEmail, permKey, granted);
    setPermissionsMatrix(getPermissionsMatrix());
    setFeedbackMsg(`✓ Matriz de permisos actualizada.`);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleSendPermissionRequest = (permKey) => {
    const reason = reasonInputState[permKey] || "";
    const res = requestPermission({
      user: effectiveUser,
      permissionKey,
      reason,
    });
    if (res.success) {
      setPermissionRequests(getPermissionRequests());
      setFeedbackMsg(`📨 Solicitud enviada a Vladimir. Se encuentra en espera de aprobación.`);
      setReasonInputState((prev) => ({ ...prev, [permKey]: "" }));
      setTimeout(() => setFeedbackMsg(""), 4000);
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
    setFormAvailableMetals(METALS.map((m) => m.id));
    setFormSelectedMetal("Oro 18k Blanco");
    setFormShowDeliveryEstimate(initialGroup !== "anillos");
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
    const whiteImg =
      prod.metalImages?.["oro-18k-blanco"] ||
      prod.metalImages?.["plata-950"] ||
      prod.metalImages?.["plata-925"] ||
      prod.metalImages?.["white"] ||
      baseImg;
    const yellowImg =
      prod.metalImages?.["oro-18k-amarillo"] ||
      prod.metalImages?.["oro-18k-natural"] ||
      prod.metalImages?.["yellow"] ||
      "";
    const roseImg =
      prod.metalImages?.["oro-18k-rosa"] ||
      prod.metalImages?.["rose"] ||
      "";

    setFormImage(baseImg);
    setFormImageWhite(whiteImg);
    setFormImageYellow(yellowImg);
    setFormImageRose(roseImg);
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
    setFormAvailableMetals(finalIds.length > 0 ? finalIds : METALS.map((m) => m.id));

    const defaultMetal = prod.selectedMetal || "Oro 18k Blanco";
    setFormSelectedMetal(defaultMetal);
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
        return [...prev, metalId];
      }
    });
  };

  const handleSelectAllMetals = () => {
    setFormAvailableMetals(METALS.map((m) => m.id));
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

  const handleWhiteImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es mayor a 5MB. Por favor elige una imagen más ligera.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormImageWhite(event.target.result);
        setFormImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleYellowImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es mayor a 5MB. Por favor elige una imagen más ligera.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormImageYellow(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoseImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es mayor a 5MB. Por favor elige una imagen más ligera.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormImageRose(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBoxImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es mayor a 5MB. Por favor elige una imagen más ligera.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormBoxImage(event.target.result);
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

    if (formAvailableMetals.length === 0) {
      alert("Por favor selecciona al menos un material disponible para la joya.");
      return;
    }

    const activeMetalsObjects = METALS.filter((m) => formAvailableMetals.includes(m.id));
    const fallbackMetalName = activeMetalsObjects[0]?.name || "Oro 18k Blanco";
    const finalSelectedMetal = activeMetalsObjects.some((m) => m.name === formSelectedMetal)
      ? formSelectedMetal
      : fallbackMetalName;

    const isRingGroup = formCategoryGroup === "anillos";
    const isArosType = formType === "aros" || formCategory === "aros-boda" || formCategory === "aros-alianzas";

    const hasWhite = activeMetalsObjects.some((m) => ["plata-925", "plata-950", "oro-18k-blanco", "platino"].includes(m.id));
    const hasYellow = activeMetalsObjects.some((m) => ["oro-18k-amarillo", "oro-18k-natural", "plata-950-oro-amarillo", "plata-950-oro-natural"].includes(m.id));
    const hasRose = activeMetalsObjects.some((m) => ["oro-18k-rosa", "plata-950-oro-rosa"].includes(m.id));

    // Determinar la foto principal basada en el primer tono activo que tenga foto
    let mainImg = "";
    if (hasWhite && formImageWhite.trim()) {
      mainImg = formImageWhite.trim();
    } else if (hasYellow && formImageYellow.trim()) {
      mainImg = formImageYellow.trim();
    } else if (hasRose && formImageRose.trim()) {
      mainImg = formImageRose.trim();
    } else {
      mainImg = formImageWhite.trim() || formImageYellow.trim() || formImageRose.trim() || formImage.trim() || "/images/cat-compromiso.jpg";
    }

    const whiteImg = formImageWhite.trim() || mainImg;
    const yellowImg = formImageYellow.trim() || mainImg;
    const roseImg = formImageRose.trim() || mainImg;

    // Mapa multimetal idéntico a Brilliant Earth
    const metalImagesMap = {
      "plata-925": whiteImg,
      "plata-950": whiteImg,
      "oro-18k-blanco": whiteImg,
      "platino": whiteImg,
      "oro-18k-amarillo": yellowImg,
      "oro-18k-natural": yellowImg,
      "plata-950-oro-amarillo": yellowImg,
      "plata-950-oro-natural": yellowImg,
      "oro-18k-rosa": roseImg,
      "plata-950-oro-rosa": roseImg,
      white: whiteImg,
      yellow: yellowImg,
      rose: roseImg,
    };

    const finalBoxImage = formBoxImage.trim() || "/images/detail-box-green.jpg";
    const allImagesToInclude = [
      mainImg,
      whiteImg,
      yellowImg,
      roseImg,
      finalBoxImage,
      ...(Array.isArray(editingProduct?.gallery) ? editingProduct.gallery : [])
    ].filter(Boolean);
    const baseGallery = Array.from(new Set(allImagesToInclude));

    const payload = {
      name: formName.trim(),
      subtitle: formSubtitle.trim() || "Platino Perú Colección Exclusiva",
      categories: Array.from(new Set([formCategory, formCategoryGroup, ...(editingProduct?.categories || [])])),
      category: formCategory,
      price: Number(formPrice),
      type: formType,
      hasDoubleSizes: isArosType,
      hasGemSelection: isRingGroup,
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
        p.categories?.includes(catalogFilterCategory) ||
        getProductCategoryGroup(p) === catalogFilterCategory;
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
                onClick={() => setActiveTab("citas")}
              >
                <i className="bi bi-arrow-left"></i> Volver a Citas & Horarios
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizado de la Pestaña de Permisos & Sedes para Vladimir
  const renderPermisosTab = () => {
    if (!isEffectiveMaster) {
      return (
        <div className="admin-content-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "48px", color: "#d97706", marginBottom: "16px" }}>
            <i className="bi bi-shield-lock"></i>
          </div>
          <h2 style={{ fontSize: "22px", color: "#112820", marginBottom: "10px" }}>
            Panel Exclusivo de Vladimir (Master)
          </h2>
          <p style={{ maxWidth: "600px", margin: "0 auto 20px", color: "#556960", fontSize: "14px" }}>
            La gestión global de permisos y resolución de solicitudes es una facultad reservada únicamente para Vladimir (Super Administrador Principal).
          </p>
          <button
            type="button"
            className="btn-perm-back-citas"
            onClick={() => setActiveTab("citas")}
            style={{ margin: "0 auto" }}
          >
            <i className="bi bi-arrow-left"></i> Volver a Citas & Horarios
          </button>
        </div>
      );
    }

    const filteredRequests = permissionRequests.filter((r) => {
      if (requestsFilterStatus === "pendientes") return r.status === "pendiente";
      if (requestsFilterStatus === "aprobadas") return r.status === "aprobado";
      if (requestsFilterStatus === "rechazadas") return r.status === "rechazado";
      return true;
    });

    return (
      <div>
        {/* Sección 1: Bandeja de Solicitudes de Permisos */}
        <div className="admin-content-card" style={{ marginBottom: "26px" }}>
          <div className="section-title-clean" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
            <div>
              <h2 style={{ fontSize: "18px", color: "#112820", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-inbox-fill" style={{ color: "#d97706" }}></i> Bandeja de Solicitudes de Acceso ({permissionRequests.length})
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#61736a" }}>
                Revisa y aprueba o rechaza en tiempo real las solicitudes enviadas por los administradores de sede.
              </p>
            </div>

            {/* Filtros de estado de solicitud */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className={`simulation-btn ${requestsFilterStatus === "pendientes" ? "active" : ""}`}
                style={{ color: requestsFilterStatus === "pendientes" ? "#0d281e" : "#4b5563", background: requestsFilterStatus === "pendientes" ? "#fef3c7" : "#f3f4f6", border: "1px solid #e5e7eb" }}
                onClick={() => setRequestsFilterStatus("pendientes")}
              >
                Pendientes ({pendingRequestsCount})
              </button>
              <button
                type="button"
                className={`simulation-btn ${requestsFilterStatus === "aprobadas" ? "active" : ""}`}
                style={{ color: requestsFilterStatus === "aprobadas" ? "#0d281e" : "#4b5563", background: requestsFilterStatus === "aprobadas" ? "#dcfce7" : "#f3f4f6", border: "1px solid #e5e7eb" }}
                onClick={() => setRequestsFilterStatus("aprobadas")}
              >
                Aprobadas
              </button>
              <button
                type="button"
                className={`simulation-btn ${requestsFilterStatus === "rechazadas" ? "active" : ""}`}
                style={{ color: requestsFilterStatus === "rechazadas" ? "#0d281e" : "#4b5563", background: requestsFilterStatus === "rechazadas" ? "#fee2e2" : "#f3f4f6", border: "1px solid #e5e7eb" }}
                onClick={() => setRequestsFilterStatus("rechazadas")}
              >
                Rechazadas
              </button>
              <button
                type="button"
                className={`simulation-btn ${requestsFilterStatus === "todas" ? "active" : ""}`}
                style={{ color: requestsFilterStatus === "todas" ? "#0d281e" : "#4b5563", background: requestsFilterStatus === "todas" ? "#e0e7ff" : "#f3f4f6", border: "1px solid #e5e7eb" }}
                onClick={() => setRequestsFilterStatus("todas")}
              >
                Todas
              </button>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "8px" }}>
              <i className="bi bi-check-all" style={{ fontSize: "28px", color: "#16a34a", display: "block", marginBottom: "8px" }}></i>
              No hay solicitudes {requestsFilterStatus === "pendientes" ? "pendientes de revisión" : "en esta categoría"}.
            </div>
          ) : (
            <div>
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className={`perm-request-card ${
                    req.status === "pendiente"
                      ? "pending"
                      : req.status === "aprobado"
                      ? "approved"
                      : "rejected"
                  }`}
                >
                  <div className="perm-request-body">
                    <div className="perm-request-header-line">
                      <span className="perm-req-user-name">
                        {req.userName}
                      </span>
                      <span className="perm-req-target-pill">
                        <i className="bi bi-geo-alt-fill"></i> {req.userSedeLabel}
                      </span>
                      <span style={{ fontSize: "12px", background: "#f3f4f6", padding: "2px 8px", borderRadius: "6px", color: "#374151", fontWeight: "600" }}>
                        Permiso: {req.permissionName}
                      </span>
                      {req.status === "aprobado" && (
                        <span style={{ fontSize: "11.5px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                          ✓ Aprobado
                        </span>
                      )}
                      {req.status === "rechazado" && (
                        <span style={{ fontSize: "11.5px", background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                          ✕ Rechazado
                        </span>
                      )}
                    </div>

                    <div className="perm-req-reason">
                      <strong>Motivo indicado:</strong> "{req.reason}"
                    </div>

                    <div className="perm-req-meta">
                      <span>
                        <i className="bi bi-envelope"></i> {req.userEmail}
                      </span>
                      <span>
                        <i className="bi bi-clock"></i> Enviada:{" "}
                        {new Date(req.createdAt).toLocaleString("es-PE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      {req.resolvedAt && (
                        <span>
                          <i className="bi bi-check2-circle"></i> Resuelta por: {req.resolvedBy} (
                          {new Date(req.resolvedAt).toLocaleString("es-PE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })})
                        </span>
                      )}
                    </div>
                  </div>

                  {req.status === "pendiente" && (
                    <div className="perm-request-actions">
                      <button
                        type="button"
                        className="btn-perm-approve"
                        onClick={() => handleApproveRequest(req.id)}
                        title="Otorgar este permiso inmediatamente"
                      >
                        <i className="bi bi-check-lg"></i> Aprobar Permiso
                      </button>
                      <button
                        type="button"
                        className="btn-perm-reject"
                        onClick={() => handleRejectRequest(req.id)}
                        title="Rechazar solicitud"
                      >
                        <i className="bi bi-x-lg"></i> Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección 2: Matriz Interactiva de Permisos */}
        <div className="admin-content-card" style={{ marginBottom: "26px" }}>
          <div className="section-title-clean" style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", color: "#112820", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bi bi-grid-3x3-gap-fill" style={{ color: "#137748" }}></i> Matriz de Permisos por Administrador
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#61736a" }}>
              Activa o desactiva directamente cualquier permiso con los interruptores. Los cambios surten efecto de inmediato.
            </p>
          </div>

          <div className="perm-matrix-wrapper">
            <table className="admin-perm-matrix-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "220px" }}>Administrador</th>
                  <th style={{ minWidth: "140px" }}>Sede</th>
                  {PERMISSIONS_CATALOG.map((p) => (
                    <th key={p.key} title={p.description} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                        <i className={`bi ${p.icon}`} style={{ fontSize: "16px", color: "#137748" }}></i>
                        <span style={{ fontSize: "11px" }}>{p.shortLabel}</span>
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
                    <tr key={acc.email} style={{ background: isMaster ? "#fffdf5" : "inherit" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "20px" }}>{acc.avatarBadge}</span>
                          <div>
                            <strong style={{ fontSize: "13.5px", color: "#112820" }}>{acc.name}</strong>
                            <div style={{ fontSize: "11.5px", color: "#6b7280" }}>{acc.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "11.5px", background: isMaster ? "#fef3c7" : "#e8f5ed", color: isMaster ? "#92400e" : "#137748", padding: "3px 8px", borderRadius: "12px", fontWeight: "600" }}>
                          {acc.sedeLabel}
                        </span>
                      </td>

                      {PERMISSIONS_CATALOG.map((p) => {
                        const hasThis = isMaster || userPerms.includes(p.key);

                        return (
                          <td key={p.key} style={{ textAlign: "center" }}>
                            {isMaster ? (
                              <span
                                title="Vladimir tiene control maestro permanente"
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                              >
                                <i className="bi bi-shield-check"></i> Total
                              </span>
                            ) : (
                              <label className="perm-switch-toggle">
                                <input
                                  type="checkbox"
                                  checked={hasThis}
                                  onChange={(e) =>
                                    handleTogglePermission(acc.email, p.key, e.target.checked)
                                  }
                                  title={`${hasThis ? "Revocar" : "Conceder"} ${p.name} a ${acc.name}`}
                                />
                              </label>
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

        {/* Sección 3: Gestión de Contraseñas y Accesos de Sedes */}
        <div className="admin-content-card" style={{ background: "#faf8f5", border: "1.5px solid #ebd9c2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "17px", color: "#112820", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-key-fill" style={{ color: "#b8860b" }}></i> Gestión de Contraseñas & Cuentas de Sedes
              </h3>
              <p style={{ fontSize: "13px", color: "#556960", margin: 0 }}>
                Como Administrador Principal, puedes visualizar, copiar y cambiar las contraseñas de las administraciones de <strong>Lima Centro</strong> y <strong>Miraflores</strong> en cualquier momento.
              </p>
            </div>
          </div>

          {passwordChangeFeedback && (
            <div
              style={{
                background: "#dcfce7",
                border: "1.5px solid #86efac",
                color: "#166534",
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "13.5px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="bi bi-check-circle-fill" style={{ fontSize: "18px" }}></i>
              {passwordChangeFeedback}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "16px" }}>
            {adminAccountsList.map((acc) => {
              const isMaster = acc.adminType === "master";
              const isEditing = editingPasswordEmail === acc.email;
              const isVisible = showPasswordMap[acc.email];
              const isCopied = copiedEmail === acc.email;

              return (
                <div
                  key={acc.email}
                  style={{
                    background: "#ffffff",
                    padding: "18px 20px",
                    borderRadius: "10px",
                    border: isEditing ? "2px solid #b8860b" : "1px solid #e5e0d6",
                    boxShadow: isEditing ? "0 4px 14px rgba(184, 134, 11, 0.12)" : "0 2px 5px rgba(0,0,0,0.03)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "22px" }}>{acc.avatarBadge}</span>
                      <div>
                        <strong style={{ fontSize: "14.5px", color: "#112820", display: "block" }}>
                          {acc.name}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>{acc.sedeLabel}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        background: isMaster ? "#fef3c7" : "#e8f5ed",
                        color: isMaster ? "#92400e" : "#137748",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontWeight: "700",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {isMaster ? "👑 Master" : "🏛️ Sede"}
                    </span>
                  </div>

                  <div style={{ fontSize: "12.5px", color: "#4b5563", marginBottom: "8px" }}>
                    <strong>Correo de acceso:</strong> <code style={{ fontSize: "12px", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>{acc.email}</code>
                  </div>

                  <div style={{ fontSize: "12.5px", color: "#4b5563", marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <strong>Contraseña activa:</strong>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleShowPassword(acc.email)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#137748",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: "2px 4px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: "600",
                          }}
                          title={isVisible ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          <i className={`bi ${isVisible ? "bi-eye-slash" : "bi-eye"}`}></i>
                          {isVisible ? "Ocultar" : "Mostrar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyPassword(acc.email, acc.password)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isCopied ? "#16a34a" : "#6b7280",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: "2px 4px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: "600",
                          }}
                          title="Copiar contraseña al portapapeles"
                        >
                          <i className={`bi ${isCopied ? "bi-check2" : "bi-clipboard"}`}></i>
                          {isCopied ? "¡Copiada!" : "Copiar"}
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "#111827",
                        fontWeight: "700",
                        letterSpacing: isVisible ? "normal" : "2px",
                      }}
                    >
                      {isVisible ? acc.password : "••••••••••••"}
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", padding: "12px", borderRadius: "8px", marginTop: "10px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#92400e", marginBottom: "6px" }}>
                        Nueva contraseña para {acc.name}:
                      </label>
                      <input
                        type="text"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Escribe la nueva contraseña..."
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          border: "1.5px solid #d97706",
                          borderRadius: "6px",
                          fontSize: "13px",
                          marginBottom: "8px",
                          fontFamily: "monospace",
                          outline: "none",
                        }}
                        autoFocus
                      />

                      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                        <button
                          type="button"
                          onClick={() => handleGeneratePassword(acc.sede)}
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            background: "#ffffff",
                            border: "1px solid #d97706",
                            color: "#92400e",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                          }}
                        >
                          <i className="bi bi-magic"></i> Generar clave segura
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleSavePassword(acc.email, acc.name)}
                          style={{
                            flex: 2,
                            padding: "8px 12px",
                            background: "#137748",
                            border: "none",
                            color: "#ffffff",
                            borderRadius: "6px",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <i className="bi bi-check2"></i> Guardar Nueva Clave
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditPassword}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: "#e5e7eb",
                            border: "none",
                            color: "#374151",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEditPassword(acc.email)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: isMaster ? "#f8fafc" : "#eef6f1",
                        border: isMaster ? "1px solid #cbd5e1" : "1.5px solid #a4d4b8",
                        color: isMaster ? "#475569" : "#137748",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <i className="bi bi-pencil-square"></i> Cambiar Contraseña de {acc.sedeLabel || acc.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
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
                  ? "Gestión de Permisos & Sedes (Panel de Vladimir)"
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
                ? "Supervisa autorizaciones, aprueba solicitudes de administradores de sede y administra la matriz de accesos."
                : activeTab === "reclamaciones"
                ? "Auditoría oficial del Libro de Reclamaciones conforme a la Ley N° 29571. Revisa quejas y reclamos y registra la respuesta legal del proveedor (plazo máximo: 15 días hábiles)."
                : activeTab === "platino_care"
                ? "Configura las coberturas del programa de garantía oficial Platino Care, precios y planes visibles en la tienda."
                : activeTab === "gemas"
                ? "Crea y administra gemas con atributos GIA/IGI, pureza, quilates, dimensiones, corte y fotografías de alta resolución."
                : "Gestiona reservas, revisa observaciones de clientes y bloquea u habilita horarios de atención."}
            </p>
          </div>

          <div className="admin-top-actions">
            {isMaster && activeTab !== "gemas" && (
              <button
                type="button"
                onClick={() => setActiveTab("gemas")}
                className="admin-view-store-btn"
                style={{
                  background: "#113B3A",
                  borderColor: "#113B3A",
                  color: "#ffffff",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-gem" style={{ color: "#C6AC7F" }}></i>
                Gemas & Diamantes
              </button>
            )}
            {isMaster && activeTab === "gemas" && (
              <button
                type="button"
                onClick={() => setActiveTab("citas")}
                className="admin-view-store-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-arrow-left"></i>
                Volver a Citas & Horarios
              </button>
            )}
            {isMaster && activeTab !== "reclamaciones" && activeTab !== "platino_care" && activeTab !== "gemas" && (
              <button
                type="button"
                onClick={() => setActiveTab("reclamaciones")}
                className="admin-view-store-btn"
                style={{
                  background: "#113B3A",
                  borderColor: "#113B3A",
                  color: "#ffffff",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-book-half" style={{ color: "#C6AC7F" }}></i>
                Libro de Reclamaciones
                {reclamacionesList.filter((r) => r.estado === "pendiente").length > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {reclamacionesList.filter((r) => r.estado === "pendiente").length}
                  </span>
                )}
              </button>
            )}
            {isMaster && activeTab === "reclamaciones" && (
              <button
                type="button"
                onClick={() => setActiveTab("citas")}
                className="admin-view-store-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-arrow-left"></i>
                Volver a Citas & Horarios
              </button>
            )}
            <Link to="/" className="admin-view-store-btn" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-box-arrow-up-right"></i> Ver Tienda Pública
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
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#d97706", background: "#fef3c7" }}>
                <i className="bi bi-shield-shaded"></i>
              </div>
              <div>
                <h3 className="metric-val">3</h3>
                <p className="metric-lbl">Cuentas Oficiales (Vladimir + 2 Sedes)</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#b91c1c", background: "#fee2e2" }}>
                <i className="bi bi-bell-fill"></i>
              </div>
              <div>
                <h3 className="metric-val" style={{ color: "#b91c1c" }}>{pendingRequestsCount}</h3>
                <p className="metric-lbl">Solicitudes Pendientes</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#166e37", background: "#e8f6ed" }}>
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">{permissionRequests.filter((r) => r.status === "aprobado").length}</h3>
                <p className="metric-lbl">Solicitudes Aprobadas</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box" style={{ color: "#32638e", background: "#edf4fb" }}>
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <div>
                <h3 className="metric-val">2 Sedes</h3>
                <p className="metric-lbl">Lima Centro y Miraflores</p>
              </div>
            </div>
          </div>
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
                        <Link
                          to={`/producto/${prod.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-card-view"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #113B3A",
                            background: "#ffffff",
                            color: "#113B3A",
                            fontSize: "12px",
                            fontWeight: "600",
                            textDecoration: "none"
                          }}
                          title="Ver producto en la tienda y portafolio de fotos"
                        >
                          <i className="bi bi-box-arrow-up-right"></i> Ver en Tienda
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInventoryProductId(prod.id);
                            setActiveTab("inventario");
                          }}
                          className="btn-card-inventory"
                          title="Gestionar stock de Bodega y Sedes por Tallas"
                        >
                          <i className="bi bi-boxes"></i> Stock por Tallas
                        </button>

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
          <div className="admin-content-card">
            {/* Cabecera del panel de pedidos */}
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
                  Control de Pedidos y Fabricación en Taller ({filteredOrders.length})
                </h3>
                <p style={{ fontSize: "14px", color: "#5d6d65", margin: 0 }}>
                  Actualiza en qué fase se encuentra cada joya (Taller, Engaste, Calidad, Envío). Los clientes ven estos cambios inmediatamente en su portal de seguimiento.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  to="/mis-pedidos"
                  target="_blank"
                  className="btn-cita-outline"
                  style={{ background: "#f8f7f4", padding: "10px 16px", fontSize: "13px" }}
                  title="Abrir el portal del cliente para verificar la vista del usuario"
                >
                  <i className="bi bi-box-arrow-up-right"></i> Ver Portal Cliente (Camila)
                </Link>
              </div>
            </div>


            {/* Barra de Filtros y Búsqueda de Pedidos */}
            <div className="admin-orders-controls">
              <div className="admin-orders-toolbar">
                <div className="admin-orders-search">
                  <i className="bi bi-search" style={{ color: "#8c9791" }}></i>
                  <input
                    type="text"
                    placeholder="Buscar por código (PLT-2026), cliente, correo o joya..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                  />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery("")}
                      style={{ border: "none", background: "transparent", color: "#888", cursor: "pointer" }}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                </div>

                <div className="admin-client-quickfilter">
                  <button
                    type="button"
                    className={`btn-filter-tag camila-highlight ${orderClientFilter === "camila" ? "active" : ""}`}
                    onClick={() => setOrderClientFilter(orderClientFilter === "camila" ? "todos" : "camila")}
                  >
                    <i className="bi bi-star-fill"></i> Solo Cliente Prueba (Camila Mendoza)
                  </button>

                  <button
                    type="button"
                    className={`btn-filter-tag ${orderStageFilter === "todos" && orderClientFilter === "todos" ? "active" : ""}`}
                    onClick={() => {
                      setOrderStageFilter("todos");
                      setOrderClientFilter("todos");
                    }}
                  >
                    Todos ({effectiveSedeOrders.length})
                  </button>
                </div>
              </div>

              {/* Filtro por Etapas de Fabricación */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #eee8df" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#596660", alignSelf: "center", marginRight: "4px" }}>
                  Fase:
                </span>
                {ORDER_STAGES.map((stg) => {
                  const count = effectiveSedeOrders.filter((o) => o.stage === stg.id).length;
                  const isActive = orderStageFilter === stg.id;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      className={`btn-filter-tag ${isActive ? "active" : ""}`}
                      onClick={() => setOrderStageFilter(isActive ? "todos" : stg.id)}
                      style={{ fontSize: "12px" }}
                    >
                      <i className={`bi ${stg.icon}`}></i> {stg.shortLabel} ({count})
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
                  Prueba cambiando la búsqueda o restableciendo los filtros de etapa y cliente.
                </p>
                <button
                  type="button"
                  className="btn-cita-outline"
                  onClick={() => {
                    setOrderStageFilter("todos");
                    setOrderClientFilter("todos");
                    setOrderSearchQuery("");
                  }}
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const currentStageInfo = getOrderStageInfo(order.stage);
                const isCamila = order.clientEmail.toLowerCase() === "cliente@platino.pe";
                const isEditingThisNote = activeEditingNoteId === order.id;

                return (
                  <article key={order.id} className={`admin-order-card ${isCamila ? "is-camila" : ""}`}>
                    {/* Top Bar del Pedido */}
                    <div className="admin-order-top">
                      <div className="admin-order-client-info">
                        <div className="admin-order-client-avatar">
                          {order.clientName ? order.clientName.charAt(0) : "C"}
                        </div>
                        <div>
                          <div className="admin-order-client-name">
                            <span>{order.clientName}</span>
                            {isCamila && (
                              <span
                                style={{
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  fontSize: "11px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontWeight: "700",
                                }}
                              >
                                ★ Cuenta de Prueba
                              </span>
                            )}
                          </div>
                          <div className="admin-order-client-contact">
                            <span>{order.clientEmail}</span> • <span>{order.clientPhone}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f2a24", fontFamily: "monospace" }}>
                            {order.id}
                          </span>
                          <div style={{ fontSize: "12px", color: "#788780" }}>
                            Fecha: {order.date}
                          </div>
                        </div>

                        <span className={`order-status-badge ${currentStageInfo.badgeClass}`}>
                          <i className={`bi ${currentStageInfo.icon}`}></i>
                          {currentStageInfo.label}
                        </span>

                        <a
                          href={`https://wa.me/${(order.clientPhone || "").replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(order.clientName)},%20te%20escribimos%20de%20Platino%20Perú%20respecto%20a%20tu%20pedido%20${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-order-action whatsapp"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <i className="bi bi-whatsapp"></i> WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* CONTROL CLAVE: SELECTOR DE PROCESO DE FABRICACIÓN (Lo que pidió el usuario) */}
                    <div className="admin-stage-selector-box">
                      <div className="admin-stage-label-group">
                        <i className="bi bi-gear-wide-connected" style={{ fontSize: "18px", color: "#0f2a24" }}></i>
                        <div>
                          <label htmlFor={`stage-select-${order.id}`}>
                            Etapa / Proceso Actual de Fabricación:
                          </label>
                          <div style={{ fontSize: "12px", color: "#64746d" }}>
                            Al cambiar esta opción, se actualiza automáticamente el portal del cliente.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <select
                          id={`stage-select-${order.id}`}
                          value={order.stage}
                          onChange={(e) => handleUpdateOrderStage(order.id, e.target.value)}
                          className="admin-stage-select"
                        >
                          {ORDER_STAGES.map((stg) => (
                            <option key={stg.id} value={stg.id}>
                              Paso {stg.stepNumber}: {stg.label} ({stg.shortLabel})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Botones Rápidos de Avance de Etapa */}
                    <div style={{ padding: "0 20px 14px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#6c7873", marginRight: "4px" }}>
                        Cambio rápido:
                      </span>
                      {ORDER_STAGES.map((stg) => {
                        const isCurrent = order.stage === stg.id;
                        return (
                          <button
                            key={stg.id}
                            type="button"
                            onClick={() => handleUpdateOrderStage(order.id, stg.id)}
                            style={{
                              border: isCurrent ? "2px solid #0f2a24" : "1px solid #dcd7ce",
                              background: isCurrent ? "#0f2a24" : "#ffffff",
                              color: isCurrent ? "#ffffff" : "#3e4a45",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: isCurrent ? "700" : "500",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <i className={`bi ${stg.icon}`}></i> {stg.stepNumber}. {stg.shortLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Editor de Notas del Taller (Admin -> Cliente) */}
                    <div className="admin-notes-editor">
                      <div style={{ background: "#f8faf9", border: "1px solid #e1ebe5", borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#0f2a24", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <i className="bi bi-chat-left-text" style={{ color: "#137748" }}></i>
                            Nota Oficial del Taller visible para el Cliente:
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
                                border: "none",
                                background: "transparent",
                                color: "#137748",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              <i className="bi bi-pencil"></i> Editar Nota
                            </button>
                          )}
                        </div>

                        {isEditingThisNote ? (
                          <div>
                            <textarea
                              className="admin-notes-textarea"
                              value={orderNotesState[order.id] !== undefined ? orderNotesState[order.id] : order.adminNotes || ""}
                              onChange={(e) =>
                                setOrderNotesState({
                                  ...orderNotesState,
                                  [order.id]: e.target.value,
                                })
                              }
                              placeholder="Escribe la actualización que leerá el cliente en su pantalla (ej: Montura en oro rosa fundida, diamante engastado en 4 uñas)..."
                            />
                            <div className="admin-notes-actions">
                              <button
                                type="button"
                                onClick={() => setActiveEditingNoteId(null)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#788780",
                                  padding: "6px 12px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  marginRight: "6px",
                                }}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="btn-save-note"
                                onClick={() => handleSaveOrderNote(order.id)}
                              >
                                <i className="bi bi-check2"></i> Guardar Nota para el Cliente
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: "13px", color: "#3a4741", fontStyle: order.adminNotes ? "normal" : "italic" }}>
                            {order.adminNotes || "Sin notas adicionales registradas."}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Detalle de Productos en la Orden */}
                    <div style={{ padding: "0 20px 16px" }}>
                      <div style={{ background: "#ffffff", border: "1px solid #eeebe5", borderRadius: "8px", padding: "14px 16px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#788780", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                          Piezas de Joyería en este Pedido ({order.items.length}):
                        </div>
                        {order.items.map((it, iIdx) => (
                          <div
                            key={iIdx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                              paddingBottom: iIdx === order.items.length - 1 ? 0 : "10px",
                              marginBottom: iIdx === order.items.length - 1 ? 0 : "10px",
                              borderBottom: iIdx === order.items.length - 1 ? "none" : "1px solid #f2eee8",
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
                                border: "1px solid #e2ddd3",
                                background: "#faf8f5",
                              }}
                              onError={(e) => {
                                e.currentTarget.src = "/images/secret-garden-white.jpg";
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <strong style={{ fontSize: "14px", color: "#0f2a24", display: "block" }}>
                                {it.name}
                              </strong>
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "12px", color: "#5d6d65", marginTop: "2px" }}>
                                {it.metal && (
                                  <span style={{ background: "#f1ede6", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                                    {it.metal}
                                  </span>
                                )}
                                {it.size && (
                                  <span style={{ background: "#f1ede6", padding: "2px 6px", borderRadius: "4px" }}>
                                    Talla: {it.size}
                                  </span>
                                )}
                                {it.engraving && (
                                  <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                    <i className="bi bi-pen-fill" style={{ marginRight: "3px" }}></i>
                                    Grabado: «{it.engraving}»
                                  </span>
                                )}
                                {(it.needsSizeAdvice || (typeof it.size === "string" && it.size.toLowerCase().includes("asesor"))) && (
                                  <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                    <i className="bi bi-info-circle-fill" style={{ marginRight: "3px" }}></i>
                                    Asesoría Medida
                                  </span>
                                )}
                                {it.gemstone && (
                                  <span>{it.gemstone}</span>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f2a24" }}>
                                {formatPrice(it.price * (it.quantity || 1))}
                              </span>
                              <div style={{ fontSize: "11px", color: "#8a9690" }}>
                                Cant: {it.quantity || 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer de la Tarjeta del Pedido */}
                    <div className="order-card-footer" style={{ background: "#faf8f5", padding: "12px 20px" }}>
                      <div className="order-footer-details">
                        <div className="order-footer-item">
                          <i className="bi bi-geo-alt" style={{ color: "#0f2a24" }}></i>
                          <span>
                            {order.deliveryType === "recojo_sede"
                              ? `Retiro: ${order.sedeRecojo}`
                              : `Envío: ${order.shippingAddress || "Domicilio registrado"}`}
                          </span>
                        </div>

                        {order.deliveryDays && (
                          <div className="order-footer-item">
                            <i className="bi bi-clock-history" style={{ color: order.deliveryDays === 7 ? "#b45309" : "#15803d" }}></i>
                            <span style={{ fontWeight: "600", color: order.deliveryDays === 7 ? "#b45309" : "#15803d" }}>
                              {order.deliveryDays === 7 ? "Plazo: 7 días hábiles (Ajuste Taller)" : "Plazo: 2 días hábiles (Exprés)"}
                            </span>
                          </div>
                        )}

                        <div className="order-footer-item">
                          <i className="bi bi-credit-card" style={{ color: "#0f2a24" }}></i>
                          <span>{order.paymentMethod || "Pasarela Web"}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="btn-card-delete"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          title="Eliminar este pedido del sistema"
                        >
                          <i className="bi bi-trash"></i> Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
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
            TAB 7: LIBRO DE RECLAMACIONES (EXCLUSIVO VLADIMIR MASTER)
            ======================================================== */}
        {activeTab === "reclamaciones" && (
          <AdminReclamacionesTab isMaster={isEffectiveMaster} />
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

                {/* 4. SEGUNDO: FOTOGRAFÍAS DINÁMICAS SEGÚN LOS MATERIALES SELECCIONADOS */}
                {(() => {
                  const selectedWhiteMetals = METALS.filter(
                    (m) =>
                      formAvailableMetals.includes(m.id) &&
                      ["plata-925", "plata-950", "oro-18k-blanco", "platino"].includes(m.id)
                  );
                  const selectedYellowMetals = METALS.filter(
                    (m) =>
                      formAvailableMetals.includes(m.id) &&
                      ["oro-18k-amarillo", "oro-18k-natural", "plata-950-oro-amarillo", "plata-950-oro-natural"].includes(m.id)
                  );
                  const selectedRoseMetals = METALS.filter(
                    (m) =>
                      formAvailableMetals.includes(m.id) &&
                      ["oro-18k-rosa", "plata-950-oro-rosa"].includes(m.id)
                  );

                  const activeTonesCount =
                    (selectedWhiteMetals.length > 0 ? 1 : 0) +
                    (selectedYellowMetals.length > 0 ? 1 : 0) +
                    (selectedRoseMetals.length > 0 ? 1 : 0);

                  return (
                    <div className="metal-photos-box">
                      <div className="metal-photos-header">
                        <div className="metal-photos-title">
                          <i className="bi bi-palette-fill"></i>
                          <span>
                            4. Fotografías Requeridas por Material ({activeTonesCount}{" "}
                            {activeTonesCount === 1 ? "foto requerida" : "fotos requeridas"})
                          </span>
                        </div>
                        <span className="metal-photos-badge">
                          <i className="bi bi-stars"></i> Dinámico según selección del paso 3
                        </span>
                      </div>

                      <p style={{ fontSize: "12px", color: "#5a6860", margin: 0, lineHeight: 1.45 }}>
                        {activeTonesCount === 0
                          ? "👆 Por favor selecciona al menos un material en el paso 3 para configurar las fotografías de esta joya."
                          : "Solo se muestran las fotografías para los tonos de metal que marcaste arriba. Cada foto cambiará dinámicamente en la tienda en el mismo ángulo exacto."}
                      </p>

                      {activeTonesCount > 0 && (
                        <div className={`metal-photos-grid count-${activeTonesCount}`}>
                          {/* Tarjeta 1: Metales Blancos / Plata / Platino */}
                          {selectedWhiteMetals.length > 0 && (
                            <div className="metal-photo-card primary">
                              <div className="metal-photo-card-head">
                                <span className="metal-photo-card-title">
                                  🤍 Metales Blancos / Plata
                                </span>
                                <div
                                  className="metal-photo-card-swatches"
                                  title={selectedWhiteMetals.map((m) => m.name).join(", ")}
                                >
                                  {selectedWhiteMetals.map((m) => (
                                    <span
                                      key={m.id}
                                      className="metal-photo-swatch-dot"
                                      style={{ background: m.color }}
                                      title={m.name}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {selectedWhiteMetals.map((m) => (
                                  <span
                                    key={m.id}
                                    style={{
                                      fontSize: "10.5px",
                                      background: "#e8eaeb",
                                      color: "#1c2b23",
                                      padding: "2px 7px",
                                      borderRadius: "10px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {m.name}
                                  </span>
                                ))}
                              </div>

                              <div className="metal-photo-preview">
                                {formImageWhite ? (
                                  <img
                                    src={formImageWhite}
                                    alt="Vista previa metal blanco"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/images/cat-compromiso.jpg";
                                    }}
                                  />
                                ) : (
                                  <div className="metal-photo-preview-placeholder">
                                    <i className="bi bi-image" style={{ fontSize: "24px" }}></i>
                                    <span>Sin imagen cargada</span>
                                  </div>
                                )}
                              </div>

                              <div className="metal-photo-inputs">
                                <label>Ruta o URL:</label>
                                <input
                                  type="text"
                                  className="catalog-form-input"
                                  style={{ fontSize: "12px", padding: "7px 10px" }}
                                  placeholder="/images/joya-blanco.jpg o https://..."
                                  value={formImageWhite}
                                  onChange={(e) => {
                                    setFormImageWhite(e.target.value);
                                    setFormImage(e.target.value);
                                  }}
                                  required
                                />

                                <label className="btn-upload-metal-file">
                                  <i className="bi bi-cloud-arrow-up-fill"></i> Subir foto metal blanco / plata
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleWhiteImageFileUpload}
                                    style={{ display: "none" }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Tarjeta 2: Oro Amarillo / Natural */}
                          {selectedYellowMetals.length > 0 && (
                            <div className="metal-photo-card">
                              <div className="metal-photo-card-head">
                                <span className="metal-photo-card-title">
                                  💛 Oro Amarillo / Natural
                                </span>
                                <div
                                  className="metal-photo-card-swatches"
                                  title={selectedYellowMetals.map((m) => m.name).join(", ")}
                                >
                                  {selectedYellowMetals.map((m) => (
                                    <span
                                      key={m.id}
                                      className="metal-photo-swatch-dot"
                                      style={{ background: m.color }}
                                      title={m.name}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {selectedYellowMetals.map((m) => (
                                  <span
                                    key={m.id}
                                    style={{
                                      fontSize: "10.5px",
                                      background: "#fdf3d8",
                                      color: "#6b5109",
                                      padding: "2px 7px",
                                      borderRadius: "10px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {m.name}
                                  </span>
                                ))}
                              </div>

                              <div className="metal-photo-preview">
                                {formImageYellow ? (
                                  <img
                                    src={formImageYellow}
                                    alt="Vista previa oro amarillo"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = formImageWhite || "/images/cat-compromiso.jpg";
                                    }}
                                  />
                                ) : (
                                  <div className="metal-photo-preview-placeholder">
                                    <i className="bi bi-circle-half" style={{ fontSize: "22px", color: "#d7b355" }}></i>
                                    <span style={{ fontSize: "11px" }}>Usa foto blanca por defecto si no se sube</span>
                                  </div>
                                )}
                              </div>

                              <div className="metal-photo-inputs">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <label>Ruta o URL:</label>
                                  {formImageYellow && (
                                    <button
                                      type="button"
                                      onClick={() => setFormImageYellow("")}
                                      style={{ background: "none", border: "none", color: "#c0392b", fontSize: "11px", cursor: "pointer", padding: 0 }}
                                    >
                                      <i className="bi bi-x"></i> Quitar
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  className="catalog-form-input"
                                  style={{ fontSize: "12px", padding: "7px 10px" }}
                                  placeholder="/images/joya-amarillo.jpg (Opcional)"
                                  value={formImageYellow}
                                  onChange={(e) => setFormImageYellow(e.target.value)}
                                />

                                <label className="btn-upload-metal-file" style={{ borderColor: "#d7b355", color: "#876611", background: "#fdfaf2" }}>
                                  <i className="bi bi-cloud-arrow-up-fill"></i> Subir foto oro amarillo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleYellowImageFileUpload}
                                    style={{ display: "none" }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Tarjeta 3: Oro Rosa */}
                          {selectedRoseMetals.length > 0 && (
                            <div className="metal-photo-card">
                              <div className="metal-photo-card-head">
                                <span className="metal-photo-card-title">
                                  🌸 Oro Rosa
                                </span>
                                <div
                                  className="metal-photo-card-swatches"
                                  title={selectedRoseMetals.map((m) => m.name).join(", ")}
                                >
                                  {selectedRoseMetals.map((m) => (
                                    <span
                                      key={m.id}
                                      className="metal-photo-swatch-dot"
                                      style={{ background: m.color }}
                                      title={m.name}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {selectedRoseMetals.map((m) => (
                                  <span
                                    key={m.id}
                                    style={{
                                      fontSize: "10.5px",
                                      background: "#fdeee8",
                                      color: "#843b22",
                                      padding: "2px 7px",
                                      borderRadius: "10px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {m.name}
                                  </span>
                                ))}
                              </div>

                              <div className="metal-photo-preview">
                                {formImageRose ? (
                                  <img
                                    src={formImageRose}
                                    alt="Vista previa oro rosa"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = formImageWhite || "/images/cat-compromiso.jpg";
                                    }}
                                  />
                                ) : (
                                  <div className="metal-photo-preview-placeholder">
                                    <i className="bi bi-circle-half" style={{ fontSize: "22px", color: "#dca188" }}></i>
                                    <span style={{ fontSize: "11px" }}>Usa foto blanca por defecto si no se sube</span>
                                  </div>
                                )}
                              </div>

                              <div className="metal-photo-inputs">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <label>Ruta o URL:</label>
                                  {formImageRose && (
                                    <button
                                      type="button"
                                      onClick={() => setFormImageRose("")}
                                      style={{ background: "none", border: "none", color: "#c0392b", fontSize: "11px", cursor: "pointer", padding: 0 }}
                                    >
                                      <i className="bi bi-x"></i> Quitar
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  className="catalog-form-input"
                                  style={{ fontSize: "12px", padding: "7px 10px" }}
                                  placeholder="/images/joya-rosa.jpg (Opcional)"
                                  value={formImageRose}
                                  onChange={(e) => setFormImageRose(e.target.value)}
                                />

                                <label className="btn-upload-metal-file" style={{ borderColor: "#dca188", color: "#9e5539", background: "#fdf8f6" }}>
                                  <i className="bi bi-cloud-arrow-up-fill"></i> Subir foto oro rosa
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleRoseImageFileUpload}
                                    style={{ display: "none" }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 5. CAJA / ESTUCHE DE PRESENTACIÓN DE LA JOYA */}
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
                      <strong style={{ fontSize: "14px", color: "#113B3A" }}>5. Caja de Presentación / Estuche del Producto</strong>
                    </div>
                    <span style={{ fontSize: "11px", background: "#edf5f0", color: "#113B3A", padding: "3px 8px", borderRadius: "4px", fontWeight: "600" }}>
                      Visible en Portafolio y Paso 2
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", color: "#5d6d65", margin: "0 0 14px", lineHeight: "1.45" }}>
                    Configura la foto de la caja o estuche de regalo que se agregará al portafolio de la joya y se mostrará al cliente en el <strong>Paso 2: Complementos y Estuche</strong>.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", alignItems: "center" }}>
                    {/* Vista previa de la caja */}
                    <div style={{ width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid #dcd7ce", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={formBoxImage || "/images/detail-box-green.jpg"}
                        alt="Caja de presentación"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/detail-box-green.jpg"; }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
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

                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                          type="text"
                          className="catalog-form-input"
                          style={{ fontSize: "12px", padding: "8px 12px", flex: 1 }}
                          placeholder="Ruta o URL de la caja (Ej. /images/detail-box-green.jpg)"
                          value={formBoxImage}
                          onChange={(e) => setFormBoxImage(e.target.value)}
                        />
                        <label style={{
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

                {/* 6. Tiempo de Entrega Rápida (Opcional para Accesorios) */}
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
                          6. Mostrar Tarjeta de Tiempo de Entrega Rápida (2 o 7 días)
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
