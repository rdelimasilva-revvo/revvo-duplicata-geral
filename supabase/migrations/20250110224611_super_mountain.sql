/*
  # Update company creator policy
  
  1. Changes
    - Add policy to allow updating creator field on company table
    - This ensures authenticated users can set the creator during signup
*/

-- Add policy for updating company creator
CREATE POLICY "Users can update company creator"
  ON company
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE auth.uid() = id
    )
  );