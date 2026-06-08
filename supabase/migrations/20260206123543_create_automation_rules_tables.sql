/*
  # Create Automation Rules Tables

  1. New Tables
    - `rule_type`
      - `id` (int, primary key, auto-increment)
      - `name` (text) - Nome do tipo de regra
      - `description` (text, nullable) - Descrição do tipo
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `rules`
      - `id` (int, primary key, auto-increment)
      - `name` (text) - Nome da regra
      - `description` (text, nullable) - Descrição da regra
      - `company_id` (uuid) - ID da empresa
      - `rule_type_id` (int) - Referência ao tipo de regra
      - `active` (boolean) - Status ativo/inativo
      - `days_since_creation` (int) - Dias desde criação
      - `value_ini` (numeric) - Valor inicial
      - `value_end` (numeric) - Valor final
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their company's rules
*/

-- Create rule_type table
CREATE TABLE IF NOT EXISTS rule_type (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  rule_type_id INT NOT NULL REFERENCES rule_type(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  days_since_creation INT DEFAULT 0,
  value_ini NUMERIC(15,2) DEFAULT 0,
  value_end NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE rule_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rule_type (read-only for authenticated users)
CREATE POLICY "Authenticated users can read rule types"
  ON rule_type FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for rules
CREATE POLICY "Users can read their company rules"
  ON rules FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profile WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rules for their company"
  ON rules FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profile WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company rules"
  ON rules FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profile WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profile WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company rules"
  ON rules FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profile WHERE id = auth.uid()
    )
  );

-- Insert default rule types
INSERT INTO rule_type (name, description) VALUES
  ('Risco Sacado', 'Regras relacionadas ao programa Risco Sacado'),
  ('Escrituração de duplicatas', 'Regras para escrituração automática de duplicatas'),
  ('Manifestação', 'Regras para manifestação automática de duplicatas')
ON CONFLICT DO NOTHING;