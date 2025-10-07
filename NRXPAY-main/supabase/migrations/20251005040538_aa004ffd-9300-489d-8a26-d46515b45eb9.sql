-- Create spin wheel configuration table
CREATE TABLE IF NOT EXISTS public.spin_wheel_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '🎊 Festival Recharge Bonus Spin! 🎊',
  body_text text NOT NULL DEFAULT 'Spin the wheel to win amazing recharge bonuses!',
  percentages integer[] NOT NULL DEFAULT ARRAY[20, 5, 10, 1, 15, 30, 25, 40],
  colors text[] NOT NULL DEFAULT ARRAY[
    'from-yellow-400 to-yellow-600',
    'from-pink-400 to-pink-600',
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-orange-400 to-orange-600'
  ],
  fixed_winning_percentage integer NOT NULL DEFAULT 20,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spin_wheel_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active spin wheel config"
ON public.spin_wheel_config
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage spin wheel config"
ON public.spin_wheel_config
FOR ALL
USING (is_admin(auth.uid()));

-- Insert default configuration
INSERT INTO public.spin_wheel_config (
  title,
  body_text,
  percentages,
  fixed_winning_percentage
) VALUES (
  '🎊 Festival Recharge Bonus Spin! 🎊',
  'Spin the wheel to win amazing recharge bonuses! One spin per user.',
  ARRAY[20, 5, 10, 1, 15, 30, 25, 40],
  20
);

-- Trigger for updated_at
CREATE TRIGGER update_spin_wheel_config_updated_at
BEFORE UPDATE ON public.spin_wheel_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();