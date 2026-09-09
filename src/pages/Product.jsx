import { Link, useParams } from 'react-router-dom'
import { formatPrice, products } from '../data/products'

function Product({ addToCart }) {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId) || products[0]
  return <div className="container"><div className="product-detail"><div className={`detail-art product-art ${product.type}`}><span>{product.type === 'ring' ? '◯' : product.type === 'chain' ? '⌁' : product.type === 'earring' ? '◌' : '∞'}</span></div><div className="detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><span className="price">{formatPrice(product.price)}</span><p>{product.description} Cada pieza Aurelia está terminada a mano para que puedas llevarla durante mucho tiempo, en cualquier momento.</p><button className="button" onClick={() => addToCart(product)}>Añadir a la bolsa</button><p><Link className="text-link" to="/catalogo">← Volver a la colección</Link></p></div></div></div>
}

export default Product
