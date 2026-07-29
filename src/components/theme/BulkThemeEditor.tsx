import { useState, useEffect, useRef } from 'react';
import ColorInput from './ColorInput'; // Reusing the existing component for the picker interaction
import { THEME_CHANNEL_NAME, MESSAGE_TYPES, type ThemeMessage } from '../../utils/themeEditorConfig';

interface BulkThemeEditorProps {
    // No props needed as it fetches its own data
}

interface ColorOccurrence {
    value: string; // The hex color code
    paths: string[]; // List of Sanity paths where this color is used
    count: number;
}

export default function BulkThemeEditor() {
    const [colors, setColors] = useState<ColorOccurrence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<ColorOccurrence | null>(null);
    const [replacementColor, setReplacementColor] = useState<string>('#000000');
    const [isReplacing, setIsReplacing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/theme-bulk');
            if (!res.ok) throw new Error(await res.text());

            const brandDoc = await res.json();
            console.log('Bulk Theme Editor - Raw Data:', brandDoc);
            analyzeColors(brandDoc);
        } catch (err) {
            console.error('Bulk Theme Editor - Fetch Error:', err);
            setError(err instanceof Error ? err.message : 'Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const analyzeColors = (doc: any) => {
        const colorMap: Record<string, string[]> = {};

        const traverse = (obj: any, path = '') => {
            for (const key in obj) {
                if (key.startsWith('_')) continue;
                const value = obj[key];
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof value === 'string') {
                    // Simple heuristic: starts with # and length 4, 5, 7, or 9
                    if (value.startsWith('#') && (value.length === 4 || value.length === 5 || value.length === 7 || value.length === 9)) {
                        // STRICT CASE-INSENSITIVE GROUPING
                        const key = value.toUpperCase();
                        if (!colorMap[key]) colorMap[key] = [];
                        colorMap[key].push(currentPath);
                    }
                } else if (typeof value === 'object' && value !== null) {
                    traverse(value, currentPath);
                }
            }
        };

        traverse(doc);

        const occurrences: ColorOccurrence[] = Object.entries(colorMap).map(([value, paths]) => ({
            value,
            paths,
            count: paths.length
        })).sort((a, b) => {
            // Sort by count descending, then alphabetical
            if (b.count !== a.count) return b.count - a.count;
            return a.value.localeCompare(b.value);
        });

        setColors(occurrences);
    };

    const handleSwatchClick = (color: ColorOccurrence) => {
        setSelectedColor(color);
        setReplacementColor(color.value); // Initialize picker with current color
        setSuccessMessage(null);
    };

    const handleReplace = async () => {
        if (!selectedColor) return;

        if (!confirm(`¿Estás seguro de reemplazar ${selectedColor.value} por ${replacementColor} en ${selectedColor.count} lugares?`)) {
            return;
        }

        setIsReplacing(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch('/api/theme-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldColor: selectedColor.value,
                    newColor: replacementColor
                })
            });

            if (!res.ok) throw new Error(await res.text());

            const result = await res.json();
            setSuccessMessage(`¡Éxito! Reemplazados ${result.count} campos.`);

            // Refresh data
            await fetchData();
            setSelectedColor(null); // Close modal/panel

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error during replacement');
        } finally {
            setIsReplacing(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            backgroundColor: '#0d1117',
            color: '#e6edf3',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{
                padding: '16px',
                borderBottom: '1px solid #30363d',
                backgroundColor: '#161b22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a href="/admin/theme-editor" style={{
                        textDecoration: 'none',
                        color: '#58a6ff',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        ← Volver al Editor Visual
                    </a>
                    <h1 style={{ fontSize: '18px', margin: 0 }}>Bulk Theme Editor</h1>
                </div>
                <div style={{ fontSize: '14px', color: '#8b949e' }}>
                    {colors.length} colores únicos encontrados
                </div>
            </header>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Main Color Grid */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>Cargando análisis de colores...</div>
                    ) : error ? (
                        <div style={{ color: '#f85149', padding: '20px', backgroundColor: 'rgba(248, 81, 73, 0.1)', borderRadius: '6px' }}>
                            Error: {error}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '16px'
                        }}>
                            {colors.map(color => (
                                <div
                                    key={color.value}
                                    onClick={() => handleSwatchClick(color)}
                                    style={{
                                        backgroundColor: '#161b22',
                                        border: `1px solid ${selectedColor?.value === color.value ? '#58a6ff' : '#30363d'}`,
                                        borderRadius: '6px',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#8b949e'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = selectedColor?.value === color.value ? '#58a6ff' : '#30363d'}
                                >
                                    <div style={{
                                        height: '60px',
                                        backgroundColor: color.value,
                                        borderRadius: '4px',
                                        border: '1px solid #30363d',
                                        position: 'relative' // For transparency pattern
                                    }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <code style={{ fontSize: '14px', fontWeight: 600 }}>{color.value}</code>
                                        <span style={{
                                            fontSize: '12px',
                                            backgroundColor: '#21262d',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            color: '#8b949e'
                                        }}>
                                            {color.count}
                                        </span>
                                    </div>
                                    {/* Alpha Indicator */}
                                    {color.value.length === 9 && (
                                        <div style={{ fontSize: '11px', color: '#d29922' }}>
                                            ⚠️ Transparencia (Alpha)
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar / Detail Panel */}
                {selectedColor && (
                    <div style={{
                        width: '350px',
                        backgroundColor: '#161b22',
                        borderLeft: '1px solid #30363d',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: selectedColor.value, borderRadius: '4px', border: '1px solid #30363d' }} />
                            {selectedColor.value}
                        </h2>

                        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #30363d' }}>
                            <h3 style={{ fontSize: '14px', color: '#8b949e', marginBottom: '12px' }}>Reemplazar por</h3>

                            {/* Reusing ColorInput component logic inline for simplicity or just a native picker + text input */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="color"
                                        value={replacementColor.substring(0, 7)}
                                        onChange={e => {
                                            // Handle alpha preservation if needed? 
                                            // For now, let's just take the hex. User can edit text for alpha.
                                            let val = e.target.value.toUpperCase();
                                            // If original had alpha, maybe we want to keep it? 
                                            // But this is a bulk REPLACE, so probably user wants full control.
                                            setReplacementColor(val);
                                        }}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: 0,
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={replacementColor}
                                        onChange={e => setReplacementColor(e.target.value.toUpperCase())}
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            backgroundColor: '#0d1117',
                                            border: '1px solid #30363d',
                                            borderRadius: '6px',
                                            color: '#e6edf3',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <div style={{ fontSize: '12px', color: '#8b949e' }}>
                                    Tip: Puedes escribir códigos de 8 dígitos para usar transparencia (ej: #00000080).
                                </div>

                                <button
                                    onClick={handleReplace}
                                    disabled={isReplacing || selectedColor.value === replacementColor}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: isReplacing ? '#21262d' : '#238636',
                                        color: isReplacing ? '#8b949e' : '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: isReplacing ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        marginTop: '8px'
                                    }}
                                >
                                    {isReplacing ? 'Reemplazando...' : 'Reemplazar en Todos'}
                                </button>

                                {successMessage && (
                                    <div style={{ fontSize: '12px', color: '#3fb950', marginTop: '8px' }}>
                                        {successMessage}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '14px', color: '#8b949e', marginBottom: '12px' }}>
                                Usado en {selectedColor.count} lugares:
                            </h3>
                            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#8b949e', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {selectedColor.paths.map(path => (
                                    <div key={path} style={{ padding: '4px 8px', backgroundColor: '#21262d', borderRadius: '4px' }}>
                                        {path}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
