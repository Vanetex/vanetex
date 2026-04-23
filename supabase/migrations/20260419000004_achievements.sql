-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id         TEXT        NOT NULL,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own achievements select" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own achievements insert" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
