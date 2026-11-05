import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { hasPermission, isMasterAdmin } from "../services/permissionsService";
import {
  EDUCACION_CATEGORIES,
  getEducacionPosts,
  createEducacionPost,
  updateEducacionPost,
  deleteEducacionPost,
  resetEducacionPosts,
} from "../services/educacionService";
import { uploadImageFile } from "../utils/imageUploadService";
import {
  getImageInputValue,
  isEmbeddedImage,
} from "../utils/imageFileName";
import { getAssetUrl } from "../utils/assetHelper";

const EMPTY_FORM = {
  id: null,
  title: "",
  subtitle: "",
  category: "Gemología & Diamantes",
  author: "Maestro Gemólogo Platino Perú",
  date: new Date().toISOString().split("T")[0],
  readTime: "4 min de lectura",
  featured: false,
  coverImage: "/images/cat-compromiso.jpg",
  galleryImages: [],
  paragraphs: [""],
  keyTakeaways: [""],
};

export default function Educacion() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin =
    user?.role === "admin" ||
    user?.email?.toLowerCase() === "vladimiryt18@gmail.com";
  const canEditBlog =
    isMasterAdmin(user) ||
    (isAdmin && (hasPermission(user, "nosotros") || hasPermission(user, "catalogo")));

  const [posts, setPosts] = useState(getEducacionPosts);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Estado de administración de publicaciones (exclusivo Vladimir / Admin autorizado)
  const [isManageMode, setIsManageMode] = useState(() => searchParams.get("admin") === "1");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorForm, setEditorForm] = useState(EMPTY_FORM);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setPosts(getEducacionPosts());
    };
    window.addEventListener("platino_educacion_updated", handleUpdate);
    return () => window.removeEventListener("platino_educacion_updated", handleUpdate);
  }, []);

  // Abrir artículo automáticamente si viene ?post=slug o ?post=id en la URL
  useEffect(() => {
    const postParam = searchParams.get("post");
    if (!postParam) return;
    const found = posts.find(
      (p) => p.slug === postParam || p.id === postParam
    );
    if (found) {
      setActivePost(found);
    }
  }, [searchParams, posts]);

  useEffect(() => {
    if (searchParams.get("admin") === "1" && canEditBlog) {
      setIsManageMode(true);
    }
  }, [searchParams, canEditBlog]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const resolveImg = (src) => {
    if (!src) return getAssetUrl("/images/cat-compromiso.jpg");
    if (src.startsWith("data:") || src.startsWith("http") || src.startsWith("/api/")) return src;
    return getAssetUrl(src);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategory !== "Todos" && post.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = post.title?.toLowerCase().includes(q);
        const inSub = post.subtitle?.toLowerCase().includes(q);
        const inCat = post.category?.toLowerCase().includes(q);
        const inBody = (post.paragraphs || []).some((p) => p.toLowerCase().includes(q));
        if (!inTitle && !inSub && !inCat && !inBody) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return filteredPosts.find((p) => p.featured) || filteredPosts[0] || null;
  }, [filteredPosts]);

  // Abrir modal para crear nueva publicación
  const handleOpenCreateModal = () => {
    setEditorForm({
      ...EMPTY_FORM,
      date: new Date().toISOString().split("T")[0],
      paragraphs: ["Escribe aquí el primer párrafo de la publicación..."],
      keyTakeaways: ["Punto clave o recomendación gemológica."],
    });
    setNewGalleryUrl("");
    setIsEditorOpen(true);
  };

  // Abrir modal para editar una publicación existente
  const handleOpenEditModal = (post, e) => {
    if (e) e.stopPropagation();
    setEditorForm({
      id: post.id,
      title: post.title || "",
      subtitle: post.subtitle || "",
      category: post.category || "Gemología & Diamantes",
      author: post.author || "Maestro Gemólogo Platino Perú",
      date: post.date || new Date().toISOString().split("T")[0],
      readTime: post.readTime || "4 min de lectura",
      featured: Boolean(post.featured),
      coverImage: post.coverImage || "/images/cat-compromiso.jpg",
      galleryImages: Array.isArray(post.galleryImages) ? [...post.galleryImages] : [],
      paragraphs:
        Array.isArray(post.paragraphs) && post.paragraphs.length > 0
          ? [...post.paragraphs]
          : [""],
      keyTakeaways:
        Array.isArray(post.keyTakeaways) && post.keyTakeaways.length > 0
          ? [...post.keyTakeaways]
          : [""],
    });
    setNewGalleryUrl("");
    setIsEditorOpen(true);
  };

  // Subir imagen de portada desde PC
  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setEditorForm((prev) => ({ ...prev, coverImage: imageUrl }));
      showToast("✓ Imagen de portada cargada con su nombre original.");
    } catch (err) {
      alert(err.message || "No se pudo procesar la imagen seleccionada.");
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  // Subir una o varias imágenes adicionales a la galería de la publicación
  const handleGalleryFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingGallery(true);
    try {
      const uploadedList = [];
      for (const file of files) {
        const imageUrl = await uploadImageFile(file);
        if (imageUrl) uploadedList.push(imageUrl);
      }
      setEditorForm((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...uploadedList],
      }));
      showToast(`✓ Se agregaron ${uploadedList.length} imagen(es) a la publicación.`);
    } catch (err) {
      alert(err.message || "Error al subir las imágenes adicionales.");
    } finally {
      setIsUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleAddGalleryUrl = () => {
    const clean = newGalleryUrl.trim();
    if (!clean) return;
    setEditorForm((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), clean],
    }));
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (index) => {
    setEditorForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  // Guardar publicación (nueva o editada)
  const handleSavePost = (e) => {
    e.preventDefault();
    if (!editorForm.title.trim()) {
      alert("Por favor ingresa un título para la publicación.");
      return;
    }

    const cleanParagraphs = (editorForm.paragraphs || [])
      .map((p) => p.trim())
      .filter(Boolean);
    if (cleanParagraphs.length === 0) {
      alert("Agrega al menos un párrafo de contenido para la publicación.");
      return;
    }

    const payload = {
      ...editorForm,
      paragraphs: cleanParagraphs,
      keyTakeaways: (editorForm.keyTakeaways || [])
        .map((k) => k.trim())
        .filter(Boolean),
    };

    if (editorForm.id) {
      const updated = updateEducacionPost(editorForm.id, payload);
      setPosts(getEducacionPosts());
      if (activePost && activePost.id === editorForm.id) {
        setActivePost(updated);
      }
      showToast("✓ Publicación actualizada y guardada exitosamente.");
    } else {
      createEducacionPost(payload);
      setPosts(getEducacionPosts());
      showToast("✓ Nueva publicación creada y publicada en Educación.");
    }
    setIsEditorOpen(false);
  };

  // Eliminar publicación
  const handleDeletePost = (post, e) => {
    if (e) e.stopPropagation();
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la publicación "${post.title}"?`
      )
    ) {
      return;
    }
    deleteEducacionPost(post.id);
    setPosts(getEducacionPosts());
    if (activePost?.id === post.id) {
      setActivePost(null);
    }
    showToast("Publicación eliminada del blog.");
  };

  // Marcar como destacada rápidamente
  const handleToggleFeatured = (post, e) => {
    if (e) e.stopPropagation();
    updateEducacionPost(post.id, { featured: !post.featured });
    setPosts(getEducacionPosts());
    showToast(
      !post.featured
        ? `★ "${post.title}" ahora es la publicación destacada.`
        : "Publicación desmarcada como destacada."
    );
  };

  // Restaurar publicaciones originales
  const handleResetDefaultPosts = () => {
    if (
      window.confirm(
        "¿Deseas restaurar los artículos educativos originales de Platino Perú?"
      )
    ) {
      const restored = resetEducacionPosts();
      setPosts(restored);
      showToast("✓ Se han restaurado las publicaciones originales.");
    }
  };

  const handleOpenArticle = (post) => {
    setActivePost(post);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("post", post.slug || post.id);
    setSearchParams(nextParams, { replace: true });
  };

  const handleCloseArticle = () => {
    setActivePost(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("post");
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div
      style={{
        backgroundColor: "#faf9f6",
        minHeight: "88vh",
        paddingBottom: "90px",
      }}
    >
      {/* Toast flotante */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 100020,
            background: "#0f2d22",
            color: "#ffffff",
            padding: "15px 24px",
            borderRadius: "12px",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.28)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
            border: "1px solid #c5a059",
          }}
        >
          <i
            className="bi bi-check-circle-fill"
            style={{ color: "#c5a059", fontSize: "18px" }}
          ></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==============================================================
          BARRA ADMINISTRATIVA PARA VLADIMIR (CREAR / EDITAR PUBLICACIONES)
          ============================================================== */}
      {canEditBlog && (
        <section
          style={{
            background: "#113B3A",
            color: "#ffffff",
            padding: "14px 28px",
            borderBottom: "2px solid #C6AC7F",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "#C6AC7F",
                  color: "#0f291e",
                  fontWeight: "800",
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <i className="bi bi-shield-lock-fill"></i> GESTOR DE BLOG & EDUCACIÓN (VLADIMIR)
              </span>
              <span style={{ fontSize: "13.5px", color: "#d7e6df" }}>
                Publica artículos gemológicos, sube fotos desde tu PC y edita cualquier publicación en vivo.
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                style={{
                  background: "#C6AC7F",
                  color: "#0f291e",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-plus-circle-fill"></i> + Nueva Publicación
              </button>

              <button
                type="button"
                onClick={() => setIsManageMode((prev) => !prev)}
                style={{
                  background: isManageMode ? "#ffffff" : "rgba(255,255,255,0.12)",
                  color: isManageMode ? "#113B3A" : "#ffffff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="bi bi-pencil-square"></i>{" "}
                {isManageMode ? "Ocultar Controles de Edición" : "Editar Publicaciones"}
              </button>

              <button
                type="button"
                onClick={handleResetDefaultPosts}
                style={{
                  background: "transparent",
                  color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.24)",
                  padding: "9px 14px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                title="Restaurar artículos educativos por defecto"
              >
                <i className="bi bi-arrow-counterclockwise"></i> Restaurar Originales
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==============================================================
          HERO PRINCIPAL DE EDUCACIÓN & BLOG GEMOLÓGICO
          ============================================================== */}
      <section
        style={{
          background: "linear-gradient(135deg, #0e2920 0%, #15392d 100%)",
          color: "#ffffff",
          padding: "64px 24px 56px",
          textAlign: "center",
          borderBottom: "3px solid #C6AC7F",
        }}
      >
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              color: "#C6AC7F",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            ✦ ACADEMIA & BLOG GEMOLÓGICO PLATINO PERÚ
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 4.5vw, 48px)",
              fontWeight: "600",
              margin: "0 0 14px",
              lineHeight: 1.15,
            }}
          >
            Educación en Alta Joyería & Gemología
          </h1>
          <p
            style={{
              fontSize: "15.5px",
              color: "#d4e3dc",
              maxWidth: "680px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Aprende junto a nuestros maestros joyeros y gemólogos sobre diamantes naturales,
            diamantes de laboratorio, moissanitas, metales nobles y el cuidado experto de tus joyas.
          </p>
        </div>
      </section>

      {/* ==============================================================
          CONTENEDOR PRINCIPAL: FILTROS, ARTÍCULO DESTACADO Y GRILLA
          ============================================================== */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "36px 24px 0" }}>
        {/* Barra de Categorías y Buscador */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {EDUCACION_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "999px",
                    border: active ? "1.5px solid #113B3A" : "1px solid #d5ddd8",
                    background: active ? "#113B3A" : "#ffffff",
                    color: active ? "#ffffff" : "#24332c",
                    fontSize: "12.5px",
                    fontWeight: active ? "700" : "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div style={{ position: "relative", minWidth: "270px", flex: "0 1 320px" }}>
            <i
              className="bi bi-search"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7d74",
                fontSize: "14px",
              }}
            ></i>
            <input
              type="text"
              placeholder="Buscar artículo, gema o guía..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "999px",
                border: "1px solid #cfd8d3",
                background: "#ffffff",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Publicación Destacada (Hero Card) */}
        {featuredPost && selectedCategory === "Todos" && !searchQuery.trim() && (
          <div
            onClick={() => handleOpenArticle(featuredPost)}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              background: "#ffffff",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #e3e8e5",
              boxShadow: "0 14px 34px rgba(17, 59, 58, 0.07)",
              marginBottom: "42px",
              cursor: "pointer",
            }}
          >
            <div style={{ position: "relative", minHeight: "320px", background: "#0e2920" }}>
              <img
                src={resolveImg(featuredPost.coverImage)}
                alt={featuredPost.title}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "420px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "#C6AC7F",
                  color: "#0f291e",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                ★ ARTÍCULO DESTACADO
              </span>
            </div>

            <div
              style={{
                padding: "36px 38px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#113B3A",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {featuredPost.category}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-clock"></i> {featuredPost.readTime}
                </span>
                <span>•</span>
                <span>{featuredPost.date}</span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(24px, 3vw, 32px)",
                  color: "#113B3A",
                  margin: "0 0 12px",
                  lineHeight: 1.22,
                }}
              >
                {featuredPost.title}
              </h2>

              <p
                style={{
                  fontSize: "14.5px",
                  color: "#4b5c53",
                  lineHeight: 1.65,
                  margin: "0 0 22px",
                }}
              >
                {featuredPost.subtitle}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "auto",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#113B3A",
                    fontWeight: "700",
                    fontSize: "13.5px",
                  }}
                >
                  Leer publicación completa <i className="bi bi-arrow-right"></i>
                </span>

                {canEditBlog && (
                  <div
                    style={{ display: "flex", gap: "8px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(featuredPost, e)}
                      style={{
                        background: "#113B3A",
                        color: "#ffffff",
                        border: "none",
                        padding: "7px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-pencil-square"></i> Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grilla de Publicaciones */}
        {filteredPosts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
            }}
          >
            <i
              className="bi bi-journal-x"
              style={{ fontSize: "40px", color: "#94a3b8", display: "block", marginBottom: "10px" }}
            ></i>
            <h3 style={{ color: "#113B3A", margin: "0 0 6px" }}>
              No se encontraron publicaciones para esta búsqueda
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Prueba seleccionando otra categoría o limpiando el filtro de búsqueda.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "26px",
            }}
          >
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => handleOpenArticle(post)}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1px solid #e4e9e6",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ position: "relative", height: "220px", background: "#113B3A" }}>
                  <img
                    src={resolveImg(post.coverImage)}
                    alt={post.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "rgba(17, 59, 58, 0.9)",
                      color: "#C6AC7F",
                      padding: "4px 11px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {post.category}
                  </span>
                  {Array.isArray(post.galleryImages) && post.galleryImages.length > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        background: "rgba(0,0,0,0.68)",
                        color: "#ffffff",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      <i className="bi bi-images"></i> +{post.galleryImages.length} foto(s)
                    </span>
                  )}
                </div>

                <div
                  style={{
                    padding: "22px 24px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "11.5px",
                      color: "#6b7d74",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      <i className="bi bi-clock"></i> {post.readTime}
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "22px",
                      color: "#113B3A",
                      margin: "0 0 10px",
                      lineHeight: 1.28,
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "#52635a",
                      lineHeight: 1.6,
                      margin: "0 0 18px",
                      flex: 1,
                    }}
                  >
                    {post.subtitle}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "14px",
                      borderTop: "1px solid #eef2f0",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: "#113B3A",
                        fontWeight: "700",
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Leer artículo <i className="bi bi-arrow-right"></i>
                    </span>

                    {(canEditBlog || isManageMode) && canEditBlog && (
                      <div
                        style={{ display: "flex", gap: "6px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleToggleFeatured(post, e)}
                          title={post.featured ? "Destacado en portada" : "Destacar en portada"}
                          style={{
                            background: post.featured ? "#fef3c7" : "#f1f5f9",
                            color: post.featured ? "#b45309" : "#475569",
                            border: "1px solid #cbd5e1",
                            padding: "5px 9px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <i className={post.featured ? "bi bi-star-fill" : "bi bi-star"}></i>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(post, e)}
                          style={{
                            background: "#113B3A",
                            color: "#ffffff",
                            border: "none",
                            padding: "5px 11px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          <i className="bi bi-pencil-square"></i> Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePost(post, e)}
                          style={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            border: "1px solid #fecaca",
                            padding: "5px 9px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                          title="Eliminar publicación"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ==============================================================
          MODAL DE LECTURA COMPLETA DEL ARTÍCULO
          ============================================================== */}
      {activePost && (
        <div
          onClick={handleCloseArticle}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 24, 19, 0.72)",
            backdropFilter: "blur(4px)",
            zIndex: 99990,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              maxWidth: "860px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "16px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", height: "320px", background: "#113B3A" }}>
              <img
                src={resolveImg(activePost.coverImage)}
                alt={activePost.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={handleCloseArticle}
                aria-label="Cerrar artículo"
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(17, 59, 58, 0.88)",
                  color: "#ffffff",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
              {canEditBlog && (
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(activePost)}
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "16px",
                    background: "#C6AC7F",
                    color: "#0f291e",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  }}
                >
                  <i className="bi bi-pencil-square"></i> Editar esta Publicación
                </button>
              )}
            </div>

            <div style={{ padding: "34px 38px 40px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "12.5px",
                  color: "#64748b",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background: "#e6f0ee",
                    color: "#113B3A",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontWeight: "700",
                  }}
                >
                  {activePost.category}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-person-badge"></i> {activePost.author}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-clock"></i> {activePost.readTime}
                </span>
                <span>•</span>
                <span>{activePost.date}</span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(26px, 3.5vw, 36px)",
                  color: "#113B3A",
                  margin: "0 0 12px",
                  lineHeight: 1.2,
                }}
              >
                {activePost.title}
              </h2>

              <p
                style={{
                  fontSize: "16px",
                  color: "#3f5148",
                  fontWeight: "500",
                  lineHeight: 1.6,
                  margin: "0 0 24px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {activePost.subtitle}
              </p>

              {/* Párrafos del artículo */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
                {(activePost.paragraphs || []).map((para, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: "15px",
                      color: "#2b3932",
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Galería de imágenes adicionales */}
              {Array.isArray(activePost.galleryImages) && activePost.galleryImages.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <h4
                    style={{
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#113B3A",
                      marginBottom: "12px",
                    }}
                  >
                    <i className="bi bi-images"></i> Galería Visual del Artículo
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {activePost.galleryImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid #e2e8f0",
                          height: "190px",
                          background: "#f8fafc",
                        }}
                      >
                        <img
                          src={resolveImg(imgUrl)}
                          alt={`${activePost.title} - foto ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Puntos Clave */}
              {Array.isArray(activePost.keyTakeaways) && activePost.keyTakeaways.length > 0 && (
                <div
                  style={{
                    background: "#f4f9f6",
                    border: "1px solid #cce0d5",
                    borderLeft: "4px solid #C6AC7F",
                    borderRadius: "10px",
                    padding: "20px 24px",
                    marginBottom: "28px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px",
                      fontSize: "14px",
                      color: "#113B3A",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <i className="bi bi-gem" style={{ color: "#C6AC7F", marginRight: "6px" }}></i>
                    Puntos Clave Gemológicos
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#24362e", fontSize: "14px", lineHeight: 1.7 }}>
                    {activePost.keyTakeaways.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Acciones inferiores */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Link
                    to="/catalogo-gemas"
                    onClick={handleCloseArticle}
                    style={{
                      background: "#113B3A",
                      color: "#ffffff",
                      textDecoration: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    <i className="bi bi-gem"></i> Explorar Catálogo de Gemas
                  </Link>
                  <Link
                    to="/agendar-cita"
                    onClick={handleCloseArticle}
                    style={{
                      background: "#C6AC7F",
                      color: "#0f291e",
                      textDecoration: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    <i className="bi bi-calendar2-check"></i> Agendar Asesoría en Sede
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleCloseArticle}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cerrar lectura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL EDITOR DE PUBLICACIONES (VLADIMIR / ADMIN)
          ============================================================== */}
      {isEditorOpen && canEditBlog && (
        <div
          onClick={() => setIsEditorOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 24, 19, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              maxWidth: "820px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              borderRadius: "16px",
              padding: "30px 34px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.38)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "16px",
                borderBottom: "1px solid #e2e8f0",
                marginBottom: "22px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#C6AC7F",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  ADMINISTRACIÓN CENTRAL (VLADIMIR)
                </span>
                <h2 style={{ margin: "4px 0 0", fontSize: "22px", color: "#113B3A" }}>
                  {editorForm.id ? "Editar Publicación Educativa" : "Crear Nueva Publicación Educativa"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSavePost}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Título de la Publicación *
                  </label>
                  <input
                    type="text"
                    required
                    value={editorForm.title}
                    onChange={(e) => setEditorForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej. Diamante Natural vs. Lab Grown: Guía Definitiva"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Subtítulo / Resumen Corto *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editorForm.subtitle}
                    onChange={(e) => setEditorForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Resumen que aparecerá en la tarjeta del artículo..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Categoría
                  </label>
                  <select
                    value={editorForm.category}
                    onChange={(e) => setEditorForm((prev) => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                    }}
                  >
                    {EDUCACION_CATEGORIES.filter((c) => c !== "Todos").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Autor / Especialista
                  </label>
                  <input
                    type="text"
                    value={editorForm.author}
                    onChange={(e) => setEditorForm((prev) => ({ ...prev, author: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={editorForm.date}
                    onChange={(e) => setEditorForm((prev) => ({ ...prev, date: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
                    Tiempo de Lectura
                  </label>
                  <input
                    type="text"
                    value={editorForm.readTime}
                    onChange={(e) => setEditorForm((prev) => ({ ...prev, readTime: e.target.value }))}
                    placeholder="Ej. 5 min de lectura"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                    }}
                  />
                </div>
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  color: "#113B3A",
                  marginBottom: "20px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={editorForm.featured}
                  onChange={(e) => setEditorForm((prev) => ({ ...prev, featured: e.target.checked }))}
                />
                <span>★ Destacar esta publicación como principal en la portada de Educación</span>
              </label>

              {/* IMAGEN DE PORTADA */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#113B3A", marginBottom: "10px" }}>
                  <i className="bi bi-image"></i> Imagen Principal de Portada
                </label>

                <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                  <img
                    src={resolveImg(editorForm.coverImage)}
                    alt="Previsualización portada"
                    style={{
                      width: "130px",
                      height: "88px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: "240px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <label
                        style={{
                          background: "#113B3A",
                          color: "#ffffff",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="bi bi-upload"></i>{" "}
                        {isUploadingCover ? "Procesando..." : "Subir Foto desde PC"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={getImageInputValue(editorForm.coverImage)}
                      readOnly={isEmbeddedImage(editorForm.coverImage)}
                      onChange={(e) => setEditorForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                      placeholder="O pega la URL / ruta de la imagen..."
                      title={isEmbeddedImage(editorForm.coverImage) ? "Vuelve a subir una foto para reemplazarla" : undefined}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12.5px",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* GALERÍA DE IMÁGENES ADICIONALES */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "800", color: "#113B3A" }}>
                    <i className="bi bi-images"></i> Galería de Imágenes dentro de la Publicación ({editorForm.galleryImages.length})
                  </label>
                  <label
                    style={{
                      background: "#C6AC7F",
                      color: "#0f291e",
                      padding: "7px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="bi bi-cloud-arrow-up-fill"></i>{" "}
                    {isUploadingGallery ? "Subiendo..." : "+ Agregar Fotos desde PC"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFilesUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="O pega la URL de una imagen adicional y pulsa Añadir..."
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12.5px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    style={{
                      background: "#113B3A",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Añadir URL
                  </button>
                </div>

                {editorForm.galleryImages.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {editorForm.galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          width: "96px",
                          height: "72px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        <img
                          src={resolveImg(img)}
                          alt={`Galería ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span
                          title={getImageInputValue(img)}
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            padding: "2px 4px",
                            overflow: "hidden",
                            background: "rgba(15, 23, 42, 0.78)",
                            color: "#fff",
                            fontSize: "9px",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getImageInputValue(img)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            border: "none",
                            background: "rgba(185, 28, 28, 0.9)",
                            color: "#ffffff",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                          title="Quitar imagen"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PÁRRAFOS DEL ARTÍCULO */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "800", color: "#113B3A" }}>
                    Contenido de la Publicación (Párrafos) *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditorForm((prev) => ({
                        ...prev,
                        paragraphs: [...prev.paragraphs, ""],
                      }))
                    }
                    style={{
                      background: "#e6f0ee",
                      color: "#113B3A",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    + Añadir Párrafo
                  </button>
                </div>

                {editorForm.paragraphs.map((para, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => {
                        const copy = [...editorForm.paragraphs];
                        copy[idx] = e.target.value;
                        setEditorForm((prev) => ({ ...prev, paragraphs: copy }));
                      }}
                      placeholder={`Párrafo ${idx + 1}...`}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                      }}
                    />
                    {editorForm.paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditorForm((prev) => ({
                            ...prev,
                            paragraphs: prev.paragraphs.filter((_, i) => i !== idx),
                          }))
                        }
                        style={{
                          background: "#fee2e2",
                          color: "#b91c1c",
                          border: "1px solid #fecaca",
                          borderRadius: "8px",
                          padding: "0 12px",
                          cursor: "pointer",
                        }}
                        title="Eliminar párrafo"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* PUNTOS CLAVE */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "800", color: "#113B3A" }}>
                    Puntos Clave / Conclusiones Destacadas
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditorForm((prev) => ({
                        ...prev,
                        keyTakeaways: [...prev.keyTakeaways, ""],
                      }))
                    }
                    style={{
                      background: "#e6f0ee",
                      color: "#113B3A",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    + Añadir Punto Clave
                  </button>
                </div>

                {editorForm.keyTakeaways.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const copy = [...editorForm.keyTakeaways];
                        copy[idx] = e.target.value;
                        setEditorForm((prev) => ({ ...prev, keyTakeaways: copy }));
                      }}
                      placeholder={`Punto clave ${idx + 1}...`}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditorForm((prev) => ({
                          ...prev,
                          keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== idx),
                        }))
                      }
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        padding: "0 12px",
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "11px 20px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#113B3A",
                    color: "#ffffff",
                    border: "none",
                    padding: "11px 24px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-check2-circle"></i>{" "}
                  {editorForm.id ? "Guardar Cambios" : "Publicar Artículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
