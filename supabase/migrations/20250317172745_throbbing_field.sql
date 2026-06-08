/*
  # Update user_profile table schema
  
  1. Changes
    - Add constraint to ensure user_profile.id matches auth.users.id
    - Add policy to allow users to update their own profile
    - Add policy to allow users to delete their own profile
  
  2. Security
    - Maintain existing RLS policies
    - Add new policies for profile management
*/

-- Add foreign key constraint to auth.users
ALTER TABLE user_profile
ADD CONSTRAINT fk_user_profile_auth_user
FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add policy for users to delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON user_profile
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);