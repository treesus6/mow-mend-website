/**
 * MOW & MEND LLC — Editable Master Pricing Configuration
 *
 * Owner instructions:
 * Edit any starting price, range, hourly rate, or deposit policy below and save.
 * Every public price displayed across the Home, Services, and Estimate pages
 * reads directly from this single file.
 *
 * All public prices are strictly labeled as starting estimates or typical ranges—
 * never guaranteed quotes.
 */

export type CostLineItem = 'Labor' | 'Materials' | 'Disposal' | 'WA Sales Tax';

export interface PricingEntry {
  id: string;
  label: string;
  category: 'lawn-yard' | 'exterior-cleaning' | 'handyman-repairs' | 'additional';
  categoryLabel: string;
  startingDisplay: string;
  notes: string;
  applicableLines: CostLineItem[];
}

export const PRICING_CONFIG = {
  generalDisclaimer:
    'All listed prices are starting-at estimates or typical ranges—never a guaranteed quote. Final written estimates vary by job size, materials, site access, disposal volume, and difficulty.',
  depositPolicy: {
    percent: 50,
    minimumUsd: 50,
    label: '50% deposit ($50 minimum) required to book',
    detail:
      'A standard 50% booking deposit ($50 minimum) reserves your scheduled work date once you approve your written estimate.',
  },
  tripFee: {
    amountUsd: 75,
    label: '$75 on-site estimate trip fee (credited toward the job if booked)',
    detail:
      '$75 for an on-site estimate visit, credited toward the job if booked; free pricing from photos.',
  },
  lineItemExplanation:
    'Written estimates break out Labor, Materials, Disposal / Haul-Away, and applicable Washington Sales Tax on separate lines.',
  entries: {
    smallLawnMowing: {
      id: 'smallLawnMowing',
      label: 'Small-Lawn Mowing, Trimming & Blow-Off',
      category: 'lawn-yard',
      categoryLabel: 'Lawn & Yard Care',
      startingDisplay: 'Starting at $60 / visit',
      notes: 'Standard small residential lot; larger lots or overgrown turf quoted by size.',
      applicableLines: ['Labor', 'WA Sales Tax'],
    },
    weedingEdgingAddon: {
      id: 'weedingEdgingAddon',
      label: 'Weeding & Crisp Bed Edging (Mow Add-On)',
      category: 'lawn-yard',
      categoryLabel: 'Lawn & Yard Care',
      startingDisplay: 'Starting at $50–$100 (mow add-on)',
      notes: 'Priced as an add-on to a mowing visit based on bed length and weed density.',
      applicableLines: ['Labor', 'Disposal', 'WA Sales Tax'],
    },
    leafCleanup: {
      id: 'leafCleanup',
      label: 'Leaf Cleanup',
      category: 'lawn-yard',
      categoryLabel: 'Lawn & Yard Care',
      startingDisplay: 'Starting at $70 / hr labor + haul-away',
      notes: 'Owner standing hourly cleanup rate; haul-away billed separately by load or yard bins.',
      applicableLines: ['Labor', 'Disposal', 'WA Sales Tax'],
    },
    yardCleanup: {
      id: 'yardCleanup',
      label: 'Seasonal & Full Yard / Garden Cleanup',
      category: 'lawn-yard',
      categoryLabel: 'Lawn & Yard Care',
      startingDisplay: '$250–$600 typical ($150 minimum)',
      notes: 'Covers seasonal resets, overgrown beds, and yard debris clearing.',
      applicableLines: ['Labor', 'Disposal', 'WA Sales Tax'],
    },
    brushRemoval: {
      id: 'brushRemoval',
      label: 'Blackberry & Brush Removal',
      category: 'lawn-yard',
      categoryLabel: 'Lawn & Yard Care',
      startingDisplay: '$150–$400 typical / job',
      notes: 'Mechanical cutting and clearing; disposal/chipping billed by volume.',
      applicableLines: ['Labor', 'Disposal', 'WA Sales Tax'],
    },
    pruningHedge: {
      id: 'pruningHedge',
      label: 'Hedge Trimming & Shrub Pruning',
      category: 'lawn-yard',
      categoryLabel: 'Lawn & Yard Care',
      startingDisplay: '$100–$250 typical',
      notes: 'Depends on hedge height, length, ladder access, and branch haul-away.',
      applicableLines: ['Labor', 'Disposal', 'WA Sales Tax'],
    },
    pressureWashDriveway: {
      id: 'pressureWashDriveway',
      label: 'Driveway & Sidewalk Pressure Washing',
      category: 'exterior-cleaning',
      categoryLabel: 'Exterior Cleaning',
      startingDisplay: 'Starting at $175',
      notes: 'Concrete rotary wash for moss, algae, and grime; water spigot required.',
      applicableLines: ['Labor', 'WA Sales Tax'],
    },
    pressureWashDeckPatio: {
      id: 'pressureWashDeckPatio',
      label: 'Patio, Deck & Fence Surface Cleaning',
      category: 'exterior-cleaning',
      categoryLabel: 'Exterior Cleaning',
      startingDisplay: 'From $125 standalone ($90 as add-on)',
      notes: 'Matched pressure for patios, concrete pads, decks, and wood fences.',
      applicableLines: ['Labor', 'WA Sales Tax'],
    },
    pressureWashHouse: {
      id: 'pressureWashHouse',
      label: 'House Exterior Soft / Surface Washing',
      category: 'exterior-cleaning',
      categoryLabel: 'Exterior Cleaning',
      startingDisplay: 'Starting at $350',
      notes: 'Varies by home square footage, story count, and siding condition.',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    gutterCleaning: {
      id: 'gutterCleaning',
      label: 'Gutter Cleaning (Single-Story)',
      category: 'exterior-cleaning',
      categoryLabel: 'Exterior Cleaning',
      startingDisplay: 'Starting at $149 (single-story)',
      notes: 'Hand-clearing needles/leaves and downspout checks; two-story or steep roofs quoted custom.',
      applicableLines: ['Labor', 'Disposal', 'WA Sales Tax'],
    },
    fenceGateRepair: {
      id: 'fenceGateRepair',
      label: 'Fence & Gate Repairs (Pickets, Rails, Latches)',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: '$200–$800+ typical (materials extra)',
      notes: 'Re-squaring sagging gates, replacing pickets/rails, hardware upgrades.',
      applicableLines: ['Labor', 'Materials', 'Disposal', 'WA Sales Tax'],
    },
    fencePostReplacement: {
      id: 'fencePostReplacement',
      label: 'Fence-Post Replacement',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $250 / post (materials extra)',
      notes: 'Includes pulling rotted post/concrete footing and setting a new treated post.',
      applicableLines: ['Labor', 'Materials', 'Disposal', 'WA Sales Tax'],
    },
    handymanGeneral: {
      id: 'handymanGeneral',
      label: 'General Handyman Labor (Hardware, Doors, Caulk, Shelving)',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $70 / hr (2-hour minimum, $140 minimum)',
      notes:
        'Cabinet hardware, door/lock fixes, weatherstripping, caulking, shelving, punch-lists. Handle/lock swap $75/door; re-caulk from $150; sticking door from $120; rescreening $50/screen, new frame+screen from $100/screen, sliding door screen from $150 ($120 min/visit).',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    handymanSkilledCarpentry: {
      id: 'handymanSkilledCarpentry',
      label: 'Skilled Carpentry & Deck / Trim Repairs',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $85 / hr (2-hour minimum)',
      notes: 'Deck board/step rebuilds, trim joinery, exterior wood rot patches, framing fixes.',
      applicableLines: ['Labor', 'Materials', 'Disposal', 'WA Sales Tax'],
    },
    drywallPatching: {
      id: 'drywallPatching',
      label: 'Drywall Patching & Texture Blend',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $150 (typical $150–$350+)',
      notes: 'Small-to-medium wall/ceiling patches; final range depends on patch count, texture & prime.',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    interiorPainting: {
      id: 'interiorPainting',
      label: 'Interior Painting & Touch-Ups',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $350 / room (paint extra)',
      notes: 'Clark County typical range $350–$650+/room depending on wall prep, trim & ceiling height.',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    faucetBath: {
      id: 'faucetBath',
      label: 'Bathroom Sink Faucet Replacement (Like-for-Like)',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $175 labor (faucet extra)',
      notes:
        'Swap existing bathroom faucet & supply lines when shutoff valves operate cleanly. Faucet cartridge from $140; touchless/premium faucet from $300; showerhead $40 add-on / $75 alone.',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    faucetKitchen: {
      id: 'faucetKitchen',
      label: 'Kitchen Sink Faucet Replacement (Like-for-Like)',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $200 labor (faucet extra)',
      notes: 'Swap existing kitchen faucet & hookups when shutoff valves operate cleanly.',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    toiletRepair: {
      id: 'toiletRepair',
      label: 'Toilet Component Repair (Flapper / Fill Valve)',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $140',
      notes: 'Stops running/leaking tank components using standard replacement valves & flappers.',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    toiletInstall: {
      id: 'toiletInstall',
      label: 'Toilet Swap / Installation (Like-for-Like)',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: 'Starting at $225 labor (toilet extra)',
      notes: 'Replace existing toilet with new wax ring & bolts on intact flange; haul-away optional.',
      applicableLines: ['Labor', 'Materials', 'Disposal', 'WA Sales Tax'],
    },
    furnitureAssembly: {
      id: 'furnitureAssembly',
      label: 'Furniture & Flat-Pack Assembly',
      category: 'handyman-repairs',
      categoryLabel: 'Handyman & Property Repairs',
      startingDisplay: '$65–$200 typical / item',
      notes: 'Depends on item complexity (bookcases, beds, patio sets, storage racks).',
      applicableLines: ['Labor', 'WA Sales Tax'],
    },
    holidayLights: {
      id: 'holidayLights',
      label: 'Holiday Light Installation & Removal',
      category: 'additional',
      categoryLabel: 'Additional Services',
      startingDisplay:
        'From $400 minimum (your lights) / $650 minimum (we supply LEDs + clips) · Typical single-story around $550 / around $800 · Two-story +$150',
      notes:
        'With our $650 minimum package, you keep the commercial-grade LEDs and clips after January takedown.',
      applicableLines: ['Labor', 'Materials', 'WA Sales Tax'],
    },
    concreteMinorHaulTurnover: {
      id: 'concreteMinorHaulTurnover',
      label: 'Small Concrete Repairs, Minor Hauling & Turnover Upkeep',
      category: 'additional',
      categoryLabel: 'Additional Services',
      startingDisplay:
        'Custom estimate · Small concrete repairs $200 minimum · Minor hauling $120 minimum (based on $70–$85/hr + load)',
      notes: 'Walkway patch work, scoped trailer hauling, and landlord move-out turnovers.',
      applicableLines: ['Labor', 'Materials', 'Disposal', 'WA Sales Tax'],
    },
  } satisfies Record<string, PricingEntry>,
} as const;

export type PricingKey = keyof typeof PRICING_CONFIG.entries;

export function getPricingEntry(key: PricingKey): PricingEntry {
  return PRICING_CONFIG.entries[key];
}

export function getAllPricingEntries(): PricingEntry[] {
  return Object.values(PRICING_CONFIG.entries);
}
