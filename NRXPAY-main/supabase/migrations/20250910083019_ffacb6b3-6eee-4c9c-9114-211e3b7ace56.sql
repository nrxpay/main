-- Fix the handle_new_user function to use correct search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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