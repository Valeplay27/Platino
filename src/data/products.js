export const products = [
  { id: 'anillo-sol', name: 'Anillo Sol', category: 'anillos', type: 'ring', price: 145, description: 'Una pieza delicada que captura la luz de cada día.' },
  { id: 'cadena-luna', name: 'Cadena Luna', category: 'collares', type: 'chain', price: 185, description: 'Diseño ligero y atemporal para llevar cerca del corazón.' },
  { id: 'aros-orbita', name: 'Aros Órbita', category: 'aretes', type: 'earring', price: 120, description: 'Un gesto sutil con presencia propia.' },
  { id: 'pulsera-nativa', name: 'Pulsera Nativa', category: 'pulseras', type: 'bracelet', price: 160, description: 'Textura orgánica y acabado artesanal.' },
  { id: 'anillo-alba', name: 'Anillo Alba', category: 'anillos', type: 'ring', price: 210, description: 'Una silueta limpia para ocasiones especiales.' },
  { id: 'collar-bruma', name: 'Collar Bruma', category: 'collares', type: 'chain', price: 230, description: 'Una cadena de brillo sereno y contemporáneo.' },
]

export const formatPrice = (price) => `$${price.toLocaleString('es-MX')} USD`
