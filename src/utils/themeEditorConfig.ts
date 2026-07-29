/**
 * Theme Editor Configuration
 * 
 * Mapeo bidireccional entre variables CSS y campos de Sanity
 * Configuración del canal de comunicación BroadcastChannel
 */

// BroadcastChannel name
export const THEME_CHANNEL_NAME = 'menu_theme_editor';

// Message types for BroadcastChannel
export const MESSAGE_TYPES = {
    REQUEST_INITIAL_STATE: 'REQUEST_INITIAL_STATE',
    INITIAL_STATE: 'INITIAL_STATE',
    UPDATE_COLOR: 'UPDATE_COLOR',
    RESET_THEME: 'RESET_THEME',
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

export interface ThemeMessage {
    type: MessageType;
    payload?: any;
}

export interface ColorUpdatePayload {
    variable: string;
    value: string;
}

export interface InitialStatePayload {
    colors: Record<string, string>;
}

// Category definitions with CSS variable to Sanity field mapping
export interface ColorVariable {
    cssVar: string;
    sanityPath: string; // e.g., "themeApplication.bgMain"
    label: string;
}

export interface ThemeCategory {
    id: string;
    title: string;
    icon: string;
    colors: ColorVariable[];
}

export const THEME_CATEGORIES: ThemeCategory[] = [
    // ========== FONDOS Y APARIENCIA GENERAL ==========
    {
        id: 'backgrounds',
        title: 'Fondos Base',
        icon: '🎨',
        colors: [
            { cssVar: '--color-bg-main', sanityPath: 'themeApplication.bgMain', label: 'Fondo Principal' },
            { cssVar: '--color-content-bg', sanityPath: 'themeApplication.contentBg', label: 'Fondo de Contenido *' },
            { cssVar: '--color-menu-item-bg', sanityPath: 'themeApplication.menuItemBg', label: 'Fondo Items Menú' },
            { cssVar: '--color-menu-item-border', sanityPath: 'themeApplication.menuItemBorder', label: 'Borde Items Menú' },
            { cssVar: '--color-overlay-curtain', sanityPath: 'themeUI.overlayCurtain', label: 'Overlay Transición' },
            { cssVar: '--color-product-bg', sanityPath: 'themeApplication.productBackgroundColor', label: 'Fondo Imgs Productos' },
        ],
    },
    {
        id: 'typography',
        title: 'Tipografía',
        icon: '✍️',
        colors: [
            { cssVar: '--color-text-title', sanityPath: 'themeApplication.textTitle', label: 'Títulos Principales' },
            { cssVar: '--color-text-subtitle', sanityPath: 'themeApplication.textSubtitle', label: 'Subtítulos' },
            { cssVar: '--color-text-section', sanityPath: 'themeApplication.textSection', label: 'Títulos de Secciones' },
            { cssVar: '--color-text-price', sanityPath: 'themeApplication.textPrice', label: 'Precios' },
        ],
    },
    {
        id: 'floatingButtons',
        title: 'Botones Flotantes',
        icon: '🔘',
        colors: [
            { cssVar: '--color-topbutton-bg', sanityPath: 'themeUI.topButtonBg', label: 'Btn Arriba - Fondo' },
            { cssVar: '--color-topbutton-icon', sanityPath: 'themeUI.topButtonIcon', label: 'Btn Arriba - Icono' },
            { cssVar: '--color-whatsapp-bg', sanityPath: 'themeUI.whatsappButtonBg', label: 'WhatsApp - Fondo' },
            { cssVar: '--color-whatsapp-icon', sanityPath: 'themeUI.whatsappButtonIcon', label: 'WhatsApp - Icono' },
            { cssVar: '--color-back-btn-bg', sanityPath: 'themeUI.backBtnBg', label: 'Btn Volver - Fondo' },
            { cssVar: '--color-back-btn-text', sanityPath: 'themeUI.backBtnText', label: 'Btn Volver - Texto' },
        ],
    },
    // ========== SECCIONES ESPECÍFICAS ==========
    {
        id: 'navbar',
        title: 'Navbar',
        icon: '📍',
        colors: [
            { cssVar: '--color-navbar-bg', sanityPath: 'themeNavbar.bg', label: 'Fondo' },
            { cssVar: '--color-navbar-text', sanityPath: 'themeNavbar.text', label: 'Texto General' },
            { cssVar: '--color-navbar-border', sanityPath: 'themeNavbar.border', label: 'Bordes' },
            { cssVar: '--color-navbar-logo-bg', sanityPath: 'themeNavbar.logoBg', label: 'Logo - Fondo' },
            { cssVar: '--color-navbar-logo-text', sanityPath: 'themeNavbar.logoText', label: 'Logo - Texto' },
            { cssVar: '--color-navbar-select-bg', sanityPath: 'themeNavbar.selectBg', label: 'Selector - Fondo' },
            { cssVar: '--color-navbar-select-border', sanityPath: 'themeNavbar.selectBorder', label: 'Selector - Borde' },
            { cssVar: '--color-navbar-select-text', sanityPath: 'themeNavbar.selectText', label: 'Selector - Texto' },
            { cssVar: '--color-navbar-select-icon', sanityPath: 'themeNavbar.selectIcon', label: 'Selector - Icono' },
            { cssVar: '--color-navbar-select-option-bg', sanityPath: 'themeNavbar.selectOptionBg', label: 'Opciones - Fondo' },
            { cssVar: '--color-navbar-select-option-text', sanityPath: 'themeNavbar.selectOptionText', label: 'Opciones - Texto' },
            { cssVar: '--color-navbar-select-option-hover-bg', sanityPath: 'themeNavbar.selectOptionHoverBg', label: 'Opciones Hover - Fondo' },
            { cssVar: '--color-navbar-select-option-hover-text', sanityPath: 'themeNavbar.selectOptionHoverText', label: 'Opciones Hover - Texto' },
        ],
    },
    {
        id: 'bestsellers',
        title: 'Best Sellers',
        icon: '⭐',
        colors: [
            { cssVar: '--color-bestsellers-bg', sanityPath: 'themeBestSellers.bg', label: 'Fondo Sección' },
            { cssVar: '--color-bestsellers-text-title', sanityPath: 'themeBestSellers.textTitle', label: 'Título' },
            { cssVar: '--color-bestsellers-card-bg', sanityPath: 'themeBestSellers.cardBg', label: 'Card - Fondo' },
            { cssVar: '--color-bestsellers-text-name', sanityPath: 'themeBestSellers.textName', label: 'Card - Nombre' },
            { cssVar: '--color-bestsellers-text-price', sanityPath: 'themeBestSellers.textPrice', label: 'Card - Precio' },
            { cssVar: '--color-bestsellers-scrollbar-thumb', sanityPath: 'themeBestSellers.scrollbarThumb', label: 'Scrollbar - Thumb' },
            { cssVar: '--color-bestsellers-scrollbar-track', sanityPath: 'themeBestSellers.scrollbarTrack', label: 'Scrollbar - Track' },
        ],
    },
    {
        id: 'seasonal',
        title: 'Especiales de Temporada',
        icon: '🌟',
        colors: [
            { cssVar: '--color-seasonal-bg', sanityPath: 'themeSeasonal.bg', label: 'Fondo Sección' },
            { cssVar: '--color-seasonal-subtitle', sanityPath: 'themeSeasonal.subtitle', label: 'Subtítulo' },
            { cssVar: '--color-seasonal-text-title', sanityPath: 'themeSeasonal.textTitle', label: 'Título' },
            { cssVar: '--color-seasonal-text-subtitle', sanityPath: 'themeSeasonal.textSubtitle', label: 'Texto Descriptivo' },
            { cssVar: '--color-seasonal-card-bg', sanityPath: 'themeSeasonal.cardBg', label: 'Card - Fondo' },
            { cssVar: '--color-seasonal-text-name', sanityPath: 'themeSeasonal.textName', label: 'Card - Nombre' },
            { cssVar: '--color-seasonal-text-price', sanityPath: 'themeSeasonal.textPrice', label: 'Card - Precio' },
            { cssVar: '--color-seasonal-scrollbar-thumb', sanityPath: 'themeSeasonal.scrollbarThumb', label: 'Scrollbar - Thumb' },
            { cssVar: '--color-seasonal-scrollbar-track', sanityPath: 'themeSeasonal.scrollbarTrack', label: 'Scrollbar - Track' },
        ],
    },
    {
        id: 'extras',
        title: 'Extras',
        icon: '➕',
        colors: [
            { cssVar: '--color-extras-bg', sanityPath: 'themeExtras.bg', label: 'Fondo' },
            { cssVar: '--color-extras-border', sanityPath: 'themeExtras.border', label: 'Borde' },
            { cssVar: '--color-extras-text', sanityPath: 'themeExtras.text', label: 'Texto' },
            { cssVar: '--color-extras-price', sanityPath: 'themeExtras.price', label: 'Precio' },
        ],
    },
    {
        id: 'modal',
        title: 'Modal de Detalles',
        icon: '📄',
        colors: [
            { cssVar: '--color-modal-overlay', sanityPath: 'themeModal.overlay', label: 'Overlay' },
            { cssVar: '--color-modal-bg', sanityPath: 'themeModal.bg', label: 'Fondo' },
            { cssVar: '--color-modal-gradient-from', sanityPath: 'themeModal.gradientFrom', label: 'Gradiente' },
            { cssVar: '--color-modal-title-overlay', sanityPath: 'themeModal.titleOverlay', label: 'Título sobre Imagen' },
            { cssVar: '--color-modal-close-bg', sanityPath: 'themeModal.closeBg', label: 'Btn Cerrar - Fondo' },
            { cssVar: '--color-modal-close-hover', sanityPath: 'themeModal.closeHover', label: 'Btn Cerrar - Hover' },
            { cssVar: '--color-modal-close-icon', sanityPath: 'themeModal.closeIcon', label: 'Btn Cerrar - Icono' },
            { cssVar: '--color-modal-price-bg', sanityPath: 'themeModal.priceBg', label: 'Badge Precio - Fondo' },
            { cssVar: '--color-modal-price-text', sanityPath: 'themeModal.priceText', label: 'Badge Precio - Texto' },
            { cssVar: '--color-modal-description', sanityPath: 'themeModal.description', label: 'Descripción' },
            { cssVar: '--color-modal-scrollbar-track', sanityPath: 'themeModal.scrollbarTrack', label: 'Scrollbar - Track' },
            { cssVar: '--color-modal-scrollbar-thumb', sanityPath: 'themeModal.scrollbarThumb', label: 'Scrollbar - Thumb' },
        ],
    },
    {
        id: 'footer',
        title: 'Footer',
        icon: '📌',
        colors: [
            { cssVar: '--color-footer-bg', sanityPath: 'themeFooter.bg', label: 'Fondo' },
            { cssVar: '--color-footer-text', sanityPath: 'themeFooter.text', label: 'Texto' },
            { cssVar: '--color-footer-accent', sanityPath: 'themeFooter.accent', label: 'Acentos' },
            { cssVar: '--color-footer-btn-bg', sanityPath: 'themeFooter.btnBg', label: 'Botón - Fondo' },
            { cssVar: '--color-footer-btn-text', sanityPath: 'themeFooter.btnText', label: 'Botón - Texto' },
            { cssVar: '--color-footer-btn-hover', sanityPath: 'themeFooter.btnHover', label: 'Botón - Hover' },
        ],
    },
    {
        id: 'subfooter',
        title: 'Subfooter',
        icon: '📎',
        colors: [
            { cssVar: '--color-subfooter-bg', sanityPath: 'themeSubfooter.bg', label: 'Fondo' },
            { cssVar: '--color-subfooter-text', sanityPath: 'themeSubfooter.text', label: 'Texto' },
        ],
    },
    // ========== SISTEMA DE PEDIDOS (SUBDIVIDIDO) ==========
    {
        id: 'orderingDesktop',
        title: 'Botón Pedidos Desktop',
        icon: '🖥️',
        colors: [
            { cssVar: '--color-btn-desktop-bg-inactive', sanityPath: 'themeOrdering.orderingBtnDesktopBgInactive', label: 'Fondo Inactivo' },
            { cssVar: '--color-btn-desktop-text-inactive', sanityPath: 'themeOrdering.orderingBtnDesktopTextInactive', label: 'Texto Inactivo' },
            { cssVar: '--color-btn-desktop-border-inactive', sanityPath: 'themeOrdering.orderingBtnDesktopBorderInactive', label: 'Borde Inactivo' },
            { cssVar: '--color-btn-desktop-bg-active', sanityPath: 'themeOrdering.orderingBtnDesktopBgActive', label: 'Fondo Activo' },
            { cssVar: '--color-btn-desktop-text-active', sanityPath: 'themeOrdering.orderingBtnDesktopTextActive', label: 'Texto Activo' },
            { cssVar: '--color-btn-desktop-border-active', sanityPath: 'themeOrdering.orderingBtnDesktopBorderActive', label: 'Borde Activo' },
            { cssVar: '--color-btn-desktop-bg-hover', sanityPath: 'themeOrdering.orderingBtnDesktopBgHover', label: 'Fondo Hover' },
            { cssVar: '--color-btn-desktop-text-hover', sanityPath: 'themeOrdering.orderingBtnDesktopTextHover', label: 'Texto Hover' },
            { cssVar: '--color-btn-desktop-border-hover', sanityPath: 'themeOrdering.orderingBtnDesktopBorderHover', label: 'Borde Hover' },
        ],
    },
    {
        id: 'orderingMobile',
        title: 'Botón Pedidos Móvil',
        icon: '📱',
        colors: [
            { cssVar: '--color-btn-mobile-bg-inactive', sanityPath: 'themeOrdering.orderingBtnMobileBgInactive', label: 'FAB - Fondo Inactivo' },
            { cssVar: '--color-btn-mobile-text-inactive', sanityPath: 'themeOrdering.orderingBtnMobileTextInactive', label: 'FAB - Icono Inactivo' },
            { cssVar: '--color-btn-mobile-bg-active', sanityPath: 'themeOrdering.orderingBtnMobileBgActive', label: 'FAB - Fondo Activo' },
            { cssVar: '--color-btn-mobile-text-active', sanityPath: 'themeOrdering.orderingBtnMobileTextActive', label: 'FAB - Icono Activo' },
            { cssVar: '--color-ordering-btn-badge-bg', sanityPath: 'themeOrdering.orderingBtnBadgeBg', label: 'Badge - Fondo' },
            { cssVar: '--color-ordering-btn-badge-text', sanityPath: 'themeOrdering.orderingBtnBadgeText', label: 'Badge - Texto' },
            { cssVar: '--color-mobile-cart-bar-bg', sanityPath: 'themeOrdering.mobileCartBarBg', label: 'Barra Móvil - Fondo' },
            { cssVar: '--color-mobile-cart-bar-item-count', sanityPath: 'themeOrdering.mobileCartBarItemCount', label: 'Barra Móvil - Contador' },
            { cssVar: '--color-mobile-cart-bar-total', sanityPath: 'themeOrdering.mobileCartBarTotal', label: 'Barra Móvil - Total' },
            { cssVar: '--color-mobile-cart-bar-btn-bg', sanityPath: 'themeOrdering.mobileCartBarBtnBg', label: 'Barra Móvil - Btn Fondo' },
            { cssVar: '--color-mobile-cart-bar-btn-text', sanityPath: 'themeOrdering.mobileCartBarBtnText', label: 'Barra Móvil - Btn Texto' },
        ],
    },
    {
        id: 'cart',
        title: 'Carrito',
        icon: '🛒',
        colors: [
            { cssVar: '--color-cart-bg', sanityPath: 'themeOrdering.cartBg', label: 'Fondo' },
            { cssVar: '--color-cart-header-bg', sanityPath: 'themeOrdering.cartHeaderBg', label: 'Header - Fondo' },
            { cssVar: '--color-cart-header-text', sanityPath: 'themeOrdering.cartHeaderText', label: 'Header - Texto' },
            { cssVar: '--color-cart-item-bg', sanityPath: 'themeOrdering.cartItemBg', label: 'Item - Fondo' },
            { cssVar: '--color-cart-item-text', sanityPath: 'themeOrdering.cartItemText', label: 'Item - Texto' },
            { cssVar: '--color-cart-item-extras', sanityPath: 'themeOrdering.cartItemExtras', label: 'Extras - Texto' },
            { cssVar: '--color-cart-item-price', sanityPath: 'themeOrdering.cartItemPrice', label: 'Item - Precio' },
            { cssVar: '--color-cart-total-bg', sanityPath: 'themeOrdering.cartTotalBg', label: 'Total - Fondo' },
            { cssVar: '--color-cart-total-text', sanityPath: 'themeOrdering.cartTotalText', label: 'Total - Texto' },
            { cssVar: '--color-cart-total-price', sanityPath: 'themeOrdering.cartTotalPrice', label: 'Total - Precio' },
            { cssVar: '--color-cart-empty-text', sanityPath: 'themeOrdering.cartEmptyText', label: 'Vacío - Texto' },
            { cssVar: '--color-cart-empty-btn-bg', sanityPath: 'themeOrdering.cartEmptyBtnBg', label: 'Btn Vaciar - Fondo' },
            { cssVar: '--color-cart-empty-btn-text', sanityPath: 'themeOrdering.cartEmptyBtnText', label: 'Btn Vaciar - Texto' },
            { cssVar: '--color-cart-whatsapp-bg', sanityPath: 'themeOrdering.cartWhatsappBg', label: 'WhatsApp - Fondo' },
            { cssVar: '--color-cart-whatsapp-text', sanityPath: 'themeOrdering.cartWhatsappText', label: 'WhatsApp - Texto' },
            { cssVar: '--color-cart-whatsapp-icon', sanityPath: 'themeOrdering.cartWhatsappIcon', label: 'WhatsApp - Icono' },
        ],
    },
    {
        id: 'quantity',
        title: 'Controles de Cantidad',
        icon: '🔢',
        colors: [
            { cssVar: '--color-quantity-bg', sanityPath: 'themeOrdering.quantityBg', label: 'Fondo' },
            { cssVar: '--color-quantity-text', sanityPath: 'themeOrdering.quantityText', label: 'Texto' },
            { cssVar: '--color-quantity-btn-bg', sanityPath: 'themeOrdering.quantityBtnBg', label: 'Btn - Fondo' },
            { cssVar: '--color-quantity-btn-text', sanityPath: 'themeOrdering.quantityBtnText', label: 'Btn - Texto' },
        ],
    },
    {
        id: 'productCards',
        title: 'Cards de Producto',
        icon: '🃏',
        colors: [
            { cssVar: '--color-product-badge-bg', sanityPath: 'themeOrdering.productBadgeBg', label: 'Badge - Fondo' },
            { cssVar: '--color-product-badge-text', sanityPath: 'themeOrdering.productBadgeText', label: 'Badge - Texto' },
            { cssVar: '--color-product-add-btn-bg', sanityPath: 'themeOrdering.productAddBtnBg', label: 'Btn (+) - Fondo' },
            { cssVar: '--color-product-add-btn-border', sanityPath: 'themeOrdering.productAddBtnBorder', label: 'Btn (+) - Borde' },
            { cssVar: '--color-product-add-btn-text', sanityPath: 'themeOrdering.productAddBtnText', label: 'Btn (+) - Texto' },
            { cssVar: '--color-product-modal-bg', sanityPath: 'themeOrdering.productModalBg', label: 'Modal - Fondo' },
            { cssVar: '--color-product-modal-text', sanityPath: 'themeOrdering.productModalText', label: 'Modal - Texto' },
            { cssVar: '--color-product-modal-btn-bg', sanityPath: 'themeOrdering.productModalBtnBg', label: 'Modal - Btn Fondo' },
            { cssVar: '--color-product-modal-btn-text', sanityPath: 'themeOrdering.productModalBtnText', label: 'Modal - Btn Texto' },
            { cssVar: '--color-product-extra-bg', sanityPath: 'themeOrdering.productExtraBg', label: 'Extra - Fondo' },
            { cssVar: '--color-product-extra-selected', sanityPath: 'themeOrdering.productExtraSelected', label: 'Extra - Seleccionado' },
            { cssVar: '--color-product-extra-text', sanityPath: 'themeOrdering.productExtraText', label: 'Extra - Texto' },
            { cssVar: '--color-product-carousel-dot', sanityPath: 'themeOrdering.productCarouselDot', label: 'Carrusel - Puntos' },
            { cssVar: '--color-fab-bg', sanityPath: 'themeOrdering.fabBg', label: 'FAB - Fondo' },
            { cssVar: '--color-fab-text', sanityPath: 'themeOrdering.fabText', label: 'FAB - Icono' },
            { cssVar: '--color-fab-badge-bg', sanityPath: 'themeOrdering.fabBadgeBg', label: 'FAB - Badge Fondo' },
            { cssVar: '--color-fab-badge-text', sanityPath: 'themeOrdering.fabBadgeText', label: 'FAB - Badge Texto' },
            { cssVar: '--color-new-badge-bg', sanityPath: 'themeOrdering.newBadgeBg', label: 'Badge Nuevo - Fondo' },
            { cssVar: '--color-new-badge-text', sanityPath: 'themeOrdering.newBadgeText', label: 'Badge Nuevo - Texto' },
        ],
    },
    {
        id: 'fulfillment',
        title: 'Modal de Entrega',
        icon: '🚚',
        colors: [
            { cssVar: '--color-fulfillment-modal-bg', sanityPath: 'themeOrdering.fulfillmentModalBg', label: 'Modal - Fondo' },
            { cssVar: '--color-fulfillment-modal-text', sanityPath: 'themeOrdering.fulfillmentModalText', label: 'Modal - Texto Principal' },
            { cssVar: '--color-fulfillment-option-bg', sanityPath: 'themeOrdering.fulfillmentOptionBg', label: 'Opción - Fondo' },
            { cssVar: '--color-fulfillment-option-border', sanityPath: 'themeOrdering.fulfillmentOptionBorder', label: 'Opción - Borde' },
            { cssVar: '--color-fulfillment-option-text', sanityPath: 'themeOrdering.fulfillmentOptionText', label: 'Opción - Texto' },
            { cssVar: '--color-fulfillment-option-hover-bg', sanityPath: 'themeOrdering.fulfillmentOptionHoverBg', label: 'Hover - Fondo' },
            { cssVar: '--color-fulfillment-option-hover-border', sanityPath: 'themeOrdering.fulfillmentOptionHoverBorder', label: 'Hover - Borde' },
            { cssVar: '--color-fulfillment-option-selected-bg', sanityPath: 'themeOrdering.fulfillmentOptionSelectedBg', label: 'Seleccionado - Fondo' },
            { cssVar: '--color-fulfillment-option-selected-border', sanityPath: 'themeOrdering.fulfillmentOptionSelectedBorder', label: 'Seleccionado - Borde' },
            { cssVar: '--color-fulfillment-option-selected-text', sanityPath: 'themeOrdering.fulfillmentOptionSelectedText', label: 'Seleccionado - Texto' },
            { cssVar: '--color-fulfillment-input-bg', sanityPath: 'themeOrdering.fulfillmentInputBg', label: 'Input Mesa - Fondo' },
            { cssVar: '--color-fulfillment-input-border', sanityPath: 'themeOrdering.fulfillmentInputBorder', label: 'Input Mesa - Borde' },
            { cssVar: '--color-fulfillment-input-text', sanityPath: 'themeOrdering.fulfillmentInputText', label: 'Input Mesa - Texto' },
            { cssVar: '--color-fulfillment-confirm-btn-bg', sanityPath: 'themeOrdering.fulfillmentConfirmBtnBg', label: 'Btn Confirmar - Fondo' },
            { cssVar: '--color-fulfillment-confirm-btn-text', sanityPath: 'themeOrdering.fulfillmentConfirmBtnText', label: 'Btn Confirmar - Texto' },
            { cssVar: '--color-fulfillment-cancel-btn-border', sanityPath: 'themeOrdering.fulfillmentCancelBtnBorder', label: 'Btn Cancelar - Borde' },
            { cssVar: '--color-fulfillment-cancel-btn-text', sanityPath: 'themeOrdering.fulfillmentCancelBtnText', label: 'Btn Cancelar - Texto' },
            { cssVar: '--color-fulfillment-check-bg', sanityPath: 'themeOrdering.fulfillmentCheckBg', label: 'Check - Fondo' },
            { cssVar: '--color-fulfillment-check-icon', sanityPath: 'themeOrdering.fulfillmentCheckIcon', label: 'Check - Icono' },
        ],
    },
    // ========== PRODUCT BUILDER ==========
    {
        id: 'productBuilder',
        title: 'Arma tu Producto',
        icon: '🔨',
        colors: [
            { cssVar: '--color-builder-card-bg', sanityPath: 'themeProductBuilder.cardBg', label: 'Tarjeta - Fondo' },
            { cssVar: '--color-builder-card-border', sanityPath: 'themeProductBuilder.cardBorder', label: 'Tarjeta - Borde' },
            { cssVar: '--color-builder-progress-active', sanityPath: 'themeProductBuilder.progressActive', label: 'Progreso - Activo' },
            { cssVar: '--color-builder-progress-inactive', sanityPath: 'themeProductBuilder.progressInactive', label: 'Progreso - Inactivo' },
            { cssVar: '--color-builder-step-indicator', sanityPath: 'themeProductBuilder.stepIndicatorText', label: 'Indicador Paso' },
            { cssVar: '--color-builder-step-title', sanityPath: 'themeProductBuilder.stepTitle', label: 'Título Paso' },
            { cssVar: '--color-builder-step-subtitle', sanityPath: 'themeProductBuilder.stepSubtitle', label: 'Subtítulo Paso' },
            { cssVar: '--color-builder-option-bg', sanityPath: 'themeProductBuilder.optionBg', label: 'Opción - Fondo' },
            { cssVar: '--color-builder-option-border', sanityPath: 'themeProductBuilder.optionBorder', label: 'Opción - Borde' },
            { cssVar: '--color-builder-option-text', sanityPath: 'themeProductBuilder.optionText', label: 'Opción - Texto' },
            { cssVar: '--color-builder-option-price', sanityPath: 'themeProductBuilder.optionPrice', label: 'Opción - Precio' },
            { cssVar: '--color-builder-option-selected-bg', sanityPath: 'themeProductBuilder.optionSelectedBg', label: 'Opción Selec. - Fondo' },
            { cssVar: '--color-builder-option-selected-border', sanityPath: 'themeProductBuilder.optionSelectedBorder', label: 'Opción Selec. - Borde' },
            { cssVar: '--color-builder-option-check', sanityPath: 'themeProductBuilder.optionCheckIcon', label: 'Opción - Icono Check' },
            { cssVar: '--color-builder-option-disabled-bg', sanityPath: 'themeProductBuilder.optionDisabledBg', label: 'Opción Disabled - Fondo' },
            { cssVar: '--color-builder-option-disabled-border', sanityPath: 'themeProductBuilder.optionDisabledBorder', label: 'Opción Disabled - Borde' },
            { cssVar: '--color-builder-footer-bg', sanityPath: 'themeProductBuilder.footerBg', label: 'Footer - Fondo' },
            { cssVar: '--color-builder-footer-border', sanityPath: 'themeProductBuilder.footerBorder', label: 'Footer - Borde' },
            { cssVar: '--color-builder-total-label', sanityPath: 'themeProductBuilder.totalLabel', label: 'Total - Etiqueta' },
            { cssVar: '--color-builder-total-price', sanityPath: 'themeProductBuilder.totalPrice', label: 'Total - Precio' },
            { cssVar: '--color-builder-cancel-bg', sanityPath: 'themeProductBuilder.cancelBtnBg', label: 'Btn Cancelar - Fondo' },
            { cssVar: '--color-builder-cancel-text', sanityPath: 'themeProductBuilder.cancelBtnText', label: 'Btn Cancelar - Texto' },
            { cssVar: '--color-builder-cancel-border', sanityPath: 'themeProductBuilder.cancelBtnBorder', label: 'Btn Cancelar - Borde' },
            { cssVar: '--color-builder-next-bg', sanityPath: 'themeProductBuilder.nextBtnBg', label: 'Btn Siguiente - Fondo' },
            { cssVar: '--color-builder-next-text', sanityPath: 'themeProductBuilder.nextBtnText', label: 'Btn Siguiente - Texto' },
            { cssVar: '--color-builder-next-disabled-bg', sanityPath: 'themeProductBuilder.nextBtnDisabledBg', label: 'Btn Sig. Disabled - Fondo' },
            { cssVar: '--color-builder-next-disabled-text', sanityPath: 'themeProductBuilder.nextBtnDisabledText', label: 'Btn Sig. Disabled - Texto' },
        ],
    },
];

// Utility to get all CSS variables as a flat array
export function getAllCSSVariables(): ColorVariable[] {
    return THEME_CATEGORIES.flatMap(cat => cat.colors);
}

// Utility to build CSS variable to Sanity path lookup
export function getCSSToSanityMap(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const cat of THEME_CATEGORIES) {
        for (const color of cat.colors) {
            map[color.cssVar] = color.sanityPath;
        }
    }
    return map;
}

