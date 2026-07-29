import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.PUBLIC_SANITY_PROJECT_ID) {
  console.error("❌ Error: No se encontraron las variables de entorno.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
});

// Función para pintar el bloque (Ignora alpha solo para la visualización en consola)
function printColorBlock(hex) {
  let c = hex.replace('#', '');
  
  // Normalizar cortos (#FFF -> #FFFFFF)
  if (c.length === 3 || c.length === 4) {
    c = c.split('').map(char => char + char).join('');
  }
  
  // Si tiene Alpha (8 chars), tomamos solo los primeros 6 para el PREVIEW visual
  // (La consola no suele soportar transparencia real)
  const baseColor = c.substring(0, 6);

  const r = parseInt(baseColor.substring(0, 2), 16);
  const g = parseInt(baseColor.substring(2, 4), 16);
  const b = parseInt(baseColor.substring(4, 6), 16);

  // Si algo falló al parsear, devolvemos bloque vacío
  if (isNaN(r)) return '          ';

  const bg = `\x1b[48;2;${r};${g};${b}m`;
  const reset = `\x1b[0m`;
  return `${bg}          ${reset}`; 
}

async function analyzeStrict() {
  console.log(`🔍 Análisis ESTRICTO (Alpha-Sensitive)...`);

  try {
    // Traemos todo el documento brand
    const brandDoc = await client.fetch('*[_type == "brand"][0]');
    if (!brandDoc) return console.error("❌ No se encontró documento 'brand'.");

    const colorMap = {};

    function traverse(obj, path = '') {
      for (const key in obj) {
        if (key.startsWith('_')) continue; // Ignorar metadatos
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string' && value.startsWith('#')) {
          // ESTRICTO: Solo normalizamos a mayúsculas. NO cortamos el string.
          const exactHex = value.toUpperCase();
          
          if (!colorMap[exactHex]) colorMap[exactHex] = [];
          colorMap[exactHex].push(currentPath);
        } else if (typeof value === 'object' && value !== null) {
          traverse(value, currentPath);
        }
      }
    }

    traverse(brandDoc);

    console.log("\n🎨 REPORTE EXACTO DE COLORES");
    console.log("==================================================");

    // Ordenar alfabéticamente por código HEX para agrupar variantes cercanas
    const sortedColors = Object.entries(colorMap).sort((a, b) => a[0].localeCompare(b[0]));

    sortedColors.forEach(([color, paths]) => {
      const visualBlock = printColorBlock(color);
      
      // Detectar si tiene transparencia para avisar visualmente
      let note = "";
      if (color.length === 9) { // #RRGGBBAA
        const alpha = parseInt(color.substring(7, 9), 16);
        const opacity = ((alpha / 255) * 100).toFixed(0);
        note = ` (Opacidad: ~${opacity}%)`;
      } else if (color.length === 5) { // #RGBA
        note = " (Formato corto con Alpha)";
      }

      console.log(`\n${visualBlock}  --> ${color}${note}`);
      console.log(`   Ocurrencias: ${paths.length}`);
      paths.forEach(p => console.log(`    - ${p}`));
    });

    console.log("\n==================================================");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

analyzeStrict();