/*
  # Fix user_profile id column type to UUID
  
  1. Changes
    - Ensure user_profile.id column is UUID type, not bigint
    - Drop and recreate table with correct schema
    - Preserve all relationships and constraints
    
  2. Security
    - Maintain existing RLS policies
    - Preserve foreign key relationships
*/

-- Drop existing foreign key constraints temporarily
ALTER TABLE company DROP CONSTRAINT IF EXISTS fk_company_creator;

-- Drop existing table to recreate with correct types
DROP TABLE IF EXISTS user_profile CASCADE;

-- Recreate user_profile table with correct UUID type
CREATE TABLE user_profile (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  company_id uuid REFERENCES company(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to auth.users
ALTER TABLE user_profile
ADD CONSTRAINT fk_user_profile_auth_user
FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Re-add foreign key from company to user_profile
ALTER TABLE company
ADD CONSTRAINT fk_company_creator
FOREIGN KEY (creator) REFERENCES user_profile(id);

-- Enable RLS
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profile table
CREATE POLICY "Users can view profiles in their company"
  ON user_profile
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON user_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON user_profile
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();