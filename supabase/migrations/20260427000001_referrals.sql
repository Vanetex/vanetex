-- Add referral tracking to profiles.
-- referral_code: unique 8-char code auto-generated on insert.
-- referred_by:   the user who invited this user (set once, never overwritten).
-- referral_count: how many users this person has successfully referred.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code  text    UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by    uuid    REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0;

-- Trigger function: generate a unique referral code on profile creation.
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.referral_code := upper(substring(md5(NEW.id::text || gen_random_uuid()::text), 1, 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_referral_code();

-- Back-fill existing profiles that have no code yet.
UPDATE public.profiles
SET referral_code = upper(substring(md5(id::text || gen_random_uuid()::text), 1, 8))
WHERE referral_code IS NULL;
