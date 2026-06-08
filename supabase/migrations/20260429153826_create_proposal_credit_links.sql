/*
  # Proposal Credit Links

  1. New Tables
    - `proposal_credit_links`
      - `id` (uuid, PK)
      - `proposal_code` (text) - code of the agreement proposal
      - `invoice_id` (text) - NF identifier within the proposal
      - `credit_id` (text) - chosen credit identifier
      - `credit_label` (text) - human readable credit label
      - `amount` (numeric) - amount allocated from the credit
      - `created_by` (uuid) - auth user who created the link
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS
    - Authenticated users can read/insert/update/delete their own links
*/

CREATE TABLE IF NOT EXISTS proposal_credit_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code text NOT NULL,
  invoice_id text NOT NULL,
  credit_id text NOT NULL,
  credit_label text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_credit_links_code ON proposal_credit_links(proposal_code);

ALTER TABLE proposal_credit_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credit links"
  ON proposal_credit_links FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users insert own credit links"
  ON proposal_credit_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users update own credit links"
  ON proposal_credit_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users delete own credit links"
  ON proposal_credit_links FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
