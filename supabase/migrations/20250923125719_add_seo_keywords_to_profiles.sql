-- Add seo_keywords column to profiles table
ALTER TABLE profiles 
ADD COLUMN seo_keywords TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN profiles.seo_keywords IS 'Słowa kluczowe SEO dla marki użytkownika, oddzielone przecinkami';

