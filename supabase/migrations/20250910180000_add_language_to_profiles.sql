-- Add language column to profiles table
ALTER TABLE public.profiles
ADD COLUMN language TEXT DEFAULT 'PL';

-- Update the handle_new_user function to include language
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, tone_of_voice, target_audience, brand_description, language)
  VALUES (
    NEW.id,
    'default',
    'default', 
    'default',
    'PL'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

