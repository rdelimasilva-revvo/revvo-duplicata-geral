/*
  # Payment Reconciliation Report

  1. New Tables
    - `payment_reconciliation`
      - `id` (uuid, primary key)
      - `nf_number` (text) - Invoice number
      - `duplicata_id` (text) - Duplicata identifier
      - `original_recipient_name` (text) - Original receiver razao social
      - `original_recipient_cnpj` (text) - Original receiver CNPJ
      - `new_recipient_name` (text) - New receiver razao social
      - `new_recipient_cnpj` (text) - New receiver CNPJ
      - `registradora` (text, nullable) - Registration entity (CERC, TAG, etc.)
      - `amount` (numeric) - Duplicata value
      - `due_date` (date, nullable)
      - `settlement_date` (date, nullable)
      - `status` (text) - liquidado | pendente | em_transito
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Read allowed to authenticated users (report is company-wide audit)
*/

CREATE TABLE IF NOT EXISTS payment_reconciliation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nf_number text NOT NULL DEFAULT '',
  duplicata_id text NOT NULL DEFAULT '',
  original_recipient_name text NOT NULL DEFAULT '',
  original_recipient_cnpj text NOT NULL DEFAULT '',
  new_recipient_name text NOT NULL DEFAULT '',
  new_recipient_cnpj text NOT NULL DEFAULT '',
  registradora text,
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  settlement_date date,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_reconciliation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read payment reconciliation"
  ON payment_reconciliation FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO payment_reconciliation
  (nf_number, duplicata_id, original_recipient_name, original_recipient_cnpj, new_recipient_name, new_recipient_cnpj, registradora, amount, due_date, settlement_date, status)
VALUES
  ('000124578', 'DUP-24578-01', 'Banco Itaú S.A.', '60.701.190/0001-04', 'Banco Bradesco S.A.', '60.746.948/0001-12', 'CERC', 18450.00, '2026-05-20', '2026-05-20', 'liquidado'),
  ('000124578', 'DUP-24578-02', 'Banco Itaú S.A.', '60.701.190/0001-04', 'Banco Bradesco S.A.', '60.746.948/0001-12', 'CERC', 18450.00, '2026-06-20', NULL, 'pendente'),
  ('000125004', 'DUP-25004-01', 'Banco Santander Brasil', '90.400.888/0001-42', 'Banco Safra S.A.', '58.160.789/0001-28', 'TAG', 42800.00, '2026-05-15', '2026-05-15', 'liquidado'),
  ('000125130', 'DUP-25130-01', 'Banco do Brasil S.A.', '00.000.000/0001-91', 'Banco BTG Pactual', '30.306.294/0001-45', NULL, 9720.50, '2026-05-12', '2026-05-12', 'liquidado'),
  ('000125300', 'DUP-25300-01', 'Banco Bradesco S.A.', '60.746.948/0001-12', 'Banco Itaú S.A.', '60.701.190/0001-04', 'CERC', 31250.00, '2026-05-28', NULL, 'em_transito'),
  ('000125412', 'DUP-25412-01', 'Caixa Econômica Federal', '00.360.305/0001-04', 'Banco Inter S.A.', '00.416.968/0001-01', NULL, 5480.75, '2026-05-10', '2026-05-10', 'liquidado'),
  ('000125580', 'DUP-25580-01', 'Banco Safra S.A.', '58.160.789/0001-28', 'Banco Santander Brasil', '90.400.888/0001-42', 'TAG', 67320.00, '2026-06-05', NULL, 'pendente'),
  ('000125631', 'DUP-25631-01', 'Banco BTG Pactual', '30.306.294/0001-45', 'Banco Bradesco S.A.', '60.746.948/0001-12', 'CERC', 22100.00, '2026-05-25', '2026-05-25', 'liquidado'),
  ('000125700', 'DUP-25700-01', 'Banco Itaú S.A.', '60.701.190/0001-04', 'Banco do Brasil S.A.', '00.000.000/0001-91', NULL, 14870.00, '2026-05-18', '2026-05-18', 'liquidado'),
  ('000125812', 'DUP-25812-01', 'Banco Inter S.A.', '00.416.968/0001-01', 'Banco Safra S.A.', '58.160.789/0001-28', 'TAG', 8995.30, '2026-06-10', NULL, 'em_transito');
