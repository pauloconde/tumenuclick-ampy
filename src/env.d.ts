/// <reference types="astro/client" />

interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    trackMenuClick: (slug: string, name: string, sectionName: string) => void;
    trackOrderEvent: (eventName: string, items: any[], value?: number, transactionId?: string) => void;
}
