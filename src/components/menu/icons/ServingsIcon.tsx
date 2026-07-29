/**
 * ServingsIcon - Displays an icon indicating how many people a product serves
 * - 2 people: Two person icons
 * - 3 people: Three person icons
 * - 4+ people: Three person icons with a plus sign
 */
import React from 'react';

interface ServingsIconProps {
    servings: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

// Single person SVG icon - compact design for better grouping
const PersonIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        style={style}
    >
        <circle cx="12" cy="7" r="4" />
        <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
    </svg>
);

const sizeConfig = {
    sm: { iconSize: '1em', overlap: '-0.35em' },
    md: { iconSize: '1.1em', overlap: '-0.4em' },
    lg: { iconSize: '1.3em', overlap: '-0.45em' }
};

export default function ServingsIcon({ servings, className = '', size = 'md' }: ServingsIconProps) {
    // Only show for servings >= 2
    if (!servings || servings < 2) {
        return null;
    }

    // Calculate how many person icons to show (max 3)
    const personCount = Math.min(servings, 3);
    const showPlus = servings > 3;
    const config = sizeConfig[size];

    return (
        <span
            className={`servings-icon inline-flex items-center ${className}`}
            title={`Para ${servings} persona${servings > 1 ? 's' : ''}`}
            aria-label={`Para ${servings} personas`}
        >
            {/* Render person icons - overlapping for compact look */}
            {Array.from({ length: personCount }).map((_, index) => (
                <PersonIcon
                    key={index}
                    style={{
                        width: config.iconSize,
                        height: config.iconSize,
                        marginLeft: index === 0 ? '0' : config.overlap
                    }}
                />
            ))}
            {/* Plus sign for 4+ servings */}
            {showPlus && (
                <span className="text-[0.8em] font-bold ml-0.5">+</span>
            )}
        </span>
    );
}

// Astro-compatible function component for inline SVG generation
export function getServingsIconHtml(servings: number, size: 'sm' | 'md' | 'lg' = 'md'): string {
    if (!servings || servings < 2) {
        return '';
    }

    const personCount = Math.min(servings, 3);
    const showPlus = servings > 3;
    const config = sizeConfig[size];

    const createPersonSvg = (isFirst: boolean) => {
        const marginLeft = isFirst ? '0' : config.overlap;
        return `<svg viewBox="0 0 24 24" fill="currentColor" style="width: ${config.iconSize}; height: ${config.iconSize}; margin-left: ${marginLeft};"><circle cx="12" cy="7" r="4"/><path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/></svg>`;
    };

    let html = `<span class="servings-icon" title="Para ${servings} persona${servings > 1 ? 's' : ''}" style="display: inline-flex; align-items: center;">`;

    for (let i = 0; i < personCount; i++) {
        html += createPersonSvg(i === 0);
    }

    if (showPlus) {
        html += `<span style="font-size: 0.8em; font-weight: bold; margin-left: 0.125rem;">+</span>`;
    }

    html += '</span>';

    return html;
}

export function ServingsBadge({ servings, className = '', variant = 'modal', showText = true }: { servings: number; className?: string; variant?: 'card' | 'modal'; showText?: boolean }) {
    if (!servings || servings < 2) {
        return null;
    }

    const isModal = variant === 'modal';

    const styles = isModal
        ? {
            backgroundColor: 'var(--color-modal-price-bg)',
            color: 'var(--color-modal-price-text)'
        }
        : {
            backgroundColor: 'var(--color-menu-item-bg)',
            color: 'var(--color-text-subtitle)',
            border: '1px solid var(--color-menu-item-border)'
        };

    // Modal Style: Larger padding, text-sm, md icon
    // Card Style: Compact padding, text-xs, sm icon
    const paddingX = showText
        ? (isModal ? '0.75rem' : '0.625rem')
        : '0.375rem';

    const paddingY = isModal ? 'py-1.5' : 'py-1';
    const textSize = isModal ? 'text-sm' : 'text-xs';
    const iconSize = isModal ? 'md' : 'sm';
    const gap = isModal ? 'gap-2' : 'gap-1.5';

    return (
        <span
            className={`servings-badge inline-flex items-center ${gap} ${paddingY} rounded-full ${textSize} font-medium ${className}`}
            style={{ ...styles, paddingLeft: paddingX, paddingRight: paddingX }}
            title={`Para ${servings} persona${servings > 1 ? 's' : ''}`}
        >
            <ServingsIcon servings={servings} size={iconSize} />
            {showText && <span>Compartir: {servings} personas</span>}
        </span>
    );
}

// Astro-compatible HTML for servings badge
export function getServingsBadgeHtml(servings: number, showText: boolean = true): string {
    if (!servings || servings < 2) {
        return '';
    }

    const iconHtml = getServingsIconHtml(servings, 'sm');
    const paddingX = showText ? '0.625rem' : '0.375rem';

    // If showText is false, we need to pass title attribute to container for tooltip
    const titleAttr = !showText ? `title="Para ${servings} persona${servings > 1 ? 's' : ''}"` : '';

    return `
        <span class="servings-badge" ${titleAttr} style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem ${paddingX}; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background-color: var(--color-menu-item-bg); color: var(--color-text-subtitle); border: 1px solid var(--color-menu-item-border);">
            ${iconHtml}
            ${showText ? `<span>Compartir: ${servings} personas</span>` : ''}
        </span>
    `;
}
