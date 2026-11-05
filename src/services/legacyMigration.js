import { apiPost } from "./apiClient";

const LEGACY_KEYS = {
  platino_users_database: "users",
  platino_catalog_products_v1: "catalog",
  platino_citas_v1: "appointments",
  platino_blocked_slots_v1: "blocked_slots",
  platino_category_margins_v2: "finance",
  platino_certified_gemstones: "gemstones",
  platino_gem_laboratories: "laboratories",
  platino_home_images_v1: "home_images",
  platino_announcement_text_v1: "announcement",
  platino_announcement_active_v1: "announcement_active",
  platino_inventory_stock_v1: "inventory",
  platino_nosotros_content_v1: "nosotros",
  platino_orders_v1: "orders",
  platino_admin_permissions_v4: "permissions",
  platino_permission_requests_v4: "permission_requests",
  platino_reclamaciones_v1: "reclamations",
  platino_care_config_v2: "care_config",
  platino_care_clients_v2: "care_clients",
  platino_password_recovery_logs_v1: "recovery_logs",
};

const DISCARD_ONLY_KEYS = [
  "platino_auth_user",
  "platino_admin_passwords_v2",
  "platino_daily_recovery_seed_v1",
  "platino_last_viewed_product_id",
];

export async function migrateLegacyBrowserData() {
  const records = {};
  const discardKeys = [];
  const keysToConsume = new Set([...Object.keys(LEGACY_KEYS), ...DISCARD_ONLY_KEYS]);
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("platino_favorites_")) keysToConsume.add(key);
  }

  keysToConsume.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value === null) return;
    if (key in LEGACY_KEYS) {
      try {
        records[key] = JSON.parse(value);
      } catch {
        records[key] = value;
      }
    } else if (key.startsWith("platino_favorites_")) {
      try {
        records[key] = JSON.parse(value);
      } catch {
        // Ignorar datos no parseables de favoritos locales antiguos
      }
    } else {
      discardKeys.push(key);
    }
  });

  if (Object.keys(records).length === 0 && discardKeys.length === 0) return;
  try {
    const result = await apiPost("/migration/import", { records, discardKeys }).catch(() => null);
    const consumedKeys = Array.isArray(result?.consumedKeys)
      ? result.consumedKeys
      : (result?.success ? [...Object.keys(records), ...discardKeys] : []);
    (consumedKeys || []).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    if (result?.pendingKeys?.length) {
      console.warn("Algunos registros antiguos no pudieron vincularse:", result.pendingKeys);
    }
  } catch (err) {
    console.warn("Error no fatal en migración de datos locales:", err);
  }
}
