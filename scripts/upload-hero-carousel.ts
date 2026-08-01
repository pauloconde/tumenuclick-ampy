import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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

async function main() {
    console.log("🚀 Subiendo elementos del carrusel Hero a Sanity...");

    // Obtener productos existentes para vincularlos a las historias
    const products = await client.fetch<any[]>('*[_type == "product"]');
    console.log(`📦 Encontrados ${products.length} productos en Sanity para vinculación.`);

    const heroCarousel = [];

    for (let i = 1; i <= 5; i++) {
        const squarePath = path.resolve(process.cwd(), `tmp/square${i}.mp4`);
        const videoPath = path.resolve(process.cwd(), `tmp/video${i}.mp4`);

        if (!fs.existsSync(squarePath) || !fs.existsSync(videoPath)) {
            console.error(`❌ Falta archivo para el elemento ${i}`);
            continue;
        }

        console.log(`\n⏳ Subiendo archivos para Ítem ${i}...`);

        // Subir miniatura MP4 (file asset)
        console.log(`  - Subiendo square${i}.mp4...`);
        const squareStream = fs.createReadStream(squarePath);
        const squareAsset = await client.assets.upload('file', squareStream, {
            filename: `square${i}.mp4`,
            contentType: 'video/mp4'
        });
        console.log(`  ✓ Square miniatura subida: ${squareAsset._id}`);

        // Subir video principal MP4 (file asset)
        console.log(`  - Subiendo video${i}.mp4...`);
        const videoStream = fs.createReadStream(videoPath);
        const videoAsset = await client.assets.upload('file', videoStream, {
            filename: `video${i}.mp4`,
            contentType: 'video/mp4'
        });
        console.log(`  ✓ Video principal subido: ${videoAsset._id}`);

        const linkedProd = products[i - 1] ? { _type: 'reference', _ref: products[i - 1]._id } : undefined;

        heroCarousel.push({
            _type: 'heroItem',
            _key: `hero_item_${i}_${Date.now()}`,
            title: products[i - 1]?.name || `Especial ${i}`,
            thumbVideoFile: {
                _type: 'file',
                asset: {
                    _type: 'reference',
                    _ref: squareAsset._id
                }
            },
            mediaType: 'video',
            videoFile: {
                _type: 'file',
                asset: {
                    _type: 'reference',
                    _ref: videoAsset._id
                }
            },
            ...(linkedProd ? { linkedProduct: linkedProd } : {})
        });
    }

    console.log(`\n📝 Actualizando documento singleton 'menu' en Sanity...`);
    const result = await client
        .patch('menu')
        .set({ heroCarousel })
        .commit();

    console.log("\n✅ ¡Carrusel Hero actualizado exitosamente en Sanity!");
}

main().catch(err => {
    console.error("❌ Error en la ejecución:", err);
});
