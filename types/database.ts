export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlanType = 'freemium' | 'boligkoeber' | 'investor'
export type AbonnementStatus = 'aktiv' | 'annulleret' | 'udloebet'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          fuldt_navn: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          abonnement_type: PlanType
          abonnement_status: AbonnementStatus
          abonnement_slutter: string | null
          gratis_analyser_brugt: number
          gratis_analyser_nulstillet_dato: string
          oprettet_den: string
          opdateret_den: string
        }
        Insert: {
          id: string
          email: string
          fuldt_navn?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          abonnement_type?: PlanType
          abonnement_status?: AbonnementStatus
          abonnement_slutter?: string | null
          gratis_analyser_brugt?: number
          gratis_analyser_nulstillet_dato?: string
          oprettet_den?: string
          opdateret_den?: string
        }
        Update: {
          email?: string
          fuldt_navn?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          abonnement_type?: PlanType
          abonnement_status?: AbonnementStatus
          abonnement_slutter?: string | null
          gratis_analyser_brugt?: number
          gratis_analyser_nulstillet_dato?: string
          opdateret_den?: string
        }
        Relationships: never[]
      }
      boligvurderinger: {
        Row: {
          id: string
          bruger_id: string
          adresse: string
          postnummer: string
          by: string
          bbr_data: Json | null
          dst_data: Json | null
          tinglysning_data: Json | null
          beregnet_vaerdi: number | null
          investerings_score: number | null
          anbefalings_tekst: string | null
          prognose_3_aar: number | null
          prognose_5_aar: number | null
          lejeafkast_pct: number | null
          sammenligning_data: Json | null
          oprettet_den: string
        }
        Insert: {
          id?: string
          bruger_id: string
          adresse: string
          postnummer: string
          by: string
          bbr_data?: Json | null
          dst_data?: Json | null
          tinglysning_data?: Json | null
          beregnet_vaerdi?: number | null
          investerings_score?: number | null
          anbefalings_tekst?: string | null
          prognose_3_aar?: number | null
          prognose_5_aar?: number | null
          lejeafkast_pct?: number | null
          sammenligning_data?: Json | null
          oprettet_den?: string
        }
        Update: {
          adresse?: string
          postnummer?: string
          by?: string
          bbr_data?: Json | null
          dst_data?: Json | null
          tinglysning_data?: Json | null
          beregnet_vaerdi?: number | null
          investerings_score?: number | null
          anbefalings_tekst?: string | null
          prognose_3_aar?: number | null
          prognose_5_aar?: number | null
          lejeafkast_pct?: number | null
          sammenligning_data?: Json | null
        }
        Relationships: never[]
      }
      portefolje_ejendomme: {
        Row: {
          id: string
          bruger_id: string
          adresse: string
          postnummer: string
          koebspris: number | null
          koebsdato: string | null
          bbr_data: Json | null
          seneste_vaerdi: number | null
          seneste_opdatering: string | null
          prognose_1_aar: number | null
          prognose_3_aar: number | null
          prognose_5_aar: number | null
          estimeret_husleje: number | null
          lejeafkast_pct: number | null
          er_udlejningsejendom: boolean
          oprettet_den: string
        }
        Insert: {
          id?: string
          bruger_id: string
          adresse: string
          postnummer: string
          koebspris?: number | null
          koebsdato?: string | null
          bbr_data?: Json | null
          seneste_vaerdi?: number | null
          seneste_opdatering?: string | null
          prognose_1_aar?: number | null
          prognose_3_aar?: number | null
          prognose_5_aar?: number | null
          estimeret_husleje?: number | null
          lejeafkast_pct?: number | null
          er_udlejningsejendom?: boolean
          oprettet_den?: string
        }
        Update: {
          adresse?: string
          postnummer?: string
          koebspris?: number | null
          koebsdato?: string | null
          bbr_data?: Json | null
          seneste_vaerdi?: number | null
          seneste_opdatering?: string | null
          prognose_1_aar?: number | null
          prognose_3_aar?: number | null
          prognose_5_aar?: number | null
          estimeret_husleje?: number | null
          lejeafkast_pct?: number | null
          er_udlejningsejendom?: boolean
        }
        Relationships: never[]
      }
      boligrejse_planer: {
        Row: {
          id: string
          bruger_id: string
          nuvaerende_budget: number | null
          nuvaerende_bolig_vaerdi: number | null
          nuvaerende_gaeld: number | null
          droemme_type: string | null
          droemme_omraade: string | null
          droemme_pris_min: number | null
          droemme_pris_max: number | null
          plan_data: Json | null
          naeste_opdatering: string | null
          sidst_sendt_email: string | null
          oprettet_den: string
          opdateret_den: string
        }
        Insert: {
          id?: string
          bruger_id: string
          nuvaerende_budget?: number | null
          nuvaerende_bolig_vaerdi?: number | null
          nuvaerende_gaeld?: number | null
          droemme_type?: string | null
          droemme_omraade?: string | null
          droemme_pris_min?: number | null
          droemme_pris_max?: number | null
          plan_data?: Json | null
          naeste_opdatering?: string | null
          sidst_sendt_email?: string | null
          oprettet_den?: string
          opdateret_den?: string
        }
        Update: {
          nuvaerende_budget?: number | null
          nuvaerende_bolig_vaerdi?: number | null
          nuvaerende_gaeld?: number | null
          droemme_type?: string | null
          droemme_omraade?: string | null
          droemme_pris_min?: number | null
          droemme_pris_max?: number | null
          plan_data?: Json | null
          naeste_opdatering?: string | null
          sidst_sendt_email?: string | null
          opdateret_den?: string
        }
        Relationships: never[]
      }
      markedsradar_opsaetninger: {
        Row: {
          id: string
          bruger_id: string
          postnummer: string
          seneste_pris_index: number | null
          boligtype: string
          notifikation_email: boolean
          sidst_kontrolleret: string | null
          oprettet_den: string
        }
        Insert: {
          id?: string
          bruger_id: string
          postnummer: string
          seneste_pris_index?: number | null
          boligtype?: string
          notifikation_email?: boolean
          sidst_kontrolleret?: string | null
          oprettet_den?: string
        }
        Update: {
          postnummer?: string
          seneste_pris_index?: number | null
          boligtype?: string
          notifikation_email?: boolean
          sidst_kontrolleret?: string | null
        }
        Relationships: never[]
      }
      markedsradar_haendelser: {
        Row: {
          id: string
          radar_id: string
          haendelse_type: string
          beskrivelse: string
          vaerdi: number | null
          oprettet_den: string
        }
        Insert: {
          id?: string
          radar_id: string
          haendelse_type: string
          beskrivelse: string
          vaerdi?: number | null
          oprettet_den?: string
        }
        Update: {
          haendelse_type?: string
          beskrivelse?: string
          vaerdi?: number | null
        }
        Relationships: never[]
      }
      sammenligninger: {
        Row: {
          id: string
          bruger_id: string
          navn: string | null
          ejendomme: Json
          oprettet_den: string
        }
        Insert: {
          id?: string
          bruger_id: string
          navn?: string | null
          ejendomme?: Json
          oprettet_den?: string
        }
        Update: {
          navn?: string | null
          ejendomme?: Json
        }
        Relationships: never[]
      }
      dst_cache: {
        Row: {
          id: string
          postnummer: string
          data_type: string
          data: Json
          gyldig_til: string
          oprettet_den: string
        }
        Insert: {
          id?: string
          postnummer: string
          data_type: string
          data: Json
          gyldig_til: string
          oprettet_den?: string
        }
        Update: {
          data?: Json
          gyldig_til?: string
        }
        Relationships: never[]
      }
    }
    Views: Record<string, { Row: Record<string, unknown>; Relationships: never[] }>
    Functions: {
      tjek_og_opret_vurdering_tilladelse: {
        Args: { p_bruger_id: string }
        Returns: boolean
      }
      hent_abonnement: {
        Args: { p_bruger_id: string }
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}
