-- Add team field to user_data table and set all users' team to 0
ALTER TABLE public.user_data ADD COLUMN team INTEGER DEFAULT 0;

-- Update all existing users to have team = 0
UPDATE public.user_data SET team = 0;