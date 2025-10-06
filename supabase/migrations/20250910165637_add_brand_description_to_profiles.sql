-- Add brand_description field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN brand_description TEXT;

-- Update the handle_new_user function to include brand_description
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, tone_of_voice, target_audience, brand_description)
  VALUES (NEW.id, '', '', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

