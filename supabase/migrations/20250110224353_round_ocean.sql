/*
  # Add company settings table
  
  1. New Tables
    - `company_settings`
      - `id` (uuid, primary key)
      - `company_id` (uuid, references company)
      - `setup_ready` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `company_settings` table
    - Add policies for authenticated users to manage their company settings
*/

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES company(id) NOT NULL UNIQUE,
  setup_ready boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for company_settings table
CREATE POLICY "Users can view their company settings"
  ON company_settings
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE auth.uid() = id
    )
  );

CREATE POLICY "Users can insert company settings if authenticated"
  ON company_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their company settings"
  ON company_settings
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE auth.uid() = id
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();