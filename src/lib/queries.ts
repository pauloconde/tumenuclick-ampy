// src/lib/queries.ts
import { sanityClient } from './sanity';

/**
 * Consulta GROQ para obtener todos los datos del menú (combinando Brand y Menu)
 */
const menuDataQuery = `{
  "brand": *[_type == "brand"][0]{
    name,
    logo,
    logoOverlay,
    favicon,
    description,
    keywords,
    addresses[]{
      name,
      address,
      schedule,
      mapUrl,
      showTitle
    },
    addressesSectionTitle,
    socialMedia[]{
      name,
      url
    },
    socialMediaSectionTitle,
    showWhatsappButton,
    whatsappNumber,
    whatsappMessage,
    cartWhatsappButtonText,
    whatsappFooterText
  },
  "theme": *[_type == "theme" && _id == "theme"][0]{
    "productBackgroundImage": productBackgroundImage.asset->url,
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
  },
  "typography": *[_type == "typography" && _id == "typography"][0]{
    sectionTitle {
      ...,
      "customFileUrl": customFile.asset->url
    },
    productTitle {
      ...,
      "customFileUrl": customFile.asset->url
    },
    productPrice {
      ...,
      "customFileUrl": customFile.asset->url
    },
    productDescription {
      ...,
      "customFileUrl": customFile.asset->url
    },
    productNameModal {
      ...,
      "customFileUrl": customFile.asset->url
    }
  },
  "menu": *[_type == "menu" && _id == "menu"][0]{
    currencySymbol,
    priceDivider,
    heroCarousel[]{
      title,
      thumbnail,
      "thumbVideoFileUrl": thumbVideoFile.asset->url,
      mediaType,
      "videoFileUrl": videoFile.asset->url,
      videoUrl,
      fullImage,
      linkedProduct->{
        name,
        "slug": slug.current,
        price,
        price2,
        price3,
        description,
        imgSrc,
        protein,
        extras,
        extrasMin,
        extrasIncluded,
        extrasMax,
        extrasTitleSingular,
        extrasTitlePlural,
        optionGroups,
        variantGroups,
        optionGroupsRefs[]->{
          title,
          showTitle,
          options[]{ name, price, isDefault }
        },
        extraGroupsRefs[]->{
          titleSingular,
          titlePlural,
          extras[]{ name, price, isRecommended },
          min,
          included,
          max,
          allowQuantity
        }
      }
    },
    seasonalSpecials{
      title,
      subtitle,
      items[]{
        name,
        "slug": slug.current,
        subtitle,
        availability,
        "price": coalesce(price, "0"),
        price2,
        description,
        imgSrc,
        alt,
        available,
        isNew,
        servings,
        protein,
        optionGroups[]{
          title,
          showTitle,
          options[]{
            name,
            price,
            isDefault
          }
        },
        variantGroups[]{
          title,
          showTitle,
          variants[]{
            name,
            price,
            image,
            isDefault
          }
        },
        optionGroupsRefs[]->{
            title,
            showTitle,
            options[]{ name, price, isDefault }
        },
        extraGroupsRefs[]->{
            titleSingular,
            titlePlural,
            extras[]{ name, price, isRecommended },
            min,
            included,
            max,
            allowQuantity
        },
        extras[]{
          name,
          price,
          isRecommended
        },
        extrasMin,
        extrasIncluded,
        extrasMax,
        modalOrderLayout
      }
    },
    "sections": *[_type == "category"]{
    _type,
    title,
    subtitle,
    version,
    designConfig,
    customStyles,
    sortAlphabetically,
    "iconUrl": icon.asset->url,
    "items": products[]->{
      name,
      "slug": slug.current,
      subtitle,
      "price": coalesce(price, "0"),
      price2,
      description,
      imgSrc,
      gallery,
      alt,
      available,
      bestSeller,
      isNew,
      servings,
      protein,
      optionGroups[]{
        title,
        showTitle,
        options[]{
          name,
          price,
          isDefault
        }
      },
      variantGroups[]{
        title,
        showTitle,
        variants[]{
          name,
          price,
          image,
          isDefault
        }
      },
      optionGroupsRefs[]->{
          title,
          showTitle,
          options[]{ name, price, isDefault }
      },
      extraGroupsRefs[]->{
          titleSingular,
          titlePlural,
          extras[]{ name, price, isRecommended },
          min,
          included,
          max,
          allowQuantity
      },
      extrasTitleSingular,
      extrasTitlePlural,
      extrasMin,
      extrasIncluded,
      extrasMax,
      modalOrderLayout
    },
    extraGroupsRefs[]->{
        titleSingular,
        titlePlural,
        extras[]{ name, price, isRecommended },
        min,
        included,
        max,
        allowQuantity
    }
    },
    bestSellersTitleSingular,
    bestSellersTitlePlural,
    "bestSellersItems": bestSellersItems[]->{
      name,
      "slug": slug.current,
      subtitle,
      "price": coalesce(price, "0"),
      price2,
      description,
      imgSrc,
      gallery,
      alt,
      available,
      isNew,
      servings,
      protein,
      modalOrderLayout,
      optionGroups[]{
        title,
        showTitle,
        options[]{ name, price, isDefault }
      },
      variantGroups[]{
        title,
        showTitle,
        variants[]{ name, price, image, isDefault }
      },
      optionGroupsRefs[]->{
        title,
        showTitle,
        options[]{ name, price, isDefault }
      },
      extraGroupsRefs[]->{
        titleSingular,
        titlePlural,
        extras[]{ name, price, isRecommended },
        min,
        included,
        max,
        allowQuantity
      },
      extrasTitleSingular,
      extrasTitlePlural,
      extrasMin,
      extrasIncluded,
      extrasMax
    },
    showNewsSection,
    newsTitleSingular,
    newsTitlePlural,
    defaultSectionLayout,
    showCategoriesPage,
    categoriesLayout,
    categoriesLayoutConfig,
    "categoriesOrder": categoriesOrder[]->{_id}
  },
  "newCategories": *[_type == "category"]{
    _id,
    _type,
    title,
    subtitle,
    version,
    designConfig,
    customStyles,
    sortAlphabetically,
    "iconUrl": icon.asset->url,
    "items": products[]->{
      name,
      "slug": slug.current,
      subtitle,
      "price": coalesce(price, "0"),
      price2,
      description,
      imgSrc,
      gallery,
      alt,
      available,
      bestSeller,
      isNew,
      servings,
      protein,
      optionGroups[]{
        title,
        showTitle,
        options[]{
          name,
          price,
          isDefault
        }
      },
      variantGroups[]{
        title,
        showTitle,
        variants[]{
          name,
          price,
          image,
          isDefault
        }
      },
      optionGroupsRefs[]->{
          title,
          showTitle,
          options[]{ name, price, isDefault }
      },
      extraGroupsRefs[]->{
          titleSingular,
          titlePlural,
          extras[]{ name, price, isRecommended },
          min,
          included,
          max,
          allowQuantity
      },
      extrasTitleSingular,
      extrasTitlePlural,
      extrasMin,
      extrasIncluded,
      extrasMax,
      modalOrderLayout
    },
    extraGroupsRefs[]->{
        titleSingular,
        titlePlural,
        extras[]{ name, price, isRecommended },
        min,
        included,
        max,
        allowQuantity
    }
  },
  "config": *[_type == "siteConfig" && _id == "siteConfig"][0]{
    ga4Id,
    restaurantId,
    siteUrl,
    agentName,
    enableOrdering,
    hasDelivery,
    hasPickup,
    hasDineIn,
    tableCount,
    showProductNotes
  }
}`;

