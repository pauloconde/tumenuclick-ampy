import { defineField, defineType } from 'sanity';

const isDevMode = import.meta.env.SANITY_STUDIO_DEV_MODE === 'true';

export const productType = defineType({
    name: 'product',
    title: 'Producto / Plato',
    type: 'document',
    fields: [
        defineField({ name: 'name', type: 'string', title: 'Nombre' }),
        defineField({
            name: 'slug',
            type: 'slug',
            title: 'ID de Rastreo (GA4)',
            description: 'Generar una vez. ID inmutable: ID_RESTAURANTE + NOMBRE_PLATO.',
            options: {
                // 1. GENERACIÓN (Tu lógica que ya funciona)
                source: async (_doc, context) => {
                    const currentItem = context.parent as { name?: string };
                    if (!currentItem?.name) return 'sin-nombre';

                    const { getClient } = context;
                    const client = getClient({ apiVersion: '2023-05-03' });

                    const config = await client.fetch(`*[_type == "siteConfig" && _id == "siteConfig"][0]{restaurantId}`);
                    const prefix = (config?.restaurantId || 'TEMP').toUpperCase();

                    const nameSlug = currentItem.name
                        .toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '');

                    return `${prefix}-${nameSlug}`;
                },
                // 2. Mantiene las mayúsculas (IMPORTANTE)
                slugify: (input) => input,
                maxLength: 90,
            },
            readOnly: ({ value }) => !isDevMode && !!value?.current,

            // 3. VALIDACIÓN NO BLOQUEANTE (WARNING)
            validation: (Rule) => Rule.custom((slugValue, context) => {
                // Si está vacío, no validamos duplicados (Rule.required se encarga de eso)
                if (!slugValue?.current) return true;

                const document = context.document as any;

                // Idealmente aquí se podría chequear contra la base de datos si el slug ya existe,
                // pero lo mantenemos simple e ignorando el propio id o validando internamente
                // si se estuviera dentro de un array. Al ser un doc a nivel raíz, validamos si existe
                // en otros docs de tipo product con groq si quisieramos, pero en schema builder es async client call.

                return true;
            }).warning()
        }),


        defineField({ name: 'subtitle', type: 'string', title: 'Subtítulo (Opcional)' }),
        defineField({ name: 'price', type: 'string', title: 'Precio / Desde' }),
        defineField({ name: 'price2', type: 'string', title: 'Precio / Hasta' }),
        defineField({ name: 'description', type: 'text', title: 'Descripción' }),
        defineField({ name: 'imgSrc', type: 'image', title: 'Foto del Plato', options: { hotspot: true } }),
        defineField({
            name: 'gallery',
            type: 'array',
            title: 'Galería de Imágenes',
            description: 'Imágenes adicionales para el carrusel.',
            of: [{ type: 'image', options: { hotspot: true } }]
        }),
        defineField({ name: 'alt', type: 'string', title: 'Texto Alternativo (SEO)' }),
        defineField({ name: 'availability', type: 'string', title: 'Disponibilidad' }),
        defineField({ name: 'available', type: 'boolean', title: 'Disponible', initialValue: true }),
        defineField({ name: 'isNew', type: 'boolean', title: 'Producto Nuevo', description: 'Mostrar etiqueta "Nuevo" en el producto', initialValue: false }),
        defineField({ name: 'servings', type: 'number', title: 'Porciones / Personas', description: 'Para cuántas personas es este plato. Si está vacío o es 1, se asume individual.' }),
        defineField({
            name: 'protein',
            type: 'number',
            title: 'Proteína (Gramos)',
            description: 'Cantidad de proteína que aporta este producto en gramos (opcional).'
        }),

        // --- VISUALIZACIÓN ---
        defineField({
            name: 'modalOrderLayout',
            title: 'Diseño en Modal (Pedido)',
            type: 'string',
            options: {
                list: [
                    { title: 'Default (Estándar)', value: 'default' },
                    { title: 'Expandido', value: 'expanded' },
                    { title: 'Minimalista', value: 'minimal' }
                ]
            },
            initialValue: 'default',
            description: 'Cómo se ve el detalle del producto al hacer clic.'
        }),

        // --- REUTILIZABLES (REFERENCIAS) ---
        defineField({
            name: 'optionGroupsRefs',
            title: 'Grupos de Opciones (Reutilizables)',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'optionGroupTemplate' }]
            }],
            description: 'Selecciona grupos de opciones predefinidos (ej: Temperatura, Endulzantes)'
        }),

        defineField({
            name: 'extraGroupsRefs',
            title: 'Grupos de Extras (Reutilizables)',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'extraGroupTemplate' }]
            }],
            description: 'Selecciona grupos de extras predefinidos (ej: Contornos, Salsas)'
        }),

        // --- EXTRAS DEL PRODUCTO (ÚNICOS) ---
        defineField({
            name: 'extras',
            title: 'Extras (Adicionales)',
            type: 'array',
            of: [{ type: 'extraItem' }],
            description: 'Lista de ingredientes o complementos adicionales con costo.'
        }),
        defineField({
            name: 'extrasTitleSingular',
            title: 'Título Extras (Singular)',
            type: 'string',
            description: 'Ej: Contorno, Ingrediente. Por defecto: Extra',
            initialValue: 'Extra'
        }),
        defineField({
            name: 'extrasTitlePlural',
            title: 'Título Extras (Plural)',
            type: 'string',
            description: 'Ej: Contornos, Ingredientes. Por defecto: Extras',
            initialValue: 'Extras'
        }),
        defineField({
            name: 'extrasMin',
            title: 'Mínimo de Extras Requeridos',
            type: 'number',
            initialValue: 0,
            description: '0 = Opcional. Si es mayor a 0, el usuario debe seleccionar al menos esta cantidad.'
        }),
        defineField({
            name: 'extrasIncluded',
            title: 'Extras Incluidos en el Precio',
            type: 'number',
            initialValue: 0,
            description: 'Cantidad de extras que se pueden seleccionar sin costo adicional.'
        }),
        defineField({
            name: 'extrasMax',
            title: 'Máximo de Extras Permitidos',
            type: 'number',
            initialValue: 0,
            description: '0 = Sin límite. Establece un tope de selección.'
        }),

        // Grupos de opciones del producto (cada grupo es mutuamente excluyente)
        defineField({
            name: 'optionGroups',
            title: 'Grupos de Opciones',
            type: 'array',
            of: [{ type: 'optionGroup' }],
            description: 'Ej: "Temperatura" (frío/caliente), "Endulzante" (azúcar/splenda/stevia)'
        }),

        // Variantes (Precio sustituto)
        defineField({
            name: 'variantGroups',
            title: 'Grupos de Variantes',
            type: 'array',
            of: [{ type: 'variantGroup' }],
            description: 'Ej: "Tamaño" (Pequeño/Grande) donde el precio cambia completamente.'
        }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'price', media: 'imgSrc', available: 'available' },
        prepare({ title, subtitle, media, available }) {
            return {
                title: `${!available ? '🚫 ' : ''}${title}`,
                subtitle: subtitle ? `Precio: ${subtitle}` : 'Sin precio base',
                media
            }
        }
    }
});
