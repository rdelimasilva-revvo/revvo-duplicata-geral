/*
  # Payment Reconciliation - processor confirmation (PGTO 2 ETAPAS)

  1. Changes
    - Add `processor_confirmed` (boolean, default false) to `payment_reconciliation`
      indicating whether the payment processor confirmed the 2-step transfer.
    - Add `processor_confirmed_at` (timestamptz) to record when the confirmation
      was received.

  2. Notes
    - Data-safe operation: columns are added conditionally with defaults that
      preserve existing records.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_reconciliation' AND column_name = 'processor_confirmed'
  ) THEN
    ALTER TABLE payment_reconciliation ADD COLUMN processor_confirmed boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_reconciliation' AND column_name = 'processor_confirmed_at'
  ) THEN
    ALTER TABLE payment_reconciliation ADD COLUMN processor_confirmed_at timestamptz;
  END IF;
END $$;

UPDATE payment_reconciliation
SET processor_confirmed = true,
    processor_confirmed_at = COALESCE(processor_confirmed_at, settlement_date::timestamptz, now())
WHERE status = 'liquidado' AND processor_confirmed = false;
