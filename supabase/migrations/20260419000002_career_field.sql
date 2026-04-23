-- Career field preference on user profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_field TEXT;
