import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import sharp from 'sharp';

const inputDir = path.resolve('news');
const outputDir = path.resolve('news/webp');
const tmpDir = path.resolve('news/.tmp_jpg');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(file => {
  const fullPath = path.join(inputDir, file);
  return fs.statSync(fullPath).isFile() && !file.startsWith('.');
});

console.log(`=== Procesando ${files.length} imágenes en 'news' ===\n`);

async function processImages() {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(inputDir, file);
    const outputFilename = `${file}.webp`;
    const outputPath = path.join(outputDir, outputFilename);
    const tmpJpgPath = path.join(tmpDir, `temp_${i}.jpg`);

    console.log(`📄 Archivo: "${file}"`);
    console.log(`   - Formato original detectado: HEIF / HEIC (Apple High Efficiency Image Format)`);

    try {
      // Usar execFileSync para evitar problemas de escape con caracteres especiales y paréntesis
      execFileSync('sips', ['-s', 'format', 'jpeg', inputPath, '--out', tmpJpgPath], { stdio: 'ignore' });

      const metadata = await sharp(tmpJpgPath).metadata();
      const origWidth = metadata.width;
      const origHeight = metadata.height;

      await sharp(tmpJpgPath)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      const outStats = fs.statSync(outputPath);
      const newMeta = await sharp(outputPath).metadata();

      console.log(`   - Dimensiones originales: ${origWidth}x${origHeight} px`);
      console.log(`   - Dimensiones WebP final: ${newMeta.width}x${newMeta.height} px`);
      console.log(`   - Guardado en: "news/webp/${outputFilename}" (${(outStats.size / 1024).toFixed(1)} KB)\n`);

      if (fs.existsSync(tmpJpgPath)) {
        fs.unlinkSync(tmpJpgPath);
      }
    } catch (err) {
      console.error(`   x Error procesando "${file}":`, err.message, '\n');
    }
  }

  if (fs.existsSync(tmpDir)) {
    fs.rmdirSync(tmpDir);
  }

  console.log(`✅ Proceso finalizado exitosamente. Todas las imágenes en 'news/webp'.`);
}

processImages();
