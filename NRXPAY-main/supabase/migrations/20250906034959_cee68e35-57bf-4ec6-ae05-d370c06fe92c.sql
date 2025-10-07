-- Clean up duplicate records first (keep the most recent one for each user)
WITH duplicates AS (
  SELECT user_id, 
         array_agg(id ORDER BY updated_at DESC) as ids
  FROM public.user_balances 
  GROUP BY user_id 
  HAVING count(*) > 1
)
DELETE FROM public.user_balances 
WHERE id IN (
  SELECT unnest(ids[2:]) 
  FROM duplicates
);

-- Now add the unique constraint
ALTER TABLE public.user_balances 
ADD CONSTRAINT user_balances_user_id_unique UNIQUE (user_id);