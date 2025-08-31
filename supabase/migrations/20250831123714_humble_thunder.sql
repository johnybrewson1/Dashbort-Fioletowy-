/*
  # Update profiles table for Dream Post Forge

  1. Changes to existing profiles table
    - Add new columns for user preferences
    - Update existing columns to match Airtable structure
    - Add constraints and defaults

  2. New columns added
    - `name` (text) - User's display name
    - `subscription_plan` (text) - Free, Pro, Enterprise
    - `last_login` (timestamp) - Track user activity
    - `settings` (jsonb) - Flexible settings storage
    - `voice_for_posts` (text) - Voice settings for posts
    - `voice_for_scripts` (text) - Voice settings for scripts
    - `style` (text) - User's style preferences
    - `avatar_recipient` (text) - Target audience description

  3. Security
    - Existing RLS policies remain
    - Add new policies if needed
*/

-- Add new columns to existing profiles table
DO $$
BEGIN
  -- Add name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN name text DEFAULT 'User';
  END IF;

  -- Add subscription_plan column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise'));
  END IF;

  -- Add last_login column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login timestamptz;
  END IF;

  -- Add settings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'settings'
  ) THEN
    ALTER TABLE profiles ADD COLUMN settings jsonb DEFAULT '{}';
  END IF;

  -- Add voice_for_posts column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'voice_for_posts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN voice_for_posts text;
  END IF;

  -- Add voice_for_scripts column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'voice_for_scripts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN voice_for_scripts text;
  END IF;

  -- Add style column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'style'
  ) THEN
    ALTER TABLE profiles ADD COLUMN style text;
  END IF;

  -- Add avatar_recipient column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_recipient'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_recipient text;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS profiles_subscription_plan_idx ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS profiles_last_login_idx ON profiles(last_login DESC);

-- Create function to update last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_login = now() 
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_login on auth
CREATE OR REPLACE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_last_login();