import { beforeEach, describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createAppServer } from '../server.ts';
import { EstimateConfirmation, EstimateForm } from '../src/components/EstimateForm.tsx';
import { BUSINESS_INFO } from '../src/config/business.ts';
import { PRICING_CONFIG } from '../src/config/pricing.ts';
import { CatalogProvider, mergeCatalogOverrides } from '../src/context/CatalogContext.tsx';
import { SERVICE_CATEGORIES, SERVICES } from '../src/data/services.ts';
import { COMPLETED_JOB_PHOTOS } from '../src/data/projects.ts';
import {
  computeQuoteTotals,
  DEFAULT_WA_SALES_TAX_PERCENT,
  findScheduleSlotConflict,
  normalizeSlotKey,
} from '../src/lib/quoteMath.ts';
import { validateEstimateInput } from '../src/lib/validation.ts';
import { LEAD_STATUSES, normalizeLeadStatus } from '../src/types/estimate.ts';
import {
  generateRequestId,
  handleEstimateValidationRequest,
  hasValidImageMagicBytes,
  resetRateLimiterForTests,
} from '../server/estimateHandler.ts';

function createMockResponse() {
  const res: Partial<Response> & { statusCode: number; body: unknown } = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this as Response;
    },
    json(payload: unknown) {
      this.body = payload;
      return this as Response;
    },
  };
  return res;
}

