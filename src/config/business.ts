export const BUSINESS_INFO = {
  legalName: 'MOW & MEND LLC',
  shortName: 'MOW & MEND',
  tagline: 'Mow money, mow problems.',
  category: 'Yard + Home Property Services',
  ownerOperatedLabel: 'Owner-Operated in Vancouver & Clark County, WA',
  phoneDisplay: '(360) 889-8046',
  phoneHref: 'tel:+13608898046',
  smsHref: 'sms:+13608898046',
  email: 'treevanderveer@gmail.com',
  emailHref: 'mailto:treevanderveer@gmail.com',
  contractorRegistration: 'MOWMEM*741QZ',
  licensedContractorLabel: 'Licensed WA Contractor · Reg. MOWMEM*741QZ',
  contractorRegistrationNote:
    'Licensed WA Contractor · Washington State Contractor Registration: MOWMEM*741QZ.',
  locationDisplay: 'Vancouver, Washington',
  regionSummary: 'Serving Clark County, Washington residential homes, rentals, and small properties.',
  oregonExclusionNote:
    'Focused exclusively on Clark County, Washington. We do not advertise or perform Oregon construction services.',
  serviceAreas: [
    {
      name: 'Vancouver',
      slug: 'vancouver',
      highlights: 'East & West Vancouver neighborhoods, established lots, urban fencing, and year-round lawn maintenance.',
      zipCodes: ['98660', '98661', '98662', '98663', '98664', '98665', '98682', '98683', '98684', '98685', '98686'],
    },
    {
      name: 'Hazel Dell',
      slug: 'hazel-dell',
      highlights: 'Recurring mowing, leaf cleanups, gutter clearing, and driveway pressure washing.',
      zipCodes: ['98665', '98685'],
    },
    {
      name: 'Salmon Creek',
      slug: 'salmon-creek',
      highlights: 'Blackberry and brush clearing, fence/gate repairs, and seasonal yard restoration.',
      zipCodes: ['98686'],
    },
    {
      name: 'Orchards',
      slug: 'orchards',
      highlights: 'Lawn maintenance, fence post and panel repairs, and practical handyman upkeep.',
      zipCodes: ['98662', '98682'],
    },
    {
      name: 'Five Corners',
      slug: 'five-corners',
      highlights: 'Residential and rental property cleanups, gutter service, and small exterior repairs.',
      zipCodes: ['98662', '98682'],
    },
    {
      name: 'Camas',
      slug: 'camas',
      highlights: 'Slope and edge trimming, moss-prone walkway pressure washing, and deck/fence touch-ups.',
      zipCodes: ['98607'],
    },
    {
      name: 'Ridgefield',
      slug: 'ridgefield',
      highlights: 'Larger lot mowing, brush control, gate hardware repairs, and seasonal debris hauling.',
      zipCodes: ['98642'],
    },
    {
      name: 'Battle Ground',
      slug: 'battle-ground',
      highlights: 'Blackberry clearing, fence line maintenance, small carpentry fixes, and yard cleanups.',
      zipCodes: ['98604'],
    },
    {
      name: 'La Center',
      slug: 'la-center',
      highlights: 'Property cleanups, storm branch clearing, outbuilding minor repairs, and mowing.',
      zipCodes: ['98629'],
    },
    {
      name: 'Brush Prairie',
      slug: 'brush-prairie',
      highlights: 'Acreage edge trimming, overgrown brush removal, fence repairs, and seasonal upkeep.',
      zipCodes: ['98606'],
    },
  ],
  socialProfiles: {
    googleBusinessUrl: '', // Add verified Google Business Profile URL once published
    facebookUrl: '', // Add verified Facebook Business Page URL once published
  },
} as const;

export const CLARK_COUNTY_ZIPS = new Set<string>([
  '98601', '98604', '98606', '98607', '98622', '98629', '98642',
  '98660', '98661', '98662', '98663', '98664', '98665', '98666',
  '98668', '98671', '98674', '98675', '98682', '98683', '98684',
  '98685', '98686', '98687',
]);
