-- Fix search_path for existing functions to comply with security best practices

-- Update create_user_balance function
CREATE OR REPLACE FUNCTION public.create_user_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_balances (user_id, current_balance, usdt_balance)
  VALUES (NEW.id, 0.00, 0.00000000);
  RETURN NEW;
END;
$function$;

-- Update create_team_stats function
CREATE OR REPLACE FUNCTION public.create_team_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.team_stats (user_id, team_members, total_earned, direct_referrals)
  VALUES (NEW.id, 0, 0.00, 0);
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function (already has search_path but confirming)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_data (user_id, username, mobile_number, user_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'mobile_number',
    generate_user_number()
  );
  RETURN NEW;
END;
$function$;