-- Friendships between users.
-- One row per directed request; unique constraint prevents duplicates.
-- Status: 'pending' (requester waiting) → 'accepted' (both are friends).

CREATE TABLE IF NOT EXISTS public.friendships (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_status_check CHECK (status IN ('pending', 'accepted')),
  CONSTRAINT friendships_no_self      CHECK (requester_id != addressee_id),
  CONSTRAINT friendships_unique       UNIQUE (requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Both parties can see their own friendships
CREATE POLICY "view_own_friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Only the requester can insert (and only as requester)
CREATE POLICY "send_friend_request" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Only the addressee can accept (update)
CREATE POLICY "accept_friend_request" ON public.friendships
  FOR UPDATE USING (auth.uid() = addressee_id);

-- Either party can remove/decline
CREATE POLICY "remove_friendship" ON public.friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
