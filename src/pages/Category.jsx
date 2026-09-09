import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

function Category({ addToCart }) {
  const { category } = useParams()
  const titles = { anillos: 'Anillos', collares: 'Collares', aretes: 'Aretes', pulseras: 'Pulseras' }
  const filteredProducts = products.filter((product) => product.category === category)
  return <div className="container"><header className="page-heading"><span className="eyebrow">Diseños Aurelia</span><h1>{titles[category] || 'Colección'}</h1><p>Piezas creadas para acompañar tus días importantes y los que solo parecen cotidianos.</p></header><section className="product-grid" style={{ paddingBottom: '90px' }}>{filteredProducts.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</section></div>
}

export default Category
