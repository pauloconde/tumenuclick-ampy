import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { execSync } from 'child_process';

dotenv.config({ path: '.env.local' });

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_DEV_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("❌ Falta configuración de Sanity en .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const newsDir = path.resolve(process.cwd(), 'news');
const outputDir = path.resolve(newsDir, 'processed_webp');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface ProductTask {
  code: string;
  name: string;
  price: string;
  categoryTitle: string;
  images: {
    filename: string;
    variantName?: string;
    isCover?: boolean;
    isGallery?: boolean;
  }[];
}

const productTasks: ProductTask[] = [
  {
    code: '0111',
    name: 'Chimuelo 24cm',
    price: '12',
    categoryTitle: 'Chimuelo',
    images: [
      { filename: '0111 Chimuelo Tamaño_ 24cm precio✅12$', variantName: 'Blanco', isCover: true },
      { filename: '0111 Chimuelo Tamaño_ 24cm precio✅12$(1)', variantName: 'Negro' },
    ],
  },
  {
    code: '01217',
    name: 'Paw Patrol - Chase 35cm',
    price: '33',
    categoryTitle: 'Paw Patrol',
    images: [
      { filename: '01217 Paw Patrol - Chase tamaño_35cm precio✅33$', isCover: true },
    ],
  },
  {
    code: '01224',
    name: 'Vaca que corre 65cm',
    price: '50',
    categoryTitle: 'Animales',
    images: [
      { filename: '01224 Vaca que corre tamaño_ 65cm precio✅50$', variantName: 'Beige', isCover: true },
      { filename: '01224 Vaca que corre tamaño_ 65cm precio✅50$(1)', variantName: 'Marrón' },
    ],
  },
  {
    code: '01225',
    name: 'Angelito 32cm',
    price: '22',
    categoryTitle: 'Religiosos',
    images: [
      { filename: '01225 Angelito Tamaño_ 32cm precio✅22$', isCover: true },
    ],
  },
  {
    code: '01226',
    name: 'Jesús 32cm',
    price: '22',
    categoryTitle: 'Religiosos',
    images: [
      { filename: '01226 Jesús Tamaño_ 32cm precio✅22$', isCover: true },
    ],
  },
  {
    code: '0138',
    name: 'Hombre Araña 32cm',
    price: '12',
    categoryTitle: 'Disney',
    images: [
      { filename: '0138 Hombre Araña Tamaño_ 32cm Precio✅12$', variantName: 'Con capucha', isCover: true },
      { filename: '0138 Hombre Araña Tamaño_ 32cm Precio✅12$(1)', variantName: 'Sin capucha' },
    ],
  },
  {
    code: '178',
    name: 'Toro Bebé 38cm',
    price: '25',
    categoryTitle: 'Animales',
    images: [
      { filename: '178 Toro Bebé Tamaño_ 38cm Precio✅25$', variantName: 'Beige', isCover: true },
      { filename: '178 Toro Bebé Tamaño_ 38cm Precio✅25$(1)', variantName: 'Marrón' },
    ],
  },
  {
    code: '803',
    name: 'Guerreras K-POP 38-40cm',
    price: '20',
    categoryTitle: 'Guerreras K-POP',
    images: [
      { filename: '803 Saja Boys tamaño_ 38cm precio✅20$', variantName: 'Saja', isCover: true },
      { filename: '803 K-POP - Rumí tamaño_ 40cm precio✅20$', variantName: 'Rumi' },
      { filename: '803 K-POP - Mira Tamaño_ 38cm Precio✅20$', variantName: 'Mira' },
    ],
  },
  {
    code: '810',
    name: 'Chimuelo 60cm',
    price: '30',
    categoryTitle: 'Chimuelo',
    images: [
      { filename: '810 Chimuelo Tamaño_ 60cm Precio✅30$', isCover: true },
      { filename: '810 Chimuelo Tamaño_ 60cm Precio✅30$(1)', isGallery: true },
    ],
  },
];

function generateKey() {
  return crypto.randomBytes(6).toString('hex');
}

async function run() {
  console.log("🚀 Iniciando procesamiento de imágenes y creación en Sanity...\n");

  const siteConfig = await client.fetch(`*[_type == "siteConfig" && _id == "siteConfig"][0]{restaurantId}`);
  const prefix = (siteConfig?.restaurantId || 'AMPY').toUpperCase();

  const categories = await client.fetch<Array<{ _id: string; title: string; products?: any[] }>>(`*[_type == "category"]`);
  const categoryMap = new Map<string, { _id: string; title: string; products: any[] }>();
  categories.forEach(c => categoryMap.set(c.title.trim().toLowerCase(), { _id: c._id, title: c.title, products: c.products || [] }));

  for (const task of productTasks) {
    console.log(`\n📦 Procesando Producto [${task.code}] ${task.name}...`);

    let coverAssetRef: any = null;
    let galleryAssetRefs: any[] = [];
    const variantItems: any[] = [];

    for (const img of task.images) {
      const srcFile = path.join(newsDir, img.filename);
      const webpFileName = `${task.code}_${generateKey()}.webp`;
      const webpFilePath = path.join(outputDir, webpFileName);

      console.log(`  📸 Convirtiendo imagen: ${img.filename}`);

      const tempJpgPath = path.join(outputDir, `${generateKey()}_temp.jpg`);
      const execFileSync = (await import('child_process')).execFileSync;
      execFileSync('sips', ['-s', 'format', 'jpeg', '--resampleWidth', '1080', srcFile, '--out', tempJpgPath], { stdio: 'pipe' });

      await sharp(tempJpgPath)
        .webp({ quality: 80 })
        .toFile(webpFilePath);

      if (fs.existsSync(tempJpgPath)) {
        fs.unlinkSync(tempJpgPath);
      }

      console.log(`  ⬆️  Subiendo asset a Sanity: ${webpFileName}`);
      const assetStream = fs.createReadStream(webpFilePath);
      const asset = await client.assets.upload('image', assetStream, {
        filename: webpFileName,
        contentType: 'image/webp',
      });

      const assetRefObj = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      };

      if (img.isCover) {
        coverAssetRef = assetRefObj;
      }

      if (img.isGallery) {
        galleryAssetRefs.push({
          _key: generateKey(),
          ...assetRefObj,
        });
      }

      if (img.variantName) {
        variantItems.push({
          _key: generateKey(),
          _type: 'variantItem',
          name: img.variantName,
          price: task.price,
          image: assetRefObj,
          isDefault: img.isCover ? true : false,
        });
      }
    }

    const slugValue = `${prefix}-${task.name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')}`;

    const doc: any = {
      _type: 'product',
      name: task.name,
      slug: { _type: 'slug', current: slugValue },
      price: task.price,
      available: true,
      isNew: true,
      imgSrc: coverAssetRef,
    };

    if (galleryAssetRefs.length > 0) {
      doc.gallery = galleryAssetRefs;
    }

    if (variantItems.length > 0) {
      doc.variantGroups = [
        {
          _key: generateKey(),
          _type: 'variantGroup',
          title: 'Variante',
          showTitle: false,
          variants: variantItems,
        },
      ];
    }

    console.log(`  💾 Creando documento en Sanity...`);
    const createdProduct = await client.create(doc);
    console.log(`  ✅ Creado producto ID: ${createdProduct._id}`);

    const targetCatKey = task.categoryTitle.trim().toLowerCase();
    let catObj = categoryMap.get(targetCatKey);

    if (!catObj) {
      const matched = Array.from(categoryMap.values()).find(c => c.title.toLowerCase().includes(targetCatKey) || targetCatKey.includes(c.title.toLowerCase()));
      if (matched) catObj = matched;
    }

    if (catObj) {
      console.log(`  🏷️  Agregando producto a la categoría "${catObj.title}" (${catObj._id})...`);
      await client
        .patch(catObj._id)
        .setIfMissing({ products: [] })
        .append('products', [{ _type: 'reference', _ref: createdProduct._id, _key: generateKey() }])
        .commit();
      console.log(`  ✅ Producto vinculado a categoría "${catObj.title}".`);
    } else {
      console.warn(`  ⚠️ No se encontró la categoría "${task.categoryTitle}" para el producto.`);
    }
  }

  console.log("\n🎉 ¡Proceso finalizado exitosamente!");
}

run().catch((err) => {
  console.error("❌ Error inesperado durante la ejecución:", err);
  process.exit(1);
});
