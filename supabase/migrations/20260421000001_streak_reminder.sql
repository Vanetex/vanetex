-- Returns users who have an active streak (last decision was yesterday or earlier today)
-- but have NOT completed today's challenge. Used by the nightly cron email.
--
-- "Active streak" = at least one decision exists AND the most recent decision date
-- is within the past 2 days (to catch different timezones), but today's challenge
-- is not yet done.

CREATE OR REPLACE FUNCTION get_streak_reminder_targets()
RETURNS TABLE (
  user_id   uuid,
  email     text,
  display_name text,
  streak_days integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH latest AS (
    SELECT
      d.user_id,
      MAX(d.created_at)::date AS last_date,
      COUNT(*)                AS total
    FROM decisions d
    GROUP BY d.user_id
  ),
  today_done AS (
    SELECT DISTINCT user_id
    FROM decisions
    WHERE created_at::date = CURRENT_DATE
  ),
  streak AS (
    SELECT
      l.user_id,
      l.last_date,
      -- Approximate streak = consecutive days up to yesterday
      (
        SELECT COUNT(DISTINCT created_at::date)
        FROM decisions d2
        WHERE d2.user_id = l.user_id
          AND d2.created_at::date >= CURRENT_DATE - INTERVAL '60 days'
      )::integer AS streak_days
    FROM latest l
    WHERE l.last_date >= CURRENT_DATE - INTERVAL '1 day'   -- active in last 24h+
      AND l.user_id NOT IN (SELECT user_id FROM today_done) -- not done today
      AND l.total >= 2                                       -- at least 2 decisions (real streak)
  )
  SELECT
    s.user_id,
    au.email,
    COALESCE(p.display_name, split_part(au.email, '@', 1)) AS display_name,
    s.streak_days
  FROM streak s
  JOIN auth.users au ON au.id = s.user_id
  LEFT JOIN profiles p ON p.id = s.user_id
  WHERE au.email IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION get_streak_reminder_targets() TO service_role;
