import React from 'react';
import { motion } from 'framer-motion';

interface CategoriesIconGridProps {
    sections: any[];
    onCategorySelect: (section: any) => void;
    config?: any;
}

const CategoriesIconGrid: React.FC<CategoriesIconGridProps> = ({ sections, onCategorySelect, config }) => {
    // Filter only valid sections types (category or productBuilder)
    const displayableSections = sections.filter(
        (s) => s._type === 'category' || s._type === 'productBuilder'
    );

    // Parse config (which comes from Sanity as a code block)
    let parsedConfig: Record<string, any> = {};
    if (typeof config === 'string') {
        try { parsedConfig = JSON.parse(config); } catch (e) { console.error("Error parsing string config", e); }
    } else if (typeof config === 'object' && config !== null) {
        if (config.code) {
            try { parsedConfig = JSON.parse(config.code); } catch (e) { console.error("Error parsing code config", e); }
        } else {
            parsedConfig = config;
        }
    }

    const {
        iconColor = '#ffffff',
        textColor = '#ffffff',
        backgroundColor = 'transparent',
        columns = 2,
        mdColumns = 3,
        lgColumns = 4,
        gap = '1rem'
    } = parsedConfig;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as "spring", stiffness: 300, damping: 24 } }
    };

    // Determine grid classes based on parsed config (with fallbacks to Tailwind arbitrary values)
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))`, // Basic fallback, we'll try to use tailwind classes where possible or let the inline style govern.
        gap: gap
    };

    return (
        <div className="px-4 pb-20 pt-8 min-h-[50vh]" style={{ backgroundColor }}>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className={`grid grid-cols-${columns} md:grid-cols-${mdColumns} lg:grid-cols-${lgColumns}`}
                style={{ gap }}
            >
                {displayableSections.map((section: any) => {
                    // Extract icon URL
                    let iconUrl = null;
                    if (section.iconUrl || section.icon) {
                        iconUrl = typeof section.iconUrl === 'string' ? section.iconUrl : (typeof section.icon === 'string' ? section.icon : section.icon);
                    }

                    // Ensure we handle projected GROQ iconUrl or standard object icon
                    if (typeof section.iconUrl === 'string') {
                        iconUrl = section.iconUrl;
                    } else if (typeof section.icon === 'string') {
                        iconUrl = section.icon;
                    } else if (section.icon?.asset?.url) {
                        iconUrl = section.icon.asset.url;
                    }
                    if (!iconUrl) {
                        iconUrl = '/images/default-icon.svg';
                    }

                    return (
                        <motion.div
                            key={section._key || section._id || section.title}
                            variants={itemVariant}
                            className="flex flex-col items-center justify-start cursor-pointer group border border-white/50 rounded-xl p-6"
                            onClick={() => onCategorySelect(section)}
                        >
                            <div className="mb-4 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 flex items-center justify-center p-2">
                                <div
                                    className="w-16 h-16 md:w-20 md:h-20"
                                    style={{
                                        backgroundColor: iconColor,
                                        maskImage: `url(${iconUrl})`,
                                        WebkitMaskImage: `url(${iconUrl})`,
                                        maskSize: 'contain',
                                        WebkitMaskSize: 'contain',
                                        maskRepeat: 'no-repeat',
                                        WebkitMaskRepeat: 'no-repeat',
                                        maskPosition: 'center',
                                        WebkitMaskPosition: 'center',
                                    }}
                                    title={section.title}
                                />
                            </div>
                            <h3
                                className="text-center font-semibold text-sm md:text-base leading-snug px-2"
                                style={{ color: textColor, fontFamily: 'var(--font-section-title-family, Arial, sans-serif)', fontStyle: 'var(--font-section-title-style, normal)', fontWeight: 'var(--font-section-title-weight, 400)', fontSize: '25px', lineHeight: '1.2' }}
                            >
                                {section.title}
                            </h3>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default CategoriesIconGrid;
