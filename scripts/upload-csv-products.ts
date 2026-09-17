import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_DEV_TOKEN || process.env.SANITY_API_TOKEN;

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

interface CsvRow {
  subtitulo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: string;
  fotoBase: string;
  variantesCount: number;
  fotosGaleriaCount: number;
}

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows: CsvRow[] = [];
  
  // Line 0 is header: Subtitulo;Nombre;Descripción;Categoría;Precio;Foto Base;Variantes;Fotos adicionales galería
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length >= 8) {
      rows.push({
        subtitulo: parts[0].trim(),
        nombre: parts[1].trim(),
        descripcion: parts[2].trim(),
        categoria: parts[3].trim(),
        precio: parts[4].trim(),
        fotoBase: parts[5].trim(),
        variantesCount: parseInt(parts[6].trim(), 10) || 0,
        fotosGaleriaCount: parseInt(parts[7].trim(), 10) || 0,
      });
    }
  }
  return rows;
}

function generateKey() {
  return crypto.randomBytes(6).toString('hex');
}

async function run() {
  console.log("🚀 Iniciando publicación de productos desde productos.csv a Sanity...\n");

  const csvPath = path.join(newsDir, 'productos.csv');
  const productsToImport = parseCsv(csvPath);

  const siteConfig = await client.fetch(`*[_type == "siteConfig" && _id == "siteConfig"][0]{restaurantId}`);
  const prefix = (siteConfig?.restaurantId || 'AMPY').toUpperCase();

  // Traer todas las categorías existentes
  const categories = await client.fetch<Array<{ _id: string; title: string; products?: any[] }>>(`*[_type == "category"]`);
  const categoryMap = new Map<string, { _id: string; title: string; products: any[] }>();
  categories.forEach(c => categoryMap.set(c.title.trim().toLowerCase(), { _id: c._id, title: c.title, products: c.products || [] }));

  for (const prod of productsToImport) {
    console.log(`\n📦 Procesando Producto [${prod.subtitulo}] ${prod.nombre}...`);

    // Chequear si ya existe en Sanity
    const existing = await client.fetch(`*[_type == "product" && subtitle == $subtitle][0]`, { subtitle: prod.subtitulo });
    if (existing) {
      console.log(`  ℹ️ El producto [${prod.subtitulo}] ya existe en Sanity (${existing._id}). Saltando...`);
      continue;
    }

    // 1. Subir Foto Base
    const coverFile = path.join(newsDir, prod.fotoBase);
    if (!fs.existsSync(coverFile)) {
      console.error(`  ❌ No existe la imagen base: ${coverFile}`);
      continue;
    }

    console.log(`  ⬆️ Subiendo foto base: ${prod.fotoBase}`);
    const coverStream = fs.createReadStream(coverFile);
    const coverAsset = await client.assets.upload('image', coverStream, {
      filename: prod.fotoBase,
      contentType: 'image/webp',
    });

    const coverAssetRef = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: coverAsset._id,
      },
    };

    // 2. Buscar Fotos Adicionales (Galería / Variantes)
    // Para 0144 Cerdo Disfraz: 0144 Cerdo Disfraz(1).webp, 0144 Cerdo Disfraz(2).webp, 0144 Cerdo Disfraz(3).webp, 0144 Cerdo Disfraz (4).webp
    // Para 01139 Oso lazito: 01139 Oso lazito(1).webp, 01139 Oso lazito(2).webp, 01139 Oso lazito(3).webp
    // Para 808 Dino Rex: 808 Dino Rex(1).webp
    // Para 01205 Lotso Acostado: 01205 Lotso Acostado.webp(1).webp

    const galleryRefs: any[] = [];
    const variantItems: any[] = [];

    // Si tiene variantes en el CSV, tratamos las fotos secundarias como variantes si aplica, o como galería si son adicionales.
    // Revisamos la presencia de archivos adicionales asociados al subtítulo o nombre de foto
    const baseNameWithoutExt = prod.fotoBase.replace(/\.webp$/i, '');
    
    // Buscar todos los archivos en news/ que empiecen con la base o código
    const allNewsFiles = fs.readdirSync(newsDir);
    const additionalFiles = allNewsFiles.filter(f => {
      if (f === prod.fotoBase || f === 'productos.csv') return false;
      // Chequear si corresponde a este producto
      if (f.startsWith(baseNameWithoutExt) || f.startsWith(prod.subtitulo)) {
        return true;
      }
      return false;
    });

    console.log(`  📸 Archivos adicionales encontrados: ${additionalFiles.join(', ') || 'Ninguno'}`);

    for (let idx = 0; idx < additionalFiles.length; idx++) {
      const addFile = additionalFiles[idx];
      const addFilePath = path.join(newsDir, addFile);
      console.log(`  ⬆️ Subiendo foto adicional: ${addFile}`);
      const addStream = fs.createReadStream(addFilePath);
      const addAsset = await client.assets.upload('image', addStream, {
        filename: addFile,
        contentType: 'image/webp',
      });

      const addAssetRef = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: addAsset._id,
        },
      };

      if (prod.fotosGaleriaCount > 0) {
        galleryRefs.push({
          _key: generateKey(),
          ...addAssetRef,
        });
      } else if (prod.variantesCount > 0) {
        variantItems.push({
          _key: generateKey(),
          _type: 'variantItem',
          name: `Modelo ${idx + 2}`,
          price: prod.precio,
          image: addAssetRef,
          isDefault: false,
        });
      } else {
        galleryRefs.push({
          _key: generateKey(),
          ...addAssetRef,
        });
      }
    }

    // Si hay variantes, agregar también la foto principal como primer variante por omisión
    if (variantItems.length > 0) {
      variantItems.unshift({
        _key: generateKey(),
        _type: 'variantItem',
        name: `Modelo 1`,
        price: prod.precio,
        image: coverAssetRef,
        isDefault: true,
      });
    }

    // 3. Crear documento de Producto en Sanity
    const nameSlug = prod.nombre
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    const slugValue = `${prefix}-${nameSlug}-${prod.subtitulo}`;

    const doc: any = {
      _type: 'product',
      name: prod.nombre,
      subtitle: prod.subtitulo,
      slug: { _type: 'slug', current: slugValue },
      price: prod.precio,
      description: prod.descripcion,
      available: true,
      isNew: true,
      imgSrc: coverAssetRef,
    };

    if (galleryRefs.length > 0) {
      doc.gallery = galleryRefs;
    }

    if (variantItems.length > 0) {
      doc.variantGroups = [
        {
          _key: generateKey(),
          _type: 'variantGroup',
          title: 'Modelo / Estilo',
          showTitle: true,
          variants: variantItems,
        },
      ];
    }

    console.log(`  💾 Creando documento del producto en Sanity...`);
    const createdProduct = await client.create(doc);
    console.log(`  ✅ Producto creado con ID: ${createdProduct._id}`);

    // 4. Asignar Categoría
    const targetCatKey = prod.categoria.trim().toLowerCase();
    let catObj = categoryMap.get(targetCatKey);

    if (!catObj) {
      const matched = Array.from(categoryMap.values()).find(c =>
        c.title.toLowerCase().includes(targetCatKey) || targetCatKey.includes(c.title.toLowerCase())
      );
      if (matched) catObj = matched;
    }

    if (catObj) {
      console.log(`  🏷️ Asignando a categoría "${catObj.title}" (${catObj._id})...`);
      await client
        .patch(catObj._id)
        .setIfMissing({ products: [] })
        .append('products', [{ _type: 'reference', _ref: createdProduct._id, _key: generateKey() }])
        .commit();
      console.log(`  ✅ Producto vinculado exitosamente a "${catObj.title}".`);
    } else {
      console.warn(`  ⚠️ Categoría "${prod.categoria}" no encontrada en Sanity.`);
    }
  }

  console.log("\n🎉 ¡Todos los productos del CSV se han creado y publicado correctamente en Sanity!");
}

run().catch(err => {
  console.error("❌ Error durante la ejecución del script:", err);
  process.exit(1);
});
