/*
  # Fix user_profile id column type

  1. Changes
    - Ensure user_profile.id column is UUID type
    - Drop and recreate the table if necessary to fix type mismatch
    - Preserve foreign key relationships

  2. Security
    - Maintain existing RLS policies
    - Preserve all existing constraints and relationships
*/

-- Drop existing foreign key constraints temporarily
ALTER TABLE company DROP CONSTRAINT IF EXISTS fk_company_creator;

-- Drop existing table if it has wrong column type
DROP TABLE IF EXISTS user_profile CASCADE;

-- Recreate user_profile table with correct UUID type
CREATE TABLE user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  company_id uuid REFERENCES company(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Re-add foreign key from company to user_profile
ALTER TABLE company
ADD CONSTRAINT fk_company_creator
FOREIGN KEY (creator) REFERENCES user_profile(id);

-- Enable RLS
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Recreate policies for user_profile table
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
  USING (auth.uid() = id);

-- Recreate trigger for updated_at
CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();