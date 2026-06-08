/*
  # Fix Security Issues - Comprehensive Database Hardening

  ## 1. Add Missing Foreign Key Indexes
  Foreign keys without indexes cause slow queries and poor performance.
  - Add index on `commercial_annotations.created_by`
  - Add index on `company.creator`
  - Add index on `subscriptions.company_id`
  - Add index on `user_profile.company_id`

  ## 2. Optimize RLS Policies for Performance
  Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row.
  This significantly improves query performance at scale.
  - Fix 4 policies on `user_profile` table
  - Fix 4 policies on `commercial_annotations` table

  ## 3. Remove Unused Indexes
  Indexes consume storage and slow down writes without providing value.
  - Drop `idx_commercial_annotations_bill_id`
  - Drop `idx_commercial_annotations_company_id`
  - Drop `idx_commercial_annotations_problem_type`

  ## 4. Add Missing RLS Policies
  The `subscriptions` table has RLS enabled but no INSERT/UPDATE/DELETE policies.
  - Add policy for INSERT
  - Add policy for UPDATE
  - Add policy for DELETE

  ## 5. Fix Function Security (Search Path)
  Functions with mutable search_path are vulnerable to search_path attacks.
  - Fix `update_updated_at_column`
  - Fix `update_commercial_annotations_updated_at`
  - Fix `create_user_company`

  ## 6. Fix Overly Permissive RLS Policies
  Policies with `WITH CHECK (true)` bypass security entirely.
  - Fix "Users can insert company if authenticated" on `company` table
  - Check and fix `company_settings` table if exists

  ## 7. Dashboard Configuration Required
  The following issues require Supabase Dashboard configuration:
  - Auth DB Connection Strategy: Change to percentage-based in Project Settings > Database
  - Leaked Password Protection: Enable HIBP in Authentication > Providers > Email
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index for commercial_annotations.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_commercial_annotations_created_by 
ON commercial_annotations(created_by);

-- Index for company.creator foreign key
CREATE INDEX IF NOT EXISTS idx_company_creator 
ON company(creator);

-- Index for subscriptions.company_id foreign key
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id 
ON subscriptions(company_id);

-- Index for user_profile.company_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_profile_company_id 
ON user_profile(company_id);

-- ============================================================================
-- 2. DROP UNUSED INDEXES
-- ============================================================================

-- These indexes exist but are not being used by queries
DROP INDEX IF EXISTS idx_commercial_annotations_bill_id;
DROP INDEX IF EXISTS idx_commercial_annotations_company_id;
DROP INDEX IF EXISTS idx_commercial_annotations_problem_type;

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES ON user_profile TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles in their company" ON user_profile;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profile;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view profiles in their company"
  ON user_profile
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE (select auth.uid()) = id
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON user_profile
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON user_profile
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can delete their own profile"
  ON user_profile
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = id);

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES ON commercial_annotations TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view annotations from their company" ON commercial_annotations;
DROP POLICY IF EXISTS "Users can create annotations for their company" ON commercial_annotations;
DROP POLICY IF EXISTS "Users can delete their own annotations" ON commercial_annotations;
DROP POLICY IF EXISTS "Users can update their own annotations" ON commercial_annotations;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view annotations from their company"
  ON commercial_annotations
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT COALESCE(raw_user_meta_data->>'company_id', id::text)
      FROM auth.users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create annotations for their company"
  ON commercial_annotations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT COALESCE(raw_user_meta_data->>'company_id', id::text)
      FROM auth.users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update their own annotations"
  ON commercial_annotations
  FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Users can delete their own annotations"
  ON commercial_annotations
  FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

-- ============================================================================
-- 5. ADD MISSING RLS POLICIES TO subscriptions TABLE
-- ============================================================================

-- First, optimize existing policy
DROP POLICY IF EXISTS "Users can view their company subscriptions" ON subscriptions;

CREATE POLICY "Users can view their company subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE (select auth.uid()) = id
    )
  );

-- Add missing INSERT, UPDATE, DELETE policies
CREATE POLICY "Users can insert subscriptions for their company"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE (select auth.uid()) = id
    )
  );

CREATE POLICY "Users can update their company subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE (select auth.uid()) = id
    )
  );

CREATE POLICY "Users can delete their company subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE (select auth.uid()) = id
    )
  );

-- ============================================================================
-- 6. FIX OVERLY PERMISSIVE RLS POLICIES
-- ============================================================================

-- Drop the insecure policy that allows any authenticated user to insert
DROP POLICY IF EXISTS "Users can insert company if authenticated" ON company;

-- Replace with a secure policy that verifies the user is creating their own company
CREATE POLICY "Users can insert their own company"
  ON company
  FOR INSERT
  TO authenticated
  WITH CHECK (
    creator = (select auth.uid()) OR
    creator IN (
      SELECT id FROM user_profile WHERE id = (select auth.uid())
    )
  );

-- Optimize existing company view policy
DROP POLICY IF EXISTS "Users can view their company" ON company;

CREATE POLICY "Users can view their company"
  ON company
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE (select auth.uid()) = id
    )
  );

-- Add missing policies for company table
CREATE POLICY "Users can update their company"
  ON company
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM user_profile 
      WHERE (select auth.uid()) = id
    )
  );

-- Fix company_settings table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'company_settings'
  ) THEN
    -- Drop insecure policy if it exists
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert company settings if authenticated" ON company_settings';
    
    -- Add secure policy
    EXECUTE 'CREATE POLICY "Users can insert company settings for their company"
      ON company_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (
        company_id IN (
          SELECT company_id 
          FROM user_profile 
          WHERE (select auth.uid()) = id
        )
      )';
  END IF;
END $$;

-- ============================================================================
-- 7. FIX FUNCTION SECURITY (SEARCH PATH)
-- ============================================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix update_commercial_annotations_updated_at function
CREATE OR REPLACE FUNCTION update_commercial_annotations_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix create_user_company function - need to drop and recreate
DROP FUNCTION IF EXISTS create_user_company(uuid, text, text, text, text);

CREATE OR REPLACE FUNCTION create_user_company(
  p_user_id uuid,
  p_user_name text,
  p_user_email text,
  p_company_name text,
  p_company_doc text
)
RETURNS json
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_company_id uuid;
  v_result json;
BEGIN
  -- Insert company
  INSERT INTO company (name, doc_num, creator)
  VALUES (p_company_name, p_company_doc, p_user_id)
  RETURNING id INTO v_company_id;
  
  -- Insert user profile
  INSERT INTO user_profile (id, name, email, company_id)
  VALUES (p_user_id, p_user_name, p_user_email, v_company_id);
  
  -- Return result
  v_result := json_build_object(
    'company_id', v_company_id,
    'user_id', p_user_id
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
