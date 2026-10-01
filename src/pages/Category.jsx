import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { CATEGORY_INFO } from "../data/products";
import { getCatalogProducts } from "../services/catalogService";
import "../../styles/catalog.css";

function Category({ addToCart }) {
  const { category = "todas" } = useParams();

  const [productsList, setProductsList] = useState(() => getCatalogProducts());
  const [selectedMetal, setSelectedMetal] = useState("todos");
  const [sortBy, setSortBy] = useState("destacados");

  useEffect(() => {
    const handleUpdate = () => setProductsList(getCatalogProducts());
    window.addEventListener("catalog_updated", handleUpdate);
    return () => window.removeEventListener("catalog_updated", handleUpdate);
  }, []);

  const categoryKey = category || "todas";
  const categoryMeta = CATEGORY_INFO[categoryKey] || {
    title: category ? category.replace(/-/g, " ").toUpperCase() : "Colección Exclusiva",
    eyebrow: "Alta Joyería Platino Perú",
    desc: "Piezas de diseño sereno y acabados de precisión fabricadas en Oro de 18 Quilates y Plata Ley 950.",
    banner: "/images/hero-compromiso.jpg",
  };

  // Filtrar productos por categoría y metal
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((p) => {
      if (categoryKey === "todas" || categoryKey === "catalogo") return true;
      return (
        p.category === categoryKey ||
        (p.categories && p.categories.includes(categoryKey))
      );
    });

    // Si la categoría aún no tiene productos directos, mostrar sugerencias de joyas
    if (list.length === 0) {
      list = productsList.slice(0, 6);
    }

    if (selectedMetal !== "todos") {
      list = list.filter((p) =>
        p.availableMetals?.some((m) =>
          m.name.toLowerCase().includes(selectedMetal.toLowerCase())
        )
      );
    }

    // Ordenamiento
    if (sortBy === "precio-menor") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "precio-mayor") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [categoryKey, selectedMetal, sortBy, productsList]);

  return (
    <div className="catalog-page">
      {/* Banner de la Categoría */}
      <header className="catalog-hero-banner">
        <div className="catalog-hero-content">
          <span className="catalog-eyebrow">{categoryMeta.eyebrow}</span>
          <h1 className="catalog-title">{categoryMeta.title}</h1>
          <p className="catalog-desc">{categoryMeta.desc}</p>
        </div>
      </header>

      {/* Barra de Filtros y Catálogo */}
      <main className="catalog-container">
        <div className="catalog-filter-bar">
          <div className="catalog-count-text">
            Mostrando <strong>{filteredProducts.length}</strong> modelos en catálogo
          </div>

          <div className="catalog-filter-group">
            {/* Filtro por Metal */}
            <select
              value={selectedMetal}
              onChange={(e) => setSelectedMetal(e.target.value)}
              className="catalog-filter-select"
              aria-label="Filtrar por metal"
            >
              <option value="todos">Todos los Metales</option>
              <option value="Oro Amarillo">Oro Amarillo 18k</option>
              <option value="Oro Blanco">Oro Blanco 18k</option>
              <option value="Oro Rosa">Oro Rosa 18k</option>
              <option value="Plata">Plata Ley 925 / 950</option>
              <option value="Platino">Platino 950</option>
            </select>

            {/* Ordenar por */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="catalog-filter-select"
              aria-label="Ordenar productos"
            >
              <option value="destacados">Ordenar por: Destacados</option>
              <option value="precio-menor">Precio: Menor a Mayor</option>
              <option value="precio-mayor">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Grilla Dinámica de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="catalog-empty-state">
            <i className="bi bi-gem" style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}></i>
            <h3>No se encontraron piezas con los filtros seleccionados</h3>
            <p>Intenta restablecer los filtros para ver todos los modelos disponibles.</p>
            <button
              onClick={() => {
                setSelectedMetal("todos");
                setSortBy("destacados");
              }}
              className="showroom-btn outline"
              style={{ marginTop: "12px" }}
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <section className="catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </section>
        )}

        {/* Asesoría nupcial banner */}
        <div
          style={{
            marginTop: "70px",
            background: "#ffffff",
            border: "1px solid #ebe7df",
            padding: "35px 30px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--platino-green-dark)", margin: "0 0 6px 0" }}>
              ¿Prefieres ver estos modelos en persona?
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#66726c" }}>
              Agenda una cita exclusiva en nuestras sedes de Lima Centro o Miraflores con un gemólogo.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/agendar-cita" className="showroom-btn filled">
              Agendar Cita en Joyería
            </Link>
            <Link to="/sedes" className="showroom-btn outline">
              Ver Sedes
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Category;
