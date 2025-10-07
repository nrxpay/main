-- Drop the previous task management table
DROP TABLE IF EXISTS public.user_task_management;

-- Create predefined tasks table
CREATE TABLE public.bonus_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name TEXT NOT NULL UNIQUE,
  task_description TEXT,
  reward_amount NUMERIC NOT NULL DEFAULT 0.00,
  task_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 5 predefined tasks
INSERT INTO public.bonus_tasks (task_name, task_description, reward_amount, task_order) VALUES
('Complete Profile Setup', 'Complete your profile setup to get started', 5.00, 1),
('First Recharge of $100', 'Make your first recharge of $100 or more', 10.00, 2),
('Invite 5 Friends', 'Invite 5 friends to join and earn bonus', 25.00, 3),
('Recharge first $500', 'Complete your first $500 recharge milestone', 35.00, 4),
('2000$ traded in one month', 'Trade $2000 worth in a single month', 50.00, 5);

-- Create user task completions table
CREATE TABLE public.user_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.bonus_tasks(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_bonus_active BOOLEAN NOT NULL DEFAULT false,
  bonus_credited BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  bonus_credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable Row Level Security
ALTER TABLE public.bonus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for bonus_tasks (read-only for users, full access for admins)
CREATE POLICY "Anyone can view bonus tasks"
ON public.bonus_tasks
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage bonus tasks"
ON public.bonus_tasks
FOR ALL
USING (is_admin(auth.uid()));

-- Create policies for user_task_completions
CREATE POLICY "Admins can manage all user task completions"
ON public.user_task_completions
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own task completions"
ON public.user_task_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_task_completions_updated_at
BEFORE UPDATE ON public.user_task_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();