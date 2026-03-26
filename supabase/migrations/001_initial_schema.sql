-- Boligpulsen — Initial skema
-- Migration 001: Tabeller

-- Profiles (udvider auth.users 1:1)
CREATE TABLE public.profiles (
  id                              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                           text NOT NULL,
  fuldt_navn                      text,
  stripe_customer_id              text UNIQUE,
  stripe_subscription_id          text UNIQUE,
  abonnement_type                 text NOT NULL DEFAULT 'freemium'
                                    CHECK (abonnement_type IN ('freemium', 'boligkoeber', 'investor')),
  abonnement_status               text NOT NULL DEFAULT 'aktiv'
                                    CHECK (abonnement_status IN ('aktiv', 'annulleret', 'udloebet')),
  abonnement_slutter              timestamptz,
  gratis_analyser_brugt           integer NOT NULL DEFAULT 0,
  gratis_analyser_nulstillet_dato date NOT NULL DEFAULT CURRENT_DATE,
  oprettet_den                    timestamptz NOT NULL DEFAULT now(),
  opdateret_den                   timestamptz NOT NULL DEFAULT now()
);

-- Boligvurderinger
CREATE TABLE public.boligvurderinger (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bruger_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  adresse             text NOT NULL,
  postnummer          text NOT NULL,
  by                  text NOT NULL,
  bbr_data            jsonb,
  dst_data            jsonb,
  tinglysning_data    jsonb,
  beregnet_vaerdi     numeric(12, 2),
  investerings_score  integer CHECK (investerings_score BETWEEN 1 AND 10),
  anbefalings_tekst   text,
  prognose_3_aar      numeric(12, 2),
  prognose_5_aar      numeric(12, 2),
  lejeafkast_pct      numeric(5, 2),
  sammenligning_data  jsonb,
  oprettet_den        timestamptz NOT NULL DEFAULT now()
);

-- Portefølje-ejendomme (kun investor)
CREATE TABLE public.portefolje_ejendomme (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bruger_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  adresse                 text NOT NULL,
  postnummer              text NOT NULL,
  koebspris               numeric(12, 2),
  koebsdato               date,
  bbr_data                jsonb,
  seneste_vaerdi          numeric(12, 2),
  seneste_opdatering      timestamptz,
  prognose_1_aar          numeric(12, 2),
  prognose_3_aar          numeric(12, 2),
  prognose_5_aar          numeric(12, 2),
  estimeret_husleje       numeric(10, 2),
  lejeafkast_pct          numeric(5, 2),
  er_udlejningsejendom    boolean NOT NULL DEFAULT false,
  oprettet_den            timestamptz NOT NULL DEFAULT now()
);

-- Boligrejse-planer
CREATE TABLE public.boligrejse_planer (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bruger_id                   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nuvaerende_budget           numeric(12, 2),
  nuvaerende_bolig_vaerdi     numeric(12, 2),
  nuvaerende_gaeld            numeric(12, 2),
  droemme_type                text,
  droemme_omraade             text,
  droemme_pris_min            numeric(12, 2),
  droemme_pris_max            numeric(12, 2),
  plan_data                   jsonb,
  naeste_opdatering           date,
  sidst_sendt_email           timestamptz,
  oprettet_den                timestamptz NOT NULL DEFAULT now(),
  opdateret_den               timestamptz NOT NULL DEFAULT now()
);

-- Markedsradar-opsætninger
CREATE TABLE public.markedsradar_opsaetninger (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bruger_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  postnummer            text NOT NULL,
  seneste_pris_index    numeric(8, 2),
  boligtype             text NOT NULL DEFAULT 'alle',
  notifikation_email    boolean NOT NULL DEFAULT true,
  sidst_kontrolleret    timestamptz,
  oprettet_den          timestamptz NOT NULL DEFAULT now()
);

-- Markedsradar-hændelser
CREATE TABLE public.markedsradar_haendelser (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  radar_id        uuid NOT NULL REFERENCES public.markedsradar_opsaetninger(id) ON DELETE CASCADE,
  haendelse_type  text NOT NULL
                    CHECK (haendelse_type IN ('pris_stigning', 'pris_fald', 'koebers_marked', 'saelgers_marked')),
  beskrivelse     text NOT NULL,
  vaerdi          numeric(10, 2),
  oprettet_den    timestamptz NOT NULL DEFAULT now()
);

-- Sammenligninger
CREATE TABLE public.sammenligninger (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bruger_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  navn          text,
  ejendomme     jsonb NOT NULL DEFAULT '[]',
  oprettet_den  timestamptz NOT NULL DEFAULT now()
);

-- DST-cache (reducerer API-kald)
CREATE TABLE public.dst_cache (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postnummer    text NOT NULL,
  data_type     text NOT NULL,
  data          jsonb NOT NULL,
  gyldig_til    timestamptz NOT NULL,
  oprettet_den  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (postnummer, data_type)
);

-- Indekser for performance
CREATE INDEX idx_boligvurderinger_bruger ON public.boligvurderinger(bruger_id);
CREATE INDEX idx_portefolje_bruger ON public.portefolje_ejendomme(bruger_id);
CREATE INDEX idx_boligrejse_bruger ON public.boligrejse_planer(bruger_id);
CREATE INDEX idx_radar_bruger ON public.markedsradar_opsaetninger(bruger_id);
CREATE INDEX idx_dst_cache_lookup ON public.dst_cache(postnummer, data_type);
