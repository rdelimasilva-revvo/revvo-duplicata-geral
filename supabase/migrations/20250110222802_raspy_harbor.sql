/*
  # Create company and user_profile tables

  1. New Tables
    - `company`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `doc_num` (text, not null, unique)
      - `creator` (uuid, references user_profile)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `user_profile`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null, unique)
      - `company_id` (uuid, references company)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create company table
CREATE TABLE IF NOT EXISTS company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  doc_num text NOT NULL UNIQUE,
  creator uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  company_id uuid REFERENCES company(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key from company to user_profile
ALTER TABLE company
ADD CONSTRAINT fk_company_creator
FOREIGN KEY (creator) REFERENCES user_profile(id);

-- Enable RLS
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for company table
CREATE POLICY "Users can view their company"
  ON company
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can insert company if authenticated"
  ON company
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_company_updated_at
  BEFORE UPDATE ON company
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();