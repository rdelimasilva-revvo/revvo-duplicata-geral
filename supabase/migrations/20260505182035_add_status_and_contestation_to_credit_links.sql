/*
  # Credit Link Contestation Support

  1. Changes to `proposal_credit_links`
    - Add `status` (text) with values: 'linked', 'pending_review', 'contested', 'resolved'
      Default: 'linked'.

  2. New Table: `proposal_credit_link_contestations`
    - `id` (uuid, PK)
    - `credit_link_id` (uuid, FK -> proposal_credit_links.id, cascade on delete)
    - `proposal_code` (text) - proposta associada (redundante para consulta rápida)
    - `reason_code` (text) - motivo tabulado
    - `observations` (text) - detalhes adicionais
    - `responder_id` (uuid nullable) - auth user id
    - `responder_name` (text) - nome do usuário
    - `responder_email` (text) - email do usuário
    - `created_at` (timestamptz)

  3. Security
    - RLS enabled on the new table
    - Demo (anon) inserts permitidos para suportar o fluxo de protótipo
    - Authenticated users podem ler/gerenciar os próprios registros
    - SELECT aberto a anon/authenticated para visualizar disputas em aberto no fluxo
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_credit_links' AND column_name = 'status'
  ) THEN
    ALTER TABLE proposal_credit_links
      ADD COLUMN status text NOT NULL DEFAULT 'linked'
      CHECK (status IN ('linked', 'pending_review', 'contested', 'resolved'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proposal_credit_links_status
  ON proposal_credit_links(status);

CREATE TABLE IF NOT EXISTS proposal_credit_link_contestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_link_id uuid NOT NULL REFERENCES proposal_credit_links(id) ON DELETE CASCADE,
  proposal_code text NOT NULL,
  reason_code text NOT NULL,
  observations text NOT NULL DEFAULT '',
  responder_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  responder_name text NOT NULL DEFAULT '',
  responder_email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_link_contest_link
  ON proposal_credit_link_contestations(credit_link_id);
CREATE INDEX IF NOT EXISTS idx_credit_link_contest_code
  ON proposal_credit_link_contestations(proposal_code);

ALTER TABLE proposal_credit_link_contestations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read credit link contestations"
  ON proposal_credit_link_contestations;
CREATE POLICY "Anyone can read credit link contestations"
  ON proposal_credit_link_contestations FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert credit link contestations"
  ON proposal_credit_link_contestations;
CREATE POLICY "Anyone can insert credit link contestations"
  ON proposal_credit_link_contestations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own credit link contestations"
  ON proposal_credit_link_contestations;
CREATE POLICY "Users update own credit link contestations"
  ON proposal_credit_link_contestations FOR UPDATE
  TO authenticated
  USING (auth.uid() = responder_id)
  WITH CHECK (auth.uid() = responder_id);

DROP POLICY IF EXISTS "Users delete own credit link contestations"
  ON proposal_credit_link_contestations;
CREATE POLICY "Users delete own credit link contestations"
  ON proposal_credit_link_contestations FOR DELETE
  TO authenticated
  USING (auth.uid() = responder_id);
