import { getRemoteData, setRemoteData } from "./remoteData";

const GEM_COLLECTION_NAMESPACE = "gem_collection_options";
const GEM_COLLECTION_UPDATED_EVENT = "gem_collection_options_updated";

export const DEFAULT_GEM_COLLECTION_OPTIONS = [
  { id: "", label: "Todas / Sin filtro de gema específica" },
  { id: "diamante", label: "Diamante (Natural / Lab Grown)" },
  { id: "esmeralda", label: "Esmeralda" },
  { id: "rubi", label: "Rubí" },
  { id: "zafiro", label: "Zafiro" },
];

export const getGemCollectionOptions = () => {
  const stored = getRemoteData(GEM_COLLECTION_NAMESPACE, []);
  const customOptions = Array.isArray(stored)
    ? stored.filter((option) => option && typeof option.id === "string" && option.id && typeof option.label === "string")
    : [];
  const options = new Map(DEFAULT_GEM_COLLECTION_OPTIONS.map((option) => [option.id, option]));

  customOptions.forEach((option) => {
    options.set(option.id, { id: option.id, label: option.label });
  });

  return Array.from(options.values());
};

export const saveGemCollectionOptions = (options) => {
  const normalizedOptions = Array.from(
    new Map(
      (Array.isArray(options) ? options : [])
        .filter((option) => option && typeof option.id === "string" && option.id && typeof option.label === "string")
        .map((option) => [option.id, { id: option.id, label: option.label.trim() }])
        .filter(([, option]) => option.label)
    ).values()
  );
  setRemoteData(GEM_COLLECTION_NAMESPACE, normalizedOptions, GEM_COLLECTION_UPDATED_EVENT);
  return getGemCollectionOptions();
};

export const createGemCollectionId = (label) =>
  String(label || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
