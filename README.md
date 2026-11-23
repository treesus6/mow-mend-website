# MOW & MEND LLC — Official Website & Lead Platform

Owner-operated yard maintenance and small home/property repair website for **MOW & MEND LLC** (Vancouver, WA & Clark County).

## Business Identity
- **Business Name:** MOW & MEND LLC
- **Phone / Text:** (360) 889-8046
- **Email:** treevanderveer@gmail.com
- **WA Contractor Registration:** `MOWMEM*741QZ`
- **Service Area:** Clark County, Washington (Vancouver, Hazel Dell, Salmon Creek, Orchards, Five Corners, Camas, Ridgefield, Battle Ground, La Center, Brush Prairie)

---

## Architecture Overview
- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 (Vite)
- **Backend Server:** Express (`server.ts`) handling:
  - `POST /api/estimates` — Server-side field validation, honeypot spam protection, sliding-window IP rate limiting, magic-byte photo inspection, unique Request ID generation (`MM-YYMMDD-XXXX`), and optional Resend email alerts.
  - `GET /sitemap.xml` & `GET /robots.txt` — Dynamic local SEO sitemap and crawler rules (disallowing `/admin` and `/api/`).
  - `GET /api/health` — Health check reporting notification and calendar readiness status.
- **Database & Auth:** Firebase Firestore (`ai-studio-4fb01b97-bb2d-458e-a4f3-5173ded29f12` isolated database) + Firebase Google Sign-In.
  - Public visitors can **create** validated leads (`estimateRequests/{requestId}`) and compressed private project photos (`estimateRequests/{requestId}/photos/{photoId}`), but **cannot read, list, update, or delete** any records.
  - Only the verified owner account (`treevanderveer@gmail.com`) can access `/admin` to review customer addresses, view project photos, update job statuses, and save private internal notes.

---

## Local Setup & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment variables:**
   Copy `.env.example` to `.env` if running outside AI Studio and configure any optional secrets:
   - `APP_URL`: Public website URL (used for `/sitemap.xml` and `/robots.txt`)
   - `RESEND_API_KEY` & `RESEND_FROM_EMAIL`: Optional email alert delivery when a new estimate arrives. If omitted, leads still save cleanly to Firestore and the server reports `notificationStatus: "unconfigured"`.
3. **Run development server (port 3000):**
   ```bash
   npm run dev
   ```
4. **Build and run production server:**
   ```bash
   npm run build
   npm start
   ```
5. **Run TypeScript checks, security rules ESLint, and automated tests:**
   ```bash
   npm run lint
   npx eslint firestore.rules
   npm test
   ```

---

## How to Update Prices, Services, Photos, and Business Details

- **Starting Prices, Ranges, Hourly Rates & Deposit Policy:**
  Edit `src/config/pricing.ts` (`PRICING_CONFIG`). Every price displayed across the Home, Services, and Estimate views imports directly from this file.
- **Business phone, email, contractor registration, cities, or social links:**
  Edit `src/config/business.ts`.
- **Services (4 categories, one-liners, included checklist, helpful estimate prompts, scope notes):**
  Edit `src/data/services.ts`.
- **Before & After Project Photos (`Our Work`):**
  Once you have approved customer-safe before/after images:
  1. Place optimized JPEG/WebP images in `public/projects/` (or `src/assets/projects/`).
  2. In `src/data/projects.ts`, set `hasApprovedPhotos: true` and provide `beforeImageUrl` and `afterImageUrl` for each project. Never publish customer street addresses.
- **Official Mascot Artwork:**
  `public/images/smokiey-mascot.png` stores the official Smokiey the Mower artwork used in the header, hero, confirmation screen, and favicons (`public/favicon.ico`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`).

---

## Pre-Launch Owner Checklist
Before sharing the site publicly with customers:
1. Verify current Washington contractor registration (`MOWMEM*741QZ`) and general liability insurance status.
2. Add real before/after project photos to `src/data/projects.ts`.
3. Add verified Google Business Profile and Facebook page URLs in `src/config/business.ts`.
4. (Optional) Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in environment secrets if you want instant email notifications on every new estimate request; otherwise check `/admin` or rely on direct phone/text leads.
5. Sign in once at `/admin` using `treevanderveer@gmail.com` to verify your Owner Dashboard access.

---

## Deployment (Vercel — live hosting)

The live site is hosted on Vercel (free Hobby tier), NOT on Google Cloud — no
Google billing account is needed. Source of truth is this GitHub repo.

- Pushes to `main` auto-deploy via the linked Vercel project.
- `vercel.json` routes `/api/*`, `/robots.txt`, and `/sitemap.xml` to the
  Express app in `api/index.ts`; everything else is served from the Vite
  build in `dist/` (SPA fallback to `/index.html`).
- The Express server's Vite import is lazy (dev-only) so the serverless
  bundle stays lean.
- `.npmrc` sets `legacy-peer-deps=true` — required because npm's strict peer
  resolution rejects the vite/esbuild combination that Bun (used by AI Studio)
  accepts. Keep it; Vercel's `npm install` needs it too.
- The site talks to the same Firebase/Firestore backend it used in AI Studio
  (`firebase-applet-config.json`, project `gen-lang-client-0601944756`,
  database `ai-studio-remixmowmendllc-73e4cc26-067d-45ba-aaf3-957adde4e33f`),
  which runs on Firebase's free Spark plan — no billing there either.
- Email notifications stay off until `RESEND_API_KEY` / `RESEND_FROM_EMAIL`
  are set as Vercel environment variables; leads still save to Firestore and
  show in `/admin`.

The Google AI Studio copy ("Remix MOW & MEND LLC") is kept as a backup only.
