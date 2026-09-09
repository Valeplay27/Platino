import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'

function Checkout({ cart }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return <div className="container"><header className="page-heading"><span className="eyebrow">Último paso</span><h1>Checkout</h1><p>Completa tus datos para recibir tu selección.</p></header><form className="checkout-form" onSubmit={(event) => event.preventDefault()}><label className="field">Nombre completo<input required type="text" placeholder="Tu nombre" /></label><label className="field">Correo electrónico<input required type="email" placeholder="tu@email.com" /></label><label className="field">Dirección de envío<input required type="text" placeholder="Calle, número y ciudad" /></label><button className="button" type="submit">Pagar {formatPrice(total)}</button><p style={{ marginTop: '25px', color: 'var(--muted)', fontSize: '13px' }}><Link className="text-link" to="/carrito">← Volver a la bolsa</Link></p></form></div>
}

export default Checkout
