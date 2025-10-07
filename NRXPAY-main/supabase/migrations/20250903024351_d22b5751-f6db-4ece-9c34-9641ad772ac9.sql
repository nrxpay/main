-- Grant admin access to the most recent user
INSERT INTO public.user_roles (user_id, role)
VALUES ('ac0a76cf-9769-45a4-acaa-d3a83d917436', 'admin'::user_role)
ON CONFLICT (user_id, role) DO NOTHING;