export interface FontConfig {
    origin: 'google' | 'custom';
    family?: string; // Usado si origin es 'google'
    customFamily?: string; // Usado si origin es 'custom'
    customFileUrl?: string; // URL del CDN de Sanity
    weight: string;
    style: 'normal' | 'italic';
    sizeValue?: number;
    sizeUnit: string;
    lineHeight?: number;
}

const FONTSHARE_FONTS = [
    'panchang', 'clash display', 'satoshi', 'general sans', 'cabinet grotesk',
    'switzer', 'zodiak', 'ranade', 'chillax', 'sentient', 'telma', 'stardom',
    'gambetta', 'erode', 'alpino', 'synonym', 'boska', 'author', 'purna',
    'technor', 'bonny', 'plodi', 'syne'
];

/**
 * Genera el tag <link> o <style> necesario para cargar la fuente.
 * Retorna un objeto con { tag: 'link' | 'style', content: string, attributes?: any }
 */
export function getFontDefinition(config: FontConfig) {
    if (!config) return null;

    // Si tiene un archivo subido a Sanity (Custom Font File)
    if (config.customFileUrl) {
        const familyName = config.customFamily || config.family || 'CustomFont';
        let formatSnippet = '';
        const urlLower = config.customFileUrl.toLowerCase();
        if (urlLower.includes('.woff2')) formatSnippet = " format('woff2')";
        else if (urlLower.includes('.woff')) formatSnippet = " format('woff')";
        else if (urlLower.includes('.ttf')) formatSnippet = " format('truetype')";
        else if (urlLower.includes('.otf')) formatSnippet = " format('opentype')";

        const fontFace = `
      @font-face {
        font-family: '${familyName}';
        src: url('${config.customFileUrl}')${formatSnippet};
        font-weight: ${config.weight || '400'};
        font-style: ${config.style || 'normal'};
        font-display: swap;
      }
    `;
        return {
            tag: 'style',
            content: fontFace
        };
    }

    if (config.origin === 'google' && config.family) {
        const cleanFamily = config.family.trim();
        const lowerFamily = cleanFamily.toLowerCase();

        // Si es una fuente conocida de Fontshare (ej: Panchang, Satoshi, Clash Display)
        if (FONTSHARE_FONTS.includes(lowerFamily)) {
            const slug = lowerFamily.replace(/\s+/g, '-');
            const href = `https://api.fontshare.com/v2/css?f[]=${slug}@400,500,600,700,800&display=swap`;
            return {
                tag: 'link',
                attributes: {
                    rel: 'stylesheet',
                    href: href
                }
            };
        }

        // Google Fonts
        const familyName = cleanFamily.replace(/\s+/g, '+');
        const weightParam = config.weight || '400';
        const href = config.style === 'italic'
            ? `https://fonts.googleapis.com/css2?family=${familyName}:ital,wght@1,${weightParam}&display=swap`
            : `https://fonts.googleapis.com/css2?family=${familyName}:wght@${weightParam}&display=swap`;

        return {
            tag: 'link',
            attributes: {
                rel: 'stylesheet',
                href: href
            }
        };
    }

    return null;
}

/**
 * Retorna el objeto de estilos CSS (React.CSSProperties) para aplicar la fuente a un elemento.
 */
export function getFontStyles(config: FontConfig): React.CSSProperties {
    if (!config) return {};

    const fontFamily = config.origin === 'google'
        ? `'${config.family}', sans-serif`
        : `'${config.customFamily}', sans-serif`;

    return {
        fontFamily,
        fontWeight: config.weight as any, // Cast to any because generic string might not match exact CSS types strictly without more validation
        fontStyle: config.style,
        fontSize: config.sizeValue ? `${config.sizeValue}${config.sizeUnit}` : undefined,
        lineHeight: config.lineHeight ? `${config.lineHeight}px` : undefined,
    };
}
