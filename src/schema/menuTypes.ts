import { defineField, defineType } from 'sanity';
import { HexColorInput as ColorPicker } from './inputs/ColorPicker';

const isDevMode = import.meta.env.SANITY_STUDIO_DEV_MODE === 'true';

// Helper para campos de color con el custom input
const colorField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'string',
    components: {
      input: ColorPicker
    },
    validation: Rule => Rule.regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/).error('Formato hex inválido (#RRGGBB o #RRGGBBAA)')
  });

export const configType = defineType({
  name: 'siteConfig',
  title: 'Config',
  type: 'document',
  fields: [
    defineField({
      name: 'restaurantId',
      title: 'ID Maestro del Restaurante (14 caracteres)',
      type: 'string',
      description: 'PAIS(2) CIUDAD(3) VENDEDOR(4) CLIENTE(5) (Ej: VECCSA00200001)',
      // BLOQUEO: Solo lectura si ya existe, a menos que estemos en modo Dev Local
      readOnly: ({ document }) => !isDevMode && !!document?._createdAt,
      validation: (Rule) => Rule.required()
        .length(14)
        .uppercase()
        .regex(/^[A-Z]{2}[A-Z]{3}[A-Z]\d{3}\d{5}$/)
        .error('Formato requerido: País(2) + Ciudad(3) + Vendedor(4) + Cliente(5)')
    }),
    defineField({
      name: 'agentName',
      title: 'Nombre del Vendedor',
      type: 'string',
      description: 'Referencia interna del ejecutivo de cuenta.',
      readOnly: ({ document }) => !isDevMode && !!document?._createdAt,
    }),
    defineField({
      name: 'ga4Id',
      title: 'Google Analytics ID (Measurement ID)',
      type: 'string',
      description: 'Ej: G-XXXXXXXXXX',
    }),
    defineField({
      name: 'siteUrl',
      title: 'URL del Sitio',
      type: 'url',
      description: 'URL base del sitio desplegado (ej: https://susitio.com)',
      readOnly: ({ document }) => !isDevMode && !!document?._createdAt,
    }),
    defineField({
      name: 'enableOrdering',
      title: 'Habilitar Pedidos',
      type: 'boolean',
      description: 'Activa o desactiva el carrito y el botón de pedidos en todo el sitio.',
      initialValue: true
    }),
    defineField({
      name: 'hasDelivery',
      title: 'Habilitar Delivery',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'hasPickup',
      title: 'Habilitar Pickup (Para llevar)',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'hasDineIn',
      title: 'Habilitar Comer en el Local',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'tableCount',
      title: 'Cantidad de Mesas',
      type: 'number',
      description: 'Número máximo de mesas para la selección (si está habilitado Comer en Local).',
      initialValue: 0
    }),
  ],
});

// --- 3. Tipos de Objeto Reutilizables (Arrays de Producción Actual) ---

// --- NUEVOS TIPOS PARA EL PRODUCT BUILDER ("Arma tu...") ---

export const builderOptionType = defineType({
  name: 'builderOption',
  title: 'Opción de Ingrediente',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nombre (ej: Queso Cheddar)' }),
    defineField({
      name: 'price',
      type: 'number',
      title: 'Precio Adicional',
      description: 'Usa 0 si es gratis. Usa punto para decimales (ej: 1.5).',
      initialValue: 0
    }),
    defineField({ name: 'emoji', type: 'string', title: 'Emoji (Opcional)', description: 'Para mostrar en la tarjeta (ej: 🧀)' }),
    defineField({ name: 'isSoldOut', type: 'boolean', title: 'Agotado', initialValue: false }),
  ],
  preview: {
    select: { title: 'name', price: 'price', emoji: 'emoji', soldOut: 'isSoldOut' },
    prepare({ title, price, emoji, soldOut }) {
      return {
        title: `${emoji || ''} ${title} ${soldOut ? '(🚫 AGOTADO)' : ''}`,
        subtitle: price && price > 0 ? `+$${price}` : 'Gratis'
      }
    }
  }
});

export const builderStepType = defineType({
  name: 'builderStep',
  title: 'Paso del Constructor',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Título del Paso (ej: Elige el Pan)' }),
    defineField({ name: 'subtitle', type: 'string', title: 'Instrucción (ej: Selección única)' }),
    defineField({
      name: 'maxSelection',
      type: 'number',
      title: 'Selección Máxima',
      description: '1 = Tipo Radio (Solo uno). >1 = Tipo Checkbox (Varios).',
      initialValue: 1,
      validation: Rule => Rule.min(1).required()
    }),
    defineField({
      name: 'required',
      type: 'boolean',
      title: 'Es Obligatorio',
      description: 'Si es true, el usuario no puede avanzar sin seleccionar al menos uno.',
      initialValue: true
    }),
    defineField({
      name: 'options',
      title: 'Opciones Disponibles',
      type: 'array',
      of: [{ type: 'builderOption' }]
    })
  ],
  preview: {
    select: { title: 'title', max: 'maxSelection', options: 'options' },
    prepare({ title, max, options }) {
      const count = options ? options.length : 0;
      const type = max === 1 ? '🔘 Selección Única' : `☑️ Selección Múltiple (Max ${max})`;
      return {
        title: title,
        subtitle: `${type} - ${count} opciones`
      }
    }
  }
});

