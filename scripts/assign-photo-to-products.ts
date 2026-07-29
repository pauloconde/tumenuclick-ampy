/**
 * Script para subir una imagen a Sanity y asignarla a todos los productos del menú
 *
 * Uso: npx tsx scripts/assign-photo-to-products.ts
 *
 * Este script:
 * 1. Sube foto.webp a Sanity Asset Storage
 * 2. Obtiene todos los productos del menú
 * 3. Asigna la imagen a cada producto uno por uno
 */

import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

// Verificar variables de entorno necesarias
const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_DEV_TOKEN;

if (!projectId) {
    console.error("❌ Error: Falta PUBLIC_SANITY_PROJECT_ID en .env.local");
    process.exit(1);
}

if (!dataset) {
    console.error("❌ Error: Falta PUBLIC_SANITY_DATASET en .env.local");
    process.exit(1);
}

if (!token) {
    console.error("❌ Error: Falta SANITY_DEV_TOKEN en .env.local");
    process.exit(1);
}

// Crear cliente de Sanity
const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-01-01",
    useCdn: false,
});

// Ruta a la imagen
const imagePath = path.resolve(process.cwd(), "plato.webp");

async function uploadImageAndAssignToProducts() {
    console.log("\n🖼️  Script: Asignar imagen a todos los productos\n");
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Dataset: ${dataset}`);

    // Verificar que la imagen existe
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Error: No se encontró la imagen: ${imagePath}`);
        process.exit(1);
    }

    console.log(`\n📂 Imagen encontrada: ${imagePath}`);

    // 1. Subir imagen a Sanity
    console.log("\n📤 Subiendo imagen a Sanity...");

    const imageFile = fs.createReadStream(imagePath);

    let uploadedAsset;
    try {
        uploadedAsset = await client.assets.upload("image", imageFile, {
            filename: "plato.webp",
            contentType: "image/webp",
        });
        console.log(`   ✅ Imagen subida exitosamente`);
        console.log(`   Asset ID: ${uploadedAsset._id}`);
    } catch (error: any) {
        console.error("❌ Error al subir la imagen:", error.message);
        process.exit(1);
    }

    // 2. Obtener el menú con todas las secciones y productos
    console.log("\n📋 Obteniendo menú y productos...");

    const menu = await client.fetch(`*[_type == "menu" && _id == "menu"][0]{
        _id,
        sections[] {
            _key,
            title,
            items[] {
                _key,
                name
            }
        },
        seasonalSpecials {
            items[] {
                _key,
                name
            }
        }
    }`);

    if (!menu) {
        console.error("❌ Error: No se encontró el documento del menú");
        process.exit(1);
    }

    // Contador de productos actualizados
    let totalProducts = 0;
    let updatedProducts = 0;

    // Referencia de imagen para asignar a productos
    const imageReference = {
        _type: "image",
        asset: {
            _type: "reference",
            _ref: uploadedAsset._id,
        },
    };

    // 3. Procesar secciones del menú
    console.log("\n🔄 Asignando imagen a productos...\n");

    if (menu.sections && menu.sections.length > 0) {
        for (let sectionIndex = 0; sectionIndex < menu.sections.length; sectionIndex++) {
            const section = menu.sections[sectionIndex];
            console.log(`📂 Sección: ${section.title || "Sin título"}`);

            if (section.items && section.items.length > 0) {
                for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
                    const item = section.items[itemIndex];
                    totalProducts++;

                    try {
                        // Usar patch con el path específico al item
                        await client
                            .patch("menu")
                            .set({
                                [`sections[${sectionIndex}].items[${itemIndex}].imgSrc`]: imageReference,
                            })
                            .commit();

                        updatedProducts++;
                        console.log(`   ✅ ${item.name || "Producto sin nombre"}`);
                    } catch (error: any) {
                        console.log(`   ❌ ${item.name || "Producto sin nombre"}: ${error.message}`);
                    }
                }
            }
        }
    }

    // 4. Procesar especiales de temporada si existen
    if (menu.seasonalSpecials?.items && menu.seasonalSpecials.items.length > 0) {
        console.log(`\n🌟 Especiales de Temporada:`);

        for (let itemIndex = 0; itemIndex < menu.seasonalSpecials.items.length; itemIndex++) {
            const item = menu.seasonalSpecials.items[itemIndex];
            totalProducts++;

            try {
                await client
                    .patch("menu")
                    .set({
                        [`seasonalSpecials.items[${itemIndex}].imgSrc`]: imageReference,
                    })
                    .commit();

                updatedProducts++;
                console.log(`   ✅ ${item.name || "Producto sin nombre"}`);
            } catch (error: any) {
                console.log(`   ❌ ${item.name || "Producto sin nombre"}: ${error.message}`);
            }
        }
    }

    // 5. Resumen
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN");
    console.log("=".repeat(50));
    console.log(`   Total de productos encontrados: ${totalProducts}`);
    console.log(`   Productos actualizados: ${updatedProducts}`);
    console.log(`   Productos con errores: ${totalProducts - updatedProducts}`);
    console.log("\n✅ ¡Proceso completado!\n");
}

// Ejecutar
uploadImageAndAssignToProducts().catch((error) => {
    console.error("\n❌ Error inesperado:", error);
    process.exit(1);
});
