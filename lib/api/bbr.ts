import type { BBRBygning, BBRSvar, DAWAAdgangspunkt } from '@/types/api'

const DAWA_BASE = 'https://api.dataforsyningen.dk'
const BBR_BASE = 'https://bbr.fr2.dk/api/v1'

// Opslag via DAWA — Danmarks Adressers Web API (gratis, ingen auth)
export async function findAdresse(soegeTekst: string): Promise<DAWAAdgangspunkt[]> {
  const url = `${DAWA_BASE}/adresser?q=${encodeURIComponent(soegeTekst)}&format=json&per_side=8`
  const svar = await fetch(url, { next: { revalidate: 3600 } })

  if (!svar.ok) return []

  const data = await svar.json()
  return data.map((a: Record<string, unknown>) => {
    const adgangs = a.adgangsadresse as Record<string, unknown>
    const vejstykke = adgangs?.vejstykke as Record<string, unknown>
    const postnummer = adgangs?.postnummer as Record<string, unknown>
    return {
      id: a.id as string,
      adressebetegnelse: a.adressebetegnelse as string,
      vejnavn: vejstykke?.navn as string,
      husnr: adgangs?.husnr as string,
      postnr: postnummer?.nr as string,
      postnrnavn: postnummer?.navn as string,
      kommunekode: (adgangs?.kommune as Record<string, unknown>)?.kode as string,
      adgangsadresse_id: adgangs?.id as string,
    }
  })
}

// Autocomplete til adressefeltet
export async function autocompleteAdresse(soegeTekst: string): Promise<Array<{ tekst: string; id: string; adgangsadresse_id: string; postnr: string; postnrnavn: string }>> {
  if (soegeTekst.length < 3) return []

  const url = `${DAWA_BASE}/autocomplete?q=${encodeURIComponent(soegeTekst)}&type=adresse&per_side=8`
  const svar = await fetch(url, { next: { revalidate: 60 } })

  if (!svar.ok) return []

  const data = await svar.json()
  return data.map((item: Record<string, unknown>) => {
    const adresse = item.data as Record<string, unknown>
    const adgangs = adresse?.adgangsadresse as Record<string, unknown>
    const postnummer = adgangs?.postnummer as Record<string, unknown>
    return {
      tekst: item.tekst as string,
      id: adresse?.id as string,
      adgangsadresse_id: adgangs?.id as string,
      postnr: postnummer?.nr as string ?? '',
      postnrnavn: postnummer?.navn as string ?? '',
    }
  })
}

// BBR-opslag via Datafordeler — kræver gratis registrering
export async function hentBBRData(adgangsadresseId: string): Promise<BBRSvar> {
  const brugernavn = process.env.DATAFORDELER_USERNAME
  const kodeord = process.env.DATAFORDELER_PASSWORD

  if (!brugernavn || !kodeord) {
    console.warn('BBR: Datafordeler-legitimationsoplysninger mangler')
    return { fejl: 'Datafordeler ikke konfigureret' }
  }

  const url = `${BBR_BASE}/BBRSag?AdresseIdentificerer=${adgangsadresseId}&username=${brugernavn}&password=${kodeord}`

  try {
    const svar = await fetch(url, {
      next: { revalidate: 86400 }, // 24 timer cache
    })

    if (!svar.ok) {
      return { fejl: `BBR HTTP ${svar.status}` }
    }

    const data = await svar.json()
    const bygninger: BBRBygning[] = data?.[0]?.bygning ?? []

    return { bygning: bygninger }
  } catch (error) {
    console.error('BBR opslag fejlede:', error)
    return { fejl: 'BBR utilgængeligt' }
  }
}

// Normaliser BBR boligtype-kode til dansk tekst
export function normaliserBoligtype(kode: string): string {
  const typer: Record<string, string> = {
    '110': 'Stuehus til landbrugsejendom',
    '120': 'Fritliggende enfamiliehus',
    '121': 'Fritliggende enfamiliehus (dobbelthus)',
    '130': 'Række-, kæde- eller dobbelthus',
    '131': 'Række-, kæde- eller dobbelthus',
    '132': 'Række-, kæde- eller dobbelthus',
    '140': 'Etageboligbebyggelse',
    '150': 'Kollegium',
    '160': 'Boligbyggeri til døgninstitution',
    '185': 'Anneks i tilknytning til helårsbolig',
    '190': 'Anden bygning til helårsbeboelse',
  }
  return typer[kode] ?? 'Bolig'
}
