export const PLANER = {
  boligkoeber_maaned: process.env.STRIPE_PRICE_BOLIGKOEBER_MAANED!,
  boligkoeber_aar: process.env.STRIPE_PRICE_BOLIGKOEBER_AAR!,
  investor_maaned: process.env.STRIPE_PRICE_INVESTOR_MAANED!,
  investor_aar: process.env.STRIPE_PRICE_INVESTOR_AAR!,
} as const

export type PlanType = 'freemium' | 'boligkoeber' | 'investor'

export function getPlanTypeFromPriceId(priceId: string): PlanType {
  if ([PLANER.boligkoeber_maaned, PLANER.boligkoeber_aar].includes(priceId as never)) {
    return 'boligkoeber'
  }
  if ([PLANER.investor_maaned, PLANER.investor_aar].includes(priceId as never)) {
    return 'investor'
  }
  return 'freemium'
}

export const PLAN_METADATA = {
  boligkoeber: {
    navn: 'Boligkøber',
    beskrivelse: 'Til dig der leder efter den perfekte bolig',
    maanedspris: 99,
    aarspris: 990,
    features: [
      'Ubegrænsede boligvurderinger',
      'Boligrejse-planlægning',
      'Markedsradar med notifikationer',
      'Skatte- og omkostningsoverblik',
      'Sammenligningsværktøj',
    ],
  },
  investor: {
    navn: 'Investor',
    beskrivelse: 'Til den seriøse ejendomsinvestor',
    maanedspris: 299,
    aarspris: 2990,
    features: [
      'Alt i Boligkøber',
      'Portefølje-dashboard',
      'Udlejningsafkast-beregning',
      'Estimeret lejeindtægt per ejendom',
      'Automatisk opgraderingsflow',
    ],
  },
} as const
