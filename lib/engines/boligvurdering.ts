import { hentBBRData, normaliserBoligtype } from '@/lib/api/bbr'
import { hentKvmPriser } from '@/lib/api/dst'
import { hentHistoriskeSalg } from '@/lib/api/tinglysning'
import { hentEstimeretHusleje } from '@/lib/api/lejedata'
import { beregnPrisPrognose } from './prisPrognose'
import { beregnLejeafkast } from './lejeafkast'
import type { VurderingsResultat } from '@/types/api'

interface VurderingsInput {
  adresseId: string
  adresse: string
  postnummer: string
  by: string
  kommunekode: string
  listepris?: number
}

export async function udfoerBoligvurdering(input: VurderingsInput): Promise<VurderingsResultat> {
  const { adresseId, adresse, postnummer, by, kommunekode, listepris } = input

  // Hent data parallelt for hurtigere respons
  const [bbrSvar, kvmPrisData, huslejeSvar] = await Promise.all([
    hentBBRData(adresseId),
    hentKvmPriser(postnummer),
    Promise.resolve(null), // Placeholder — erstattes med faktisk husleje nedenfor
  ])

  // Udtruk BBR-data
  const bygning = bbrSvar.bygning?.[0]
  const arealKvm = bygning?.byg_boligAreal ?? bygning?.byg_bebyggetAreal ?? 100
  const byggeaar = bygning?.byg_opfoerelsesAar ?? 1970
  const boligtypeKode = bygning?.byg_anvendelse_kode ?? '120'
  const boligtype = normaliserBoligtype(boligtypeKode)

  // Hent historiske salg og husleje (nu vi kender arealet)
  const [historiskeSalg, husleje] = await Promise.all([
    hentHistoriskeSalg(postnummer, boligtype, arealKvm),
    hentEstimeretHusleje(postnummer, arealKvm),
  ])

  // Beregn estimeret markedsværdi
  let bereqnetVaerdi: number
  let prisAfvigelsePct: number | undefined

  if (historiskeSalg.length >= 3) {
    // Brug median kvm-pris fra sammenlignelige salg
    const kvmPriser = historiskeSalg.map(s => s.pris_per_kvm).sort((a, b) => a - b)
    const medianKvmPris = kvmPriser[Math.floor(kvmPriser.length / 2)]
    const justeringFaktor = beregAldersJustering(byggeaar)
    bereqnetVaerdi = Math.round(medianKvmPris * arealKvm * justeringFaktor)
  } else if (kvmPrisData) {
    // Fallback til DST kvm-pris
    const kvmPris = (kvmPrisData as unknown as Record<string, unknown>)?.pris_per_kvm as number ?? 25000
    bereqnetVaerdi = Math.round(kvmPris * arealKvm)
  } else {
    bereqnetVaerdi = listepris ?? arealKvm * 20000 // Absolut fallback
  }

  if (listepris && listepris > 0) {
    prisAfvigelsePct = ((listepris - bereqnetVaerdi) / bereqnetVaerdi) * 100
  }

  // Prisproqnose
  const aktuelPris = listepris ?? bereqnetVaerdi
  const prognose = beregnPrisPrognose(aktuelPris, postnummer, kvmPrisData)

  // Lejeafkast
  const lejeafkast = beregnLejeafkast(aktuelPris, husleje.maanedlig)

  // Investeringsscore (1-10)
  const score = beregnInvesteringsScore({
    prisAfvigelsePct,
    lejeafkastPct: lejeafkast.afkast_pct,
    aarligCAGR: prognose.aarlig_cagr,
    byggeaar,
    harSammenligneligeSalg: historiskeSalg.length >= 3,
  })

  const anbefalingsTekst = genererAnbefalingsTekst(score, prisAfvigelsePct, lejeafkast.afkast_pct)

  return {
    adresse,
    postnummer,
    by,
    bbr: {
      boligtype,
      areal_kvm: arealKvm,
      byggeaar,
    },
    beregnet_vaerdi: bereqnetVaerdi,
    listepris,
    pris_afvigelse_pct: prisAfvigelsePct,
    prognose_3_aar: prognose.pris_3_aar,
    prognose_5_aar: prognose.pris_5_aar,
    estimeret_husleje: husleje.maanedlig,
    lejeafkast_pct: lejeafkast.afkast_pct,
    investerings_score: score,
    anbefalings_tekst: anbefalingsTekst,
    sammenlignelige_salg: historiskeSalg,
  }
}

