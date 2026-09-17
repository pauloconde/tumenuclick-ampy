import React from 'react';
import { useStore } from '@nanostores/react';
import { searchQuery } from '../../stores/menuStore';

interface MenuSearchBarProps {
    placeholder?: string;
    className?: string;
}

export default function MenuSearchBar({
    placeholder = 'Buscar producto...',
    className = ''
}: MenuSearchBarProps) {
    const query = useStore(searchQuery);

    const handleClear = () => {
        searchQuery.set('');
    };

    return (
        <div className={`relative w-full max-w-xl mx-auto ${className}`}>
            <div className="relative flex items-center">
                {/* Search Icon */}
                <div className="absolute left-4 z-10 pointer-events-none flex items-center justify-center text-[var(--color-navbar-select-icon,rgba(255,255,255,0.6))]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Input */}
                <input
                    id="menu-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => searchQuery.set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-10 py-3 rounded-full text-sm sm:text-base border transition-all duration-200 outline-none shadow-sm focus:ring-2"
                    style={{
                        backgroundColor: 'var(--color-menu-item-bg, rgba(255, 255, 255, 0.07))',
                        color: 'var(--color-text-subtitle, #ffffff)',
                        borderColor: query ? 'var(--color-text-section, #f08118)' : 'var(--color-navbar-border, rgba(255, 255, 255, 0.15))',
                        boxShadow: query ? '0 0 15px rgba(240, 129, 24, 0.15)' : 'none'
                    }}
                />

                {/* Clear Button */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Limpiar búsqueda"
                        className="absolute right-3 z-10 p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