describe('MOW & MEND LLC Business, Services & Pricing Invariants', () => {
  it('exposes accurate public contact info, 4 service categories, 13 services, and pricing rules', () => {
    expect(BUSINESS_INFO.phoneDisplay).toBe('(360) 889-8046');
    expect(BUSINESS_INFO.email).toBe('treevanderveer@gmail.com');
    expect(BUSINESS_INFO.contractorRegistration).toBe('MOWMEM*741QZ');
    expect(BUSINESS_INFO.locationDisplay).toBe('Vancouver, Washington');
    expect(BUSINESS_INFO.serviceAreas.length).toBe(10);

    expect(SERVICE_CATEGORIES.length).toBe(4);
    expect(SERVICES.length).toBe(13);

    const allServiceText = SERVICES.map(
      (s) => `${s.title} ${s.oneLiner} ${s.included.join(' ')} ${s.priceLabel}`
    )
      .join(' ')
      .toLowerCase();
    expect(allServiceText).toContain('faucet');
    expect(allServiceText).toContain('toilet');
    expect(allServiceText).toContain('cabinet');
    expect(allServiceText).toContain('drywall');
    expect(allServiceText).toContain('deadbolt');
    expect(allServiceText).toContain('holiday');

    expect(Object.keys(PRICING_CONFIG.entries).length).toBe(23);

    // Changed entries (Nov 23 market-checked prices)
    expect(PRICING_CONFIG.entries.leafCleanup.startingDisplay).toBe(
      'Starting at $70 / hr labor + haul-away'
    );
    expect(PRICING_CONFIG.entries.pressureWashDeckPatio.startingDisplay).toBe(
      'From $125 standalone ($90 as add-on)'
    );
    expect(PRICING_CONFIG.entries.handymanGeneral.startingDisplay).toBe(
      'Starting at $70 / hr (2-hour minimum, $140 minimum)'
    );
    expect(PRICING_CONFIG.entries.handymanGeneral.notes).toContain('$75/door');
    expect(PRICING_CONFIG.entries.handymanGeneral.notes).toContain('from $150');
    expect(PRICING_CONFIG.entries.handymanGeneral.notes).toContain('from $120');
    expect(PRICING_CONFIG.entries.handymanGeneral.notes).toContain('$50/screen');
    expect(PRICING_CONFIG.entries.handymanGeneral.notes).toContain('$100/screen');
    expect(PRICING_CONFIG.entries.handymanGeneral.notes).toContain('sliding door screen from $150');
    expect(PRICING_CONFIG.entries.handymanGeneral.notes).toContain('$120 min/visit');

    expect(PRICING_CONFIG.entries.handymanSkilledCarpentry.startingDisplay).toBe(
      'Starting at $85 / hr (2-hour minimum)'
    );
    expect(PRICING_CONFIG.entries.faucetBath.startingDisplay).toBe(
      'Starting at $175 labor (faucet extra)'
    );
    expect(PRICING_CONFIG.entries.faucetBath.notes).toContain('from $140');
    expect(PRICING_CONFIG.entries.faucetBath.notes).toContain('from $300');
    expect(PRICING_CONFIG.entries.faucetBath.notes).toContain('$40 add-on / $75 alone');

    expect(PRICING_CONFIG.entries.faucetKitchen.startingDisplay).toBe(
      'Starting at $200 labor (faucet extra)'
    );
    expect(PRICING_CONFIG.entries.toiletRepair.startingDisplay).toBe('Starting at $140');
    expect(PRICING_CONFIG.entries.toiletInstall.startingDisplay).toBe(
      'Starting at $225 labor (toilet extra)'
    );
    expect(PRICING_CONFIG.entries.furnitureAssembly.startingDisplay).toBe(
      '$65–$200 typical / item'
    );
    expect(PRICING_CONFIG.entries.holidayLights.startingDisplay).toBe(
      'From $400 minimum (your lights) / $650 minimum (we supply LEDs + clips) · Typical single-story around $550 / around $800 · Two-story +$150'
    );
    expect(PRICING_CONFIG.entries.concreteMinorHaulTurnover.startingDisplay).toBe(
      'Custom estimate · Small concrete repairs $200 minimum · Minor hauling $120 minimum (based on $70–$85/hr + load)'
    );

    // Unchanged entries & deposit/trip-fee policies
    expect(PRICING_CONFIG.entries.smallLawnMowing.startingDisplay).toBe('Starting at $60 / visit');
    expect(PRICING_CONFIG.entries.gutterCleaning.startingDisplay).toContain('$149');
    expect(PRICING_CONFIG.entries.pressureWashDriveway.startingDisplay).toContain('$175');
    expect(PRICING_CONFIG.entries.pressureWashHouse.startingDisplay).toContain('$350');
    expect(PRICING_CONFIG.entries.fenceGateRepair.startingDisplay).toContain('$200–$800+');
    expect(PRICING_CONFIG.entries.fencePostReplacement.startingDisplay).toContain('$250');
    expect(PRICING_CONFIG.entries.drywallPatching.startingDisplay).toContain('$150');
    expect(PRICING_CONFIG.entries.interiorPainting.startingDisplay).toContain('$350');
    expect(PRICING_CONFIG.entries.weedingEdgingAddon.startingDisplay).toContain('$50–$100');
    expect(PRICING_CONFIG.entries.yardCleanup.startingDisplay).toContain('$250–$600');
    expect(PRICING_CONFIG.entries.brushRemoval.startingDisplay).toContain('$150–$400');
    expect(PRICING_CONFIG.entries.pruningHedge.startingDisplay).toContain('$100–$250');

    expect(PRICING_CONFIG.depositPolicy.percent).toBe(50);
    expect(PRICING_CONFIG.depositPolicy.minimumUsd).toBe(50);
    expect(PRICING_CONFIG.tripFee.amountUsd).toBe(75);
    expect(PRICING_CONFIG.tripFee.detail).toBe(
      '$75 for an on-site estimate visit, credited toward the job if booked; free pricing from photos.'
    );
  });

  it('exposes 5 neutral completed-job gallery photos with zero customer names', () => {
    expect(COMPLETED_JOB_PHOTOS.length).toBe(5);
    const serialized = JSON.stringify(COMPLETED_JOB_PHOTOS).toLowerCase();
    expect(serialized).not.toContain('marcy');
    for (const photo of COMPLETED_JOB_PHOTOS) {
      expect(photo.imageUrl.startsWith('/images/')).toBe(true);
      expect(photo.alt.length).toBeGreaterThan(15);
    }
  });
});

