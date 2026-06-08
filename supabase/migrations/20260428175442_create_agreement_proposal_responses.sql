/*
  # Supplier responses for commercial agreement proposals

  Persists supplier decisions (approve / refuse) for proposals reviewed in the
  "Revisão de Acordo Comercial" screen.

  1. New table
    - `agreement_proposal_responses`
      - `id` (uuid, primary key)
      - `proposal_code` (text) — proposal identifier shown to the supplier
      - `proposal_origin` (text) — manager / company that issued the proposal
      - `decision` (text) — 'approved' or 'refused'
      - `refusal_reason` (text, nullable)
      - `total_discount` (numeric)
      - `affected_invoices_count` (integer)
      - `responded_by` (uuid, nullable) — auth.users id of the supplier user
      - `created_at` (timestamptz, default now())

  2. Security
    - RLS enabled
    - Policies: each supplier user can read / insert their own responses
*/

CREATE TABLE IF NOT EXISTS agreement_proposal_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code text NOT NULL,
  proposal_origin text NOT NULL DEFAULT '',
  decision text NOT NULL CHECK (decision IN ('approved', 'refused')),
  refusal_reason text,
  total_discount numeric NOT NULL DEFAULT 0,
  affected_invoices_count integer NOT NULL DEFAULT 0,
  responded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agreement_proposal_responses_owner
  ON agreement_proposal_responses(responded_by);
CREATE INDEX IF NOT EXISTS idx_agreement_proposal_responses_code
  ON agreement_proposal_responses(proposal_code);

ALTER TABLE agreement_proposal_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Suppliers read own responses" ON agreement_proposal_responses;
CREATE POLICY "Suppliers read own responses"
  ON agreement_proposal_responses FOR SELECT
  TO authenticated
  USING (responded_by = auth.uid());

DROP POLICY IF EXISTS "Suppliers insert own responses" ON agreement_proposal_responses;
CREATE POLICY "Suppliers insert own responses"
  ON agreement_proposal_responses FOR INSERT
  TO authenticated
  WITH CHECK (responded_by = auth.uid());
