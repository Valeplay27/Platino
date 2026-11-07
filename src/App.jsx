import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Category from './pages/Category'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Sedes from './pages/Sedes'
import AgendarCita from './pages/AgendarCita'
import AdminCitas from './pages/AdminCitas'
import GemstonesCatalog from './pages/GemstonesCatalog'
import ClientOrders from './pages/ClientOrders'
import Favorites from './pages/Favorites'
import { AuthProvider } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import ScrollToTop from './components/ScrollToTop'
import Nosotros from './pages/Nosotros'
import Educacion from './pages/Educacion'
import LibroReclamaciones from './pages/LibroReclamaciones'
import GoogleReviewsToast from './components/GoogleReviewsToast'
import CartDrawer from './components/CartDrawer'
import AddToCartConfirmationModal from './components/AddToCartConfirmationModal'
import { getStoredGemstones } from './services/gemstonesService'
import ApiDataBootstrap from './components/ApiDataBootstrap'
import MaintenanceNoticeModal from './components/MaintenanceNoticeModal'
import LuxuryNotification from './components/LuxuryNotification'
import './App.css'

function App() {
  const [cart, setCart] = useState([])
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState(null)
  const [pendingCartItem, setPendingCartItem] = useState(null)
  const [apiError, setApiError] = useState("")

  useEffect(() => {
    const handleApiError = (event) => setApiError(event.detail?.message || "No se pudo conectar con el servidor.");
    window.addEventListener("platino_api_error", handleApiError);
    return () => window.removeEventListener("platino_api_error", handleApiError);
  }, [])

  const addProductToCart = (product, { openCartDrawer = true } = {}) => {
    const itemKey = product.cartItemId || `${product.id}-${product.selectedMetal || product.metal || ''}-${product.selectedSize || product.size || ''}-${product.engraving || ''}`;
    const addQty = product.quantity || 1;
    if (product.isGemstone) {
      const gemstone = getStoredGemstones().find(
        (gem) => `gem-${gem.id || gem.certNumber || ""}` === itemKey
      );
      const stock = Math.max(0, Number(gemstone?.units) || 0);
      const alreadyInCart = cart.reduce((total, item) => {
        return item.isGemstone && (item.cartItemId || item.id) === itemKey
          ? total + (Number(item.quantity) || 0)
          : total;
      }, 0);
      const remainingStock = Math.max(0, stock - alreadyInCart);
      if (addQty > remainingStock) {
        window.dispatchEvent(new CustomEvent("platino_notification", {
          detail: {
            message: remainingStock > 0
              ? `Solo quedan ${remainingStock} ${remainingStock === 1 ? "unidad" : "unidades"} disponibles de ${product.name}.`
              : `No quedan unidades disponibles de ${product.name}.`,
            type: "warning",
          },
        }));
        return false;
      }
    }

    const basePrice = product.basePrice !== undefined ? Number(product.basePrice) : Number(product.price || 0);

    const getEffectivePrice = (item, qty) => {
      const bPrice = item.basePrice !== undefined ? Number(item.basePrice) : Number(item.price || 0);
      if (item.wholesaleMinQty && item.wholesalePrice !== undefined && item.wholesalePrice !== null && Number(item.wholesalePrice) > 0) {
        if (qty >= Number(item.wholesaleMinQty)) {
          return Number(item.wholesalePrice);
        }
      }
      return bPrice;
    };

    const initialPrice = getEffectivePrice({ ...product, basePrice }, addQty);

    const configuredProduct = {
      ...product,
      basePrice,
      price: initialPrice,
      cartItemId: itemKey,
      image: product.image || "/images/secret-garden-white.jpg",
    };

    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        (item) => (item.cartItemId || item.id) === itemKey
      );
      if (existingIndex > -1) {
        return currentCart.map((item, index) => {
          if (index === existingIndex) {
            const nextQty = item.quantity + addQty;
            const nextPrice = getEffectivePrice(item, nextQty);
            return { ...item, quantity: nextQty, price: nextPrice };
          }
          return item;
        });
      }
      return [...currentCart, { ...configuredProduct, quantity: addQty }];
    });

    setLastAddedItem(configuredProduct);
    setIsCartDrawerOpen(openCartDrawer);
    return true;
  }

  const addToCart = (product, { skipConfirmation = false, openCartDrawer = true } = {}) => {
    if (skipConfirmation) {
      addProductToCart(product, { openCartDrawer })
      return
    }
    setPendingCartItem(product)
  }

  const confirmAddToCart = () => {
    if (!pendingCartItem) return
    addProductToCart(pendingCartItem)
    setPendingCartItem(null)
  }

  const cancelAddToCart = () => setPendingCartItem(null)

  const updateQuantity = (idOrKey, quantity) => {
    const currentItem = cart.find((item) => (item.cartItemId || item.id) === idOrKey);
    if (currentItem?.isGemstone && quantity > currentItem.quantity) {
      const gemstone = getStoredGemstones().find(
        (gem) => `gem-${gem.id || gem.certNumber || ""}` === idOrKey
      );
      const stock = Math.max(0, Number(gemstone?.units) || 0);
      if (quantity > stock) {
        window.dispatchEvent(new CustomEvent("platino_notification", {
          detail: {
            message: `Solo hay ${stock} ${stock === 1 ? "unidad disponible" : "unidades disponibles"} de ${currentItem.name}.`,
            type: "warning",
          },
        }));
        return;
      }
    }

    setCart((currentCart) =>
      quantity < 1
        ? currentCart.filter((item) => (item.cartItemId || item.id) !== idOrKey)
        : currentCart.map((item) => {
            if ((item.cartItemId || item.id) === idOrKey) {
              const bPrice = item.basePrice !== undefined ? Number(item.basePrice) : Number(item.price || 0);
              let effPrice = bPrice;
              if (item.wholesaleMinQty && item.wholesalePrice !== undefined && item.wholesalePrice !== null && Number(item.wholesalePrice) > 0) {
                if (quantity >= Number(item.wholesaleMinQty)) {
                  effPrice = Number(item.wholesalePrice);
                }
              }
              return { ...item, quantity, price: effPrice, basePrice: bPrice };
            }
            return item;
          })
    );
  }

  const removeFromCart = (idOrKey) => {
    setCart((currentCart) =>
      currentCart.filter((item) => (item.cartItemId || item.id) !== idOrKey)
    );
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ApiDataBootstrap>
        {apiError && (
          <div
            className="api-error-banner"
            role="alert"
            style={{
              background: "#8b1e1e",
              color: "white",
              padding: "12px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <span>{apiError}</span>
            <button
              type="button"
              onClick={() => setApiError("")}
              aria-label="Cerrar aviso"
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: "18px",
                cursor: "pointer",
                padding: "0 6px",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}
        <ScrollToTop />
        <Navbar
          cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
          onOpenCart={() => setIsCartDrawerOpen(true)}
        />
        <main>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/catalogo" element={<Catalog addToCart={addToCart} />} />
            <Route path="/categoria" element={<Category addToCart={addToCart} />} />
            <Route path="/categoria/:category" element={<Category addToCart={addToCart} />} />
            <Route path="/producto/:productId" element={<Product addToCart={addToCart} />} />
            <Route path="/carrito" element={<Cart cart={cart} updateQuantity={updateQuantity} />} />
            <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
            <Route path="/sedes" element={<Sedes />} />
            <Route path="/agendar-cita" element={<AgendarCita />} />
            <Route path="/catalogo-gemas" element={<GemstonesCatalog addToCart={addToCart} cart={cart} />} />
            <Route path="/gemas" element={<GemstonesCatalog addToCart={addToCart} cart={cart} />} />
            <Route path="/favoritos" element={<Favorites addToCart={addToCart} />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/educacion" element={<Educacion />} />
            <Route path="/blog" element={<Educacion />} />
            <Route path="/nosotros/:subpage" element={<Nosotros />} />
            <Route path="/libro-de-reclamaciones" element={<LibroReclamaciones />} />
            <Route path="/reclamaciones" element={<LibroReclamaciones />} />
            <Route path="/libro-reclamaciones" element={<LibroReclamaciones />} />
            <Route path="/mis-pedidos" element={<ClientOrders addToCart={addToCart} />} />
            <Route path="/seguimiento" element={<ClientOrders />} />
            <Route path="/cliente/pedidos" element={<ClientOrders />} />
            <Route path="/pedidos" element={<ClientOrders />} />
            <Route path="/admin/citas" element={<AdminCitas />} />
            <Route path="/admin" element={<AdminCitas />} />
            <Route path="/admin/catalogo" element={<AdminCitas />} />
            <Route path="/admin/portafolio" element={<AdminCitas />} />
            <Route path="/admin/inventario" element={<AdminCitas />} />
            <Route path="/admin/pedidos" element={<AdminCitas />} />
            <Route path="/admin/imagenes" element={<AdminCitas />} />
            <Route path="/admin/banners" element={<AdminCitas />} />
            <Route path="/admin/finanzas" element={<AdminCitas />} />
            <Route path="/admin/ganancias" element={<AdminCitas />} />
            <Route path="/admin/pagos" element={<AdminCitas />} />
            <Route path="/admin/permisos" element={<AdminCitas />} />
            <Route path="/admin/claves" element={<AdminCitas />} />
            <Route path="/admin/reclamaciones" element={<AdminCitas />} />
            <Route path="/admin/libro-reclamaciones" element={<AdminCitas />} />
            <Route path="/admin/platino-care" element={<AdminCitas />} />
            <Route path="/admin/care" element={<AdminCitas />} />
            <Route path="/admin/gemas" element={<AdminCitas />} />
            <Route path="/admin/diamantes" element={<AdminCitas />} />
            <Route path="/admin/catalogo-gemas" element={<AdminCitas />} />
            <Route path="/dashboard" element={<AdminCitas />} />
          </Routes>
        </main>
        <Footer />
        <MaintenanceNoticeModal />
        <AuthModal />
        <CartDrawer
          isOpen={isCartDrawerOpen}
          onClose={() => {
            setIsCartDrawerOpen(false);
            setLastAddedItem(null);
          }}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          lastAddedItem={lastAddedItem}
        />
        <AddToCartConfirmationModal
          product={pendingCartItem}
          onModify={cancelAddToCart}
          onContinue={confirmAddToCart}
        />
        <GoogleReviewsToast />
        <LuxuryNotification />
        </ApiDataBootstrap>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
