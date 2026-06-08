/*
  # Move SECURITY DEFINER helper out of PostgREST-exposed schema

  1. Problem
    - `public.get_my_company_id()` is referenced by an RLS policy on
      `public.user_profile`, so the `authenticated` role must retain EXECUTE on it.
      But keeping it in `public` exposes it as a PostgREST RPC endpoint.

  2. Solution
    - Create a `private_helpers` schema that is NOT exposed by PostgREST.
    - Recreate `get_my_company_id` there, update the policy to reference the new
      location, then drop the public version.

  3. Notes
    - Only `authenticated` gets EXECUTE on the private function and USAGE on the
      schema. `anon` has no access.
*/

CREATE SCHEMA IF NOT EXISTS private_helpers;

REVOKE ALL ON SCHEMA private_helpers FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private_helpers TO authenticated;

CREATE OR REPLACE FUNCTION private_helpers.get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.user_profile WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION private_helpers.get_my_company_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private_helpers.get_my_company_id() TO authenticated;

-- Update policy to use the private-schema version
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.user_profile;

CREATE POLICY "Users can view profiles in their company"
  ON public.user_profile
  FOR SELECT
  TO authenticated
  USING (company_id = private_helpers.get_my_company_id());

-- Remove the public-schema function (no longer referenced)
DROP FUNCTION IF EXISTS public.get_my_company_id();
