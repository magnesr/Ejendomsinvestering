-- Boligpulsen — RLS Politikker
-- Migration 002: Row Level Security

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan se eget profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Brugere kan opdatere eget profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- boligvurderinger
ALTER TABLE public.boligvurderinger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan se egne vurderinger"
  ON public.boligvurderinger FOR SELECT
  USING (auth.uid() = bruger_id);

CREATE POLICY "Brugere kan oprette vurderinger"
  ON public.boligvurderinger FOR INSERT
  WITH CHECK (auth.uid() = bruger_id);

CREATE POLICY "Brugere kan slette egne vurderinger"
  ON public.boligvurderinger FOR DELETE
  USING (auth.uid() = bruger_id);

-- portefolje_ejendomme
ALTER TABLE public.portefolje_ejendomme ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan se egne ejendomme"
  ON public.portefolje_ejendomme FOR SELECT
  USING (auth.uid() = bruger_id);

CREATE POLICY "Brugere kan oprette ejendomme"
  ON public.portefolje_ejendomme FOR INSERT
  WITH CHECK (auth.uid() = bruger_id);

CREATE POLICY "Brugere kan opdatere egne ejendomme"
  ON public.portefolje_ejendomme FOR UPDATE
  USING (auth.uid() = bruger_id);

CREATE POLICY "Brugere kan slette egne ejendomme"
  ON public.portefolje_ejendomme FOR DELETE
  USING (auth.uid() = bruger_id);

-- boligrejse_planer
ALTER TABLE public.boligrejse_planer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan se egne planer"
  ON public.boligrejse_planer FOR ALL
  USING (auth.uid() = bruger_id)
  WITH CHECK (auth.uid() = bruger_id);

-- markedsradar_opsaetninger
ALTER TABLE public.markedsradar_opsaetninger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan se egne opsætninger"
  ON public.markedsradar_opsaetninger FOR ALL
  USING (auth.uid() = bruger_id)
  WITH CHECK (auth.uid() = bruger_id);

-- markedsradar_haendelser
ALTER TABLE public.markedsradar_haendelser ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan se egne hændelser"
  ON public.markedsradar_haendelser FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.markedsradar_opsaetninger o
      WHERE o.id = radar_id AND o.bruger_id = auth.uid()
    )
  );

-- sammenligninger
ALTER TABLE public.sammenligninger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brugere kan se egne sammenligninger"
  ON public.sammenligninger FOR ALL
  USING (auth.uid() = bruger_id)
  WITH CHECK (auth.uid() = bruger_id);

-- dst_cache: læsbar for alle autentificerede brugere, skrives kun af service role
ALTER TABLE public.dst_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autentificerede brugere kan læse cache"
  ON public.dst_cache FOR SELECT
  TO authenticated
  USING (true);
