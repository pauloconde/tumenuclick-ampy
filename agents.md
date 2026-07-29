# agents.md — Tu Menú Click (Template Base Maestra)

## Descripción del Proyecto

Plantilla SaaS blanca multi-cliente de menú digital interactivo basada en **Astro + React + Sanity CMS**, desplegada en **Vercel**. El menú muestra productos organizados por categorías, soporta pedidos por WhatsApp, observacion de clientes por plato, conteo de proteína, extras de cantidad variable y sistema de carrito completo.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Astro 5 (output: `server`, adaptador Vercel) |
| UI interactiva | React 19 + Framer Motion |
| CMS | Sanity v5 (Studio embebido en `/admin` con plugin `media`) |
| CSS | Tailwind CSS v4 (vía plugin Vite) |
| Estado global | Nanostores + `@nanostores/react` |
| Imágenes Sanity | `@sanity/image-url` |
| Analytics | Google Analytics 4 (GA4) |
| Deploy | Vercel (SSR) |
| Package manager | pnpm |

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── analytics/       # GA4Script.astro, AnalyticsListener.tsx
│   ├── cart/            # Carrito completo (sidebar, sheet, modales, controles)
│   ├── layout/          # NavBar, Footer, etc.
│   ├── menu/            # Secciones del menú (BestSellers, Hero, Seasonal, ProductCard, Modales)
│   ├── pwa/             # Service Worker
│   └── theme/           # Aplicación dinámica de tema (CSS vars)
├── layouts/             # Layout principal de Astro
├── lib/
│   ├── queries.ts        # ⭐ Única función de fetch: getMenuData()
│   ├── sanity.ts         # Cliente Sanity
│   ├── imageUrl.ts       # Helper urlFor()
│   ├── fontUtils.ts      # Carga de fuentes personalizadas
│   └── stringUtils.ts    # Utilidades de texto
├── pages/
│   ├── index.astro       # Página principal (SSR)
│   ├── admin/            # Sanity Studio embebido
│   └── api/              # Endpoints Vercel (si aplica)
├── schema/
│   ├── menuTypes.ts      # ⭐ Todos los tipos Sanity (singletons + colecciones)
│   ├── productTypes.ts   # Tipo `product`
│   ├── categoryTypes.ts  # Tipo `category`
│   └── index.ts          # Registro de todos los tipos
├── stores/
│   ├── cartStore.ts      # Estado del carrito (items, totales, fulfillment, notes)
│   ├── menuStore.ts      # Datos del menú en cliente
│   └── orderModeStore.ts # Modo pedido siempre activo (atom fijado en `true`)
└── styles/              # CSS global
scripts/                 # Scripts de migración y utilidades (tsx, sh)
sanity.config.ts         # Configuración del Sanity Studio
astro.config.mjs         # Configuración de Astro
```

---

## Documentos Sanity (CMS)

### Singletons (un solo documento por tipo)
| ID / Tipo | Propósito |
|---|---|
| `brand` | Nombre, logo, contacto, WhatsApp, redes sociales |
| `menu` | Configuración del menú: bestsellers, secciones, specials, orden de categorías |
| `siteConfig` | GA4 ID, URL, restaurantId, pedidos habilitados, mesas |
| `theme` | Sistema completo de colores por sección (navbar, modal, footer, carrito, etc.) |
| `typography` | Fuentes por elemento (título sección, producto, precio, etc.) |

### Colecciones
| Tipo | Propósito |
|---|---|
| `category` | Categorías del menú. Tienen un array `products[]` de references a productos |
| `product` | Producto individual con foto (imgSrc), precio, proteína (`protein`), opciones, variantes, extras |
| `optionGroupTemplate` | Plantillas reutilizables de grupos de opciones (p.ej. temperatura) |
| `extraGroupTemplate` | Plantillas reutilizables de grupos de extras (p.ej. contornos, con `allowQuantity`) |

---

## Flujo de Datos Principal

1. `getMenuData()` en `src/lib/queries.ts` hace **una sola consulta GROQ** a Sanity que trae todo: brand, theme, typography, menu, categories y products (incluyendo proteína, extras recomendados `isRecommended`, y flags `allowQuantity`).
2. La página `index.astro` llama a `getMenuData()` en el servidor y pasa los datos como props a los componentes Astro/React.
3. Los datos de menú se inyectan en los stores de Nanostores para los componentes React que necesitan reactividad (carrito, modales, observaciones `notes`).

---

## Convenciones Importantes

- **SSR real**: `output: 'server'` — no hay generación estática. Cada request hace fetch a Sanity.
- **Studio embebido**: Sanity Studio vive en `/admin` dentro de la misma app Astro.
- **Singletons**: `brand`, `menu`, `siteConfig`, `theme`, `typography` tienen `_id` fijo igual a su tipo (ej: `_id == "theme"`). No crear duplicados.
- **Orden de categorías**: definido en `menu.categoriesOrder[]` como array de references a `category`. Si está vacío, se usa el orden de Sanity.
- **Bestsellers**: se gestionan en `menu.bestSellersItems[]` (lista curada ordenada), NO con un campo `bestSeller` en el producto. El campo `bestSeller` en producto se computa dinámicamente en `getMenuData()`.
- **Proteína**: el campo opcional `protein` (gramos) muestra una insignia destacada `💪 Aporta Xg de proteína`.
- **Observaciones del Cliente**: los clientes pueden redactar notas en el modal por producto (ej. *"Sin cebolla"*), preservadas en `cartStore` y enviadas a WhatsApp (`📝 Obs: "..."`).
- **Extras Avanzados**: soporte para `isRecommended` (insignia Recomendado) y `allowQuantity` (selección múltiple de unidades de extra).
- **Tema**: todos los colores son strings hexadecimales (`#RRGGBB` o `#RRGGBBAA`) aplicados como CSS custom properties.
- **Modo Dev**: `SANITY_STUDIO_DEV_MODE=true` desbloquea campos de solo lectura en el Studio (ej: `restaurantId`, `siteUrl`).

