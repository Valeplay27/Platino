export function attachImageFileName(imageData, fileName) {
  if (
    typeof imageData !== "string" ||
    !imageData.startsWith("data:image/") ||
    !fileName
  ) {
    return imageData;
  }

  return `${imageData.split("#", 1)[0]}#filename=${encodeURIComponent(fileName)}`;
}

export function getImageFileName(imageData) {
  if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
    return "";
  }

  const match = imageData.match(/#filename=([^#]*)$/);
  if (!match) return "";

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
}

export function getImageInputValue(imageData) {
  if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
    return imageData || "";
  }

  return getImageFileName(imageData) || "Imagen cargada (nombre no disponible)";
}

export function isEmbeddedImage(imageData) {
  return typeof imageData === "string" && imageData.startsWith("data:image/");
}