export const productBuilderType = defineType({
  name: 'productBuilder',
  title: 'Sección: Constructor (Arma tu...)',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Título Principal (ej: Arma tu Pizza)' }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'ID de Rastreo (GA4)',
      options: {
        source: async (doc, context) => {
          // ... (Tu lógica de source que ya tenías está bien) ...
          const currentItem = context.parent as { title?: string };
          const { getClient } = context;
          const client = getClient({ apiVersion: '2024-01-01' });
          const config = await client.fetch(`*[_type == "siteConfig" && _id == "siteConfig"][0]{restaurantId}`);

          // Aseguramos mayúsculas aquí también para el botón "Generate" del Studio
          const prefix = (config?.restaurantId || 'TEMP').toUpperCase();

          const nameSlug = (currentItem?.title || 'custom')
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '');

          return `${prefix}-${nameSlug}`;
        },
        slugify: (input) => input,

        maxLength: 90,
      },
      validation: Rule => Rule.required()
    }),
    defineField({ name: 'description', type: 'text', title: 'Descripción Corta', rows: 2 }),
    defineField({ name: 'image', type: 'image', title: 'Imagen de Portada', options: { hotspot: true } }),
    defineField({
      name: 'basePrice',
      type: 'number',
      title: 'Precio Base',
      description: 'Precio inicial antes de agregar extras.',
      initialValue: 0
    }),
    defineField({
      name: 'steps',
      title: 'Pasos de Construcción',
      type: 'array',
      of: [{ type: 'builderStep' }]
    })
  ],
  preview: {
    select: { title: 'title', steps: 'steps', media: 'image' },
    prepare({ title, steps, media }) {
      return {
        title: `🛠️ ${title}`,
        subtitle: `${steps ? steps.length : 0} pasos configurados`,
        media: media
      }
    }
  }
});

export const addressType = defineType({
  name: 'address',
  title: 'Dirección de Sucursal',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nombre' }),
    defineField({ name: 'address', type: 'string', title: 'Dirección' }),
    defineField({ name: 'schedule', type: 'string', title: 'Horario' }),
    defineField({ name: 'mapUrl', type: 'url', title: 'URL de Google Maps' }),
    defineField({ name: 'showTitle', type: 'boolean', title: 'Mostrar Título', initialValue: true })
  ],
});

export const socialMediaType = defineType({
  name: 'socialMediaItem',
  title: 'Red Social',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nombre (ej: Instagram)' }),
    defineField({ name: 'url', type: 'url', title: 'URL Completa' }),
  ],
});

export const extraType = defineType({
  name: 'extraItem',
  title: 'Extra de Producto',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nombre del Extra' }),
    defineField({ name: 'price', type: 'string', title: 'Precio del Extra' }),
    defineField({
      name: 'isRecommended',
      type: 'boolean',
      title: 'Recomendado',
      description: 'Muestra una etiqueta de "Recomendado" en este extra.',
      initialValue: false
    }),
  ],
});

// Tipo para opciones mutuamente excluyentes (solo se puede seleccionar 1)
export const optionItemType = defineType({
  name: 'optionItem',
  title: 'Opción de Producto',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nombre de la Opción' }),
    defineField({ name: 'price', type: 'string', title: 'Precio de la Opción', description: 'Diferencia de precio (puede ser vacío si no afecta el precio)' }),
    defineField({
      name: 'isDefault',
      type: 'boolean',
      title: 'Opción Predeterminada',
      description: 'Marcar como la opción seleccionada por defecto',
      initialValue: false
    }),
  ],
  preview: {
    select: { title: 'name', price: 'price', isDefault: 'isDefault' },
    prepare({ title, price, isDefault }) {
      return {
        title: `${isDefault ? '✓ ' : ''}${title}`,
        subtitle: price ? `+${price}` : 'Sin costo adicional'
      }
    }
  }
});

// Grupo de opciones con título (para agrupar opciones relacionadas)
export const optionGroupType = defineType({
  name: 'optionGroup',
  title: 'Grupo de Opciones',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Título del Grupo',
      description: 'Ej: "Temperatura", "Endulzante", "Tamaño"'
    }),
    defineField({
      name: 'showTitle',
      type: 'boolean',
      title: 'Mostrar Título',
      initialValue: true
    }),
    defineField({
      name: 'options',
      title: 'Opciones',
      type: 'array',
      of: [{ type: 'optionItem' }],
      description: 'Opciones mutuamente excluyentes (solo se puede elegir 1 de este grupo)'
    }),
  ],
  preview: {
    select: { title: 'title', options: 'options' },
    prepare({ title, options }) {
      const count = options ? options.length : 0;
      const defaultOption = options?.find((o: any) => o.isDefault);
      return {
        title: title || 'Grupo sin título',
        subtitle: `${count} opciones${defaultOption ? ` • Default: ${defaultOption.name}` : ''}`
      }
    }
  }
});

// --- 3a. Variantes (Precio Sustituto) ---

