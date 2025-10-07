-- Create table to track user account locks
CREATE TABLE public.user_account_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  savings_locked BOOLEAN NOT NULL DEFAULT true,
  current_locked BOOLEAN NOT NULL DEFAULT true,
  corporate_locked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_account_locks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own locks" 
ON public.user_account_locks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user locks" 
ON public.user_account_locks 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_account_locks_updated_at
BEFORE UPDATE ON public.user_account_locks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();