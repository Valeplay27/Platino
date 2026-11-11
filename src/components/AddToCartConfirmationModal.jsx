import { useEffect } from "react";
import { formatPrice } from "../data/products";
import { getAssetUrl } from "../utils/assetHelper";
import "../../styles/addToCartConfirmation.css";

const getDisplayValue = (value) => {
  if (value && typeof value === "object") return value.name || value.text || "";
  return value ? String(value) : "";
};

export default function AddToCartConfirmationModal({
  product,
  onModify,
  onContinue,
}) {
  useEffect(() => {
    if (!product) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onModify();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onModify]);

  if (!product) return null;

  const quantity = Math.max(1, Number(product.quantity) || 1);
  const basePrice = product.basePrice !== undefined
    ? Number(product.basePrice)
    : Number(product.price) || 0;
  const hasWholesalePrice =
    product.wholesaleMinQty &&
    Number(product.wholesalePrice) > 0 &&
    quantity >= Number(product.wholesaleMinQty);
  const unitPrice = hasWholesalePrice ? Number(product.wholesalePrice) : basePrice;
  const specifications = [
    ["Material", getDisplayValue(product.selectedMetal || product.metal)],
    ["Gema", getDisplayValue(product.selectedGemstone || product.gemstone)],
    ["Corte", getDisplayValue(product.selectedShape || product.selectedGemShape || product.shape)],
    ["Talla", getDisplayValue(product.selectedSize || product.size)],
    ["Presentación", getDisplayValue(product.selectedPresentation)],
    ["Grabado", getDisplayValue(product.engraving)],
    ["Plan de cuidado", getDisplayValue(product.platinoCareTitle)],
  ].filter(([, value]) => value);

  return (
    <div
      className="add-cart-confirmation-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onModify();
      }}
    >
      <section
        className="add-cart-confirmation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-cart-confirmation-title"
      >
        <button
          type="button"
          className="add-cart-confirmation-close"
          onClick={onModify}
          aria-label="Cerrar y modificar el producto"
        >
          <i className="bi bi-x-lg" />
        </button>

        <p className="add-cart-confirmation-eyebrow">Verificación de producto</p>
        <h2 id="add-cart-confirmation-title">Confirma tu elección</h2>
        <p className="add-cart-confirmation-intro">
          Revisa el producto y sus detalles antes de añadirlo a tu bolsa.
        </p>

        <div className="add-cart-confirmation-product">
          <div className="add-cart-confirmation-image">
            <img
              src={getAssetUrl(product.image || "/images/secret-garden-white.jpg")}
              alt={product.name || "Producto seleccionado"}
            />
          </div>
          <div className="add-cart-confirmation-info">
            <h3>{product.name || "Producto seleccionado"}</h3>
            {product.subtitle && <p>{product.subtitle}</p>}
            <span>{formatPrice(unitPrice)} c/u</span>
          </div>
        </div>

        {specifications.length > 0 && (
          <dl className="add-cart-confirmation-specs">
            {specifications.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="add-cart-confirmation-total">
          <span>
            Cantidad: {quantity}
          </span>
          <strong>{formatPrice(unitPrice * quantity)}</strong>
        </div>

        <div className="add-cart-confirmation-actions">
          <button
            type="button"
            className="add-cart-confirmation-modify"
            onClick={onModify}
          >
            Modificar
          </button>
          <button
            type="button"
            className="add-cart-confirmation-continue"
            onClick={onContinue}
          >
            Seguir comprando
          </button>
        </div>
      </section>
    </div>
  );
}
