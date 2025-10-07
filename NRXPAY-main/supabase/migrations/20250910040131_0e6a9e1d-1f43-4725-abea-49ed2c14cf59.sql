-- Ensure user_number is auto-assigned and backfilled
-- 1) Create triggers on user_data to assign a 6-digit user_number when NULL
CREATE TRIGGER IF NOT EXISTS set_user_number_before_insert
BEFORE INSERT ON public.user_data
FOR EACH ROW
EXECUTE FUNCTION public.assign_user_number();

CREATE TRIGGER IF NOT EXISTS set_user_number_before_update
BEFORE UPDATE ON public.user_data
FOR EACH ROW
EXECUTE FUNCTION public.assign_user_number();

-- 2) Backfill existing rows missing user_number
UPDATE public.user_data
SET user_number = public.generate_user_number()
WHERE user_number IS NULL;

-- 3) Fix search_path on handle_new_user function (no triggers added on auth schema)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_data (user_id, username, mobile_number, user_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'mobile_number',
    (SELECT generate_user_number())
  );
  RETURN NEW;
END;
$$;