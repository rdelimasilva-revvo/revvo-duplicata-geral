/*
  # Store responder identity on proposal decisions

  1. Changes
    - Add `responder_name` (text) to `agreement_proposal_responses`
    - Add `responder_email` (text) to `agreement_proposal_responses`
  2. Notes
    - `created_at` already stores the decision timestamp (date + hour)
    - These columns capture who approved/refused the proposal for the audit flag
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='agreement_proposal_responses' AND column_name='responder_name'
  ) THEN
    ALTER TABLE agreement_proposal_responses ADD COLUMN responder_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='agreement_proposal_responses' AND column_name='responder_email'
  ) THEN
    ALTER TABLE agreement_proposal_responses ADD COLUMN responder_email text DEFAULT '';
  END IF;
END $$;
