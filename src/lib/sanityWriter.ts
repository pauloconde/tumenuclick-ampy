// src/lib/sanityWriter.ts
// Sanity client with write capabilities for theme mutations

import { createClient } from '@sanity/client';

/**
 * Sanity client configured with write token for mutations
 * Only used server-side in API endpoints
 */
export const sanityWriter = createClient({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
    token: import.meta.env.SANITY_DEV_TOKEN,
});

/**
 * Updates the brand document with new theme colors
 * @param themeData - Nested theme data matching Sanity schema
 */
export async function updateBrandTheme(themeData: Record<string, Record<string, string>>): Promise<void> {
    const patch = sanityWriter.patch('brand');

    // Apply each theme category
    for (const [category, fields] of Object.entries(themeData)) {
        for (const [field, value] of Object.entries(fields)) {
            patch.set({ [`${category}.${field}`]: value });
        }
    }

    await patch.commit();
}
