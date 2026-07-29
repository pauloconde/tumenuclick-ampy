/**
 * Script para cargar datos JSON en Sanity
 *
 * Uso: npx tsx scripts/seed-sanity.ts <archivo.json>
 *
 * El archivo JSON debe tener un _type válido según el esquema de Sanity.
 * El script usa SANITY_DEV_TOKEN del archivo .env.local para autenticación.
 */

import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: ".env.local" });

// Validar argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("❌ Error: Debes especificar un archivo JSON");
    console.error("   Uso: npx tsx scripts/seed-sanity.ts <archivo.json>");
    console.error("   Ejemplo: npx tsx scripts/seed-sanity.ts seed1.json");
    process.exit(1);
}

const jsonFilePath = args[0];

// Verificar que el archivo existe
const absolutePath = path.isAbsolute(jsonFilePath)
    ? jsonFilePath
    : path.resolve(process.cwd(), jsonFilePath);

if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: No se encontró el archivo: ${absolutePath}`);
    process.exit(1);
}

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

// Función para generar _key único para arrays
function generateKey(): string {
    return Math.random().toString(36).substring(2, 12);
}

// Función para agregar _key a items de arrays
function addKeysToArrayItems(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((item) => {
            const processed = addKeysToArrayItems(item);
            // Si es un objeto y no tiene _key, agregar uno
            if (typeof processed === "object" && processed !== null && !processed._key) {
                return { ...processed, _key: generateKey() };
            }
            return processed;
        });
    } else if (typeof obj === "object" && obj !== null) {
        const result: any = {};
        for (const key in obj) {
            result[key] = addKeysToArrayItems(obj[key]);
        }
        return result;
    }
    return obj;
}

// Función para procesar una sola sección y agregarla al menú
async function processSingleSection(sectionData: any) {
    // Agregar _key a todos los items de arrays
    const processedData = addKeysToArrayItems(sectionData);

    console.log(`\n📎 Agregando sección "${processedData.title || 'Sin título'}"...`);

    // Obtener el menú actual
    const currentMenu = await client.fetch(`*[_type == "menu" && _id == "menu"][0]`);

    if (!currentMenu) {
        console.error("❌ Error: No existe un documento 'menu'. Crea primero el menú base.");
        process.exit(1);
    }

    // Agregar la nueva sección al array de secciones
    const updatedSections = [...(currentMenu.sections || []), processedData];

    await client.patch("menu").set({ sections: updatedSections }).commit();

    console.log(`   ✅ Sección agregada: ${processedData.title}`);
    console.log(`   Productos en sección: ${processedData.items?.length || 0}`);

    // Mostrar info de optionGroups si existen
    let productsWithOptions = 0;
    processedData.items?.forEach((item: any) => {
        if (item.optionGroups && item.optionGroups.length > 0) {
            productsWithOptions++;
        }
    });
    if (productsWithOptions > 0) {
        console.log(`   Productos con opciones: ${productsWithOptions}`);
    }

    return updatedSections.length;
}

async function seedData() {
    console.log(`\n📂 Leyendo archivo: ${absolutePath}`);

    // Leer y parsear el JSON
    let jsonData: any;
    try {
        const fileContent = fs.readFileSync(absolutePath, "utf-8");
        jsonData = JSON.parse(fileContent);
    } catch (error) {
        console.error("❌ Error al leer o parsear el archivo JSON:", error);
        process.exit(1);
    }

    // Soporte para arrays de secciones
    if (Array.isArray(jsonData)) {
        console.log(`📋 Detectado array con ${jsonData.length} elementos`);

        // Verificar que todos sean menuSection
        const allMenuSections = jsonData.every((item: any) => item._type === "menuSection");
        if (!allMenuSections) {
            console.error("❌ Error: Todos los elementos del array deben ser de tipo 'menuSection'");
            process.exit(1);
        }

        // Procesar cada sección
        for (const section of jsonData) {
            await processSingleSection(section);
        }
        return;
    }

    // Verificar que tiene _type (para objetos individuales)
    if (!jsonData._type) {
        console.error("❌ Error: El JSON debe tener un campo '_type' válido");
        console.error("   Tipos disponibles: menu, brand, siteConfig, menuSection");
        console.error("   También puedes usar un array de menuSection: [{...}, {...}]");
        process.exit(1);
    }

    const docType = jsonData._type;
    console.log(`📋 Tipo de documento: ${docType}`);

    // Agregar _key a todos los items de arrays
    const processedData = addKeysToArrayItems(jsonData);

    try {
        console.log(`\n🚀 Subiendo datos a Sanity...`);
        console.log(`   Project ID: ${projectId}`);
        console.log(`   Dataset: ${dataset}`);

        // Caso especial: menuSection se agrega al documento menu existente
        if (docType === "menuSection") {
            const totalSections = await processSingleSection(jsonData);
            console.log(`\n✅ Total de secciones en menú: ${totalSections}`);
            return;
        }

        // Para documentos singleton (menu, brand, siteConfig), usar un ID fijo
        const singletonTypes = ["menu", "brand", "siteConfig"];
        if (singletonTypes.includes(docType)) {
            processedData._id = docType;
        }

        // Usar createOrReplace para actualizar si existe, crear si no
        const result = await client.createOrReplace(processedData);

        console.log(`\n✅ ¡Datos cargados exitosamente!`);
        console.log(`   ID del documento: ${result._id}`);
        console.log(`   Tipo: ${result._type}`);

        // Mostrar resumen para tipo menu
        if (docType === "menu" && processedData.sections) {
            console.log(`\n📊 Resumen del menú:`);
            console.log(`   Título: ${processedData.title || "Sin título"}`);
            console.log(`   Secciones: ${processedData.sections.length}`);

            let totalItems = 0;
            let totalWithOptions = 0;
            processedData.sections.forEach((section: any) => {
                const itemCount = section.items?.length || 0;
                totalItems += itemCount;
                console.log(`   - ${section.title}: ${itemCount} items`);

                // Contar productos con optionGroups
                section.items?.forEach((item: any) => {
                    if (item.optionGroups && item.optionGroups.length > 0) {
                        totalWithOptions++;
                    }
                });
            });
            console.log(`   Total de productos: ${totalItems}`);
            if (totalWithOptions > 0) {
                console.log(`   Productos con opciones: ${totalWithOptions}`);
            }
        }
    } catch (error: any) {
        console.error("\n❌ Error al cargar datos en Sanity:", error.message);
        if (error.response?.body) {
            console.error("   Detalle:", JSON.stringify(error.response.body, null, 2));
        }
        process.exit(1);
    }
}

// Ejecutar
seedData();

