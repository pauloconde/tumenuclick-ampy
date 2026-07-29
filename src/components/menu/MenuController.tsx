
import React, { useState, useEffect } from 'react';
import CategoriesGrid from './categoriesLayouts/CategoriesGrid';
import ReactSectionFactory from './factories/ReactSectionFactory';
import { motion, AnimatePresence } from 'framer-motion';
import { selectedCategory, normalizeSlug } from '../../stores/menuStore';

interface MenuControllerProps {
    sections: any[];
    showCategoriesPage: boolean;
    defaultSectionLayout: string;
    currencySymbol: string;
    priceDivider: string;
    bestSellersTitleSingular: string;
    newsTitleSingular?: string;
    categoriesLayout?: string;
    categoriesLayoutConfig?: any;
}

const MenuController: React.FC<MenuControllerProps> = ({
    sections,
    showCategoriesPage,
    defaultSectionLayout,
    currencySymbol,
    priceDivider,
    bestSellersTitleSingular,
    newsTitleSingular,
    categoriesLayout,
    categoriesLayoutConfig,
}) => {
    const [selectedSection, setSelectedSection] = useState<any | null>(null);
    const lastGridScroll = React.useRef(0);

    // Subscribe to external store updates AND handle URL sync
    useEffect(() => {
        // 1. On Mount: Check URL for initial category
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const categorySlug = params.get('category');
            if (categorySlug) {
                const section = sections.find(s => {
                    const sSlug = s.slug?.current || normalizeSlug(s.title);
                    return sSlug === categorySlug || normalizeSlug(s.title) === categorySlug;
                });
                if (section) {
                    // Update local state and store without pushing history (replace to be safe)
                    setSelectedSection(section);
                    selectedCategory.set(categorySlug);
                }
            } else {
                // No category in URL, ensure we are in grid View
                setSelectedSection(null);
                selectedCategory.set(null);
            }
        }

        // 2. Listen to store updates to sync internal state
        const unsubscribe = selectedCategory.subscribe((slug) => {
            if (!slug) {
                setSelectedSection(null);
                // Sync URL if needed (e.g. if updated from Navbar)
                const currentParams = new URLSearchParams(window.location.search);
                if (currentParams.has('category')) {
                    const newUrl = window.location.pathname;
                    window.history.pushState({}, '', newUrl);
                }
                // Removed forced scroll to top here to allow restoration logic in the Grid component
                return;
            }

            // Find section
            const section = sections.find(s => {
                const sSlug = s.slug?.current || normalizeSlug(s.title);
                return sSlug === slug || normalizeSlug(s.title) === slug;
            });

            if (section) {
                setSelectedSection(section);
                // Sync URL: If store changed and URL doesn't match, push state
                const currentParams = new URLSearchParams(window.location.search);
                if (currentParams.get('category') !== slug) {
                    const newUrl = `${window.location.pathname}?category=${slug}`;
                    window.history.pushState({}, '', newUrl);
                }
            }
        });

        // 3. Listen to PopState (Browser Back/Forward)
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const categorySlug = params.get('category');
            // Update store based on URL. Store subscription will handle the rest.
            selectedCategory.set(categorySlug);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            unsubscribe();
            window.removeEventListener('popstate', handlePopState);
        };
    }, [sections]);

    // ... Legacy Mode Check ... 
    if (!showCategoriesPage) {
        return (
            <div className="space-y-10">
                {sections.map((section: any) => (
                    <ReactSectionFactory
                        key={section._key || section._id || section.title}
                        section={section}
                        globalLayoutPreference={defaultSectionLayout}
                        currencySymbol={currencySymbol}
                        priceDivider={priceDivider}
                        bestSellersTitleSingular={bestSellersTitleSingular}
                        newsTitleSingular={newsTitleSingular}
                    />
                ))}
            </div>
        );
    }

    // Helper to handle internal selection (clicking a card)
    const handleCategorySelect = (section: any) => {
        // Save current scroll position before navigating away
        lastGridScroll.current = window.scrollY;

        const slug = section.slug?.current || normalizeSlug(section.title);
        // Just set the store. The subscription above will handle URL pushState
        selectedCategory.set(slug);

        // We let the Category View handle its own scrolling (to title)
    };

    const handleBack = () => {
        // Just set the store. Subscription handles URL.
        selectedCategory.set(null);
        // We do NOT scroll to top here, we let the Grid restore its position
    };
    // We do NOT scroll to top here, we let the Grid restore its position

    // Categories Page Mode
    return (
        <div>
            <AnimatePresence mode="wait">
                {!selectedSection ? (
                    <motion.div
                        key="categories-grid"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onAnimationComplete={() => {
                            // Restore previous scroll position instantly
                            window.scrollTo({ top: lastGridScroll.current, behavior: 'instant' });
                        }}
                    >
                        <CategoriesGrid
                            // ...
                            sections={sections}
                            onCategorySelect={handleCategorySelect}
                            layout={categoriesLayout}
                            config={categoriesLayoutConfig}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key={selectedSection._id || selectedSection._key || selectedSection.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="pb-20"
                        onAnimationComplete={() => {
                            // Find the section element by ID (slug) and scroll to it
                            const slug = selectedSection.slug?.current || normalizeSlug(selectedSection.title);
                            if (slug) {
                                const element = document.getElementById(slug);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    // Fallback if ID generation differs slightly or element not found
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }
                        }}
                    >
                        <ReactSectionFactory
                            section={selectedSection}
                            globalLayoutPreference={defaultSectionLayout}
                            currencySymbol={currencySymbol}
                            priceDivider={priceDivider}
                            bestSellersTitleSingular={bestSellersTitleSingular}
                            newsTitleSingular={newsTitleSingular}
                            isSingleView={true}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Back Button - Rendered outside the main content to avoid transform issues */}
            {selectedSection && (
                <motion.button
                    key="back-button"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    onClick={handleBack}
                    className="fixed top-32 left-0 z-40 flex items-center space-x-2 px-4 py-2 rounded-r-[8px] rounded-l-none shadow-lg hover:shadow-xl transform transition-transform active:scale-95 pr-6"
                    style={{ backgroundColor: 'var(--color-back-btn-bg, var(--color-text-section))', color: 'var(--color-back-btn-text, var(--color-text-title))' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.9" />
                        <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.9" />
                        <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.9" />
                        <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.9" />
                    </svg>
                    <span className="font-medium text-base">Volver</span>
                </motion.button>
            )}
        </div >
    );
};

export default MenuController;
