import { useMemo } from 'react';
import BestSellerCardOrder from './cards/BestSellerCardOrder';
import { openProductModal } from '../cart/CartWrapper';

interface BestSellersSectionProps {
    menuData: any;
}

export default function BestSellersSectionOrder({ menuData }: BestSellersSectionProps) {
    if (!menuData) return null;

    // La lista de bestsellers es una lista curada y ordenada definida directamente en el menú
    const bestSellers = useMemo(() => {
        return (menuData.bestSellersItems || []).map((item: any) => ({
            ...item,
            sectionExtras: {},
        }));
    }, [menuData]);

    if (bestSellers.length === 0) return null;

    return (
        <section className="bg-[var(--color-bestsellers-bg)] w-full pt-10 pb-8 px-4 md:px-6 lg:px-8 shadow-md">
            <div className="mb-3">
                <h2
                    className="text-xl font-bold text-[var(--color-bestsellers-text-title)]"
                    style={{
                        fontFamily: 'var(--font-section-title-family, var(--font-belanosima))',
                        fontStyle: 'var(--font-section-title-style, normal)',
                        fontWeight: 'var(--font-section-title-weight, 700)',
                        fontSize: 'var(--font-section-title-size, 1.25rem)'
                    }}
                >
                    {menuData.bestSellersTitlePlural || "Tus favoritos..."}
                </h2>
            </div>
            <div className="flex overflow-x-auto pt-5 pb-4 px-1 space-x-4 scrollbar-bestsellers">
                {bestSellers.map((item: any) => (
                    <BestSellerCardOrder
                        key={item.slug || item.name}
                        item={item}
                        currencySymbol={menuData.currencySymbol}
                        priceDivider={menuData.priceDivider}
                        bestSellersTitleSingular={menuData.bestSellersTitleSingular}
                        newsTitleSingular={menuData.newsTitleSingular}
                        onOpenModal={(data) => {
                            // Merge the item data with section extras
                            openProductModal({
                                ...data,
                                sectionExtras: item.sectionExtras,
                                sectionName: item.sectionName
                            });
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
