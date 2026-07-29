
import React from 'react';
import CarouselSectionLayout from '../sectionLayouts/CarouselSectionLayout';
import DefaultSectionLayout from '../sectionLayouts/DefaultSectionLayout';
import ProductBuilderSectionOrder from '../ProductBuilderSectionOrder';

interface ReactSectionFactoryProps {
    section: any;
    globalLayoutPreference?: string;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    newsTitleSingular?: string;
    isSingleView?: boolean; // Prop to indicate we are in single view (maybe adjust layout?)
}

// NOTE: This factory mimics SectionFactory.astro but in React.
const ReactSectionFactory: React.FC<ReactSectionFactoryProps> = ({
    section,
    globalLayoutPreference,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    newsTitleSingular,
    isSingleView = false,
}) => {
    if (section._type === 'productBuilder') {
        // ProductBuilder logic from index.astro
        // line 147 in index.astro:
        /*
          <ProductBuilderDisplay ... />
          <ProductBuilderSectionOrder ... />
        */
        return (
            <ProductBuilderSectionOrder
                title={section.title}
                description={section.description}
                basePrice={section.basePrice || 0}
                slug={{ current: section.slug }}
                steps={section.steps || []}
                currencySymbol={currencySymbol}
            />
        );
    }

    // Standard Menu Section
    const version = section.version || globalLayoutPreference || 'grid';
    const designConfig = section.designConfig || {};

    let customStyles = {};
    try {
        if (section.customStyles && typeof section.customStyles === 'string') {
            customStyles = JSON.parse(section.customStyles);
        } else if (section.customStyles && typeof section.customStyles === 'object') {
            customStyles = section.customStyles;
        }
    } catch (e) {
        console.error('Error parsing customStyles for section:', section.title, e);
    }

    const componentProps = {
        section,
        currencySymbol,
        priceDivider,
        bestSellersTitleSingular,
        newsTitleSingular,
        ...designConfig,
        customStyles,
    };

    // If we are in single view, we might want to force a specific layout or keep as is?
    // User asked "show it with its title and everything, like before".
    // So we respect the `version` configuration.

    if (version === 'carousel') {
        return <CarouselSectionLayout {...componentProps} />;
    }

    return <DefaultSectionLayout {...componentProps} />;
};

export default ReactSectionFactory;
