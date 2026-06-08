/*
  # Supplier Portal - Alocações de Crédito

  1. New Tables
    - `supplier_portal_credit_allocations`
      - `id` (uuid, primary key)
      - `proposal_code` (text) - código da proposta comercial
      - `supplier_cnpj` (text) - CNPJ do fornecedor
      - `invoice_id` (text) - id da NF
      - `credit_id` (text) - id do crédito
      - `amount` (numeric) - valor alocado
      - `created_at` (timestamptz)
      - `created_by` (uuid) - usuário que aplicou

  2. Security
    - Enable RLS
    - Authenticated users podem ler e inserir alocações
*/

CREATE TABLE IF NOT EXISTS supplier_portal_credit_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code text NOT NULL,
  supplier_cnpj text NOT NULL DEFAULT '',
  invoice_id text NOT NULL,
  credit_id text NOT NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_spca_proposal ON supplier_portal_credit_allocations(proposal_code);
CREATE INDEX IF NOT EXISTS idx_spca_supplier ON supplier_portal_credit_allocations(supplier_cnpj);

ALTER TABLE supplier_portal_credit_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read allocations"
  ON supplier_portal_credit_allocations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert own allocations"
  ON supplier_portal_credit_allocations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
