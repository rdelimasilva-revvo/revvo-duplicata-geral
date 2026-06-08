/*
  # Update RLS Policies for Demo Access

  1. Changes
    - Allow public read access to rule_type
    - Allow public access to rules for demo purposes
    
  2. Security
    - This is for demonstration purposes
    - In production, these policies should be restricted to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read rule types" ON rule_type;
DROP POLICY IF EXISTS "Users can read their company rules" ON rules;
DROP POLICY IF EXISTS "Users can insert rules for their company" ON rules;
DROP POLICY IF EXISTS "Users can update their company rules" ON rules;
DROP POLICY IF EXISTS "Users can delete their company rules" ON rules;

-- Allow public read access to rule_type
CREATE POLICY "Public can read rule types"
  ON rule_type FOR SELECT
  USING (true);

-- Allow public access to rules for demo
CREATE POLICY "Public can read rules"
  ON rules FOR SELECT
  USING (true);

CREATE POLICY "Public can insert rules"
  ON rules FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update rules"
  ON rules FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete rules"
  ON rules FOR DELETE
  USING (true);