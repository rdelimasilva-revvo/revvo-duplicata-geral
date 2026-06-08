/*
  # Credit Link Conflict Resolution Log

  1. New Table: `credit_link_resolutions`
    - `id` (uuid, PK)
    - `credit_link_id` (uuid, FK -> proposal_credit_links)
    - `proposal_code` (text)
    - `action` (text) - 'adjust_value' | 'remove_from_agreement' | 'keep_original'
    - `new_amount` (numeric, nullable) - usado em adjust_value
    - `justification` (text) - obrigatorio em keep_original
    - `actor_id` (uuid nullable)
    - `actor_name` (text)
    - `created_at` (timestamptz)

  2. Security
    - RLS enabled
    - SELECT aberto (demo/protótipo)
    - INSERT aberto (demo/protótipo)
    - UPDATE/DELETE apenas pelo próprio ator autenticado
*/

CREATE TABLE IF NOT EXISTS credit_link_resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_link_id uuid NOT NULL REFERENCES proposal_credit_links(id) ON DELETE CASCADE,
  proposal_code text NOT NULL,
  action text NOT NULL CHECK (action IN ('adjust_value', 'remove_from_agreement', 'keep_original')),
  new_amount numeric,
  justification text NOT NULL DEFAULT '',
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_link_resolutions_link
  ON credit_link_resolutions(credit_link_id);
CREATE INDEX IF NOT EXISTS idx_credit_link_resolutions_code
  ON credit_link_resolutions(proposal_code);

ALTER TABLE credit_link_resolutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read credit link resolutions"
  ON credit_link_resolutions;
CREATE POLICY "Anyone can read credit link resolutions"
  ON credit_link_resolutions FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert credit link resolutions"
  ON credit_link_resolutions;
CREATE POLICY "Anyone can insert credit link resolutions"
  ON credit_link_resolutions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own credit link resolutions"
  ON credit_link_resolutions;
CREATE POLICY "Users update own credit link resolutions"
  ON credit_link_resolutions FOR UPDATE
  TO authenticated
  USING (auth.uid() = actor_id)
  WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users delete own credit link resolutions"
  ON credit_link_resolutions;
CREATE POLICY "Users delete own credit link resolutions"
  ON credit_link_resolutions FOR DELETE
  TO authenticated
  USING (auth.uid() = actor_id);
