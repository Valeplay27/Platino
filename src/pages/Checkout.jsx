import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { formatPrice } from '../data/products'
import { createOrder, PAYMENT_METHODS_DATA } from '../services/ordersService'

function Checkout({ cart, clearCart }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || (user?.email === 'cliente@platino.pe' ? 'Camila Mendoza' : ''))
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '+51 912 345 678')
  const [deliveryType, setDeliveryType] = useState('recojo_sede')
  const [sedeRecojo, setSedeRecojo] = useState('Sede Miraflores - Av. José Larco 880')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BCP')
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
      paymentMethod,
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

          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13.5px', marginBottom: '10px', color: '#0f2a24' }}>
              Método de Pago — Platino Perú
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              {PAYMENT_METHODS_DATA.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      border: isSelected ? '2px solid #137748' : '1px solid #d5ded9',
                      background: isSelected ? '#f2fbf6' : '#ffffff',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 2px 8px rgba(19, 119, 72, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? '#0f2a24' : '#22382f' }}>
                        {pm.name}
                      </span>
                      <i className={`bi ${pm.icon}`} style={{ fontSize: '16px', color: isSelected ? '#137748' : '#7b8f84' }}></i>
                    </div>
                    <span style={{ fontSize: '11px', color: '#687970', lineHeight: 1.3 }}>
                      {pm.category}
                    </span>
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isSelected ? '#dcfce7' : '#f1f5f3',
                          color: isSelected ? '#15803d' : '#52665a',
                        }}
                      >
                        {pm.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Caja informativa de instrucciones del método seleccionado */}
            {(() => {
              const selectedData = PAYMENT_METHODS_DATA.find((p) => p.id === paymentMethod) || PAYMENT_METHODS_DATA[0];
              return (
                <div
                  style={{
                    background: '#f8faf9',
                    border: '1px solid #cce3d6',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#1b3b2f',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <i className="bi bi-info-circle-fill" style={{ color: '#137748', fontSize: '16px', marginTop: '1px', flexShrink: 0 }}></i>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px', color: '#0f2a24' }}>
                      Instrucciones de Pago ({selectedData.name}):
                    </strong>
                    <span style={{ color: '#4a5d53' }}>{selectedData.instructions}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <button className="button" type="submit" disabled={isProcessing} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            {isProcessing ? 'Registrando en taller...' : `Confirmar y Pagar con ${paymentMethod} (${formatPrice(total)})`}
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
