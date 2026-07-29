/**
 * CartWrapper - Client-side wrapper that provides cart UI components
 * This is the main React Island for cart functionality
 */
import React, { useState, useCallback, useEffect } from 'react';
import OrderFAB from './OrderFAB';
import DesktopCartSidebar from './DesktopCartSidebar';
import ProductOrderModal from '../menu/ProductOrderModal';
import AnalyticsListener from '../analytics/AnalyticsListener';

interface CartWrapperProps {
    currency: string;
    phone: string;
    restaurantName?: string;
    whatsappButtonText?: string;
    whatsappFooterText?: string;
    bestSellerLabel?: string;
    newLabel?: string;
    logoUrl?: string;
    fulfillmentConfig: {
        hasDelivery: boolean;
        hasPickup: boolean;
        hasDineIn: boolean;
        tableCount: number;
    };
}

// Custom event for opening product modal (works across React islands)
const OPEN_MODAL_EVENT = 'openProductModal';

export function openProductModal(data: any) {
    // Dispatch a custom event that CartWrapper listens to
    window.dispatchEvent(new CustomEvent(OPEN_MODAL_EVENT, { detail: data }));
}

export default function CartWrapper({ currency, phone, restaurantName, whatsappButtonText, whatsappFooterText, bestSellerLabel, newLabel, logoUrl, fulfillmentConfig }: CartWrapperProps) {
    const [modalProduct, setModalProduct] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Listen for custom event to open modal
    useEffect(() => {
        const handleOpenModal = (event: Event) => {
            const customEvent = event as CustomEvent;
            setModalProduct(customEvent.detail);
            setIsModalOpen(true);
        };

        window.addEventListener(OPEN_MODAL_EVENT, handleOpenModal);

        return () => {
            window.removeEventListener(OPEN_MODAL_EVENT, handleOpenModal);
        };
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        // Small delay before clearing product data for exit animation
        setTimeout(() => setModalProduct(null), 300);
    }, []);

    return (
        <>
            <AnalyticsListener />

            {/* Mobile Components */}
            <OrderFAB
                currency={currency}
                phone={phone}
                restaurantName={restaurantName}
                whatsappButtonText={whatsappButtonText}
                whatsappFooterText={whatsappFooterText}
                logoUrl={logoUrl}
                fulfillmentConfig={fulfillmentConfig}
            />

            {/* Desktop Components */}
            <DesktopCartSidebar
                currency={currency}
                phone={phone}
                restaurantName={restaurantName}
                whatsappButtonText={whatsappButtonText}
                whatsappFooterText={whatsappFooterText}
                logoUrl={logoUrl}
                fulfillmentConfig={fulfillmentConfig}
            />

            {/* Product Modal */}
            <ProductOrderModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                product={modalProduct}
                currency={currency}
                bestSellerLabel={bestSellerLabel}
                newLabel={newLabel}
            />
        </>
    );
}
