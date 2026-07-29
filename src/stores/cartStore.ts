/**
 * Cart Store - Global state management for the shopping cart
 * Uses Nano Stores for lightweight, framework-agnostic state
 */
import { atom, computed } from 'nanostores';

declare global {
    interface Window {
        trackOrderEvent: (eventName: string, items: any[], value?: number, transactionId?: string) => void;
    }
}

// Types
export interface CartExtra {
    name: string;
    price: number;
    quantity?: number;
}

export interface CartItem {
    uniqueId: string;        // productSlug + selectedExtras hash
    productSlug: string;     // From Sanity
    name: string;
    unitPrice: number;       // Base price
    quantity: number;
    extras: CartExtra[];     // Selected extras
    sectionName: string;     // For grouping in WhatsApp message
    imageUrl?: string;       // For cart display
    notes?: string;          // Customer's custom notes
}

interface CartState {
    items: readonly CartItem[];
    createdAt: number;       // Timestamp for TTL
}

// Constants
const STORAGE_KEY = 'tumenuclick-cart';
const TTL_HOURS = 3;
const TTL_MS = TTL_HOURS * 60 * 60 * 1000;

// Helper: Generate unique ID based on product + extras + notes
export function generateUniqueId(productSlug: string, extras: CartExtra[], notes?: string): string {
    const sortedExtras = [...extras].sort((a, b) => a.name.localeCompare(b.name));
    const extrasHash = sortedExtras.map(e => e.name).join('|');
    const baseId = extrasHash ? `${productSlug}::${extrasHash}` : productSlug;
    const cleanNotes = notes?.trim().toLowerCase() || '';
    return cleanNotes ? `${baseId}::notes::${cleanNotes}` : baseId;
}

// Helper: Calculate item subtotal
export function calculateItemSubtotal(item: CartItem): number {
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price, 0);
    return (item.unitPrice + extrasTotal) * item.quantity;
}

// Load initial state from localStorage
function loadFromStorage(): CartState {
    if (typeof window === 'undefined') {
        return { items: [], createdAt: Date.now() };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { items: [], createdAt: Date.now() };

        const state: CartState = JSON.parse(stored);

        // Check TTL
        if (Date.now() - state.createdAt > TTL_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return { items: [], createdAt: Date.now() };
        }

        return state;
    } catch {
        return { items: [], createdAt: Date.now() };
    }
}

// Save to localStorage
function saveToStorage(state: CartState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Create the store
const initialState = loadFromStorage();
export const $cart = atom<CartItem[]>([...initialState.items]);
const cartCreatedAt = atom<number>(initialState.createdAt);

// Subscribe to changes and persist
$cart.subscribe((items) => {
    saveToStorage({ items, createdAt: cartCreatedAt.get() });
});

// Computed values
export const $cartTotal = computed($cart, (items) => {
    return items.reduce((total, item) => total + calculateItemSubtotal(item), 0);
});

export const $cartItemCount = computed($cart, (items) => {
    return items.reduce((count, item) => count + item.quantity, 0);
});

export const $isCartEmpty = computed($cart, (items) => items.length === 0);

// Actions
export function addToCart(item: Omit<CartItem, 'uniqueId' | 'quantity'>, quantity: number = 1): void {
    const uniqueId = generateUniqueId(item.productSlug, item.extras, item.notes);
    const currentItems = $cart.get();

    const existingIndex = currentItems.findIndex(i => i.uniqueId === uniqueId);
    let newItem: CartItem | undefined;

    if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...currentItems];
        updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
        };
        $cart.set(updated);
    } else {
        // Add new item
        newItem = {
            ...item,
            uniqueId,
            quantity
        };
        $cart.set([...currentItems, newItem]);
    }

    // Reset TTL on activity
    cartCreatedAt.set(Date.now());

    // GA4 Tracking: add_to_cart
    if (typeof window !== 'undefined' && window.trackOrderEvent) {
        // Construct a single-item array for the event
        const trackedItem: CartItem = existingIndex >= 0
            ? { ...currentItems[existingIndex], quantity: quantity } // Track only the added quantity
            : { ...newItem!, quantity: quantity };

        window.trackOrderEvent('add_to_cart', [trackedItem], trackedItem.unitPrice * quantity);
    }
}

// Get total quantity for a product across all its variants (with/without extras)
export function getTotalQuantityBySlug(productSlug: string): number {
    const items = $cart.get();
    return items
        .filter(item => item.productSlug === productSlug)
        .reduce((total, item) => total + item.quantity, 0);
}

export function removeFromCart(uniqueId: string): void {
    const currentItems = $cart.get();
    $cart.set(currentItems.filter(item => item.uniqueId !== uniqueId));
}

export function updateQuantity(uniqueId: string, quantity: number): void {
    if (quantity <= 0) {
        removeFromCart(uniqueId);
        return;
    }

    const currentItems = $cart.get();
    const existingIndex = currentItems.findIndex(i => i.uniqueId === uniqueId);

    if (existingIndex >= 0) {
        const existingItem = currentItems[existingIndex];
        const quantityDiff = quantity - existingItem.quantity;

        // Update Store
        const updated = [...currentItems];
        updated[existingIndex] = { ...existingItem, quantity };
        $cart.set(updated);

        // Reset TTL
        cartCreatedAt.set(Date.now());

        // GA4 Tracking: add_to_cart (Only if quantity increased)
        if (quantityDiff > 0 && typeof window !== 'undefined' && window.trackOrderEvent) {
            const trackedItem = { ...existingItem, quantity: quantityDiff };
            window.trackOrderEvent('add_to_cart', [trackedItem], trackedItem.unitPrice * quantityDiff);
        }
    }
}

export function incrementQuantity(uniqueId: string): void {
    const currentItems = $cart.get();
    const item = currentItems.find(i => i.uniqueId === uniqueId);
    if (item) {
        updateQuantity(uniqueId, item.quantity + 1);
    }
}

export function decrementQuantity(uniqueId: string): void {
    const currentItems = $cart.get();
    const item = currentItems.find(i => i.uniqueId === uniqueId);
    if (item) {
        updateQuantity(uniqueId, item.quantity - 1);
    }
}

export function clearCart(): void {
    $cart.set([]);
    cartCreatedAt.set(Date.now());
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export function getItemQuantityInCart(productSlug: string, extras: CartExtra[]): number {
    const uniqueId = generateUniqueId(productSlug, extras);
    const item = $cart.get().find(i => i.uniqueId === uniqueId);
    return item?.quantity ?? 0;
}