/**
 * Obtiene todos los datos del menú desde Sanity
 * @returns Datos del menú o null si hay error
 */
export async function getMenuData() {
  try {
    const data = await sanityClient.fetch(menuDataQuery);
    if (!data || !data.brand || !data.menu) return null;

    // Merge brand and menu data to match the expected structure of the frontend

    // Conjunto de slugs de bestsellers para derivar el badge en cada producto
    const bestSellerSlugs = new Set<string>(
      (data.menu.bestSellersItems || []).map((p: any) => p.slug).filter(Boolean)
    );

    // Helper: inyecta bestSeller computado en un item de producto
    const withBestSeller = (item: any) => ({
      ...item,
      bestSeller: bestSellerSlugs.has(item.slug || '')
    });

    return {
      currencySymbol: data.menu.currencySymbol,
      priceDivider: data.menu.priceDivider,
      addresses: data.brand.addresses,
      addressesSectionTitle: data.brand.addressesSectionTitle,
      socialMedia: data.brand.socialMedia,
      socialMediaSectionTitle: data.brand.socialMediaSectionTitle,
      seasonalSpecials: data.menu.seasonalSpecials
        ? {
            ...data.menu.seasonalSpecials,
            items: (data.menu.seasonalSpecials.items || []).map(withBestSeller)
          }
        : null,
      sections: (() => {
        const allCategories: any[] = data.newCategories || [];
        const orderIds: string[] = (data.menu.categoriesOrder || []).map((c: any) => c._id);

        // Si hay un orden definido, úsalo; si no, usa el array tal cual
        const ordered = orderIds.length > 0
          ? orderIds
              .map((id: string) => allCategories.find((c: any) => c._id === id))
              .filter(Boolean)
          : allCategories;

        return ordered.map((section: any) => {
          const items = section.sortAlphabetically
            ? [...(section.items || [])].sort((a: any, b: any) =>
                (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
              )
            : (section.items || []);
          return {
            ...section,
            items: items.map(withBestSeller)
          };
        });
      })(),
      bestSellersTitleSingular: data.menu.bestSellersTitleSingular,
      bestSellersTitlePlural: data.menu.bestSellersTitlePlural,
      // bestSellersItems: todos son bestsellers por definición
      bestSellersItems: (data.menu.bestSellersItems ?? []).map((item: any) => ({
        ...item,
        bestSeller: true
      })),
      showNewsSection: data.menu.showNewsSection,
      newsTitleSingular: data.menu.newsTitleSingular,
      newsTitlePlural: data.menu.newsTitlePlural,
      defaultSectionLayout: data.menu.defaultSectionLayout,
      showCategoriesPage: data.menu.showCategoriesPage,
      categoriesLayout: data.menu.categoriesLayout,
      categoriesLayoutConfig: data.menu.categoriesLayoutConfig,
      heroCarousel: data.menu.heroCarousel || [],
      // Add brand info if needed elsewhere, or keep it flat if that's what components expect
      brand: {
        name: data.brand.name,
        logo: data.brand.logo,
        logoOverlay: data.brand.logoOverlay,
        favicon: data.brand.favicon,
        description: data.brand.description,
        keywords: data.brand.keywords,
      },
      // Tema (documento independiente)
      theme: data.theme ?? null,
      // Tipografía (documento independiente)
      typography: data.typography ?? null,
      // WhatsApp button config
      showWhatsappButton: data.brand.showWhatsappButton,
      whatsappNumber: data.brand.whatsappNumber,
      whatsappMessage: data.brand.whatsappMessage,
      // Cart WhatsApp button text
      cartWhatsappButtonText: data.brand.cartWhatsappButtonText || 'Enviar por WhatsApp',
      whatsappFooterText: data.brand.whatsappFooterText || '_Enviado desde el TuMenú.click_',
      // Add config for GA4
      config: data.config
    };
  } catch (error) {
    console.error('Error fetching menu data from Sanity:', error);
    return null;
  }
}

