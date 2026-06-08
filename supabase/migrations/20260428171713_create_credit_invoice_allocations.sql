/*
  # Create credit_invoice_allocations table

  Persists the final result produced by the "Vincular Crédito" wizard.
  Each row represents one (credit, invoice) allocation, grouped by `proposal_id`
  so that a single wizard submission can be retrieved as a coherent set.

  1. New Tables
    - `credit_invoice_allocations`
      - `id` (uuid, primary key)
      - `proposal_id` (text) - groups allocations from the same wizard submission
      - `credit_id` (uuid) - reference to supplier_credits
      - `invoice_id` (uuid) - reference to eligible_invoices
      - `supplier_id` (text)
      - `allocated_value` (numeric)
      - `notes` (text, nullable)
      - `owner_id` (uuid, nullable) - auth user that submitted
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `credit_invoice_allocations`
    - Authenticated users may select/insert their own rows (owner_id = auth.uid())
    - No update/delete policies (allocations are append-only audit data)

  3. Indexes
    - Index on `proposal_id` for fast lookup by submission
    - Index on `credit_id` and `invoice_id`
*/

CREATE TABLE IF NOT EXISTS credit_invoice_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id text NOT NULL,
  credit_id uuid NOT NULL REFERENCES supplier_credits(id),
  invoice_id uuid NOT NULL REFERENCES eligible_invoices(id),
  supplier_id text NOT NULL DEFAULT '',
  allocated_value numeric NOT NULL DEFAULT 0,
  notes text,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cia_proposal_id ON credit_invoice_allocations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_cia_credit_id ON credit_invoice_allocations(credit_id);
CREATE INDEX IF NOT EXISTS idx_cia_invoice_id ON credit_invoice_allocations(invoice_id);

ALTER TABLE credit_invoice_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own allocations"
  ON credit_invoice_allocations FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own allocations"
  ON credit_invoice_allocations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());
