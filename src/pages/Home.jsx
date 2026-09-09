import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

function Home({ addToCart }) {
  return <><section className="hero"><div className="hero-copy"><span className="eyebrow">Nueva colección · 2026</span><h1>Lo que llevas, cuenta tu historia.</h1><p>Joyas pensadas para acompañarte todos los días. Diseños serenos, materiales honestos y una belleza que permanece.</p><Link className="button" to="/catalogo">Explorar colección</Link></div><div className="hero-art"><span className="hero-jewel">✧</span></div></section><section className="section container"><div className="section-heading"><h2>Piezas para quedarse</h2><Link className="text-link" to="/catalogo">Ver todo</Link></div><div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</div></section><section className="story"><div className="story-copy"><span className="eyebrow">Nuestra forma de hacer</span><h2>Belleza con raíces.</h2><p>En Aurelia creemos en las piezas que se sienten propias. Trabajamos con talleres pequeños, materiales duraderos y diseños que dejan espacio para tu propia historia.</p><Link className="text-link" to="/catalogo">Conoce Aurelia</Link></div><div className="story-art">✦</div></section></>
}

export default Home
