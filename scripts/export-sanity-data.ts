/**
 * Script para exportar datos de Sanity a un archivo JSON
 *
 * Uso: npx tsx scripts/export-sanity-data.ts [nombre-archivo-salida.json]
 *
 * Si no se proporciona nombre de archivo, se generará uno con timestamp.
 *
 * NOTA: Este script genera un backup completo. Para restaurarlo,
 * se recomienda usar la CLI de Sanity en lugar de seed-sanity.ts:
 * npx sanity dataset import <archivo.json> production --replace
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

async function exportData() {
    console.log(`\n🚀 Iniciando exportación de datos de Sanity...`);
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Dataset: ${dataset}`);

    try {
        // Fetch all documents excluding drafts and system documents (e.g., system.group)
        // You might want to include assets if needed, but typically for seed data we just want content documents.
        // We'll exclude 'system.' prefixed types just in case, and drafts.
        const query = `*[!(_id in path("drafts.**")) && !(_type match "system.**")]`;
        const data = await client.fetch(query);

        console.log(`\n✅ Se obtuvieron ${data.length} documentos.`);

        // Determine output filename
        const args = process.argv.slice(2);
        let filename = args[0];

        if (!filename) {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, "-");
            filename = `sanity-export-${timestamp}.json`;
        }

        // Ensure file ends with .json
        if (!filename.endsWith(".json")) {
            filename += ".json";
        }

        const outputPath = path.resolve(process.cwd(), filename);

        // Write to file
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`\n💾 Datos guardados en: ${outputPath}`);
        console.log(`   Tamaño del archivo: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    } catch (error: any) {
        console.error("\n❌ Error al exportar datos:", error.message);
        if (error.response?.body) {
            console.error("   Detalle:", JSON.stringify(error.response.body, null, 2));
        }
        process.exit(1);
    }
}

exportData();