---

## Componentes Clave

| Componente | Descripción |
|---|---|
| `ProductOrderModal.tsx` | Modal de producto para modo "ordenar" (maneja variantes, opciones, extras variables, proteína y observaciones `notes`). |
| `FulfillmentModal.tsx` | Modal de tipo de entrega (mesa, pickup, delivery) |
| `CartWrapper.tsx` | Decide entre sidebar desktop (`DesktopCartSidebar`) y sheet móvil (`MobileCartSheet`) |
| `CartItem.tsx` | Renderiza cada plato en el carrito con sus extras y observaciones `notes` |
| `MenuController.tsx` | Orquesta qué sección del menú renderizar según scroll/categoría activa |
| `BestSellersSectionOrder.tsx` | Sección de bestsellers con funcionalidad de pedido |
| `ProductBuilderSectionOrder.tsx` | Sección "Arma tu..." con pasos guiados para armar pedidos personalizados |
| `OrderConfirmationModal.tsx` | Modal de confirmación de pedido enviado por WhatsApp |

---

## Variables de Entorno (`.env.local`)

```bash
PUBLIC_SANITY_PROJECT_ID=       # Sanity Project ID
SANITY_API_TOKEN=               # Token con permisos de editor
CLIENT_URL=                     # URL pública del sitio (ej: https://tumenu.click)
SANITY_STUDIO_DEV_MODE=false    # true para desbloquear campos protegidos en Studio
SANITY_STUDIO_TITLE=            # Título del dashboard del Studio
```

---

## Scripts Disponibles

```bash
pnpm dev              # Servidor de desarrollo en http://localhost:3000
pnpm build            # Build de producción (genera manifest antes del build)
pnpm migrate          # Migra datos (scripts/migrate-data.ts)
pnpm generate:manifest # Genera manifest PWA
```

### Scripts en `/scripts/`
- `templatePort.sh` — Sincroniza y actualiza clientes desde la plantilla maestra `tumenuclick-master`
- `backport.sh` — Asistente para enviar mejoras de un cliente a la plantilla maestra
- `seed-sanity.ts` — Puebla Sanity con datos iniciales
- `generate-manifest.ts` — Genera el web app manifest dinámico
- `migrate-theme.ts` — Migra datos de tema al nuevo documento `theme`
- `export-sanity-data.ts` — Exporta datos de Sanity a JSON
- `generate-slugs.ts` — Genera slugs para productos existentes
- `assign-photo-to-products.ts` — Asigna imágenes bulk a productos
- `delete-legacy.js` — Elimina campos/documentos legados de Sanity

---

## Patrones a Seguir

1. **Consultas GROQ**: Todos los cambios de datos van en la consulta `menuDataQuery` dentro de `src/lib/queries.ts`. No crear consultas adicionales salvo casos excepcionales.
2. **Nuevos campos de Schema**: Agregar en `src/schema/menuTypes.ts` o `productTypes.ts`/`categoryTypes.ts` según corresponda, y exportar desde `src/schema/index.ts`.
3. **Nuevos campos de tema**: Agregar el `colorField()` en el tipo de tema correspondiente en `menuTypes.ts`. El helper `colorField(name, title)` ya incluye validación hex y el color picker personalizado.
4. **CSS Variables de Tema**: El tema se aplica a través de CSS custom properties (`--color-xxx`) inyectadas en el documento. No hardcodear colores en componentes; usar siempre las vars del tema.