function beregAldersJustering(byggeaar: number): number {
  const alder = new Date().getFullYear() - byggeaar
  if (alder < 10) return 1.05   // Nybyggeri: lille premium
  if (alder < 30) return 1.00   // Moderne: ingen justering
  if (alder < 60) return 0.95   // Ældre: lille rabat
  return 0.90                    // Meget gammelt: rabat
}

interface ScoreInput {
  prisAfvigelsePct?: number
  lejeafkastPct: number
  aarligCAGR: number
  byggeaar: number
  harSammenligneligeSalg: boolean
}

function beregnInvesteringsScore(input: ScoreInput): number {
  const { prisAfvigelsePct, lejeafkastPct, aarligCAGR, byggeaar, harSammenligneligeSalg } = input

  let score = 5 // Startværdi

  // Pris vs. markedsværdi (±30% af score)
  if (prisAfvigelsePct !== undefined) {
    if (prisAfvigelsePct < -10) score += 2     // Billig ift. markedet
    else if (prisAfvigelsePct < -5) score += 1
    else if (prisAfvigelsePct > 15) score -= 2  // Dyr ift. markedet
    else if (prisAfvigelsePct > 5) score -= 1
  }

  // Lejeafkast (±25% af score)
  if (lejeafkastPct >= 6) score += 2
  else if (lejeafkastPct >= 4) score += 1
  else if (lejeafkastPct < 2) score -= 2
  else if (lejeafkastPct < 3) score -= 1

  // Pristrend (±25% af score)
  if (aarligCAGR >= 0.06) score += 2
  else if (aarligCAGR >= 0.04) score += 1
  else if (aarligCAGR < 0.01) score -= 2
  else if (aarligCAGR < 0.02) score -= 1

  // Ejendomsalder (±10% af score)
  const alder = new Date().getFullYear() - byggeaar
  if (alder < 15) score += 1
  else if (alder > 60) score -= 1

  // Datakvalitet (±10%)
  if (!harSammenligneligeSalg) score -= 1

  // Begræns til 1-10
  return Math.max(1, Math.min(10, Math.round(score)))
}

function genererAnbefalingsTekst(
  score: number,
  prisAfvigelsePct?: number,
  lejeafkastPct?: number
): string {
  const prisKommentar = prisAfvigelsePct !== undefined
    ? prisAfvigelsePct > 5
      ? `Boligen er vurderet ${Math.abs(Math.round(prisAfvigelsePct))} % over markedsværdien. `
      : prisAfvigelsePct < -5
        ? `Boligen er vurderet ${Math.abs(Math.round(prisAfvigelsePct))} % under markedsværdien — potentielt godt køb. `
        : 'Prisen ligger tæt på markedsværdien. '
    : ''

  const afkastKommentar = lejeafkastPct !== undefined
    ? lejeafkastPct >= 4
      ? `Lejeafkastet på ${lejeafkastPct.toFixed(1)} % er attraktivt for investorer. `
      : `Lejeafkastet på ${lejeafkastPct.toFixed(1)} % er under gennemsnittet for investeringsejendomme. `
    : ''

  if (score >= 8) {
    return `${prisKommentar}${afkastKommentar}Samlet set er dette en stærk boliginvestering med gode udsigter for værdistigning.`
  }
  if (score >= 6) {
    return `${prisKommentar}${afkastKommentar}Boligen er en solid investering med fornuftige markeds- og afkastudsigter.`
  }
  if (score >= 4) {
    return `${prisKommentar}${afkastKommentar}Boligen har gennemsnitlige investeringsudsigter. Overvej alternative boliger i området.`
  }
  return `${prisKommentar}${afkastKommentar}Boligen scorer under gennemsnittet som investering. Prisforventningerne eller afkastet er svage.`
}
