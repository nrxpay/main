-- First add a unique constraint to prevent duplicate user-role combinations
ALTER TABLE public.user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);

-- Grant admin access to the most recent user (team@gmail.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('ac0a76cf-9769-45a4-acaa-d3a83d917436', 'admin'::user_role);