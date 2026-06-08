/*
  # Add contested status and proposal contestations

  1. Schema Changes
    - Expand `agreement_proposals.status` CHECK to allow `contested`
    - Expand `agreement_proposal_responses.decision` CHECK to allow `contested`
    - Create `agreement_proposal_contestations` to store disputes:
      - `id` (uuid, pk)
      - `proposal_code` (text, fk-like)
      - `reason_code` (text) — valor_divergente | nf_incorreta | prazo_invalido | outro
      - `observations` (text)
      - `responder_id` (uuid)
      - `responder_name` (text)
      - `responder_email` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated can insert their own contestation and read their own
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'agreement_proposals' AND constraint_name = 'agreement_proposals_status_check'
  ) THEN
    ALTER TABLE agreement_proposals DROP CONSTRAINT agreement_proposals_status_check;
  END IF;
END $$;

ALTER TABLE agreement_proposals
  ADD CONSTRAINT agreement_proposals_status_check
  CHECK (status IN ('pending', 'approved', 'refused', 'expired', 'contested'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'agreement_proposal_responses' AND constraint_name = 'agreement_proposal_responses_decision_check'
  ) THEN
    ALTER TABLE agreement_proposal_responses DROP CONSTRAINT agreement_proposal_responses_decision_check;
  END IF;
END $$;

ALTER TABLE agreement_proposal_responses
  ADD CONSTRAINT agreement_proposal_responses_decision_check
  CHECK (decision IN ('approved', 'refused', 'contested'));

CREATE TABLE IF NOT EXISTS agreement_proposal_contestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code text NOT NULL,
  reason_code text NOT NULL,
  observations text NOT NULL DEFAULT '',
  responder_id uuid,
  responder_name text NOT NULL DEFAULT '',
  responder_email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agreement_proposal_contestations_code
  ON agreement_proposal_contestations(proposal_code);

ALTER TABLE agreement_proposal_contestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert contestations"
  ON agreement_proposal_contestations FOR INSERT
  TO authenticated
  WITH CHECK (responder_id = auth.uid());

CREATE POLICY "Authenticated can read contestations"
  ON agreement_proposal_contestations FOR SELECT
  TO authenticated
  USING (true);
