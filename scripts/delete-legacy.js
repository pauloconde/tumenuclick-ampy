/**
 * delete-legacy.js
 *
 * Limpia el campo `sections` (y los menuItems embebidos) del documento `menu` en Sanity.
 * Los datos reales ahora viven como documentos `category` y `product` separados.
 *
 * Uso: node scripts/delete-legacy.js [--dry-run]
 *   --dry-run   Solo muestra qué haría sin modificar nada.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const isDryRun = process.argv.includes('--dry-run');
const TOKEN = process.env.SANITY_DEV_TOKEN;

if (!process.env.PUBLIC_SANITY_PROJECT_ID || !TOKEN) {
    console.error('❌ Error: Faltan variables de entorno (PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET o SANITY_DEV_TOKEN).');
    process.exit(1);
}

const client = createClient({
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET,
    token: TOKEN,
    apiVersion: '2023-05-03',
    useCdn: false,
});

// ──────────────────────────────────────────────────────────────────────────────
// Qué campos legacy vamos a borrar del documento `menu`
// ──────────────────────────────────────────────────────────────────────────────
const LEGACY_FIELDS_IN_MENU = [
    'sections',          // Array de menuSection con menuItems embebidos
    'bestSellersItems',  // BestSellers array inline (si existe)
];

// ──────────────────────────────────────────────────────────────────────────────
// Función principal
// ──────────────────────────────────────────────────────────────────────────────
async function deleteLegacy() {
    console.log(`\n🧹 Script de Limpieza Legacy de Sanity`);
    console.log(`   Dataset: ${process.env.PUBLIC_SANITY_DATASET}`);
    console.log(`   Modo: ${isDryRun ? '🔍 DRY RUN (solo lectura)' : '💥 REAL (escribirá en Sanity)'}\n`);

    try {
        // ── 1. Limpiar campos legacy del documento `menu` ────────────────────────
        console.log('📋 Buscando documento(s) de tipo `menu`...');
        const menuDocs = await client.fetch('*[_type == "menu"]{_id, title, sections, bestSellersItems}');

        if (menuDocs.length === 0) {
            console.log('   ⚠️  No se encontraron documentos de tipo `menu`.');
        } else {
            console.log(`   Encontrados: ${menuDocs.length} documento(s)\n`);

            for (const doc of menuDocs) {
                console.log(`   📄 Documento: "${doc.title || doc._id}"`);

                const fieldsToUnset = [];

                for (const field of LEGACY_FIELDS_IN_MENU) {
                    if (doc[field] !== undefined && doc[field] !== null) {
                        const count = Array.isArray(doc[field]) ? doc[field].length : 1;
                        console.log(`      🗑️  Campo "${field}": ${Array.isArray(doc[field]) ? `${count} item(s)` : 'existe'}`);
                        fieldsToUnset.push(field);
                    } else {
                        console.log(`      ✅ Campo "${field}": ya vacío (nada que borrar)`);
                    }
                }

                if (fieldsToUnset.length > 0) {
                    if (!isDryRun) {
                        await client.patch(doc._id).unset(fieldsToUnset).commit();
                        console.log(`      ✅ Campos eliminados: [${fieldsToUnset.join(', ')}]`);
                    } else {
                        console.log(`      🔍 [DRY RUN] Se eliminarían: [${fieldsToUnset.join(', ')}]`);
                    }
                } else {
                    console.log(`      ✅ Documento ya limpio, sin cambios necesarios.`);
                }
            }
        }

        // ── 2. Reportar documentos `menuItem` standalone (si quedó alguno) ────────
        console.log('\n📋 Verificando si quedan documentos de tipo `menuItem` standalone...');
        const menuItems = await client.fetch('*[_type == "menuItem"]{_id, name}');

        if (menuItems.length === 0) {
            console.log('   ✅ No hay documentos `menuItem` standalone en Sanity.');
        } else {
            console.log(`   ⚠️  Encontrados ${menuItems.length} documento(s) de tipo menuItem:`);
            menuItems.forEach(item => console.log(`      - ${item._id}: ${item.name || '(sin nombre)'}`));

            if (!isDryRun) {
                console.log('\n   🗑️  Eliminando documentos `menuItem` standalone...');
                for (const item of menuItems) {
                    await client.delete(item._id);
                    console.log(`      ✅ Borrado: ${item._id} (${item.name || '(sin nombre)'})`);
                }
            } else {
                console.log(`\n   🔍 [DRY RUN] Se eliminarían ${menuItems.length} documentos menuItem.`);
            }
        }

        // ── 3. Reportar documentos `menuSection` standalone (si quedó alguno) ─────
        console.log('\n📋 Verificando si quedan documentos de tipo `menuSection` standalone...');
        const menuSections = await client.fetch('*[_type == "menuSection"]{_id, title}');

        if (menuSections.length === 0) {
            console.log('   ✅ No hay documentos `menuSection` standalone en Sanity.');
        } else {
            console.log(`   ⚠️  Encontrados ${menuSections.length} documento(s) de tipo menuSection:`);
            menuSections.forEach(s => console.log(`      - ${s._id}: ${s.title || '(sin título)'}`));

            if (!isDryRun) {
                console.log('\n   🗑️  Eliminando documentos `menuSection` standalone...');
                for (const section of menuSections) {
                    await client.delete(section._id);
                    console.log(`      ✅ Borrado: ${section._id}`);
                }
            } else {
                console.log(`\n   🔍 [DRY RUN] Se eliminarían ${menuSections.length} documentos menuSection.`);
            }
        }

        // ── 4. Resumen Final ──────────────────────────────────────────────────────
        console.log('\n' + '═'.repeat(60));
        if (isDryRun) {
            console.log('✅ DRY RUN completado. Ningún dato fue modificado.');
            console.log('   Ejecuta sin --dry-run para aplicar los cambios.\n');
        } else {
            console.log('🎉 Limpieza Legacy completada exitosamente.\n');
        }

    } catch (err) {
        console.error('\n❌ Error durante la limpieza:', err.message);
        if (err.statusCode === 401) {
            console.error('   Verifica que SANITY_DEV_TOKEN en .env.local tenga permisos de escritura (Editor o Admin).');
        }
        process.exit(1);
    }
}

deleteLegacy();
