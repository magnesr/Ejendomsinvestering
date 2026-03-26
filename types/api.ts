// DAWA — Danmarks Adressers Web API
export interface DAWAAdresse {
  id: string
  adressebetegnelse: string
  adgangsadresse: {
    id: string
    vejstykke: { navn: string }
    husnr: string
    postnummer: { nr: string; navn: string }
    kommune: { kode: string; navn: string }
  }
}

export interface DAWAAdgangspunkt {
  id: string
  adressebetegnelse?: string
  vejnavn: string
  husnr: string
  postnr: string
  postnrnavn: string
  kommunekode: string
}

// BBR — Bygnings- og Boligregistret
export interface BBRBygning {
  id_lokalId: string
  byg_anvendelse_kode: string
  byg_bebyggetAreal: number
  byg_boligAreal: number
  byg_opfoerelsesAar: number
  byg_varmeinstallation_kode: string
  grund: {
    hussnummer: Array<{
      adgangsadresse: { id_lokalId: string }
    }>
  }
}

export interface BBRSvar {
  bygning?: BBRBygning[]
  fejl?: string
}

// Danmarks Statistik
export interface DSTDataSvar {
  table: string
  heading: string[]
  data: Array<{
    key: string[]
    values: string[]
  }>
}

export interface PrisindeksData {
  postnummer: string
  kvartal: string
  indeks: number
}

export interface KvmPrisData {
  postnummer: string
  boligtype: string
  pris_per_kvm: number
  aar: number
}

// Tinglysning / handelspriser
export interface HistoriskHandel {
  adresse: string
  salgspris: number
  salgsdato: string
  boligtype: string
  areal_kvm: number
  pris_per_kvm: number
}

// Intern vurderingsresultat
export interface VurderingsResultat {
  adresse: string
  postnummer: string
  by: string
  bbr: {
    boligtype: string
    areal_kvm: number
    byggeaar: number
  }
  beregnet_vaerdi: number
  listepris?: number
  pris_afvigelse_pct?: number
  prognose_3_aar: number
  prognose_5_aar: number
  estimeret_husleje: number
  lejeafkast_pct: number
  investerings_score: number
  anbefalings_tekst: string
  sammenlignelige_salg: HistoriskHandel[]
}
