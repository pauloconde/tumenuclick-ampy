/**
 * MenuSectionOrder - React version of MenuSection for interactive ordering
 */
import React from 'react';
import ProductCardOrder from '../cards/ProductCardOrder';
import { openProductModal } from '../../cart/CartWrapper';

interface Extra {
    name: string;
    price: string;
    isRecommended?: boolean;
}

interface OptionGroup {
    title: string;
    options: OptionItem[];
}

interface ExtraGroupRef {
    titleSingular?: string;
    titlePlural?: string;
    extras: Extra[];
    min?: number;
    included?: number;
    max?: number;
    allowQuantity?: boolean;
}

interface MenuItem {
    name: string;
    slug?: string;
    subtitle?: string;
    price: string;
    price2?: string;
    description: string;
    imgSrc?: string;
    alt?: string;
    bestSeller?: boolean;
    imageUrl: string; // Pre-calculated image URL
    servings?: number;
    optionGroups?: OptionGroup[];

    // Variantes
    variantGroups?: any[]; // Using any[] or specific type if I redefine it here or import it. Let's use generic or duplicate the interface if needed. Ideally I should export these interfaces centrally but for now I'll just add it.

    // Extras directos del producto
    extras?: Extra[];
    extrasMin?: number;
    extrasIncluded?: number;
    extrasMax?: number;
}

interface Section {
    title: string;
    subtitle?: string;
    items?: MenuItem[];
    extraGroupsRefs?: ExtraGroupRef[];
}

interface OptionItem {
    name: string;
    price: string;
    isDefault?: boolean;
}

interface MenuSectionOrderProps {
    section: Section;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    newsTitleSingular?: string;
    // Morphic props
    backgroundColor?: string;
    columns?: number;
    customStyles?: any;
}

import { formatProductTitle } from '../../../lib/stringUtils';

export default function DefaultSectionLayout({
    section,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    newsTitleSingular,
    backgroundColor,
    columns = 3, // Default to 3 if not provided
    customStyles
}: MenuSectionOrderProps) {
    // Section extras and options to pass to each product
    const sectionExtras = {
        extraGroupsRefs: section.extraGroupsRefs
    };

    const sectionId = section.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return (
        <section
            className="scroll-mt-24 pt-16"
            id={sectionId}
            style={{
                backgroundColor: backgroundColor || 'transparent',
                ...customStyles
            }}
        >
            <h2
                className="text-[var(--color-text-section)] text-center mb-2 leading-none! pb-6"
                style={{
                    fontFamily: 'var(--font-section-title-family, Arial, sans-serif)',
                    fontStyle: 'var(--font-section-title-style, normal)',
                    fontWeight: 'var(--font-section-title-weight, 400)',
                    fontSize: 'var(--font-section-title-size, 40px)',
                    lineHeight: 'var(--font-section-title-line-height, 1.2)'
                }}
            >
                {formatProductTitle(section.title)}
            </h2>

            {section.subtitle && (
                <p className="text-xl font-bold text-white text-center mb-6">
                    {section.subtitle}
                </p>
            )}

            {section.items && section.items.length > 0 && (
                <div
                    className={`grid gap-10 md:gap-15 lg:gap-25`}
                    style={{
                        gridTemplateColumns: `repeat(1, minmax(0, 1fr))`, // Default mobile
                        // We will handle responsive columns via style or class if possible, 
                        // but Tailwind grid-cols classes are static. 
                        // Since 'columns' prop usually refers to desktop, we can use inline style for desktop media query if we were using CSS-in-JS, 
                        // but here it's tricky with pure inline styles for responsive.
                        // However, the user asked for "columns" config. 
                        // For simplicity and robustness with Tailwind, we might map number to class if it's 1, 2, 3, 4.
                    }}
                >
                    {/* 
                    Workaround: To support dynamic columns with Tailwind, we can't easily interpolate class names 
                    unless they are safelisted. 
                    Let's use inline styles for the grid template columns on larger screens if possible, 
                    or just map to known classes: grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4.
                 */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-10 lg:gap-25 md:gap-15 w-full`}>
                        {section.items.map((item, idx) => (
                            <ProductCardOrder
                                key={item.slug || `${section.title}-${idx}`}
                                item={item}
                                sectionName={section.title}
                                currencySymbol={currencySymbol}
                                priceDivider={priceDivider}
                                bestSellersTitleSingular={bestSellersTitleSingular}
                                newsTitleSingular={newsTitleSingular}
                                imageUrl={item.imageUrl}
                                sectionExtras={sectionExtras}
                                onOpenModal={openProductModal}
                            />
                        ))}
                    </div>
                </div>
            )}


            {section.extraGroupsRefs && section.extraGroupsRefs.length > 0 && (
                section.extraGroupsRefs.map((group, groupIdx) => (
                    <div key={groupIdx} className="mt-8">
                        {(group.titlePlural || group.titleSingular) && (
                            <h3 className="text-xl font-bold text-[var(--color-text-section)] mb-4">
                                {group.titlePlural || group.titleSingular}
                            </h3>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {group.extras.map((extra, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center bg-[var(--color-extras-bg)] rounded-lg p-3"
                                    style={{
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08)'
                                    }}
                                >
                                    <span className="text-sm font-medium text-[var(--color-extras-text)]">
                                        {extra.name}
                                    </span>
                                    <span className="text-sm font-bold text-[var(--color-extras-price)] ml-2 whitespace-nowrap">
                                        {currencySymbol}{extra.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </section>
    );
}
