-- Create minimum_withdrawal_config table
CREATE TABLE public.minimum_withdrawal_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minimum_amount NUMERIC NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USDT',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.minimum_withdrawal_config ENABLE ROW LEVEL SECURITY;

-- Create policies for minimum_withdrawal_config
CREATE POLICY "Users can view minimum withdrawal config"
ON public.minimum_withdrawal_config
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage minimum withdrawal config"
ON public.minimum_withdrawal_config
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_minimum_withdrawal_config_updated_at
BEFORE UPDATE ON public.minimum_withdrawal_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();