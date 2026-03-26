import { createServiceClient } from '@/lib/supabase/service'

// Lejeniveauer per postnummer
// Primær: DST LEJEPRISER (officielt)
// Sekundær: Estimat baseret på historiske data

// Kendte lejeniveauer (kr/m² per måned) — bruges som fallback
// Opdateres halvårligt manuelt baseret på markedsrapporter
const LEJENIVEAUER_FALLBACK: Record<string, number> = {
  // København
  '1000': 170, '1050': 165, '1100': 160, '1150': 155, '1200': 150,
  '1300': 155, '1400': 150, '1500': 145, '1600': 145, '1700': 140,
  '1800': 145, '1900': 150, '2000': 145, '2100': 140, '2200': 135,
  '2300': 130, '2400': 130, '2450': 125, '2500': 130, '2600': 120,
  '2605': 115, '2610': 115, '2620': 120, '2625': 115, '2630': 110,
  '2635': 110, '2640': 108, '2650': 112, '2660': 110, '2665': 108,
  '2670': 110, '2700': 115, '2720': 113, '2730': 112, '2740': 108,
  '2750': 110, '2760': 108, '2765': 105, '2770': 108, '2791': 105,
  '2800': 130, '2820': 125, '2830': 120, '2840': 118, '2850': 115,
  '2860': 115, '2880': 118, '2900': 120,
  // Aarhus
  '8000': 110, '8200': 105, '8210': 100, '8220': 95, '8230': 90,
  '8240': 88, '8250': 85, '8260': 83, '8270': 82, '8300': 85,
  '8310': 83, '8320': 80, '8330': 82, '8340': 80, '8350': 78,
  // Odense
  '5000': 90, '5200': 88, '5210': 85, '5220': 82, '5230': 80,
  '5240': 78, '5250': 76, '5260': 75,
  // Aalborg
  '9000': 85, '9200': 82, '9210': 78, '9220': 75, '9230': 73,
}

const LANDSGENNEMSNIT = 75 // kr/m²/måned

export async function hentEstimeretHusleje(
  postnummer: string,
  arealKvm: number
): Promise<{ maanedlig: number; kilde: string }> {
  try {
    const supabase = await createServiceClient()

    // Tjek cache
    const { data: cachet } = await supabase
      .from('dst_cache')
      .select('data, gyldig_til')
      .eq('postnummer', postnummer)
      .eq('data_type', 'leje')
      .single()

    if (cachet && new Date(cachet.gyldig_til) > new Date()) {
      const cacheData = cachet.data as unknown as { kvm_pris: number; kilde: string }
      return {
        maanedlig: Math.round(cacheData.kvm_pris * arealKvm),
        kilde: cacheData.kilde,
      }
    }

    // Forsøg at scrape fra Lejebolig.dk (ingen officiel API)
    const scraperResultat = await forsoegscrapeLejedata(postnummer)

    let kvmPris = scraperResultat ?? LEJENIVEAUER_FALLBACK[postnummer] ?? LANDSGENNEMSNIT
    let kilde = scraperResultat
      ? 'Lejebolig.dk markedsdata'
      : LEJENIVEAUER_FALLBACK[postnummer]
        ? 'Historisk markedsdata'
        : 'Landsgennemsnit'

    // Gem i cache (30 dage)
    const gyldigTil = new Date()
    gyldigTil.setDate(gyldigTil.getDate() + 30)

    await supabase.from('dst_cache').upsert({
      postnummer,
      data_type: 'leje',
      data: { kvm_pris: kvmPris, kilde } as unknown as import('@/types/database').Json,
      gyldig_til: gyldigTil.toISOString(),
    })

    return {
      maanedlig: Math.round(kvmPris * arealKvm),
      kilde,
    }
  } catch {
    const kvmPris = LEJENIVEAUER_FALLBACK[postnummer] ?? LANDSGENNEMSNIT
    return {
      maanedlig: Math.round(kvmPris * arealKvm),
      kilde: 'Estimat',
    }
  }
}

// Forsøger at hente lejeniveau fra Lejebolig.dk søgning
// Fragil — wrapper returnerer null ved fejl
async function forsoegscrapeLejedata(postnummer: string): Promise<number | null> {
  try {
    const svar = await fetch(
      `https://www.lejebolig.dk/lejebolig?ZipCode=${postnummer}&pageSize=20`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Boligpulsen/1.0)',
          Accept: 'text/html',
        },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000), // 5 sekunder timeout
      }
    )

    if (!svar.ok) return null

    const html = await svar.text()

    // Enkel regex til at finde priserne i HTML — fragil men tilstrækkelig til MVP
    const prisRegex = /(\d{1,2}\.?\d{3})\s*kr\.?\s*\/?\s*md/gi
    const priser: number[] = []
    let match

    while ((match = prisRegex.exec(html)) !== null) {
      const pris = parseInt(match[1].replace('.', ''))
      if (pris > 2000 && pris < 50000) priser.push(pris)
    }

    if (priser.length < 3) return null

    // Gennemsnitlig kvm-pris (antager gennemsnitligt areal på 80 m²)
    const median = priser.sort((a, b) => a - b)[Math.floor(priser.length / 2)]
    return Math.round(median / 80)
  } catch {
    return null
  }
}
