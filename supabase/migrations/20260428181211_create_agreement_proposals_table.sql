/*
  # Agreement proposals catalog (Supplier review dashboard)

  Stores the catalog of agreement proposals visible to suppliers in the
  "Revisão de Propostas" dashboard. Each proposal can be reviewed individually
  and its outcome persists in `agreement_proposal_responses`.

  1. New table
    - `agreement_proposals`
      - `id` (uuid, primary key)
      - `code` (text, unique) — public identifier (e.g. REV-428)
      - `origin_company` (text) — issuing manager / company
      - `title` (text)
      - `message` (text) — short message from the manager
      - `total_original` (numeric) — sum of original invoice values
      - `total_discount` (numeric) — proposed discount
      - `invoices_count` (integer)
      - `status` (text) — pending | approved | refused | expired
      - `sent_at` (timestamptz)
      - `deadline` (timestamptz, nullable)
      - `created_at` (timestamptz, default now())

  2. Seed data
    - Six demo proposals covering all status variants so the dashboard renders
      a realistic mix on first load.

  3. Security
    - RLS enabled
    - Authenticated users can read the catalog (the catalog itself is shared)
*/

CREATE TABLE IF NOT EXISTS agreement_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  origin_company text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  total_original numeric NOT NULL DEFAULT 0,
  total_discount numeric NOT NULL DEFAULT 0,
  invoices_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'refused', 'expired')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agreement_proposals_status
  ON agreement_proposals(status);
CREATE INDEX IF NOT EXISTS idx_agreement_proposals_sent_at
  ON agreement_proposals(sent_at DESC);

ALTER TABLE agreement_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read proposals" ON agreement_proposals;
CREATE POLICY "Authenticated users read proposals"
  ON agreement_proposals FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO agreement_proposals
  (code, origin_company, title, message, total_original, total_discount, invoices_count, status, sent_at, deadline)
VALUES
  ('REV-428', 'IDEEN TECH', 'Bônus de volume Q1',
   'Acordo referente ao bônus de volume do último trimestre. Por favor, revisar e aprovar.',
   100000, 35000, 3, 'pending', now() - interval '2 days', now() + interval '5 days'),
  ('REV-429', 'NORTEC INDÚSTRIA', 'Renegociação NF em atraso',
   'Proposta de abatimento para regularização de notas em aberto há mais de 60 dias.',
   84500, 18000, 4, 'pending', now() - interval '4 days', now() + interval '3 days'),
  ('REV-430', 'BRASIL LOG', 'Ajuste por avaria parcial',
   'Abatimento referente a avarias identificadas no recebimento das mercadorias.',
   42300, 6800, 2, 'pending', now() - interval '1 days', now() + interval '6 days'),
  ('REV-425', 'TECHFOOD ALIMENTOS', 'Reembolso campanha sazonal',
   'Acordo de devolução parcial referente à campanha sazonal de inverno.',
   58000, 9500, 3, 'approved', now() - interval '12 days', now() - interval '4 days'),
  ('REV-422', 'INDUSTRIAL PRIME', 'Desconto fora de política',
   'Desconto sugerido que excede a política comercial vigente — ajuste solicitado.',
   71000, 28000, 5, 'refused', now() - interval '18 days', now() - interval '10 days'),
  ('REV-418', 'METAL FORTE', 'Bonificação trimestral',
   'Bonificação trimestral conforme contrato vigente.',
   33000, 4200, 2, 'expired', now() - interval '32 days', now() - interval '20 days')
ON CONFLICT (code) DO NOTHING;