export const variantItemType = defineType({
  name: 'variantItem',
  title: 'Variante de Producto',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nombre de la Variante' }),
    defineField({
      name: 'price',
      type: 'string',
      title: 'Precio de la Variante',
      description: 'Este precio SUSTITUYE al precio base del producto.',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Imagen de la Variante',
      description: 'Opcional. Si se selecciona esta variante, se mostrará esta imagen.',
      options: { hotspot: true }
    }),
    defineField({
      name: 'isDefault',
      type: 'boolean',
      title: 'Variante Predeterminada',
      description: 'Marcar como la variante seleccionada por defecto',
      initialValue: false
    }),
  ],
  preview: {
    select: { title: 'name', price: 'price', isDefault: 'isDefault' },
    prepare({ title, price, isDefault }) {
      return {
        title: `${isDefault ? '✓ ' : ''}${title}`,
        subtitle: `Precio: ${price}`
      }
    }
  }
});

export const variantGroupType = defineType({
  name: 'variantGroup',
  title: 'Grupo de Variantes',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Título del Grupo',
      description: 'Ej: "Tamaño", "Proteína"'
    }),
    defineField({
      name: 'showTitle',
      type: 'boolean',
      title: 'Mostrar Título',
      initialValue: true
    }),
    defineField({
      name: 'variants',
      title: 'Variantes',
      type: 'array',
      of: [{ type: 'variantItem' }],
      description: 'Opciones donde el precio sustituye al base. Mutuamente excluyentes.'
    }),
  ],
  preview: {
    select: { title: 'title', variants: 'variants' },
    prepare({ title, variants }) {
      const count = variants ? variants.length : 0;
      const defaultVariant = variants?.find((v: any) => v.isDefault);
      return {
        title: title || 'Grupo de Variantes',
        subtitle: `${count} variantes${defaultVariant ? ` • Default: ${defaultVariant.name}` : ''}`
      }
    }
  }
});

// --- 3b. Plantillas Reutilizables (References) ---

export const optionGroupTemplateType = defineType({
  name: 'optionGroupTemplate',
  title: '📋 Plantilla: Grupo de Opciones',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Nombre de la Plantilla',
      description: 'Ej: "Temperatura Bebidas", "Endulzantes", "Tamaños"'
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Título que se mostrará',
      description: 'El título que verá el cliente. Ej: "Elige la temperatura"'
    }),
    defineField({
      name: 'showTitle',
      type: 'boolean',
      title: 'Mostrar Título',
      initialValue: true
    }),
    defineField({
      name: 'options',
      title: 'Opciones',
      type: 'array',
      of: [{ type: 'optionItem' }],
      description: 'Opciones mutuamente excluyentes'
    }),
  ],
  preview: {
    select: { title: 'name', options: 'options' },
    prepare({ title, options }) {
      const count = options ? options.length : 0;
      return {
        title: `📋 ${title}`,
        subtitle: `${count} opciones disponibles`
      }
    }
  }
});

export const extraGroupTemplateType = defineType({
  name: 'extraGroupTemplate',
  title: '➕ Plantilla: Grupo de Extras',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Nombre de la Plantilla',
      description: 'Ej: "Contornos Generales", "Toppings de Pizza", "Salsas"'
    }),
    defineField({
      name: 'titleSingular',
      type: 'string',
      title: 'Título (Singular)',
      description: 'Ej: Contorno, Ingrediente',
      initialValue: 'Extra'
    }),
    defineField({
      name: 'titlePlural',
      type: 'string',
      title: 'Título (Plural)',
      description: 'Ej: Contornos, Ingredientes',
      initialValue: 'Extras'
    }),
    defineField({
      name: 'extras',
      title: 'Lista de Extras',
      type: 'array',
      of: [{ type: 'extraItem' }]
    }),
    defineField({
      name: 'min',
      title: 'Mínimo Requerido',
      type: 'number',
      initialValue: 0,
      description: '0 = Opcional'
    }),
    defineField({
      name: 'included',
      title: 'Incluidos en el Precio',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'max',
      title: 'Máximo Permitido',
      type: 'number',
      initialValue: 0,
      description: '0 = Sin límite'
    }),
    defineField({
      name: 'allowQuantity',
      title: 'Permitir Cantidad Variable',
      type: 'boolean',
      initialValue: false,
      description: 'Si está activado, los clientes podrán seleccionar múltiples unidades de cada extra de este grupo.'
    }),
  ],
  preview: {
    select: {
      title: 'name',
      extras: 'extras',
      min: 'min',
      max: 'max'
    },
    prepare({ title, extras, min, max }) {
      const count = extras ? extras.length : 0;
      const range = min > 0 ? `Min: ${min}` : max > 0 ? `Max: ${max}` : 'Opcional';
      return {
        title: `➕ ${title}`,
        subtitle: `${count} extras • ${range}`
      }
    }
  }
});

export const seasonalSpecialsType = defineType({
  name: 'seasonalSpecials',
  title: 'Especiales de Temporada',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Título' }),
    defineField({ name: 'subtitle', type: 'string', title: 'Subtítulo' }),
    defineField({
      name: 'items',
      title: 'Productos de Temporada',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }]
    }),
  ],
});

// --- Tipos de Tema ---

export const themeApplicationType = defineType({
  name: 'themeApplication',
  title: 'Tema Aplicación',
  type: 'object',
  fields: [
    colorField('bgMain', 'Fondo Principal'),
    colorField('textTitle', 'Títulos Principales'),
    colorField('textSubtitle', 'Subtítulos'),
    colorField('textSection', 'Títulos de Secciones'),
    colorField('textPrice', 'Precios (Default)'),
    colorField('contentBg', 'Fondo de Contenido'),
    colorField('menuItemBg', 'Fondo de Items de Menú'),
    colorField('menuItemBorder', 'Borde de Items de Menú'),
    colorField('productBackgroundColor', 'Color de Fondo Global Productos'),
  ],
});