describe('Estimate Input Validation & Multi-Select Services', () => {
  const validPayload = {
    customerName: 'Jordan Taylor',
    phone: '(360) 555-0199',
    email: 'jordan@example.com',
    preferredContact: 'text',
    services: [
      'Lawn Mowing, Edging & Trimming',
      'Plumbing Fixtures & Leak Fixes',
    ],
    serviceType: 'Lawn Mowing, Edging & Trimming, Plumbing Fixtures & Leak Fixes',
    streetAddress: '4120 NE 78th St',
    city: 'Vancouver',
    zipCode: '98665',
    description: 'Front and backyard mowing plus kitchen faucet replacement.',
    debrisHauling: 'no',
    preferredDate: '2026-12-01',
    preferredTimeframe: 'Morning (8:00 AM – 12:00 PM)',
    additionalDetails: 'Side gate unlocked.',
    consentAccepted: true,
    honeypot: '',
  };

  it('accepts a valid multi-select estimate submission and deduplicates repeated services', () => {
    const res = validateEstimateInput({
      ...validPayload,
      services: [
        'Lawn Mowing, Edging & Trimming',
        'Plumbing Fixtures & Leak Fixes',
        'lawn mowing, edging & trimming',
      ],
    });
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual({});
    expect(res.sanitized.city).toBe('Vancouver');
    expect(res.sanitized.services).toEqual([
      'Lawn Mowing, Edging & Trimming',
      'Plumbing Fixtures & Leak Fixes',
    ]);
    expect(res.sanitized.serviceType).toBe(
      'Lawn Mowing, Edging & Trimming, Plumbing Fixtures & Leak Fixes'
    );
  });

  it('parses JSON-encoded services array strings and rejects zero selected services', () => {
    const jsonRes = validateEstimateInput({
      ...validPayload,
      services: JSON.stringify([
        'Gutter Cleaning',
        'Drywall Repair & Interior Painting',
      ]) as unknown as string[],
      serviceType: '',
    });
    expect(jsonRes.valid).toBe(true);
    expect(jsonRes.sanitized.services).toEqual([
      'Gutter Cleaning',
      'Drywall Repair & Interior Painting',
    ]);

    const emptyRes = validateEstimateInput({
      ...validPayload,
      services: [],
      serviceType: '',
    });
    expect(emptyRes.valid).toBe(false);
    expect(emptyRes.errors.serviceType).toBeDefined();
  });

  it('rejects invalid email, short phone, bad ZIP, and missing consent', () => {
    const res = validateEstimateInput({
      ...validPayload,
      phone: '123',
      email: 'not-an-email',
      zipCode: 'abc',
      consentAccepted: false,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.phone).toBeDefined();
    expect(res.errors.email).toBeDefined();
    expect(res.errors.zipCode).toBeDefined();
    expect(res.errors.consentAccepted).toBeDefined();
  });

  it('blocks honeypot spam submissions', () => {
    const res = validateEstimateInput({
      ...validPayload,
      honeypot: 'http://spam.example.com',
    });
    expect(res.valid).toBe(false);
    expect(res.errors._form).toBeDefined();
  });
});

describe('Estimate Form Multi-Select & Confirmation Rendering', () => {
  it('renders all 13 services as multi-select checkboxes and lists all selected services on confirmation', () => {
    const formHtml = renderToStaticMarkup(
      React.createElement(CatalogProvider, null, React.createElement(EstimateForm))
    );
    const checkboxMatches = formHtml.match(/name="services"/g) ?? [];
    expect(checkboxMatches.length).toBe(13);
    for (const svc of SERVICES) {
      expect(formHtml).toContain(svc.title.replace(/&/g, '&amp;'));
    }
    expect(formHtml).toContain('$75 for an on-site estimate visit, credited toward the job if booked; free pricing from photos.');

    const confirmationHtml = renderToStaticMarkup(
      React.createElement(EstimateConfirmation, {
        confirmation: {
          requestId: 'MM-2026-4821',
          customerName: 'Jordan Taylor',
          services: [
            'Lawn Mowing, Edging & Trimming',
            'Plumbing Fixtures & Leak Fixes',
            'Gutter Cleaning',
          ],
          serviceType:
            'Lawn Mowing, Edging & Trimming, Plumbing Fixtures & Leak Fixes, Gutter Cleaning',
          city: 'Vancouver',
          preferredContact: 'text',
          preferredTimeframe: 'Morning (8:00 AM – 12:00 PM)',
          preferredDate: '2026-12-01',
          photoCount: 2,
          notificationStatus: 'unconfigured',
        },
        onReset: () => {},
      })
    );

    expect(confirmationHtml).toContain('MM-2026-4821');
    expect(confirmationHtml).toContain('Requested Services (3)');
    expect(confirmationHtml).toContain('Lawn Mowing, Edging &amp; Trimming');
    expect(confirmationHtml).toContain('Plumbing Fixtures &amp; Leak Fixes');
    expect(confirmationHtml).toContain('Gutter Cleaning');
  });
});

describe('Image Magic-Byte Verification', () => {
  it('accepts valid JPEG, PNG, and WebP signatures and rejects fake buffers', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const webp = Buffer.from('RIFF1234WEBP', 'ascii');
    const htmlFake = Buffer.from('<html><script>alert(1)</script></html>', 'utf8');

    expect(hasValidImageMagicBytes(jpeg, 'image/jpeg')).toBe(true);
    expect(hasValidImageMagicBytes(png, 'image/png')).toBe(true);
    expect(hasValidImageMagicBytes(webp, 'image/webp')).toBe(true);
    expect(hasValidImageMagicBytes(htmlFake, 'image/jpeg')).toBe(false);
  });
});

