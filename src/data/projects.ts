export interface CompletedJobPhoto {
  id: string;
  imageUrl: string;
  title: string;
  caption: string;
  alt: string;
  category: 'Lawn & Yard Care' | 'Exterior Cleaning' | 'Handyman & Property Repairs';
  area: string;
  completedMonth: string;
}

export const COMPLETED_JOB_PHOTOS: CompletedJobPhoto[] = [
  {
    id: 'vancouver-lawn-stripes-1',
    imageUrl: '/images/vancouver-lawn-stripes-1.jpg',
    title: 'Fresh mow with stripes — Vancouver, WA',
    caption: 'Finished side-and-front turf mow with even stripe lines and crisp deck edge.',
    alt: 'Freshly mowed green residential lawn with clean mower stripes beside siding in Vancouver, WA',
    category: 'Lawn & Yard Care',
    area: 'Vancouver, WA',
    completedMonth: 'November 2026',
  },
  {
    id: 'vancouver-lawn-stripes-2',
    imageUrl: '/images/vancouver-lawn-stripes-2.jpg',
    title: 'Front turf stripes & bed trim — Vancouver, WA',
    caption: 'Trimmed landscape border, clean gravel strip transition, and uniform front lawn cut.',
    alt: 'Front lawn mowed with neat diagonal stripes along gravel and shrub border in Vancouver, WA',
    category: 'Lawn & Yard Care',
    area: 'Vancouver, WA',
    completedMonth: 'November 2026',
  },
  {
    id: 'vancouver-backyard-deck-mow',
    imageUrl: '/images/vancouver-backyard-deck-mow.jpg',
    title: 'Backyard mow & deck perimeter — Vancouver, WA',
    caption: 'Backyard lawn cut, tight deck-edge trimming, and autumn leaf cleanup along brush line.',
    alt: 'Trimmed backyard lawn next to raised wood deck and cleared brush edge in Vancouver, WA',
    category: 'Lawn & Yard Care',
    area: 'Vancouver, WA',
    completedMonth: 'November 2026',
  },
  {
    id: 'vancouver-front-walkway-mow',
    imageUrl: '/images/vancouver-front-walkway-mow.jpg',
    title: 'Front lawn, walk edging & blow-off — Vancouver, WA',
    caption: 'Freshly cut front turf paired with clean concrete entry walkway and bagged yard trimmings.',
    alt: 'Freshly mowed front lawn with swept concrete walkway and bagged green waste in Vancouver, WA',
    category: 'Lawn & Yard Care',
    area: 'Vancouver, WA',
    completedMonth: 'November 2026',
  },
  {
    id: 'vancouver-roadside-bed-trim',
    imageUrl: '/images/vancouver-roadside-bed-trim.jpg',
    title: 'Roadside bed trim & debris bagging — Vancouver, WA',
    caption: 'Hand-cleared roadside planting strip, grass-edge trim, and filled green-waste tote ready for disposal.',
    alt: 'Trimmed roadside planting bed and green yard waste tote along residential street in Vancouver, WA',
    category: 'Lawn & Yard Care',
    area: 'Vancouver, WA',
    completedMonth: 'November 2026',
  },
];

export interface ProjectShowcaseItem {
  id: string;
  title: string;
  category: 'Yard & Cleanups' | 'Pressure Washing' | 'Fence & Carpentry';
  city: string;
  description: string;
  scopeSummary: string;
  // Set these to real approved project photo paths once supplied by the owner.
  // Until then, hasApprovedPhotos stays false and an honest empty-state frame is rendered.
  hasApprovedPhotos: boolean;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  beforeAlt: string;
  afterAlt: string;
}

export const PROJECT_SHOWCASE: ProjectShowcaseItem[] = [
  {
    id: 'cedar-fence-gate-vancouver',
    title: 'Cedar Gate Re-Square & Fence Panel Repair',
    category: 'Fence & Carpentry',
    city: 'Vancouver, WA',
    description:
      'Replaced two split fence posts, rebuilt a sagging side-yard cedar gate with heavy-duty hinges and latch hardware, and re-attached wind-loosened pickets.',
    scopeSummary: 'Fence & Gate Repair · Single-day turnaround',
    hasApprovedPhotos: false,
    beforeAlt: 'Leaning side-yard cedar gate and weathered fence posts prior to repair in Vancouver, WA',
    afterAlt: 'Level, freshly squared cedar gate and sturdy replacement pickets in Vancouver, WA',
  },
  {
    id: 'blackberry-clearing-salmon-creek',
    title: 'Back Fence Line Blackberry & Brush Clearing',
    category: 'Yard & Cleanups',
    city: 'Salmon Creek, WA',
    description:
      'Cut back dense invasive Himalayan blackberry brambles encroaching on a backyard fence line, cleared dead brush, and hauled scoped green waste off-site.',
    scopeSummary: 'Brush & Blackberry Removal · Scoped green-waste haul',
    hasApprovedPhotos: false,
    beforeAlt: 'Overgrown blackberry brambles along residential fence line in Salmon Creek, WA',
    afterAlt: 'Cleared backyard perimeter and exposed clean fence line in Salmon Creek, WA',
  },
  {
    id: 'driveway-wash-camas',
    title: 'Mossy Driveway & Front Walkway Surface Wash',
    category: 'Pressure Washing',
    city: 'Camas, WA',
    description:
      'Removed slippery winter moss, dark algae buildup, and leaf staining across a concrete driveway, front entry steps, and perimeter sidewalk.',
    scopeSummary: 'Pressure Washing · Concrete driveway & entry walk',
    hasApprovedPhotos: false,
    beforeAlt: 'Moss and winter algae staining on concrete driveway in Camas, WA',
    afterAlt: 'Clean, slip-free washed concrete driveway and entry walk in Camas, WA',
  },
  {
    id: 'seasonal-cleanup-hazel-dell',
    title: 'Fall Leaf Clearing, Edging & Gutter Cleanout',
    category: 'Yard & Cleanups',
    city: 'Hazel Dell, WA',
    description:
      'Cleared heavy maple leaf accumulation from front and rear lawns, hand-cleared single-story gutters, flushed downspouts, and edged walkways.',
    scopeSummary: 'Leaf Cleanup + Gutter Cleaning · Combined visit',
    hasApprovedPhotos: false,
    beforeAlt: 'Heavy autumn leaf buildup across lawn and gutters in Hazel Dell, WA',
    afterAlt: 'Cleared turf, crisp walkway edges, and clean gutters in Hazel Dell, WA',
  },
];
