-- Fix security warnings by setting search_path on functions
CREATE OR REPLACE FUNCTION generate_user_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    number_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 6-digit number
        new_number := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
        
        -- Check if this number already exists
        SELECT EXISTS(SELECT 1 FROM public.user_data WHERE user_number = new_number) INTO number_exists;
        
        -- If it doesn't exist, we can use it
        IF NOT number_exists THEN
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$;

-- Fix assign_user_number function
CREATE OR REPLACE FUNCTION public.assign_user_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only assign if user_number is not already set
    IF NEW.user_number IS NULL THEN
        NEW.user_number := generate_user_number();
    END IF;
    RETURN NEW;
END;
$$;