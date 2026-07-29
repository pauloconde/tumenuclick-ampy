/**
 * Order Mode Store
 * El modo de orden está siempre activo. Este store se mantiene para compatibilidad
 * con el sistema de nanostores y para futura reactividad si fuera necesaria.
 */
import { atom } from 'nanostores';

// Siempre true — el modo menú (catálogo) fue eliminado
export const $isOrderMode = atom<boolean>(true);

// Funciones mantenidas como no-ops para compatibilidad con imports existentes
// El modo pedido es permanente — estas funciones no tienen efecto
export const enableOrderMode = () => {};
export const disableOrderMode = () => {};
export const toggleOrderMode = () => {};

declare global {
    interface Window {
        trackOrderEvent: (eventName: string, items: any[], value?: number, transactionId?: string) => void;
    }
}

// Reactive Analytics has been moved to src/components/analytics/AnalyticsListener.tsx
// to avoid HMR duplicate listener issues and better lifecycle management.
