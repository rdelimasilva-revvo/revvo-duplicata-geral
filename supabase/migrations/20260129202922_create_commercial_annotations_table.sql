/*
  # Create Commercial Annotations Table

  1. New Tables
    - `commercial_annotations`
      - `id` (uuid, primary key) - Unique identifier for each annotation
      - `bill_id` (text, not null) - Reference to the bill/duplicata
      - `text` (text, not null) - The annotation content
      - `created_at` (timestamptz) - When the annotation was created
      - `created_by` (uuid) - Reference to the user who created it
      - `company_id` (text) - Company identifier for multi-tenant support

  2. Security
    - Enable RLS on `commercial_annotations` table
    - Add policy for authenticated users to manage their company's annotations

  3. Indexes
    - Index on bill_id for faster lookups
    - Index on company_id for tenant filtering
*/

CREATE TABLE IF NOT EXISTS commercial_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  company_id text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commercial_annotations_bill_id ON commercial_annotations(bill_id);
CREATE INDEX IF NOT EXISTS idx_commercial_annotations_company_id ON commercial_annotations(company_id);

ALTER TABLE commercial_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view annotations from their company"
  ON commercial_annotations
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT COALESCE(raw_user_meta_data->>'company_id', id::text)
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create annotations for their company"
  ON commercial_annotations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT COALESCE(raw_user_meta_data->>'company_id', id::text)
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own annotations"
  ON commercial_annotations
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
  );