/**
 * ProductCard - Interactive product card
 * Replaces ItemCard.astro for interactive functionality
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { formatProductTitle } from '../../lib/stringUtils';
import {
    addToCart,
    incrementQuantity,
    decrementQuantity,
    generateUniqueId,
    getTotalQuantityBySlug,
    $cart
} from '../../stores/cartStore';
import QuantityControl from '../cart/QuantityControl';

interface ProductExtra {
    name: string;
    price: string;
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
        protein?: number;
        optionGroups?: {
            title: string;
            options: { name: string; price: string; isDefault?: boolean }[];
        }[];
    };
    sectionName: string;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    imageUrl: string;
    // Section extras - if present, product is "complex"
    sectionExtras?: {
        extraGroupsRefs?: {
            titleSingular?: string;
            titlePlural?: string;
            extras: { name: string; price: string }[];
            min?: number;
            included?: number;
            max?: number;
        }[];
    };
    onOpenModal: (data: any) => void;
}

export default function ProductCard({
    item,
    sectionName,
    currencySymbol,
    bestSellersTitleSingular,
    imageUrl,
    sectionExtras,
    onOpenModal
}: ProductCardProps) {
    const cart = useStore($cart);

    // Normalize title
    const formattedName = formatProductTitle(item.name);

    // Check if product has extras (complex product)
    const hasExtras = (sectionExtras && (
        (sectionExtras.extraGroupsRefs && sectionExtras.extraGroupsRefs.length > 0)
    )) || (item.optionGroups && item.optionGroups.length > 0);

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
            name: formattedName,
            slug: item.slug,
            price: item.price,
            price2: item.price2,
            description: item.description,
            image: imageUrl,
            currency: currencySymbol,
            bestSeller: item.bestSeller,
            protein: item.protein,
            section: sectionName,
            sectionExtras,
            optionGroups: item.optionGroups
        });
    };

    // Handle quick add (for simple products)
    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (hasExtras) {
            // Complex product - must open modal for extras selection
            handleDetailClick();
            return;
        }

        // Simple product - add directly to cart
        addToCart({
            productSlug: item.slug || item.name,
            name: formattedName,
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
            layout
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
                    alt={item.alt || formattedName}
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

                {/* Cart quantity indicator */}
                {totalQuantityInCart > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="
                            absolute -top-2 -right-2
                            w-6 h-6
                            bg-[var(--color-product-badge-bg)]
                            text-[var(--color-product-badge-text)]
                            text-xs font-bold
                            rounded-full
                            flex items-center justify-center
                        "
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
                        {formattedName}
                    </h3>
                    <p
                        className="font-bold text-[var(--color-text-price)] ml-2 flex-shrink-0"
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
