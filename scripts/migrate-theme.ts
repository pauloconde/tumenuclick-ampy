import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local if present
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || 'tu-project-id',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_DEV_TOKEN,
    useCdn: false,
});

const THEME_FIELDS = [
    'productBackgroundImage',
    'themeApplication',
    'themeNavbar',
    'themeBestSellers',
    'themeSeasonal',
    'themeExtras',
    'themeModal',
    'themeFooter',
    'themeSubfooter',
    'themeUI',
    'themeOrdering',
    'themeProductBuilder',
];

async function migrateTheme() {
    console.log('🚀 Iniciando migración de Tema de Marca → Documento Tema...');

    if (!process.env.SANITY_DEV_TOKEN) {
        console.error('❌ ERROR: Falta SANITY_DEV_TOKEN en el entorno (.env.local).');
        process.exit(1);
    }

    // 1. Leer el documento brand actual
    const brandDoc = await client.fetch(
        `*[_type == "brand" && _id == "brand"][0]{ ${THEME_FIELDS.join(', ')} }`
    );

    if (!brandDoc) {
        console.error('❌ No se encontró el documento "brand". Abortando.');
        process.exit(1);
    }

    const hasData = THEME_FIELDS.some(f => brandDoc[f] != null);
    if (!hasData) {
        console.warn('⚠️  El documento "brand" no tiene campos de tema. Nada que migrar.');
    }

    // 2. Verificar si ya existe
    const existing = await client.fetch(`*[_type == "theme" && _id == "theme"][0]{ _id }`);
    if (existing?._id) {
        console.log('ℹ️  El documento "theme" ya existe. Se sobreescribirán sus datos.');
    }

    // 3. Construir el nuevo documento theme
    const themeDocument: Record<string, any> = {
        _id: 'theme',
        _type: 'theme',
    };

    for (const field of THEME_FIELDS) {
        if (brandDoc[field] != null) {
            themeDocument[field] = brandDoc[field];
        }
    }

    const copiedFields = Object.keys(themeDocument).filter(k => !k.startsWith('_'));
    if (copiedFields.length > 0) {
        console.log('📝 Copiando campos al documento "theme":');
        copiedFields.forEach(f => console.log(`   • ${f}`));
        await client.createOrReplace(themeDocument as any);
        console.log('✅ Documento "theme" creado/actualizado correctamente.');
    } else {
        await client.createIfNotExists({ _id: 'theme', _type: 'theme' } as const);
        console.log('✅ Documento "theme" vacío creado.');
    }

    // 4. Eliminar los campos del documento brand
    const fieldsToUnset = THEME_FIELDS.filter(f => brandDoc[f] != null);
    if (fieldsToUnset.length > 0) {
        console.log(`\n🧹 Eliminando ${fieldsToUnset.length} campos del documento "brand"...`);
        await client
            .patch('brand')
            .unset(fieldsToUnset)
            .commit();
        console.log('✅ Campos eliminados de "brand".');
    }

    console.log('\n🎉 Migración completada exitosamente.');
    console.log('👉 Verifica el nuevo documento "Tema" en la barra lateral del Sanity Studio.');
}

migrateTheme().catch((err) => {
    console.error('❌ Error inesperado:', err);
    process.exit(1);
});