describe('Server Estimate Handler & Rate Limiting', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
  });

  it('validates multi-select services, preserves services array in payload, and returns MM-YYYY-XXXX ID', async () => {
    const selected = [
      'Fence, Post, Gate & Deck Repairs',
      'Pressure Washing (Driveways, Patios, Siding & Gutters)',
    ];
    const req = {
      ip: '203.0.113.10',
      headers: {},
      body: {
        customerName: 'Sam Morgan',
        phone: '3605550188',
        email: 'sam@example.com',
        preferredContact: 'call',
        services: JSON.stringify(selected),
        serviceType: selected.join(', '),
        streetAddress: '1010 NW 99th St',
        city: 'Hazel Dell',
        zipCode: '98665',
        description: 'Need two cedar fence posts replaced plus driveway wash.',
        debrisHauling: 'yes',
        preferredDate: '',
        preferredTimeframe: 'Flexible / Next Available',
        additionalDetails: '',
        consentAccepted: 'true',
        website: '',
      },
      files: [],
    } as unknown as Request;

    const res = createMockResponse();
    await handleEstimateValidationRequest(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const payload = res.body as {
      ok: boolean;
      requestId: string;
      notificationStatus: string;
      sanitizedLead: {
        services: string[];
        serviceType: string;
      };
    };
    expect(payload.ok).toBe(true);
    expect(payload.requestId).toMatch(/^MM-\d{4}-\d{4}$/);
    expect(payload.notificationStatus).toBe('unconfigured');
    expect(payload.sanitizedLead.services).toEqual(selected);
    expect(payload.sanitizedLead.serviceType).toBe(selected.join(', '));
  });

  it('enforces per-IP rate limiting after 5 rapid requests', async () => {
    const makeReq = () =>
      ({
        ip: '198.51.100.77',
        headers: {},
        body: {
          customerName: 'Rate Limit Check',
          phone: '3605550100',
          email: 'rate@example.com',
          preferredContact: 'email',
          services: JSON.stringify(['Gutter Cleaning']),
          serviceType: 'Gutter Cleaning',
          streetAddress: '500 Main St',
          city: 'Camas',
          zipCode: '98607',
          description: 'Single story gutter cleaning and downspout flush.',
          debrisHauling: 'no',
          preferredDate: '',
          preferredTimeframe: 'Weekday Preferred',
          consentAccepted: 'true',
        },
        files: [],
      }) as unknown as Request;

    for (let i = 0; i < 5; i++) {
      const r = createMockResponse();
      await handleEstimateValidationRequest(makeReq(), r as unknown as Response);
      expect(r.statusCode).toBe(200);
    }

    const blocked = createMockResponse();
    await handleEstimateValidationRequest(makeReq(), blocked as unknown as Response);
    expect(blocked.statusCode).toBe(429);
  });

  it('generates MM-YYYY-XXXX request references matching current year and 4 random digits', () => {
    const fixedDateId = generateRequestId(new Date('2026-11-22T12:00:00Z'));
    expect(fixedDateId).toMatch(/^MM-2026-\d{4}$/);

    const currentYear = new Date().getFullYear();
    const currentId = generateRequestId();
    expect(currentId).toMatch(new RegExp(`^MM-${currentYear}-\\d{4}$`));
  });
});

