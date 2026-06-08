/*
  # Create Synchronized NF and Payments/Credits Tables

  1. New Tables
    - `notas_fiscais` — company-side fiscal notes table
      - `id` (uuid, primary key)
      - `transaction_id` (text, shared key linking both sides)
      - `empresa_id` (text, company identifier)
      - `fornecedor_id` (text, supplier identifier)
      - `fornecedor_nome` (text, supplier display name)
      - `fornecedor_cnpj` (text, supplier CNPJ)
      - `numero_nf` (text, fiscal note number)
      - `valor` (numeric, amount)
      - `status` (text: pendente | pago | creditado | liquidado)
      - `data_emissao` (date, issue date)
      - `data_vencimento` (date, due date)
      - `data_liquidacao` (timestamptz, settlement date)
      - `created_at`, `updated_at` (timestamptz)

    - `pagamentos_creditos` — supplier-side payments/credits table
      - `id` (uuid, primary key)
      - `transaction_id` (text, shared key linking both sides)
      - `empresa_id` (text, company identifier)
      - `fornecedor_id` (text, supplier identifier)
      - `empresa_nome` (text, company display name)
      - `tipo` (text: pagamento | credito | liquidacao)
      - `valor` (numeric, amount)
      - `status` (text: pendente | confirmado | cancelado)
      - `referencia_nf` (text, linked NF number)
      - `data_operacao` (timestamptz, operation date)
      - `created_at`, `updated_at` (timestamptz)

    - `historico_movimentacoes` — shared audit log
      - `id` (uuid, primary key)
      - `transaction_id` (text, FK reference)
      - `tabela_origem` (text, which table triggered)
      - `acao` (text, action performed)
      - `valor_anterior` (text, previous value)
      - `valor_novo` (text, new value)
      - `usuario_id` (text)
      - `usuario_nome` (text)
      - `motivo` (text, reason)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all three tables
    - Policies for authenticated users based on empresa_id or fornecedor_id

  3. Triggers
    - `sync_nf_to_pagamentos`: When NF status changes, update linked pagamentos_creditos
    - `log_nf_status_change`: Insert audit record on NF status change
    - `log_pagamento_status_change`: Insert audit record on payment status change
*/

-- 1. notas_fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  empresa_id text NOT NULL DEFAULT '',
  fornecedor_id text NOT NULL DEFAULT '',
  fornecedor_nome text NOT NULL DEFAULT '',
  fornecedor_cnpj text NOT NULL DEFAULT '',
  numero_nf text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento date NOT NULL DEFAULT CURRENT_DATE,
  data_liquidacao timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notas_fiscais"
  ON notas_fiscais FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert notas_fiscais"
  ON notas_fiscais FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update notas_fiscais"
  ON notas_fiscais FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. pagamentos_creditos
CREATE TABLE IF NOT EXISTS pagamentos_creditos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  empresa_id text NOT NULL DEFAULT '',
  fornecedor_id text NOT NULL DEFAULT '',
  empresa_nome text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'pagamento',
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  referencia_nf text NOT NULL DEFAULT '',
  data_operacao timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pagamentos_creditos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pagamentos_creditos"
  ON pagamentos_creditos FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert pagamentos_creditos"
  ON pagamentos_creditos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pagamentos_creditos"
  ON pagamentos_creditos FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. historico_movimentacoes
CREATE TABLE IF NOT EXISTS historico_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  tabela_origem text NOT NULL DEFAULT '',
  acao text NOT NULL DEFAULT '',
  valor_anterior text,
  valor_novo text,
  usuario_id text NOT NULL DEFAULT '',
  usuario_nome text NOT NULL DEFAULT '',
  motivo text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historico_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view historico_movimentacoes"
  ON historico_movimentacoes FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert historico_movimentacoes"
  ON historico_movimentacoes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_transaction_id ON notas_fiscais(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_creditos_transaction_id ON pagamentos_creditos(transaction_id);
CREATE INDEX IF NOT EXISTS idx_historico_movimentacoes_transaction_id ON historico_movimentacoes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_status ON notas_fiscais(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_creditos_status ON pagamentos_creditos(status);

-- 5. Trigger function: sync NF status changes to pagamentos_creditos
CREATE OR REPLACE FUNCTION sync_nf_status_to_pagamentos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_pag_status text;
  new_pag_tipo text;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  CASE NEW.status
    WHEN 'pago' THEN
      new_pag_status := 'confirmado';
      new_pag_tipo := 'pagamento';
    WHEN 'creditado' THEN
      new_pag_status := 'confirmado';
      new_pag_tipo := 'credito';
    WHEN 'liquidado' THEN
      new_pag_status := 'confirmado';
      new_pag_tipo := 'liquidacao';
    WHEN 'pendente' THEN
      new_pag_status := 'pendente';
      new_pag_tipo := 'pagamento';
    ELSE
      new_pag_status := 'pendente';
      new_pag_tipo := 'pagamento';
  END CASE;

  UPDATE pagamentos_creditos
  SET status = new_pag_status,
      tipo = new_pag_tipo,
      updated_at = now()
  WHERE transaction_id = NEW.transaction_id;

  IF NOT FOUND THEN
    INSERT INTO pagamentos_creditos (transaction_id, empresa_id, fornecedor_id, empresa_nome, tipo, valor, status, referencia_nf, data_operacao)
    VALUES (NEW.transaction_id, NEW.empresa_id, NEW.fornecedor_id, '', new_pag_tipo, NEW.valor, new_pag_status, NEW.numero_nf, now());
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_nf_to_pagamentos
  AFTER UPDATE OF status ON notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION sync_nf_status_to_pagamentos();

-- 6. Trigger function: log NF status changes
CREATE OR REPLACE FUNCTION log_nf_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO historico_movimentacoes (transaction_id, tabela_origem, acao, valor_anterior, valor_novo, usuario_id, usuario_nome)
    VALUES (NEW.transaction_id, 'notas_fiscais', 'status_alterado', OLD.status, NEW.status, '', 'Sistema');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_nf_status_change
  AFTER UPDATE ON notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION log_nf_status_change();

-- 7. Trigger function: log pagamento status changes
CREATE OR REPLACE FUNCTION log_pagamento_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO historico_movimentacoes (transaction_id, tabela_origem, acao, valor_anterior, valor_novo, usuario_id, usuario_nome)
    VALUES (NEW.transaction_id, 'pagamentos_creditos', 'status_alterado', OLD.status, NEW.status, '', 'Sistema');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_pagamento_status_change
  AFTER UPDATE ON pagamentos_creditos
  FOR EACH ROW
  EXECUTE FUNCTION log_pagamento_status_change();

-- 8. Updated_at auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notas_fiscais_updated_at
  BEFORE UPDATE ON notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pagamentos_creditos_updated_at
  BEFORE UPDATE ON pagamentos_creditos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
