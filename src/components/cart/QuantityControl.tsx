/**
 * QuantityControl - Reusable quantity increment/decrement controls
 */
import React from 'react';
import { motion } from 'framer-motion';

interface QuantityControlProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    size?: 'sm' | 'md';
    showZero?: boolean;
    numberClassName?: string;
}

export default function QuantityControl({
    quantity,
    onIncrement,
    onDecrement,
    size = 'md',
    showZero = false,
    numberClassName
}: QuantityControlProps) {
    const sizeClasses = {
        sm: 'w-6 h-6 text-sm',
        md: 'w-8 h-8 text-base'
    };

    const buttonClass = `
    ${sizeClasses[size]}
    flex items-center justify-center
    rounded-full
    border-2 border-[var(--color-product-add-btn-border)]
    text-[var(--color-product-add-btn-text)]
    bg-[var(--color-product-add-btn-bg)]
    hover:bg-[var(--color-product-add-btn-border)]
    hover:text-[var(--color-bg-main)]
    transition-colors duration-200
    font-bold
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

    if (quantity === 0 && !showZero) {
        return (
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onIncrement}
                className={buttonClass}
                aria-label="Agregar al carrito"
            >
                +
            </motion.button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onDecrement}
                className={buttonClass}
                aria-label="Reducir cantidad"
            >
                −
            </motion.button>

            <motion.span
                key={quantity}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`w-6 text-center font-bold text-[var(--color-quantity-text)] ${numberClassName || ''}`}
            >
                {quantity}
            </motion.span>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onIncrement}
                className={buttonClass}
                aria-label="Aumentar cantidad"
            >
                +
            </motion.button>
        </div>
    );
}