export const themeNavbarType = defineType({
  name: 'themeNavbar',
  title: 'Tema Navbar',
  type: 'object',
  fields: [
    colorField('bg', 'Fondo del Navbar'),
    colorField('text', 'Texto General'),
    colorField('border', 'Bordes'),
    colorField('logoBg', 'Logo - Fondo'),
    colorField('logoText', 'Logo - Texto'),
    colorField('selectBg', 'Selector - Fondo'),
    colorField('selectBorder', 'Selector - Borde'),
    colorField('selectText', 'Selector - Texto'),
    colorField('selectIcon', 'Selector - Icono'),
    colorField('selectOptionBg', 'Opciones - Fondo'),
    colorField('selectOptionText', 'Opciones - Texto'),
    colorField('selectOptionHoverBg', 'Opciones Hover - Fondo'),
    colorField('selectOptionHoverText', 'Opciones Hover - Texto'),
    defineField({ name: 'selectRadius', type: 'string', title: 'Border Radius (ej: 0.5rem)', initialValue: '0.5rem' }),
  ],
});

export const themeBestSellersType = defineType({
  name: 'themeBestSellers',
  title: 'Tema Best Sellers',
  type: 'object',
  fields: [
    colorField('bg', 'Fondo de la Sección'),
    colorField('textTitle', 'Título de la Sección'),
    colorField('cardBg', 'Cards - Fondo'),
    colorField('textName', 'Cards - Nombre del Plato'),
    colorField('textPrice', 'Cards - Precio'),
    colorField('scrollbarThumb', 'Scrollbar - Thumb'),
    colorField('scrollbarTrack', 'Scrollbar - Track'),
  ],
});

export const themeSeasonalType = defineType({
  name: 'themeSeasonal',
  title: 'Tema Seasonal',
  type: 'object',
  fields: [
    colorField('bg', 'Fondo de la Sección'),
    colorField('subtitle', 'Subtítulo'),
    colorField('textTitle', 'Título de la Sección'),
    colorField('textSubtitle', 'Texto Descriptivo'),
    colorField('cardBg', 'Cards - Fondo'),
    colorField('textName', 'Cards - Nombre del Plato'),
    colorField('textPrice', 'Cards - Precio'),
    colorField('scrollbarThumb', 'Scrollbar - Thumb'),
    colorField('scrollbarTrack', 'Scrollbar - Track'),
  ],
});

export const themeExtrasType = defineType({
  name: 'themeExtras',
  title: 'Tema Extras',
  type: 'object',
  fields: [
    colorField('bg', 'Fondo de la Sección'),
    colorField('border', 'Bordes'),
    colorField('text', 'Texto General'),
    colorField('price', 'Precios'),
  ],
});

export const themeModalType = defineType({
  name: 'themeModal',
  title: 'Tema Modal',
  type: 'object',
  fields: [
    colorField('overlay', 'Overlay de Fondo'),
    colorField('bg', 'Fondo del Modal'),
    colorField('gradientFrom', 'Gradiente sobre Imagen'),
    colorField('titleOverlay', 'Título sobre Imagen'),
    colorField('closeBg', 'Botón Cerrar - Fondo'),
    colorField('closeHover', 'Botón Cerrar - Hover'),
    colorField('closeIcon', 'Botón Cerrar - Icono'),
    colorField('priceBg', 'Badge Precio - Fondo'),
    colorField('priceText', 'Badge Precio - Texto'),
    colorField('description', 'Texto de Descripción'),
    colorField('scrollbarTrack', 'Scrollbar - Track'),
    colorField('scrollbarThumb', 'Scrollbar - Thumb'),
  ],
});

export const themeFooterType = defineType({
  name: 'themeFooter',
  title: 'Tema Footer',
  type: 'object',
  fields: [
    colorField('bg', 'Fondo del Footer'),
    colorField('text', 'Texto General'),
    colorField('accent', 'Acentos'),
    colorField('btnBg', 'Botones - Fondo'),
    colorField('btnText', 'Botones - Texto/Icono'),
    colorField('btnHover', 'Botones - Hover Fondo'),
  ],
});

export const themeSubfooterType = defineType({
  name: 'themeSubfooter',
  title: 'Tema Subfooter',
  type: 'object',
  fields: [
    colorField('bg', 'Fondo del Subfooter'),
    colorField('text', 'Texto'),
  ],
});

export const themeUIType = defineType({
  name: 'themeUI',
  title: 'Tema UI',
  type: 'object',
  fields: [
    colorField('overlayCurtain', 'Overlay de Transición'),
    colorField('topButtonBg', 'Botón "Volver Arriba" - Fondo'),
    colorField('topButtonIcon', 'Botón "Volver Arriba" - Icono'),
    colorField('whatsappButtonBg', 'Botón WhatsApp - Fondo'),
    colorField('whatsappButtonIcon', 'Botón WhatsApp - Icono'),
    colorField('backBtnBg', 'Botón Volver - Fondo'),
    colorField('backBtnText', 'Botón Volver - Texto/Icono'),
  ],
});

