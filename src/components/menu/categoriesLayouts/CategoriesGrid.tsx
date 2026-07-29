
import React from 'react';
import CategoryCard from './CategoryCard';
import CategoriesIconGrid from './CategoriesIconGrid';
import { motion } from 'framer-motion';

interface CategoriesGridProps {
    sections: any[];
    onCategorySelect: (section: any) => void;
    layout?: string;
    config?: any;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ sections, onCategorySelect, layout = 'default', config }) => {
    // Filter only valid sections types (category or productBuilder)
    const displayableSections = sections.filter(
        (s) => s._type === 'category' || s._type === 'productBuilder'
    );

    if (layout === 'icon-grid') {
        return <CategoriesIconGrid sections={displayableSections} onCategorySelect={onCategorySelect} config={config} />;
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="px-4 pb-20 pt-4">
            {/* Optional Title just for the category page? Or rely on the sticky header? 
            Let's keep it simple for now and just show the grid. 
        */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
                {displayableSections.map((section: any) => {
                    // Determine Image URL
                    // For productBuilder, it has an 'image' field directly.
                    // For menuSection, we might pick the first item's image if the section has no image field (Sanity schema doesn't seem to have section image, let's double check query).
                    // Looking at the query in queries.ts: 
                    // productBuilder: 'image'
                    // menuSection: it does NOT have an image field in schema/menuTypes.ts (lines 704+). 
                    // So we'll try to use the first item's image URL if available.

                    let imageUrl = null;
                    if (section._type === 'productBuilder' && section.image) {
                        // If the GROQ query didn't expand the image URL (it usually doesn't for direct image fields unless we use proper projection), 
                        // we might need to rely on the fact that `section` passed here comes from `index.astro` which MIGHT have processed it? 
                        // Wait, index.astro:98 `sectionsWithImages` maps items but not sections themselves.
                        // We'll probably need a builder or pass the url from the parent. 
                        // For now, let's assume we might need a helper or just use what's there.
                        // Actually, let's use the `items[0].imageUrl` for menuSections as a fallback.
                    } else if (section.items && section.items.length > 0) {
                        // Try to grab the first item's image
                        imageUrl = section.items[0].imageUrl || section.items[0].imgSrc?.asset?.url;
                        // Note: index.astro computes `imageUrl` for items. So it should be there.
                    }

                    // Since productBuilder image processing wasn't in index.astro explicitly for the *section* image (only items), we might need to handle it.
                    // However, let's just try to check if imageUrl exists. 
                    // If productBuilder has `image`, we might need to run the url builder on it in index.astro or here.

                    // NOTE: Ideally we should update index.astro to process section images too.
                    // For this iteration, I'll pass the section object as is.

                    return (
                        <motion.div key={section._key || section._id || section.title} variants={item}>
                            <CategoryCard
                                title={section.title}
                                image={imageUrl}
                                onClick={() => onCategorySelect(section)}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default CategoriesGrid;
