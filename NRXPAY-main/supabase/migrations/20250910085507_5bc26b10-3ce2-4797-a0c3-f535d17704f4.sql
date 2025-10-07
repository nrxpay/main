-- Create separate tables for weekly and daily rankings
CREATE TABLE public.weekly_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT,
  total_volume NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  rank_score NUMERIC DEFAULT 0,
  current_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.daily_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT,
  total_volume NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  rank_score NUMERIC DEFAULT 0,
  current_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rankings ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly_rankings
CREATE POLICY "Admins can manage weekly rankings"
ON public.weekly_rankings
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view weekly rankings"
ON public.weekly_rankings
FOR SELECT
USING (true);

-- Create policies for daily_rankings
CREATE POLICY "Admins can manage daily rankings"
ON public.daily_rankings
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view daily rankings"
ON public.daily_rankings
FOR SELECT
USING (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_weekly_rankings_updated_at
BEFORE UPDATE ON public.weekly_rankings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_rankings_updated_at
BEFORE UPDATE ON public.daily_rankings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();