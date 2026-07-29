/**
 * MobileCartSheet - Bottom sheet modal for viewing and managing cart on mobile
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $cart, $cartTotal, $isCartEmpty, clearCart } from '../../stores/cartStore';
import { sendToWhatsApp } from '../../utils/whatsappFormatter';
import CartItemComponent from './CartItem';

// ... imports
import FulfillmentModal, { type FulfillmentConfig } from './FulfillmentModal';

interface MobileCartSheetProps {
    isOpen: boolean;
    onClose: () => void;
    currency: string;
    phone: string;
    restaurantName?: string;
    whatsappButtonText?: string;
    whatsappFooterText?: string;
    logoUrl?: string;
    fulfillmentConfig: FulfillmentConfig;
}

import OrderConfirmationModal from './OrderConfirmationModal';

import { disableOrderMode } from '../../stores/orderModeStore';

declare global {
    interface Window {
        trackOrderEvent: (eventName: string, items: any[], value?: number, transactionId?: string) => void;
    }
}

export default function MobileCartSheet({
    isOpen,
    onClose,
    currency,
    phone,
    restaurantName,
    whatsappButtonText = 'Enviar por WhatsApp',
    whatsappFooterText,
    logoUrl,
    fulfillmentConfig
}: MobileCartSheetProps) {
    const items = useStore($cart);
    const total = useStore($cartTotal);
    const isEmpty = useStore($isCartEmpty);

    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const [showFulfillment, setShowFulfillment] = React.useState(false);

    const handleSendToWhatsApp = () => {
        setShowFulfillment(true);
    };

    const handleFulfillmentConfirm = (method: 'delivery' | 'pickup' | 'dine-in', tableNumber?: string) => {
        setShowFulfillment(false);

        // GA4: purchase (Optimistic)
        if (typeof window !== 'undefined' && window.trackOrderEvent) {
            const transactionId = `ORD-${Date.now()}`;
            window.trackOrderEvent('purchase', items, total, transactionId);
        }

        sendToWhatsApp(items, total, {
            currency,
            phone,
            restaurantName,
            footerText: whatsappFooterText,
            fulfillmentMethod: method,
            tableNumber: tableNumber
        });

        // Small delay to ensure WhatsApp opens first
        setTimeout(() => setShowConfirmation(true), 500);
    };

    const handleConfirmOrder = () => {
        clearCart();
        disableOrderMode();
        setShowConfirmation(false);
        onClose(); // Also close the sheet
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[70] bg-[var(--color-modal-overlay)] backdrop-blur-sm lg:hidden"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="
              fixed bottom-0 left-0 right-0 z-[80]
              h-[80vh]
              bg-[var(--color-cart-bg)]
              rounded-t-3xl
              shadow-[0_-10px_40px_rgba(0,0,0,0.4)]
              flex flex-col
              lg:hidden
            "
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <h2 className="text-3xl! font-bold text-[var(--color-cart-header-text)]" style={{ fontFamily: 'var(--font-section-title-family, Arial, sans-serif)' }}>
                                Tu Pedido
                            </h2>
                            <div className="flex gap-2">
                                {!isEmpty && (
                                    <button
                                        onClick={clearCart}
                                        className="flex items-center gap-1.5 bg-[var(--color-cart-empty-btn-bg)] text-[var(--color-cart-empty-btn-text)] text-sm font-bold px-3 py-1.5 rounded-lg transition-colors hover:brightness-110 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Vaciar
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 -m-2 text-[var(--color-cart-header-text)] hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {items.map(item => (
                                    <CartItemComponent
                                        key={item.uniqueId}
                                        item={item}
                                        currency={currency}
                                    />
                                ))}
                            </AnimatePresence>

                            {isEmpty && (
                                <div className="flex flex-col items-center justify-center h-full py-16">
                                    <svg className="w-24 h-24 mb-6 text-[var(--color-cart-empty-text)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="text-lg text-[var(--color-cart-empty-text)]">Tu carrito está vacío</p>
                                    <p className="text-sm text-[var(--color-cart-empty-text)] mt-2">Agrega productos para comenzar</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!isEmpty && (
                            <div className="p-4 border-t border-white/10 space-y-3">
                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <span className="text-lg text-[var(--color-cart-total-price)]">Total</span>
                                    <span className="text-2xl font-bold text-[var(--color-cart-total-price)]">
                                        {currency}{total.toFixed(2)}
                                    </span>
                                </div>

                                {/* WhatsApp Button */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSendToWhatsApp}
                                    className="
                    w-full py-4
                    bg-[var(--color-cart-whatsapp-bg)]
                    text-[var(--color-cart-whatsapp-text)] font-bold
                    rounded-xl
                    flex items-center justify-center gap-3
                    shadow-lg
                  "
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    {whatsappButtonText}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    <FulfillmentModal
                        isOpen={showFulfillment}
                        onClose={() => setShowFulfillment(false)}
                        onConfirm={handleFulfillmentConfirm}
                        config={fulfillmentConfig}
                        logoUrl={logoUrl}
                    />

                    <OrderConfirmationModal
                        isOpen={showConfirmation}
                        onConfirm={handleConfirmOrder}
                        onCancel={() => setShowConfirmation(false)}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
