import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import {
    addToCart,
    incrementQuantity,
    decrementQuantity,
    generateUniqueId,
    getTotalQuantityBySlug,
    $cart
} from '../../../stores/cartStore';
import QuantityControl from '../../cart/QuantityControl';
import { getImageUrl } from '../../../lib/imageUrl';

interface BestSellerCardProps {
    item: {
        name: string;
        slug?: string;
        price: string;
        price2?: string;
        price3?: string;
        description: string;
        imgSrc: any;
        alt?: string;
        bestSeller?: boolean;
        // Legacy extras removed
        sectionName?: string;
    };
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    // Callbacks/Context
    onOpenModal: (data: any) => void;
}

export default function BestSellerCardReact({
    item,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    onOpenModal
}: BestSellerCardProps) {
    const cart = useStore($cart);

    // Get image URL
    const imageUrl = getImageUrl(item.imgSrc, 300);

    // Check quantity in cart
    const simpleUniqueId = generateUniqueId(item.slug || item.name, []);
    const quantityInCart = cart.find(i => i.uniqueId === simpleUniqueId)?.quantity || 0;

    // Parse base price
    const basePrice = parseFloat(item.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

    // Check for extras (legacy removed — no complex extras in this card)
    const hasExtras = false;

    // Open detail modal
    const handleDetailClick = () => {
        onOpenModal({
            name: item.name,
            slug: item.slug,
            price: item.price,
            price2: item.price2,
            price3: item.price3,
            description: item.description,
            image: imageUrl,
            currency: currencySymbol,
            bestSeller: item.bestSeller,
            section: item.sectionName,
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
            sectionName: 'Best Sellers',
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
                className="bg-[var(--color-bestsellers-card-bg)] rounded-lg shadow-md p-2 cursor-pointer h-[240px] flex flex-col relative overflow-hidden"
                onClick={handleDetailClick}
            >
                <h3 className="font-bold text-[var(--color-bestsellers-text-name)] line-clamp-2 min-h-[2.5rem] mb-2 text-sm">
                    {item.name}
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
                            backgroundImage: 'var(--product-bg-image, none)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </div>

                <div className="mt-auto flex justify-end items-center">
                    <p className="text-[var(--color-bestsellers-text-price)] text-right font-bold text-sm">
                        {currencySymbol}{item.price}
                        {item.price2 && (
                            <>
                                <span className="mx-1 opacity-50">{priceDivider}</span>
                                {currencySymbol}{item.price2}
                            </>
                        )}
                        {item.price3 && (
                            <>
                                <span className="mx-1 opacity-50">{priceDivider}</span>
                                {currencySymbol}{item.price3}
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
                            className="
                                w-8 h-8
                                flex items-center justify-center
                                rounded-full
                                border-2 border-[var(--color-navbar-select-border)]
                                text-[var(--color-bestsellers-card-bg)]
                                bg-[var(--color-bestsellers-text-title)]
                                hover:bg-[var(--color-navbar-select-border)]
                                hover:text-[var(--color-bg-main)]
                                transition-colors duration-200
                                font-bold text-lg
                                shadow-sm
                            "
                            title="Agregar al carrito"
                        >
                            +
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
