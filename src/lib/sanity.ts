// src/lib/sanity.ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});
