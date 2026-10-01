# Platino E-commerce

Primera fase de una tienda online de joyería construida con React y Vite.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Visual Studio Code recomendado

## Cómo ejecutar el proyecto

Desde la carpeta raíz del proyecto:

```bash
npm install
npm run dev
```

Después abre en el navegador la dirección que muestre Vite, normalmente:

```text
http://localhost:5173/
```

Para detener el servidor utiliza `Ctrl + C` en la terminal.

## Comandos disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo con recarga automática
npm run build    # Genera la versión de producción en dist/
npm run preview  # Previsualiza la versión compilada
npm run lint     # Revisa errores de código con Oxlint
```

Flujo recomendado antes de entregar cambios:

```bash
npm run lint
npm run build
```

## Estructura del proyecto

```text
src/
├── components/
│   ├── Footer.jsx          # Pie de página reutilizable
│   ├── Navbar.jsx          # Navegación principal y contador de bolsa
│   └── ProductCard.jsx     # Tarjeta reutilizable de producto
├── data/
│   └── products.js         # Productos locales de la primera fase
├── pages/
│   ├── Home.jsx            # Página principal
│   ├── Catalog.jsx         # Catálogo completo
│   ├── Category.jsx        # Catálogo filtrado por categoría
│   ├── Product.jsx         # Detalle de producto
│   ├── Cart.jsx            # Carrito de compras
│   └── Checkout.jsx        # Formulario inicial de checkout
├── App.jsx                 # Rutas y estado global del carrito
├── App.css                 # Estilos principales y responsive
├── index.css               # Estilos globales
└── main.jsx                # Punto de entrada de React
```

## Rutas actuales

| Ruta | Página |
| --- | --- |
| `/` | Inicio |
| `/catalogo` | Catálogo |
| `/categoria/anillos` | Categoría de anillos |
| `/categoria/collares` | Categoría de collares |
| `/categoria/aretes` | Categoría de aretes |
| `/categoria/pulseras` | Categoría de pulseras |
| `/producto/:productId` | Detalle de producto |
| `/carrito` | Bolsa de compras |
| `/checkout` | Checkout |

## Tecnologías

- React 19
- Vite
- React Router
- CSS responsive
- Oxlint

## Cómo funciona el carrito

El estado del carrito vive temporalmente en `src/App.jsx`. Desde ahí se comparten estas funciones:

- `addToCart`: añade un producto o aumenta su cantidad.
- `updateQuantity`: cambia la cantidad o elimina el producto.

Actualmente los productos están definidos en `src/data/products.js`. El carrito se reinicia al recargar la página porque todavía no utiliza una base de datos ni `localStorage`.

## Próximas fases

1. Añadir imágenes reales para los productos.
2. Separar el estado del carrito en un Context o store.
3. Persistir carrito y favoritos con `localStorage`.
4. Conectar `products.js` con una API/backend.
5. Integrar autenticación, pagos y base de datos.

## Nota importante

El formulario de checkout es únicamente visual en esta fase. No procesa pagos ni guarda pedidos reales.
