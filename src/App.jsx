import { useState } from 'react'
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
import CartDrawer from './components/CartDrawer'
import './App.css'

function App() {
  const [cart, setCart] = useState([])
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState(null)

  const addToCart = (product) => {
    const itemKey = product.cartItemId || `${product.id}-${product.selectedMetal || product.metal || ''}-${product.selectedSize || product.size || ''}-${product.engraving || ''}`;
    const configuredProduct = {
      ...product,
      cartItemId: itemKey,
      image: product.image || "/images/secret-garden-white.jpg",
    };

    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        (item) => (item.cartItemId || item.id) === itemKey
      );
      if (existingIndex > -1) {
        return currentCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...currentCart, { ...configuredProduct, quantity: product.quantity || 1 }];
    });

    setLastAddedItem(configuredProduct);
    setIsCartDrawerOpen(true);
  }

  const updateQuantity = (idOrKey, quantity) => {
    setCart((currentCart) =>
      quantity < 1
        ? currentCart.filter((item) => (item.cartItemId || item.id) !== idOrKey)
        : currentCart.map((item) =>
            (item.cartItemId || item.id) === idOrKey ? { ...item, quantity } : item
          )
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
            <Route path="/catalogo-gemas" element={<GemstonesCatalog />} />
            <Route path="/gemas" element={<GemstonesCatalog />} />
            <Route path="/favoritos" element={<Favorites addToCart={addToCart} />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/nosotros/:subpage" element={<Nosotros />} />
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
            <Route path="/dashboard" element={<AdminCitas />} />
          </Routes>
        </main>
        <Footer />
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
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
