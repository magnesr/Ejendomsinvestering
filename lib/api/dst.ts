import { createServiceClient } from '@/lib/supabase/service'
import type { PrisindeksData, KvmPrisData } from '@/types/api'

const DST_BASE = 'https://api.statbank.dk/v1'

// Hent data fra Danmarks Statistik API
async function hentDSTData(tabel: string, parametre: Record<string, string[]>): Promise<Record<string, unknown> | null> {
  try {
    const svar = await fetch(`${DST_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: tabel,
        format: 'JSON',
        lang: 'da',
        variables: Object.entries(parametre).map(([id, values]) => ({ id, values })),
      }),
      next: { revalidate: 604800 }, // 7 dage
    })

    if (!svar.ok) return null
    return await svar.json()
  } catch {
    return null
  }
}

// Hent prisindeks for postnummer med cache
export async function hentPrisindeks(postnummer: string): Promise<PrisindeksData[]> {
  // Tjek cache
  try {
    const supabase = await createServiceClient()
    const { data: cachet } = await supabase
      .from('dst_cache')
      .select('data, gyldig_til')
      .eq('postnummer', postnummer)
      .eq('data_type', 'prisindeks')
      .single()

    if (cachet && new Date(cachet.gyldig_til) > new Date()) {
      return cachet.data as unknown as PrisindeksData[]
    }

    // Hent fra DST
    const data = await hentDSTData('EJENDOM6', {
      EJKAT: ['70'], // Ejerboliger
      POSTNR: [postnummer],
      Tid: ['*'], // Alle tilgængelige kvartaler
    })

    if (!data) return []

    // Parser DST svar
    const indeks: PrisindeksData[] = []
    const dstSvar = data as { dataset?: { dimension?: Record<string, unknown>; value?: number[] } }
    if (dstSvar.dataset?.value) {
      // Forenklet parsing — DST returnerer en kompakt JSON-stat format
      // Gemmes som rå data til beregningsenginen
    }

    // Gem i cache (7 dage TTL)
    const gyldigTil = new Date()
    gyldigTil.setDate(gyldigTil.getDate() + 7)

    await supabase.from('dst_cache').upsert({
      postnummer,
      data_type: 'prisindeks',
      data: (data ?? []) as unknown as import('@/types/database').Json,
      gyldig_til: gyldigTil.toISOString(),
    })

    return indeks
  } catch (error) {
    console.error('DST prisindeks fejl:', error)
    return []
  }
}

// Hent gennemsnitlig kvm-pris for postnummer
export async function hentKvmPriser(postnummer: string, boligtype = 'enfamiliehus'): Promise<KvmPrisData | null> {
  try {
    const supabase = await createServiceClient()
    const cacheNoegle = `kvmpris_${boligtype}`

    const { data: cachet } = await supabase
      .from('dst_cache')
      .select('data, gyldig_til')
      .eq('postnummer', postnummer)
      .eq('data_type', cacheNoegle)
      .single()

    if (cachet && new Date(cachet.gyldig_til) > new Date()) {
      return cachet.data as unknown as KvmPrisData
    }

    // PRISER111: Gennemsnitspriser per m2 på realiserede handler
    const data = await hentDSTData('PRISER111', {
      EJENDOMSKATEGORI: ['60'], // Parcel- og rækkehuse
      POSTNR: [postnummer],
      Tid: ['*'],
    })

    if (!data) return null

    // Gem i cache (7 dage TTL)
    const gyldigTil = new Date()
    gyldigTil.setDate(gyldigTil.getDate() + 7)

    await supabase.from('dst_cache').upsert({
      postnummer,
      data_type: cacheNoegle,
      data: (data ?? null) as unknown as import('@/types/database').Json,
      gyldig_til: gyldigTil.toISOString(),
    })

    // Returner rå data — parses af beregningsenginen
    return data as unknown as KvmPrisData
  } catch (error) {
    console.error('DST kvm-priser fejl:', error)
    return null
  }
}

// Hent grundskyldspromille for kommune
export async function hentGrundskyldspromille(kommunekode: string): Promise<number> {
  try {
    const supabase = await createServiceClient()

    const { data: cachet } = await supabase
      .from('dst_cache')
      .select('data, gyldig_til')
      .eq('postnummer', kommunekode)
      .eq('data_type', 'grundskyld')
      .single()

    if (cachet && new Date(cachet.gyldig_til) > new Date()) {
      return (cachet.data as unknown as { promille: number }).promille ?? 26
    }

    const data = await hentDSTData('KOMMUNESK', {
      SKAT: ['GRUNDSKYLD'],
      KOMKODE: [kommunekode],
      Tid: [new Date().getFullYear().toString()],
    })

    // Fallback: 26 promille (cirka landsgennemsnit 2024)
    const promille = (data as Record<string, unknown>)?.value ? 26 : 26

    const gyldigTil = new Date()
    gyldigTil.setFullYear(gyldigTil.getFullYear() + 1) // 1 år cache (ændres sjældent)

    await supabase.from('dst_cache').upsert({
      postnummer: kommunekode,
      data_type: 'grundskyld',
      data: { promille } as unknown as import('@/types/database').Json,
      gyldig_til: gyldigTil.toISOString(),
    })

    return promille
  } catch {
    return 26 // Fallback til landsgennemsnit
  }
}
