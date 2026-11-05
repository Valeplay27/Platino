// Utilidad para limpiar y corregir problemas de codificación de caracteres (Mojibake)
// causados por incompatibilidad entre UTF-8 y Windows-1252/ISO-8859-1 en bases de datos o navegadores.

export function fixMojibake(str) {
  if (!str || typeof str !== "string") return str || "";

  try {
    // Si contiene secuencias clásicas de doble codificación UTF-8
    if (/[\u00C0-\u00C3][\u0080-\u00BF]/.test(str)) {
      return decodeURIComponent(escape(str));
    }
  } catch {
    // Si falla decodeURIComponent, aplicamos sustitución directa
  }

  return str
    .replace(/\u00C3\u00A1/g, "á")
    .replace(/\u00C3\u00A9/g, "é")
    .replace(/\u00C3\u00AD/g, "í")
    .replace(/\u00C3\u00B3/g, "ó")
    .replace(/\u00C3\u00BA/g, "ú")
    .replace(/\u00C3\u00B1/g, "ñ")
    .replace(/\u00C3\u0081/g, "Á")
    .replace(/\u00C3\u0089/g, "É")
    .replace(/\u00C3\u008D/g, "Í")
    .replace(/\u00C3\u0093/g, "Ó")
    .replace(/\u00C3\u009A/g, "Ú")
    .replace(/\u00C3\u0091/g, "Ñ")
    .replace(/\u00C2\u00A0/g, " ")
    .replace(/\u00C2/g, "")
    .replace(/ÔÇó/g, "-")
    .replace(/•/g, "-")
    .replace(/[ÔÖ]ŸÀ/g, "")
    .replace(/Per║/g, "Perú")
    .replace(/Atrís/g, "Atrás");
}
