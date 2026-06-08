/*
  # Fix RLS "always true" policies and SECURITY DEFINER function exposure

  1. Policy Changes
    - `public.rules`: replace public unrestricted policies (INSERT/UPDATE/DELETE) with
      authenticated-only policies scoped by creator (auth.uid()).
    - `public.agreement_proposals`: tighten UPDATE USING clause to only allow updating
      pending proposals (instead of `true`).

  2. Function Security
    - Revoke EXECUTE from `anon` and `authenticated` on the following SECURITY DEFINER
      functions so they cannot be called through PostgREST RPC:
        - create_user_company(uuid, text, text, text, text)
        - get_my_company_id()
        - update_commercial_annotations_updated_at()
        - update_updated_at_column()
      These functions are internal helpers / trigger functions and should not be callable
      as RPC endpoints by client roles.

  3. Notes
    - Trigger functions continue to execute via the trigger mechanism regardless of
      EXECUTE grants to `anon`/`authenticated`.
    - `get_my_company_id()` and `create_user_company()` are invoked from policies or
      server-side contexts, not via client RPC.
*/

-- agreement_proposals: tighten UPDATE USING
DROP POLICY IF EXISTS "Authenticated users update proposal status" ON public.agreement_proposals;

CREATE POLICY "Authenticated users update proposal status"
  ON public.agreement_proposals
  FOR UPDATE
  TO authenticated
  USING (status = 'pending')
  WITH CHECK (status IN ('pending', 'approved', 'refused', 'expired'));

-- rules: remove public unrestricted policies, replace with scoped authenticated policies
DROP POLICY IF EXISTS "Public can insert rules" ON public.rules;
DROP POLICY IF EXISTS "Public can update rules" ON public.rules;
DROP POLICY IF EXISTS "Public can delete rules" ON public.rules;

CREATE POLICY "Authenticated can insert own rules"
  ON public.rules
  FOR INSERT
  TO authenticated
  WITH CHECK (creator = auth.uid());

CREATE POLICY "Authenticated can update own rules"
  ON public.rules
  FOR UPDATE
  TO authenticated
  USING (creator = auth.uid())
  WITH CHECK (creator = auth.uid());

CREATE POLICY "Authenticated can delete own rules"
  ON public.rules
  FOR DELETE
  TO authenticated
  USING (creator = auth.uid());

-- Revoke EXECUTE on SECURITY DEFINER functions from client-facing roles
REVOKE EXECUTE ON FUNCTION public.create_user_company(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_company_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_commercial_annotations_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
