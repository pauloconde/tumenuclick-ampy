import { defineField, defineType } from 'sanity';

export const categoryType = defineType({
  name: 'category',
  title: 'Categoría de Menú',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Título Sección' }),
    defineField({ name: 'subtitle', type: 'string', title: 'Subtítulo' }),
    defineField({ name: 'icon', type: 'image', title: 'Ícono de la Categoría', options: { hotspot: true }, description: 'Usado en el layout de Grid de Iconos' }),
    defineField({
      name: 'version',
      title: 'Versión del Componente',
      type: 'string',
      options: {
        list: [
          { title: 'Usar Configuración Global', value: '' },
          { title: 'Cuadrícula Clásica (Grid)', value: 'grid' },
          { title: 'Lista Minimalista (List)', value: 'list' },
          { title: 'Carrusel Pro (Carousel)', value: 'carousel' },
        ],
      },
      initialValue: '',
      description: 'Define qué componente renderizará esta sección.'
    }),
    defineField({
      name: 'designConfig',
      title: 'Configuración de Diseño',
      type: 'object',
      fields: [
        // Campos para la versión GRID
        defineField({
          name: 'columns',
          title: 'Columnas',
          type: 'number',
          initialValue: 3,
          description: 'Número de columnas en desktop (Grid)',
          hidden: ({ parent }) => parent?.version !== 'grid' && parent?.version !== '',
        }),
        // Campos para la versión CAROUSEL
        defineField({
          name: 'autoplay',
          title: 'Reproducción Automática',
          type: 'boolean',
          initialValue: false,
          hidden: ({ parent }) => parent?.version !== 'carousel',
        }),
        // Campo genérico
        defineField({
          name: 'backgroundColor',
          title: 'Color de Fondo',
          type: 'string',
          description: 'Ej: #ffffff, transparent, var(--color-bg-main)'
        }),
      ],
    }),
    defineField({
      name: 'customStyles',
      title: 'Estilos Personalizados (JSON)',
      type: 'text',
      rows: 3,
      description: 'JSON válido para estilos inline. Ej: {"paddingTop": "50px"}'
    }),
    defineField({
      name: 'sortAlphabetically',
      title: 'Ordenar Platos Alfabéticamente',
      type: 'boolean',
      initialValue: false,
      description: 'Si está activado, los platos de esta sección se mostrarán en orden alfabético (A–Z) ignorando el orden manual.'
    }),
    defineField({
      name: 'products',
      title: 'Lista de Productos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }]
    }),
    defineField({
      name: 'extraGroupsRefs',
      title: 'Grupos de Extras (Templates)',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'extraGroupTemplate' }]
      }],
      description: 'Selecciona grupos de extras predefinidos que se aplicarán a TODOS los productos de esta sección (ej: Salsas, Contornos)'
    }),
  ],
});
