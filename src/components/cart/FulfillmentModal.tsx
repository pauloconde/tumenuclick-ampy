import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FulfillmentConfig {
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDineIn: boolean;
    tableCount: number;
}

interface FulfillmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: 'delivery' | 'pickup' | 'dine-in', tableNumber?: string) => void;
    config: FulfillmentConfig;
    logoUrl?: string;
}

export default function FulfillmentModal({
    isOpen,
    onClose,
    onConfirm,
    config,
    logoUrl
}: FulfillmentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<'delivery' | 'pickup' | 'dine-in' | null>(null);
    const [tableNumber, setTableNumber] = useState('');
    const [error, setError] = useState('');

    // Set initial method
    useEffect(() => {
        if (isOpen) {
            if (config.hasDineIn) setSelectedMethod('dine-in');
            else if (config.hasPickup) setSelectedMethod('pickup');
            else if (config.hasDelivery) setSelectedMethod('delivery');
            else setSelectedMethod(null);

            setTableNumber('');
            setError('');
        }
    }, [isOpen, config]);

    const handleConfirm = () => {
        if (!selectedMethod) {
            setError('Por favor selecciona una opción');
            return;
        }

        if (selectedMethod === 'dine-in') {
            // Solo validar número de mesa si hay mesas configuradas
            if (config.tableCount > 0) {
                if (!tableNumber) {
                    setError('Por favor ingresa tu número de mesa');
                    return;
                }
                const num = parseInt(tableNumber);
                if (isNaN(num) || num < 1 || num > config.tableCount) {
                    setError(`Mesa inválida (1-${config.tableCount})`);
                    return;
                }
            }
        }

        onConfirm(selectedMethod, tableNumber);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[var(--color-modal-overlay)] backdrop-blur-sm z-[100]"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[var(--color-fulfillment-modal-bg,var(--color-bg-main))] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-[var(--color-border)]"
                        >
                            <div className="p-6 flex flex-col items-center">
                                {/* Logo (same style as SplashScreen) */}
                                {logoUrl && (
                                    <div className="mb-6 h-32 w-full flex justify-center items-center overflow-hidden">
                                        <img
                                            src={logoUrl}
                                            alt="Logo"
                                            className="h-full w-auto object-contain max-w-full"
                                        />
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-[var(--color-fulfillment-modal-text,var(--color-text-title))] mb-2 text-center">
                                    ¿Cómo deseas recibir tu pedido?
                                </h2>

                                <div className="w-full space-y-3 mt-4">
                                    {config.hasDineIn && (
                                        <button
                                            onClick={() => setSelectedMethod('dine-in')}
                                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedMethod === 'dine-in'
                                                ? 'border-[var(--color-fulfillment-option-selected-border,var(--color-brand-primary))] bg-[var(--color-fulfillment-option-selected-bg,rgba(var(--color-brand-primary-rgb),0.05))] text-[var(--color-fulfillment-option-selected-text,var(--color-brand-primary))] shadow-sm'
                                                : 'border-[var(--color-fulfillment-option-border,var(--color-border))] bg-[var(--color-fulfillment-option-bg,var(--color-card-bg))] text-[var(--color-fulfillment-option-text,var(--color-text-subtitle))] hover:border-[var(--color-fulfillment-option-hover-border,rgba(var(--color-brand-primary-rgb),0.3))] hover:bg-[var(--color-fulfillment-option-hover-bg,var(--color-bg-subtle))]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🍽️</span>
                                                <div className="text-left">
                                                    <div className="font-bold">Comer en el Local</div>
                                                    <div className="text-sm opacity-80">Te lo llevamos a la mesa</div>
                                                </div>
                                            </div>
                                            {selectedMethod === 'dine-in' && (
                                                <div className="w-6 h-6 rounded-full bg-[var(--color-fulfillment-check-bg,var(--color-brand-primary))] text-[var(--color-fulfillment-check-icon,white)] flex items-center justify-center animate-in fade-in zoom-in duration-200">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )}

                                    {selectedMethod === 'dine-in' && config.tableCount > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-2 pl-4 border-l-2 border-[var(--color-fulfillment-option-selected-border,var(--color-brand-primary))] ml-4">
                                                <label className="block text-sm font-medium text-[var(--color-fulfillment-modal-text,var(--color-text-subtitle))] mb-1">
                                                    Número de Mesa
                                                </label>
                                                <input
                                                    type="number"
                                                    value={tableNumber}
                                                    min="1"
                                                    max={config.tableCount > 0 ? config.tableCount : undefined}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // Limitar si hay tableCount definido
                                                        if (config.tableCount > 0) {
                                                            const num = parseInt(val);
                                                            if (val === '' || (num >= 1 && num <= config.tableCount)) {
                                                                setTableNumber(val);
                                                                setError('');
                                                            }
                                                        } else {
                                                            setTableNumber(val);
                                                        }
                                                    }}
                                                    placeholder={config.tableCount > 0 ? `1 - ${config.tableCount}` : "Ej: 5"}
                                                    className="w-full p-4 text-2xl font-bold text-center rounded-lg bg-[var(--color-fulfillment-input-bg,var(--color-input-bg))] border border-[var(--color-fulfillment-input-border,var(--color-input-border))] text-[var(--color-fulfillment-input-text,var(--color-input-text))] focus:ring-2 focus:ring-[var(--color-fulfillment-option-selected-border,var(--color-brand-primary))] focus:border-transparent outline-none transition-shadow"
                                                    autoFocus
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {config.hasPickup && (
                                        <button
                                            onClick={() => setSelectedMethod('pickup')}
                                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedMethod === 'pickup'
                                                ? 'border-[var(--color-fulfillment-option-selected-border,var(--color-brand-primary))] bg-[var(--color-fulfillment-option-selected-bg,rgba(var(--color-brand-primary-rgb),0.05))] text-[var(--color-fulfillment-option-selected-text,var(--color-brand-primary))] shadow-sm'
                                                : 'border-[var(--color-fulfillment-option-border,var(--color-border))] bg-[var(--color-fulfillment-option-bg,var(--color-card-bg))] text-[var(--color-fulfillment-option-text,var(--color-text-subtitle))] hover:border-[var(--color-fulfillment-option-hover-border,rgba(var(--color-brand-primary-rgb),0.3))] hover:bg-[var(--color-fulfillment-option-hover-bg,var(--color-bg-subtle))]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🥡</span>
                                                <div className="text-left">
                                                    <div className="font-bold">Pick-up / Para Llevar</div>
                                                    <div className="text-sm opacity-80">Lo pasas buscando</div>
                                                </div>
                                            </div>
                                            {selectedMethod === 'pickup' && (
                                                <div className="w-6 h-6 rounded-full bg-[var(--color-fulfillment-check-bg,var(--color-brand-primary))] text-[var(--color-fulfillment-check-icon,white)] flex items-center justify-center animate-in fade-in zoom-in duration-200">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )}

                                    {config.hasDelivery && (
                                        <button
                                            onClick={() => setSelectedMethod('delivery')}
                                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedMethod === 'delivery'
                                                ? 'border-[var(--color-fulfillment-option-selected-border,var(--color-brand-primary))] bg-[var(--color-fulfillment-option-selected-bg,rgba(var(--color-brand-primary-rgb),0.05))] text-[var(--color-fulfillment-option-selected-text,var(--color-brand-primary))] shadow-sm'
                                                : 'border-[var(--color-fulfillment-option-border,var(--color-border))] bg-[var(--color-fulfillment-option-bg,var(--color-card-bg))] text-[var(--color-fulfillment-option-text,var(--color-text-subtitle))] hover:border-[var(--color-fulfillment-option-hover-border,rgba(var(--color-brand-primary-rgb),0.3))] hover:bg-[var(--color-fulfillment-option-hover-bg,var(--color-bg-subtle))]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🛵</span>
                                                <div className="text-left">
                                                    <div className="font-bold">Delivery</div>
                                                    <div className="text-sm opacity-80">Te lo enviamos</div>
                                                </div>
                                            </div>
                                            {selectedMethod === 'delivery' && (
                                                <div className="w-6 h-6 rounded-full bg-[var(--color-fulfillment-check-bg,var(--color-brand-primary))] text-[var(--color-fulfillment-check-icon,white)] flex items-center justify-center animate-in fade-in zoom-in duration-200">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm mt-3 text-center animate-pulse">
                                        {error}
                                    </p>
                                )}

                                <div className="flex w-full gap-3 mt-6">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold border border-[var(--color-fulfillment-cancel-btn-border,var(--color-border))] text-[var(--color-fulfillment-cancel-btn-text,var(--color-text-subtitle))] hover:bg-[var(--color-bg-subtle)] transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!selectedMethod}
                                        className="flex-2 py-3 px-4 rounded-xl font-bold bg-[var(--color-fulfillment-confirm-btn-bg,var(--color-brand-primary))] text-[var(--color-fulfillment-confirm-btn-text,white)] hover:brightness-110 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