export const themeOrderingType = defineType({
  name: 'themeOrdering',
  title: 'Tema Sistema de Pedidos',
  type: 'object',
  fields: [
    // Botón de Modo Pedido DESKTOP
    colorField('orderingBtnDesktopBgInactive', 'Botón Desktop: Fondo Inactivo'),
    colorField('orderingBtnDesktopTextInactive', 'Botón Desktop: Texto Inactivo'),
    colorField('orderingBtnDesktopBorderInactive', 'Botón Desktop: Borde Inactivo'),

    colorField('orderingBtnDesktopBgActive', 'Botón Desktop: Fondo Activo (Ordenando)'),
    colorField('orderingBtnDesktopTextActive', 'Botón Desktop: Texto Activo'),
    colorField('orderingBtnDesktopBorderActive', 'Botón Desktop: Borde Activo'),

    colorField('orderingBtnDesktopBgHover', 'Botón Desktop: Fondo Hover'),
    colorField('orderingBtnDesktopTextHover', 'Botón Desktop: Texto Hover'),
    colorField('orderingBtnDesktopBorderHover', 'Botón Desktop: Borde Hover'),

    // FAB Móvil
    colorField('orderingBtnMobileBgInactive', 'Móvil FAB: Fondo Inactivo'),
    colorField('orderingBtnMobileTextInactive', 'Móvil FAB: Icono Inactivo'),

    colorField('orderingBtnMobileBgActive', 'Móvil FAB: Fondo Activo (X)'),
    colorField('orderingBtnMobileTextActive', 'Móvil FAB: Icono Activo'),

    // Legacy / Shared (Mantener si se usan en badges compartidos, o migrar)
    colorField('orderingBtnBadgeBg', 'Badge Contador - Fondo'),
    colorField('orderingBtnBadgeText', 'Badge Contador - Texto'),
    // Barra Móvil de Pedidos
    colorField('mobileCartBarBg', 'Barra Móvil - Fondo'),
    colorField('mobileCartBarItemCount', 'Barra Móvil - Contador Items'),
    colorField('mobileCartBarTotal', 'Barra Móvil - Total'),
    colorField('mobileCartBarBtnBg', 'Barra Móvil - Botón Fondo'),
    colorField('mobileCartBarBtnText', 'Barra Móvil - Botón Texto'),
    // Carrito
    colorField('cartBg', 'Carrito - Fondo'),
    colorField('cartHeaderBg', 'Carrito - Header Fondo'),
    colorField('cartHeaderText', 'Carrito - Header Texto'),
    colorField('cartItemBg', 'Carrito - Item Fondo'),
    colorField('cartItemText', 'Carrito - Item Texto'),
    colorField('cartItemExtras', 'Carrito - Extras Texto'),
    colorField('cartItemPrice', 'Carrito - Item Precio'),
    colorField('cartTotalBg', 'Carrito - Total Fondo'),
    colorField('cartTotalText', 'Carrito - Total Texto'),
    colorField('cartTotalPrice', 'Carrito - Total Precio'),
    colorField('cartEmptyText', 'Carrito - Vacío Texto'),
    colorField('cartEmptyBtnBg', 'Carrito - Botón Vaciar Fondo'),
    colorField('cartEmptyBtnText', 'Carrito - Botón Vaciar Texto'),
    // WhatsApp
    colorField('cartWhatsappBg', 'WhatsApp - Fondo'),
    colorField('cartWhatsappText', 'WhatsApp - Texto'),
    colorField('cartWhatsappIcon', 'WhatsApp - Icono'),
    // Controles Cantidad
    colorField('quantityBg', 'Cantidad - Fondo'),
    colorField('quantityText', 'Cantidad - Texto'),
    colorField('quantityBtnBg', 'Cantidad - Botón Fondo'),
    colorField('quantityBtnText', 'Cantidad - Botón Texto'),
    // Product Cards
    colorField('productBadgeBg', 'Producto - Badge Fondo'),
    colorField('productBadgeText', 'Producto - Badge Texto'),
    colorField('productAddBtnBg', 'Producto - Botón (+) Fondo'),
    colorField('productAddBtnBorder', 'Producto - Botón (+) Borde'),
    colorField('productAddBtnText', 'Producto - Botón (+) Texto'),
    // Modal Producto
    colorField('productModalBg', 'Modal - Fondo'),
    colorField('productModalText', 'Modal - Texto'),
    colorField('productModalBtnBg', 'Modal - Botón Agregar Fondo'),
    colorField('productModalBtnText', 'Modal - Botón Agregar Texto'),
    colorField('productExtraBg', 'Modal - Extra Fondo'),
    colorField('productExtraSelected', 'Modal - Extra Seleccionado'),
    colorField('productExtraText', 'Modal - Extra Texto'),
    colorField('productCarouselDot', 'Modal - Carousel Dots (Order)'),
    // FAB
    colorField('fabBg', 'FAB - Fondo'),
    colorField('fabText', 'FAB - Icono'),
    colorField('fabBadgeBg', 'FAB - Badge Fondo'),
    colorField('fabBadgeText', 'FAB - Badge Texto'),

    // Badge "Nuevo"
    colorField('newBadgeBg', 'Badge Nuevo - Fondo'),
    colorField('newBadgeText', 'Badge Nuevo - Texto'),

    // Modal de Entrega (Fulfillment)
    colorField('fulfillmentModalBg', 'Modal Entrega - Fondo'),
    colorField('fulfillmentModalText', 'Modal Entrega - Texto Principal'),
    colorField('fulfillmentOptionBg', 'Opción - Fondo'),
    colorField('fulfillmentOptionBorder', 'Opción - Borde'),
    colorField('fulfillmentOptionText', 'Opción - Texto'),
    colorField('fulfillmentOptionHoverBg', 'Opción Hover - Fondo'),
    colorField('fulfillmentOptionHoverBorder', 'Opción Hover - Borde'),
    colorField('fulfillmentOptionSelectedBg', 'Opción Seleccionada - Fondo'),
    colorField('fulfillmentOptionSelectedBorder', 'Opción Seleccionada - Borde'),
    colorField('fulfillmentOptionSelectedText', 'Opción Seleccionada - Texto'),
    colorField('fulfillmentInputBg', 'Input Mesa - Fondo'),
    colorField('fulfillmentInputBorder', 'Input Mesa - Borde'),
    colorField('fulfillmentInputText', 'Input Mesa - Texto'),
    colorField('fulfillmentConfirmBtnBg', 'Botón Confirmar - Fondo'),
    colorField('fulfillmentConfirmBtnText', 'Botón Confirmar - Texto'),
    colorField('fulfillmentCancelBtnBorder', 'Botón Cancelar - Borde'),
    colorField('fulfillmentCancelBtnText', 'Botón Cancelar - Texto'),
    colorField('fulfillmentCheckBg', 'Check - Fondo'),
    colorField('fulfillmentCheckIcon', 'Check - Icono'),
  ],
});

