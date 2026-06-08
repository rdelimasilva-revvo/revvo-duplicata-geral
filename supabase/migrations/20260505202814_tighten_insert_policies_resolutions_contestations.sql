/*
  # Tighten INSERT policies on credit_link_resolutions and proposal_credit_link_contestations

  1. Problem
    - Both tables had INSERT policies with `WITH CHECK (true)`, effectively
      bypassing RLS for anon and authenticated roles.

  2. Fix
    - Replace the permissive policies with split policies per role:
      - authenticated role must insert rows tied to their own auth.uid()
        (actor_id / responder_id must equal auth.uid()).
      - anon role may insert only if the owner column is NULL (public portal
        flows that do not yet have a Supabase auth session).

  3. Security
    - Prevents authenticated users from impersonating another user by forging
      actor_id / responder_id.
    - Prevents anon users from claiming ownership of a row.
*/

DROP POLICY IF EXISTS "Anyone can insert credit link resolutions" ON public.credit_link_resolutions;
DROP POLICY IF EXISTS "Anyone can insert credit link contestations" ON public.proposal_credit_link_contestations;

CREATE POLICY "Authenticated insert own credit link resolutions"
  ON public.credit_link_resolutions
  FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Anon insert unclaimed credit link resolutions"
  ON public.credit_link_resolutions
  FOR INSERT
  TO anon
  WITH CHECK (actor_id IS NULL);

CREATE POLICY "Authenticated insert own credit link contestations"
  ON public.proposal_credit_link_contestations
  FOR INSERT
  TO authenticated
  WITH CHECK (responder_id = auth.uid());

CREATE POLICY "Anon insert unclaimed credit link contestations"
  ON public.proposal_credit_link_contestations
  FOR INSERT
  TO anon
  WITH CHECK (responder_id IS NULL);
