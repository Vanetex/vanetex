-- Onboarding completion flag
-- Existing users get true (skip onboarding), new users get false (go through it)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT true;
UPDATE profiles SET onboarding_completed = true WHERE onboarding_completed IS NULL;
ALTER TABLE profiles ALTER COLUMN onboarding_completed SET DEFAULT false;
