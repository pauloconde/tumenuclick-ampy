import fs from 'fs';
import path from 'path';

/**
 * Extrae el color del tema desde global.css
 * Lee el valor de --color-navbar-bg que se usa como theme color
 * @returns Color hexadecimal del tema (ej: #03047c)
 */
export function getThemeColorFromCSS(): string {
    try {
        const cssPath = path.join(process.cwd(), 'src/styles/global.css');
        const cssContent = fs.readFileSync(cssPath, 'utf-8');

        // Buscar --color-navbar-bg: #XXXXXX;
        const match = cssContent.match(/--color-navbar-bg:\s*(#[0-9a-fA-F]{6})/);

        if (match && match[1]) {
            return match[1];
        }

        // Fallback si no se encuentra
        console.warn('⚠️ No se pudo leer --color-navbar-bg de global.css, usando fallback');
        return '#03047c';
    } catch (error) {
        console.error('Error leyendo theme color de global.css:', error);
        return '#03047c'; // Fallback
    }
}
