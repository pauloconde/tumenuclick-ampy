
import React from 'react';
import CarouselProductCard from '../cards/CarouselProductCard';
import { openProductModal } from '../../cart/CartWrapper';
import { formatProductTitle } from '../../../lib/stringUtils';

// Importing types from types definition file or duplicating if needed for now to move fast
// Ideally we share these.
interface Extra {
    name: string;
    price: string;
    isRecommended?: boolean;
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
    imageUrl: string;
    servings?: number;
    extraGroupsRefs?: ExtraGroupRef[];
    // ... other props
}

interface Section {
    title: string;
    subtitle?: string;
    items?: MenuItem[];
    extraGroupsRefs?: ExtraGroupRef[];
}

interface CarouselSectionLayoutProps {
    section: Section;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    newsTitleSingular?: string;
    // Morphic props
    backgroundColor?: string;
    autoplay?: boolean;
    customStyles?: any;
}

export default function CarouselSectionLayout({
    section,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    newsTitleSingular,
    backgroundColor,
    autoplay,
    customStyles
}: CarouselSectionLayoutProps) {
    // Determine section ID for navigation
    const sectionId = section.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    // Section extras context
    const sectionExtras = {
        extraGroupsRefs: section.extraGroupsRefs
    };

    if (!section.items || section.items.length === 0) return null;

    return (
        <section
            className="scroll-mt-24 pt-16 w-full"
            id={sectionId}
            style={{
                backgroundColor: backgroundColor || 'transparent',
                ...customStyles
            }}
        >
            <h2
                className="text-[var(--color-text-section)] text-center mb-2 leading-none! "
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

            <div className="flex overflow-x-auto pt-5 pb-4 px-4 space-x-4 scrollbar-bestsellers">
                {section.items.map((item, idx) => (
                    <CarouselProductCard
                        key={item.slug || `${section.title}-${idx}`}
                        item={{
                            ...item,
                            sectionName: section.title,
                            // NO sectionExtras here to avoid TS error on 'item'
                        }}
                        currencySymbol={currencySymbol}
                        priceDivider={priceDivider}
                        bestSellersTitleSingular={bestSellersTitleSingular}
                        newsTitleSingular={newsTitleSingular}
                        onOpenModal={(data) => {
                            openProductModal({
                                ...data,
                                sectionExtras: sectionExtras, // Pass here!!
                                sectionName: section.title
                            });
                        }}
                    />
                ))}
            </div>

            {/* Render Section Extras at bottom if needed, similar to Default Layout? 
                 Usually Grid layout shows extras at bottom. Carousel might be weird to show extras at bottom of carousel?
                 User didn't specify, but for consistency with "Section", we probably should render them if they exist for the whole section.
                 However, "Carousel" implies a lighter display. I will omit them for now unless requested, 
                 or maybe render them below the carousel.
                 Let's check DefaultSectionLayout logic. It renders extras at the bottom.
                 I will assume yes, render them below.
             */}

            {section.extraGroupsRefs && section.extraGroupsRefs.length > 0 && (
                <div className="px-4 mt-4">
                    {section.extraGroupsRefs.map((group, groupIdx) => (
                        <div key={groupIdx} className="mt-4">
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
                    ))}
                </div>
            )}

        </section>
    );
}

