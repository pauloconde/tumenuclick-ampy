import type { APIRoute } from 'astro';
import { sanityWriter } from '../../lib/sanityWriter';

export const prerender = false;

/**
 * API endpoint for saving theme colors to Sanity
 * 
 * POST /api/theme-save
 * Body: { themeApplication: {...}, themeNavbar: {...}, ... }
 */
export const POST: APIRoute = async ({ request }) => {
    // Check if editor is enabled
    const isEnabled = import.meta.env.THEME_EDITOR_ENABLED === 'true';
    if (!isEnabled) {
        return new Response('Theme editor is disabled', { status: 403 });
    }

    // Debug logging
    console.log('--- Theme Save Request Start ---');
    console.log('Method:', request.method);
    const contentType = request.headers.get('Content-Type');
    const contentLength = request.headers.get('Content-Length');
    console.log('Content-Type:', contentType);
    console.log('Content-Length:', contentLength);

    let rawBody = "";

    try {
        // Attempt to read text
        // Note: request.text() consumes the stream.
        rawBody = await request.text();
        console.log('Body read success. Length:', rawBody.length);
    } catch (readError) {
        console.error('Error reading request body:', readError);
        return new Response(JSON.stringify({
            error: 'Failed to read request body',
            details: readError instanceof Error ? readError.message : String(readError)
        }), { status: 500 });
    }

    if (!rawBody || rawBody.trim() === '') {
        console.error('Theme save error: Empty request body');
        // Return 400 but with DEBUG info
        return new Response(JSON.stringify({
            error: 'Empty request body',
            debug: {
                method: request.method,
                contentType,
                contentLength,
                bodyLength: rawBody.length,
                isEditorEnabled: isEnabled
            }
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let themeData;
    try {
        themeData = JSON.parse(rawBody);
    } catch (e) {
        console.error('Theme save error: Invalid JSON', rawBody.substring(0, 100));
        return new Response(JSON.stringify({
            error: 'Invalid JSON body',
            snippet: rawBody.substring(0, 50)
        }), { status: 400 });
    }

    try {
        // Validate that we have data
        if (!themeData || typeof themeData !== 'object') {
            return new Response('Invalid theme data', { status: 400 });
        }

        // Build the patch for the theme document
        const patch = sanityWriter.patch('theme');

        // Apply each theme category
        for (const [category, fields] of Object.entries(themeData)) {
            if (typeof fields === 'object' && fields !== null) {
                for (const [field, value] of Object.entries(fields as Record<string, string>)) {
                    if (typeof value === 'string') {
                        patch.set({ [`${category}.${field}`]: value });
                    }
                }
            }
        }

        // Commit the patch
        await patch.commit();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Theme save error:', error);
        return new Response(
            JSON.stringify({
                error: `Error saving theme: ${error instanceof Error ? error.message : 'Unknown error'}`
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
