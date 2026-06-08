/*
  # Fix infinite recursion in user_profile RLS policy

  1. Problem
    - The SELECT policy on `user_profile` references itself via a subquery,
      causing infinite recursion (PostgreSQL error 42P17)
    - This blocks all reads from `user_profile`, breaking auth initialization

  2. Solution
    - Create a SECURITY DEFINER function that reads the current user's company_id
      bypassing RLS (breaking the recursion)
    - Replace the recursive SELECT policy with one that uses this function

  3. Security
    - The function is owned by postgres and runs with elevated privileges,
      but only returns a single UUID value for the authenticated user
    - The policy still restricts rows to the user's own company
*/

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM user_profile WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Users can view profiles in their company" ON user_profile;

CREATE POLICY "Users can view profiles in their company"
  ON user_profile
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());