export const themeProductBuilderType = defineType({
  name: 'themeProductBuilder',
  title: 'Tema Arma tu Producto',
  type: 'object',
  fields: [
    // Card container
    colorField('cardBg', 'Tarjeta - Fondo'),
    colorField('cardBorder', 'Tarjeta - Borde'),
    // Progress bar
    colorField('progressActive', 'Barra de Progreso - Activo'),
    colorField('progressInactive', 'Barra de Progreso - Inactivo'),
    // Step header
    colorField('stepIndicatorText', 'Indicador de Paso - Texto'),
    colorField('stepTitle', 'Título del Paso'),
    colorField('stepSubtitle', 'Subtítulo del Paso'),
    // Options
    colorField('optionBg', 'Opción - Fondo'),
    colorField('optionBorder', 'Opción - Borde'),
    colorField('optionText', 'Opción - Texto'),
    colorField('optionPrice', 'Opción - Precio'),
    colorField('optionSelectedBg', 'Opción Seleccionada - Fondo'),
    colorField('optionSelectedBorder', 'Opción Seleccionada - Borde'),
    colorField('optionCheckIcon', 'Opción - Ícono Check'),
    colorField('optionDisabledBg', 'Opción Deshabilitada - Fondo'),
    colorField('optionDisabledBorder', 'Opción Deshabilitada - Borde'),
    // Footer
    colorField('footerBg', 'Footer - Fondo'),
    colorField('footerBorder', 'Footer - Borde'),
    colorField('totalLabel', 'Total - Etiqueta'),
    colorField('totalPrice', 'Total - Precio'),
    // Buttons
    colorField('cancelBtnBg', 'Botón Cancelar - Fondo'),
    colorField('cancelBtnText', 'Botón Cancelar - Texto'),
    colorField('cancelBtnBorder', 'Botón Cancelar - Borde'),
    colorField('nextBtnBg', 'Botón Siguiente - Fondo'),
    colorField('nextBtnText', 'Botón Siguiente - Texto'),
    colorField('nextBtnDisabledBg', 'Botón Siguiente Deshabilitado - Fondo'),
    colorField('nextBtnDisabledText', 'Botón Siguiente Deshabilitado - Texto'),
  ],
});

// --- 4. Tipos Principales (Singletons) ---

