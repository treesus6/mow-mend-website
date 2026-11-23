import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { SERVICES } from './src/data/services.ts';
import { MAX_PHOTOS_PER_REQUEST, MAX_RAW_PHOTO_BYTES } from './src/lib/validation.ts';
import { handleEstimateValidationRequest } from './server/estimateHandler.ts';

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RAW_PHOTO_BYTES,
    files: MAX_PHOTOS_PER_REQUEST,
  },
});

function resolveBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
}

export async function createAppServer(options?: { skipVite?: boolean }) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    const notificationsConfigured = Boolean(
      process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim()
    );
    res.json({
      ok: true,
      service: 'mow-and-mend-web',
      notificationsConfigured,
      calendarConnected: false,
    });
  });

  app.post(
    '/api/estimates',
    (req, res, next) => {
      upload.array('photos', MAX_PHOTOS_PER_REQUEST)(req, res, (err) => {
        if (err) {
          const message =
            err instanceof multer.MulterError
              ? err.code === 'LIMIT_FILE_SIZE'
                ? 'One of the uploaded photos exceeds the 5 MB limit.'
                : err.code === 'LIMIT_FILE_COUNT'
                  ? `Maximum ${MAX_PHOTOS_PER_REQUEST} photos allowed per request.`
                  : err.message
              : err instanceof Error && err.message
                ? err.message
                : 'Invalid file upload.';
          res.status(400).json({ ok: false, error: message, fieldErrors: {} });
          return;
        }
        next();
      });
    },
    (req, res, next) => {
      Promise.resolve(handleEstimateValidationRequest(req, res)).catch(next);
    }
  );

  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const staticPaths = [
      '/',
      '/services',
      '/our-work',
      '/about',
      '/service-areas',
      '/estimate',
      '/contact',
      '/privacy',
    ];
    const servicePaths = SERVICES.map((s) => `/services/${s.slug}`);
    const urls = [...staticPaths, ...servicePaths];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(
        (p) =>
          `  <url><loc>${baseUrl}${p}</loc><changefreq>${p === '/' ? 'weekly' : 'monthly'}</changefreq></url>`
      ),
      '</urlset>',
    ].join('\n');

    res.type('application/xml').send(xml);
  });

  // Never expose public customer records endpoint
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ ok: false, error: 'Endpoint not found.', fieldErrors: {} });
  });

  if (!isProduction && !options?.skipVite) {
    // Vite is imported lazily so production/serverless bundles (which never
    // run the dev server) don't have to include it.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (isProduction) {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send('Production build not found. Run npm run build first.');
      }
    });
  }

  // Global JSON error-handling middleware (prevents Express HTML 500/400 pages)
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (res.headersSent) {
        next(err);
        return;
      }
      const errObj = err as { status?: number; statusCode?: number; message?: string } | null;
      const statusCandidate =
        typeof errObj?.status === 'number'
          ? errObj.status
          : typeof errObj?.statusCode === 'number'
            ? errObj.statusCode
            : 500;
      const statusCode = statusCandidate >= 400 && statusCandidate < 600 ? statusCandidate : 500;
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Unexpected server error. Please try again or call (360) 889-8046.';
      console.error('Express error middleware caught:', err);
      res.status(statusCode).json({
        ok: false,
        error: message,
        fieldErrors: {},
      });
    }
  );

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]).endsWith('server.ts')) {
  createAppServer()
    .then((app) => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`MOW & MEND LLC server listening on http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}
