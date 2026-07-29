/**
 * MobileCartBar - Sticky bottom bar showing cart summary on mobile
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $cart, $cartTotal, $cartItemCount } from '../../stores/cartStore';

interface MobileCartBarProps {
    currency: string;
    onViewOrder: () => void;
}

export default function MobileCartBar({ currency, onViewOrder }: MobileCartBarProps) {
    const items = useStore($cart);
    const total = useStore($cartTotal);
    const itemCount = useStore($cartItemCount);

    // Toggle body class when cart bar is visible to adjust other fixed elements (WhatsApp button)
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        if (items.length > 0) {
            document.body.classList.add('has-cart-bar');
        } else {
            document.body.classList.remove('has-cart-bar');
        }
        return () => document.body.classList.remove('has-cart-bar');
    }, [items.length]);

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {items.length > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                >
                    <div className="
            bg-[var(--color-mobile-cart-bar-bg)]

            px-4 py-3
            flex items-center justify-between
            gap-4
            shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
          ">
                        {/* Cart Info */}
                        <div className="flex items-center gap-3">
                            {/* Bag Icon */}
                            <div className="relative">
                                <svg
                                    className="w-6 h-6 text-[var(--color-mobile-cart-bar-total)]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                                {/* Badge */}
                                <motion.span
                                    key={itemCount}
                                    initial={{ scale: 1.3 }}
                                    animate={{ scale: 1 }}
                                    className="
                    absolute -top-4 -left-2
                    bg-[var(--color-product-badge-bg)]
                    text-[var(--color-product-badge-text)]
                    text-xs font-bold
                    w-5 h-5
                    flex items-center justify-center
                    rounded-full
                  "
                                >
                                    {itemCount}
                                </motion.span>
                            </div>

                            {/* Total */}
                            <div>
                                <p className="text-sm text-[var(--color-mobile-cart-bar-item-count)]">
                                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                </p>
                                <p className="font-bold text-[var(--color-mobile-cart-bar-total)]">
                                    {currency}{total.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* View Order Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onViewOrder}
                            className="
                px-6 py-2.5
                bg-[var(--color-mobile-cart-bar-btn-bg)]
                text-[var(--color-mobile-cart-bar-btn-text)]
                font-bold
                rounded-xl
                shadow-lg
              "
                        >
                            Ver Pedido
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
