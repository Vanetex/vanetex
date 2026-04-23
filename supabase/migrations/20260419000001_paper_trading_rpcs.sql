-- Atomic cash deduction for BUY trades (prevents race conditions)
CREATE OR REPLACE FUNCTION deduct_paper_cash(p_user_id uuid, p_amount numeric)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE paper_portfolios
  SET cash = cash - p_amount
  WHERE user_id = p_user_id AND cash >= p_amount;
  RETURN FOUND;
END;
$$;

-- Cash return for SELL trades
CREATE OR REPLACE FUNCTION add_paper_cash(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE paper_portfolios SET cash = cash + p_amount WHERE user_id = p_user_id;
END;
$$;

-- Idempotency key to prevent duplicate trade submissions
ALTER TABLE paper_trades ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
