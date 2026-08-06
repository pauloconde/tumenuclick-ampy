import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './src/schema/';
import Favicon from './src/schema/inputs/FaviconPreview';
import { esESLocale } from '@sanity/locale-es-es';
import { codeInput } from '@sanity/code-input';
import { media } from 'sanity-plugin-media';

// Define the singleton document types
const singletonTypes = new Set(['brand', 'menu', 'siteConfig', 'typography', 'theme']);

// Define the singleton actions (only publish, discard changes, restore)
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  title: import.meta.env.SANITY_STUDIO_TITLE || 'Tu Menú Click Dashboard',
  icon: Favicon,

  plugins: [
    codeInput(),
    esESLocale(),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenido')
          .items([
            // ── Contenido Principal ──
            S.listItem()
              .title('Catálogo')
              .id('menu')
              .child(
                S.document()
                  .schemaType('menu')
                  .documentId('menu')
              ),
            S.listItem()
              .title('Categorías')
              .id('category')
              .child(
                S.documentTypeList('category')
              ),
            S.listItem()
              .title('Productos')
              .id('product')
              .child(
                S.documentTypeList('product')
              ),
            S.divider(),
            // ── Modificadores ──
            S.listItem()
              .title('Grupos de Opciones')
              .id('optionGroupTemplate')
              .child(
                S.documentTypeList('optionGroupTemplate')
              ),
            S.listItem()
              .title('Grupos de Extras')
              .id('extraGroupTemplate')
              .child(
                S.documentTypeList('extraGroupTemplate')
              ),
            S.divider(),
            // ── Configuración ──
            S.listItem()
              .title('Configuración')
              .id('siteConfig')
              .child(
                S.document()
                  .schemaType('siteConfig')
                  .documentId('siteConfig')
              ),
            S.listItem()
              .title('Marca')
              .id('brand')
              .child(
                S.document()
                  .schemaType('brand')
                  .documentId('brand')
              ),
            S.listItem()
              .title('Tema')
              .id('theme')
              .child(
                S.document()
                  .schemaType('theme')
                  .documentId('theme')
              ),
            S.listItem()
              .title('Tipografía')
              .id('typography')
              .child(
                S.document()
                  .schemaType('typography')
                  .documentId('typography')
              ),
          ])
    }),
    media(),
  ],

  schema: {
    types: schema,
    // Filter out singleton types from the "create new" dialog
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // For singleton types, filter out actions that are not allowed (like delete or duplicate)
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});