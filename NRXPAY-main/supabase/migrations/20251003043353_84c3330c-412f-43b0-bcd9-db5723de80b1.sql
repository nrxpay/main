-- Create table to track recharge bonus spins
CREATE TABLE public.recharge_bonus_spins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_percentage integer NOT NULL DEFAULT 20,
  has_spun boolean NOT NULL DEFAULT false,
  spun_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recharge_bonus_spins ENABLE ROW LEVEL SECURITY;

-- Users can view their own spin status
CREATE POLICY "Users can view their own spin status"
ON public.recharge_bonus_spins
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own spin record
CREATE POLICY "Users can insert their own spin record"
ON public.recharge_bonus_spins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own spin record
CREATE POLICY "Users can update their own spin record"
ON public.recharge_bonus_spins
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all spin records
CREATE POLICY "Admins can manage all spin records"
ON public.recharge_bonus_spins
FOR ALL
USING (is_admin(auth.uid()));