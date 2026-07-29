/**
 * WhatsApp Message Formatter
 * Converts cart items to a formatted WhatsApp message URL
 */
import type { CartItem, CartExtra } from '../stores/cartStore';
import { calculateItemSubtotal } from '../stores/cartStore';

interface FormatOptions {
    currency: string;
    phone: string;
    restaurantName?: string;
    footerText?: string;
    fulfillmentMethod?: 'delivery' | 'pickup' | 'dine-in';
    tableNumber?: string;
}

/**
 * Format extras list as readable text
 */
function formatExtras(extras: CartExtra[], currency: string): string {
    if (extras.length === 0) return '';
    return extras
        .map(e => {
            if (e.price === 0) {
                return `   + ${e.name}`;
            }
            return `   + ${e.name} (${currency}${e.price.toFixed(2)})`;
        })
        .join('\n');
}

/**
 * Format a single cart item
 */
function formatCartItem(item: CartItem, currency: string): string {
    const extraLines = formatExtras(item.extras, currency);
    const subtotal = calculateItemSubtotal(item);

    let text = `${item.quantity}x ${item.name}`;
    if (extraLines) {
        text += '\n' + extraLines;
    }
    if (item.notes && item.notes.trim()) {
        text += `\n   📝 Obs: "${item.notes.trim()}"`;
    }
    text += `\n   Subtotal: ${currency}${subtotal.toFixed(2)}`;

    return text;
}

/**
 * Format entire cart to WhatsApp message
 */
export function formatCartToWhatsApp(
    items: CartItem[],
    total: number,
    options: FormatOptions
): string {
    const { currency, restaurantName, footerText, fulfillmentMethod, tableNumber } = options;

    const header = restaurantName
        ? `*🛍️ NUEVO PEDIDO - ${restaurantName}*`
        : '*🛍️ NUEVO PEDIDO*';

    const separator = '────────────────';

    const itemsText = items.map(item => formatCartItem(item, currency)).join('\n\n');

    const footer = `*TOTAL: ${currency}${total.toFixed(2)}*`;

    // Fulfillment Details
    let fulfillmentText = '';
    if (fulfillmentMethod) {
        const methodMap = {
            'delivery': '🛵 Delivery',
            'pickup': '🥡 Para Llevar (Pickup)',
            'dine-in': '🍽️ Comer en el Local'
        };
        fulfillmentText = `\n*Tipo de Entrega:* ${methodMap[fulfillmentMethod]}`;

        if (fulfillmentMethod === 'dine-in' && tableNumber) {
            fulfillmentText += `\n*Mesa:* ${tableNumber}`;
        }
    }

    const message = [
        header,
        separator,
        itemsText,
        separator,
        footer,
        fulfillmentText,
        '',
        footerText || '_Enviado desde el TuMenú.click_'
    ].filter(line => line !== '').join('\n'); // Filter empty strings to avoid extra newlines if fulfillmentText is empty

    return message;
}

/**
 * Generate WhatsApp URL with encoded message
 */
export function generateWhatsAppUrl(
    items: CartItem[],
    total: number,
    options: FormatOptions
): string {
    const message = formatCartToWhatsApp(items, total, options);
    const encodedMessage = encodeURIComponent(message);

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = options.phone.replace(/[^\d+]/g, '');

    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp with the cart message
 */
export function sendToWhatsApp(
    items: CartItem[],
    total: number,
    options: FormatOptions
): void {
    const url = generateWhatsAppUrl(items, total, options);
    window.open(url, '_blank');
}
