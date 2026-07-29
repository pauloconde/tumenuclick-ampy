import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Usa tu token nuevo aquí o desde env
const TOKEN = process.env.SANITY_DEV_TOKEN;

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  token: TOKEN,
  apiVersion: '2023-05-03',
  useCdn: false,
});

const args = process.argv.slice(2);
// Limpiamos comillas que a veces cuelan las terminales, pero NO tocamos el contenido
const OLD_COLOR = args[0] ? args[0].replace(/['"]/g, '').trim() : null;
const NEW_COLOR = args[1] ? args[1].replace(/['"]/g, '').trim() : null;

if (!OLD_COLOR || !NEW_COLOR) {
  console.error("❌ Uso: node scripts/replace-strict.js \"#Original\" \"#Nuevo\"");
  console.error("   Nota: La búsqueda es exacta (case-insensitive).");
  process.exit(1);
}

async function replaceStrict() {
  const targetUpper = OLD_COLOR.toUpperCase();
  const replacementUpper = NEW_COLOR.toUpperCase();

  console.log(`🎯 Modo Estricto Activado`);
  console.log(`   Buscando EXACTAMENTE: ${targetUpper}`);
  console.log(`   Reemplazando con:     ${replacementUpper}`);

  try {
    const brandDoc = await client.fetch('*[_type == "brand"][0]');
    if (!brandDoc) return console.error("❌ No brand doc found");

    const patches = {};
    let count = 0;

    function traverse(obj, path = '') {
      for (const key in obj) {
        if (key.startsWith('_')) continue;
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string') {
          // COMPARACIÓN ESTRICTA
          if (value.toUpperCase() === targetUpper) {
            patches[currentPath] = NEW_COLOR; // Usamos el input original del usuario para el reemplazo
            console.log(`   ✅ Match en: ${currentPath}`);
            count++;
          }
        } else if (typeof value === 'object' && value !== null) {
          traverse(value, currentPath);
        }
      }
    }

    traverse(brandDoc);

    if (count === 0) {
      console.log(`⚠️ No se encontraron coincidencias exactas para ${OLD_COLOR}`);
      console.log(`   Recuerda: #000000 no es igual a #000000FF en este modo.`);
      return;
    }

    console.log(`\n⚡ Actualizando ${count} campos...`);
    await client.patch(brandDoc._id).set(patches).commit();
    console.log(`🎉 ¡Hecho!`);

  } catch (err) {
    console.error(err.message);
  }
}

replaceStrict();