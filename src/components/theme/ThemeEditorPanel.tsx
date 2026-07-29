import { useState, useEffect, useRef, useCallback } from 'react';
import ColorInput from './ColorInput';
import {
    THEME_CHANNEL_NAME,
    MESSAGE_TYPES,
    THEME_CATEGORIES,
    colorsToSanityFormat,
    type ThemeMessage,
    type ColorUpdatePayload,
    type InitialStatePayload,
    type ThemeCategory,
} from '../../utils/themeEditorConfig';

/**
 * ThemeEditorPanel - Main editor interface
 * 
 * Professional dark panel inspired by Chrome DevTools for editing theme colors
 * with real-time sync to the Menu tab via BroadcastChannel.
 */
export default function ThemeEditorPanel() {
    // Color state - maps CSS variable to hex value
    const [colors, setColors] = useState<Record<string, string>>({});
    // Search filter
    const [searchQuery, setSearchQuery] = useState('');
    // Expanded categories
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['application']));
    // Connection status
    const [isConnected, setIsConnected] = useState(false);
    // Saving state
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    // Confirm modal
    const [showConfirm, setShowConfirm] = useState(false);

    const channelRef = useRef<BroadcastChannel | null>(null);
    const colorsRef = useRef<Record<string, string>>({});

    // Keep ref in sync with state for immediate access
    useEffect(() => {
        colorsRef.current = colors;
    }, [colors]);

    // Initialize BroadcastChannel
    useEffect(() => {
        channelRef.current = new BroadcastChannel(THEME_CHANNEL_NAME);

        // Handle incoming messages
        channelRef.current.onmessage = (event: MessageEvent<ThemeMessage>) => {
            const { type, payload } = event.data;

            if (type === MESSAGE_TYPES.INITIAL_STATE && payload) {
                const { colors: initialColors } = payload as InitialStatePayload;
                setColors(initialColors);
                setIsConnected(true);
            }
        };

        // Request initial state from Menu tab
        const requestState = () => {
            channelRef.current?.postMessage({
                type: MESSAGE_TYPES.REQUEST_INITIAL_STATE,
            } as ThemeMessage);
        };

        // Request immediately and retry a few times
        requestState();
        const retryInterval = setInterval(requestState, 1000);
        setTimeout(() => clearInterval(retryInterval), 5000);

        return () => {
            channelRef.current?.close();
            clearInterval(retryInterval);
        };
    }, []);

    // Emit color change to Menu tab
    const emitColorChange = useCallback((variable: string, value: string) => {
        channelRef.current?.postMessage({
            type: MESSAGE_TYPES.UPDATE_COLOR,
            payload: { variable, value } as ColorUpdatePayload,
        } as ThemeMessage);
    }, []);

    // Handle color change from input
    const handleColorChange = useCallback((variable: string, value: string) => {
        // Update local state
        setColors(prev => ({ ...prev, [variable]: value }));
        // Emit to Menu tab immediately
        emitColorChange(variable, value);
    }, [emitColorChange]);

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    // Filter categories and colors by search query
    const getFilteredCategories = (): ThemeCategory[] => {
        if (!searchQuery.trim()) return THEME_CATEGORIES;

        const query = searchQuery.toLowerCase();
        return THEME_CATEGORIES.map(cat => ({
            ...cat,
            colors: cat.colors.filter(
                c => c.label.toLowerCase().includes(query) || c.cssVar.toLowerCase().includes(query)
            ),
        })).filter(cat => cat.colors.length > 0);
    };

    // Export JSON for Sanity
    const handleExport = () => {
        const sanityData = colorsToSanityFormat(colors);
        const exportData = {
            _type: 'brand',
            ...sanityData,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import JSON file
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Convert Sanity format to CSS variables
                const newColors: Record<string, string> = {};

                for (const cat of THEME_CATEGORIES) {
                    for (const color of cat.colors) {
                        const [category, field] = color.sanityPath.split('.');
                        if (data[category]?.[field]) {
                            newColors[color.cssVar] = data[category][field];
                            emitColorChange(color.cssVar, data[category][field]);
                        }
                    }
                }

                setColors(prev => ({ ...prev, ...newColors }));
                setSaveMessage({ type: 'success', text: 'Esquema importado correctamente' });
                setTimeout(() => setSaveMessage(null), 3000);
            } catch (err) {
                setSaveMessage({ type: 'error', text: 'Error al leer el archivo JSON' });
                setTimeout(() => setSaveMessage(null), 3000);
            }
        };
        input.click();
    };

    // Apply to Sanity
    const handleApplyToSanity = async () => {
        setShowConfirm(false);
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const sanityData = colorsToSanityFormat(colors);
            console.log("Values to save (sanityData):", sanityData);

            const payload = JSON.stringify(sanityData);
            console.log("Payload string length:", payload.length);
            console.log("Payload content:", payload);

            const response = await fetch('/api/theme-save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            setSaveMessage({ type: 'success', text: '¡Guardado en Sanity exitosamente!' });
        } catch (err) {
            console.error("Fetch error:", err);
            setSaveMessage({ type: 'error', text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 5000);
        }
    };

    // Reset to original Sanity values - clear preview and request fresh state
    const handleReset = useCallback(() => {
        // Clear local sessionStorage
        sessionStorage.removeItem('theme_editor_preview');

        // Send reset command to Menu tab to clear its sessionStorage too
        channelRef.current?.postMessage({
            type: MESSAGE_TYPES.RESET_THEME,
        } as ThemeMessage);

        // Clear local colors and mark as disconnected
        setColors({});
        setIsConnected(false);

        // After a short delay (to let Menu tab clear storage), request fresh state
        setTimeout(() => {
            channelRef.current?.postMessage({
                type: MESSAGE_TYPES.REQUEST_INITIAL_STATE,
            } as ThemeMessage);
        }, 500);

        setSaveMessage({ type: 'success', text: 'Reiniciando a valores originales de Sanity...' });
        setTimeout(() => setSaveMessage(null), 3000);
    }, []);

    const filteredCategories = getFilteredCategories();
    const totalColors = THEME_CATEGORIES.reduce((acc, cat) => acc + cat.colors.length, 0);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0d1117',
            color: '#e6edf3',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            fontSize: '14px',
        }}>
            {/* Header */}
            <header style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'linear-gradient(180deg, #161b22 0%, #0d1117 100%)',
                borderBottom: '1px solid #30363d',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                        src="https://www.tumenu.click/logo.svg"
                        alt="TuMenú.click"
                        style={{
                            width: '180px',
                            height: 'auto',
                            borderRadius: '6px',
                        }}
                    />
                    <div>
                        <h1 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#fff' }}>
                            Theme Editor
                        </h1>
                        <span style={{ fontSize: '12px', color: '#8b949e' }}>
                            {totalColors} variables de color
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                        href="/admin/bulk-theme-editor"
                        style={{
                            fontSize: '12px',
                            color: '#58a6ff',
                            textDecoration: 'none',
                            marginRight: '8px',
                            fontWeight: 500
                        }}
                    >
                        Bulk Editor ↗
                    </a>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: isConnected ? 'rgba(35, 134, 54, 0.2)' : 'rgba(187, 128, 9, 0.2)',
                        color: isConnected ? '#3fb950' : '#d29922',
                        border: `1px solid ${isConnected ? 'rgba(35, 134, 54, 0.4)' : 'rgba(187, 128, 9, 0.4)'}`,
                    }}>
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isConnected ? '#3fb950' : '#d29922',
                        }} />
                        {isConnected ? 'Conectado' : 'Esperando...'}
                    </span>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: '#21262d',
                            color: '#c9d1d9',
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#30363d';
                            e.currentTarget.style.borderColor = '#8b949e';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#21262d';
                            e.currentTarget.style.borderColor = '#30363d';
                        }}
                    >
                        ↻ Reiniciar
                    </button>
                </div>
            </header>

            {/* Search */}
            <div style={{
                flexShrink: 0,
                padding: '12px 16px',
                backgroundColor: '#161b22',
                borderBottom: '1px solid #21262d',
            }}>
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#8b949e',
                        fontSize: '14px',
                    }}>
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar variable de color..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            fontSize: '14px',
                            backgroundColor: '#0d1117',
                            color: '#e6edf3',
                            border: '1px solid #30363d',
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#58a6ff';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56, 139, 253, 0.15)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#30363d';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Categories accordion */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px',
            }}>
                {filteredCategories.map((category) => (
                    <div key={category.id} style={{ marginBottom: '4px' }}>
                        {/* Category header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                fontSize: '13px',
                                fontWeight: 600,
                                backgroundColor: expandedCategories.has(category.id) ? '#161b22' : 'transparent',
                                color: '#e6edf3',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s',
                                textAlign: 'left',
                            }}
                            onMouseOver={(e) => {
                                if (!expandedCategories.has(category.id)) {
                                    e.currentTarget.style.backgroundColor = '#161b22';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!expandedCategories.has(category.id)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{
                                fontSize: '10px',
                                color: '#8b949e',
                                transition: 'transform 0.15s',
                                transform: expandedCategories.has(category.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}>
                                ▶
                            </span>
                            <span style={{ fontSize: '16px' }}>{category.icon}</span>
                            <span style={{ flex: 1 }}>{category.title}</span>
                            <span style={{
                                fontSize: '11px',
                                color: '#8b949e',
                                backgroundColor: '#21262d',
                                padding: '2px 8px',
                                borderRadius: '10px',
                            }}>
                                {category.colors.length}
                            </span>
                        </button>

                        {/* Color inputs */}
                        {expandedCategories.has(category.id) && (
                            <div style={{
                                marginTop: '4px',
                                marginLeft: '20px',
                                paddingLeft: '12px',
                                borderLeft: '2px solid #21262d',
                            }}>
                                {category.colors.map((color) => (
                                    <ColorInput
                                        key={color.cssVar}
                                        variable={color.cssVar}
                                        label={color.label}
                                        value={colors[color.cssVar] || '#000000'}
                                        onChange={handleColorChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer actions */}
            <footer style={{
                flexShrink: 0,
                padding: '16px',
                backgroundColor: '#161b22',
                borderTop: '1px solid #30363d',
            }}>
                {/* Status message */}
                {saveMessage && (
                    <div style={{
                        marginBottom: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        backgroundColor: saveMessage.type === 'success' ? 'rgba(35, 134, 54, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                        color: saveMessage.type === 'success' ? '#3fb950' : '#f85149',
                        border: `1px solid ${saveMessage.type === 'success' ? 'rgba(35, 134, 54, 0.4)' : 'rgba(248, 81, 73, 0.4)'}`,
                    }}>
                        {saveMessage.type === 'success' ? '✓ ' : '✕ '}{saveMessage.text}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleImport}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: '#21262d',
                            color: '#c9d1d9',
                            border: '1px solid #30363d',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#30363d';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#21262d';
                        }}
                    >
                        📁 Cargar JSON
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: '#1f6feb',
                            color: '#fff',
                            border: '1px solid #1f6feb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#388bfd';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#1f6feb';
                        }}
                    >
                        💾 Exportar JSON
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: isSaving ? '#21262d' : '#238636',
                            color: isSaving ? '#8b949e' : '#fff',
                            border: `1px solid ${isSaving ? '#30363d' : '#238636'}`,
                            borderRadius: '8px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                            if (!isSaving) e.currentTarget.style.backgroundColor = '#2ea043';
                        }}
                        onMouseOut={(e) => {
                            if (!isSaving) e.currentTarget.style.backgroundColor = '#238636';
                        }}
                    >
                        {isSaving ? '⏳ Guardando...' : '✓ Aplicar a Sanity'}
                    </button>
                </div>
            </footer>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                }}>
                    <div style={{
                        backgroundColor: '#161b22',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        margin: '16px',
                        border: '1px solid #30363d',
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.5)',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(187, 128, 9, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                            fontSize: '24px',
                        }}>
                            ⚠️
                        </div>
                        <h2 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#fff',
                            marginBottom: '8px',
                        }}>
                            Confirmar Cambios
                        </h2>
                        <p style={{
                            fontSize: '14px',
                            color: '#8b949e',
                            marginBottom: '20px',
                            lineHeight: 1.5,
                        }}>
                            Esta acción sobrescribirá los colores del tema en Sanity.
                            Los cambios serán visibles para todos los usuarios después de rebuild.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    backgroundColor: '#21262d',
                                    color: '#c9d1d9',
                                    border: '1px solid #30363d',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#30363d';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#21262d';
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleApplyToSanity}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    backgroundColor: '#238636',
                                    color: '#fff',
                                    border: '1px solid #238636',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2ea043';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#238636';
                                }}
                            >
                                Sí, Aplicar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
