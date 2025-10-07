-- Create table for user task management
CREATE TABLE public.user_task_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_name TEXT NOT NULL,
  task_description TEXT,
  bonus_amount NUMERIC NOT NULL DEFAULT 0.00,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_bonus_active BOOLEAN NOT NULL DEFAULT false,
  bonus_credited BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  bonus_credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_task_management ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage all user tasks"
ON public.user_task_management
FOR ALL
USING (is_admin(auth.uid()));

-- Create policy for users to view their own tasks
CREATE POLICY "Users can view their own tasks"
ON public.user_task_management
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_task_management_updated_at
BEFORE UPDATE ON public.user_task_management
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();