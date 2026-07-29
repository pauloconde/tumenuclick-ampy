import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';

export const prerender = false;

// Create a client with write access
// We need to use the server-side environment variables for the token
const client = createClient({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: import.meta.env.PUBLIC_SANITY_DATASET,
    token: import.meta.env.SANITY_API_TOKEN || import.meta.env.SANITY_DEV_TOKEN,
    apiVersion: '2023-05-03',
    useCdn: false,
});

/**
 * API endpoint for bulk theme operations
 * 
 * GET: Fetches the full brand document for analysis
 * POST: Performs bulk search and replace of colors
 */
export const GET: APIRoute = async () => {
    // Check if editor is enabled
    const isEnabled = import.meta.env.THEME_EDITOR_ENABLED === 'true';
    if (!isEnabled) {
        return new Response('Theme editor is disabled', { status: 403 });
    }

    try {
        // Fetch published and draft documents if present
        const docs = await client.fetch('*[_type == "theme" && (_id == "theme" || _id == "drafts.theme")]');

        // Prefer draft if present, otherwise published
        const themeDoc = docs.find((d: any) => d._id === 'drafts.theme') || docs.find((d: any) => d._id === 'theme');

        if (!themeDoc) {
            return new Response(JSON.stringify({ error: 'Theme document not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(themeDoc), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Bulk Theme API Error:', error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const POST: APIRoute = async ({ request }) => {
    // Check if editor is enabled
    const isEnabled = import.meta.env.THEME_EDITOR_ENABLED === 'true';
    if (!isEnabled) {
        return new Response('Theme editor is disabled', { status: 403 });
    }

    try {
        const body = await request.json();
        const { oldColor, newColor } = body;

        if (!oldColor || !newColor) {
            return new Response(JSON.stringify({ error: 'Missing oldColor or newColor' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Prepare target color normalization
        let targetUpper = oldColor.trim().toUpperCase();
        if (/^#[0-9A-F]{3}$/.test(targetUpper)) {
            targetUpper = `#${targetUpper[1]}${targetUpper[1]}${targetUpper[2]}${targetUpper[2]}${targetUpper[3]}${targetUpper[3]}`;
        }

        // Fetch all theme docs (both published and draft if present)
        const themeDocs = await client.fetch('*[_type == "theme" && (_id == "theme" || _id == "drafts.theme")]');
        if (!themeDocs || themeDocs.length === 0) return new Response('No theme doc', { status: 404 });

        let totalCount = 0;
        const allPatches: Record<string, string> = {};

        for (const doc of themeDocs) {
            const patches: Record<string, string> = {};

            const traverse = (obj: any, path = '') => {
                for (const key in obj) {
                    if (key.startsWith('_')) continue; // Ignore system fields

                    const value = obj[key];
                    const currentPath = path ? `${path}.${key}` : key;

                    if (typeof value === 'string') {
                        let valUpper = value.trim().toUpperCase();
                        if (/^#[0-9A-F]{3}$/.test(valUpper)) {
                            valUpper = `#${valUpper[1]}${valUpper[1]}${valUpper[2]}${valUpper[2]}${valUpper[3]}${valUpper[3]}`;
                        }

                        if (valUpper === targetUpper) {
                            patches[currentPath] = newColor;
                            if (doc._id === 'theme' || !themeDocs.some((d: any) => d._id === 'theme')) {
                                totalCount++;
                            }
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        traverse(value, currentPath);
                    }
                }
            };

            traverse(doc);

            if (Object.keys(patches).length > 0) {
                Object.assign(allPatches, patches);
                await client.patch(doc._id).set(patches).commit();
            }
        }

        if (totalCount === 0 && Object.keys(allPatches).length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No matches found',
                count: 0
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Updated ${totalCount} fields`,
            count: totalCount || Object.keys(allPatches).length,
            patches: allPatches
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Bulk Theme Replace Error:', error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
