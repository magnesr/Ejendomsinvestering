// Estimerer fremtidig boligpris baseret på historisk prisudvikling

// Historiske CAGR per postnummerstype (simpel model til MVP)
// Baseret på DST data 2015-2024
function hentHistoriskCAGR(postnummer: string): number {
  const nr = parseInt(postnummer)

  // Storkøbenhavn: ~5-7% p.a. historisk
  if (nr >= 1000 && nr <= 2999) return 0.056
  // Nordsjælland / Aarhus: ~4-5%
  if ((nr >= 3000 && nr <= 3999) || (nr >= 8000 && nr <= 8299)) return 0.045
  // Odense / Aalborg: ~3-4%
  if ((nr >= 5000 && nr <= 5999) || (nr >= 9000 && nr <= 9999)) return 0.035
  // Øvrige: ~2-3%
  return 0.028
}

export interface PrisPrognoseResultat {
  pris_nu: number
  pris_1_aar: number
  pris_3_aar: number
  pris_5_aar: number
  aarlig_cagr: number
  kilde: string
}

export function beregnPrisPrognose(
  aktuelPris: number,
  postnummer: string,
  dstPrisindeksData?: unknown
): PrisPrognoseResultat {
  // Forsøg at beregne CAGR fra DST data
  let cagr = beregCAGRfraDST(dstPrisindeksData) ?? hentHistoriskCAGR(postnummer)
  const kilde = dstPrisindeksData ? 'Danmarks Statistik prisindeks' : 'Historisk markedsgennemsnit'

  return {
    pris_nu: aktuelPris,
    pris_1_aar: Math.round(aktuelPris * Math.pow(1 + cagr, 1)),
    pris_3_aar: Math.round(aktuelPris * Math.pow(1 + cagr, 3)),
    pris_5_aar: Math.round(aktuelPris * Math.pow(1 + cagr, 5)),
    aarlig_cagr: cagr,
    kilde,
  }
}

function beregCAGRfraDST(data: unknown): number | null {
  if (!data) return null

  try {
    // DST returnerer en JSON-stat struktur
    // Vi forsøger at udtrække de seneste 8 kvartaler og beregne trenden
    const dst = data as Record<string, unknown>
    const vaerdier: number[] = dst.value as number[] ?? []

    if (vaerdier.length < 4) return null

    // Filtrér nul-værdier og brug de seneste 8 kvartaler
    const gyldigeVaerdier = vaerdier.filter(v => v > 0).slice(-8)
    if (gyldigeVaerdier.length < 2) return null

    const foerste = gyldigeVaerdier[0]
    const sidst = gyldigeVaerdier[gyldigeVaerdier.length - 1]
    const aar = gyldigeVaerdier.length / 4 // Kvartaler til år

    if (foerste <= 0 || aar <= 0) return null

    return Math.pow(sidst / foerste, 1 / aar) - 1
  } catch {
    return null
  }
}
