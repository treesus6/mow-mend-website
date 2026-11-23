import { PRICING_CONFIG, type CostLineItem, type PricingKey } from '../config/pricing.ts';

export type ServiceCategoryKey =
  | 'lawn-yard'
  | 'exterior-cleaning'
  | 'handyman-repairs'
  | 'additional';

export interface ServiceCategoryMeta {
  key: ServiceCategoryKey;
  label: string;
  tagline: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = [
  {
    key: 'lawn-yard',
    label: 'Lawn & Yard Care',
    tagline:
      'Mowing, edging, trimming, leaf cleanup, blackberry & brush removal, pruning, and yard debris clearing.',
  },
  {
    key: 'exterior-cleaning',
    label: 'Exterior Cleaning',
    tagline:
      'Driveway, sidewalk, patio, deck, fence, and house pressure washing plus single-story gutter cleaning.',
  },
  {
    key: 'handyman-repairs',
    label: 'Handyman & Property Repairs',
    tagline:
      'Fences, posts, gates, decks, carpentry, drywall, interior painting, faucets, toilets, cabinets, doors, and assembly.',
  },
  {
    key: 'additional',
    label: 'Additional Services',
    tagline:
      'Holiday light installation and takedown, small concrete repairs, minor hauling, and property turnovers.',
  },
];

export interface ServiceDefinition {
  id: string;
  number: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: ServiceCategoryKey;
  categoryLabel: string;
  oneLiner: string;
  pricingKey: PricingKey;
  priceLabel: string;
  costLines: readonly CostLineItem[];
  included: string[];
  helpfulInfoForEstimate: string[];
  scopeBoundaries: string;
  seasonalNote?: string;
}

function buildService(
  input: Omit<ServiceDefinition, 'priceLabel' | 'costLines'>
): ServiceDefinition {
  const pricing = PRICING_CONFIG.entries[input.pricingKey];
  return {
    ...input,
    priceLabel: pricing.startingDisplay,
    costLines: pricing.applicableLines,
  };
}

export const SERVICES: ServiceDefinition[] = [
  // 1. LAWN & YARD CARE
  buildService({
    id: 'lawn-mowing',
    number: '01',
    slug: 'lawn-mowing-trimming-edging',
    title: 'Lawn Mowing, Edging & Trimming',
    shortTitle: 'Lawn Mowing & Edging',
    category: 'lawn-yard',
    categoryLabel: 'Lawn & Yard Care',
    oneLiner:
      'Consistent mowing, string trimming, hard-edge crispness, and clean walkway blow-off for residential lots.',
    pricingKey: 'smallLawnMowing',
    included: [
      'Even-height mowing tailored to Pacific Northwest turf conditions',
      'String trimming around fences, beds, trees, and hard-to-reach corners',
      'Vertical edging along sidewalks, curbs, and concrete driveways',
      'Clippings blown clear from porches, patios, and walkways',
    ],
    helpfulInfoForEstimate: [
      'Approximate lot size and front/back yard access',
      'Whether gates are locked or pets use the yard',
      'Optional weeding/edging bed add-on needs',
    ],
    scopeBoundaries:
      'Starting estimate for small lawns; larger lots or overgrown grass quoted by size. No chemical herbicide or pesticide application.',
  }),
  buildService({
    id: 'weeding-edging-maintenance',
    number: '02',
    slug: 'weeding-edging-seasonal-maintenance',
    title: 'Weeding, Bed Edging & Seasonal Maintenance',
    shortTitle: 'Weeding & Seasonal Care',
    category: 'lawn-yard',
    categoryLabel: 'Lawn & Yard Care',
    oneLiner:
      'Hand weeding, crisp garden bed edging, and recurring seasonal yard upkeep to keep beds neat.',
    pricingKey: 'weedingEdgingAddon',
    included: [
      'Hand-pulling weeds from landscape beds, gravel paths, and borders',
      'Spade or mechanical bed edging for clean separation from turf',
      'Scheduled weekly, bi-weekly, or seasonal recurring maintenance visits',
      'Bagging green waste into yard bins or scoped haul-away',
    ],
    helpfulInfoForEstimate: [
      'Whether this is a mow add-on or standalone bed refresh',
      'Photos showing current weed growth and bed lengths',
      'On-site yard debris cart availability',
    ],
    scopeBoundaries:
      'Mechanical weeding and hand clearing only—we do not spray restricted pesticides or herbicides.',
  }),
  buildService({
    id: 'leaf-seasonal-cleanup',
    number: '03',
    slug: 'leaf-cleanup-yard-debris',
    title: 'Leaf Cleanup & Yard Debris Removal',
    shortTitle: 'Leaf & Debris Cleanup',
    category: 'lawn-yard',
    categoryLabel: 'Lawn & Yard Care',
    oneLiner:
      'Thorough leaf blowing, raking, garden cleanup, and scoped yard debris removal for wet Clark County seasons.',
    pricingKey: 'leafCleanup',
    included: [
      'Clearing heavy leaf fall from lawns, flower beds, patios, and corners',
      'Garden bed cutbacks and clearing fallen branches and winter debris',
      'Loading homeowner green bins or scoped trailer haul-away',
      'Final sweep and blow-off of driveways and entry paths',
    ],
    helpfulInfoForEstimate: [
      'Number and size of mature trees on the property',
      'Whether haul-away is needed or green carts are available',
      'Wide photos showing current leaf coverage',
    ],
    scopeBoundaries:
      'Billed at owner hourly labor rate plus scoped haul-away/disposal. No unlimited hauling promises.',
    seasonalNote: 'Peak autumn & early spring demand.',
  }),
  buildService({
    id: 'brush-blackberry-removal',
    number: '04',
    slug: 'blackberry-brush-removal',
    title: 'Blackberry Removal & Brush Cleanup',
    shortTitle: 'Blackberry & Brush Removal',
    category: 'lawn-yard',
    categoryLabel: 'Lawn & Yard Care',
    oneLiner:
      'Heavy-duty mechanical cutting and clearing of invasive Himalayan blackberry brambles and overgrown brush.',
    pricingKey: 'brushRemoval',
    included: [
      'Cutting back dense blackberry canes, saplings, and tangled brush',
      'Clearing fence lines, shed perimeters, and driveway sightlines',
      'Raking and stacking cut brambles for green bins or scoped haul-away',
      'Inspecting fence boards hidden behind overgrowth once cleared',
    ],
    helpfulInfoForEstimate: [
      'Approximate square footage or linear feet of brush',
      'Photos showing cane height, density, and trailer access',
      'Whether cut brush needs haul-away disposal',
    ],
    scopeBoundaries:
      'Mechanical clearing only—we do not apply chemical brush killers or stump herbicides.',
  }),
  buildService({
    id: 'pruning-hedge-trimming',
    number: '05',
    slug: 'hedge-trimming-pruning-yard-cleanup',
    title: 'Hedge Trimming, Pruning & Full Yard Cleanup',
    shortTitle: 'Pruning & Yard Cleanup',
    category: 'lawn-yard',
    categoryLabel: 'Lawn & Yard Care',
    oneLiner:
      'Shrub shaping, hedge trimming, ornamental pruning, and full property yard/garden cleanups.',
    pricingKey: 'pruningHedge',
    included: [
      'Shaping privacy hedges, laurel, boxwood, and overgrown shrubs',
      'Selective low-branch pruning for walkway and roofline clearance',
      'Full yard and garden cleanup packages for neglected properties',
      'Tidy cleanup and scoped branch haul-away',
    ],
    helpfulInfoForEstimate: [
      'Hedge height, length, and whether ladder access is clear',
      'Photos of all shrubs or garden areas to trim',
      'Whether you want a full yard cleanup bundle',
    ],
    scopeBoundaries:
      'Covers hedges, shrubs, and accessible low limbs—no high-climb arborist tree felling.',
  }),

  // 2. EXTERIOR CLEANING
  buildService({
    id: 'pressure-washing',
    number: '06',
    slug: 'pressure-washing-exterior-surfaces',
    title: 'Driveway, Sidewalk, Patio, Deck & House Washing',
    shortTitle: 'Pressure & Surface Washing',
    category: 'exterior-cleaning',
    categoryLabel: 'Exterior Cleaning',
    oneLiner:
      'Surface-matched pressure washing to strip slippery moss, algae, and grime from driveways, walks, patios, decks, fences, and siding.',
    pricingKey: 'pressureWashDriveway',
    included: [
      'Rotary surface cleaning for concrete driveways, sidewalks, and walkways',
      'Matched pressure washing for patios, wood decks, and cedar fences',
      'Low-pressure house exterior rinsing for dirt, cobwebs, and mildew',
      'Post-wash rinse of garage doors, trim, and nearby landscaping',
    ],
    helpfulInfoForEstimate: [
      'Which surfaces need washing (driveway, patio/deck, fence, or house exterior)',
      'Confirmation of a working exterior water spigot',
      'Photos showing moss buildup and approximate square footage',
    ],
    scopeBoundaries:
      'Pricing varies by surface type and story count; delicate roofs or flaking paint are evaluated before quoting.',
  }),
  buildService({
    id: 'gutter-cleaning',
    number: '07',
    slug: 'gutter-cleaning',
    title: 'Gutter Cleaning',
    shortTitle: 'Gutter Cleaning',
    category: 'exterior-cleaning',
    categoryLabel: 'Exterior Cleaning',
    oneLiner:
      'Hand-clearing of pine needles, roof grit, and leaves from accessible gutters with downspout flow checks.',
    pricingKey: 'gutterCleaning',
    included: [
      'Removing compacted leaves and fir needles from gutters by hand',
      'Checking and flushing accessible downspout openings for drainage',
      'Bagging gutter debris rather than dropping mess onto beds',
      'Noting loose hangers or dripping seams for the homeowner',
    ],
    helpfulInfoForEstimate: [
      'Single-story or two-story home and roof pitch notes',
      'Whether gutter guards are installed',
      'Front and side photos of the roofline',
    ],
    scopeBoundaries:
      'Single-story starting rate shown; two-story or steep/hazardous rooflines are quoted custom.',
    seasonalNote: 'Best scheduled in late fall and spring.',
  }),

  // 3. HANDYMAN & PROPERTY REPAIRS
  buildService({
    id: 'fence-gate-deck-repairs',
    number: '08',
    slug: 'fence-gate-post-deck-repairs',
    title: 'Fence, Post, Gate & Deck Repairs',
    shortTitle: 'Fence, Gate & Deck Repairs',
    category: 'handyman-repairs',
    categoryLabel: 'Handyman & Property Repairs',
    oneLiner:
      'Rotted fence-post replacement, picket and rail repairs, re-squared sagging gates, latches, and small deck board/step fixes.',
    pricingKey: 'fenceGateRepair',
    included: [
      'Replacing broken cedar/pine pickets, rails, and leaning fence sections',
      'Digging out rotted posts and setting new treated posts in concrete',
      'Re-squaring sagging gates with heavy-duty hinges, latches, and drop rods',
      'Replacing split deck boards, stair treads, and tightening handrails',
    ],
    helpfulInfoForEstimate: [
      'Number of leaning posts, broken panels, or sagging gates',
      'Close-up photos of post bases, hinges, or deck framing',
      'Whether materials need to be picked up and delivered',
    ],
    scopeBoundaries:
      'Covers repairs and localized replacements (materials extra); major elevated structural deck engineering is outside scope.',
  }),
  buildService({
    id: 'carpentry-drywall-painting',
    number: '09',
    slug: 'carpentry-drywall-interior-painting',
    title: 'Minor Carpentry, Drywall Patching & Interior Painting',
    shortTitle: 'Carpentry, Drywall & Paint',
    category: 'handyman-repairs',
    categoryLabel: 'Handyman & Property Repairs',
    oneLiner:
      'Skilled carpentry trim work, drywall hole patching, interior room painting, caulking, and weatherstripping.',
    pricingKey: 'drywallPatching',
    included: [
      'Small-to-medium drywall hole patching, taping, mudding, and texture blend',
      'Interior room painting, accent walls, baseboards, and trim touch-ups',
      'Baseboard, casing, sill, shed door, and minor exterior wood-rot carpentry',
      'Tub/shower/baseboard caulking and exterior door weatherstripping seals',
    ],
    helpfulInfoForEstimate: [
      'Room count or patch dimensions plus ceiling height',
      'Photos of each drywall patch, trim gap, or room to paint',
      'Whether paint or trim stock is supplied by homeowner',
    ],
    scopeBoundaries:
      'Non-structural carpentry, drywall patching, and interior painting only—no major structural framing or remodel engineering.',
  }),
  buildService({
    id: 'faucet-toilet-plumbing-fixtures',
    number: '10',
    slug: 'faucet-toilet-fixture-repairs',
    title: 'Faucet Replacement, Toilet Repairs & Plumbing Fixtures',
    shortTitle: 'Faucets & Toilet Fixtures',
    category: 'handyman-repairs',
    categoryLabel: 'Handyman & Property Repairs',
    oneLiner:
      'Like-for-like bath and kitchen sink faucet swaps, toilet flapper/fill-valve fixes, toilet installs, and minor fixture work.',
    pricingKey: 'faucetBath',
    included: [
      'Bath and kitchen sink faucet swaps and braided supply-line connections',
      'Running toilet fixes—flapper, fill valve, flush handle, and wax-ring/seat swaps',
      'Complete like-for-like toilet removal and replacement on intact floor flanges',
      'Showerhead swaps, P-trap/drain-stopper swaps, and sink-edge silicone caulking',
    ],
    helpfulInfoForEstimate: [
      'Photo of the current sink faucet or toilet and under-sink shutoff valves',
      'Confirmation that existing shutoff valves turn off completely',
      'Whether you already purchased the new faucet or toilet',
    ],
    scopeBoundaries:
      'Minor like-for-like fixture swaps and hardware repairs only—we do not hold a specialty plumbing contractor license for re-piping, water heaters, sewer, or gas lines.',
  }),
  buildService({
    id: 'handyman-hardware-assembly',
    number: '11',
    slug: 'handyman-hardware-shelving-assembly',
    title: 'Cabinets, Doors, Locks, Shelving & Furniture Assembly',
    shortTitle: 'Handyman, Hardware & Assembly',
    category: 'handyman-repairs',
    categoryLabel: 'Handyman & Property Repairs',
    oneLiner:
      'Cabinet hinges and drawer slides, door and deadbolt hardware, shelving, TV/fixture mounting, furniture assembly, and punch-lists.',
    pricingKey: 'handymanGeneral',
    included: [
      'Cabinet door alignment, soft-close hinges, drawer slides, knobs, and pulls',
      'Sticking door planing, strike-plate adjustment, knobs, deadbolts, and smart locks',
      'Stud-mounted shelving, closet organizers, curtain rods, blinds, mirrors, and TVs',
      'Flat-pack furniture assembly, patio sets, storage racks, and general maintenance',
    ],
    helpfulInfoForEstimate: [
      'List of punch-list items or number of furniture boxes to assemble',
      'Photos of the cabinets, doors, or mounting wall',
      'Whether replacement hardware or anchors are on-site',
    ],
    scopeBoundaries:
      '2-hour minimum on hourly handyman visits. Non-regulated mechanical mounting and hardware only—no hardwired electrical circuit work.',
  }),

  // 4. ADDITIONAL SERVICES
  buildService({
    id: 'holiday-lights',
    number: '12',
    slug: 'seasonal-holiday-light-installation-removal',
    title: 'Holiday Light Installation & Removal',
    shortTitle: 'Holiday Lights',
    category: 'additional',
    categoryLabel: 'Additional Services',
    oneLiner:
      'Clean roofline holiday lighting installation and post-season takedown using your lights or our commercial LEDs you keep.',
    pricingKey: 'holidayLights',
    included: [
      'Neatly clipped roofline, fascia, and front-porch holiday light installation',
      'Option A: Install your own working light strands (starting at $400)',
      'Option B: We supply commercial-grade LEDs + clips you keep (starting at $650)',
      'Scheduled January/post-season careful takedown and coiling',
    ],
    helpfulInfoForEstimate: [
      'Wide front photo of your home showing rooflines and story count',
      'Choice of customer-supplied vs. Mow & Mend supplied LEDs',
      'Location of working exterior GFCI outlet',
    ],
    scopeBoundaries:
      'Two-story homes add +$150. Uses existing exterior GFCI outlets only; we do not add new electrical outlets or circuits.',
    seasonalNote: 'Booking opens October; removals in January.',
  }),
  buildService({
    id: 'concrete-hauling-turnover',
    number: '13',
    slug: 'small-concrete-minor-hauling-turnover',
    title: 'Small Concrete Repairs, Minor Hauling & Property Turnovers',
    shortTitle: 'Concrete, Hauling & Turnovers',
    category: 'additional',
    categoryLabel: 'Additional Services',
    oneLiner:
      'Small walkway concrete patching, scoped trailer hauling, and combined landlord move-out turnover maintenance.',
    pricingKey: 'concreteMinorHaulTurnover',
    included: [
      'Small concrete crack/spall patching, step corner repair, and paver re-leveling',
      'Scoped pickup/trailer hauling for branches, yard waste, and non-hazardous junk',
      'Rental move-out exterior + interior handyman turnover checklists',
      'Photo completion summaries for landlords and small property managers',
    ],
    helpfulInfoForEstimate: [
      'Photos of the concrete patch area, debris pile, or turnover list',
      'Approximate load volume for hauling (e.g., half-pickup vs. full trailer)',
      'Target move-in or listing deadline',
    ],
    scopeBoundaries:
      'Small non-structural concrete patching and scoped hauling only—no major slab pours, structural foundations, or hazardous materials.',
  }),
];

export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getServicesByCategory(category: ServiceCategoryKey): ServiceDefinition[] {
  return SERVICES.filter((s) => s.category === category);
}
