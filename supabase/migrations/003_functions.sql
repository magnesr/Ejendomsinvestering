-- Boligpulsen — Database-funktioner
-- Migration 003: Auth-trigger og freemium-logik

-- Opret profil automatisk ved ny bruger
CREATE OR REPLACE FUNCTION public.handle_ny_bruger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ny_bruger();

-- Opdater opdateret_den automatisk
CREATE OR REPLACE FUNCTION public.set_opdateret_den()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.opdateret_den = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_opdateret_den
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_opdateret_den();

CREATE OR REPLACE TRIGGER boligrejse_opdateret_den
  BEFORE UPDATE ON public.boligrejse_planer
  FOR EACH ROW
  EXECUTE FUNCTION public.set_opdateret_den();

-- Freemium-tæller: Tjek og registrer analyse-tilladelse
-- Returnerer true hvis brugeren må lave en analyse, false hvis grænsen er nået
CREATE OR REPLACE FUNCTION public.tjek_og_opret_vurdering_tilladelse(p_bruger_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_profil public.profiles%ROWTYPE;
BEGIN
  -- Hent profil med lås for at undgå race conditions
  SELECT * INTO v_profil
  FROM public.profiles
  WHERE id = p_bruger_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Nulstil månedstæller hvis nyt kalendermåned
  IF v_profil.gratis_analyser_nulstillet_dato < date_trunc('month', CURRENT_DATE)::date THEN
    UPDATE public.profiles
    SET
      gratis_analyser_brugt = 0,
      gratis_analyser_nulstillet_dato = CURRENT_DATE
    WHERE id = p_bruger_id;
    v_profil.gratis_analyser_brugt := 0;
  END IF;

  -- Abonnenter har ubegrænset adgang
  IF v_profil.abonnement_type IN ('boligkoeber', 'investor')
     AND v_profil.abonnement_status = 'aktiv' THEN
    RETURN true;
  END IF;

  -- Freemium: maks 3 analyser per måned
  IF v_profil.gratis_analyser_brugt < 3 THEN
    UPDATE public.profiles
    SET gratis_analyser_brugt = gratis_analyser_brugt + 1
    WHERE id = p_bruger_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Hjælpefunktion: Hent brugerens abonnementsniveau
CREATE OR REPLACE FUNCTION public.hent_abonnement(p_bruger_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT abonnement_type
  FROM public.profiles
  WHERE id = p_bruger_id;
$$;
