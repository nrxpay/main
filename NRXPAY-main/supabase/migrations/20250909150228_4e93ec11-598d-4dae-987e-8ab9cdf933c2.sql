-- Create table for minimum recharge configuration
CREATE TABLE public.minimum_recharge_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_type TEXT NOT NULL UNIQUE CHECK (account_type IN ('savings', 'current', 'corporate')),
  minimum_amount NUMERIC NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.minimum_recharge_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage minimum recharge config" 
ON public.minimum_recharge_config 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view minimum recharge config" 
ON public.minimum_recharge_config 
FOR SELECT 
USING (is_active = true);

-- Insert default minimum recharge amounts
INSERT INTO public.minimum_recharge_config (account_type, minimum_amount, currency, created_by) VALUES
('savings', 200.00, 'USD', '00000000-0000-0000-0000-000000000000'),
('current', 500.00, 'USD', '00000000-0000-0000-0000-000000000000'),
('corporate', 2000.00, 'USD', '00000000-0000-0000-0000-000000000000');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_minimum_recharge_config_updated_at
BEFORE UPDATE ON public.minimum_recharge_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();