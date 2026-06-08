/*
  # Add new rule types for Automacoes

  1. New Data
    - `rule_type` table: Adding 5 new rule types
      - Conciliacao Bancaria (Bank Reconciliation)
      - Gestao de Domicilio (Domicile Management)
      - Notificacao de Vencimento (Due Date Notification)
      - Aprovacao Automatica (Automatic Approval)
      - Classificacao Contabil (Accounting Classification)

  2. Notes
    - Existing rule types (ids 1-3) are preserved
    - New types start from id 4
*/

INSERT INTO rule_type (name, description, created_at, updated_at)
SELECT name, description, now(), now()
FROM (VALUES
  ('Conciliação Bancária', 'Regras para conciliação automática de extratos bancários'),
  ('Gestão de Domicílio', 'Regras para gestão automática de domicílio bancário'),
  ('Notificação de Vencimento', 'Regras para envio automático de notificações de vencimento'),
  ('Aprovação Automática', 'Regras para aprovação automática de documentos e transações'),
  ('Classificação Contábil', 'Regras para classificação contábil automática de lançamentos')
) AS new_types(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM rule_type rt WHERE rt.name = new_types.name
);
