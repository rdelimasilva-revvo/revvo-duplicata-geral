/*
  # Payment Reconciliation Enterprise fields

  1. Changes
    - Add bank detail columns for origin/destination (bank name, agency, account)
    - Add gross_value and net_value columns (fluxo de valor)
    - Add issue_date column (emissão)
    - Add registradora_id (ID do registro na CERC/TAG/B3)
    - Add error_code column
    - Add error_suggestion column
    - Allow new status values: 'falha_registradora' (keeping existing 'erro' as liquidation error)

  2. Data
    - Seed existing rows with bank detail info and enterprise data
    - Insert new rows demonstrating each status type
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='original_bank_name') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN original_bank_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='original_agency') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN original_agency text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='original_account') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN original_account text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='new_bank_name') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN new_bank_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='new_agency') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN new_agency text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='new_account') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN new_account text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='gross_value') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN gross_value numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='net_value') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN net_value numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='issue_date') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN issue_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='registradora_id') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN registradora_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='error_code') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN error_code text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_reconciliation' AND column_name='error_suggestion') THEN
    ALTER TABLE payment_reconciliation ADD COLUMN error_suggestion text;
  END IF;
END $$;

UPDATE payment_reconciliation SET
  original_bank_name = split_part(original_recipient_name, ' ', 1) || ' ' || COALESCE(split_part(original_recipient_name, ' ', 2), ''),
  original_agency = '0001',
  original_account = '12345-6',
  new_bank_name = split_part(new_recipient_name, ' ', 1) || ' ' || COALESCE(split_part(new_recipient_name, ' ', 2), ''),
  new_agency = '0042',
  new_account = '98765-4',
  gross_value = amount,
  net_value = round(amount * 0.97, 2),
  issue_date = COALESCE(issue_date, (due_date - interval '30 days')::date),
  registradora_id = CASE WHEN registradora IS NOT NULL THEN upper(registradora) || '-' || substr(md5(id::text), 1, 8) ELSE NULL END
WHERE original_bank_name = '' OR original_bank_name IS NULL;

UPDATE payment_reconciliation SET
  error_code = 'REG-4281',
  error_suggestion = 'Confirmar com o fornecedor o CNPJ ativo do novo domicílio bancário e reenviar o aditivo à CERC.'
WHERE status = 'erro' AND error_code IS NULL;

INSERT INTO payment_reconciliation
  (nf_number, duplicata_id, original_recipient_name, original_recipient_cnpj, new_recipient_name, new_recipient_cnpj,
   original_bank_name, original_agency, original_account, new_bank_name, new_agency, new_account,
   registradora, registradora_id, amount, gross_value, net_value, issue_date, due_date, settlement_date, status, error_reason, error_code, error_suggestion)
VALUES
  ('000127001', 'DUP-27001-01', 'Banco Itaú S.A.', '60.701.190/0001-04', 'Banco Bradesco S.A.', '60.746.948/0001-12',
   'Banco Itaú', '0341', '45678-9', 'Banco Bradesco', '0237', '11223-4',
   'CERC', 'CERC-8A91F203', 22400.00, 22400.00, 21728.00, '2026-04-10', '2026-05-30', NULL, 'falha_registradora',
   'Registro rejeitado pela CERC por inconsistência de lastro.',
   'CERC-9001',
   'Ajustar o lastro na CERC informando a chave correta da nota fiscal e reenviar o registro em até 48h.'),
  ('000127118', 'DUP-27118-01', 'Banco Santander', '90.400.888/0001-42', 'Banco Safra', '58.160.789/0001-28',
   'Santander', '0033', '55401-2', 'Safra', '0422', '77123-8',
   'TAG', 'TAG-5C4E1F08', 15750.50, 15750.50, 15277.98, '2026-04-22', '2026-06-02', NULL, 'pendente',
   NULL, NULL, NULL),
  ('000127204', 'DUP-27204-01', 'Caixa Econômica Federal', '00.360.305/0001-04', 'Banco Inter', '00.416.968/0001-01',
   'CEF', '0104', '00321-7', 'Inter', '0001', '99001-5',
   'B3', 'B3-7F120983', 48900.00, 48900.00, 47433.00, '2026-04-15', '2026-05-18', NULL, 'erro',
   'Liquidação rejeitada pelo banco destino: conta encerrada.',
   'BCO-422-CONTA-ENC',
   'Solicitar ao fornecedor atualização do domicílio bancário com conta ativa e iniciar novo fluxo de troca.');
