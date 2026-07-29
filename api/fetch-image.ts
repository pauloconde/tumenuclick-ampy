import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Serverless function to fetch images from Sanity CDN
 * This bypasses CORS restrictions for client-side image sharing
 * 
 * Usage: GET /api/fetch-image?url=<sanity_image_url>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const imageUrl = req.query.url as string;

    // Validate URL parameter
    if (!imageUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Security: Only allow Sanity CDN URLs
    const allowedDomains = ['cdn.sanity.io', 'images.unsplash.com'];
    try {
        const url = new URL(imageUrl);
        if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
            return res.status(403).json({ error: 'Domain not allowed' });
        }
    } catch {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        // Fetch the image from the source
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch image' });
        }

        // Get the image data
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Set CORS headers to allow any origin
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        // Send the image
        return res.send(Buffer.from(imageBuffer));
    } catch (error) {
        console.error('Error fetching image:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
