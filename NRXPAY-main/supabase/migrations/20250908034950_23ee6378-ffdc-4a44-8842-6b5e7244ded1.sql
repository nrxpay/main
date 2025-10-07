-- Update RLS policies to allow admins to view all user data

-- Update user_data policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.user_data;
CREATE POLICY "Users can view their own data or admins can view all" 
ON public.user_data 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Update user_balances policies  
DROP POLICY IF EXISTS "Users can view their own balance" ON public.user_balances;
CREATE POLICY "Users can view their own balance or admins can view all" 
ON public.user_balances 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Update user_roles policies (this one might already allow admins)
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role or admins can view all" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Also allow admins to update user balances
CREATE POLICY "Admins can update user balances" 
ON public.user_balances 
FOR UPDATE 
USING (is_admin(auth.uid()));