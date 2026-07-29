/**
 * ProductOrderModal - Transactional modal for product details and extras selection (Order Mode)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart } from '../../stores/cartStore';
import type { CartExtra } from '../../stores/cartStore';
import QuantityControl from '../cart/QuantityControl';
import { formatProductTitle } from '../../lib/stringUtils';
import { ServingsBadge } from './icons/ServingsIcon';
import { getImageUrl } from '../../lib/imageUrl';
interface Extra {
    name: string;
    price: string;
    isRecommended?: boolean;
}

interface OptionItem {
    name: string;
    price: string;
    isDefault?: boolean;
}

interface OptionGroup {
    title: string;
    showTitle?: boolean;
    options: OptionItem[];
}

interface VariantItem {
    name: string;
    price: string; // Substitutes base price
    image?: any; // Optional variant image (can be string or Sanity object)
    isDefault?: boolean;
}

interface VariantGroup {
    title: string;
    showTitle?: boolean;
    variants: VariantItem[];
}

interface SectionExtras {
    extraGroupsRefs?: ExtraGroupRef[];
}

interface ExtraGroupRef {
    titleSingular?: string;
    titlePlural?: string;
    extras: Extra[];
    min?: number;
    included?: number;
    max?: number;
    allowQuantity?: boolean;
}

interface ProductData {
    name: string;
    slug?: string;
    price: string;
    price2?: string;
    description: string;
    image: string;
    gallery?: any[]; // Additional images (can be strings or Sanity objects)
    placeholderImage?: string;
    currency: string;
    bestSeller?: boolean;
    isNew?: boolean;
    servings?: number;
    protein?: number;
    section: string;
    sectionExtras?: SectionExtras;
    optionGroups?: OptionGroup[];
    optionGroupsRefs?: OptionGroup[];
    variantGroups?: VariantGroup[];
    extraGroupsRefs?: ExtraGroupRef[];
    extras?: Extra[];
    extrasTitleSingular?: string;
    extrasTitlePlural?: string;
    extrasMin?: number;
    extrasIncluded?: number;
    extrasMax?: number;
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductData | null;
    currency: string;
    bestSellerLabel?: string;
    newLabel?: string;
}

export function processGroupExtras(
    selectedExtras: { name: string; price: number; quantity: number }[],
    includedCount: number
): { name: string; price: number }[] {
    const flatList: { name: string; price: number }[] = [];
    selectedExtras.forEach(item => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
            flatList.push({ name: item.name, price: item.price });
        }
    });

    // Sort by price ascending so the cheapest ones are free
    flatList.sort((a, b) => a.price - b.price);

    return flatList.map((item, idx) => {
        if (idx < includedCount) {
            return {
                name: item.price > 0 ? `${item.name} (Incluido)` : item.name,
                price: 0
            };
        }
        return item;
    });
}

export function numberToWordsSpanish(n: number, isFeminine: boolean): string {
    if (n === 1) return isFeminine ? 'una' : 'un';
    const words = ['cero', '', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
    return words[n] || n.toString();
}

export default function ProductOrderModal({
    isOpen,
    onClose,
    product,
    currency,
    bestSellerLabel = 'Favorito',
    newLabel = 'Nuevo'
}: ProductModalProps) {
    // State for product-specific selected extras (Grouped by Group ID)
    // Legacy product.extras mapped to 'main' group
    const [selectedExtrasByGroup, setSelectedExtrasByGroup] = useState<Record<string, CartExtra[]>>({});

    const [selectedOptions, setSelectedOptions] = useState<Record<string, CartExtra>>({});

    // NEW: Selected Variants (Group Title -> VariantItem)
    const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantItem>>({});

    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const checkScroll = useCallback(() => {
        if (contentRef.current) {
            const target = contentRef.current;
            const isScrollable = target.scrollHeight > target.clientHeight + 10;
            const isBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 20;
            const indicator = document.getElementById(`scroll-indicator-${product?.slug || 'modal'}`);
            if (indicator) {
                indicator.style.opacity = (isScrollable && !isBottom) ? '1' : '0';
            }
        }
    }, [product]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(checkScroll, 100);
            window.addEventListener('resize', checkScroll);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [isOpen, checkScroll, selectedExtrasByGroup, selectedOptions, selectedVariants]);

    // Construct allImages array logic
    const allImages = React.useMemo(() => {
        if (!product) return [];
        const images: string[] = [];

        // 1. Main Image
        if (product.image) images.push(product.image);

        // 2. Gallery
        if (product.gallery && product.gallery.length > 0) {
            // Ensure we are pushing STRINGS (urls), not objects
            const galleryUrls = product.gallery.map(img => getImageUrl(img, 1080, { quality: 100 }));
            images.push(...galleryUrls);
        }

        // 3. Variant Images
        if (product.variantGroups) {
            product.variantGroups.forEach(group => {
                group.variants.forEach(variant => {
                    if (variant.image) {
                        const variantImgUrl = getImageUrl(variant.image, 1080, { quality: 100 });
                        if (variantImgUrl && !images.includes(variantImgUrl)) {
                            images.push(variantImgUrl);
                        }
                    }
                });
            });
        }

        return images;
    }, [product]);

    // Scroll to image helper
    const scrollToImage = (index: number) => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.offsetWidth;
            scrollContainerRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth'
            });
            setCurrentImageIndex(index);
        }
    };

    // Update index on scroll
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.offsetWidth;
            const scrollLeft = scrollContainerRef.current.scrollLeft;
            const newIndex = Math.round(scrollLeft / width);
            setCurrentImageIndex(newIndex);
        }
    };

    // Normalize Extra Groups (Refs + Legacy Product Extras)
    const extraGroups = React.useMemo(() => {
        if (!product) return [];
        const groups = [];

        // 1. Grupos Reutilizables
        if (product.extraGroupsRefs) {
            product.extraGroupsRefs.forEach((g, i) => {
                groups.push({
                    id: `ref-${i}`,
                    title: g.titlePlural || g.titleSingular || 'Extras',
                    titleSingular: g.titleSingular,
                    titlePlural: g.titlePlural,
                    extras: g.extras,
                    min: g.min || 0,
                    max: g.max || 0,
                    included: g.included || 0,
                    allowQuantity: g.allowQuantity || false
                });
            });

        }

        // 1.5 Grupos Reutilizables (Sección)
        if (product.sectionExtras?.extraGroupsRefs) {
            product.sectionExtras.extraGroupsRefs.forEach((g, i) => {
                groups.push({
                    id: `section-ref-${i}`,
                    title: g.titlePlural || g.titleSingular || 'Extras (Sección)',
                    titleSingular: g.titleSingular,
                    titlePlural: g.titlePlural,
                    extras: g.extras,
                    min: g.min || 0,
                    max: g.max || 0,
                    included: g.included || 0,
                    allowQuantity: g.allowQuantity || false
                });
            });
        }

        // 2. Extras Directos del Producto (Legacy/Directo)
        if (product && product.extras && product.extras.length > 0) {
            groups.push({
                id: 'main',
                title: product.extrasTitlePlural || 'Extras',
                titleSingular: product.extrasTitleSingular,
                titlePlural: product.extrasTitlePlural, // Added mapping
                extras: product.extras,
                min: product.extrasMin || 0,
                max: product.extrasMax || 0,
                included: product.extrasIncluded || 0,
                allowQuantity: false
            });
        }
        return groups;
    }, [product]);

    // Initial State Setup
    useEffect(() => {
        if (isOpen && product) {
            setSelectedExtrasByGroup({}); // Reset product extras
            setQuantity(1);
            setNotes('');

            // Initialize default options
            const initialOptions: Record<string, CartExtra> = {};
            const initialVariants: Record<string, VariantItem> = {};

            const allGroups: OptionGroup[] = [];
            if (product.optionGroups) allGroups.push(...product.optionGroups);
            if (product.optionGroupsRefs) allGroups.push(...product.optionGroupsRefs);

            // Helper to generate unique key
            const getGroupKey = (index: number) => `group_${index}`;

            // Helper to set default option for a group
            const setDefaultOption = (key: string, options: OptionItem[]) => {
                if (!options || options.length === 0) return;
                // Find default or use first item
                let defaultOption = options.find(o => o.isDefault);
                if (!defaultOption && options.length > 0) {
                    defaultOption = options[0];
                }
                if (defaultOption) {
                    const price = parseFloat(defaultOption.price?.replace(/[^0-9.,-]/g, '').replace(',', '.') || '0');
                    initialOptions[key] = {
                        name: defaultOption.name,
                        price: price
                    };
                }
            };


            // Helper to set default variant for a group
            const setDefaultVariant = (groupTitle: string, variants: VariantItem[]) => {
                if (!variants || variants.length === 0) return;
                let defaultVariant = variants.find(v => v.isDefault);
                // IF no default is marked, we MUST select one because it substitutes price. 
                // Let's pick the first one.
                if (!defaultVariant && variants.length > 0) {
                    // Start with NO selection if no default? 
                    // Or force first? 
                    // Usually variants (like sizes) require a selection.
                    // Let's force the first one to avoid $0 price if base price is ignored.
                    defaultVariant = variants[0];
                }

                if (defaultVariant) {
                    initialVariants[groupTitle] = defaultVariant;
                }
            };

            // Process Options
            allGroups.forEach((group, idx) => {
                setDefaultOption(getGroupKey(idx), group.options);
            });


            // Process Variants
            if (product.variantGroups) {
                product.variantGroups.forEach(group => setDefaultVariant(group.title, group.variants));
            }

            setSelectedOptions(initialOptions);
            setSelectedVariants(initialVariants);

            // Initial Image Selection based on Default Variants or 0
            // Check if any default variant has an image
            let initialIndex = 0;
            const defaultVariantKey = Object.keys(initialVariants).find(key => initialVariants[key].image);
            if (defaultVariantKey) {
                const imgRaw = initialVariants[defaultVariantKey].image;
                const imgUrl = getImageUrl(imgRaw, 1080, { quality: 100 });
                const idx = allImages.indexOf(imgUrl);
                if (idx !== -1) initialIndex = idx;
            }
            // Delay scroll to ensure render
            setTimeout(() => scrollToImage(initialIndex), 100);
        }
    }, [isOpen, product?.slug]);

    // Calculate base price (Dynamic based on variants)
    const activeBasePrice = React.useMemo(() => {
        if (!product) return 0;

        let price = parseFloat(product.price?.toString().replace(/[^0-9.,]/g, '').replace(',', '.') || '0');

        // If there are variant groups, the LAST selected variant's price takes precedence?
        // Or do we only support ONE variant group effectively?
        // If multiple variant groups exist (e.g. Size + Type), do they add up or substitute?
        // Requirement: "el precio de la variante no se suma o resta... sino que lo SUSTITUYE".
        // If we have distinct variant groups (e.g. Size), usually only one defines the base price.
        // If we have multiple variant groups, it's ambiguous which one sets the price.
        // WE WILL ASSUME: The LAST defined variant group overrides the price. 
        // Or we sum them? No, "substitutes". 
        // For now, let's assume if any variant is selected, it OVERRIDES the product base price.
        // If multiple variants are selected (from different groups), we likely have a conflict.
        // Let's use the LAST non-empty variant price found.

        const variantKeys = Object.keys(selectedVariants);
        if (variantKeys.length > 0) {
            // Take the last one (arbitrary decision, but fits single-dimension variants like Size)
            const lastKey = variantKeys[variantKeys.length - 1];
            const variant = selectedVariants[lastKey];
            const variantPrice = parseFloat(variant.price?.toString().replace(/[^0-9.,]/g, '').replace(',', '.') || '0');
            if (variantPrice > 0) {
                price = variantPrice;
            }
        }

        return price;
    }, [product, selectedVariants]);


    // Calculate product extras total
    const productExtrasTotal = Object.entries(selectedExtrasByGroup).reduce((total, [groupId, extras]) => {
        const groupDef = extraGroups.find(g => g.id === groupId);
        const includedCount = groupDef?.included || 0;

        const processedExtras = processGroupExtras(
            extras.map(e => ({ name: e.name, price: e.price, quantity: e.quantity || 1 })),
            includedCount
        );

        const groupTotal = processedExtras.reduce((sum, e) => sum + e.price, 0);

        return total + groupTotal;
    }, 0);

    const optionsTotal = Object.values(selectedOptions).reduce((sum, o) => sum + o.price, 0);
    const itemTotal = (activeBasePrice + productExtrasTotal + optionsTotal) * quantity;

    // Update Product Specific Extra Quantity (Grouped)
    const updateProductExtraQuantity = useCallback((groupId: string, extra: Extra, newQuantity: number, max: number) => {
        const price = parseFloat(extra.price?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0');

        setSelectedExtrasByGroup(prev => {
            const groupExtras = prev[groupId] || [];
            const existsIndex = groupExtras.findIndex(e => e.name === extra.name);

            // Compute total units in the group if we update this extra
            const groupTotalUnitsExceptCurrent = groupExtras.reduce((sum, e, idx) => {
                if (idx === existsIndex) return sum;
                return sum + (e.quantity || 1);
            }, 0);

            const potentialTotalUnits = groupTotalUnitsExceptCurrent + newQuantity;

            // If we exceed the maximum allowed total units for this group, block it
            if (max > 0 && potentialTotalUnits > max) {
                return prev;
            }

            let newGroupExtras;
            if (newQuantity <= 0) {
                newGroupExtras = groupExtras.filter(e => e.name !== extra.name);
            } else {
                if (existsIndex >= 0) {
                    newGroupExtras = [...groupExtras];
                    newGroupExtras[existsIndex] = {
                        ...newGroupExtras[existsIndex],
                        quantity: newQuantity
                    };
                } else {
                    newGroupExtras = [...groupExtras, { name: extra.name, price, quantity: newQuantity }];
                }
            }

            return { ...prev, [groupId]: newGroupExtras };
        });
    }, []);

    // Toggle Product Specific Extra (Grouped)
    const toggleProductExtra = useCallback((groupId: string, extra: Extra, max: number) => {
        setSelectedExtrasByGroup(prev => {
            const groupExtras = prev[groupId] || [];
            const exists = groupExtras.find(e => e.name === extra.name);
            const currentQty = exists ? (exists.quantity || 1) : 0;
            const newQty = currentQty > 0 ? 0 : 1;

            const price = parseFloat(extra.price?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0');
            const existsIndex = groupExtras.findIndex(e => e.name === extra.name);
            const groupTotalUnitsExceptCurrent = groupExtras.reduce((sum, e, idx) => {
                if (idx === existsIndex) return sum;
                return sum + (e.quantity || 1);
            }, 0);

            const potentialTotalUnits = groupTotalUnitsExceptCurrent + newQty;
            if (max > 0 && potentialTotalUnits > max) {
                return prev;
            }

            let newGroupExtras;
            if (newQty <= 0) {
                newGroupExtras = groupExtras.filter(e => e.name !== extra.name);
            } else {
                newGroupExtras = [...groupExtras];
                if (existsIndex >= 0) {
                    newGroupExtras[existsIndex] = { ...newGroupExtras[existsIndex], quantity: newQty };
                } else {
                    newGroupExtras.push({ name: extra.name, price, quantity: newQty });
                }
            }
            return { ...prev, [groupId]: newGroupExtras };
        });
    }, []);

    // Select option (Single per group)
    const selectOption = useCallback((key: string, option: OptionItem) => {
        const price = parseFloat(option.price?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0');
        setSelectedOptions(prev => ({
            ...prev,
            [key]: { name: option.name, price: price }
        }));
    }, []);

    // Select Variant
    const selectVariant = useCallback((groupTitle: string, variant: VariantItem) => {
        setSelectedVariants(prev => ({
            ...prev,
            [groupTitle]: variant
        }));

        // Scroll to variant image if exists
        if (variant.image) {
            const imgUrl = getImageUrl(variant.image, 1080, { quality: 100 });
            const idx = allImages.indexOf(imgUrl);
            if (idx !== -1) {
                scrollToImage(idx);
            }
        }
    }, [allImages]);

    const isProductExtraSelected = (groupId: string, name: string) => {
        return selectedExtrasByGroup[groupId]?.some(e => e.name === name);
    };

    const isOptionSelected = (key: string, optionName: string) => {
        return selectedOptions[key]?.name === optionName;
    };


    const isVariantSelected = (groupTitle: string, variantName: string) => {
        return selectedVariants[groupTitle]?.name === variantName;
    };

    const renderPriceDiff = (priceStr: string) => {
        if (!priceStr) return null;
        const price = parseFloat(priceStr?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0');
        if (price === 0) return null;
        const sign = price > 0 ? '+' : '-';
        return `${sign}${currency}${Math.abs(price).toFixed(2)}`;
    };

    // Helper for Variant Price (Absolute)
    const renderVariantPrice = (priceStr: string) => {
        return `${currency}${priceStr}`;
    };

    const handleAddToCart = () => {
        if (!product) return;

        // Validate min selection for product extras
        for (const group of extraGroups) {
            const count = selectedExtrasByGroup[group.id]?.reduce((sum, e) => sum + (e.quantity || 1), 0) || 0;
            if (group.min > 0 && count < group.min) {
                const nameToUse = group.min > 1 
                    ? (group.titlePlural || `${group.titleSingular || 'extra'}s`) 
                    : (group.titleSingular || 'extra');
                alert(`Debes seleccionar al menos ${group.min} ${nameToUse} en "${group.title}"`);
                return;
            }
        }

        // Validate Variants (Must have one selected per group?)
        // Since we force select default/first, this should be fine.

        // Combine extras and selected options
        const flatGroupedExtras: CartExtra[] = [];
        Object.entries(selectedExtrasByGroup).forEach(([groupId, extras]) => {
            const groupDef = extraGroups.find(g => g.id === groupId);
            const includedCount = groupDef?.included || 0;

            const processed = processGroupExtras(
                extras.map(e => ({ name: e.name, price: e.price, quantity: e.quantity || 1 })),
                includedCount
            );

            flatGroupedExtras.push(...processed);
        });

        // Add Variants to Name? 
        // If I change the base price, the user might want to know WHICH variant they picked in the cart.
        // Let's append the variant names to the extras list with price 0 (since price is in base), OR append to product name.
        // "Pizza (Grande)" is cleaner.

        // Variants are now treated as "Extras" for the cart (to show up in the list and be part of the unique ID)
        // But their price is 0 because the base price was already substituted.
        const variantExtras: CartExtra[] = Object.values(selectedVariants).map(v => ({
            name: v.name,
            price: 0
        }));

        const allExtras = [
            ...variantExtras,
            ...flatGroupedExtras,
            ...Object.values(selectedOptions)
        ];

        addToCart(
            {
                productSlug: product.slug || product.name,
                name: product.name,
                unitPrice: activeBasePrice, // Use the substituted price
                extras: allExtras,
                sectionName: product.section,
                imageUrl: product.image,
                notes: notes.trim()
            },
            quantity
        );

        onClose();
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!product) return null;

    const isMinMet = extraGroups.every(g => {
        const count = selectedExtrasByGroup[g.id]?.reduce((sum, e) => sum + (e.quantity || 1), 0) || 0;
        return g.min === 0 || count >= g.min;
    });

    const allOptionGroups: OptionGroup[] = [];
    if (product.optionGroups) allOptionGroups.push(...product.optionGroups);
    if (product.optionGroupsRefs) allOptionGroups.push(...product.optionGroupsRefs);

    const hasOptions = allOptionGroups.length > 0;
    const hasVariants = product.variantGroups && product.variantGroups.length > 0;


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
                        className="fixed inset-0 z-[60] bg-[var(--color-modal-overlay)] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={onClose}
                        className="
              fixed inset-0 z-[70]
              flex items-center justify-center
              p-4
            "
                    >
                        <div
                            className="
                relative w-full max-w-lg 
                bg-[var(--color-product-modal-bg)] 
                rounded-2xl shadow-2xl 
                flex flex-col 
                max-h-[90vh] 
                overflow-hidden
              "
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="
                  absolute top-4 right-4 z-10
                  w-10 h-10
                  bg-[var(--color-modal-close-bg)]
                  hover:bg-[var(--color-modal-close-hover)]
                  rounded-full
                  flex items-center justify-center
                  text-[var(--color-modal-close-icon)]
                  transition-colors
                "
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Image Carousel */}
                            <div className="w-full relative flex-shrink-0 group" style={{ backgroundColor: 'var(--color-product-bg, #111827)' }}>
                                {/* Scroll Container */}
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {allImages.length > 0 ? (
                                        allImages.map((imgSrc, idx) => (
                                            <div
                                                key={idx}
                                                className="w-full flex-shrink-0 snap-center relative"
                                                style={{
                                                    backgroundColor: 'var(--color-product-bg, transparent)',
                                                    backgroundImage: 'var(--product-bg-image, none)',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            >
                                                {/* Placeholder (Low Res) - absolute behind the main image */}
                                                {idx === 0 && product.placeholderImage && (
                                                    <img
                                                        src={product.placeholderImage}
                                                        alt=""
                                                        className="absolute inset-0 w-full h-full object-cover blur-sm scale-100"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <img
                                                    src={imgSrc}
                                                    alt={`${product.name} - ${idx + 1}`}
                                                    className="relative w-full h-full object-cover transition-opacity duration-300"
                                                    loading={idx === 0 ? "eager" : "lazy"}
                                                    onLoad={(e) => {
                                                        e.currentTarget.style.opacity = '1';
                                                    }}
                                                    style={{ opacity: 0 }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-modal-gradient-from)] to-transparent" />
                                            </div>
                                        ))
                                    ) : (
                                        // Fallback if no images (shouldn't happen with placeholder logic but safety first)
                                        <div className="w-full h-48 sm:h-64 relative bg-gray-800 flex items-center justify-center">
                                            <span className="text-gray-500">Sin imagen</span>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-modal-gradient-from)] to-transparent" />
                                        </div>
                                    )}
                                </div>

                                {/* Carousel Indicators */}


                                {/* Carousel Arrows (Desktop) */}
                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
                                                scrollToImage(newIndex);
                                            }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black/50"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;
                                                scrollToImage(newIndex);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black/50"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </>
                                )}

                                {/* Title overlay on image */}
                                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3
                                            className="text-2xl font-bold drop-shadow-neutral-700 drop-shadow-sm"
                                            style={{
                                                color: 'var(--color-modal-title-overlay, #ffffff)',
                                                fontFamily: 'var(--font-product-name-modal-family, inherit)',
                                                fontStyle: 'var(--font-product-name-modal-style, normal)',
                                                fontWeight: 'var(--font-product-name-modal-weight, bold)',
                                                fontSize: 'var(--font-product-name-modal-size, 1.5rem)',
                                                lineHeight: 'var(--font-product-name-modal-line-height, 1.2)'
                                            }}
                                        >
                                            {product.name}
                                        </h3>
                                        {product.bestSeller && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-modal-price-bg)] text-[var(--color-modal-price-text)] text-sm font-bold rounded-full">
                                                ⭐ {bestSellerLabel}
                                            </span>
                                        )}
                                        {product.isNew && (
                                            <span className="inline-flex items-center px-3 py-1 bg-[var(--color-new-badge-bg)] text-[var(--color-new-badge-text)] text-sm font-bold rounded-full uppercase tracking-wide">
                                                {newLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Carousel Indicators (Outside) */}
                            {allImages.length > 1 && (
                                <div className="flex justify-center gap-2 pt-4 pb-0 bg-[var(--color-product-modal-bg)]">
                                    {allImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                scrollToImage(idx);
                                            }}
                                            className={`
                                                w-2 h-2 rounded-full transition-all shadow-sm
                                                ${currentImageIndex === idx
                                                    ? 'w-6'
                                                    : 'opacity-50 hover:opacity-100'
                                                }
                                            `}
                                            style={{ backgroundColor: 'var(--color-product-carousel-dot, var(--color-product-modal-text))' }}
                                            aria-label={`Ver imagen ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div
                                ref={contentRef}
                                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-[var(--color-product-modal-text)] relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.3)_transparent]"
                                onScroll={checkScroll}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Price */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1.5 bg-[var(--color-modal-price-bg)] text-[var(--color-modal-price-text)] text-sm font-bold rounded-full">
                                            {currency}{activeBasePrice.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Servings badge */}
                                    {product.servings && product.servings >= 2 && (
                                        <div>
                                            <ServingsBadge servings={product.servings} />
                                        </div>
                                    )}

                                    {/* Protein badge */}
                                    {product.protein && product.protein > 0 && (
                                        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-sm font-semibold rounded-full border border-emerald-500/20 flex items-center gap-1">
                                            💪 Aporta {product.protein}g de proteína
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p
                                    className="leading-relaxed whitespace-pre-line opacity-90"
                                    style={{
                                        fontFamily: 'var(--font-product-description-family, inherit)',
                                        fontStyle: 'var(--font-product-description-style, normal)',
                                        fontWeight: 'var(--font-product-description-weight, normal)',
                                        fontSize: 'var(--font-product-description-size, 1rem)',
                                        lineHeight: 'var(--font-product-description-line-height, 1.5)'
                                    }}
                                >
                                    {product.description}
                                </p>

                                {/* VARIANTS (New Field) */}
                                {hasVariants && (
                                    <div className="grid gap-6 grid-cols-1">
                                        {product.variantGroups?.map((group, groupIdx) => (
                                            <div key={groupIdx} className="flex flex-col h-full">
                                                {group.showTitle !== false && (
                                                    <h4 className="font-bold text-[var(--color-product-extra-text)] mb-3 sticky top-0 bg-[var(--color-product-modal-bg)] z-10 pb-1">
                                                        {group.title}
                                                    </h4>
                                                )}
                                                <div className="space-y-2">
                                                    {group.variants.map((variant, vIdx) => (
                                                        <button
                                                            key={vIdx}
                                                            onClick={() => selectVariant(group.title, variant)}
                                                            className={`
                                                                w-full flex justify-between items-center gap-2
                                                                p-3 rounded-lg border-2 transition-all text-left
                                                                ${isVariantSelected(group.title, variant.name)
                                                                    ? 'border-[var(--color-product-extra-selected)] bg-[var(--color-product-extra-selected)]'
                                                                    : 'border-[var(--color-product-extra-bg)] bg-[var(--color-product-extra-bg)] hover:brightness-110'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className={`
                                                                    w-4 h-4 rounded-full border flex items-center justify-center shrink-0
                                                                    ${isVariantSelected(group.title, variant.name)
                                                                        ? 'border-white'
                                                                        : 'border-[var(--color-product-extra-text)] opacity-50'
                                                                    }
                                                                `}>
                                                                    {isVariantSelected(group.title, variant.name) && (
                                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                                    )}
                                                                </div>
                                                                <span className={`text-sm truncate ${isVariantSelected(group.title, variant.name) ? 'text-white' : 'text-[var(--color-product-extra-text)]'}`}>
                                                                    {variant.name}
                                                                </span>
                                                            </div>
                                                            <span className={`text-sm font-bold shrink-0 ${isVariantSelected(group.title, variant.name) ? 'text-white' : 'text-[var(--color-product-extra-text)]'}`}>
                                                                {renderVariantPrice(variant.price)}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Options Selection (Single Select) */}
                                {hasOptions && (
                                    <div className={`
                                        grid gap-6 
                                        ${allOptionGroups.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}
                                     `}>
                                        {allOptionGroups.map((group, groupIdx) => {
                                            const groupKey = `group_${groupIdx}`;
                                            return (
                                                <div key={groupIdx} className="flex flex-col h-full">
                                                    {group.showTitle !== false && (
                                                        <h4 className="font-bold text-[var(--color-product-extra-text)] mb-3 sticky top-0 bg-[var(--color-product-modal-bg)] z-10 pb-1">
                                                            {group.title}
                                                        </h4>
                                                    )}
                                                    <div className="space-y-2">
                                                        {group.options.map((option, optIdx) => (
                                                            <button
                                                                key={optIdx}
                                                                onClick={() => selectOption(groupKey, option)}
                                                                className={`
                                                                    w-full flex justify-between items-center gap-2
                                                                    p-3 rounded-lg border-2 transition-all text-left
                                                                    ${isOptionSelected(groupKey, option.name)
                                                                        ? 'border-[var(--color-product-extra-selected)] bg-[var(--color-product-extra-selected)]'
                                                                        : 'border-[var(--color-product-extra-bg)] bg-[var(--color-product-extra-bg)] hover:brightness-110'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <div className={`
                                                                        w-4 h-4 rounded-full border flex items-center justify-center shrink-0
                                                                        ${isOptionSelected(groupKey, option.name)
                                                                            ? 'border-white'
                                                                            : 'border-[var(--color-product-extra-text)] opacity-50'
                                                                        }
                                                                    `}>
                                                                        {isOptionSelected(groupKey, option.name) && (
                                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-sm truncate ${isOptionSelected(groupKey, option.name) ? 'text-white' : 'text-[var(--color-product-extra-text)]'}`}>
                                                                        {option.name}
                                                                    </span>
                                                                </div>
                                                                {parseFloat(option.price?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0') > 0 && (
                                                                    <span className={`text-sm font-bold shrink-0 ${isOptionSelected(groupKey, option.name) ? 'text-white' : 'text-[var(--color-product-extra-text)]'}`}>
                                                                        {renderPriceDiff(option.price)}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Extras Selection (Multi Select Groups) */}
                                {extraGroups.length > 0 &&
                                    extraGroups.map((group, groupIdx) => {
                                        // Count selected in this group
                                        const selectedCount = selectedExtrasByGroup[group.id]?.reduce((sum, e) => sum + (e.quantity || 1), 0) || 0;
                                        const remainingIncluded = Math.max(0, group.included - selectedCount);

                                        // Helper to get selection info for an extra in this group
                                        const getExtraSelectionInfo = (extraName: string) => {
                                            const selected = selectedExtrasByGroup[group.id] || [];
                                            const extraItem = selected.find(e => e.name === extraName);
                                            const quantity = extraItem ? (extraItem.quantity || 1) : 0;
                                            
                                            const processed = processGroupExtras(
                                                selected.map(e => ({ name: e.name, price: e.price, quantity: e.quantity || 1 })),
                                                group.included
                                            );
                                            const freeCount = processed.filter(p => p.name.startsWith(extraName) && p.price === 0).length;
                                            const chargedCount = quantity - freeCount;

                                            return { quantity, freeCount, chargedCount };
                                        };

                                        // Dynamic and gender-agreeing message for included extras
                                        let includedText = null;
                                        if (group.included > 0 && remainingIncluded > 0) {
                                            const nameToUse = remainingIncluded > 1 
                                                ? (group.titlePlural || 'extras') 
                                                : (group.titleSingular || 'extra');
                                            const lower = nameToUse.toLowerCase();
                                            const isFeminine = (
                                                lower.endsWith('a') || 
                                                lower.endsWith('as') || 
                                                lower.endsWith('ción') || 
                                                lower.endsWith('ciones') || 
                                                lower.endsWith('tad') || 
                                                lower.endsWith('tades')
                                            ) && lower !== 'extra' && lower !== 'extras';
                                            const agreement = isFeminine
                                                ? (remainingIncluded > 1 ? 'incluidas' : 'incluida')
                                                : (remainingIncluded > 1 ? 'incluidos' : 'incluido');

                                            const quantityWord = numberToWordsSpanish(remainingIncluded, isFeminine);
                                            includedText = `¡Tienes ${quantityWord} ${nameToUse} ${agreement}!`;
                                        }

                                        return (
                                            <div key={groupIdx} className="flex flex-col h-full mt-6">
                                                <div className="sticky top-0 bg-[var(--color-product-modal-bg)] z-10 pb-2 mb-3 border-b border-white/5">
                                                     <div className="flex justify-between items-baseline mb-1">
                                                         <h4 className="font-bold text-[var(--color-product-extra-text)]">
                                                             {group.title}
                                                         </h4>
                                                         <span className="text-xs text-[var(--color-product-extra-text)] opacity-70">
                                                             {selectedCount}/{group.max > 0 ? group.max : '∞'}
                                                         </span>
                                                     </div>

                                                     {/* Helper text for limits */}
                                                     <div className="flex flex-wrap gap-2 text-xs">
                                                         {group.min > 0 && (
                                                             <span className={selectedCount >= group.min ? 'text-green-400' : 'text-amber-400'}>
                                                                 Obligatorio: {group.min}
                                                             </span>
                                                         )}
                                                         {includedText && (
                                                             <span className="text-green-400 font-medium">
                                                                 {includedText}
                                                             </span>
                                                         )}
                                                     </div>
                                                 </div>

                                                 <div className="space-y-2">
                                                     {group.extras.map((extra, eIdx) => {
                                                         const isSelected = selectedExtrasByGroup[group.id]?.some(e => e.name === extra.name);
                                                         const isAtMax = group.max > 0 && selectedCount >= group.max;
                                                         const isDisabled = !isSelected && isAtMax;

                                                         // If allowQuantity is true, render quantity controls
                                                         if (group.allowQuantity) {
                                                             const { quantity, freeCount } = getExtraSelectionInfo(extra.name);
                                                             const isExtraSelected = quantity > 0;
                                                             const isIncrementDisabled = isAtMax;
                                                             const price = parseFloat(extra.price?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0');

                                                             return (
                                                                 <div
                                                                     key={eIdx}
                                                                     className={`
                                                                         w-full flex justify-between items-center gap-2
                                                                         p-3 rounded-lg border-2 transition-all
                                                                         ${isExtraSelected
                                                                             ? 'border-[var(--color-product-extra-selected)] bg-[var(--color-product-extra-selected)] text-white'
                                                                             : isAtMax
                                                                                 ? 'border-transparent bg-gray-500/10 opacity-50'
                                                                                 : 'border-[var(--color-product-extra-bg)] bg-[var(--color-product-extra-bg)] text-[var(--color-product-extra-text)]'
                                                                         }
                                                                     `}
                                                                 >
                                                                     <div 
                                                                         className={`flex items-center gap-3 flex-1 min-w-0 cursor-pointer ${isAtMax && !isExtraSelected ? 'cursor-not-allowed' : ''}`}
                                                                         onClick={() => {
                                                                             if (isExtraSelected) {
                                                                                 updateProductExtraQuantity(group.id, extra, 0, group.max);
                                                                             } else {
                                                                                 if (!isAtMax) {
                                                                                     updateProductExtraQuantity(group.id, extra, 1, group.max);
                                                                                 }
                                                                             }
                                                                         }}
                                                                     >
                                                                         <div className={`
                                                                             w-5 h-5 rounded flex items-center justify-center transition-colors border-2 shrink-0
                                                                             ${isExtraSelected ? 'bg-white border-white text-[var(--color-product-extra-selected)]' : 'border-[var(--color-product-extra-text)] opacity-30'}
                                                                         `}>
                                                                             {isExtraSelected && (
                                                                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                                 </svg>
                                                                             )}
                                                                         </div>
                                                                         <div className="flex flex-col min-w-0">
                                                                             <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                                                                 <span className="text-sm font-medium truncate">{extra.name}</span>
                                                                                 {extra.isRecommended && (
                                                                                     <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase shrink-0 tracking-wider transition-colors ${
                                                                                         isExtraSelected 
                                                                                             ? 'bg-white/20 text-white border border-white/30' 
                                                                                             : 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                                                                                     }`}>
                                                                                         Recomendado
                                                                                     </span>
                                                                                 )}
                                                                             </div>
                                                                             {price > 0 && (
                                                                                 <span className={`text-xs ${isExtraSelected ? 'text-white/80' : 'text-[var(--color-product-extra-text)] opacity-70'}`}>
                                                                                     {currency}{price.toFixed(2)}
                                                                                 </span>
                                                                             )}
                                                                             {freeCount > 0 && (
                                                                                 <span className="text-xs text-green-300 font-bold">
                                                                                     {freeCount === 1 ? '1 gratis' : `${numberToWordsSpanish(freeCount, true)} gratis`}
                                                                                 </span>
                                                                             )}
                                                                         </div>
                                                                     </div>

                                                                     <div className="flex items-center gap-2 shrink-0">
                                                                         {isExtraSelected ? (
                                                                             <div className="flex items-center gap-2 bg-white/20 rounded-lg p-0.5 border border-white/20">
                                                                                 <button
                                                                                     onClick={() => updateProductExtraQuantity(group.id, extra, quantity - 1, group.max)}
                                                                                     className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded font-bold text-white transition-colors"
                                                                                     aria-label={`Reducir cantidad de ${extra.name}`}
                                                                                 >
                                                                                     -
                                                                                 </button>
                                                                                 <span className="w-6 text-center text-sm font-bold text-white">
                                                                                     {quantity}
                                                                                 </span>
                                                                                 <button
                                                                                     onClick={() => updateProductExtraQuantity(group.id, extra, quantity + 1, group.max)}
                                                                                     disabled={isIncrementDisabled}
                                                                                     className={`w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded font-bold text-white transition-colors ${isIncrementDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                                     aria-label={`Incrementar cantidad de ${extra.name}`}
                                                                                 >
                                                                                     +
                                                                                 </button>
                                                                             </div>
                                                                         ) : (
                                                                             <button
                                                                                 onClick={() => updateProductExtraQuantity(group.id, extra, 1, group.max)}
                                                                                 disabled={isAtMax}
                                                                                 className={`
                                                                                     w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors font-bold text-lg
                                                                                     ${isAtMax 
                                                                                         ? 'border-transparent text-gray-500/30 cursor-not-allowed' 
                                                                                         : 'border-[var(--color-product-extra-text)] text-[var(--color-product-extra-text)] opacity-50 hover:opacity-100'
                                                                                     }
                                                                                 `}
                                                                             >
                                                                                 +
                                                                             </button>
                                                                         )}
                                                                     </div>
                                                                 </div>
                                                             );
                                                         }

                                                         // Is this specific extra free because of inclusion? (Non-quantity group)
                                                         const selectedIndex = selectedExtrasByGroup[group.id]?.findIndex(e => e.name === extra.name);
                                                         const isFree = isSelected && selectedIndex !== undefined && selectedIndex < group.included;
                                                         const willBeFree = !isSelected && remainingIncluded > 0;

                                                         return (
                                                             <button
                                                                 key={eIdx}
                                                                 onClick={() => toggleProductExtra(group.id, extra, group.max)}
                                                                 disabled={isDisabled}
                                                                 className={`
                                                                     w-full flex justify-between items-center gap-2
                                                                     p-3 rounded-lg border-2 transition-all text-left
                                                                     ${isSelected
                                                                         ? 'border-[var(--color-product-extra-selected)] bg-[var(--color-product-extra-selected)] text-white'
                                                                         : isDisabled
                                                                             ? 'border-transparent bg-gray-500/10 opacity-50 cursor-not-allowed'
                                                                             : 'border-[var(--color-product-extra-bg)] bg-[var(--color-product-extra-bg)] hover:brightness-110 text-[var(--color-product-extra-text)]'
                                                                     }
                                                                 `}
                                                             >
                                                                 <div className="flex items-center gap-3">
                                                                     <div className={`
                                                                         w-5 h-5 rounded flex items-center justify-center transition-colors border-2 shrink-0
                                                                         ${isSelected ? 'bg-white border-white text-[var(--color-product-extra-selected)]' : 'border-[var(--color-product-extra-text)] opacity-30'}
                                                                     `}>
                                                                         {isSelected && (
                                                                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                             </svg>
                                                                         )}
                                                                     </div>
                                                                     <div className="flex flex-col">
                                                                         <div className="flex items-center gap-1.5 flex-wrap">
                                                                             <span className="text-sm font-medium">{extra.name}</span>
                                                                             {extra.isRecommended && (
                                                                                 <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase shrink-0 tracking-wider transition-colors ${
                                                                                     isSelected 
                                                                                         ? 'bg-white/20 text-white border border-white/30' 
                                                                                         : 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                                                                                 }`}>
                                                                                     Recomendado
                                                                                 </span>
                                                                             )}
                                                                         </div>
                                                                         {(isFree || willBeFree) && parseFloat(extra.price?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0') > 0 && (
                                                                             <span className="text-xs text-green-300 font-bold">¡Gratis!</span>
                                                                         )}
                                                                     </div>
                                                                 </div>
                                                                 <div className="flex items-center gap-2 font-bold shrink-0">
                                                                     {isSelected ? (
                                                                         <svg className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                         </svg>
                                                                     ) : (
                                                                         <span>+</span>
                                                                     )}
                                                                     {(!isFree && parseFloat(extra.price?.toString()?.replace(/[^0-9.,-]/g, '')?.replace(',', '.') || '0') > 0) ? (
                                                                         <span>{currency}{extra.price}</span>
                                                                     ) : null}
                                                                 </div>
                                                             </button>
                                                         )
                                                     })}
                                                 </div>
                                             </div>
                                         );
                                     })
                                 }

                                 {/* Observations/Notes Section */}
                                 <div className="p-4 sm:p-5 border-t border-white/5 space-y-2">
                                     <label 
                                         htmlFor="product-notes" 
                                         className="block text-md font-semibold text-white"
                                         
                                     >
                                         Observaciones:
                                     </label>
                                     <textarea
                                         id="product-notes"
                                         rows={2}
                                         placeholder="Ej: sin cebolla, salsas aparte, etc."
                                         value={notes}
                                         onChange={(e) => setNotes(e.target.value)}
                                         className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-product-extra-selected)] transition-colors resize-none"
                                     />
                                 </div>
                            </div>

                            {/* Scroll Bottom Indicator */}
                            <div
                                id={`scroll-indicator-${product.slug || 'modal'}`}
                                className="absolute bottom-[5.5rem] left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-[var(--color-product-modal-bg)] to-transparent transition-opacity duration-300 flex items-end justify-center pb-2 z-20 opacity-0"
                            >
                                <motion.div
                                    animate={{ y: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="bg-black/40 backdrop-blur-sm text-white rounded-full p-1.5 shadow-lg border border-white/10"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </motion.div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="
                                relative z-30
                                flex-shrink-0
                                p-3 sm:p-4
                                border-t border-white/10
                                bg-[var(--color-product-modal-bg)]
                                flex items-center justify-between gap-3 sm:gap-4
                            ">
                                {/* Quantity Control - Hide if extras or options present? Usually 1 is safer for complex orders to avoid confusion, but users might want 2 identical custom burgers. Let's allowing quantity. */}

                                <div className="bg-white backdrop-blur-sm rounded-full px-1 py-1 shadow-sm">
                                    <QuantityControl
                                        quantity={quantity}
                                        onIncrement={() => setQuantity(q => q + 1)}
                                        onDecrement={() => setQuantity(q => Math.max(1, q - 1))}
                                        showZero
                                        numberClassName="!text-[var(--color-quantity-text)]"
                                    />
                                </div>

                                {/* Add to Order Button */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    disabled={!isMinMet}
                                    className={`
                                        flex-1
                                        py-4 px-6
                                        font-bold text-lg
                                        rounded-xl
                                        shadow-lg
                                        border border-white
                                        flex items-center justify-center gap-2
                                        transition-all duration-200
                                        ${!isMinMet
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-70'
                                            : 'bg-[var(--color-product-modal-btn-bg)] text-[var(--color-product-modal-btn-text)]'
                                        }
                                    `}
                                >
                                    {(() => {
                                        const unsatisfiedGroup = extraGroups.find(g => {
                                             const count = selectedExtrasByGroup[g.id]?.reduce((sum, e) => sum + (e.quantity || 1), 0) || 0;
                                            return g.min > 0 && count < g.min;
                                        });

                                        if (!unsatisfiedGroup) {
                                            return (
                                                <>
                                                    <span>Agregar</span>
                                                    <span>•</span>
                                                    <span>{currency}{itemTotal.toFixed(2)}</span>
                                                </>
                                            );
                                        }

                                         const currentCount = selectedExtrasByGroup[unsatisfiedGroup.id]?.reduce((sum, e) => sum + (e.quantity || 1), 0) || 0;
                                         const missingCount = unsatisfiedGroup.min - currentCount;
                                         const title = missingCount > 1 
                                             ? (unsatisfiedGroup.titlePlural || (unsatisfiedGroup.titleSingular || 'opción') + 's')
                                             : (unsatisfiedGroup.titleSingular || 'opción');

                                         return <span>Selecciona {missingCount} {title} más en {unsatisfiedGroup.title}</span>;
                                    })()}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
