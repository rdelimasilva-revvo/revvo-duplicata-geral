/*
  # Enhance Rules Table with Detailed Fields
  
  1. Changes
    - Add new columns to `rules` table for complete rule configuration
      - `company_code` (text[]) - Array of company codes
      - `asset_origin_id` (int) - Reference to asset origin
      - `asset_type_id` (int) - Type of asset
      - `bkpg_channel_id` (int) - Bookkeeping channel
      - `output_channel_id` (int) - Output channel for processing
      - `bank_id` (int[]) - Array of bank IDs
      - `supplier` (text[]) - Array of supplier IDs
      - `customer` (text[]) - Array of customer IDs
      - `certf_digital` (text) - Digital certificate
      - `days_until_due_date_ini` (int) - Days until due date start
      - `days_until_due_date_end` (int) - Days until due date end
      - `creator` (uuid) - User who created the rule
    
    - Create supporting tables if they don't exist:
      - `asset_origin` - Origins of assets (Supplier, Own)
      - `bkpg_channel` - Bookkeeping channels (ERP, API, etc)
      - `output_channel` - Output channels for processing
      - `banks` - Available banks
      - `supplier` - Suppliers list
      - `customer` - Customers list
  
  2. Sample Data
    - Populate supporting tables with example data
    - Update "Manifestação de Recusa Automática - Sem Pedido de Compra" rule with complete details
*/

-- Create asset_origin table
CREATE TABLE IF NOT EXISTS asset_origin (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bkpg_channel table
CREATE TABLE IF NOT EXISTS bkpg_channel (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create output_channel table
CREATE TABLE IF NOT EXISTS output_channel (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create banks table
CREATE TABLE IF NOT EXISTS banks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create supplier table
CREATE TABLE IF NOT EXISTS supplier (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT,
  company_id INT,
  corporate_group_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create customer table
CREATE TABLE IF NOT EXISTS customer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT,
  company_id INT,
  corporate_group_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create company table with required columns
DO $$
BEGIN
  -- Add company_code column to company table if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company' AND column_name = 'company_code'
  ) THEN
    ALTER TABLE company ADD COLUMN company_code TEXT;
  END IF;

  -- Add corporate_group_id column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company' AND column_name = 'corporate_group_id'
  ) THEN
    ALTER TABLE company ADD COLUMN corporate_group_id UUID;
  END IF;

  -- Add status column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company' AND column_name = 'status'
  ) THEN
    ALTER TABLE company ADD COLUMN status TEXT;
  END IF;
END $$;

-- Add new columns to rules table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'company_code'
  ) THEN
    ALTER TABLE rules ADD COLUMN company_code TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'asset_origin_id'
  ) THEN
    ALTER TABLE rules ADD COLUMN asset_origin_id INT REFERENCES asset_origin(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'asset_type_id'
  ) THEN
    ALTER TABLE rules ADD COLUMN asset_type_id INT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'bkpg_channel_id'
  ) THEN
    ALTER TABLE rules ADD COLUMN bkpg_channel_id INT REFERENCES bkpg_channel(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'output_channel_id'
  ) THEN
    ALTER TABLE rules ADD COLUMN output_channel_id INT REFERENCES output_channel(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'bank_id'
  ) THEN
    ALTER TABLE rules ADD COLUMN bank_id INT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'supplier'
  ) THEN
    ALTER TABLE rules ADD COLUMN supplier TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'customer'
  ) THEN
    ALTER TABLE rules ADD COLUMN customer TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'certf_digital'
  ) THEN
    ALTER TABLE rules ADD COLUMN certf_digital TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'days_until_due_date_ini'
  ) THEN
    ALTER TABLE rules ADD COLUMN days_until_due_date_ini INT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'days_until_due_date_end'
  ) THEN
    ALTER TABLE rules ADD COLUMN days_until_due_date_end INT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rules' AND column_name = 'creator'
  ) THEN
    ALTER TABLE rules ADD COLUMN creator UUID;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE asset_origin ENABLE ROW LEVEL SECURITY;
ALTER TABLE bkpg_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE output_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for new tables (read-only for authenticated users)
CREATE POLICY "Authenticated users can read asset origins"
  ON asset_origin FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read bkpg channels"
  ON bkpg_channel FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read output channels"
  ON output_channel FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read banks"
  ON banks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read suppliers"
  ON supplier FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read customers"
  ON customer FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample data for asset origins
INSERT INTO asset_origin (id, name) VALUES
  (1, 'Ativo próprio'),
  (2, 'Fornecedores')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for bookkeeping channels
INSERT INTO bkpg_channel (id, name) VALUES
  (1, 'ERP'),
  (2, 'API'),
  (3, 'Manual')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for output channels
INSERT INTO output_channel (id, name) VALUES
  (1, 'Canal 01'),
  (2, 'Canal 02')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for banks
INSERT INTO banks (id, name) VALUES
  (1, 'CEF'),
  (2, 'Banco do Brasil'),
  (3, 'Safra'),
  (4, 'Alfa'),
  (5, 'Daycoval'),
  (6, 'Itaú')
ON CONFLICT (id) DO NOTHING;

-- Insert sample companies (filiais)
INSERT INTO company (id, name, doc_num, company_code, created_at, updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Silimed - Filial 4', '11111111000101', 'FIL4', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Silimed - Filial 3', '11111111000102', 'FIL3', now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'Silimed - Filial 2', '11111111000103', 'FIL2', now(), now()),
  ('55555555-5555-5555-5555-555555555555', 'Silimed - Filial 7', '11111111000104', 'FIL7', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert sample suppliers
INSERT INTO supplier (id, name, document, company_id, created_at) VALUES
  ('S001', 'ELO Tecnologia', '12345678000190', 1, now()),
  ('S002', 'Fornecedor ABC', '98765432000110', 1, now()),
  ('S003', 'SOW', '11122233000144', 1, now())
ON CONFLICT (id) DO NOTHING;

-- Update the "Manifestação de Recusa Automática - Sem Pedido de Compra" rule with complete details
UPDATE rules
SET
  company_code = ARRAY['FIL4', 'FIL3', 'FIL2', 'FIL7'],
  asset_origin_id = 2,
  asset_type_id = 1,
  bkpg_channel_id = 1,
  supplier = ARRAY['S001', 'S002', 'S003'],
  rule_type_id = 1,
  updated_at = now()
WHERE name = 'Manifestação de Recusa Automática - Sem Pedido de Compra';