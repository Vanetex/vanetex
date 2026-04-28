-- Stores portfolio value at the time of the last weekly recap so we can
-- compute the week-over-week change next time the recap runs.
alter table profiles
  add column if not exists recap_portfolio_value numeric;
