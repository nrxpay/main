-- Create crypto rates table
CREATE TABLE IF NOT EXISTS public.crypto_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_type text NOT NULL, -- 'bitcoin', 'ethereum', 'solana', 'litecoin'
  crypto_symbol text NOT NULL, -- 'BTC', 'ETH', 'SOL', 'LTC'
  rate_inr numeric NOT NULL DEFAULT 0.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(crypto_type)
);

-- Create crypto transactions table
CREATE TABLE IF NOT EXISTS public.crypto_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  username text,
  crypto_type text NOT NULL,
  crypto_symbol text NOT NULL,
  quantity numeric NOT NULL,
  rate_inr numeric NOT NULL,
  total_inr numeric NOT NULL,
  transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.crypto_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for crypto_rates
CREATE POLICY "Anyone can view active crypto rates"
ON public.crypto_rates
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage crypto rates"
ON public.crypto_rates
FOR ALL
USING (is_admin(auth.uid()));

-- Policies for crypto_transactions
CREATE POLICY "Users can view their own crypto transactions"
ON public.crypto_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto transactions"
ON public.crypto_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all crypto transactions"
ON public.crypto_transactions
FOR ALL
USING (is_admin(auth.uid()));

-- Insert default crypto rates
INSERT INTO public.crypto_rates (crypto_type, crypto_symbol, rate_inr) VALUES
  ('bitcoin', 'BTC', 7500000.00),
  ('ethereum', 'ETH', 250000.00),
  ('solana', 'SOL', 15000.00),
  ('litecoin', 'LTC', 8000.00);

-- Trigger for updated_at
CREATE TRIGGER update_crypto_rates_updated_at
BEFORE UPDATE ON public.crypto_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_transactions_updated_at
BEFORE UPDATE ON public.crypto_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();