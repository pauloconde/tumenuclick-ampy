import type { StringInputProps } from 'sanity';
import { set, unset } from 'sanity';
import { useCallback, useState } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';
import { Stack, TextInput, Card, Box } from '@sanity/ui';

export function HexColorInput(props: StringInputProps) {
    const { value, onChange } = props;
    const [showPicker, setShowPicker] = useState(false);

    // Convertir hex (#RRGGBBAA) a formato react-color
    const hexToRgba = (hex: string | undefined): { r: number; g: number; b: number; a: number } => {
        if (!hex || !hex.startsWith('#')) {
            return { r: 0, g: 0, b: 0, a: 1 };
        }

        const cleanHex = hex.replace('#', '');

        let r = 0, g = 0, b = 0, a = 1;

        if (cleanHex.length === 6) {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        } else if (cleanHex.length === 8) {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
            a = parseInt(cleanHex.substring(6, 8), 16) / 255;
        }

        return { r, g, b, a };
    };

    // Convertir react-color a hex (#RRGGBBAA)
    const rgbaToHex = (rgba: { r: number; g: number; b: number; a?: number }): string => {
        const toHex = (n: number) => {
            const hex = Math.round(n).toString(16).padStart(2, '0');
            return hex.toUpperCase();
        };

        const alpha = rgba.a ?? 1;
        const hexColor = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;

        // Solo agregar alpha si no es 1 (opaco)
        if (alpha < 1) {
            return `${hexColor}${toHex(alpha * 255)}`;
        }

        return hexColor;
    };

    const handleColorChange = useCallback(
        (color: ColorResult) => {
            const hexValue = rgbaToHex(color.rgb);
            onChange(set(hexValue));
        },
        [onChange]
    );

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;

            if (newValue === '') {
                onChange(unset());
            } else {
                onChange(set(newValue));
            }
        },
        [onChange]
    );

    const currentColor = hexToRgba(value);

    return (
        <Stack space={2}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <div style={{ flex: 1 }}>
                    <TextInput
                        value={value || ''}
                        onChange={handleInputChange}
                        placeholder="#RRGGBB o #RRGGBBAA"
                    />
                </div>

                <Card
                    padding={0}
                    radius={2}
                    shadow={1}
                    tone="transparent"
                    style={{
                        cursor: 'pointer',
                        position: 'relative',
                        width: '48px',
                        minWidth: '48px',
                    }}
                    onClick={() => setShowPicker(!showPicker)}
                >
                    <Box
                        style={{
                            width: '100%',
                            height: '100%',
                            minHeight: '32px',
                            backgroundColor: value || '#FFFFFF',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    />
                </Card>
            </div>

            {showPicker && (
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div
                        style={{
                            position: 'fixed',
                            top: '0px',
                            right: '0px',
                            bottom: '0px',
                            left: '0px',
                        }}
                        onClick={() => setShowPicker(false)}
                    />
                    <SketchPicker
                        color={currentColor}
                        onChange={handleColorChange}
                        presetColors={[
                            '#060606',
                            '#F08118',
                            '#F9CDA3',
                            '#FFFFFF',
                            '#000000',
                            '#9E4F0E',
                            '#FFC42A',
                            '#333333',
                            '#555555',
                            '#E5E7EB',
                        ]}
                    />
                </div>
            )}
        </Stack>
    );
}
