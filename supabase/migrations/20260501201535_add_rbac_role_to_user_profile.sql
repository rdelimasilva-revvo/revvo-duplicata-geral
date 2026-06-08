/*
  # Add RBAC role to user_profile

  1. Changes
    - Add `role` column to `public.user_profile` with allowed values:
      `super_admin` (level 1), `admin` (level 2), `user` (level 3).
    - Default to `user` so existing rows stay safe.

  2. Security
    - Keeps existing RLS policies on `user_profile` intact.
    - Role is authorization metadata consumed by the frontend; backend RLS
      continues to rely on `auth.uid()` / company membership checks.

  3. Notes
    - Using a CHECK constraint instead of an enum so we can extend values
      later without migration churn.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profile'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.user_profile
      ADD COLUMN role text NOT NULL DEFAULT 'user';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profile_role_check'
  ) THEN
    ALTER TABLE public.user_profile
      ADD CONSTRAINT user_profile_role_check
      CHECK (role IN ('super_admin', 'admin', 'user'));
  END IF;
END $$;
