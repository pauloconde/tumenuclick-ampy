/**
 * ProductCardOrder - Interactive product card for ordering
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { formatProductTitle } from '../../../lib/stringUtils';
import {
    addToCart,
    incrementQuantity,
    decrementQuantity,
    generateUniqueId,
    getTotalQuantityBySlug,
    $cart
} from '../../../stores/cartStore';
import QuantityControl from '../../cart/QuantityControl';
import { ServingsBadge } from '../icons/ServingsIcon';
import { getImageUrl } from '../../../lib/imageUrl';

interface ProductExtra {
    name: string;
    price: string;
    isRecommended?: boolean;
}

interface ProductCardProps {
    item: {
        name: string;
        slug?: string;
        subtitle?: string;
        price: string;
        price2?: string;
        description: string;
        imgSrc?: string;
        alt?: string;
        bestSeller?: boolean;
        isNew?: boolean;
        servings?: number;
        protein?: number;
        extras?: {
            name: string;
            price: string;
            isRecommended?: boolean;
        }[];
        extrasMin?: number;
        extrasIncluded?: number;
        extrasMax?: number;
        extrasTitleSingular?: string;
        extrasTitlePlural?: string;
        optionGroups?: {
            title: string;
            options: { name: string; price: string; isDefault?: boolean }[];
        }[];
        optionGroupsRefs?: {
            title: string;
            options: { name: string; price: string; isDefault?: boolean }[];
        }[];
        extraGroupsRefs?: {
            titleSingular?: string;
            titlePlural?: string;
            extras: { name: string; price: string; isRecommended?: boolean }[];
            min?: number;
            included?: number;
            max?: number;
            allowQuantity?: boolean;
        }[];
        variantGroups?: {
            title: string;
            variants: { name: string; price: string; isDefault?: boolean; image?: any }[];
        }[];
        gallery?: string[];
    };
    sectionName: string;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    newsTitleSingular?: string;
    imageUrl: string;
    // Section extras - if present, product is "complex"
    sectionExtras?: {
        extraGroupsRefs?: {
            titleSingular?: string;
            titlePlural?: string;
            extras: { name: string; price: string; isRecommended?: boolean }[];
            min?: number;
            included?: number;
            max?: number;
            allowQuantity?: boolean;
        }[];
    };
    onOpenModal: (data: any) => void;
}

export default function ProductCardOrder({
    item,
    sectionName,
    currencySymbol,
    bestSellersTitleSingular,
    newsTitleSingular,
    imageUrl,
    sectionExtras,
    onOpenModal
}: ProductCardProps) {
    const cart = useStore($cart);

    // Check if product has extras (complex product)
    const hasExtras = (sectionExtras && (
        (sectionExtras.extraGroupsRefs && sectionExtras.extraGroupsRefs.length > 0)
    )) || (item.variantGroups && item.variantGroups.length > 0) || (item.optionGroups && item.optionGroups.length > 0) || (item.extras && item.extras.length > 0);

    // Parse base price
    const basePrice = parseFloat(item.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

    // Get quantity in cart for this specific product variant (without extras)
    const simpleUniqueId = generateUniqueId(item.slug || item.name, []);
    const quantityInCart = cart.find(i => i.uniqueId === simpleUniqueId)?.quantity || 0;

    // Get total quantity across ALL variants of this product (with/without extras)
    const totalQuantityInCart = getTotalQuantityBySlug(item.slug || item.name);

    // Handle click on image/title area - opens modal
    const handleDetailClick = () => {
        onOpenModal({
            name: formatProductTitle(item.name),
            slug: item.slug,
            price: item.price,
            price2: item.price2,
            description: item.description,
            image: getImageUrl(item.imgSrc, 1080, { quality: 100 }),
            placeholderImage: imageUrl,
            currency: currencySymbol,
            bestSeller: item.bestSeller,
            isNew: item.isNew,
            servings: item.servings,
            protein: item.protein,
            section: sectionName,
            sectionExtras,
            optionGroups: item.optionGroups,
            optionGroupsRefs: item.optionGroupsRefs,
            extraGroupsRefs: item.extraGroupsRefs,
            extras: item.extras,
            extrasMin: item.extrasMin,
            extrasIncluded: item.extrasIncluded,
            extrasMax: item.extrasMax,
            extrasTitleSingular: item.extrasTitleSingular,
            extrasTitlePlural: item.extrasTitlePlural,
            gallery: item.gallery,
            variantGroups: item.variantGroups
        });
    };

    // Handle quick add (for simple products)
    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (hasExtras) {
            handleDetailClick();
            return;
        }

        addToCart({
            productSlug: item.slug || item.name,
            name: formatProductTitle(item.name),
            unitPrice: basePrice,
            extras: [],
            sectionName,
            imageUrl
        });
    };

    const handleIncrement = () => {
        if (hasExtras) {
            handleDetailClick();
        } else {
            incrementQuantity(simpleUniqueId);
        }
    };

    const handleDecrement = () => {
        decrementQuantity(simpleUniqueId);
    };

    return (
        <motion.div
            className="menu-item-inner-highlight flex items-start space-x-4 cursor-pointer p-3 rounded-xl relative group"
            style={{
                backgroundColor: 'var(--color-menu-item-bg)',
                border: '1px solid var(--color-menu-item-border)',
            }}
            onClick={handleDetailClick}
        >
            {/* Image */}
            <div className="relative flex-shrink-0">
                <img
                    alt={item.alt || formatProductTitle(item.name)}
                    className="w-24 h-24 object-cover rounded-lg"
                    src={imageUrl}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                    }}
                    style={{
                        backgroundColor: 'var(--color-product-bg, transparent)',
                        backgroundImage: `var(--product-bg-image, none)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                {/* New badge */}
                {item.isNew && (
                    <span
                        className="
                            absolute -top-2 -right-2
                            bg-[var(--color-new-badge-bg)]
                            text-[var(--color-new-badge-text)]
                            text-[0.65rem] font-bold
                            px-1.5 py-0.5
                            rounded-full
                            uppercase tracking-wide
                            shadow-sm
                        "
                        style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)' }}
                    >
                        {newsTitleSingular || 'Nuevo'}
                    </span>
                )}

                {/* Cart quantity indicator */}
                {totalQuantityInCart > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`
                            absolute -right-2
                            w-6 h-6
                            bg-[var(--color-product-badge-bg)]
                            text-[var(--color-product-badge-text)]
                            text-xs font-bold
                            rounded-full
                            flex items-center justify-center
                            ${item.isNew ? '-bottom-2' : '-top-2'}
                        `}
                    >
                        {totalQuantityInCart}
                    </motion.div>
                )}
            </div>

            {/* Content */}
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3
                        className="font-bold text-lg text-[var(--color-text-title)]"
                        style={{
                            fontFamily: 'var(--font-product-title-family, inherit)',
                            fontStyle: 'var(--font-product-title-style, normal)',
                            fontWeight: 'var(--font-product-title-weight, bold)',
                            fontSize: 'var(--font-product-title-size, 1.125rem)',
                            lineHeight: 'var(--font-product-title-line-height, 1.2)'
                        }}
                    >
                        {formatProductTitle(item.name)}
                    </h3>
                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <div className="flex items-center gap-1.5">
                            {item.servings && item.servings >= 2 && (
                                <ServingsBadge servings={item.servings} variant="card" showText={false} />
                            )}
                            <p
                                className="font-bold text-[var(--color-text-price)]"
                                style={{
                                    fontFamily: 'var(--font-product-price-family, inherit)',
                                    fontStyle: 'var(--font-product-price-style, normal)',
                                    fontWeight: 'var(--font-product-price-weight, bold)',
                                    fontSize: 'var(--font-product-price-size, 1rem)',
                                    lineHeight: 'var(--font-product-price-line-height, 1.5)'
                                }}
                            >
                                {currencySymbol}{item.price}
                                {item.price2 && (
                                    <>
                                        <span className="ml-1 text-[var(--color-text-price)] h-4 inline-block align-middle border-l border-[var(--color-text-price)] opacity-40 mx-1"></span>
                                        {currencySymbol}{item.price2}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <p
                    className={`text-[var(--color-text-subtitle)] text-sm mt-1 line-clamp-2 ${quantityInCart > 0 && !hasExtras ? 'pr-28' : 'pr-12'}`}
                    style={{
                        whiteSpace: 'pre-line',
                        fontFamily: 'var(--font-product-description-family, inherit)',
                        fontStyle: 'var(--font-product-description-style, normal)',
                        fontWeight: 'var(--font-product-description-weight, normal)',
                        fontSize: 'var(--font-product-description-size, 0.875rem)',
                        lineHeight: 'var(--font-product-description-line-height, 1.5)'
                    }}
                >
                    {item.description}
                </p>
                {item.protein && item.protein > 0 && (
                    <div className="mt-2 flex">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            💪 Aporta {item.protein}g de proteína
                        </span>
                    </div>
                )}
            </div>

            {/* Add / Quantity Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-3 right-3"
                onClick={(e) => e.stopPropagation()}
            >
                {quantityInCart > 0 && !hasExtras ? (
                    <QuantityControl
                        quantity={quantityInCart}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                        size="sm"
                    />
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleQuickAdd}
                        className="
                            w-8 h-8
                            flex items-center justify-center
                            rounded-full
                            border-2 border-[var(--color-product-add-btn-border)]
                            text-[var(--color-product-add-btn-text)]
                            bg-[var(--color-product-add-btn-bg)]
                            hover:bg-[var(--color-product-add-btn-border)]
                            hover:text-[var(--color-bg-main)]
                            transition-colors duration-200
                            font-bold text-lg
                        "
                        aria-label={hasExtras ? 'Personalizar' : 'Agregar al carrito'}
                    >
                        +
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
}
