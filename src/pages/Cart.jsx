import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'

function Cart({ cart, updateQuantity }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return <div className="container"><header className="page-heading"><span className="eyebrow">Tu selección</span><h1>Tu bolsa</h1></header>{cart.length === 0 ? <p style={{ paddingBottom: '90px' }}>Todavía no has elegido una pieza. <Link className="text-link" to="/catalogo">Explorar colección</Link></p> : <div className="cart-layout"><div>{cart.map((item) => <div className="cart-row" key={item.id}><div className="cart-thumb">{item.type === 'ring' ? '◯' : item.type === 'chain' ? '⌁' : item.type === 'earring' ? '◌' : '∞'}</div><div><h3>{item.name}</h3><span className="price">{formatPrice(item.price)}</span></div><div className="quantity"><button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><aside className="summary"><h2>Resumen</h2><div className="summary-line"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div><div className="summary-line"><span>Envío</span><span>{total >= 150 ? 'Gratis' : formatPrice(12)}</span></div><Link className="button" to="/checkout">Continuar al checkout</Link></aside></div>}</div>
}

export default Cart
