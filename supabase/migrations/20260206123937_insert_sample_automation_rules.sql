/*
  # Insert Sample Automation Rules

  1. Sample Data
    - Create a sample company for testing
    - Insert sample automation rules for the menu cards
    
  2. Notes
    - This is for demonstration purposes
    - Uses a fixed UUID for the sample company to maintain consistency
*/

-- Insert sample company if it doesn't exist
INSERT INTO company (id, name, doc_num, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Empresa Demo',
  '12345678901234',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample rules
INSERT INTO rules (name, description, company_id, rule_type_id, active, days_since_creation, value_ini, value_end, created_at, updated_at)
VALUES
  (
    'Risco Sacado II',
    'Distribuição de fornecedores programa Risco Sacado Pedrã/ Alfa',
    '11111111-1111-1111-1111-111111111111',
    1,
    true,
    1,
    1000.00,
    99999999.99,
    '2025-12-08',
    '2025-12-08'
  ),
  (
    'Manifestação de Recusa Automática - Sem Pedido de Compra',
    'Manifestação de Recusa Automática - Sem Pedido de Compra',
    '11111111-1111-1111-1111-111111111111',
    3,
    true,
    5,
    10000.00,
    15000.00,
    '2025-08-21',
    '2025-08-21'
  ),
  (
    'Escrituração I',
    'Escrituração dos ativos próprios, com fatura de valor superior a 10k.',
    '11111111-1111-1111-1111-111111111111',
    2,
    false,
    5,
    10000.01,
    9999999.99,
    '2025-07-29',
    '2025-07-29'
  ),
  (
    'CERC Fornecedor',
    'Escrituração para Fornecedores a partir do Ctas a Pagar',
    '11111111-1111-1111-1111-111111111111',
    2,
    true,
    2,
    1000.00,
    9999999.99,
    '2025-02-10',
    '2025-02-10'
  ),
  (
    'Escrituração PETRO',
    'Escrituração de recebíveis da Petrobras',
    '11111111-1111-1111-1111-111111111111',
    2,
    true,
    1,
    5000.00,
    9999999.99,
    '2025-02-10',
    '2025-02-10'
  )
ON CONFLICT DO NOTHING;