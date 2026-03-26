import type { HistoriskHandel } from '@/types/api'

// Henter historiske handelspriser via Datafordelers ejendomssalgsstatistik
// Kræver gratis registrering på datafordeler.dk

const DATAFORDELER_BASE = 'https://services.datafordeler.dk'

interface EjendomSalg {
  KoebeSum: number
  OvrigSalgsdato: string
  EjendomsType: string
  BebyggetAreal?: number
  SamletAreal?: number
}

export async function hentHistoriskeSalg(
  postnummer: string,
  boligtype: string,
  arealKvm: number,
  antalResultater = 10
): Promise<HistoriskHandel[]> {
  const brugernavn = process.env.DATAFORDELER_USERNAME
  const kodeord = process.env.DATAFORDELER_PASSWORD

  if (!brugernavn || !kodeord) {
    console.warn('Tinglysning: Datafordeler-legitimationsoplysninger mangler')
    return genererFallbackSalg(postnummer, arealKvm)
  }

  try {
    // ESR Ejendomssalg: historiske handler per postnummer
    const url = new URL(`${DATAFORDELER_BASE}/EJENDOMSSALG/EJENDOMSSALG/1/REST/SALG`)
    url.searchParams.set('username', brugernavn)
    url.searchParams.set('password', kodeord)
    url.searchParams.set('PostNr', postnummer)
    url.searchParams.set('pagesize', antalResultater.toString())
    url.searchParams.set('format', 'JSON')

    const svar = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // 24 timers cache
    })

    if (!svar.ok) {
      return genererFallbackSalg(postnummer, arealKvm)
    }

    const data = await svar.json()
    const salg: EjendomSalg[] = data?.features ?? data?.results ?? []

    // Filtrér til sammenlignelige boliger (±30% areal)
    const sammenlignelige = salg
      .filter((s) => {
        const areal = s.BebyggetAreal ?? s.SamletAreal ?? 0
        return areal > 0 && Math.abs(areal - arealKvm) / arealKvm < 0.3
      })
      .map((s) => {
        const areal = s.BebyggetAreal ?? s.SamletAreal ?? arealKvm
        return {
          adresse: `${postnummer} (sammenlignelig)`,
          salgspris: s.KoebeSum,
          salgsdato: s.OvrigSalgsdato ?? new Date().toISOString().split('T')[0],
          boligtype: s.EjendomsType ?? boligtype,
          areal_kvm: areal,
          pris_per_kvm: Math.round(s.KoebeSum / areal),
        } satisfies HistoriskHandel
      })
      .slice(0, 5)

    return sammenlignelige.length > 0 ? sammenlignelige : genererFallbackSalg(postnummer, arealKvm)
  } catch (error) {
    console.error('Tinglysning opslag fejlede:', error)
    return genererFallbackSalg(postnummer, arealKvm)
  }
}

// Fallback ved manglende API-adgang — returnerer tomme data
function genererFallbackSalg(postnummer: string, arealKvm: number): HistoriskHandel[] {
  console.warn(`Bruger fallback salgspriser for postnummer ${postnummer}`)
  return []
}
