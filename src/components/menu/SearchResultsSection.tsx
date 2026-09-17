import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCardOrder from './cards/ProductCardOrder';
import { openProductModal } from '../cart/CartWrapper';
import { normalizeSearchText, searchQuery } from '../../stores/menuStore';

interface SearchResultsSectionProps {
    sections: any[];
    query: string;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    newsTitleSingular?: string;
    onClear?: () => void;
}

export default function SearchResultsSection({
    sections,
    query,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    newsTitleSingular,
    onClear
}: SearchResultsSectionProps) {
    const normalizedQuery = normalizeSearchText(query);

    // Flatten and filter products across all categories
    const matchingProducts = useMemo(() => {
        if (!normalizedQuery) return [];

        const results: Array<{
            item: any;
            sectionName: string;
            sectionExtras?: any;
        }> = [];

        // Words in search term for multiple keywords matching
        const searchWords = normalizedQuery.split(/\s+/).filter(Boolean);

        sections.forEach((section: any) => {
            const sectionExtras = {
                extraGroupsRefs: section.extraGroupsRefs
            };

            const sectionNorm = normalizeSearchText(section.title || '');
            const sectionWords = sectionNorm.split(/\s+/).filter(Boolean);

            const items = section.items || [];
            items.forEach((item: any) => {
                const nameNorm = normalizeSearchText(item.name || '');
                const descNorm = normalizeSearchText(item.description || '');
                const priceNorm = String(item.price || '').replace(/[^0-9.]/g, '');

                // Coincidir si cada término de búsqueda está en:
                // 1. Nombre del producto
                // 2. Descripción (ej: "Tamaño: 20cm")
                // 3. Precio exacto (ej: buscar "20" encuentra productos que valen $20)
                // 4. Palabra en el título de la categoría (ej: "oso" coincide con "Oso Cariñosito")
                const matches = searchWords.every(word => {
                    const isNum = /^\d+$/.test(word);
                    const priceMatches = isNum && priceNorm === word;

                    return (
                        nameNorm.includes(word) ||
                        descNorm.includes(word) ||
                        priceMatches ||
                        sectionWords.some(sw => sw.startsWith(word) || sw === word)
                    );
                });

                if (matches) {
                    results.push({
                        item,
                        sectionName: section.title,
                        sectionExtras
                    });
                }
            });
        });

        return results;
    }, [sections, normalizedQuery]);

    const handleClearSearch = () => {
        searchQuery.set('');
        if (onClear) onClear();
    };

    return (
        <div className="w-full pb-20 pt-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[var(--color-menu-item-bg,rgba(255,255,255,0.05))] p-4 rounded-2xl border border-white/10">
                <div className="text-center sm:text-left">
                    <h2
                        className="text-[var(--color-text-section)] font-bold text-xl sm:text-2xl"
                        style={{
                            fontFamily: 'var(--font-section-title-family, Arial, sans-serif)'
                        }}
                    >
                        Resultados para: <span className="text-[var(--color-text-title)] font-extrabold">"{query}"</span>
                    </h2>
                    <p className="text-sm text-[var(--color-text-subtitle,rgba(255,255,255,0.7))] mt-1">
                        {matchingProducts.length === 1
                            ? '1 producto encontrado'
                            : `${matchingProducts.length} productos encontrados`}
                    </p>
                </div>

                <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border border-white/20 hover:border-white/40 active:scale-95 shadow-md"
                    style={{
                        backgroundColor: 'var(--color-back-btn-bg, var(--color-text-section))',
                        color: 'var(--color-back-btn-text, #ffffff)'
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Limpiar búsqueda</span>
                </button>
            </div>

            {/* Results Grid or Empty State */}
            {matchingProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                    <AnimatePresence mode="popLayout">
                        {matchingProducts.map(({ item, sectionName, sectionExtras }, idx) => (
                            <motion.div
                                key={`${sectionName}-${item._id || item.slug || item.name}-${idx}`}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="relative"
                            >
                                {/* Category Badge showing where the product belongs */}
                                <div className="mb-1.5 flex items-center justify-between px-1">
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-[var(--color-text-section)] border border-white/10">
                                        📁 {sectionName}
                                    </span>
                                </div>

                                <ProductCardOrder
                                    item={item}
                                    sectionName={sectionName}
                                    currencySymbol={currencySymbol}
                                    priceDivider={priceDivider}
                                    bestSellersTitleSingular={bestSellersTitleSingular}
                                    newsTitleSingular={newsTitleSingular}
                                    imageUrl={item.imageUrl}
                                    sectionExtras={sectionExtras}
                                    onOpenModal={openProductModal}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-white/10 bg-white/5"
                >
                    <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-white/10 text-3xl">
                        🔍
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text-title)] mb-2">
                        No encontramos coincidencias
                    </h3>
                    <p className="text-sm text-[var(--color-text-subtitle,rgba(255,255,255,0.7))] max-w-md mb-6">
                        No hay productos que coincidan con "<span className="font-semibold">{query}</span>". Intenta con otra palabra o explora las categorías del menú.
                    </p>
                    <button
                        onClick={handleClearSearch}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[var(--color-text-section)] hover:opacity-90 active:scale-95 transition-all shadow-lg"
                    >
                        Ver todas las categorías
                    </button>
                </motion.div>
            )}
        </div>
    );
}
