-- Cache current portfolio value on paper_portfolios so the trading
-- leaderboard can be queried without hitting Finnhub for every user.
ALTER TABLE paper_portfolios
  ADD COLUMN IF NOT EXISTS portfolio_value numeric,
  ADD COLUMN IF NOT EXISTS value_updated_at timestamptz;

-- ---------------------------------------------------------------------------
-- Challenge leaderboard
-- Returns up to 25 rows ordered by avg reasoning score.
-- Exposes: avg score, total decisions, accuracy %, current-user flag.
-- SECURITY DEFINER so it can read across all users despite RLS.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_challenge_leaderboard()
RETURNS TABLE(
  rank        bigint,
  display_name text,
  avg_score   numeric,
  total_decisions bigint,
  accuracy_pct numeric,
  is_current_user boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY ROUND(AVG(d.reasoning_score), 1) DESC) AS rank,
    p.display_name,
    ROUND(AVG(d.reasoning_score), 1)                                   AS avg_score,
    COUNT(d.id)                                                        AS total_decisions,
    ROUND(
      100.0
      * COUNT(CASE WHEN d.outcome_verdict = 'CORRECT' THEN 1 END)
      / NULLIF(COUNT(CASE WHEN d.outcome_verdict IS NOT NULL THEN 1 END), 0),
      0
    )                                                                  AS accuracy_pct,
    (p.id = (SELECT auth.uid()))                                       AS is_current_user
  FROM decisions d
  JOIN profiles p ON p.id = d.user_id
  WHERE d.reasoning_score IS NOT NULL
  GROUP BY p.id, p.display_name
  HAVING COUNT(d.id) >= 1
  ORDER BY avg_score DESC
  LIMIT 25;
$$;

GRANT EXECUTE ON FUNCTION public.get_challenge_leaderboard() TO authenticated;

-- ---------------------------------------------------------------------------
-- Trading leaderboard
-- Returns up to 25 rows ordered by cached portfolio value (descending).
-- Only users who have visited the Trade page (triggering the chart API which
-- writes portfolio_value) will appear here.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_trading_leaderboard()
RETURNS TABLE(
  rank           bigint,
  display_name   text,
  portfolio_value numeric,
  return_pct     numeric,
  is_current_user boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY pp.portfolio_value DESC NULLS LAST) AS rank,
    p.display_name,
    pp.portfolio_value,
    ROUND(((pp.portfolio_value - 10000) / 10000.0) * 100, 2)       AS return_pct,
    (p.id = (SELECT auth.uid()))                                    AS is_current_user
  FROM paper_portfolios pp
  JOIN profiles p ON p.id = pp.user_id
  WHERE pp.portfolio_value IS NOT NULL
  ORDER BY pp.portfolio_value DESC
  LIMIT 25;
$$;

GRANT EXECUTE ON FUNCTION public.get_trading_leaderboard() TO authenticated;
