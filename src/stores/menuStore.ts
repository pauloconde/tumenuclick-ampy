
import { atom } from 'nanostores';

export interface MenuState {
    selectedCategorySlug: string | null;
    isCategoriesMode: boolean; // True if we are showing the grid, false if showing a single category (in the context of the new feature)
}

// Store for the selected category slug (normalized title)
export const selectedCategory = atom<string | null>(null);

// Store for the real-time search query
export const searchQuery = atom<string>('');

// Helper to normalize strings for ID/Slug matching (same logic as in Navbar/index)
export const normalizeSlug = (str: string) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, ''); // Remove accent marks
};

// Helper to normalize text for search comparison (lowercase and no accents)
export const normalizeSearchText = (str: string) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};
