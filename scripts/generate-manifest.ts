//USO: npx tsx scripts/generate-manifest.ts

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { getThemeColorFromCSS } from '../src/utils/theme.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Verificación de seguridad
if (!process.env.PUBLIC_SANITY_PROJECT_ID) {
    console.error('❌ Error: PUBLIC_SANITY_PROJECT_ID no está definido en .env.local');
    process.exit(1);
}

const client = createClient({
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
});

/**
 * Genera todos los iconos necesarios en la carpeta /static
 */
async function generateIcons(backgroundColor: string = '#ffffff') {
    let sharp;
    try {
        sharp = (await import('sharp')).default;
    } catch (e) {
        console.warn('⚠️ Sharp no está instalado. Saltando generación de iconos.');
        return { success: false };
    }

    const possibleExtensions = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];
    let sourcePath = '';
    let foundExtension = '';

    for (const ext of possibleExtensions) {
        const path = join(process.cwd(), 'public', `favicon${ext}`);
        if (existsSync(path)) {
            sourcePath = path;
            foundExtension = ext;
            break;
        }
    }

    if (!sourcePath) {
        console.warn('⚠️ No se encontró el archivo base (favicon.svg/png/webp) en /public');
        return { success: false };
    }

    // Definimos la carpeta de destino: "static" en la raíz
    const destDir = join(process.cwd(), 'static');

    // 1. Crear carpeta static si no existe
    if (!existsSync(destDir)) {
        mkdirSync(destDir);
        console.log('📁 Carpeta "static" creada.');
    }

    try {
        const imageBuffer = readFileSync(sourcePath);
        const isSvg = foundExtension === '.svg';

        console.log(`🖼️  Generando iconos desde ${foundExtension} en carpeta /static...`);

        // 2. Lista de PNGs a generar
        const iconsToGenerate = [
            { name: 'apple-touch-icon.png', size: 180 },
            { name: 'favicon-96.png', size: 96 },
            { name: 'favicon-192.png', size: 192 },
            { name: 'favicon-512.png', size: 512 }
        ];

        // Generar PNGs
        for (const { name, size } of iconsToGenerate) {
            await sharp(imageBuffer)
                .resize(size, size)
                .flatten({ background: backgroundColor })
                .png()
                .toFile(join(destDir, name));
            console.log(`   ✅ Generado: static/${name} (${size}x${size})`);
        }

        // 3. Generar favicon.ico (Estándar 32x32)
        await sharp(imageBuffer)
            .resize(32, 32)
            .flatten({ background: backgroundColor })
            .toFile(join(destDir, 'favicon.ico'));
        console.log(`   ✅ Generado: static/favicon.ico (32x32)`);

        // 4. Copiar el archivo original si es SVG o manejar alternativos
        if (isSvg) {
            copyFileSync(sourcePath, join(destDir, 'favicon.svg'));
            console.log(`   ✅ Copiado: static/favicon.svg`);
        }

         // 5. Copiar iconos adicionales a public
        try {
            copyFileSync(join(destDir, 'apple-touch-icon.png'), join(process.cwd(), 'public', 'apple-touch-icon.png'));
            console.log(`   ✅ Copiado: public/apple-touch-icon.png`);

            copyFileSync(join(destDir, 'favicon-192.png'), join(process.cwd(), 'public', 'icon-192.png'));
            console.log(`   ✅ Copiado: public/icon-192.png`);
        } catch (copyError) {
            console.warn('⚠️ Error copiando iconos a public:', copyError);
        }


        return { success: true, hasSvg: isSvg };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ Error procesando la imagen de origen:', errorMessage);
        return { success: false };
    }
}

async function generateManifest() {
    console.log(`🔄 Generando manifest para ID: ${process.env.PUBLIC_SANITY_PROJECT_ID}...`);

    try {
        const query = `{
            "brand": *[_type == "brand"][0],
            "config": *[_type == "menu"][0].config
        }`;

        const data = await client.fetch(query);

        // Lógica de nombres: Brand > ENV > Default
        const brandName = data.brand?.name || process.env.SANITY_STUDIO_TITLE || 'Tu Menú Click';
        const themeColor = getThemeColorFromCSS();

        // 🚀 EJECUTAR LA GENERACIÓN DE ICONOS
        const iconResult = await generateIcons('#ffffff');

        const icons: any[] = [];

        // Agregar SVG si existe
        if (iconResult.hasSvg) {
            icons.push({
                src: "/static/favicon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any"
            });
        }

        // Agregar los PNGs estándar
        icons.push(
            {
                src: "/static/favicon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable"
            },
            {
                src: "/static/favicon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable"
            },
            {
                src: "/static/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png"
            }
        );

        const manifest = {
            name: `${brandName}`,
            short_name: brandName,
            description: `Menú digital de ${brandName}`,
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: themeColor,
            icons
        };

        // El manifest.json usualmente se queda en public para que sea accesible en root
        const manifestPath = join(process.cwd(), 'public', 'manifest.json');
        writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));

        console.log('✅ manifest.json generado exitosamente!');
        console.log(`   App Name: ${manifest.name}`);

    } catch (error) {
        console.error('❌ Error fatal generando manifest:', error);
    }
}

generateManifest();