describe('Admin Dashboard Quote Math, 6-Stage Pipeline & Double-Booking Prevention', () => {
  it('breaks out Labor, Materials, Disposal, Haul-Away, WA Sales Tax, 50% ($50 min) deposit, and balance due', () => {
    const totals = computeQuoteTotals(
      [
        {
          id: '1',
          category: 'Labor',
          description: 'Mowing & edging',
          quantity: 1,
          unitPriceCents: 12000,
          amountCents: 12000,
        },
        {
          id: '2',
          category: 'Materials',
          description: 'Cedar pickets',
          quantity: 3,
          unitPriceCents: 1500,
          amountCents: 4500,
        },
        {
          id: '3',
          category: 'Disposal',
          description: 'Green waste fee',
          quantity: 1,
          unitPriceCents: 2000,
          amountCents: 2000,
        },
        {
          id: '4',
          category: 'Haul-Away',
          description: 'Trailer haul',
          quantity: 1,
          unitPriceCents: 3500,
          amountCents: 3500,
        },
      ],
      DEFAULT_WA_SALES_TAX_PERCENT
    );

    expect(totals.laborCents).toBe(12000);
    expect(totals.materialsCents).toBe(4500);
    expect(totals.disposalCents).toBe(2000);
    expect(totals.haulAwayCents).toBe(3500);
    expect(totals.subtotalCents).toBe(22000);
    expect(totals.taxCents).toBe(Math.round(22000 * 0.087));
    expect(totals.totalCents).toBe(22000 + totals.taxCents);
    expect(totals.depositRequiredCents).toBe(Math.round(totals.totalCents * 0.5));
    expect(totals.balanceDueOnCompletionCents).toBe(
      totals.totalCents - totals.depositRequiredCents
    );

    // Enforces $50 minimum deposit when total >= $50 and 50% would be under $50
    const smallJob = computeQuoteTotals(
      [
        {
          id: 's',
          category: 'Labor',
          description: 'Minimum visit',
          quantity: 1,
          unitPriceCents: 6000,
          amountCents: 6000,
        },
      ],
      0
    );
    expect(smallJob.depositRequiredCents).toBe(5000);
    expect(smallJob.balanceDueOnCompletionCents).toBe(1000);
  });

  it('prevents double-booking the same day/time slot across different leads while allowing same-lead updates', () => {
    const slotKey = normalizeSlotKey('2026-11-28', '09:00 AM');
    const booked = [
      {
        slotKey,
        requestId: 'MM-2026-1001',
        customerName: 'Sam Morgan',
        city: 'Vancouver',
        scheduledDate: '2026-11-28',
        scheduledTime: '09:00 AM',
      },
    ];

    const conflict = findScheduleSlotConflict(booked, 'MM-2026-2002', '2026-11-28', '09:00 AM');
    expect(conflict?.requestId).toBe('MM-2026-1001');

    expect(findScheduleSlotConflict(booked, 'MM-2026-1001', '2026-11-28', '09:00 AM')).toBeNull();
    expect(findScheduleSlotConflict(booked, 'MM-2026-2002', '2026-11-28', '01:00 PM')).toBeNull();
  });

  it('exposes the exact 6-stage pipeline and maps legacy statuses cleanly', () => {
    expect(LEAD_STATUSES).toEqual([
      'New',
      'Estimate Sent',
      'Booked',
      'In Progress',
      'Completed',
      'Paid',
    ]);
    expect(normalizeLeadStatus('Contacted')).toBe('New');
    expect(normalizeLeadStatus('Quoted')).toBe('Estimate Sent');
    expect(normalizeLeadStatus('Scheduled')).toBe('Booked');
    expect(normalizeLeadStatus('Paid')).toBe('Paid');
  });
});

