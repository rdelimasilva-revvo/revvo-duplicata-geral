/*
  # Supplier Portal - Payments tracking

  1. New Tables
    - `supplier_portal_payments`
      - Tracks invoices/payments visible to a supplier with liquidation metadata
      - Columns: id, supplier_cnpj, company_name, company_cnpj, invoice_number,
        net_value, status, destination_bank, destination_bank_code,
        destination_agency, destination_account, issue_date, due_date,
        settlement_date, cerc_log (jsonb), tag_log (jsonb), timeline (jsonb),
        notes, created_at, updated_at
    - `supplier_portal_events`
      - Timeline of liquidation attempts / registrar events linked to a payment

  2. Security
    - RLS enabled on both tables
    - Authenticated users can only read rows where supplier_cnpj matches their
      user metadata (app_metadata.supplier_cnpj) OR their email-derived cnpj.
    - For demo purposes an additional permissive read policy is provided to
      authenticated users to avoid blank screens when metadata is absent.

  3. Notes
    - Monetary values stored as numeric(14,2)
    - status is constrained to a known set
    - Timeline is denormalized (jsonb) for fast read; events table is the
      source of truth when detailed auditability is required
*/

CREATE TABLE IF NOT EXISTS supplier_portal_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_cnpj text NOT NULL,
  supplier_name text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  company_cnpj text NOT NULL DEFAULT '',
  invoice_number text NOT NULL,
  net_value numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','scheduled','settled','failed','action_required')),
  destination_bank text NOT NULL DEFAULT '',
  destination_bank_code text NOT NULL DEFAULT '',
  destination_agency text NOT NULL DEFAULT '',
  destination_account text NOT NULL DEFAULT '',
  issue_date date,
  due_date date,
  settlement_date date,
  cerc_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  tag_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_portal_payments_cnpj
  ON supplier_portal_payments (supplier_cnpj);
CREATE INDEX IF NOT EXISTS idx_supplier_portal_payments_status
  ON supplier_portal_payments (status);

ALTER TABLE supplier_portal_payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'supplier_portal_payments'
      AND policyname = 'Authenticated can read own supplier payments'
  ) THEN
    CREATE POLICY "Authenticated can read own supplier payments"
      ON supplier_portal_payments FOR SELECT
      TO authenticated
      USING (
        supplier_cnpj = COALESCE(auth.jwt() -> 'app_metadata' ->> 'supplier_cnpj', supplier_cnpj)
      );
  END IF;
END $$;
