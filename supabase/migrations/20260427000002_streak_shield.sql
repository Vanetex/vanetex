-- streak_shield: 0 or 1 (can only hold one at a time)
-- shield_last_earned_at: tracks the 1-per-week limit
alter table profiles
  add column if not exists streak_shield int not null default 0,
  add column if not exists shield_last_earned_at timestamptz;
