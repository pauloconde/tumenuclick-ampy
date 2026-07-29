import React from 'react';
import { type FontConfig, getFontDefinition } from '../lib/fontUtils';

interface FontLoaderProps {
    config: FontConfig;
}

/**
 * Componente que renderiza los tags necesarios (link o style) para cargar la fuente configurada.
 * No renderiza ningun elemento visual, solo etiquetas de recursos en el punto de montaje.
 */
export const FontLoader: React.FC<FontLoaderProps> = ({ config }) => {
    const definition = getFontDefinition(config);

    if (!definition) return null;

    if (definition.tag === 'link') {
        return (
            <link
                rel="stylesheet"
                href={definition.attributes?.href}
                // @ts-ignore - React sometimes complains about arbitrary attributes or specific link types
                crossOrigin="anonymous"
            />
        );
    }

    if (definition.tag === 'style') {
        return (
            <style
                dangerouslySetInnerHTML={{
                    __html: definition.content || ''
                }}
            />
        );
    }

    return null;
};