// Utility to build Sanity path to CSS variable lookup
export function getSanityToCSSMap(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const cat of THEME_CATEGORIES) {
        for (const color of cat.colors) {
            map[color.sanityPath] = color.cssVar;
        }
    }
    return map;
}

// Helper to normalize hex color codes (e.g., #fff -> #FFFFFF)
function normalizeHexColor(value: string): string {
    if (!value) return value;
    let cleanValue = value.trim();

    // Handle transparent keyword
    if (cleanValue.toLowerCase() === 'transparent') {
        return '#00000000';
    }

    // Ensure starts with #
    if (!cleanValue.startsWith('#')) {
        cleanValue = '#' + cleanValue;
    }

    // Expand short hex: #RGB -> #RRGGBB
    if (/^#[0-9a-fA-F]{3}$/.test(cleanValue)) {
        const r = cleanValue[1];
        const g = cleanValue[2];
        const b = cleanValue[3];
        cleanValue = `#${r}${r}${g}${g}${b}${b}`;
    }

    // NOTE: We do NOT expand #RGBA (4 digits) as requested by user to "maintain without modifying values that include opacity".
    // We strictly only fix the #RGB case which was causing issues.
    // However, we still enforce uppercase for consistency.

    return cleanValue.toUpperCase();
}

// Convert flat colors object to nested Sanity structure
export function colorsToSanityFormat(colors: Record<string, string>): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};
    const cssToSanity = getCSSToSanityMap();

    for (const [cssVar, rawValue] of Object.entries(colors)) {
        const sanityPath = cssToSanity[cssVar];
        if (sanityPath && rawValue) {
            const value = normalizeHexColor(rawValue);
            const [category, field] = sanityPath.split('.');
            if (!result[category]) {
                result[category] = {};
            }
            result[category][field] = value;
        }
    }

    return result;
}

// sessionStorage key for theme persistence
export const THEME_STORAGE_KEY = 'theme_editor_preview';
