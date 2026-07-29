import { createClient } from '@sanity/client';

const client = createClient({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

export interface ThemeColors {
    themeApplication?: {
        bgMain?: string;
        textTitle?: string;
        textSubtitle?: string;
        textSection?: string;
        textPrice?: string;
        contentBg?: string;
        menuItemBg?: string;
        menuItemBorder?: string;
        productBackgroundColor?: string;
    };
    themeNavbar?: {
        bg?: string;
        text?: string;
        border?: string;
        logoBg?: string;
        logoText?: string;
        selectBg?: string;
        selectBorder?: string;
        selectText?: string;
        selectIcon?: string;
        selectOptionBg?: string;
        selectOptionText?: string;
        selectOptionHoverBg?: string;
        selectOptionHoverText?: string;
        selectRadius?: string;
    };
    themeBestSellers?: {
        bg?: string;
        textTitle?: string;
        cardBg?: string;
        textName?: string;
        textPrice?: string;
        scrollbarThumb?: string;
        scrollbarTrack?: string;
    };
    themeSeasonal?: {
        bg?: string;
        subtitle?: string;
        textTitle?: string;
        textSubtitle?: string;
        cardBg?: string;
        textName?: string;
        textPrice?: string;
        scrollbarThumb?: string;
        scrollbarTrack?: string;
    };
    themeExtras?: {
        bg?: string;
        border?: string;
        text?: string;
        price?: string;
    };
    themeModal?: {
        overlay?: string;
        bg?: string;
        gradientFrom?: string;
        closeBg?: string;
        closeHover?: string;
        closeIcon?: string;
        priceBg?: string;
        priceText?: string;
        description?: string;
        scrollbarTrack?: string;
        scrollbarThumb?: string;
    };
    themeFooter?: {
        bg?: string;
        text?: string;
        accent?: string;
        btnBg?: string;
        btnText?: string;
        btnHover?: string;
    };
    themeSubfooter?: {
        bg?: string;
        text?: string;
    };
    themeUI?: {
        overlayCurtain?: string;
        topButtonBg?: string;
        topButtonIcon?: string;
        whatsappButtonBg?: string;
        whatsappButtonIcon?: string;
        backBtnBg?: string;
        backBtnText?: string;
    };
    themeOrdering?: {
        orderingBtnDesktopBgInactive?: string;
        orderingBtnDesktopTextInactive?: string;
        orderingBtnDesktopBorderInactive?: string;
        orderingBtnDesktopBgActive?: string;
        orderingBtnDesktopTextActive?: string;
        orderingBtnDesktopBorderActive?: string;
        orderingBtnDesktopBgHover?: string;
        orderingBtnDesktopTextHover?: string;
        orderingBtnDesktopBorderHover?: string;
        orderingBtnMobileBgInactive?: string;
        orderingBtnMobileTextInactive?: string;
        orderingBtnMobileBgActive?: string;
        orderingBtnMobileTextActive?: string;
        orderingBtnBadgeBg?: string;
        orderingBtnBadgeText?: string;
        mobileCartBarBg?: string;
        mobileCartBarItemCount?: string;
        mobileCartBarTotal?: string;
        mobileCartBarBtnBg?: string;
        mobileCartBarBtnText?: string;
        cartBg?: string;
        cartHeaderBg?: string;
        cartHeaderText?: string;
        cartItemBg?: string;
        cartItemText?: string;
        cartItemExtras?: string;
        cartItemPrice?: string;
        cartTotalBg?: string;
        cartTotalText?: string;
        cartTotalPrice?: string;
        cartEmptyText?: string;
        cartEmptyBtnBg?: string;
        cartEmptyBtnText?: string;
        cartWhatsappBg?: string;
        cartWhatsappText?: string;
        cartWhatsappIcon?: string;
        quantityBg?: string;
        quantityText?: string;
        quantityBtnBg?: string;
        quantityBtnText?: string;
        productBadgeBg?: string;
        productBadgeText?: string;
        productAddBtnBg?: string;
        productAddBtnBorder?: string;
        productAddBtnText?: string;
        productModalBg?: string;
        productModalText?: string;
        productModalBtnBg?: string;
        productModalBtnText?: string;
        productExtraBg?: string;
        productExtraSelected?: string;
        productExtraText?: string;
        productCarouselDot?: string;
        fabBg?: string;
        fabText?: string;
        fabBadgeBg?: string;
        fabBadgeText?: string;
        newBadgeBg?: string;
        newBadgeText?: string;
        fulfillmentModalBg?: string;
        fulfillmentModalText?: string;
        fulfillmentOptionBg?: string;
        fulfillmentOptionBorder?: string;
        fulfillmentOptionText?: string;
        fulfillmentOptionHoverBg?: string;
        fulfillmentOptionHoverBorder?: string;
        fulfillmentOptionSelectedBg?: string;
        fulfillmentOptionSelectedBorder?: string;
        fulfillmentOptionSelectedText?: string;
        fulfillmentInputBg?: string;
        fulfillmentInputBorder?: string;
        fulfillmentInputText?: string;
        fulfillmentConfirmBtnBg?: string;
        fulfillmentConfirmBtnText?: string;
        fulfillmentCancelBtnBorder?: string;
        fulfillmentCancelBtnText?: string;
        fulfillmentCheckBg?: string;
        fulfillmentCheckIcon?: string;
    };
    themeProductBuilder?: {
        cardBg?: string;
        cardBorder?: string;
        progressActive?: string;
        progressInactive?: string;
        stepIndicatorText?: string;
        stepTitle?: string;
        stepSubtitle?: string;
        optionBg?: string;
        optionBorder?: string;
        optionText?: string;
        optionPrice?: string;
        optionSelectedBg?: string;
        optionSelectedBorder?: string;
        optionCheckIcon?: string;
        optionDisabledBg?: string;
        optionDisabledBorder?: string;
        footerBg?: string;
        footerBorder?: string;
        totalLabel?: string;
        totalPrice?: string;
        cancelBtnBg?: string;
        cancelBtnText?: string;
        cancelBtnBorder?: string;
        nextBtnBg?: string;
        nextBtnText?: string;
        nextBtnDisabledBg?: string;
        nextBtnDisabledText?: string;
    };
}

export async function loadTheme(): Promise<ThemeColors> {
    const themeDoc = await client.fetch(`*[_type == "theme" && _id == "theme"][0]{
    themeApplication,
    themeNavbar,
    themeBestSellers,
    themeSeasonal,
    themeExtras,
    themeModal,
    themeFooter,
    themeSubfooter,
    themeUI,
    themeOrdering,
    themeProductBuilder
  }`);

    return themeDoc;
}

export function generateCSSVariables(theme: ThemeColors): string {
    const vars: string[] = [];

    // Application
    if (theme.themeApplication) {
        if (theme.themeApplication.bgMain) vars.push(`--color-bg-main: ${theme.themeApplication.bgMain};`);
        if (theme.themeApplication.textTitle) vars.push(`--color-text-title: ${theme.themeApplication.textTitle};`);
        if (theme.themeApplication.textSubtitle) vars.push(`--color-text-subtitle: ${theme.themeApplication.textSubtitle};`);
        if (theme.themeApplication.textSection) vars.push(`--color-text-section: ${theme.themeApplication.textSection};`);
        if (theme.themeApplication.textPrice) vars.push(`--color-text-price: ${theme.themeApplication.textPrice};`);
        if (theme.themeApplication.contentBg) vars.push(`--color-content-bg: ${theme.themeApplication.contentBg};`);
        if (theme.themeApplication.menuItemBg) vars.push(`--color-menu-item-bg: ${theme.themeApplication.menuItemBg};`);
        if (theme.themeApplication.menuItemBorder) vars.push(`--color-menu-item-border: ${theme.themeApplication.menuItemBorder};`);
        if (theme.themeApplication.productBackgroundColor) vars.push(`--color-product-bg: ${theme.themeApplication.productBackgroundColor};`);
    }

    // Navbar
    if (theme.themeNavbar) {
        if (theme.themeNavbar.bg) vars.push(`--color-navbar-bg: ${theme.themeNavbar.bg};`);
        if (theme.themeNavbar.text) vars.push(`--color-navbar-text: ${theme.themeNavbar.text};`);
        if (theme.themeNavbar.border) vars.push(`--color-navbar-border: ${theme.themeNavbar.border};`);
        if (theme.themeNavbar.logoBg) vars.push(`--color-navbar-logo-bg: ${theme.themeNavbar.logoBg};`);
        if (theme.themeNavbar.logoText) vars.push(`--color-navbar-logo-text: ${theme.themeNavbar.logoText};`);
        if (theme.themeNavbar.selectBg) vars.push(`--color-navbar-select-bg: ${theme.themeNavbar.selectBg};`);
        if (theme.themeNavbar.selectBorder) vars.push(`--color-navbar-select-border: ${theme.themeNavbar.selectBorder};`);
        if (theme.themeNavbar.selectText) vars.push(`--color-navbar-select-text: ${theme.themeNavbar.selectText};`);
        if (theme.themeNavbar.selectIcon) vars.push(`--color-navbar-select-icon: ${theme.themeNavbar.selectIcon};`);
        if (theme.themeNavbar.selectOptionBg) vars.push(`--color-navbar-select-option-bg: ${theme.themeNavbar.selectOptionBg};`);
        if (theme.themeNavbar.selectOptionText) vars.push(`--color-navbar-select-option-text: ${theme.themeNavbar.selectOptionText};`);
        if (theme.themeNavbar.selectOptionHoverBg) vars.push(`--color-navbar-select-option-hover-bg: ${theme.themeNavbar.selectOptionHoverBg};`);
        if (theme.themeNavbar.selectOptionHoverText) vars.push(`--color-navbar-select-option-hover-text: ${theme.themeNavbar.selectOptionHoverText};`);
        if (theme.themeNavbar.selectRadius) vars.push(`--radius-navbar-select: ${theme.themeNavbar.selectRadius};`);
    }

    // Best Sellers
    if (theme.themeBestSellers) {
        if (theme.themeBestSellers.bg) vars.push(`--color-bestsellers-bg: ${theme.themeBestSellers.bg};`);
        if (theme.themeBestSellers.textTitle) vars.push(`--color-bestsellers-text-title: ${theme.themeBestSellers.textTitle};`);
        if (theme.themeBestSellers.cardBg) vars.push(`--color-bestsellers-card-bg: ${theme.themeBestSellers.cardBg};`);
        if (theme.themeBestSellers.textName) vars.push(`--color-bestsellers-text-name: ${theme.themeBestSellers.textName};`);
        if (theme.themeBestSellers.textPrice) vars.push(`--color-bestsellers-text-price: ${theme.themeBestSellers.textPrice};`);
        if (theme.themeBestSellers.scrollbarThumb) vars.push(`--color-bestsellers-scrollbar-thumb: ${theme.themeBestSellers.scrollbarThumb};`);
        if (theme.themeBestSellers.scrollbarTrack) vars.push(`--color-bestsellers-scrollbar-track: ${theme.themeBestSellers.scrollbarTrack};`);
    }

    // Seasonal
    if (theme.themeSeasonal) {
        if (theme.themeSeasonal.bg) vars.push(`--color-seasonal-bg: ${theme.themeSeasonal.bg};`);
        if (theme.themeSeasonal.subtitle) vars.push(`--color-seasonal-subtitle: ${theme.themeSeasonal.subtitle};`);
        if (theme.themeSeasonal.textTitle) vars.push(`--color-seasonal-text-title: ${theme.themeSeasonal.textTitle};`);
        if (theme.themeSeasonal.textSubtitle) vars.push(`--color-seasonal-text-subtitle: ${theme.themeSeasonal.textSubtitle};`);
        if (theme.themeSeasonal.cardBg) vars.push(`--color-seasonal-card-bg: ${theme.themeSeasonal.cardBg};`);
        if (theme.themeSeasonal.textName) vars.push(`--color-seasonal-text-name: ${theme.themeSeasonal.textName};`);
        if (theme.themeSeasonal.textPrice) vars.push(`--color-seasonal-text-price: ${theme.themeSeasonal.textPrice};`);
        if (theme.themeSeasonal.scrollbarThumb) vars.push(`--color-seasonal-scrollbar-thumb: ${theme.themeSeasonal.scrollbarThumb};`);
        if (theme.themeSeasonal.scrollbarTrack) vars.push(`--color-seasonal-scrollbar-track: ${theme.themeSeasonal.scrollbarTrack};`);
    }

    // Extras
    if (theme.themeExtras) {
        if (theme.themeExtras.bg) vars.push(`--color-extras-bg: ${theme.themeExtras.bg};`);
        if (theme.themeExtras.border) vars.push(`--color-extras-border: ${theme.themeExtras.border};`);
        if (theme.themeExtras.text) vars.push(`--color-extras-text: ${theme.themeExtras.text};`);
        if (theme.themeExtras.price) vars.push(`--color-extras-price: ${theme.themeExtras.price};`);
    }

    // Modal
    if (theme.themeModal) {
        if (theme.themeModal.overlay) vars.push(`--color-modal-overlay: ${theme.themeModal.overlay};`);
        if (theme.themeModal.bg) vars.push(`--color-modal-bg: ${theme.themeModal.bg};`);
        if (theme.themeModal.gradientFrom) vars.push(`--color-modal-gradient-from: ${theme.themeModal.gradientFrom};`);
        if (theme.themeModal.closeBg) vars.push(`--color-modal-close-bg: ${theme.themeModal.closeBg};`);
        if (theme.themeModal.closeHover) vars.push(`--color-modal-close-hover: ${theme.themeModal.closeHover};`);
        if (theme.themeModal.closeIcon) vars.push(`--color-modal-close-icon: ${theme.themeModal.closeIcon};`);
        if (theme.themeModal.priceBg) vars.push(`--color-modal-price-bg: ${theme.themeModal.priceBg};`);
        if (theme.themeModal.priceText) vars.push(`--color-modal-price-text: ${theme.themeModal.priceText};`);
        if (theme.themeModal.description) vars.push(`--color-modal-description: ${theme.themeModal.description};`);
        if (theme.themeModal.scrollbarTrack) vars.push(`--color-modal-scrollbar-track: ${theme.themeModal.scrollbarTrack};`);
        if (theme.themeModal.scrollbarThumb) vars.push(`--color-modal-scrollbar-thumb: ${theme.themeModal.scrollbarThumb};`);
    }

    // Footer
    if (theme.themeFooter) {
        if (theme.themeFooter.bg) vars.push(`--color-footer-bg: ${theme.themeFooter.bg};`);
        if (theme.themeFooter.text) vars.push(`--color-footer-text: ${theme.themeFooter.text};`);
        if (theme.themeFooter.accent) vars.push(`--color-footer-accent: ${theme.themeFooter.accent};`);
        if (theme.themeFooter.btnBg) vars.push(`--color-footer-btn-bg: ${theme.themeFooter.btnBg};`);
        if (theme.themeFooter.btnText) vars.push(`--color-footer-btn-text: ${theme.themeFooter.btnText};`);
        if (theme.themeFooter.btnHover) vars.push(`--color-footer-btn-hover: ${theme.themeFooter.btnHover};`);
    }

    // Subfooter
    if (theme.themeSubfooter) {
        if (theme.themeSubfooter.bg) vars.push(`--color-subfooter-bg: ${theme.themeSubfooter.bg};`);
        if (theme.themeSubfooter.text) vars.push(`--color-subfooter-text: ${theme.themeSubfooter.text};`);
    }

    // UI
    if (theme.themeUI) {
        if (theme.themeUI.overlayCurtain) vars.push(`--color-overlay-curtain: ${theme.themeUI.overlayCurtain};`);
        if (theme.themeUI.topButtonBg) vars.push(`--color-topbutton-bg: ${theme.themeUI.topButtonBg};`);
        if (theme.themeUI.topButtonIcon) vars.push(`--color-topbutton-icon: ${theme.themeUI.topButtonIcon};`);
        if (theme.themeUI.whatsappButtonBg) vars.push(`--color-whatsapp-bg: ${theme.themeUI.whatsappButtonBg};`);
        if (theme.themeUI.whatsappButtonIcon) vars.push(`--color-whatsapp-icon: ${theme.themeUI.whatsappButtonIcon};`);
        if (theme.themeUI.backBtnBg) vars.push(`--color-back-btn-bg: ${theme.themeUI.backBtnBg};`);
        if (theme.themeUI.backBtnText) vars.push(`--color-back-btn-text: ${theme.themeUI.backBtnText};`);
    }

    // Ordering System
    if (theme.themeOrdering) {
        // Order Mode Button
        // Order Mode Button - Desktop
        if (theme.themeOrdering.orderingBtnDesktopBgInactive) vars.push(`--color-btn-desktop-bg-inactive: ${theme.themeOrdering.orderingBtnDesktopBgInactive};`);
        if (theme.themeOrdering.orderingBtnDesktopTextInactive) vars.push(`--color-btn-desktop-text-inactive: ${theme.themeOrdering.orderingBtnDesktopTextInactive};`);
        if (theme.themeOrdering.orderingBtnDesktopBorderInactive) vars.push(`--color-btn-desktop-border-inactive: ${theme.themeOrdering.orderingBtnDesktopBorderInactive};`);

        if (theme.themeOrdering.orderingBtnDesktopBgActive) vars.push(`--color-btn-desktop-bg-active: ${theme.themeOrdering.orderingBtnDesktopBgActive};`);
        if (theme.themeOrdering.orderingBtnDesktopTextActive) vars.push(`--color-btn-desktop-text-active: ${theme.themeOrdering.orderingBtnDesktopTextActive};`);
        if (theme.themeOrdering.orderingBtnDesktopBorderActive) vars.push(`--color-btn-desktop-border-active: ${theme.themeOrdering.orderingBtnDesktopBorderActive};`);

        if (theme.themeOrdering.orderingBtnDesktopBgHover) vars.push(`--color-btn-desktop-bg-hover: ${theme.themeOrdering.orderingBtnDesktopBgHover};`);
        if (theme.themeOrdering.orderingBtnDesktopTextHover) vars.push(`--color-btn-desktop-text-hover: ${theme.themeOrdering.orderingBtnDesktopTextHover};`);
        if (theme.themeOrdering.orderingBtnDesktopBorderHover) vars.push(`--color-btn-desktop-border-hover: ${theme.themeOrdering.orderingBtnDesktopBorderHover};`);

        // Order Mode Button - Mobile FAB
        if (theme.themeOrdering.orderingBtnMobileBgInactive) vars.push(`--color-btn-mobile-bg-inactive: ${theme.themeOrdering.orderingBtnMobileBgInactive};`);
        if (theme.themeOrdering.orderingBtnMobileTextInactive) vars.push(`--color-btn-mobile-text-inactive: ${theme.themeOrdering.orderingBtnMobileTextInactive};`);

        if (theme.themeOrdering.orderingBtnMobileBgActive) vars.push(`--color-btn-mobile-bg-active: ${theme.themeOrdering.orderingBtnMobileBgActive};`);
        if (theme.themeOrdering.orderingBtnMobileTextActive) vars.push(`--color-btn-mobile-text-active: ${theme.themeOrdering.orderingBtnMobileTextActive};`);
        if (theme.themeOrdering.orderingBtnBadgeBg) vars.push(`--color-ordering-btn-badge-bg: ${theme.themeOrdering.orderingBtnBadgeBg};`);
        if (theme.themeOrdering.orderingBtnBadgeText) vars.push(`--color-ordering-btn-badge-text: ${theme.themeOrdering.orderingBtnBadgeText};`);
        // Mobile Cart Bar
        if (theme.themeOrdering.mobileCartBarBg) vars.push(`--color-mobile-cart-bar-bg: ${theme.themeOrdering.mobileCartBarBg};`);
        if (theme.themeOrdering.mobileCartBarItemCount) vars.push(`--color-mobile-cart-bar-item-count: ${theme.themeOrdering.mobileCartBarItemCount};`);
        if (theme.themeOrdering.mobileCartBarTotal) vars.push(`--color-mobile-cart-bar-total: ${theme.themeOrdering.mobileCartBarTotal};`);
        if (theme.themeOrdering.mobileCartBarBtnBg) vars.push(`--color-mobile-cart-bar-btn-bg: ${theme.themeOrdering.mobileCartBarBtnBg};`);
        if (theme.themeOrdering.mobileCartBarBtnText) vars.push(`--color-mobile-cart-bar-btn-text: ${theme.themeOrdering.mobileCartBarBtnText};`);
        // Cart
        if (theme.themeOrdering.cartBg) vars.push(`--color-cart-bg: ${theme.themeOrdering.cartBg};`);
        if (theme.themeOrdering.cartHeaderBg) vars.push(`--color-cart-header-bg: ${theme.themeOrdering.cartHeaderBg};`);
        if (theme.themeOrdering.cartHeaderText) vars.push(`--color-cart-header-text: ${theme.themeOrdering.cartHeaderText};`);
        if (theme.themeOrdering.cartItemBg) vars.push(`--color-cart-item-bg: ${theme.themeOrdering.cartItemBg};`);
        if (theme.themeOrdering.cartItemText) vars.push(`--color-cart-item-text: ${theme.themeOrdering.cartItemText};`);
        if (theme.themeOrdering.cartItemExtras) vars.push(`--color-cart-item-extras: ${theme.themeOrdering.cartItemExtras};`);
        if (theme.themeOrdering.cartItemPrice) vars.push(`--color-cart-item-price: ${theme.themeOrdering.cartItemPrice};`);
        if (theme.themeOrdering.cartTotalBg) vars.push(`--color-cart-total-bg: ${theme.themeOrdering.cartTotalBg};`);
        if (theme.themeOrdering.cartTotalText) vars.push(`--color-cart-total-text: ${theme.themeOrdering.cartTotalText};`);
        if (theme.themeOrdering.cartTotalPrice) vars.push(`--color-cart-total-price: ${theme.themeOrdering.cartTotalPrice};`);
        if (theme.themeOrdering.cartEmptyText) vars.push(`--color-cart-empty-text: ${theme.themeOrdering.cartEmptyText};`);
        if (theme.themeOrdering.cartEmptyBtnBg) vars.push(`--color-cart-empty-btn-bg: ${theme.themeOrdering.cartEmptyBtnBg};`);
        if (theme.themeOrdering.cartEmptyBtnText) vars.push(`--color-cart-empty-btn-text: ${theme.themeOrdering.cartEmptyBtnText};`);
        // WhatsApp Button
        if (theme.themeOrdering.cartWhatsappBg) vars.push(`--color-cart-whatsapp-bg: ${theme.themeOrdering.cartWhatsappBg};`);
        if (theme.themeOrdering.cartWhatsappText) vars.push(`--color-cart-whatsapp-text: ${theme.themeOrdering.cartWhatsappText};`);
        if (theme.themeOrdering.cartWhatsappIcon) vars.push(`--color-cart-whatsapp-icon: ${theme.themeOrdering.cartWhatsappIcon};`);
        // Quantity Controls
        if (theme.themeOrdering.quantityBg) vars.push(`--color-quantity-bg: ${theme.themeOrdering.quantityBg};`);
        if (theme.themeOrdering.quantityText) vars.push(`--color-quantity-text: ${theme.themeOrdering.quantityText};`);
        if (theme.themeOrdering.quantityBtnBg) vars.push(`--color-quantity-btn-bg: ${theme.themeOrdering.quantityBtnBg};`);
        if (theme.themeOrdering.quantityBtnText) vars.push(`--color-quantity-btn-text: ${theme.themeOrdering.quantityBtnText};`);
        // Product Cards
        if (theme.themeOrdering.productBadgeBg) vars.push(`--color-product-badge-bg: ${theme.themeOrdering.productBadgeBg};`);
        if (theme.themeOrdering.productBadgeText) vars.push(`--color-product-badge-text: ${theme.themeOrdering.productBadgeText};`);
        if (theme.themeOrdering.productAddBtnBg) vars.push(`--color-product-add-btn-bg: ${theme.themeOrdering.productAddBtnBg};`);
        if (theme.themeOrdering.productAddBtnBorder) vars.push(`--color-product-add-btn-border: ${theme.themeOrdering.productAddBtnBorder};`);
        if (theme.themeOrdering.productAddBtnText) vars.push(`--color-product-add-btn-text: ${theme.themeOrdering.productAddBtnText};`);
        // Product Modal
        if (theme.themeOrdering.productModalBg) vars.push(`--color-product-modal-bg: ${theme.themeOrdering.productModalBg};`);
        if (theme.themeOrdering.productModalText) vars.push(`--color-product-modal-text: ${theme.themeOrdering.productModalText};`);
        if (theme.themeOrdering.productModalBtnBg) vars.push(`--color-product-modal-btn-bg: ${theme.themeOrdering.productModalBtnBg};`);
        if (theme.themeOrdering.productModalBtnText) vars.push(`--color-product-modal-btn-text: ${theme.themeOrdering.productModalBtnText};`);
        if (theme.themeOrdering.productExtraBg) vars.push(`--color-product-extra-bg: ${theme.themeOrdering.productExtraBg};`);
        if (theme.themeOrdering.productExtraSelected) vars.push(`--color-product-extra-selected: ${theme.themeOrdering.productExtraSelected};`);
        if (theme.themeOrdering.productExtraText) vars.push(`--color-product-extra-text: ${theme.themeOrdering.productExtraText};`);
        if (theme.themeOrdering.productCarouselDot) vars.push(`--color-product-carousel-dot: ${theme.themeOrdering.productCarouselDot};`);
        // FAB
        if (theme.themeOrdering.fabBg) vars.push(`--color-fab-bg: ${theme.themeOrdering.fabBg};`);
        if (theme.themeOrdering.fabText) vars.push(`--color-fab-text: ${theme.themeOrdering.fabText};`);
        if (theme.themeOrdering.fabBadgeBg) vars.push(`--color-fab-badge-bg: ${theme.themeOrdering.fabBadgeBg};`);
        if (theme.themeOrdering.fabBadgeText) vars.push(`--color-fab-badge-text: ${theme.themeOrdering.fabBadgeText};`);
        // New Badge
        if (theme.themeOrdering.newBadgeBg) vars.push(`--color-new-badge-bg: ${theme.themeOrdering.newBadgeBg};`);
        if (theme.themeOrdering.newBadgeText) vars.push(`--color-new-badge-text: ${theme.themeOrdering.newBadgeText};`);

        // Fulfillment Modal
        if (theme.themeOrdering.fulfillmentModalBg) vars.push(`--color-fulfillment-modal-bg: ${theme.themeOrdering.fulfillmentModalBg};`);
        if (theme.themeOrdering.fulfillmentModalText) vars.push(`--color-fulfillment-modal-text: ${theme.themeOrdering.fulfillmentModalText};`);
        if (theme.themeOrdering.fulfillmentOptionBg) vars.push(`--color-fulfillment-option-bg: ${theme.themeOrdering.fulfillmentOptionBg};`);
        if (theme.themeOrdering.fulfillmentOptionBorder) vars.push(`--color-fulfillment-option-border: ${theme.themeOrdering.fulfillmentOptionBorder};`);
        if (theme.themeOrdering.fulfillmentOptionText) vars.push(`--color-fulfillment-option-text: ${theme.themeOrdering.fulfillmentOptionText};`);
        if (theme.themeOrdering.fulfillmentOptionHoverBg) vars.push(`--color-fulfillment-option-hover-bg: ${theme.themeOrdering.fulfillmentOptionHoverBg};`);
        if (theme.themeOrdering.fulfillmentOptionHoverBorder) vars.push(`--color-fulfillment-option-hover-border: ${theme.themeOrdering.fulfillmentOptionHoverBorder};`);
        if (theme.themeOrdering.fulfillmentOptionSelectedBg) vars.push(`--color-fulfillment-option-selected-bg: ${theme.themeOrdering.fulfillmentOptionSelectedBg};`);
        if (theme.themeOrdering.fulfillmentOptionSelectedBorder) vars.push(`--color-fulfillment-option-selected-border: ${theme.themeOrdering.fulfillmentOptionSelectedBorder};`);
        if (theme.themeOrdering.fulfillmentOptionSelectedText) vars.push(`--color-fulfillment-option-selected-text: ${theme.themeOrdering.fulfillmentOptionSelectedText};`);
        if (theme.themeOrdering.fulfillmentInputBg) vars.push(`--color-fulfillment-input-bg: ${theme.themeOrdering.fulfillmentInputBg};`);
        if (theme.themeOrdering.fulfillmentInputBorder) vars.push(`--color-fulfillment-input-border: ${theme.themeOrdering.fulfillmentInputBorder};`);
        if (theme.themeOrdering.fulfillmentInputText) vars.push(`--color-fulfillment-input-text: ${theme.themeOrdering.fulfillmentInputText};`);
        if (theme.themeOrdering.fulfillmentConfirmBtnBg) vars.push(`--color-fulfillment-confirm-btn-bg: ${theme.themeOrdering.fulfillmentConfirmBtnBg};`);
        if (theme.themeOrdering.fulfillmentConfirmBtnText) vars.push(`--color-fulfillment-confirm-btn-text: ${theme.themeOrdering.fulfillmentConfirmBtnText};`);
        if (theme.themeOrdering.fulfillmentCancelBtnBorder) vars.push(`--color-fulfillment-cancel-btn-border: ${theme.themeOrdering.fulfillmentCancelBtnBorder};`);
        if (theme.themeOrdering.fulfillmentCancelBtnText) vars.push(`--color-fulfillment-cancel-btn-text: ${theme.themeOrdering.fulfillmentCancelBtnText};`);
        if (theme.themeOrdering.fulfillmentCheckBg) vars.push(`--color-fulfillment-check-bg: ${theme.themeOrdering.fulfillmentCheckBg};`);
        if (theme.themeOrdering.fulfillmentCheckIcon) vars.push(`--color-fulfillment-check-icon: ${theme.themeOrdering.fulfillmentCheckIcon};`);
    }

    // Product Builder (Arma tu Producto)
    if (theme.themeProductBuilder) {
        if (theme.themeProductBuilder.cardBg) vars.push(`--color-builder-card-bg: ${theme.themeProductBuilder.cardBg};`);
        if (theme.themeProductBuilder.cardBorder) vars.push(`--color-builder-card-border: ${theme.themeProductBuilder.cardBorder};`);
        if (theme.themeProductBuilder.progressActive) vars.push(`--color-builder-progress-active: ${theme.themeProductBuilder.progressActive};`);
        if (theme.themeProductBuilder.progressInactive) vars.push(`--color-builder-progress-inactive: ${theme.themeProductBuilder.progressInactive};`);
        if (theme.themeProductBuilder.stepIndicatorText) vars.push(`--color-builder-step-indicator: ${theme.themeProductBuilder.stepIndicatorText};`);
        if (theme.themeProductBuilder.stepTitle) vars.push(`--color-builder-step-title: ${theme.themeProductBuilder.stepTitle};`);
        if (theme.themeProductBuilder.stepSubtitle) vars.push(`--color-builder-step-subtitle: ${theme.themeProductBuilder.stepSubtitle};`);
        if (theme.themeProductBuilder.optionBg) vars.push(`--color-builder-option-bg: ${theme.themeProductBuilder.optionBg};`);
        if (theme.themeProductBuilder.optionBorder) vars.push(`--color-builder-option-border: ${theme.themeProductBuilder.optionBorder};`);
        if (theme.themeProductBuilder.optionText) vars.push(`--color-builder-option-text: ${theme.themeProductBuilder.optionText};`);
        if (theme.themeProductBuilder.optionPrice) vars.push(`--color-builder-option-price: ${theme.themeProductBuilder.optionPrice};`);
        if (theme.themeProductBuilder.optionSelectedBg) vars.push(`--color-builder-option-selected-bg: ${theme.themeProductBuilder.optionSelectedBg};`);
        if (theme.themeProductBuilder.optionSelectedBorder) vars.push(`--color-builder-option-selected-border: ${theme.themeProductBuilder.optionSelectedBorder};`);
        if (theme.themeProductBuilder.optionCheckIcon) vars.push(`--color-builder-option-check: ${theme.themeProductBuilder.optionCheckIcon};`);
        if (theme.themeProductBuilder.optionDisabledBg) vars.push(`--color-builder-option-disabled-bg: ${theme.themeProductBuilder.optionDisabledBg};`);
        if (theme.themeProductBuilder.optionDisabledBorder) vars.push(`--color-builder-option-disabled-border: ${theme.themeProductBuilder.optionDisabledBorder};`);
        if (theme.themeProductBuilder.footerBg) vars.push(`--color-builder-footer-bg: ${theme.themeProductBuilder.footerBg};`);
        if (theme.themeProductBuilder.footerBorder) vars.push(`--color-builder-footer-border: ${theme.themeProductBuilder.footerBorder};`);
        if (theme.themeProductBuilder.totalLabel) vars.push(`--color-builder-total-label: ${theme.themeProductBuilder.totalLabel};`);
        if (theme.themeProductBuilder.totalPrice) vars.push(`--color-builder-total-price: ${theme.themeProductBuilder.totalPrice};`);
        if (theme.themeProductBuilder.cancelBtnBg) vars.push(`--color-builder-cancel-bg: ${theme.themeProductBuilder.cancelBtnBg};`);
        if (theme.themeProductBuilder.cancelBtnText) vars.push(`--color-builder-cancel-text: ${theme.themeProductBuilder.cancelBtnText};`);
        if (theme.themeProductBuilder.cancelBtnBorder) vars.push(`--color-builder-cancel-border: ${theme.themeProductBuilder.cancelBtnBorder};`);
        if (theme.themeProductBuilder.nextBtnBg) vars.push(`--color-builder-next-bg: ${theme.themeProductBuilder.nextBtnBg};`);
        if (theme.themeProductBuilder.nextBtnText) vars.push(`--color-builder-next-text: ${theme.themeProductBuilder.nextBtnText};`);
        if (theme.themeProductBuilder.nextBtnDisabledBg) vars.push(`--color-builder-next-disabled-bg: ${theme.themeProductBuilder.nextBtnDisabledBg};`);
        if (theme.themeProductBuilder.nextBtnDisabledText) vars.push(`--color-builder-next-disabled-text: ${theme.themeProductBuilder.nextBtnDisabledText};`);
    }

    return vars.join('\n    ');
}
