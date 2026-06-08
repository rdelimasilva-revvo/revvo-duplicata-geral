/*
  # Commercial Agreements Pipeline Table

  1. New Tables
    - `commercial_agreements`
      - `id` (uuid, PK)
      - `code` (text, unique agreement reference)
      - `title` (text)
      - `supplier_name` (text)
      - `supplier_cnpj` (text)
      - `sacado_name` (text)
      - `sacado_cnpj` (text)
      - `status` (text) - pipeline state: draft, in_negotiation, pending_approval, active, completed, rejected
      - `contract_type` (text) - venda, cessao, fianca
      - `total_value` (numeric)
      - `currency` (text, default BRL)
      - `start_date` (date)
      - `end_date` (date)
      - `owner_id` (uuid, references auth.users)
      - `progress_percent` (int, 0-100)
      - `risk_level` (text) - low, medium, high
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on commercial_agreements
    - Policies: authenticated users can view their own agreements and manage them
    - Anonymous users can view demo agreements (owner_id IS NULL) for public dashboard

  3. Indexes
    - status for pipeline queries
    - owner_id for ownership lookups
    - created_at for time-series analytics

  4. Demo seed data
    - 12 mock agreements distributed across pipeline states with owner_id NULL
    - Covers varied suppliers, values, and timelines for realistic dashboard visuals
*/

CREATE TABLE IF NOT EXISTS commercial_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  supplier_name text NOT NULL DEFAULT '',
  supplier_cnpj text NOT NULL DEFAULT '',
  sacado_name text NOT NULL DEFAULT '',
  sacado_cnpj text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  contract_type text NOT NULL DEFAULT 'venda',
  total_value numeric(14, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  start_date date,
  end_date date,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  progress_percent integer NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  risk_level text NOT NULL DEFAULT 'low',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_agreements_status ON commercial_agreements(status);
CREATE INDEX IF NOT EXISTS idx_commercial_agreements_owner ON commercial_agreements(owner_id);
CREATE INDEX IF NOT EXISTS idx_commercial_agreements_created_at ON commercial_agreements(created_at);

ALTER TABLE commercial_agreements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public demo agreements are viewable by anyone" ON commercial_agreements;
CREATE POLICY "Public demo agreements are viewable by anyone"
  ON commercial_agreements FOR SELECT
  TO anon, authenticated
  USING (owner_id IS NULL);

DROP POLICY IF EXISTS "Users can view own agreements" ON commercial_agreements;
CREATE POLICY "Users can view own agreements"
  ON commercial_agreements FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own agreements" ON commercial_agreements;
CREATE POLICY "Users can insert own agreements"
  ON commercial_agreements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own agreements" ON commercial_agreements;
CREATE POLICY "Users can update own agreements"
  ON commercial_agreements FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own agreements" ON commercial_agreements;
CREATE POLICY "Users can delete own agreements"
  ON commercial_agreements FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

INSERT INTO commercial_agreements (code, title, supplier_name, supplier_cnpj, sacado_name, sacado_cnpj, status, contract_type, total_value, start_date, end_date, progress_percent, risk_level, created_at)
VALUES
  ('AC-2026-001', 'Acordo Delta S.A. - Cessão Recebíveis', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'Banco Alpha', '11.222.333/0001-44', 'draft', 'cessao', 450000, '2026-05-01', '2026-11-30', 10, 'low', now() - interval '2 days'),
  ('AC-2026-002', 'Acordo Distribuidora Nacional', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'Financeira Beta', '22.333.444/0001-55', 'in_negotiation', 'venda', 280000, '2026-04-15', '2026-10-15', 35, 'medium', now() - interval '5 days'),
  ('AC-2026-003', 'Acordo Sigma Industria', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'Banco Alpha', '11.222.333/0001-44', 'pending_approval', 'venda', 620000, '2026-03-20', '2026-12-20', 65, 'medium', now() - interval '8 days'),
  ('AC-2026-004', 'Acordo Beta Comércio Anual', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'Financeira Beta', '22.333.444/0001-55', 'active', 'venda', 890000, '2026-01-10', '2026-12-31', 100, 'low', now() - interval '40 days'),
  ('AC-2026-005', 'Acordo Delta Fiança Bancária', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'Banco Alpha', '11.222.333/0001-44', 'active', 'fianca', 320000, '2026-02-01', '2026-08-31', 100, 'low', now() - interval '30 days'),
  ('AC-2026-006', 'Acordo Sigma Cessão Trimestral', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'Banco Alpha', '11.222.333/0001-44', 'completed', 'cessao', 180000, '2025-10-01', '2026-01-31', 100, 'low', now() - interval '120 days'),
  ('AC-2026-007', 'Acordo Distribuidora Premium', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'Financeira Beta', '22.333.444/0001-55', 'in_negotiation', 'cessao', 1250000, '2026-05-10', '2027-05-10', 45, 'high', now() - interval '3 days'),
  ('AC-2026-008', 'Acordo Beta Fiança Reforço', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'Banco Alpha', '11.222.333/0001-44', 'rejected', 'fianca', 95000, '2026-03-05', '2026-09-05', 20, 'high', now() - interval '15 days'),
  ('AC-2026-009', 'Acordo Delta Supply Chain', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'Financeira Beta', '22.333.444/0001-55', 'pending_approval', 'cessao', 540000, '2026-04-20', '2026-10-20', 75, 'medium', now() - interval '11 days'),
  ('AC-2026-010', 'Acordo Sigma Expansão', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'Banco Alpha', '11.222.333/0001-44', 'active', 'venda', 780000, '2026-03-01', '2026-12-31', 100, 'low', now() - interval '25 days'),
  ('AC-2026-011', 'Acordo Beta Projeto Alfa', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'Financeira Beta', '22.333.444/0001-55', 'draft', 'venda', 150000, '2026-05-15', '2026-11-15', 5, 'medium', now() - interval '1 days'),
  ('AC-2026-012', 'Acordo Distribuidora Consolidado', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'Banco Alpha', '11.222.333/0001-44', 'completed', 'venda', 410000, '2025-09-01', '2026-02-28', 100, 'low', now() - interval '90 days')
ON CONFLICT (code) DO NOTHING;
