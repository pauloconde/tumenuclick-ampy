// src/lib/imageUrl.ts
import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from './sanity';
import type { SanityImageSource } from '@sanity/image-url';

const builder = createImageUrlBuilder(sanityClient);

/**
 * Genera una URL optimizada para una imagen de Sanity
 * @param source - Referencia de imagen de Sanity
 * @param width - Ancho deseado (opcional)
 * @param height - Alto deseado (opcional)
 * @returns URL de la imagen optimizada
 */
export function urlFor(source: SanityImageSource) {
    return builder.image(source);
}

/**
 * Verifica si un valor es una referencia de imagen de Sanity
 * @param value - Valor a verificar
 * @returns true si es una referencia de imagen de Sanity
 */
export function isSanityImage(value: any): boolean {
    return value && typeof value === 'object' && value._type === 'image';
}

/**
 * Opciones adicionales para la generación de URLs de imagen
 */
interface ImageUrlOptions {
    quality?: number;
}

/**
 * Obtiene la URL de una imagen, ya sea de Sanity o local
 * @param imgSrc - Puede ser una referencia de Sanity o un path local
 * @param width - Ancho deseado para imágenes de Sanity
 * @param options - Opciones adicionales (quality, etc.)
 * @returns URL de la imagen optimizada
 */
export function getImageUrl(imgSrc: any, width?: number, options?: ImageUrlOptions): string {
    if (!imgSrc) {
        return '/images/placeholder.svg'; // Imagen placeholder por defecto
    }

    if (isSanityImage(imgSrc)) {
        const quality = options?.quality ?? 80;
        let urlBuilder = urlFor(imgSrc).auto('format').fit('max').quality(quality);
        if (width) {
            urlBuilder = urlBuilder.width(width);
        }
        return urlBuilder.url();
    }

    // Si es un string, asumimos que es un path local
    return imgSrc;
}
