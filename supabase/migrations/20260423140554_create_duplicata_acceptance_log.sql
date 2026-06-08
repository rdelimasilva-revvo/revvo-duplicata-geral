/*
  # Duplicata Acceptance Log

  1. New Tables
    - `duplicata_acceptance_log`
      - `id` (uuid, PK)
      - `bill_id` (text) - identificador da duplicata aceita
      - `numero_nota` (text)
      - `mercadoria_nao_recebida` (boolean) - flag marcada no modal de aceite
      - `com_ressalva` (boolean) - indica se foi aceite com ressalva de valor
      - `valor_abatimento` (numeric nullable)
      - `motivo` (text nullable)
      - `accepted_at` (timestamptz)
      - `owner_id` (uuid nullable) - null para logs demo
      - `created_at` (timestamptz)

  2. Security
    - RLS habilitado
    - Registros demo (owner_id IS NULL) visíveis/inseríveis publicamente para o protótipo
    - Usuários autenticados gerenciam os próprios registros

  3. Notas
    - Tabela append-only: usada para auditoria das manifestações de aceite da fila de análise manual
*/

CREATE TABLE IF NOT EXISTS duplicata_acceptance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id text NOT NULL,
  numero_nota text NOT NULL DEFAULT '',
  mercadoria_nao_recebida boolean NOT NULL DEFAULT false,
  com_ressalva boolean NOT NULL DEFAULT false,
  valor_abatimento numeric(14, 2),
  motivo text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_duplicata_acceptance_log_bill ON duplicata_acceptance_log(bill_id);
CREATE INDEX IF NOT EXISTS idx_duplicata_acceptance_log_owner ON duplicata_acceptance_log(owner_id);

ALTER TABLE duplicata_acceptance_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo acceptance logs viewable by anyone" ON duplicata_acceptance_log;
CREATE POLICY "Demo acceptance logs viewable by anyone"
  ON duplicata_acceptance_log FOR SELECT
  TO anon, authenticated
  USING (owner_id IS NULL);

DROP POLICY IF EXISTS "Users view own acceptance logs" ON duplicata_acceptance_log;
CREATE POLICY "Users view own acceptance logs"
  ON duplicata_acceptance_log FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Anyone can insert demo acceptance logs" ON duplicata_acceptance_log;
CREATE POLICY "Anyone can insert demo acceptance logs"
  ON duplicata_acceptance_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (owner_id IS NULL);

DROP POLICY IF EXISTS "Users insert own acceptance logs" ON duplicata_acceptance_log;
CREATE POLICY "Users insert own acceptance logs"
  ON duplicata_acceptance_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users update own acceptance logs" ON duplicata_acceptance_log;
CREATE POLICY "Users update own acceptance logs"
  ON duplicata_acceptance_log FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users delete own acceptance logs" ON duplicata_acceptance_log;
CREATE POLICY "Users delete own acceptance logs"
  ON duplicata_acceptance_log FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
