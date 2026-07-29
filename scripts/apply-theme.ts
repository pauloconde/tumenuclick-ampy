/**
 * Script para aplicar un tema (colores) a Sanity desde un archivo JSON
 * Realiza un PATCH, por lo que NO borra otros datos como logo o nombre.
 *
 * Uso: npx tsx scripts/apply-theme.ts <archivo.json>
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
    console.error("   Uso: npx tsx scripts/apply-theme.ts <archivo.json>");
    process.exit(1);
}

const jsonFilePath = args[0];

const absolutePath = path.isAbsolute(jsonFilePath)
    ? jsonFilePath
    : path.resolve(process.cwd(), jsonFilePath);

if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: No se encontró el archivo: ${absolutePath}`);
    process.exit(1);
}

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_DEV_TOKEN;

if (!projectId || !dataset || !token) {
    console.error("❌ Error: Faltan variables de entorno en .env.local");
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-01-01",
    useCdn: false,
});

async function applyTheme() {
    console.log(`\n📂 Leyendo archivo: ${absolutePath}`);

    let jsonData: any;
    try {
        const fileContent = fs.readFileSync(absolutePath, "utf-8");
        jsonData = JSON.parse(fileContent);
    } catch (error) {
        console.error("❌ Error al leer o parsear el archivo JSON:", error);
        process.exit(1);
    }

    // Filtrar solo las claves que empiezan por "theme"
    const themeKeys = Object.keys(jsonData).filter(key => key.startsWith('theme'));

    if (themeKeys.length === 0) {
        console.error("❌ Error: El archivo JSON no contiene claves de tema (que empiecen por 'theme')");
        process.exit(1);
    }

    console.log(`Found ${themeKeys.length} theme categories to update.`);

    const patch = client.patch('brand');

    themeKeys.forEach(key => {
        if (typeof jsonData[key] === 'object') {
            // Patch the entire object for that key
            // e.g. themeApplication: { ... }
            patch.set({ [key]: jsonData[key] });
            console.log(`   - Marking update for: ${key}`);
        }
    });

    try {
        console.log(`\n🚀 Aplicando cambios a Sanity (PATCH)...`);
        await patch.commit();
        console.log(`✅ ¡Tema actualizado correctamente!`);
    } catch (error: any) {
        console.error("❌ Error al aplicar patch en Sanity:", error.message);
        process.exit(1);
    }
}

applyTheme();
