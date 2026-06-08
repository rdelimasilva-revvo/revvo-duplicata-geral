/*
  # Allow users to read their own profile

  1. Problem
    - The existing SELECT policy on `user_profile` requires `company_id` to
      match the caller's company. Users who just signed up have NULL
      `company_id`, so they can't read back their own row — including the
      role column needed for RBAC bootstrapping.

  2. Fix
    - Add an additional SELECT policy that lets an authenticated user read
      the row where `id = auth.uid()`.

  3. Security
    - Strictly scoped by `auth.uid()`; no cross-user data exposure.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profile'
      AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON public.user_profile
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;
