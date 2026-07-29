/**
 * ProductBuilderSection - Interactive wizard for building customizable products
 * ("Arma tu Perro/Pizza/Hamburguesa")
 * Only visible when order mode is ON
 * 
 * Features:
 * - Step-by-step wizard with progress bar
 * - Radio (single) and checkbox (multiple) selection based on maxSelection
 * - Real-time price calculation
 * - GA4 integration (view_item, add_to_cart)
 * - Framer Motion animations
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { addToCart } from '../../stores/cartStore';
import type { CartExtra } from '../../stores/cartStore';

// ========================================
// INTERFACES
// ========================================

export interface BuilderOption {
    _key: string;
    name: string;
    price: number; // 0 if free
    emoji?: string;
    isSoldOut?: boolean;
}

export interface BuilderStep {
    _key: string;
    title: string;
    subtitle?: string;
    maxSelection: number; // 1 = Radio (single), >1 = Checkbox (multiple)
    required: boolean;
    options: BuilderOption[];
}

export interface ProductBuilderProps {
    title: string;
    description?: string;
    basePrice: number;
    slug: { current: string };
    steps: BuilderStep[];
    currencySymbol: string;
    onAddToCart?: (payload: {
        items: any[];
        total: number;
        variantDescription: string;
    }) => void;
    onClose?: () => void;
}

// Note: Window.trackOrderEvent and Window.gtag are declared in cartStore.ts

// ========================================
// ANIMATION VARIANTS
// ========================================

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
    }),
};

const shakeVariants = {
    shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
    },
};

// ========================================
// COMPONENT
// ========================================

export default function ProductBuilderSection({
    title,
    description,
    basePrice,
    slug,
    steps,
    currencySymbol,
    onAddToCart,
    onClose,
}: ProductBuilderProps) {
    // Filter out empty steps
    const validSteps = useMemo(
        () => steps.filter((step) => step.options && step.options.length > 0),
        [steps]
    );

    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selections, setSelections] = useState<Map<string, Set<string>>>(new Map());
    const [direction, setDirection] = useState(0); // For animation direction
    const [shakeError, setShakeError] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    const currentStep = validSteps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === validSteps.length - 1;

    // Trigger pulse animation when step changes
    useEffect(() => {
        if (currentStepIndex > 0 || validSteps.length > 0) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 600); // Longer duration
            return () => clearTimeout(timer);
        }
    }, [currentStepIndex]);


    // ========================================
    // GA4: view_item on mount
    // Uses same custom dimension logic as GA4Script.astro for consistency
    // ========================================
    useEffect(() => {
        if (typeof window !== 'undefined' && window.gtag) {
            // Get visit context from localStorage (same as GA4Script)
            const visitContext = localStorage.getItem('tumenu_visit_context') || 'direct';

            // Parse slug for metadata (same logic as trackOrderEvent in GA4Script)
            let codigo_pais = '', codigo_ciudad = '', id_vendedor = '', id_cliente = '';
            const productSlug = slug.current;

            if (productSlug && productSlug.length >= 14) {
                const masterId = productSlug.substring(0, 14);
                codigo_pais = masterId.substring(0, 2);
                codigo_ciudad = masterId.substring(2, 5);
                id_vendedor = masterId.substring(5, 9);
                id_cliente = 'C' + masterId.substring(9, 14);
            }

            window.gtag('event', 'view_item', {
                currency: 'USD',
                value: basePrice,
                items: [
                    {
                        item_id: productSlug.length >= 14 ? productSlug.substring(0, 14) : productSlug,
                        item_name: title,
                        price: basePrice,
                        quantity: 1,
                        item_category: title // Use builder title as category
                    },
                ],
                // Custom dimensions (consistent with rest of site)
                visit_context: visitContext,
                codigo_pais,
                codigo_ciudad,
                id_vendedor,
                id_cliente
            });
        }
    }, [slug.current, title, basePrice]);

    // ========================================
    // SELECTION LOGIC
    // ========================================

    const getStepSelections = useCallback(
        (stepKey: string): Set<string> => {
            return selections.get(stepKey) || new Set();
        },
        [selections]
    );

    const toggleOption = useCallback(
        (stepKey: string, optionKey: string, maxSelection: number) => {
            setSelections((prev) => {
                const newSelections = new Map(prev);
                const stepSelections = new Set(prev.get(stepKey) || []);

                if (stepSelections.has(optionKey)) {
                    // Deselect
                    stepSelections.delete(optionKey);
                } else {
                    // Select
                    if (maxSelection === 1) {
                        // Radio behavior: clear all and select new
                        stepSelections.clear();
                        stepSelections.add(optionKey);
                    } else {
                        // Checkbox behavior: check limit
                        if (stepSelections.size < maxSelection) {
                            stepSelections.add(optionKey);
                        }
                        // If at limit, do nothing (could add feedback here)
                    }
                }

                newSelections.set(stepKey, stepSelections);
                return newSelections;
            });
        },
        []
    );

    const isOptionSelected = useCallback(
        (stepKey: string, optionKey: string): boolean => {
            return getStepSelections(stepKey).has(optionKey);
        },
        [getStepSelections]
    );

    // ========================================
    // VALIDATION
    // ========================================

    const canProceed = useCallback(
        (step: BuilderStep): boolean => {
            if (!step.required) return true;
            const stepSelections = getStepSelections(step._key);
            return stepSelections.size > 0;
        },
        [getStepSelections]
    );

    // ========================================
    // PRICE CALCULATION
    // ========================================

    const calculateTotal = useMemo(() => {
        let total = basePrice;

        validSteps.forEach((step) => {
            const stepSelections = selections.get(step._key);
            if (stepSelections) {
                step.options.forEach((option) => {
                    if (stepSelections.has(option._key)) {
                        total += option.price;
                    }
                });
            }
        });

        return total;
    }, [basePrice, validSteps, selections]);

    // ========================================
    // VARIANT DESCRIPTION
    // ========================================

    const generateVariantDescription = useCallback((): string => {
        const parts: string[] = [];

        validSteps.forEach((step) => {
            const stepSelections = selections.get(step._key);
            if (stepSelections && stepSelections.size > 0) {
                const selectedNames: string[] = [];
                step.options.forEach((option) => {
                    if (stepSelections.has(option._key)) {
                        selectedNames.push(option.name);
                    }
                });
                if (selectedNames.length > 0) {
                    parts.push(selectedNames.join(', '));
                }
            }
        });

        return parts.join(' | ');
    }, [validSteps, selections]);

    // ========================================
    // NAVIGATION
    // ========================================

    const handleNext = useCallback(() => {
        if (!currentStep) return;

        if (!canProceed(currentStep)) {
            // Trigger shake animation
            setShakeError(true);
            setTimeout(() => setShakeError(false), 400);
            return;
        }

        if (isLastStep) {
            // Finish
            handleFinish();
        } else {
            setDirection(1);
            setCurrentStepIndex((prev) => prev + 1);
        }
    }, [currentStep, canProceed, isLastStep]);

    const handleBack = useCallback(() => {
        if (isFirstStep) {
            onClose?.();
        } else {
            setDirection(-1);
            setCurrentStepIndex((prev) => prev - 1);
        }
    }, [isFirstStep, onClose]);

    // ========================================
    // FINISH & GA4
    // ========================================

    const handleFinish = useCallback(() => {
        const variantDescription = generateVariantDescription();
        const total = calculateTotal;

        // Build extras array for cart store
        const extras: CartExtra[] = [];
        validSteps.forEach((step) => {
            const stepSelections = selections.get(step._key);
            if (stepSelections) {
                step.options.forEach((option) => {
                    if (stepSelections.has(option._key)) {
                        extras.push({
                            name: option.name,
                            price: option.price,
                        });
                    }
                });
            }
        });

        // GA4: add_to_cart using global trackOrderEvent for consistent tracking
        // trackOrderEvent handles visit_context, metadata parsing, and variant generation
        if (typeof window !== 'undefined' && window.trackOrderEvent) {
            // Build payload matching CartItem structure expected by trackOrderEvent
            const ga4Payload = {
                productSlug: slug.current,  // Full slug for metadata parsing
                name: title,
                unitPrice: total,           // Total price (base + extras)
                quantity: 1,
                extras: extras,             // Pass extras array for variant generation
                sectionName: title          // Use builder title as section
            };

            window.trackOrderEvent('add_to_cart', [ga4Payload], total);
        }

        // If callback provided, use it; otherwise add to cart directly
        if (onAddToCart) {
            onAddToCart({
                items: extras,
                total,
                variantDescription,
            });
        } else {
            // Add to the shared cart store
            addToCart({
                productSlug: slug.current,
                name: title,
                unitPrice: basePrice,
                extras,
                sectionName: title,
            }, 1);
        }
    }, [generateVariantDescription, calculateTotal, validSteps, selections, slug, title, basePrice, onAddToCart]);

    // ========================================
    // RENDER: Handle empty steps
    // ========================================

    if (validSteps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-[var(--color-text-subtitle)]">
                    No hay opciones disponibles para este producto.
                </p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-4 px-6 py-2 bg-[var(--color-navbar-select-border)] text-white rounded-lg"
                    >
                        Cerrar
                    </button>
                )}
            </div>
        );
    }

    // Don't render until hydrated
    if (!isHydrated) {
        return null;
    }

    // Generate section ID for anchor links
    const sectionId = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return (
        <section className="scroll-mt-24 pt-16" id={sectionId}>
            {/* Section Title - Outside the box, matching other sections */}
            <h2 className="text-3xl font-bold text-[var(--color-text-section)] text-center mb-2
                [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_0px_0_#000,0px_2px_0_#000,-2px_0px_0_#000,0px_-2px_0_#000]
            ">
                {title}
            </h2>

            {description && (
                <p className="text-md font-bold text-[var(--color-text-subtitle)] text-center mb-6">
                    {description}
                </p>
            )}

            {/* Builder Card */}
            <motion.div
                className="flex flex-col bg-[var(--color-builder-card-bg)] border border-[var(--color-builder-card-border)] rounded-2xl overflow-hidden"
                layout
                animate={isPulsing ? { scale: [1, 0.97, 1.02, 1] } : { scale: 1 }}
                transition={{
                    scale: { duration: 0.5, ease: "easeInOut" },
                    layout: { duration: 0.4, ease: "easeOut" }
                }}
            >
                {/* Header with Progress Bar */}
                <div className="flex-shrink-0 p-4 border-b border-[var(--color-builder-footer-border)]">
                    {/* Progress Bar */}
                    <div className="flex gap-1">
                        {validSteps.map((step, index) => (
                            <div
                                key={step._key}
                                className={`
                                    h-1.5 flex-1 rounded-full transition-all duration-300
                                    ${index <= currentStepIndex
                                        ? 'bg-[var(--color-builder-progress-active)]'
                                        : 'bg-[var(--color-builder-progress-inactive)]'
                                    }
                                `}
                            />
                        ))}
                    </div>

                    {/* Step indicator */}
                    <p className="text-xs text-[var(--color-builder-step-indicator)] mt-2">
                        Paso {currentStepIndex + 1} de {validSteps.length}
                    </p>
                </div>

                {/* Content Area with Animation */}
                <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <AnimatePresence mode="wait" custom={direction}>
                        {currentStep && (
                            <motion.div
                                key={currentStep._key}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'tween', duration: 0.25 }}
                                className="p-4"
                            >
                                {/* Step Title */}
                                <motion.div
                                    variants={shakeError ? shakeVariants : {}}
                                    animate={shakeError ? 'shake' : ''}
                                >
                                    <h3 className="text-3xl font-bold text-[var(--color-builder-step-title)] mb-1">
                                        {currentStep.title}
                                        {currentStep.required && (
                                            <span className="text-red-400 ml-1">*</span>
                                        )}
                                    </h3>
                                    {currentStep.subtitle && (
                                        <p className="text-base text-[var(--color-builder-step-subtitle)] mb-4">
                                            {currentStep.subtitle}
                                        </p>
                                    )}
                                    {currentStep.maxSelection > 1 && (
                                        <p className="text-xs text-[var(--color-builder-step-subtitle)] opacity-70 mb-4">
                                            Puedes elegir hasta {currentStep.maxSelection} opciones
                                        </p>
                                    )}
                                </motion.div>

                                {/* Options Grid - Responsive: 2 cols mobile, 3 md, 4 lg */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {currentStep.options.map((option) => {
                                        const isSelected = isOptionSelected(currentStep._key, option._key);
                                        const isSoldOut = option.isSoldOut;
                                        const atLimit =
                                            currentStep.maxSelection > 1 &&
                                            getStepSelections(currentStep._key).size >= currentStep.maxSelection &&
                                            !isSelected;

                                        return (
                                            <button
                                                key={option._key}
                                                disabled={isSoldOut}
                                                onClick={() => {
                                                    if (!isSoldOut && !atLimit) {
                                                        toggleOption(currentStep._key, option._key, currentStep.maxSelection);
                                                    }
                                                }}
                                                className={`
                                                    flex justify-between items-center gap-2
                                                    p-3 rounded-lg
                                                    border-2 transition-all
                                                    ${isSoldOut || atLimit
                                                        ? 'opacity-50 cursor-not-allowed bg-[var(--color-builder-option-disabled-bg)] border-[var(--color-builder-option-disabled-border)]'
                                                        : isSelected
                                                            ? 'bg-[var(--color-builder-option-selected-bg)] border-[var(--color-builder-option-selected-border)]'
                                                            : 'bg-[var(--color-builder-option-bg)] border-[var(--color-builder-option-border)] hover:opacity-80'
                                                    }
                                                `}
                                            >
                                                <span className="text-sm text-[var(--color-builder-option-text)] text-left flex-1">
                                                    {option.name}
                                                    {isSoldOut && <span className="text-xs text-red-400 ml-1">(Agotado)</span>}
                                                </span>
                                                <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-builder-option-price)] shrink-0">
                                                    {isSelected ? (
                                                        <svg className="w-4 h-4 text-[var(--color-builder-option-check)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span>+</span>
                                                    )}
                                                    <span>
                                                        {/* {option.price > 0
                                                            ? `${currencySymbol}${option.price.toFixed(2)}`
                                                            : 'Gratis'
                                                        } */}
                                                        {currencySymbol}{option.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Sticky Footer */}
                <div className="flex-shrink-0 p-4 border-t border-[var(--color-builder-footer-border)] bg-[var(--color-builder-footer-bg)]">
                    {/* Total Price Display */}
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[var(--color-builder-total-label)]">Total</span>
                        <span className="text-xl font-bold text-[var(--color-builder-total-price)]">
                            {currencySymbol}{calculateTotal.toFixed(2)}
                        </span>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                        {/* Back Button - Hidden on first step */}
                        {!isFirstStep && (
                            <button
                                onClick={handleBack}
                                className="
                                    flex-1 py-4 px-4
                                    bg-[var(--color-builder-cancel-bg)]
                                    border border-[var(--color-builder-cancel-border)]
                                    text-[var(--color-builder-cancel-text)]
                                    font-semibold text-base
                                    rounded-xl
                                    transition-colors hover:opacity-80
                                    flex items-center justify-center gap-2
                                "
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Atrás
                            </button>
                        )}

                        {/* Next/Finish Button */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            className={`
                                flex-[3] py-4 px-4
                                font-bold text-base
                                rounded-xl
                                transition-all
                                flex items-center justify-center gap-2
                                ${currentStep && canProceed(currentStep)
                                    ? 'bg-[var(--color-builder-next-bg)] text-[var(--color-builder-next-text)] shadow-lg'
                                    : 'bg-[var(--color-builder-next-disabled-bg)] text-[var(--color-builder-next-disabled-text)]'
                                }
                            `}
                        >
                            {isLastStep ? (
                                <>
                                    <span>Agregar al Pedido</span>
                                    <span>•</span>
                                    <span>{currencySymbol}{calculateTotal.toFixed(2)}</span>
                                </>
                            ) : (
                                <>
                                    <span>Siguiente</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </section >
    );
}