export const fontType = defineType({
  name: 'font',
  title: 'Gestión de Tipografía',
  type: 'object',
  fieldsets: [
    { name: 'source', title: 'Origen de la Fuente', options: { columns: 2 } },
    { name: 'settings', title: 'Configuración de Estilo', options: { columns: 2 } },
    { name: 'metrics', title: 'Dimensiones', options: { columns: 2 } }
  ],
  fields: [
    // 1. Selector de origen
    defineField({
      name: 'origin',
      title: 'Origen',
      type: 'string',
      fieldset: 'source',
      options: {
        list: [
          { title: 'Google Fonts', value: 'google' },
          { title: 'Archivo Local (Custom)', value: 'custom' }
        ],
        layout: 'radio'
      },
      initialValue: 'google'
    }),

    // 2. Campo para Google Fonts (Solo si origin == google)
    defineField({
      name: 'family',
      type: 'string',
      title: 'Familia Google Font',
      description: 'Nombre exacto en Google Fonts',
      fieldset: 'source',
      hidden: ({ parent }) => parent?.origin !== 'google'
    }),

    // 3. Campo para Archivo Local (Solo si origin == custom)
    defineField({
      name: 'customFile',
      type: 'file',
      title: 'Archivo de Fuente',
      description: 'Formatos recomendados: .woff2, .woff',
      fieldset: 'source',
      hidden: ({ parent }) => parent?.origin !== 'custom',
      options: {
        accept: '.ttf,.otf,.woff,.woff2'
      }
    }),

    // 4. Nombre de familia para fuente personalizada
    defineField({
      name: 'customFamily',
      type: 'string',
      title: 'Nombre de Familia Custom',
      description: 'Ej: "MiFuenteSaaS-Bold"',
      fieldset: 'source',
      hidden: ({ parent }) => parent?.origin !== 'custom'
    }),

    // --- Configuración común ---
    defineField({
      name: 'weight',
      type: 'string',
      title: 'Peso',
      fieldset: 'settings',
      options: {
        list: [
          { title: '100 - Thin', value: '100' },
          { title: '200 - Extra Light', value: '200' },
          { title: '300 - Light', value: '300' },
          { title: '400 - Regular', value: '400' },
          { title: '500 - Medium', value: '500' },
          { title: '600 - Semi Bold', value: '600' },
          { title: '700 - Bold', value: '700' },
          { title: '800 - Extra Bold', value: '800' },
          { title: '900 - Black', value: '900' },
        ]
      },
      initialValue: '400'
    }),
    defineField({
      name: 'style',
      type: 'string',
      title: 'Estilo',
      fieldset: 'settings',
      options: {
        list: [
          { title: 'Normal', value: 'normal' },
          { title: 'Cursiva', value: 'italic' },
        ]
      },
      initialValue: 'normal'
    }),
    defineField({
      name: 'sizeValue',
      type: 'number',
      title: 'Tamaño',
      fieldset: 'metrics'
    }),
    defineField({
      name: 'sizeUnit',
      type: 'string',
      title: 'Unidad',
      fieldset: 'metrics',
      options: {
        list: [
          { title: 'px', value: 'px' },
          { title: 'rem', value: 'rem' },
          { title: 'em', value: 'em' },
          { title: '%', value: '%' },
        ]
      },
      initialValue: 'px'
    }),
    defineField({
      name: 'lineHeight',
      type: 'number',
      title: 'Alto de Línea (px)',
      fieldset: 'metrics',
      description: 'Opcional. Deja vacío para usar el valor por defecto.'
    }),
  ],
  preview: {
    select: {
      origin: 'origin',
      googleFamily: 'family',
      customFamily: 'customFamily',
      weight: 'weight',
      size: 'sizeValue',
      unit: 'sizeUnit'
    },
    prepare({ origin, googleFamily, customFamily, weight, size, unit }) {
      const name = origin === 'google' ? googleFamily : customFamily
      return {
        title: name || 'Fuente no configurada',
        subtitle: `[${(origin || 'google').toUpperCase()}] ${weight || '400'} - ${size ? size + unit : 'Default size'}`
      }
    }
  }
});

export const typographyType = defineType({
  name: 'typography',
  title: 'Tipografía',
  type: 'document',
  fields: [
    defineField({
      name: 'sectionTitle',
      title: 'Títulos de Sección',
      type: 'font',
      description: 'Fuente para los encabezados de las secciones del menú.'
    }),
    defineField({
      name: 'productTitle',
      title: 'Títulos de Producto',
      type: 'font',
      description: 'Fuente para los nombres de los productos.'
    }),
    defineField({
      name: 'productPrice',
      title: 'Precios',
      type: 'font',
      description: 'Fuente para los precios de los productos.'
    }),
    defineField({
      name: 'productDescription',
      title: 'Descripciones de Producto',
      type: 'font',
      description: 'Fuente para las descripciones de los productos.'
    }),
    defineField({
      name: 'productNameModal',
      title: 'Nombre de Producto (Modal)',
      type: 'font',
      description: 'Fuente para el nombre del producto dentro del modal de detalles.'
    })
  ],
  preview: {
    prepare() {
      return {
        title: 'Configuración Tipográfica'
      };
    }
  },
});

