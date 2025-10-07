-- Add user_number column to user_data table
ALTER TABLE public.user_data 
ADD COLUMN user_number TEXT UNIQUE;

-- Create a function to generate 6-digit user numbers
CREATE OR REPLACE FUNCTION generate_user_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Update existing users with 6-digit user numbers
UPDATE public.user_data 
SET user_number = generate_user_number() 
WHERE user_number IS NULL;

-- Make user_number NOT NULL now that all users have one
ALTER TABLE public.user_data 
ALTER COLUMN user_number SET NOT NULL;

-- Create trigger to automatically assign user_number to new users
CREATE OR REPLACE FUNCTION public.assign_user_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign if user_number is not already set
    IF NEW.user_number IS NULL THEN
        NEW.user_number := generate_user_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registrations
CREATE TRIGGER assign_user_number_trigger
    BEFORE INSERT ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_user_number();

-- Update the handle_new_user function to include user_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
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