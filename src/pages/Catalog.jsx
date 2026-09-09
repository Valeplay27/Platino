import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

function Catalog({ addToCart, title = 'La colección' }) {
  return <div className="container"><header className="page-heading"><span className="eyebrow">Diseños Aurelia</span><h1>{title}</h1><p>Descubre piezas creadas para acompañar tus días importantes y los que solo parecen cotidianos.</p></header><div className="catalog-toolbar"><span>{products.length} piezas</span><label>Ordenar por <select><option>Destacados</option><option>Precio: menor a mayor</option><option>Precio: mayor a menor</option></select></label></div><section className="product-grid" style={{ paddingBottom: '90px' }}>{products.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</section></div>
}

export default Catalog
