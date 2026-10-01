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
import { AuthProvider } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import './App.css'

function App() {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find((item) => item.id === product.id)
      if (existingProduct) {
        return currentCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id, quantity) => {
    setCart((currentCart) => quantity < 1 ? currentCart.filter((item) => item.id !== id) : currentCart.map((item) => item.id === id ? { ...item, quantity } : item))
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar cartCount={cart.reduce((total, item) => total + item.quantity, 0)} />
        <main>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/catalogo" element={<Catalog addToCart={addToCart} />} />
            <Route path="/categoria/:category" element={<Category addToCart={addToCart} />} />
            <Route path="/producto/:productId" element={<Product addToCart={addToCart} />} />
            <Route path="/carrito" element={<Cart cart={cart} updateQuantity={updateQuantity} />} />
            <Route path="/checkout" element={<Checkout cart={cart} />} />
            <Route path="/sedes" element={<Sedes />} />
            <Route path="/agendar-cita" element={<AgendarCita />} />
            <Route path="/catalogo-gemas" element={<GemstonesCatalog />} />
            <Route path="/gemas" element={<GemstonesCatalog />} />
            <Route path="/admin/citas" element={<AdminCitas />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
