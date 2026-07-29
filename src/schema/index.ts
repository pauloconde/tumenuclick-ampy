import {
  configType, // Nuevo
  brandType,
  menuType,
  typographyType,
  themeDocumentType,
  builderOptionType,
  builderStepType,
  productBuilderType,
  // dishType,
  addressType,
  socialMediaType,
  extraType,
  variantItemType, // Nuevo: variantes
  variantGroupType, // Nuevo: grupos de variantes
  optionItemType, // Nuevo: opciones mutuamente excluyentes
  optionGroupType, // Nuevo: grupos de opciones
  optionGroupTemplateType,
  extraGroupTemplateType,
  seasonalSpecialsType,
  // Tipos de Tema
  themeApplicationType,
  themeNavbarType,
  themeBestSellersType,
  themeSeasonalType,
  themeExtrasType,
  themeModalType,
  themeFooterType,
  themeSubfooterType,
  themeUIType,
  themeOrderingType,
  themeProductBuilderType,
  fontType
} from './menuTypes';
import { categoryType } from './categoryTypes';
import { productType } from './productTypes';

export const schema = [
  configType, // Aparecerá de primero en el Studio
  brandType,
  menuType,
  typographyType,
  themeDocumentType,
  builderOptionType,
  builderStepType,
  productBuilderType,
  // dishType,
  addressType,
  socialMediaType,
  extraType,
  variantItemType,
  variantGroupType,
  optionItemType, // Nuevo: opciones mutuamente excluyentes
  optionGroupType, // Nuevo: grupos de opciones
  optionGroupTemplateType,
  extraGroupTemplateType,
  fontType, // Nuevo: Configuración de fuentes
  seasonalSpecialsType,
  // Tipos de Tema
  themeApplicationType,
  themeNavbarType,
  themeBestSellersType,
  themeSeasonalType,
  themeExtrasType,
  themeModalType,
  themeFooterType,
  themeSubfooterType,
  themeUIType,
  themeOrderingType,
  themeProductBuilderType,
  categoryType,
  productType
];