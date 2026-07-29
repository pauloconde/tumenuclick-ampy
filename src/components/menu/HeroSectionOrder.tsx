import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import {
    addToCart,
    incrementQuantity,
    decrementQuantity,
    generateUniqueId,
    getTotalQuantityBySlug,
    $cart
} from '../../stores/cartStore';
import QuantityControl from '../cart/QuantityControl';
import { getImageUrl } from '../../lib/imageUrl';
import { openProductModal } from '../cart/CartWrapper';

interface HeroSectionProps {
    seasonalSpecials: any;
    currencySymbol: string;
    priceDivider: string;
}

export default function HeroSectionOrder({
    seasonalSpecials,
    currencySymbol,
    priceDivider
}: HeroSectionProps) {
    const cart = useStore($cart);

    // Check if seasonalSpecials exists and has items
    if (
        !seasonalSpecials ||
        !seasonalSpecials.items ||
        seasonalSpecials.items.length === 0
    ) {
        return null;
    }

    const item = seasonalSpecials.items[0];
    const imageUrl = getImageUrl(item.imgSrc, 800);
    const highResImageUrl = getImageUrl(item.imgSrc, 1080, { quality: 100 });

    // Check quantity in cart
    const simpleUniqueId = generateUniqueId(item.slug || item.name, []);
    const quantityInCart = cart.find(i => i.uniqueId === simpleUniqueId)?.quantity || 0;

    // Parse base price
    const basePrice = parseFloat(item.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

    // Determine if we need modal (multiple prices or extras)
    // Seasonal items usually don't have sectionExtras, but might have price2/price3, or item-specific extras/options
    const hasExtras = (item.extras && item.extras.length > 0) || (item.optionGroups && item.optionGroups.length > 0);
    const requiresModal = item.price2 || item.price3 || hasExtras;

    const handleDetailClick = () => {
        openProductModal({
            name: item.name,
            slug: item.slug,
            price: item.price,
            price2: item.price2,
            price3: item.price3,
            description: item.description,
            image: getImageUrl(item.imgSrc, 1080, { quality: 100 }),
            placeholderImage: imageUrl,
            currency: currencySymbol,
            protein: item.protein,
            section: seasonalSpecials.title,
            availability: item.availability,
            extras: item.extras,
            extrasMin: item.extrasMin,
            extrasIncluded: item.extrasIncluded,
            extrasMax: item.extrasMax,
            extrasTitleSingular: item.extrasTitleSingular,
            extrasTitlePlural: item.extrasTitlePlural,
            optionGroups: item.optionGroups
        });
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (requiresModal) {
            handleDetailClick();
            return;
        }

        addToCart({
            productSlug: item.slug || item.name,
            name: item.name,
            unitPrice: basePrice,
            extras: [],
            sectionName: seasonalSpecials.title || 'Especiales',
            imageUrl
        });
    };

    const handleIncrement = () => {
        if (requiresModal) {
            handleDetailClick();
        } else {
            incrementQuantity(simpleUniqueId);
        }
    };

    const handleDecrement = () => {
        decrementQuantity(simpleUniqueId);
    };

    return (
        <section className="w-full bg-seasonal-bg px-4 md:px-6 lg:px-8 pt-8 pb-2">
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-seasonal-card-bg rounded-2xl shadow-xl overflow-hidden md:flex md:flex-row-reverse cursor-pointer relative group"
                onClick={handleDetailClick}
            >
                <div className="md:w-1/2 h-64 md:h-auto relative">
                    <img
                        src={imageUrl}
                        alt={item.alt || item.name}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                        }}
                    />
                </div>
                <div className="p-6 md:p-10 md:w-1/2 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-white/20 text-white rounded-full w-fit">
                        {seasonalSpecials.title || "ESPECIAL DE TEMPORADA"}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-seasonal-text-name">
                        {item.name}
                    </h2>
                    <span className="inline-block px-3 py-1 mb-4 text-xs tracking-wider uppercase bg-white/20 text-white rounded-full w-fit">
                        {item.subtitle}
                    </span>
                    <p className="text-md mb-6 text-seasonal-subtitle opacity-90">
                        {item.description}
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-seasonal-text-price">
                            {currencySymbol}{item.price}
                        </span>
                        {item.price2 && (
                            <span className="text-xl text-seasonal-text-price opacity-80">
                                {" "}
                                {priceDivider} {currencySymbol}
                                {item.price2}
                            </span>
                        )}
                    </div>
                    {item.availability && (
                        <p className="mt-1 mb-4 text-sm text-seasonal-subtitle font-semibold italic">
                            {item.availability}
                        </p>
                    )}

                    {/* Order Controls */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {quantityInCart > 0 && !requiresModal ? (
                                <motion.div
                                    key="quantity-controls"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex justify-start bg-white backdrop-blur-md rounded-full px-1 py-1 shadow-sm inline-flex"
                                >
                                    <QuantityControl
                                        quantity={quantityInCart}
                                        onIncrement={handleIncrement}
                                        onDecrement={handleDecrement}
                                        size="md"
                                        numberClassName="!text-[var(--color-navbar-select-border)]"
                                    />
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="add-button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ filter: 'brightness(1.1)' }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={handleQuickAdd}
                                    className="
                                        px-6 py-3
                                        bg-[var(--color-navbar-select-border)]
                                        text-[var(--color-bg-main)]
                                        font-bold
                                        rounded-xl
                                        shadow-md
                                        border border-white
                                        flex items-center gap-2
                                    "
                                >
                                    <span>Agregar al Pedido</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
