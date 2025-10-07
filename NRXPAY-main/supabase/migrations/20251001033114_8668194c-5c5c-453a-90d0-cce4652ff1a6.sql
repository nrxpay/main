-- Create fund_rates table for gaming and stock fund rates
CREATE TABLE public.fund_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_type TEXT NOT NULL UNIQUE,
  rate NUMERIC NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fund_rates ENABLE ROW LEVEL SECURITY;

-- Create policies for fund_rates
CREATE POLICY "Users can view active fund rates" 
ON public.fund_rates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage fund rates" 
ON public.fund_rates 
FOR ALL 
USING (is_admin(auth.uid()));

-- Insert default fund rates
INSERT INTO public.fund_rates (fund_type, rate) VALUES
('gaming', 106),
('stock', 115);

-- Add fund_type column to withdrawals table
ALTER TABLE public.withdrawals 
ADD COLUMN IF NOT EXISTS fund_type TEXT DEFAULT 'gaming',
ADD COLUMN IF NOT EXISTS fund_rate NUMERIC;