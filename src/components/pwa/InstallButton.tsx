import { useEffect, useState } from 'react';
import { IconIOS, IconMobile, IconDesktop } from './InstallIcons';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // 1. Check if already installed (standalone mode)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        // 2. Detect iOS and Mobile
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

        setIsIOS(isIosDevice);
        setIsMobile(isMobileDevice);

        // 3. Listen for deferred prompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Handler for Android/Desktop install
    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    // Handler for iOS click
    const handleIOSClick = () => {
        setShowIOSModal(!showIOSModal);
    };

    // If already installed or not mounted yet, render nothing
    if (!isMounted || isStandalone) return null;

    // Decide if we should show the button
    // Show if we have a deferred prompt (Android/PC) OR if it's iOS
    const shouldShowButton = !!deferredPrompt || isIOS;

    if (!shouldShowButton) return null;

    const iconClass = "w-6 h-6 fill-[var(--color-footer-btn-text)] text-[var(--color-footer-btn-text)] group-hover:text-[var(--color-footer-btn-text)]";

    return (
        <div className="relative inline-block">
            {/* Main Install Button */}
            <button
                onClick={isIOS ? handleIOSClick : handleInstallClick}
                className="bg-[var(--color-footer-btn-bg)] p-3 rounded-full hover:bg-[var(--color-footer-btn-hover)] transition-colors duration-300 group flex items-center justify-center text-[var(--color-footer-btn-text)] cursor-pointer px-6"
                aria-label={isIOS ? "Instalar en iPhone" : "Instalar aplicación"}
                title={isIOS ? "Instalar en iPhone" : "Instalar App"}
            >
                {isIOS ? (
                    <IconIOS className={iconClass} />
                ) : isMobile ? (
                    <IconMobile className={iconClass} />
                ) : (
                    <IconDesktop className={iconClass} />
                )}

                <span className="ml-2 text-sm font-medium">Instalar App</span>
            </button>

            {/* iOS Instructions Modal/Tooltip */}
            {showIOSModal && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setShowIOSModal(false)}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white p-4 rounded-xl shadow-xl z-50 text-gray-800 border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
                        {/* Arrow pointing down */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-200"></div>

                        <div className="relative flex flex-col gap-3">
                            <button
                                onClick={() => setShowIOSModal(false)}
                                className="absolute -top-2 -right-2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                ✕
                            </button>

                            <h3 className="font-bold text-lg leading-tight text-center text-[var(--color-footer-bg)]">
                                Instalar App
                            </h3>

                            <p className="text-sm text-center leading-relaxed">
                                Para instalar, toca el icono de <span className="font-bold">Compartir</span> <span className="inline-block align-middle"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg></span> y luego selecciona <span className="font-bold">"Agregar a inicio"</span>.
                            </p>

                            <div className="text-center text-xs text-gray-400 mt-1">
                                Puede que necesites deslizar hacia abajo en el menú de compartir.
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
