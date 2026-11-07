import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { formatPrice } from '../data/products'
import { createOrder } from '../services/ordersService'
import { getStoredGemstones } from '../services/gemstonesService'
import '../../styles/checkout.css'

function Checkout({ cart, clearCart }) {
  const { user, openAuthModal } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [dni, setDni] = useState(user?.dni || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '+51 912 345 678')
  const [deliveryType, setDeliveryType] = useState('recojo_sede')
  const [sedeRecojo, setSedeRecojo] = useState('Sede Miraflores - Av. José Larco 345 Tda S-9')
  const [shippingAddress, setShippingAddress] = useState('')
  const paymentMethod = 'BCP'
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!user) return
    if (user.name) setName((prev) => prev || user.name)
    if (user.dni) setDni((prev) => prev || user.dni)
    if (user.email) setEmail((prev) => prev || user.email)
    if (user.phone) setPhone((prev) => (prev === '+51 912 345 678' || !prev ? user.phone : prev))
  }, [user])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cart.length === 0) {
      alert('Tu bolsa de compras está vacía.')
      return
    }
    const gemstones = getStoredGemstones()
    const unavailableGem = cart.find((item) => {
      if (!item.isGemstone) return false
      const itemKey = item.cartItemId || item.id
      const gem = gemstones.find(
        (storedGem) => `gem-${storedGem.id || storedGem.certNumber || ""}` === itemKey
      )
      return !gem || item.quantity > Number(gem.units || 0)
    })
    if (unavailableGem) {
      const gem = gemstones.find(
        (storedGem) => `gem-${storedGem.id || storedGem.certNumber || ""}` === (unavailableGem.cartItemId || unavailableGem.id)
      )
      const availableUnits = Math.max(0, Number(gem?.units) || 0)
      alert(
        availableUnits > 0
          ? `El stock de ${unavailableGem.name} cambió. Solo hay ${availableUnits} ${availableUnits === 1 ? "unidad disponible" : "unidades disponibles"}. Ajusta la cantidad en tu bolsa para continuar.`
          : `${unavailableGem.name} ya no tiene unidades disponibles. Retírala de tu bolsa para continuar.`
      )
      return
    }
    if (!user) {
      if (typeof openAuthModal === "function") openAuthModal("login"); alert("Inicia sesión o regístrate para finalizar tu compra.");
      return;
    }

    setIsProcessing(true)

    const maxDeliveryDays = cart.reduce((max, i) => Math.max(max, i.deliveryDays || 2), 2);
    const targetDeliveryDate = cart.find((i) => i.estimatedDeliveryDate)?.estimatedDeliveryDate || `${maxDeliveryDays} días hábiles`;

    const orderPayload = {
      clientName: name.trim() || 'Cliente Platino',
      clientDni: dni.trim(),
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
        platinoCarePlan: item.platinoCarePlan || 'cortesia',
        price: item.price,
        quantity: item.quantity,
        image: item.image || (item.images && item.images[0]) || '/images/secret-garden-white.jpg',
      })),
    }

    try {
      await createOrder(orderPayload);

      if (typeof clearCart === 'function') {
        clearCart()
      }
      navigate('/mis-pedidos?nuevo=1')
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="checkout-page container">
      <header className="page-heading checkout-heading">
        <span className="eyebrow">Último paso</span>
        <h1>Finalizar Compra & Ingreso a Taller</h1>
        <p>Completa tus datos para registrar tu pedido de joyería fina.</p>
      </header>

      {cart.length === 0 ? (
        <div className="checkout-empty">
          <span className="checkout-empty-icon"><i className="bi bi-bag" /></span>
          <h2>Tu bolsa está vacía</h2>
          <p>Explora nuestras joyas y vuelve para completar tu pedido.</p>
          <Link className="button" to="/catalogo">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-summary">
            <h2 className="checkout-section-title">
              Resumen de Joyas ({totalQuantity} {totalQuantity === 1 ? 'pieza' : 'piezas'})
            </h2>
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="checkout-summary-item"
              >
                <div className="checkout-summary-copy">
                  <div>
                    <strong>{item.name}</strong> × {item.quantity}
                  </div>
                  <div className="checkout-summary-specs">
                    {item.selectedMetal && (
                      <span>{typeof item.selectedMetal === 'object' ? item.selectedMetal.name : item.selectedMetal} {item.metalPrice ? `(${formatPrice(item.metalPrice)})` : ''}</span>
                    )}
                    {(item.selectedShape || item.selectedGemShape) && (
                      <span>· Corte {item.selectedShape || item.selectedGemShape} {item.shapePrice > 0 ? `(+${formatPrice(item.shapePrice)})` : ''}</span>
                    )}
                    {(item.selectedGemstone || item.gemstone) && (
                      <span>· 💎 {item.selectedGemstone || item.gemstone} {item.gemPrice > 0 ? `(+${formatPrice(item.gemPrice)})` : ''}</span>
                    )}
                    {item.selectedPresentation && item.presentationPrice > 0 && (
                      <span>· Cofre (+{formatPrice(item.presentationPrice)})</span>
                    )}
                    {(item.selectedSize || item.size) && (
                      <span>· Talla: {item.selectedSize || item.size}</span>
                    )}
                  </div>
                </div>
                <span className="checkout-summary-price">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="checkout-total">
              <span>Total a Pagar:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </section>

          <label className="field">
            Nombre completo
            <input required type="text" placeholder="Tu nombre y apellidos" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="field">
            Documento de Identidad (DNI / Carnet de Extranjería) *
            <input
              required
              type="text"
              placeholder="Ej. 71234567 (para validar tu cobertura Platino Care)"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
          </label>

          <label className="field">
            Correo electrónico
            <input required type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="field">
            Teléfono de contacto / WhatsApp
            <input required type="tel" placeholder="+51 987 654 321" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <fieldset className="checkout-delivery">
            <legend>Modalidad de entrega</legend>
            <div className="checkout-delivery-options">
              <label className="checkout-delivery-option">
                <input
                  type="radio"
                  name="deliveryType"
                  value="recojo_sede"
                  checked={deliveryType === 'recojo_sede'}
                  onChange={() => setDeliveryType('recojo_sede')}
                />
                Retiro en Sede (Recomendado)
              </label>
              <label className="checkout-delivery-option">
                <input
                  type="radio"
                  name="deliveryType"
                  value="envio_domicilio"
                  checked={deliveryType === 'envio_domicilio'}
                  onChange={() => setDeliveryType('envio_domicilio')}
                />
                Envío a Domicilio
              </label>
            </div>
          </fieldset>

          {deliveryType === 'recojo_sede' ? (
            <label className="field">
              Sede para el retiro
              <select value={sedeRecojo} onChange={(e) => setSedeRecojo(e.target.value)}>
                <option value="Sede Miraflores - Av. José Larco 345 Tda S-9">Sede Miraflores - Av. José Larco 345 Tda S-9</option>
                <option value="Sede Lima Centro - Jr. de la Unión 446 Tda 128">Sede Lima Centro - Jr. de la Unión 446 Tda 128</option>
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

          <aside className="checkout-payment-note" aria-label="Instrucciones de pago">
            <i className="bi bi-info-circle-fill" aria-hidden="true" />
            <div>
              <strong>Instrucciones de Pago (BCP):</strong>
              <p>
                Una vez confirmado tu pedido, te enviaremos los datos de nuestras cuentas bancarias por WhatsApp para que puedas realizar el pago.
              </p>
            </div>
          </aside>

          <button className="button checkout-submit" type="submit" disabled={isProcessing}>
            {isProcessing ? 'Registrando en taller...' : `Confirmar pedido · ${formatPrice(total)}`}
          </button>

          <p className="checkout-back-link">
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