export const themeDocumentType = defineType({
  name: 'theme',
  title: 'Tema',
  type: 'document',
  fields: [
    defineField({
      name: 'productBackgroundImage',
      title: 'Imagen de Fondo para Productos',
      type: 'image',
      description: 'Imagen estandarizada (generalmente un patrón o textura) que irá detrás de las fotos de los productos, visible si tienen transparencia',
      options: { hotspot: true },
    }),
    defineField({
      name: 'themeApplication',
      title: 'Aplicación General',
      type: 'themeApplication',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeNavbar',
      title: 'Navbar',
      type: 'themeNavbar',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeBestSellers',
      title: 'Best Sellers',
      type: 'themeBestSellers',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeSeasonal',
      title: 'Especiales de Temporada',
      type: 'themeSeasonal',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeExtras',
      title: 'Extras',
      type: 'themeExtras',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeModal',
      title: 'Modal de Detalles',
      type: 'themeModal',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeFooter',
      title: 'Footer',
      type: 'themeFooter',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeSubfooter',
      title: 'Subfooter',
      type: 'themeSubfooter',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeUI',
      title: 'Componentes UI',
      type: 'themeUI',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeOrdering',
      title: 'Sistema de Pedidos',
      type: 'themeOrdering',
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'themeProductBuilder',
      title: 'Arma tu Producto',
      type: 'themeProductBuilder',
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Configuración de Tema' };
    }
  },
});

export const brandType = defineType({
  name: 'brand',
  title: 'Marca',
  type: 'document',
  groups: [
    { name: 'general', title: '©️ General' },
    { name: 'seo', title: '🎯 SEO' },
  ],
  fields: [
    // ===== GENERAL =====
    defineField({ name: 'name', type: 'string', title: 'Nombre de la Marca', group: 'general' }),
    defineField({ name: 'logo', type: 'image', title: 'Logotipo', options: { hotspot: true }, group: 'general' }),
    defineField({ name: 'logoOverlay', type: 'image', title: 'Logo Overlay Inicial', description: 'Logo que aparece en la animación de carga inicial', options: { hotspot: true }, group: 'general' }),
    defineField({ name: 'favicon', type: 'image', title: 'Favicon', group: 'general' }),
    defineField({ name: 'socialMedia', title: 'Redes Sociales', type: 'array', of: [{ type: 'socialMediaItem' }], group: 'general' }),
    defineField({ name: 'socialMediaSectionTitle', title: 'Título Redes', type: 'string', group: 'general' }),
    defineField({ name: 'showWhatsappButton', title: 'Mostrar WhatsApp', type: 'boolean', initialValue: false, group: 'general' }),
    defineField({ name: 'whatsappNumber', title: 'Número de WhatsApp', type: 'string', group: 'general' }),
    defineField({ name: 'whatsappMessage', title: 'Mensaje inicial', type: 'string', group: 'general' }),
    defineField({ name: 'cartWhatsappButtonText', type: 'string', title: 'Texto del Botón de Pedidos', description: 'Texto que aparece en el botón del carrito (ej: "Enviar por WhatsApp")', initialValue: 'Enviar por WhatsApp', group: 'general' }),
    defineField({ name: 'whatsappFooterText', type: 'string', title: 'Pie de página de WhatsApp', description: 'Texto al final del mensaje (ej: "_Enviado desde el menú digital_")', initialValue: '_Enviado desde el menú digital_', group: 'general' }),
    defineField({ name: 'addresses', title: 'Sucursales', type: 'array', of: [{ type: 'address' }], group: 'general' }),
    defineField({ name: 'addressesSectionTitle', title: 'Título Sucursales', type: 'string', group: 'general' }),

    // ===== SEO =====
    defineField({ name: 'description', title: 'Descripción SEO (Meta)', type: 'text', rows: 3, validation: Rule => Rule.max(160).warning('Las descripciones óptimas tienen menos de 160 caracteres.'), group: 'seo' }),
    defineField({ name: 'keywords', title: 'Palabras Clave (SEO)', type: 'string', description: 'Separadas por comas. Ej: restaurante, comida, domicilio', group: 'seo' }),

  ],
});

export const menuType = defineType({
  name: 'menu',
  title: 'Configuración del Menú',
  type: 'document',
  fields: [
    defineField({ name: 'currencySymbol', type: 'string', title: 'Símbolo de Moneda' }),
    defineField({ name: 'priceDivider', type: 'string', title: 'Divisor de Precio' }),
    defineField({ name: 'seasonalSpecials', title: 'Especiales de Temporada', type: 'seasonalSpecials' }),
    defineField({ name: 'bestSellersTitleSingular', title: 'Título BestSeller Singular', type: 'string' }),
    defineField({ name: 'bestSellersTitlePlural', title: 'Título BestSellers Plural', type: 'string' }),
    defineField({
      name: 'bestSellersItems',
      title: 'Productos BestSellers',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      description: 'Arrastra los productos para definir el orden en que aparecen en la sección BestSellers. Solo los productos aquí listados se mostrarán.'
    }),
    defineField({ name: 'showNewsSection', title: 'Mostrar Sección Nuevos', type: 'boolean', initialValue: false }),
    defineField({ name: 'newsTitleSingular', title: 'Título Nuevo Singular', type: 'string' }),
    defineField({ name: 'newsTitlePlural', title: 'Título Nuevos Plural', type: 'string' }),
    defineField({
      name: 'defaultSectionLayout',
      title: 'Diseño de Sección por Defecto',
      type: 'string',
      options: {
        list: [
          { title: 'Cuadrícula (Default)', value: 'grid' },
          { title: 'Lista', value: 'list' },
          { title: 'Carrusel', value: 'carousel' }
        ],
        layout: 'radio'
      },
      initialValue: 'grid',
      description: 'Define cómo se verán los productos en las secciones, a menos que una sección específica tenga su propia configuración.'
    }),
    defineField({
      name: 'showCategoriesPage',
      title: 'Mostrar Página de Categorías',
      type: 'boolean',
      initialValue: false,
      description: 'Si se activa, se mostrará primero un índice de categorías. Al hacer clic, se entra a ver solo esa categoría.'
    }),
    defineField({
      name: 'categoriesLayout',
      title: 'Diseño de Página de Categorías',
      type: 'string',
      options: {
        list: [
          { title: 'Default (Estándar)', value: 'default' },
          { title: 'Grid de Iconos', value: 'icon-grid' },
        ]
      },
      initialValue: 'default',
      hidden: ({ parent }) => !parent.showCategoriesPage
    }),
    defineField({
      name: 'categoriesLayoutConfig',
      title: 'Configuración de Diseño (JSON)',
      type: 'code',
      options: {
        language: 'json'
      },
      description: 'Configuración avanzada para el layout seleccionado.',
      hidden: ({ parent }) => !parent.showCategoriesPage
    }),
    defineField({
      name: 'categoriesOrder',
      title: 'Orden de Categorías',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      description: 'Arrastra las categorías para definir el orden en que aparecen en la página. Las categorías no incluidas aquí no se mostrarán.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Configuración del Menú' };
    }
  },
});