-- Add unique constraint to prevent duplicate balance records per user
ALTER TABLE public.user_balances 
ADD CONSTRAINT user_balances_user_id_unique UNIQUE (user_id);

-- Clean up any existing duplicate records (keep the most recent one)
DELETE FROM public.user_balances a
USING public.user_balances b
WHERE a.user_id = b.user_id 
AND a.created_at < b.created_at;