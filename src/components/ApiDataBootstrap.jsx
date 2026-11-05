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
import platinoLogoWordmark from "../assets/platino-peru-logo.png?inline";

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
          console.warn("Could not migrate browser data (non-fatal):", error);
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
    return (
      <div
        className="platino-preloader-screen"
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          background: "linear-gradient(180deg, #fdfbf7 0%, #f6f1e8 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "360px",
            textAlign: "center",
          }}
        >
          {/* Logo Oficial de Platino Perú */}
          <div
            style={{
              marginBottom: "26px",
              animation: "platinoPulse 2s ease-in-out infinite",
            }}
          >
            <img
              src={platinoLogoWordmark}
              alt="Platino Perú"
              style={{
                height: "44px",
                width: "auto",
                display: "block",
                filter: "drop-shadow(0 2px 8px rgba(17, 59, 58, 0.08))",
              }}
            />
          </div>

          {/* Barra de progreso de lujo dorada/verde */}
          <div
            style={{
              width: "160px",
              height: "3px",
              background: "rgba(198, 172, 127, 0.25)",
              borderRadius: "999px",
              overflow: "hidden",
              marginBottom: "16px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "100%",
                background: "linear-gradient(90deg, #C6AC7F 0%, #113B3A 50%, #C6AC7F 100%)",
                borderRadius: "999px",
                animation: "platinoShimmer 1.4s ease-in-out infinite",
              }}
            />
          </div>

          {/* Texto de carga elegante */}
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "11.5px",
              fontWeight: "600",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#113B3A",
              opacity: 0.85,
            }}
          >
            Conectando con Platino Perú
          </span>
        </div>
      </div>
    );
  }
  return children;
}
