import React from 'react';
import DefaultSectionLayout from '../sectionLayouts/DefaultSectionLayout';
import CarouselSectionLayout from '../sectionLayouts/CarouselSectionLayout';

interface SectionFactoryProps {
    section: any; // Type should be imported from types but using any for now to avoid circular deps or complex imports
    globalLayoutPreference?: string;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    newsTitleSingular?: string;
}

export default function SectionFactory({
    section,
    globalLayoutPreference,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    newsTitleSingular
}: SectionFactoryProps) {
    // 1. Determine the effective layout
    // Priority: Section Override > Global Default > Hardcoded fallback ('grid')
    const layout = section.sectionLayout || globalLayoutPreference || 'grid';

    // 2. Render the corresponding component
    switch (layout) {
        case 'list':
            // TODO: Implement List layout or mapped component
            // For now, fallback to default or show a "Not Implemented" placeholder if dev mode?
            // Falling back to grid/default for safety
            return (
                <DefaultSectionLayout
                    section={section}
                    currencySymbol={currencySymbol}
                    priceDivider={priceDivider}
                    bestSellersTitleSingular={bestSellersTitleSingular}
                    newsTitleSingular={newsTitleSingular}
                />
            );
        case 'carousel':
            return (
                <CarouselSectionLayout
                    section={section}
                    currencySymbol={currencySymbol}
                    priceDivider={priceDivider}
                    bestSellersTitleSingular={bestSellersTitleSingular}
                    newsTitleSingular={newsTitleSingular}
                />
            );
        case 'grid':
        default:
            return (
                <DefaultSectionLayout
                    section={section}
                    currencySymbol={currencySymbol}
                    priceDivider={priceDivider}
                    bestSellersTitleSingular={bestSellersTitleSingular}
                    newsTitleSingular={newsTitleSingular}
                />
            );
    }
}
