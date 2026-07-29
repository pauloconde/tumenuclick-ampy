
import React from 'react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
    title: string;
    image?: string;
    onClick: () => void;
    style?: React.CSSProperties;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, onClick, style }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-xl shadow-md cursor-pointer aspect-[4/3] group"
            onClick={onClick}
            style={style}
        >
            <div className="absolute inset-0 bg-gray-200">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-3xl">📷</span>
                    </div>
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-xl font-bold truncate drop-shadow-md pb-1">
                    {title}
                </h3>
            </div>
        </motion.div>
    );
};

export default CategoryCard;
