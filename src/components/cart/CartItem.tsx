/**
 * CartItem - Individual item display in the cart
 */
import React from 'react';
import { motion } from 'framer-motion';
import type { CartItem as CartItemType } from '../../stores/cartStore';
import { calculateItemSubtotal, incrementQuantity, decrementQuantity, removeFromCart } from '../../stores/cartStore';
import QuantityControl from './QuantityControl';
import { formatProductTitle } from '../../lib/stringUtils';

interface CartItemProps {
    item: CartItemType;
    currency: string;
}

export default function CartItem({ item, currency }: CartItemProps) {
    const subtotal = calculateItemSubtotal(item);
    const formattedName = formatProductTitle(item.name);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex gap-3 p-3 bg-[var(--color-menu-item-bg)] rounded-xl"
        >
            {/* Image */}
            {item.imageUrl && (
                <img
                    src={item.imageUrl}
                    alt={formattedName}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h4
                        className="font-bold text-[var(--color-text-title)] truncate"
                        style={{
                            fontFamily: 'var(--font-product-title-family, inherit)',
                            fontStyle: 'var(--font-product-title-style, normal)',
                            fontWeight: 'var(--font-product-title-weight, bold)',
                            fontSize: 'var(--font-product-title-size, 1rem)',
                            lineHeight: 'var(--font-product-title-line-height, 1.2)',
                        }}
                    >
                        {formattedName}
                    </h4>
                    <button
                        onClick={() => removeFromCart(item.uniqueId)}
                        className="text-white hover:text-white p-1 -m-1"
                        aria-label="Eliminar del carrito"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Extras */}
                {item.extras.length > 0 && (
                    <ul
                        className="text-xs text-[var(--color-text-subtitle)] opacity-70 mt-1"
                        style={{
                            fontFamily: 'var(--font-product-description-family, inherit)',
                            fontStyle: 'var(--font-product-description-style, normal)',
                            fontWeight: 'var(--font-product-description-weight, normal)',
                            fontSize: 'var(--font-product-description-size, 0.75rem)',
                            lineHeight: 'var(--font-product-description-line-height, 1.5)',
                        }}
                    >
                        {item.extras.map((extra, idx) => (
                            <li key={idx}>
                                {extra.quantity && extra.quantity > 1 ? `${extra.quantity}x ` : '+ '}{extra.name}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Notes */}
                {item.notes && item.notes.trim() && (
                    <div 
                        className="text-xs mt-1.5 flex gap-1.5 items-center opacity-80"
                        style={{
                            color: 'var(--color-text-subtitle, #ffffff)',
                            fontFamily: 'var(--font-product-description-family, inherit)'
                        }}
                    >
                        <span className="shrink-0 font-semibold opacity-70">Obs:</span>
                        <span className="truncate">{item.notes.trim()}</span>
                    </div>
                )}

                {/* Price & Quantity */}
                <div className="flex justify-between items-center mt-2">
                    <QuantityControl
                        quantity={item.quantity}
                        onIncrement={() => incrementQuantity(item.uniqueId)}
                        onDecrement={() => decrementQuantity(item.uniqueId)}
                        size="sm"
                        showZero
                    />
                    <span
                        className="font-bold text-[var(--color-cart-item-price)]"
                        style={{
                            fontFamily: 'var(--font-product-price-family, inherit)',
                            fontStyle: 'var(--font-product-price-style, normal)',
                            fontWeight: 'var(--font-product-price-weight, bold)',
                            fontSize: 'var(--font-product-price-size, 1rem)',
                            lineHeight: 'var(--font-product-price-line-height, 1.5)',
                        }}
                    >
                        {currency}{subtotal.toFixed(2)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
