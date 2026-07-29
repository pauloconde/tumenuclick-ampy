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
        const themeDoc = await client.fetch('*[_type == "theme" && _id == "theme"][0]');

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
        // Allow in dev mode regardless? No, stick to the config.
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

        // STRICT comparison logic preparation
        const targetUpper = oldColor.trim().toUpperCase();

        // Fetch current doc
        const themeDoc = await client.fetch('*[_type == "theme" && _id == "theme"][0]');
        if (!themeDoc) return new Response('No theme doc', { status: 404 });

        const patches: Record<string, string> = {};
        let count = 0;

        // Recursive traversal function
        const traverse = (obj: any, path = '') => {
            for (const key in obj) {
                if (key.startsWith('_')) continue; // Ignore system fields

                const value = obj[key];
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof value === 'string') {
                    // STRICT CHECK: Case-insensitive but exact length/content matches
                    if (value.trim().toUpperCase() === targetUpper) {
                        patches[currentPath] = newColor;
                        count++;
                    }
                } else if (typeof value === 'object' && value !== null) {
                    traverse(value, currentPath);
                }
            }
        };

        traverse(themeDoc);

        if (count === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No matches found',
                count: 0
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Apply patches
        await client.patch('theme').set(patches).commit();

        return new Response(JSON.stringify({
            success: true,
            message: `Updated ${count} fields`,
            count,
            patches
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
