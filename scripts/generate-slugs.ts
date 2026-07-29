/**
 * Script para generar IDs de rastreo (slugs) para todos los productos del menú
 *
 * Uso: npx tsx scripts/generate-slugs.ts
 *
 * El script recorre todas las secciones del menú y genera slugs para productos
 * que no los tengan, usando el formato: RESTAURANT_ID-nombre-del-producto
 */

import { createClient } from "@sanity/client";
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

/**
 * Genera un slug a partir del nombre del producto
 * Replica la lógica del esquema de Sanity
 */
function generateSlug(name: string, prefix: string): string {
    const nameSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remover acentos
        .trim()
        .replace(/\s+/g, "-") // Espacios a guiones
        .replace(/[^\w\-]+/g, ""); // Remover caracteres especiales

    return `${prefix}-${nameSlug}`;
}

async function generateSlugs() {
    console.log("\n🔍 Obteniendo configuración del restaurante...");

    // Obtener el restaurantId de la configuración
    const config = await client.fetch(
        `*[_type == "siteConfig" && _id == "siteConfig"][0]{restaurantId}`
    );

    if (!config?.restaurantId) {
        console.error("❌ Error: No se encontró restaurantId en siteConfig");
        process.exit(1);
    }

    const restaurantId = config.restaurantId.toUpperCase();
    console.log(`   Restaurant ID: ${restaurantId}`);

    // Obtener el menú actual
    console.log("\n📂 Obteniendo menú actual...");
    const menu = await client.fetch(`*[_type == "menu" && _id == "menu"][0]`);

    if (!menu) {
        console.error("❌ Error: No se encontró el documento 'menu'");
        process.exit(1);
    }

    if (!menu.sections || menu.sections.length === 0) {
        console.log("⚠️ El menú no tiene secciones");
        process.exit(0);
    }

    console.log(`   Secciones encontradas: ${menu.sections.length}`);

    // Procesar cada sección y sus productos
    let totalProducts = 0;
    let updatedProducts = 0;
    let alreadyHadSlug = 0;
    const updatedSections: any[] = [];

    for (const section of menu.sections) {
        // Si es un productBuilder, procesarlo diferente
        if (section._type === "productBuilder") {
            // Verificar si el productBuilder tiene slug
            if (!section.slug || !section.slug.current) {
                const newSlug = generateSlug(section.title || "custom", restaurantId);
                section.slug = { _type: "slug", current: newSlug };
                console.log(`   🛠️ Builder "${section.title}": ${newSlug}`);
                updatedProducts++;
            } else {
                alreadyHadSlug++;
            }
            updatedSections.push(section);
            totalProducts++;
            continue;
        }

        // Procesar menuSection
        const updatedItems: any[] = [];

        if (section.items && section.items.length > 0) {
            for (const item of section.items) {
                totalProducts++;

                if (!item.slug || !item.slug.current) {
                    // Generar slug
                    const newSlug = generateSlug(item.name || "sin-nombre", restaurantId);
                    item.slug = { _type: "slug", current: newSlug };
                    console.log(`   ✨ "${item.name}": ${newSlug}`);
                    updatedProducts++;
                } else {
                    alreadyHadSlug++;
                }

                updatedItems.push(item);
            }
        }

        updatedSections.push({
            ...section,
            items: updatedItems,
        });
    }

    // También procesar seasonalSpecials si existe
    let updatedSeasonalSpecials = menu.seasonalSpecials;
    if (menu.seasonalSpecials?.items && menu.seasonalSpecials.items.length > 0) {
        console.log("\n🌟 Procesando Especiales de Temporada...");
        const updatedSeasonalItems: any[] = [];

        for (const item of menu.seasonalSpecials.items) {
            totalProducts++;

            if (!item.slug || !item.slug.current) {
                const newSlug = generateSlug(item.name || "sin-nombre", restaurantId);
                item.slug = { _type: "slug", current: newSlug };
                console.log(`   ✨ "${item.name}": ${newSlug}`);
                updatedProducts++;
            } else {
                alreadyHadSlug++;
            }

            updatedSeasonalItems.push(item);
        }

        updatedSeasonalSpecials = {
            ...menu.seasonalSpecials,
            items: updatedSeasonalItems,
        };
    }

    // Mostrar resumen
    console.log("\n📊 Resumen:");
    console.log(`   Total de productos: ${totalProducts}`);
    console.log(`   Ya tenían slug: ${alreadyHadSlug}`);
    console.log(`   Slugs generados: ${updatedProducts}`);

    // Guardar cambios si hay actualizaciones
    if (updatedProducts > 0) {
        console.log("\n💾 Guardando cambios en Sanity...");

        const updateData: any = { sections: updatedSections };
        if (updatedSeasonalSpecials) {
            updateData.seasonalSpecials = updatedSeasonalSpecials;
        }

        await client.patch("menu").set(updateData).commit();

        console.log("✅ ¡Slugs actualizados exitosamente!");
    } else {
        console.log("\n✅ No hay productos sin slug. Todo está actualizado.");
    }
}

// Ejecutar
generateSlugs().catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
});
