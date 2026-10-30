import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { loadRemoteData, clearRemoteCache } from "../services/remoteData";
import { getCatalogProducts } from "../services/catalogService";
import { DEFAULT_HOME_IMAGES, DEFAULT_ANNOUNCEMENT } from "../services/homeImagesService";
import { getStoredGemstones, getStoredLaboratories } from "../services/gemstonesService";
import { getAllStoredInventory } from "../services/inventoryService";
import { DEFAULT_NOSOTROS_CONTENT } from "../services/nosotrosService";
import { DEFAULT_EDUCACION_POSTS } from "../services/educacionService";
import { DEFAULT_CATEGORY_MARGINS } from "../services/financeService";
import { DEFAULT_PLATINO_CARE_CONFIG } from "../services/platinoCareService";
import { getPermissionsMatrix, getPermissionRequests } from "../services/permissionsService";
import { migrateLegacyBrowserData } from "../services/legacyMigration";

const publicDefaults = {
  catalog: getCatalogProducts(),
  home_images: DEFAULT_HOME_IMAGES,
  announcement: DEFAULT_ANNOUNCEMENT,
  announcement_active: true,
  appointments: [],
  blocked_slots: [],
  gemstones: getStoredGemstones(),
  laboratories: getStoredLaboratories(),
  inventory: getAllStoredInventory(),
  nosotros: DEFAULT_NOSOTROS_CONTENT,
  educacion: DEFAULT_EDUCACION_POSTS,
  finance: DEFAULT_CATEGORY_MARGINS,
  care_config: DEFAULT_PLATINO_CARE_CONFIG,
};

export default function ApiDataBootstrap({ children }) {
  const { user, isSessionReady } = useAuth();
  const [loadedSession, setLoadedSession] = useState(null);
  const userId = user?.id;
  const userEmail = user?.email;
  const userIsAdmin = user?.role === "admin";
  const isMaster = user?.adminType === "master";
  const sessionKey = isSessionReady ? (userId || "guest") : null;

  useEffect(() => {
    if (!isSessionReady) return undefined;
    let active = true;

    const load = async () => {
      if (isMaster) {
        try {
          await migrateLegacyBrowserData();
        } catch (error) {
          console.error("Could not migrate browser data:", error);
          window.dispatchEvent(new CustomEvent("platino_api_error", { detail: { message: error.message } }));
        }
      }
      const defaults = { ...publicDefaults };
      if (userId) {
        defaults.orders = [];
      }
      if (userIsAdmin) {
        defaults.reclamations = [];
        defaults.permissions = getPermissionsMatrix();
        defaults.permission_requests = getPermissionRequests();
        defaults.care_clients = [];
      }
      if (isMaster) {
        defaults.recovery_logs = [];
      }

      const results = await Promise.allSettled(
        Object.entries(defaults).map(([namespace, fallback]) => loadRemoteData(namespace, fallback))
      );
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.warn("Could not preload API data (using default fallback):", result.reason);
        }
      });

      if (userEmail) {
        await loadRemoteData("favorites", [], `favorites_${userEmail.trim().toLowerCase()}`)
          .catch((error) => {
            console.warn("Could not preload account favorites:", error);
          });
      } else {
        clearRemoteCache("orders");
      }
      if (active) setLoadedSession(sessionKey);
    };

    load();
    return () => {
      active = false;
    };
  }, [isSessionReady, userId, userEmail, userIsAdmin, isMaster, sessionKey]);

  if (!sessionKey || loadedSession !== sessionKey) {
    return <div className="api-loading" role="status">Conectando con Platino…</div>;
  }
  return children;
}
