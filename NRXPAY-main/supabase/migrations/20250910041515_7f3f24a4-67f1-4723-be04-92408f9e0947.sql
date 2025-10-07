-- Create trigger to assign user number to new users if not already exists
CREATE OR REPLACE TRIGGER assign_user_number_trigger
    BEFORE INSERT ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_user_number();