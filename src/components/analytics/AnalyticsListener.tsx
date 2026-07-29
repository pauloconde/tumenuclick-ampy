/**
 * AnalyticsListener.tsx
 *
 * Componente React "headless" (sin interfaz visual) que actúa como observador
 * reactivo del estado del carrito y del modo de pedido. Su única responsabilidad
 * es disparar eventos de analítica hacia GA4 cuando se cumplen ciertas condiciones
 * de negocio, sin renderizar ningún elemento en el DOM.
 *
 * ¿Por qué es un componente React y no un simple script?
 * ─────────────────────────────────────────────────────
 * Porque necesita suscribirse a stores de Nanostores (`$cart`, `$cartTotal`,
 * `$isOrderMode`) de forma reactiva. Cada vez que alguno de esos valores cambia,
 * React re-ejecuta los efectos y puede decidir si debe disparar un nuevo evento.
 *
 * Evento rastreado:
 * ─────────────────
 * • `begin_checkout` → Se dispara UNA SOLA VEZ por sesión cuando:
 *     1. El carrito contiene al menos un producto.
 *     2. El modo de orden (order mode) está activo.
 *   Se usa `sessionStorage` como bandera de control para evitar duplicados
 *   dentro de la misma sesión de navegación.
 *
 * Uso:
 * ────
 * Montar este componente dentro del layout principal (e.g. Layout.astro) para que
 * esté siempre activo mientras el usuario navega por el menú.
 *
 * Dependencias:
 * ─────────────
 * • react / useEffect, useStore (@nanostores/react)
 * • $cart, $cartTotal  → stores del carrito (cartStore.ts)
 * • $isOrderMode       → store del modo de orden (orderModeStore.ts)
 * • window.trackOrderEvent → función global expuesta por GA4Script.astro
 */

import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartTotal } from '../../stores/cartStore';
import { $isOrderMode } from '../../stores/orderModeStore';

export default function AnalyticsListener() {
    // Suscripción reactiva a los stores globales de Nanostores.
    // Cada vez que alguno cambie, React re-renderiza este componente
    // y los efectos vuelven a evaluarse.
    const items = useStore($cart);           // Array de productos en el carrito
    const isOrderMode = useStore($isOrderMode); // true cuando el modo pedido está activo
    const total = useStore($cartTotal);      // Suma total del carrito (número)

    useEffect(() => {
        // Efecto vacío reservado para futura inicialización que deba ejecutarse
        // sólo una vez al montar el componente (dependencias vacías).
        // Flag to track if we've fired for the current session state
        // We use a ref concept here but since we want to persist across renders 
        // until logic resets it, local var in useEffect closure + deps is tricky.
        // Actually, we can just use a module-level variable or a ref, BUT
        // simplest is to implement the same logic cleanly inside the effect.
    }, []);

    // We need a robust way to track "Fire Once per Session" without using module constants that leak.
    // Let's use a standard useEffect that runs when dependencies change.

    useEffect(() => {
        // ── Guardia: GA4 debe estar disponible ──────────────────────────────────
        // `window.trackOrderEvent` es inyectada por GA4Script.astro al cargar la página.
        // Si aún no está lista (SSR, carga parcial), salimos sin hacer nada.
        if (typeof window === 'undefined' || !window.trackOrderEvent) return;

        const hasItems = items.length > 0;

        // ── Control de duplicados con sessionStorage ─────────────────────────────
        // Usamos sessionStorage (persiste durante la pestaña, se borra al cerrar)
        // para asegurarnos de que el evento `begin_checkout` sólo se dispare
        // una vez por sesión, aunque el usuario cambie de sección o recargue.
        const SESSION_KEY = 'ga4_checkout_began';
        const hasFired = sessionStorage.getItem(SESSION_KEY) === 'true';

        // ── Reset cuando el carrito se vacía ─────────────────────────────────────
        // Si el usuario elimina todos los productos, limpiamos la bandera para
        // que el próximo ciclo de compra pueda volver a disparar el evento.
        if (!hasItems) {
            if (hasFired) sessionStorage.removeItem(SESSION_KEY);
            return;
        }

        // ── Disparo del evento begin_checkout ────────────────────────────────────
        // Condiciones que deben cumplirse simultáneamente:
        //   • isOrderMode === true  → el usuario está en modo pedido
        //   • hasItems === true     → hay productos en el carrito
        //   • !hasFired             → el evento no se ha disparado aún en esta sesión
        if (isOrderMode && hasItems && !hasFired) {
            // Delegamos el envío real a GA4 en la función global de GA4Script.astro
            window.trackOrderEvent('begin_checkout', [...items], total);
            // Marcamos la bandera para no volver a disparar en esta sesión
            sessionStorage.setItem(SESSION_KEY, 'true');
        }

    }, [items.length, isOrderMode, total]); // El efecto se re-evalúa cuando cambia
                                             // el número de ítems, el modo o el total

    // Componente headless: no renderiza nada en el DOM
    return null;
}
