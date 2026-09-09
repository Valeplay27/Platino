import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'

function ProductCard({ product, addToCart }) {
  return <article className="product-card"><Link to={`/producto/${product.id}`}><div className={`product-art ${product.type}`}><span className="product-icon">{product.type === 'ring' ? '◯' : product.type === 'chain' ? '⌁' : product.type === 'earring' ? '◌' : '∞'}</span></div><div className="product-info"><h3>{product.name}</h3><p>{product.description}</p><span className="price">{formatPrice(product.price)}</span></div></Link><button className="button" onClick={() => addToCart(product)}>Añadir a la bolsa</button></article>
}

export default ProductCard
