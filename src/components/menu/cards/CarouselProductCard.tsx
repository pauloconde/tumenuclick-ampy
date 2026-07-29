import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import {
    addToCart,
    incrementQuantity,
    decrementQuantity,
    generateUniqueId,
    $cart
} from '../../../stores/cartStore';
import QuantityControl from '../../cart/QuantityControl';
import ServingsIcon from '../icons/ServingsIcon';
import { getImageUrl } from '../../../lib/imageUrl';

interface CarouselProductCardProps {
    item: {
        name: string;
        slug?: string;
        price: string;
        price2?: string;
        price3?: string;
        description: string;
        imgSrc?: any;
        gallery?: string[];
        imageUrl?: string; // Support pre-calculated
        alt?: string;
        bestSeller?: boolean;
        isNew?: boolean;
        servings?: number;
        protein?: number;
        sectionName?: string;
        optionGroups?: any[];
        variantGroups?: any[];
        extras?: {
            name: string;
            price: string;
        }[];
        extrasMin?: number;
        extrasIncluded?: number;
        extrasMax?: number;
        extrasTitleSingular?: string;
        extrasTitlePlural?: string;
    };
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular?: string;
    newsTitleSingular?: string;
    onOpenModal: (data: any) => void;
}

export default function CarouselProductCard({
    item,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    newsTitleSingular,
    onOpenModal
}: CarouselProductCardProps) {
    const cart = useStore($cart);

    const imageUrl = item.imageUrl || getImageUrl(item.imgSrc, 300);
    const highResImageUrl = getImageUrl(item.imgSrc, 1080, { quality: 100 });

    const simpleUniqueId = generateUniqueId(item.slug || item.name, []);
    const quantityInCart = cart.find(i => i.uniqueId === simpleUniqueId)?.quantity || 0;

    const basePrice = parseFloat(item.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

    const hasExtras = (item.variantGroups && item.variantGroups.length > 0) ||
        (item.optionGroups && item.optionGroups.length > 0) ||
        (item.extras && item.extras.length > 0);

    const handleDetailClick = () => {
        onOpenModal({
            name: item.name,
            slug: item.slug,
            price: item.price,
            price2: item.price2,
            price3: item.price3,
            description: item.description,
            image: highResImageUrl,
            placeholderImage: imageUrl,
            currency: currencySymbol,
            bestSeller: item.bestSeller,
            isNew: item.isNew,
            protein: item.protein,
            section: item.sectionName,
            optionGroups: item.optionGroups,
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

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.price2 || item.price3 || hasExtras) {
            handleDetailClick();
            return;
        }
        addToCart({
            productSlug: item.slug || item.name,
            name: item.name,
            unitPrice: basePrice,
            extras: [],
            sectionName: item.sectionName || 'Menu',
            imageUrl
        });
    };

    const handleIncrement = () => {
        if (item.price2 || item.price3 || hasExtras) {
            handleDetailClick();
        } else {
            incrementQuantity(simpleUniqueId);
        }
    };

    const handleDecrement = () => {
        decrementQuantity(simpleUniqueId);
    };

    return (
        <div className="flex-shrink-0 w-40 relative group">
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleDetailClick}
                className="bg-[var(--color-bestsellers-card-bg)] rounded-lg shadow-md p-2 cursor-pointer h-[240px] flex flex-col relative"
            >
                <h3 className="font-bold text-[var(--color-bestsellers-text-name)] line-clamp-2 min-h-[2.5rem] mb-2 text-sm flex items-center gap-1">
                    {item.name}
                    {item.servings && item.servings >= 2 && (
                        <ServingsIcon servings={item.servings} size="sm" className="opacity-70" />
                    )}
                </h3>

                <div className="relative">
                    <img
                        alt={item.alt || item.name}
                        className="w-full h-32 object-cover rounded-md"
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
                </div>

                {item.isNew && (
                    <span
                        className="absolute -top-3 -right-3 bg-[var(--color-new-badge-bg)] text-[var(--color-new-badge-text)] text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm z-10"
                        style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)' }}
                    >
                        {newsTitleSingular || 'Nuevo'}
                    </span>
                )}

                <div className="mt-auto flex justify-end items-center">
                    <p className="text-[var(--color-bestsellers-text-price)] text-right font-bold text-sm">
                        {currencySymbol}{item.price}
                        {item.price2 && (
                            <>
                                <span className="mx-1 opacity-50">{priceDivider}</span>
                                {currencySymbol}{item.price2}
                            </>
                        )}
                    </p>
                </div>

                {/* Order Controls Overlay */}
                <div
                    className="absolute bottom-2 left-2 z-20"
                    onClick={(e) => e.stopPropagation()}
                >
                    {quantityInCart > 0 && !(item.price2 || item.price3 || hasExtras) ? (
                        <div className="scale-75 origin-bottom-left">
                            <QuantityControl
                                quantity={quantityInCart}
                                onIncrement={handleIncrement}
                                onDecrement={handleDecrement}
                                size="sm"
                            />
                        </div>
                    ) : (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleQuickAdd}
                            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[var(--color-navbar-select-border)] text-[var(--color-product-add-btn-text)] bg-[var(--color-product-add-btn-bg)] hover:bg-[var(--color-bestsellers-card-bg)] hover:text-[var(--color-bg-main)] transition-colors duration-200 font-bold text-lg shadow-sm"
                        >
                            +
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
