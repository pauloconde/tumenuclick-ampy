/**
 * OrderFAB - Floating Action Button to enable order mode on mobile
 */
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartItemCount } from '../../stores/cartStore';
import MobileCartBar from './MobileCartBar';
import MobileCartSheet from './MobileCartSheet';

import { type FulfillmentConfig } from './FulfillmentModal';

interface OrderFABProps {
    currency: string;
    phone: string;
    restaurantName?: string;
    whatsappButtonText?: string;
    whatsappFooterText?: string;
    logoUrl?: string;
    fulfillmentConfig: FulfillmentConfig;
}

export default function OrderFAB({ currency, phone, restaurantName, whatsappButtonText, whatsappFooterText, logoUrl, fulfillmentConfig }: OrderFABProps) {
    const items = useStore($cart);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [isMounted, setIsMounted] = useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <>
            {/* FAB Container - Hidden when cart has items (MobileCartBar shows instead) */}


            {/* Mobile Cart Bar - Visible when cart has items */}
            {items.length > 0 && (
                <MobileCartBar
                    currency={currency}
                    onViewOrder={() => setIsSheetOpen(true)}
                />
            )}

            {/* Mobile Cart Sheet */}
            <MobileCartSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                currency={currency}
                phone={phone}
                restaurantName={restaurantName}
                whatsappButtonText={whatsappButtonText}
                whatsappFooterText={whatsappFooterText}
                logoUrl={logoUrl}
                fulfillmentConfig={fulfillmentConfig}
            />
        </>
    );
}
