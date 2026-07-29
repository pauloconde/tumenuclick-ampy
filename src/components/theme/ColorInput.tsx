import { useState, useEffect } from 'react';

interface ColorInputProps {
    variable: string;
    label: string;
    value: string;
    onChange: (variable: string, value: string) => void;
}

/**
 * ColorInput - Professional compact color input component
 * 
 * Features:
 * - Native color picker for visual selection
 * - Hex text input with validation
 * - Inline preview swatch
 */
export default function ColorInput({ variable, label, value, onChange }: ColorInputProps) {
    const [localValue, setLocalValue] = useState(value);
    const [isValid, setIsValid] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    // Validate hex color format
    const validateHex = (hex: string): boolean => {
        return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(hex);
    };

    // Handle color picker change (immediate)
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        setIsValid(true);
        onChange(variable, newValue);
    };

    // Handle text input change
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Handle transparent keyword
        if (newValue.toLowerCase() === 'transparent') {
            newValue = '#00000000';
        }
        // Auto-add # if not present (but skip if typing "transparent")
        else if (newValue && !newValue.startsWith('#') && newValue.toLowerCase() !== 'transparent') {
            // Check if it looks like they are trying to type transparent
            if (!'transparent'.startsWith(newValue.toLowerCase())) {
                newValue = '#' + newValue;
            }
        }

        setLocalValue(newValue);

        if (validateHex(newValue)) {
            setIsValid(true);
            onChange(variable, newValue);
        } else {
            setIsValid(newValue.length < 9); // Allow typing up to 8 chars + #
        }
    };

    // Handle blur - reset to last valid if invalid
    const handleBlur = () => {
        setIsFocused(false);
        if (!validateHex(localValue)) {
            setLocalValue(value);
            setIsValid(true);
        }
    };

    // Sync local value when prop changes
    useEffect(() => {
        if (validateHex(value) && value !== localValue) {
            setLocalValue(value);
        }
    }, [value]);

    const displayColor = validateHex(localValue) ? localValue : value;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                margin: '2px 0',
                borderRadius: '6px',
                backgroundColor: isFocused ? '#21262d' : 'transparent',
                transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
                if (!isFocused) e.currentTarget.style.backgroundColor = '#161b22';
            }}
            onMouseLeave={(e) => {
                if (!isFocused) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            {/* Color picker with preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '2px solid #30363d',
                        backgroundColor: displayColor,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                        transition: 'border-color 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#58a6ff';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#30363d';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <input
                        type="color"
                        value={displayColor.slice(0, 7)}
                        onChange={handleColorChange}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                        }}
                        title={label}
                    />
                </div>
            </div>

            {/* Label and Variable */}
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    minWidth: 0,
                }}
            >
                <span
                    style={{
                        display: 'block',
                        fontSize: '13px',
                        color: '#c9d1d9',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                    title={label}
                >
                    {label}
                </span>
                <span
                    style={{
                        display: 'block',
                        fontSize: '10px',
                        color: '#8b949e',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px',
                    }}
                    title={variable}
                >
                    {variable}
                </span>
            </div>

            {/* Hex input */}
            <input
                type="text"
                value={localValue}
                onChange={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                style={{
                    width: '85px',
                    padding: '6px 8px',
                    fontSize: '12px',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontWeight: 500,
                    backgroundColor: '#0d1117',
                    color: isValid ? '#e6edf3' : '#f85149',
                    border: `1px solid ${isValid ? (isFocused ? '#58a6ff' : '#30363d') : '#f85149'}`,
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: isFocused ? '0 0 0 3px rgba(56, 139, 253, 0.15)' : 'none',
                }}
                placeholder="#000000"
                maxLength={9}
            />
        </div>
    );
}
