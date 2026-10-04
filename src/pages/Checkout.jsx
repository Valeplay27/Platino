import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { formatPrice } from '../data/products'
import { createOrder } from '../services/ordersService'

function Checkout({ cart, clearCart }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || (user?.email === 'cliente@platino.pe' ? 'Camila Mendoza' : ''))
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '+51 912 345 678')
  const [deliveryType, setDeliveryType] = useState('recojo_sede')
  const [sedeRecojo, setSedeRecojo] = useState('Sede Miraflores - Av. José Larco 880')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('tarjeta')
  const [isProcessing, setIsProcessing] = useState(false)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (cart.length === 0) {
      alert('Tu bolsa de compras está vacía.')
      return
    }

    setIsProcessing(true)

    const maxDeliveryDays = cart.reduce((max, i) => Math.max(max, i.deliveryDays || 2), 2);
    const targetDeliveryDate = cart.find((i) => i.estimatedDeliveryDate)?.estimatedDeliveryDate || `${maxDeliveryDays} días hábiles`;

    const orderPayload = {
      clientName: name.trim() || 'Cliente Platino',
      clientEmail: email.trim().toLowerCase() || (user?.email || 'cliente@platino.pe'),
      clientPhone: phone.trim() || '+51 912 345 678',
      deliveryType,
      sedeRecojo: deliveryType === 'recojo_sede' ? sedeRecojo : '',
      shippingAddress: deliveryType === 'envio_domicilio' ? shippingAddress : '',
      deliveryDays: maxDeliveryDays,
      estimatedCompletion: targetDeliveryDate,
      total,
      paymentMethod:
        paymentMethod === 'tarjeta'
          ? 'Tarjeta de Crédito / Débito (Pasarela Encriptada)'
          : 'Transferencia Bancaria BCP / BBVA',
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        metal: item.selectedMetal || (typeof item.metal === 'string' ? item.metal : item.metal?.name) || 'Oro 18K Blanco',
        size: item.selectedSize || item.size || 'Estándar',
        gemstone: item.selectedGemstone || item.gemstone || 'Diamante Natural',
        engraving: item.engraving || (item.hasEngraving && item.engravingText ? `${item.engravingText} (${item.engravingStyle === 'cursiva' ? 'Cursiva Romántica' : 'Mayúsculas Clásicas'})` : null),
        needsSizeAdvice: Boolean(item.needsSizeAdvice || (typeof item.size === 'string' && item.size.toLowerCase().includes('asesor')) || (typeof item.selectedSize === 'string' && item.selectedSize.toLowerCase().includes('asesor'))),
        stockUnits: item.stockUnits,
        deliveryDays: item.deliveryDays || 2,
        estimatedDeliveryDate: item.estimatedDeliveryDate || '',
        price: item.price,
        quantity: item.quantity,
        image: item.image || (item.images && item.images[0]) || '/images/secret-garden-white.jpg',
      })),
    }

    setTimeout(() => {
      createOrder(orderPayload)
      if (typeof clearCart === 'function') {
        clearCart()
      }
      setIsProcessing(false)
      navigate('/mis-pedidos?nuevo=1')
    }, 600)
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto 80px' }}>
      <header className="page-heading">
        <span className="eyebrow">Último paso</span>
        <h1>Finalizar Compra & Ingreso a Taller</h1>
        <p>Completa tus datos para registrar tu pedido de joyería fina.</p>
      </header>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Tu bolsa de compras está vacía.</p>
          <Link className="button" to="/catalogo">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div style={{ background: '#faf8f5', padding: '16px 20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eeebe3' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f2a24' }}>
              Resumen de Joyas ({cart.reduce((s, i) => s + i.quantity, 0)} piezas)
            </h4>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                <span>
                  <strong>{item.name}</strong> × {item.quantity} {item.selectedMetal ? `(${item.selectedMetal})` : ''}
                </span>
                <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e2ddd3', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#0f2a24' }}>
              <span>Total a Pagar:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <label className="field">
            Nombre completo
            <input required type="text" placeholder="Tu nombre y apellidos" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="field">
            Correo electrónico
            <input required type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="field">
            Teléfono de contacto / WhatsApp
            <input required type="tel" placeholder="+51 987 654 321" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Modalidad de Entrega</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="recojo_sede"
                  checked={deliveryType === 'recojo_sede'}
                  onChange={() => setDeliveryType('recojo_sede')}
                />
                Retiro en Sede (Recomendado)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="envio_domicilio"
                  checked={deliveryType === 'envio_domicilio'}
                  onChange={() => setDeliveryType('envio_domicilio')}
                />
                Envío a Domicilio Blindado
              </label>
            </div>
          </div>

          {deliveryType === 'recojo_sede' ? (
            <label className="field">
              Sede para el retiro
              <select value={sedeRecojo} onChange={(e) => setSedeRecojo(e.target.value)}>
                <option value="Sede Miraflores - Av. José Larco 880">Sede Miraflores - Av. José Larco 880</option>
                <option value="Sede Lima Centro - Jr. de la Unión 540">Sede Lima Centro - Jr. de la Unión 540</option>
              </select>
            </label>
          ) : (
            <label className="field">
              Dirección de envío completa
              <input
                required
                type="text"
                placeholder="Av. / Calle, número, departamento y distrito"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </label>
          )}

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Método de Pago</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="tarjeta"
                  checked={paymentMethod === 'tarjeta'}
                  onChange={() => setPaymentMethod('tarjeta')}
                />
                Tarjeta de Crédito / Débito
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transferencia"
                  checked={paymentMethod === 'transferencia'}
                  onChange={() => setPaymentMethod('transferencia')}
                />
                Transferencia BCP / BBVA
              </label>
            </div>
          </div>

          <button className="button" type="submit" disabled={isProcessing} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            {isProcessing ? 'Registrando en taller...' : `Confirmar y Pagar ${formatPrice(total)}`}
          </button>

          <p style={{ marginTop: '25px', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
            <Link className="text-link" to="/carrito">
              ← Volver a la bolsa
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default Checkout
