import { beregnMaanedsydelse } from './lejeafkast'
import { beregnPrisPrognose } from './prisPrognose'

export interface BoligrejseInput {
  nuvaerende_budget: number
  nuvaerende_bolig_vaerdi?: number
  nuvaerende_gaeld?: number
  droemme_pris_min: number
  droemme_pris_max: number
  droemme_omraade?: string
  droemme_type?: string
}

export interface BoligrejseTrin {
  trin: number
  titel: string
  beskrivelse: string
  tidspunkt: string // relativ tid fx "Nu", "Om 2 år"
  beloeb?: number
}

export interface BoligrejsePlan {
  nuvaerende_frivaerdi: number
  maks_koebspris_nu: number
  anbefalet_koebspris: number
  maanedlig_ydelse: number
  droemme_pris_midtpunkt: number
  forventet_droemme_aar: string
  trin: BoligrejseTrin[]
  opsum: string
}

const UDBETALING_PCTS = 0.20 // 20% udbetaling krav
const BOLIGKOEBS_OMKOSTNINGER = 0.03 // ca. 3% i tinglysning, advokat mv.

export function beregnBoligrejse(input: BoligrejseInput): BoligrejsePlan {
  const {
    nuvaerende_budget,
    nuvaerende_bolig_vaerdi = 0,
    nuvaerende_gaeld = 0,
    droemme_pris_min,
    droemme_pris_max,
    droemme_omraade = 'Danmark',
  } = input

  const droemme_pris_midtpunkt = (droemme_pris_min + droemme_pris_max) / 2

  // Beregn nuværende friværdi
  const frivaerdi = Math.max(0, nuvaerende_bolig_vaerdi - nuvaerende_gaeld)
  const samletRaadighedsbeloeb = nuvaerende_budget + frivaerdi

  // Maks køb nu (med 20% udbetaling)
  const maksPrisNu = samletRaadighedsbeloeb / UDBETALING_PCTS
  const anbefalet_koebspris = Math.min(maksPrisNu * 0.85, droemme_pris_min * 0.7)
  const faktiskAanbefaletkKoebspris = Math.max(anbefalet_koebspris, nuvaerende_budget / UDBETALING_PCTS * 0.8)

  const laanNu = faktiskAanbefaletkKoebspris * (1 - UDBETALING_PCTS)
  const maanedligYdelse = beregnMaanedsydelse(laanNu)

  // Estimer hvornår de kan købe drømmeboligen
  // Antager 5% prisudvikling per år på nuværende bolig
  const aarligCAGR = 0.045
  let aarTilDroemm = 0
  let fremtidigFrivaerdi = frivaerdi

  if (nuvaerende_bolig_vaerdi > 0) {
    for (let aar = 1; aar <= 15; aar++) {
      const fremtidigBoligVaerdi = nuvaerende_bolig_vaerdi * Math.pow(1 + aarligCAGR, aar)
      const opsparing = nuvaerende_budget + (aar * 3000 * 12) // Antager 3.000 kr/md opsparing
      fremtidigFrivaerdi = fremtidigBoligVaerdi - nuvaerende_gaeld + opsparing

      if (fremtidigFrivaerdi >= droemme_pris_midtpunkt * UDBETALING_PCTS) {
        aarTilDroemm = aar
        break
      }
    }
  } else {
    // Ingen nuværende bolig — kun opsparing
    const maanedligOpsparing = 5000
    const aarNødvendig = (droemme_pris_midtpunkt * UDBETALING_PCTS - nuvaerende_budget) / (maanedligOpsparing * 12)
    aarTilDroemm = Math.max(0, Math.ceil(aarNødvendig))
  }

  const iAar = new Date().getFullYear()
  const forventetDroemmeAar = aarTilDroemm === 0
    ? 'Nu'
    : `${iAar + aarTilDroemm}`

  // Byg trinplan
  const trin: BoligrejseTrin[] = []

  if (nuvaerende_bolig_vaerdi > 0 && frivaerdi > 0) {
    trin.push({
      trin: 1,
      titel: 'Udnyt din nuværende friværdi',
      beskrivelse: `Du har ${formaterKr(frivaerdi)} i friværdi. Overvej om du kan bruge den som udbetaling på næste køb.`,
      tidspunkt: 'Nu',
      beloeb: frivaerdi,
    })
  }

  if (faktiskAanbefaletkKoebspris > 0 && faktiskAanbefaletkKoebspris < droemme_pris_min) {
    trin.push({
      trin: trin.length + 1,
      titel: 'Køb en mellemstation',
      beskrivelse: `Med dit nuværende budget kan du købe en bolig til ca. ${formaterKr(faktiskAanbefaletkKoebspris)}. Denne bolig kan stige i værdi og give dig bedre forudsætninger for drømmeboligen.`,
      tidspunkt: 'Nu',
      beloeb: faktiskAanbefaletkKoebspris,
    })
  }

  if (nuvaerende_bolig_vaerdi > 0) {
    const bedstSalgTidspunkt = aarTilDroemm > 0 ? `Om ca. ${aarTilDroemm} år` : 'Snart'
    trin.push({
      trin: trin.length + 1,
      titel: 'Sælg og spring til drømmeboligen',
      beskrivelse: `Baseret på historisk prisudvikling anbefales det at sælge og opgradere ${bedstSalgTidspunkt.toLowerCase()}, når din friværdi kan dække udbetalingen på drømmeboligen.`,
      tidspunkt: bedstSalgTidspunkt,
      beloeb: droemme_pris_midtpunkt,
    })
  } else {
    trin.push({
      trin: trin.length + 1,
      titel: 'Nå drømmeboligen',
      beskrivelse: aarTilDroemm === 0
        ? `Du har råd til en bolig i din ønskede prisklasse nu!`
        : `Ved at spare ${formaterKr(5000)}/md kan du have råd til drømmeboligen om ca. ${aarTilDroemm} år.`,
      tidspunkt: forventetDroemmeAar === 'Nu' ? 'Nu' : `${forventetDroemmeAar}`,
      beloeb: droemme_pris_midtpunkt,
    })
  }

  const opsum = genererOpsum(samletRaadighedsbeloeb, droemme_pris_midtpunkt, aarTilDroemm, maanedligYdelse)

  return {
    nuvaerende_frivaerdi: frivaerdi,
    maks_koebspris_nu: maksPrisNu,
    anbefalet_koebspris: faktiskAanbefaletkKoebspris,
    maanedlig_ydelse: maanedligYdelse,
    droemme_pris_midtpunkt,
    forventet_droemme_aar: forventetDroemmeAar,
    trin,
    opsum,
  }
}

function formaterKr(beloeb: number): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0,
  }).format(beloeb)
}

function genererOpsum(
  raadighedsbeloeb: number,
  droemme: number,
  aarTil: number,
  ydelse: number
): string {
  if (raadighedsbeloeb >= droemme * UDBETALING_PCTS) {
    return `Du har allerede råd til at købe en bolig i din ønskede prisklasse. Din estimerede månedlige ydelse vil være ca. ${formaterKr(ydelse)}.`
  }
  return `Med din nuværende økonomi kan du nå drømmeboligen om ca. ${aarTil} år ved at udnytte din friværdi og fortsætte med at spare op. Din estimerede månedlige ydelse på drømmeboligen vil være ca. ${formaterKr(beregnMaanedsydelse(droemme * 0.80))}.`
}
