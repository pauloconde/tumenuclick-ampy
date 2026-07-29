import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || 'tu-project-id',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_DEV_TOKEN,
    useCdn: false,
});

async function checkBuilders() {
    const menuDoc = await client.fetch(`*[_type == "menu" && _id == "menu"][0]{
        sections[ _type != 'menuSection' ]
    }`);

    console.log(JSON.stringify(menuDoc, null, 2));
}

checkBuilders();
