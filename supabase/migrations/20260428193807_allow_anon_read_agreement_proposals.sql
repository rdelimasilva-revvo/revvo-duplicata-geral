/*
  # Allow anonymous read of agreement proposals catalog

  The Revisão de Propostas dashboard is part of a demo / supplier portal that
  may be browsed without an authenticated session. The catalog itself is
  non-sensitive (it is the same list of proposals visible to every supplier),
  so we extend the SELECT policy to anon as well.

  1. Security
    - Replace existing SELECT policy with one targeting `anon, authenticated`.
    - Other policies (insert/update) remain unchanged and continue to require
      authentication where applicable.
*/

DROP POLICY IF EXISTS "Authenticated users read proposals" ON agreement_proposals;

CREATE POLICY "Anyone can read proposals catalog"
  ON agreement_proposals FOR SELECT
  TO anon, authenticated
  USING (true);
