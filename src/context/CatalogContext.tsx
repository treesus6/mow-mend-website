import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  PRICING_CONFIG,
  getAllPricingEntries,
  type PricingEntry,
  type PricingKey,
} from '../config/pricing.ts';
import {
  SERVICES,
  type ServiceCategoryKey,
  type ServiceDefinition,
} from '../data/services.ts';
import { subscribeCatalogOverrides } from '../lib/firebase.ts';
import type { PricingOverrideRecord, ServiceOverrideRecord } from '../types/estimate.ts';

interface CatalogContextValue {
  services: ServiceDefinition[];
  pricingEntries: PricingEntry[];
  pricingByKey: Record<PricingKey, PricingEntry>;
  serviceOverrides: Record<string, ServiceOverrideRecord>;
  pricingOverrides: Record<string, PricingOverrideRecord>;
  getServiceBySlug: (slug: string) => ServiceDefinition | undefined;
  getServicesByCategory: (category: ServiceCategoryKey) => ServiceDefinition[];
}

const defaultPricingEntries = getAllPricingEntries();
const defaultPricingByKey = { ...PRICING_CONFIG.entries } as Record<PricingKey, PricingEntry>;

const CatalogContext = createContext<CatalogContextValue>({
  services: SERVICES,
  pricingEntries: defaultPricingEntries,
  pricingByKey: defaultPricingByKey,
  serviceOverrides: {},
  pricingOverrides: {},
  getServiceBySlug: (slug) => SERVICES.find((s) => s.slug === slug),
  getServicesByCategory: (cat) => SERVICES.filter((s) => s.category === cat),
});

export function mergeCatalogOverrides(
  serviceOverrides: Record<string, ServiceOverrideRecord>,
  pricingOverrides: Record<string, PricingOverrideRecord>
): Pick<CatalogContextValue, 'services' | 'pricingEntries' | 'pricingByKey' | 'getServiceBySlug' | 'getServicesByCategory'> {
  const mergedPricingByKey = {} as Record<PricingKey, PricingEntry>;
  for (const key of Object.keys(PRICING_CONFIG.entries) as PricingKey[]) {
    const base = PRICING_CONFIG.entries[key];
    const override = pricingOverrides[key];
    mergedPricingByKey[key] = override
      ? {
          ...base,
          label: override.label || base.label,
          startingDisplay: override.startingDisplay || base.startingDisplay,
          notes: override.notes ?? base.notes,
        }
      : base;
  }

  const mergedPricingEntries = Object.values(mergedPricingByKey);

  const mergedServices: ServiceDefinition[] = SERVICES.map((baseService) => {
    const svcOverride = serviceOverrides[baseService.id];
    const livePricing = mergedPricingByKey[baseService.pricingKey];
    return {
      ...baseService,
      title: svcOverride?.title || baseService.title,
      shortTitle: svcOverride?.shortTitle || baseService.shortTitle,
      oneLiner: svcOverride?.oneLiner || baseService.oneLiner,
      priceLabel: livePricing?.startingDisplay || baseService.priceLabel,
    };
  });

  return {
    services: mergedServices,
    pricingEntries: mergedPricingEntries,
    pricingByKey: mergedPricingByKey,
    getServiceBySlug: (slug) => mergedServices.find((s) => s.slug === slug),
    getServicesByCategory: (cat) => mergedServices.filter((s) => s.category === cat),
  };
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [serviceOverrides, setServiceOverrides] = useState<Record<string, ServiceOverrideRecord>>({});
  const [pricingOverrides, setPricingOverrides] = useState<Record<string, PricingOverrideRecord>>({});

  useEffect(() => {
    const unsub = subscribeCatalogOverrides(setServiceOverrides, setPricingOverrides);
    return () => unsub();
  }, []);

  const value = useMemo<CatalogContextValue>(() => {
    const merged = mergeCatalogOverrides(serviceOverrides, pricingOverrides);
    return {
      ...merged,
      serviceOverrides,
      pricingOverrides,
    };
  }, [serviceOverrides, pricingOverrides]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  return useContext(CatalogContext);
}