describe('HTTP Route Regression & Catalog Pricing Sync', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it('POST /api/estimates accepts the exact multipart FormData payload (with and without 203KB JPEG) and returns 200 MM-YYYY-XXXX', async () => {
    const app = await createAppServer({ skipVite: true });
    const server = await new Promise<import('node:http').Server>((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });

    try {
      const port = (server.address() as AddressInfo).port;
      const baseUrl = `http://127.0.0.1:${port}`;
      const buildExactFormData = (includePhoto: boolean) => {
        const fd = new FormData();
        fd.append('customerName', 'TEST — Lurky');
        fd.append('phone', '360-000-0000');
        fd.append('email', 'test@mowmend.test');
        fd.append('preferredContact', 'text');
        fd.append(
          'services',
          JSON.stringify([
            'Lawn Mowing, Edging & Trimming',
            'Leaf Cleanup & Yard Debris Removal',
          ])
        );
        fd.append(
          'serviceType',
          'Lawn Mowing, Edging & Trimming, Leaf Cleanup & Yard Debris Removal'
        );
        fd.append('streetAddress', '123 Test Lane');
        fd.append('city', 'Vancouver');
        fd.append('zipCode', '98665');
        fd.append('description', 'Test submission — delete after verification');
        fd.append('debrisHauling', 'unsure');
        fd.append('preferredDate', '2026-11-25');
        fd.append('preferredTimeframe', 'Flexible / Next Available');
        fd.append(
          'additionalDetails',
          'Multi-select test: mowing + leaf cleanup. Approx. lot 50 x 100 ft (test measurements)'
        );
        fd.append('consentAccepted', 'true');
        fd.append('website', '');
        fd.append('formStartedAt', String(Date.now() - 25000));
        if (includePhoto) {
          const photoPath = path.resolve(
            process.cwd(),
            'public/images/vancouver-lawn-stripes-1.jpg'
          );
          const photoBytes = fs.readFileSync(photoPath);
          fd.append(
            'photos',
            new Blob([photoBytes], { type: 'image/jpeg' }),
            'vancouver-lawn-stripes-1.jpg'
          );
        }
        return fd;
      };

      // Without photo
      const resNoPhoto = await fetch(`${baseUrl}/api/estimates`, {
        method: 'POST',
        body: buildExactFormData(false),
      });
      expect(resNoPhoto.status).toBe(200);
      expect(resNoPhoto.headers.get('content-type')).toContain('application/json');
      const dataNoPhoto = (await resNoPhoto.json()) as {
        ok: boolean;
        requestId: string;
        verifiedPhotoCount: number;
        sanitizedLead: { services: string[] };
      };
      expect(dataNoPhoto.ok).toBe(true);
      expect(dataNoPhoto.requestId).toMatch(/^MM-\d{4}-\d{4}$/);
      expect(dataNoPhoto.verifiedPhotoCount).toBe(0);
      expect(dataNoPhoto.sanitizedLead.services).toEqual([
        'Lawn Mowing, Edging & Trimming',
        'Leaf Cleanup & Yard Debris Removal',
      ]);

      // With 203KB JPEG photo
      const resWithPhoto = await fetch(`${baseUrl}/api/estimates`, {
        method: 'POST',
        body: buildExactFormData(true),
      });
      expect(resWithPhoto.status).toBe(200);
      expect(resWithPhoto.headers.get('content-type')).toContain('application/json');
      const dataWithPhoto = (await resWithPhoto.json()) as {
        ok: boolean;
        requestId: string;
        verifiedPhotoCount: number;
      };
      expect(dataWithPhoto.ok).toBe(true);
      expect(dataWithPhoto.requestId).toMatch(/^MM-\d{4}-\d{4}$/);
      expect(dataWithPhoto.verifiedPhotoCount).toBe(1);

      // Verify Express JSON error middleware handles malformed JSON and unknown /api/* without HTML
      const badJsonRes = await fetch(`${baseUrl}/api/estimates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not-valid-json',
      });
      expect(badJsonRes.status).toBe(400);
      expect(badJsonRes.headers.get('content-type')).toContain('application/json');
      const badJsonBody = (await badJsonRes.json()) as {
        ok: boolean;
        error: string;
        fieldErrors: Record<string, string>;
      };
      expect(badJsonBody.ok).toBe(false);
      expect(badJsonBody.error.length).toBeGreaterThan(0);
      expect(badJsonBody.fieldErrors).toEqual({});
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('merges owner pricingCatalog and serviceCatalog overrides into public catalog entries', () => {
    const merged = mergeCatalogOverrides(
      {
        'lawn-mowing': {
          serviceId: 'lawn-mowing',
          title: 'Lawn Mowing & Crisp Edging',
          shortTitle: 'Mowing & Edging',
          oneLiner: 'Weekly or bi-weekly cuts with crisp edging and walkway blow-off.',
        },
      },
      {
        smallLawnMowing: {
          pricingKey: 'smallLawnMowing',
          label: 'Small residential lawn mow (up to 4,000 sq ft)',
          startingDisplay: 'Starting at $65 / visit',
          notes: 'Updated seasonal test rate.',
        },
      }
    );

    expect(merged.pricingByKey.smallLawnMowing.startingDisplay).toBe('Starting at $65 / visit');
    const updatedGuideEntry = merged.pricingEntries.find((e) => e.id === 'smallLawnMowing');
    expect(updatedGuideEntry?.startingDisplay).toBe('Starting at $65 / visit');
    const updatedService = merged.getServiceBySlug('lawn-mowing-trimming-edging');
    expect(updatedService?.title).toBe('Lawn Mowing & Crisp Edging');
    expect(updatedService?.priceLabel).toBe('Starting at $65 / visit');
  });

  it('keeps owner admin list rules free of query-blocking resource.data constraints and loads leads resiliently', () => {
    const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');
    expect(rules).toContain("request.auth.token.email.lower() == 'treevanderveer@gmail.com'");
    expect(rules).toContain('request.auth.token.email_verified == true');
    expect(rules).toMatch(/match \/bookedSlots\/\{slotKey\}[\s\S]*?allow list: if isAdmin\(\);/);
    expect(rules).not.toContain('resource.data.scheduledDate is string');
    expect(rules).toMatch(/match \/estimateRequests\/\{requestId\}[\s\S]*?allow list: if isAdmin\(\);/);
    expect(rules).toMatch(/match \/photos\/\{photoId\}[\s\S]*?allow list: if isAdmin\(\) && isValidId\(requestId\);/);

    const adminSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/pages/AdminDashboardPage.tsx'),
      'utf8'
    );
    expect(adminSource).toContain('Promise.allSettled([');
  });
});

