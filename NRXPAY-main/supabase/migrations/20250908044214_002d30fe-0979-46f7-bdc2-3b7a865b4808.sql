-- Add missing admin policies for user management operations

-- Allow admins to delete from user_data table
CREATE POLICY "Admins can delete user data" 
ON public.user_data 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Allow admins to delete from user_balances table  
CREATE POLICY "Admins can delete user balances"
ON public.user_balances
FOR DELETE
USING (is_admin(auth.uid()));

-- Allow admins to delete from user_roles table
CREATE POLICY "Admins can delete user roles"
ON public.user_roles  
FOR DELETE
USING (is_admin(auth.uid()));

-- Allow admins to delete from pins table
CREATE POLICY "Admins can delete user pins"
ON public.pins
FOR DELETE  
USING (is_admin(auth.uid()));

-- Allow admins to manage team_stats
CREATE POLICY "Admins can delete team stats"
ON public.team_stats
FOR DELETE
USING (is_admin(auth.uid()));

-- Allow admins to manage all operations on user_data
CREATE POLICY "Admins can manage all user data"
ON public.user_data
FOR ALL
USING (is_admin(auth.uid()));

-- Allow admins to manage all operations on user_balances  
CREATE POLICY "Admins can manage all user balances"
ON public.user_balances
FOR ALL
USING (is_admin(auth.uid()));