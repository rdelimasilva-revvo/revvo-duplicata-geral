/*
  # Supplier Credits and Eligible Invoices

  1. New Tables
    - `supplier_credits`
      - `id` (uuid, PK)
      - `code` (text, unique) - human-readable reference (CR-...)
      - `supplier_id` (text) - supplier logical id
      - `supplier_name` (text)
      - `supplier_cnpj` (text)
      - `origin` (text) - origem do crédito (ex: 'acordo_comercial', 'devolucao', 'bonificacao')
      - `total_value` (numeric) - valor total original do crédito
      - `remaining_value` (numeric) - saldo disponível ainda não vinculado
      - `issue_date` (date)
      - `expires_at` (date)
      - `status` (text) - 'available', 'partial', 'consumed'
      - `owner_id` (uuid nullable) - owner for RLS; null = demo seed
      - `created_at`, `updated_at`
    - `eligible_invoices`
      - `id` (uuid, PK)
      - `supplier_id` (text) - matches supplier_credits.supplier_id
      - `number` (text) - NF-XXX
      - `issue_date` (date)
      - `due_date` (date)
      - `original_value` (numeric)
      - `open_balance` (numeric) - saldo em aberto que pode ser abatido
      - `status` (text) - 'livre', 'em_disputa', 'bloqueada', 'pendente'
      - `owner_id` (uuid nullable)
      - `created_at`, `updated_at`

  2. Security
    - RLS enabled on both tables
    - Demo rows (owner_id IS NULL) are readable by anyone (for the prototype UI)
    - Authenticated users manage their own rows

  3. Indexes
    - supplier_id on both tables for grouping queries
    - status on credits
*/

CREATE TABLE IF NOT EXISTS supplier_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  supplier_id text NOT NULL,
  supplier_name text NOT NULL DEFAULT '',
  supplier_cnpj text NOT NULL DEFAULT '',
  origin text NOT NULL DEFAULT 'acordo_comercial',
  total_value numeric(14, 2) NOT NULL DEFAULT 0,
  remaining_value numeric(14, 2) NOT NULL DEFAULT 0,
  issue_date date,
  expires_at date,
  status text NOT NULL DEFAULT 'available',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eligible_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id text NOT NULL,
  number text NOT NULL,
  issue_date date,
  due_date date,
  original_value numeric(14, 2) NOT NULL DEFAULT 0,
  open_balance numeric(14, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'livre',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_credits_supplier ON supplier_credits(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_credits_status ON supplier_credits(status);
CREATE INDEX IF NOT EXISTS idx_eligible_invoices_supplier ON eligible_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_eligible_invoices_status ON eligible_invoices(status);

ALTER TABLE supplier_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligible_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo credits viewable by anyone" ON supplier_credits;
CREATE POLICY "Demo credits viewable by anyone"
  ON supplier_credits FOR SELECT
  TO anon, authenticated
  USING (owner_id IS NULL);

DROP POLICY IF EXISTS "Users view own credits" ON supplier_credits;
CREATE POLICY "Users view own credits"
  ON supplier_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users insert own credits" ON supplier_credits;
CREATE POLICY "Users insert own credits"
  ON supplier_credits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users update own credits" ON supplier_credits;
CREATE POLICY "Users update own credits"
  ON supplier_credits FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users delete own credits" ON supplier_credits;
CREATE POLICY "Users delete own credits"
  ON supplier_credits FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Demo invoices viewable by anyone" ON eligible_invoices;
CREATE POLICY "Demo invoices viewable by anyone"
  ON eligible_invoices FOR SELECT
  TO anon, authenticated
  USING (owner_id IS NULL);

DROP POLICY IF EXISTS "Users view own invoices" ON eligible_invoices;
CREATE POLICY "Users view own invoices"
  ON eligible_invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users insert own invoices" ON eligible_invoices;
CREATE POLICY "Users insert own invoices"
  ON eligible_invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users update own invoices" ON eligible_invoices;
CREATE POLICY "Users update own invoices"
  ON eligible_invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users delete own invoices" ON eligible_invoices;
CREATE POLICY "Users delete own invoices"
  ON eligible_invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

INSERT INTO supplier_credits (code, supplier_id, supplier_name, supplier_cnpj, origin, total_value, remaining_value, issue_date, expires_at, status)
VALUES
  ('CR-2026-0101', 'f1', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'acordo_comercial', 50000, 50000, '2026-03-15', '2026-09-15', 'available'),
  ('CR-2026-0102', 'f1', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'devolucao', 18500, 18500, '2026-04-05', '2026-10-05', 'available'),
  ('CR-2026-0203', 'f2', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'bonificacao', 32500, 20000, '2026-02-20', '2026-08-20', 'partial'),
  ('CR-2026-0304', 'f3', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'acordo_comercial', 18000, 18000, '2026-03-28', '2026-09-28', 'available'),
  ('CR-2026-0405', 'f4', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'acordo_comercial', 74500, 74500, '2026-04-01', '2026-10-01', 'available')
ON CONFLICT (code) DO NOTHING;

INSERT INTO eligible_invoices (supplier_id, number, issue_date, due_date, original_value, open_balance, status)
VALUES
  ('f1', 'NF-00012345', '2026-03-10', '2026-05-10', 32000, 32000, 'livre'),
  ('f1', 'NF-00012401', '2026-03-18', '2026-05-18', 48500, 48500, 'livre'),
  ('f1', 'NF-00012478', '2026-03-25', '2026-05-25', 18700, 18700, 'em_disputa'),
  ('f1', 'NF-00012502', '2026-04-05', '2026-06-05', 15300, 15300, 'pendente'),
  ('f2', 'NF-00021120', '2026-04-05', '2026-06-05', 15300, 15300, 'pendente'),
  ('f2', 'NF-00021188', '2026-04-12', '2026-06-12', 22400, 22400, 'livre'),
  ('f2', 'NF-00021221', '2026-04-20', '2026-06-20', 14800, 14800, 'livre'),
  ('f3', 'NF-00033401', '2026-03-28', '2026-05-28', 9800, 9800, 'livre'),
  ('f3', 'NF-00033477', '2026-04-20', '2026-06-20', 5500, 5500, 'bloqueada'),
  ('f4', 'NF-00044802', '2026-03-30', '2026-05-30', 64000, 64000, 'livre'),
  ('f4', 'NF-00044910', '2026-04-15', '2026-06-15', 38200, 38200, 'pendente'),
  ('f4', 'NF-00044988', '2026-04-25', '2026-06-25', 25100, 25100, 'livre')
ON CONFLICT DO NOTHING;
