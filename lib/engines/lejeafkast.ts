// Beregner lejeafkast for en investeringsejendom

const DRIFTSOMKOSTNINGS_FAKTOR = 0.85 // 85% af bruttolejen (15% til tomgang, vedligeholdelse mv.)
const BENCHMARK_AFKAST = 0.04 // 4% afkast anses som okay investering

export interface LejeafkastResultat {
  estimeret_maanedsleje: number
  aaarlig_nettoleje: number
  afkast_pct: number
  er_god_investering: boolean
  forskel_til_benchmark_pct: number
}

export function beregnLejeafkast(
  ejendomspris: number,
  estimereretMaanedsleje: number
): LejeafkastResultat {
  const aarligBruttoleje = estimereretMaanedsleje * 12
  const aarligNettoleje = aarligBruttoleje * DRIFTSOMKOSTNINGS_FAKTOR
  const afkastPct = (aarligNettoleje / ejendomspris) * 100

  return {
    estimeret_maanedsleje: estimereretMaanedsleje,
    aaarlig_nettoleje: Math.round(aarligNettoleje),
    afkast_pct: Math.round(afkastPct * 10) / 10,
    er_god_investering: afkastPct / 100 >= BENCHMARK_AFKAST,
    forskel_til_benchmark_pct: Math.round((afkastPct - BENCHMARK_AFKAST * 100) * 10) / 10,
  }
}

// Beregner realkreditydelse (annuitetsformel)
export function beregnMaanedsydelse(
  laanebeloeb: number,
  rente: number = parseFloat(process.env.REALKREDITRENTE ?? '0.0525'),
  loebetiid = 30 // år
): number {
  const maanedsRente = rente / 12
  const antalTerminer = loebetiid * 12

  if (maanedsRente === 0) return Math.round(laanebeloeb / antalTerminer)

  const ydelse =
    (laanebeloeb * maanedsRente * Math.pow(1 + maanedsRente, antalTerminer)) /
    (Math.pow(1 + maanedsRente, antalTerminer) - 1)

  return Math.round(ydelse)
}

// Beregner månedlig ejendomsskat (grundskyld)
export function beregnMaanedligGrundskyld(
  offentligVurdering: number,
  grundskyldspromille: number
): number {
  const aarligGrundskyld = (offentligVurdering * grundskyldspromille) / 1000
  return Math.round(aarligGrundskyld / 12)
}
