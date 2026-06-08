/*
  # Extend payment reconciliation with error status

  1. Changes
    - Add `error_reason` (text, nullable) column for failed reconciliations
    - Allow 'erro' value in status column
    - Seed a few rows with varied statuses including errors

  2. Security
    - RLS already enabled on table, existing policies remain
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_reconciliation' AND column_name = 'error_reason'
  ) THEN
    ALTER TABLE payment_reconciliation ADD COLUMN error_reason text;
  END IF;
END $$;

INSERT INTO payment_reconciliation
  (nf_number, duplicata_id, original_recipient_name, original_recipient_cnpj, new_recipient_name, new_recipient_cnpj, registradora, amount, due_date, settlement_date, status, error_reason)
VALUES
  ('000126010', 'DUP-26010-01', 'Banco Itaú S.A.', '60.701.190/0001-04', 'Banco Safra S.A.', '58.160.789/0001-28', 'CERC', 54210.00, '2026-05-22', NULL, 'erro', 'Divergência de CNPJ do recebedor na registradora CERC. O domicílio informado não está ativo para recebimento de duplicatas escriturais.'),
  ('000126112', 'DUP-26112-01', 'Banco Bradesco S.A.', '60.746.948/0001-12', 'Banco BTG Pactual', '30.306.294/0001-45', 'TAG', 12300.00, '2026-05-24', NULL, 'erro', 'Falha de comunicação com a TAG: timeout ao confirmar a vinculação do novo domicílio. Nova tentativa agendada.'),
  ('000126230', 'DUP-26230-01', 'Banco do Brasil S.A.', '00.000.000/0001-91', 'Banco Inter S.A.', '00.416.968/0001-01', NULL, 7890.50, '2026-05-26', '2026-05-26', 'liquidado', NULL);
