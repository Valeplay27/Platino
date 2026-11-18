import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { formatPrice } from '../data/products'
import { createOrder } from '../services/ordersService'
import { getStoredGemstones, isItemGemstone } from '../services/gemstonesService'
import {
  PERU_DEPARTMENTS_AND_PROVINCES,
  PERU_DEPARTMENTS,
  calculateShippingCost
} from '../data/peruLocations'
import { validatePromotionCode } from '../services/promotionsService'
import {
  getClientProfile,
  addClientAddress,
  updateClientPersonalData,
} from '../services/clientProfileService'
import '../../styles/checkout.css'

function Checkout({ cart, clearCart }) {
  const { user, openAuthModal } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initialProfile = getClientProfile(user)
  const initialDefaultAddr = (initialProfile.addresses || []).find((a) => a.isDefault) || (initialProfile.addresses || [])[0] || null

  const [savedAddresses, setSavedAddresses] = useState(() => initialProfile.addresses || [])
  const [selectedAddressId, setSelectedAddressId] = useState(() => initialDefaultAddr?.id || '')
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true)

  const [name, setName] = useState(initialProfile.name || user?.name || '')
  const [dni, setDni] = useState(initialProfile.dni || user?.dni || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(initialProfile.phone || user?.phone || '+51 912 345 678')
  const [dniError, setDniError] = useState('')
  const [deliveryType, setDeliveryType] = useState(() => location.state?.deliveryType || 'recojo_sede')
  const [sedeRecojo, setSedeRecojo] = useState(() => location.state?.sedeRecojo || 'Sede Miraflores - Av. Larco 345 (Multicentro)')
  const [shippingAddress, setShippingAddress] = useState(() => location.state?.shippingAddress || initialDefaultAddr?.address || '')
  const [selectedDepartment, setSelectedDepartment] = useState(() => location.state?.department || initialDefaultAddr?.department || 'Lima')
  const [selectedProvince, setSelectedProvince] = useState(() => {
    if (location.state?.province) return location.state.province
    if (initialDefaultAddr?.province) return initialDefaultAddr.province
    const provs = PERU_DEPARTMENTS_AND_PROVINCES[location.state?.department || initialDefaultAddr?.department || 'Lima'] || []
    return provs[0] || 'Lima'
  })
  const [selectedDistrict, setSelectedDistrict] = useState(() => location.state?.district || initialDefaultAddr?.district || '')

  const paymentMethod = 'BCP'
  const [isProcessing, setIsProcessing] = useState(false)

  const isGemOnly = cart.length > 0 && cart.every((item) => isItemGemstone(item));

  useEffect(() => {
    if (!user) return
    const prof = getClientProfile(user)
    setSavedAddresses(prof.addresses || [])
    if (prof.name) setName((prev) => prev || prof.name)
    if (prof.dni) setDni((prev) => prev || prof.dni)
    if (user.email) setEmail((prev) => prev || user.email)
    if (prof.phone) setPhone((prev) => (prev === '+51 912 345 678' || !prev ? prof.phone : prev))

    const defAddr = (prof.addresses || []).find((a) => a.isDefault) || (prof.addresses || [])[0]
    if (defAddr && !shippingAddress) {
      setSelectedAddressId(defAddr.id)
      setShippingAddress(defAddr.address || '')
      setSelectedDepartment(defAddr.department || 'Lima')
      setSelectedProvince(defAddr.province || 'Lima')
      setSelectedDistrict(defAddr.district || '')
    }
  }, [user])

  const handleSelectSavedAddress = (addr) => {
    if (!addr) {
      setSelectedAddressId('')
      setShippingAddress('')
      setSelectedDistrict('')
      return
    }
    setSelectedAddressId(addr.id)
    setShippingAddress(addr.address || '')
    const dept = addr.department || 'Lima'
    setSelectedDepartment(dept)
    const provs = PERU_DEPARTMENTS_AND_PROVINCES[dept] || []
    setSelectedProvince(addr.province || provs[0] || '')
    setSelectedDistrict(addr.district || '')
  }

  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoFeedback, setPromoFeedback] = useState(null)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

  const baseShippingCost = calculateShippingCost({
    isGemOnly,
    deliveryType,
    department: selectedDepartment
  })

  const promoDiscount = appliedPromo ? Number(appliedPromo.discountAmount || 0) : 0
  const shippingDiscount = appliedPromo && appliedPromo.type === 'envio' ? promoDiscount : 0
  const productDiscount = appliedPromo && appliedPromo.type === 'producto' ? promoDiscount : 0
  const effectiveShippingCost = Math.max(0, baseShippingCost - shippingDiscount)
  const total = Math.max(0, subtotal - productDiscount + effectiveShippingCost)

  const handleApplyPromo = (e) => {
    e?.preventDefault()
    if (!promoCodeInput.trim()) return
    const result = validatePromotionCode(promoCodeInput, {
      subtotal,
      shippingCost: baseShippingCost,
      deliveryType,
      cartItems: cart
    })
    if (result.valid) {
      setAppliedPromo(result)
      setPromoFeedback({ type: 'success', message: result.message })
    } else {
      setAppliedPromo(null)
      setPromoFeedback({ type: 'error', message: result.message })
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCodeInput('')
    setPromoFeedback(null)
  }

  const handleDepartmentChange = (newDept) => {
    setSelectedDepartment(newDept)
    const provinces = PERU_DEPARTMENTS_AND_PROVINCES[newDept] || []
    setSelectedProvince(provinces[0] || '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cart.length === 0) {
      alert('Tu bolsa de compras está vacía.')
      return
    }
    const accountDocument = String(user?.dni || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const submittedDocument = String(dni || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const validDni = /^\d{8}$/.test(submittedDocument)
    const validPassport = /^[A-Z0-9]{6,20}$/.test(submittedDocument)
    if (!validDni && !validPassport) {
      setDniError('Ingresa un DNI válido de 8 dígitos o un pasaporte válido.')
      alert('Ingresa un DNI válido de 8 dígitos o un pasaporte válido.')
      return
    }
    if (accountDocument && submittedDocument !== accountDocument) {
      setDniError('El DNI o pasaporte ingresado no coincide con la cuenta con la que inició sesión.')
      alert('El DNI o pasaporte ingresado no coincide con la cuenta con la que inició sesión.')
      return
    }
    setDniError('')
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

    const fullShippingAddress = deliveryType === 'envio_domicilio'
      ? `${shippingAddress.trim()}${selectedDistrict.trim() ? `, Distrito: ${selectedDistrict.trim()}` : ''}${selectedProvince.trim() ? `, Provincia: ${selectedProvince.trim()}` : ''}, Dpto: ${selectedDepartment.trim()}`
      : ''

    const orderPayload = {
      authenticatedUser: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni,
        role: user.role,
        adminType: user.adminType,
      } : null,
      clientName: name.trim() || 'Cliente Platino',
      clientDni: dni.trim(),
      clientEmail: email.trim().toLowerCase() || (user?.email || 'cliente@platino.pe'),
      clientPhone: phone.trim() || '+51 912 345 678',
      deliveryType,
      sedeRecojo: deliveryType === 'recojo_sede' ? sedeRecojo : '',
      shippingAddress: fullShippingAddress,
      department: deliveryType === 'envio_domicilio' ? selectedDepartment : '',
      province: deliveryType === 'envio_domicilio' ? selectedProvince : '',
      district: deliveryType === 'envio_domicilio' ? selectedDistrict : '',
      shippingCost: effectiveShippingCost,
      subtotal,
      promoCode: appliedPromo?.code || null,
      promoDiscount: promoDiscount || 0,
      promoType: appliedPromo?.type || null,
      deliveryDays: maxDeliveryDays,
      estimatedCompletion: targetDeliveryDate,
      total,
      paymentMethod,
      items: cart.map((item) => {
        const isGem = isItemGemstone(item);
        return {
          id: item.id,
          name: item.name,
          isGemstone: isGem,
          metal: isGem ? null : (item.selectedMetal || (typeof item.metal === 'string' ? item.metal : item.metal?.name) || 'Oro 18K Blanco'),
          size: isGem ? null : (item.selectedSize || item.size || 'Estándar'),
          gemstone: isGem ? (item.gemstone || item.name || 'Gema Certificada') : (item.selectedGemstone || item.gemstone || 'Diamante Natural'),
          carat: item.carat || null,
          shape: item.shape || item.selectedShape || null,
          certificate: item.certificate || null,
          certNumber: item.certNumber || null,
          engraving: isGem ? null : (item.engraving || (item.hasEngraving && item.engravingText ? `${item.engravingText} (${item.engravingStyle === 'cursiva' ? 'Cursiva Romántica' : 'Mayúsculas Clásicas'})` : null)),
          needsSizeAdvice: isGem ? false : Boolean(item.needsSizeAdvice || (typeof item.size === 'string' && item.size.toLowerCase().includes('asesor')) || (typeof item.selectedSize === 'string' && item.selectedSize.toLowerCase().includes('asesor'))),
          stockUnits: item.stockUnits,
          deliveryDays: item.deliveryDays || 2,
          estimatedDeliveryDate: item.estimatedDeliveryDate || '',
          platinoCarePlan: item.platinoCarePlan || 'cortesia',
          price: item.price,
          quantity: item.quantity,
          image: item.image || (item.images && item.images[0]) || '/images/secret-garden-white.jpg',
        };
      }),
    }

    try {
      if (user?.email) {
        try {
          updateClientPersonalData(user, { name, phone, dni })
          if (deliveryType === 'envio_domicilio' && saveAddressToProfile && shippingAddress.trim() && selectedDistrict.trim()) {
            const alreadySaved = savedAddresses.some(
              (a) =>
                String(a.address || '').trim().toLowerCase() === shippingAddress.trim().toLowerCase() &&
                String(a.district || '').trim().toLowerCase() === selectedDistrict.trim().toLowerCase()
            )
            if (!alreadySaved) {
              addClientAddress(user, {
                label: 'Casa',
                address: shippingAddress.trim(),
                department: selectedDepartment,
                province: selectedProvince,
                district: selectedDistrict.trim(),
                isDefault: savedAddresses.length === 0,
              })
            }
          }
        } catch {
          // non-fatal
        }
      }

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
              {isGemOnly ? `Resumen de Gemas (${totalQuantity} ${totalQuantity === 1 ? 'gema' : 'gemas'})` : `Resumen de Joyas (${totalQuantity} ${totalQuantity === 1 ? 'pieza' : 'piezas'})`}
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
                    {item.isGemstone ? (
                      <span>
                        {item.carat ? `· ${item.carat} ct ` : ''}
                        {item.shape ? `· Corte ${item.shape} ` : ''}
                        {item.certificate ? `· Cert: ${item.certificate} ` : ''}
                        {item.certNumber ? `#${item.certNumber}` : ''}
                      </span>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
                <span className="checkout-summary-price">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
            {/* Sección de Cupón / Código Promocional */}
            <div
              style={{
                background: '#fcfbf8',
                border: '1px solid #ebd9b8',
                borderRadius: '8px',
                padding: '12px 14px',
                marginTop: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#113b3a', marginBottom: '8px' }}>
                <i className="bi bi-tag-fill" style={{ color: '#c5a059' }}></i>
                <span>¿Tienes un cupón o código de descuento?</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ej. ENVIOGRATIS o PLATINO10"
                  value={promoCodeInput}
                  disabled={Boolean(appliedPromo)}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    minHeight: '38px',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    background: appliedPromo ? '#f1f5f9' : '#ffffff',
                  }}
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      background: '#113b3a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Aplicar
                  </button>
                )}
              </div>
              {promoFeedback && (
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: promoFeedback.type === 'success' ? '#15803d' : '#b91c1c',
                  }}
                >
                  {promoFeedback.message}
                </p>
              )}
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px', color: '#64748b' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatPrice(subtotal)}</span>
              </div>

              {appliedPromo && productDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px', color: '#166534' }}>
                  <span>Descuento ({appliedPromo.code}):</span>
                  <span style={{ fontWeight: 700 }}>- {formatPrice(productDiscount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px', color: '#64748b' }}>
                <span>Costo de Envío:</span>
                <span style={{ fontWeight: 600, color: effectiveShippingCost === 0 ? '#166534' : '#113B3A' }}>
                  {deliveryType === 'recojo_sede'
                    ? 'Gratis (Retiro en Sede)'
                    : effectiveShippingCost === 0
                      ? (shippingDiscount > 0 ? `Gratis (Cupón ${appliedPromo.code})` : `Gratis (${selectedDepartment})`)
                      : `${formatPrice(effectiveShippingCost)} (${selectedDepartment})`}
                </span>
              </div>
            </div>

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
            Documento de identidad (DNI peruano o pasaporte) *
            <input
              required
              type="text"
              maxLength={20}
              placeholder="Ej. DNI 71234567 o pasaporte AB123456"
              value={dni}
              onChange={(e) => {
                const value = e.target.value.trim()
                setDni(/^\d*$/.test(value)
                  ? value.replace(/\D/g, '').slice(0, 8)
                  : value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20))
                setDniError('')
              }}
              aria-invalid={Boolean(dniError)}
              style={dniError ? { borderColor: '#dc2626' } : undefined}
            />
            {dniError && (
              <span style={{ color: '#dc2626', fontSize: '12.5px', marginTop: '6px', display: 'block' }}>
                {dniError}
              </span>
            )}
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
                <option value="Sede Miraflores - Av. Larco 345 (Multicentro)">Sede Miraflores - Av. Larco 345 (Multicentro)</option>
                <option value="Sede Lima Centro - Jr. de la Unión 446">Sede Lima Centro - Jr. de la Unión 446</option>
              </select>
            </label>
          ) : (
            <>
              {/* Selector de Direcciones Guardadas del Perfil */}
              <div
                style={{
                  background: '#fbfaf7',
                  border: '1px solid #e5dec9',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: savedAddresses.length > 0 ? '10px' : '0', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f2a24', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bi bi-bookmark-star-fill" style={{ color: '#c5a059' }}></i>
                    {savedAddresses.length > 0 ? 'Mis Direcciones Guardadas:' : 'Libreta de Direcciones:'}
                  </span>
                  <Link
                    to="/mis-pedidos?tab=perfil"
                    style={{ fontSize: '12px', fontWeight: '700', color: '#0f2a24', textDecoration: 'underline' }}
                  >
                    {savedAddresses.length > 0 ? 'Gestionar mis direcciones →' : '+ Guardar direcciones en Mi Perfil →'}
                  </Link>
                </div>

                {savedAddresses.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          style={{
                            textAlign: 'left',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #0f2a24' : '1px solid #cbd5e1',
                            background: isSelected ? '#edf5f0' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '12px', color: '#0f2a24' }}>
                              <i className="bi bi-geo-alt-fill" style={{ color: '#c5a059', marginRight: '4px' }}></i>
                              {addr.label || 'Casa'}
                            </strong>
                            {addr.isDefault && (
                              <span style={{ fontSize: '10px', fontWeight: '800', color: '#166534', background: '#dcfce7', padding: '1px 6px', borderRadius: '10px' }}>
                                Principal
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{addr.address}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {addr.district}, {addr.province} ({addr.department})
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 1. Dirección exacta con Buscador Asistido Google Maps */}
              <label className="field" style={{ margin: '8px 0 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span>Dirección de envío completa (Av. / Calle, número, dpto y urbanización) *</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shippingAddress || ''} ${selectedDistrict} ${selectedProvince} ${selectedDepartment} Peru`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11.5px', color: '#166534', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}
                    title="Buscar y verificar dirección exacta en Google Maps"
                  >
                    <i className="bi bi-geo-alt-fill" style={{ color: '#ea4335' }}></i>
                    <span>Buscar en Google Maps</span>
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    type="text"
                    placeholder="Av. / Calle, número, departamento, urbanización o referencia"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    style={{ paddingRight: '38px' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </label>

              {/* 2. Ubicación Geográfica debajo de la dirección: Departamento, Provincia y Distrito */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', margin: '0 0 16px' }}>
                <label className="field" style={{ margin: 0 }}>
                  Departamento *
                  <select
                    required
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    {PERU_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field" style={{ margin: 0 }}>
                  Provincia *
                  <select
                    required
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                  >
                    {(PERU_DEPARTMENTS_AND_PROVINCES[selectedDepartment] || []).map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field" style={{ margin: 0 }}>
                  Distrito *
                  <input
                    required
                    type="text"
                    placeholder="Escribe tu distrito (ej. Miraflores)"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  />
                </label>
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#0f2a24',
                  cursor: 'pointer',
                  marginBottom: '12px',
                }}
              >
                <input
                  type="checkbox"
                  checked={saveAddressToProfile}
                  onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                  style={{ accentColor: '#0f2a24', width: '15px', height: '15px' }}
                />
                <span>Guardar esta dirección en mi perfil para futuras compras</span>
              </label>

              {/* Tarifa de Envío Informativa */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '12.5px',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="bi bi-truck" style={{ color: '#166534', fontSize: '16px' }} />
                <span>
                  <strong>Tarifa de envío para {selectedDepartment}:</strong>{' '}
                  {effectiveShippingCost === 0 ? (
                    <span style={{ color: '#166534', fontWeight: 'bold' }}>
                      {shippingDiscount > 0 ? `Envío Gratis (Cupón ${appliedPromo.code})` : 'Envío Gratis'}
                    </span>
                  ) : (
                    <span style={{ color: '#0f172a', fontWeight: 'bold' }}>
                      {formatPrice(effectiveShippingCost)} (Envío a {selectedDepartment})
                    </span>
                  )}
                </span>
              </div>
            </>
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
