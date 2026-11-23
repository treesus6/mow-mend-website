import { createAppServer } from '../server.ts';

// Vercel serverless entry point: the Express app handles /api/*, /robots.txt
// and /sitemap.xml. Static pages and assets are served by Vercel from dist/
// (see vercel.json rewrites); the SPA fallback serves /index.html.
const app = await createAppServer({ skipVite: true });

export default app;
