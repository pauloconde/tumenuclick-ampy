// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// Load environment variables
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: env.CLIENT_URL,

  // Prefetch: carga módulos JS en paralelo para eliminar cadenas de dependencia críticas
  prefetch: {
    prefetchAll: true,      // Prefetch todos los links visibles
    defaultStrategy: 'load' // Cargar inmediatamente al descubrir
  },
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    define: {
      // Expose environment variables to the client (including Sanity Studio)
      'import.meta.env.SANITY_STUDIO_DEV_MODE': JSON.stringify(env.SANITY_STUDIO_DEV_MODE || 'false'),
    },
    ssr: {
      noExternal: ['@magicmenu/ui']
    },
    resolve: {
      alias: {
        'react/compiler-runtime': 'react-compiler-runtime'
      }
    }
  },

  server: {
    port: 3000
  },

  adapter: vercel({}),

  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID,
      dataset: env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production',
      studioBasePath: '/admin',
      useCdn: false,
      apiVersion: '2025-11-30',
    }),
    react()
  ]
});