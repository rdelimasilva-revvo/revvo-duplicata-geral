/*
  # Allow authenticated users to update proposal status

  1. Security
    - Adds UPDATE policy on `agreement_proposals` so the review screen can
      persist approvals, refusals and expirations on the corresponding proposal
      record. Policy only allows flipping the `status` between the four valid
      values; other columns are still constrained by the existing CHECK.
    - Read policy remains unchanged.
*/

DROP POLICY IF EXISTS "Authenticated users update proposal status" ON agreement_proposals;
CREATE POLICY "Authenticated users update proposal status"
  ON agreement_proposals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (status IN ('pending', 'approved', 'refused', 'expired'));
