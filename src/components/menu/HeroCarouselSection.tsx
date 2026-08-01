import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../lib/imageUrl';
import { openProductModal } from '../cart/CartWrapper';

export interface HeroItem {
    title?: string;
    thumbnail?: any;
    thumbVideoFileUrl?: string;
    mediaType: 'video' | 'image';
    videoFileUrl?: string;
    videoUrl?: string;
    fullImage?: any;
    linkedProduct?: any;
}

interface HeroCarouselSectionProps {
    items: HeroItem[];
    currencySymbol?: string;
}

export default function HeroCarouselSection({
    items,
    currencySymbol = '$'
}: HeroCarouselSectionProps) {
    if (!items || items.length === 0) return null;

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const activeItem = selectedIndex !== null ? items[selectedIndex] : null;

    useEffect(() => {
        if (activeItem && activeItem.mediaType === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            setIsMuted(false);
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => {
                // Si el navegador bloquea autoplay con sonido, fallback a muted
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                    videoRef.current.play().catch(() => {});
                }
            });
            setIsPlaying(true);
        }
    }, [selectedIndex]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % items.length);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
        }
    };

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleOpenLinkedProduct = (e: React.MouseEvent, product: any) => {
        e.stopPropagation();
        if (!product) return;

        const imageUrl = getImageUrl(product.imgSrc, 800);
        openProductModal({
            name: product.name,
            slug: product.slug,
            price: product.price,
            price2: product.price2,
            price3: product.price3,
            description: product.description,
            image: getImageUrl(product.imgSrc, 1080, { quality: 100 }),
            placeholderImage: imageUrl,
            currency: currencySymbol,
            protein: product.protein,
            extras: product.extras,
            extrasMin: product.extrasMin,
            extrasIncluded: product.extrasIncluded,
            extrasMax: product.extrasMax,
            extrasTitleSingular: product.extrasTitleSingular,
            extrasTitlePlural: product.extrasTitlePlural,
            optionGroups: product.optionGroups,
            variantGroups: product.variantGroups,
            optionGroupsRefs: product.optionGroupsRefs,
            extraGroupsRefs: product.extraGroupsRefs
        });
    };

    // Duplicamos el array para lograr un bucle infinito contínuo y fluido (Marquee)
    const repeatCount = 4;
    const displayItems = Array(repeatCount).fill(items).flat();
    const shiftPercentage = -(100 / repeatCount);

    return (
        <section className="w-full bg-black py-0">
            {/* Carrusel superior: ~20% alto de pantalla en móvil (20vh min-h 140px) */}
            <div className="w-full overflow-hidden h-[20vh] min-h-[140px] max-h-[200px] md:h-48 md:max-h-none bg-black">
                <motion.div
                    className="flex gap-0 h-full w-max cursor-pointer"
                    animate={{ x: ["0%", `${shiftPercentage}%`] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: Math.max(12, items.length * 3.5),
                            ease: "linear",
                        },
                    }}
                >
                    {displayItems.map((item, displayIndex) => {
                        const realIndex = displayIndex % items.length;
                        const thumbUrl = item.thumbnail ? getImageUrl(item.thumbnail, 400) : '';
                        return (
                            <div
                                key={displayIndex}
                                onClick={() => setSelectedIndex(realIndex)}
                                className="aspect-square h-full shrink-0 relative overflow-hidden bg-black border-0 rounded-none shadow-none"
                            >
                                {item.thumbVideoFileUrl ? (
                                    <video
                                        src={item.thumbVideoFileUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover rounded-none border-0 shadow-none pointer-events-none"
                                    />
                                ) : (
                                    <img
                                        src={thumbUrl}
                                        alt={`Hero item ${realIndex + 1}`}
                                        className="w-full h-full object-cover rounded-none border-0 shadow-none"
                                        loading="eager"
                                    />
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Modal Overlay Pantalla Completa (Zoom In & Player) */}
            <AnimatePresence>
                {selectedIndex !== null && activeItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedIndex(null)}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none"
                    >
                        {/* Top Bar: Progress & Close Button */}
                        <div className="w-full max-w-2xl mx-auto flex items-center justify-between z-10 pt-2 px-2">
                            {/* Stories Indicators */}
                            <div className="flex gap-1.5 flex-1 mr-4">
                                {items.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                            i === selectedIndex
                                                ? 'bg-white'
                                                : i < selectedIndex
                                                ? 'bg-white/60'
                                                : 'bg-white/20'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedIndex(null)}
                                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-colors"
                                aria-label="Cerrar"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Central Container: Zoomed Content */}
                        <div className="relative flex-1 flex items-center justify-center my-auto w-full max-w-3xl mx-auto px-2">
                            <motion.div
                                layoutId={`hero-item-${selectedIndex}`}
                                className="relative w-full flex items-center justify-center max-h-[75vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {activeItem.mediaType === 'video' ? (
                                    <div className="relative flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl max-h-[75vh] w-auto">
                                        <video
                                            ref={videoRef}
                                            src={activeItem.videoFileUrl || activeItem.videoUrl}
                                            autoPlay
                                            loop
                                            playsInline
                                            muted={isMuted}
                                            className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain bg-black"
                                        />

                                        {/* Botones Flotantes de Control de Video */}
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            <button
                                                onClick={toggleMute}
                                                className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-colors shadow-lg"
                                                title={isMuted ? 'Activar sonido' : 'Mutear'}
                                            >
                                                {isMuted ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                    </svg>
                                                )}
                                            </button>

                                            <button
                                                onClick={togglePlay}
                                                className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-colors shadow-lg"
                                                title={isPlaying ? 'Pausar' : 'Reproducir'}
                                            >
                                                {isPlaying ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={
                                            activeItem.fullImage
                                                ? getImageUrl(activeItem.fullImage, 1200, { quality: 95 })
                                                : getImageUrl(activeItem.thumbnail, 1200, { quality: 95 })
                                        }
                                        alt={activeItem.title || 'Vista completa'}
                                        className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
                                    />
                                )}
                            </motion.div>

                            {/* Flechas de Navegación Lateral (Si hay múltiples ítems) */}
                            {items.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors z-20"
                                        aria-label="Anterior"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors z-20"
                                        aria-label="Siguiente"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Bottom Bar: Título y Producto Vinculado */}
                        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 z-10 pb-4 px-2" onClick={(e) => e.stopPropagation()}>
                            {activeItem.title && (
                                <h3 className="text-white text-lg font-bold text-center drop-shadow-md">
                                    {activeItem.title}
                                </h3>
                            )}

                            {activeItem.linkedProduct && (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={(e) => handleOpenLinkedProduct(e, activeItem.linkedProduct)}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl flex items-center justify-between gap-3 border border-white/20 backdrop-blur-md"
                                >
                                    <span className="flex items-center gap-2 text-sm md:text-base">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Ver {activeItem.linkedProduct.name}
                                    </span>
                                    <span className="bg-black/20 py-1 px-2.5 rounded-lg text-sm font-extrabold">
                                        {currencySymbol}{activeItem.linkedProduct.price}
                                    </span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
