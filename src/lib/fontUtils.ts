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

/**
 * Genera el tag <link> o <style> necesario para cargar la fuente.
 * Retorna un objeto con { tag: 'link' | 'style', content: string, attributes?: any }
 */
export function getFontDefinition(config: FontConfig) {
    if (!config) return null;

    if (config.origin === 'google' && config.family) {
        const familyName = config.family.replace(/\s+/g, '+');
        // Google Fonts Format: Family:ital,wght@0,400;1,400
        // Simple implementation: assume weight is needed.
        // Enhanced: check style to build the correct string.

        // Example: Open+Sans:ital,wght@0,400  or  Open+Sans:wght@700
        let weightParam = config.weight || '400';

        // If we want to be very precise with Google Fonts URL construction:
        // This is a basic construction. For complex multi-weight apps, we might need a more robust builder.
        // But per-field configuration usually implies fetching just what's needed for THAT field.

        // Construct href
        const href = `https://fonts.googleapis.com/css2?family=${familyName}:ital,wght@${config.style === 'italic' ? '1' : '0'},${weightParam}&display=swap`;

        return {
            tag: 'link',
            attributes: {
                rel: 'stylesheet',
                href: href
            }
        };
    }

    if (config.origin === 'custom' && config.customFamily && config.customFileUrl) {
        const fontFace = `
      @font-face {
        font-family: '${config.customFamily}';
        src: url('${config.customFileUrl}') format('woff2'); /* Asumiendo woff2/woff por recomendación, pero browser detectará */
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
