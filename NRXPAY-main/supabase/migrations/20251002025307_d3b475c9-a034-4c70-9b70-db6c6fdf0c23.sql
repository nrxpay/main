-- Add user_id column to minimum_withdrawal_config for user-specific limits
ALTER TABLE public.minimum_withdrawal_config
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update policies to handle user-specific limits
DROP POLICY IF EXISTS "Users can view minimum withdrawal config" ON public.minimum_withdrawal_config;
DROP POLICY IF EXISTS "Admins can manage minimum withdrawal config" ON public.minimum_withdrawal_config;

CREATE POLICY "Users can view their minimum withdrawal config"
ON public.minimum_withdrawal_config
FOR SELECT
USING (is_active = true AND (user_id IS NULL OR user_id = auth.uid()));

CREATE POLICY "Admins can manage minimum withdrawal config"
ON public.minimum_withdrawal_config
FOR ALL
USING (is_admin(auth.uid()));