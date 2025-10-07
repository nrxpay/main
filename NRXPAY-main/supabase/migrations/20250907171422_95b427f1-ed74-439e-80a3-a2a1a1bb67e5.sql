-- Create team_stats table for managing user team data
CREATE TABLE public.team_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_members INTEGER NOT NULL DEFAULT 0,
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  direct_referrals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for team_stats
CREATE POLICY "Users can view their own team stats" 
ON public.team_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own team stats" 
ON public.team_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team stats" 
ON public.team_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on team_stats
CREATE TRIGGER update_team_stats_updated_at
BEFORE UPDATE ON public.team_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize team stats for new users
CREATE OR REPLACE FUNCTION public.create_team_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.team_stats (user_id, team_members, total_earned, direct_referrals)
  VALUES (NEW.id, 0, 0.00, 0);
  RETURN NEW;
END;
$$;

-- Create trigger to initialize team stats when user signs up
CREATE TRIGGER on_auth_user_created_team_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_team_stats();