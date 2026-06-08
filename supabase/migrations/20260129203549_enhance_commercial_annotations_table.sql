/*
  # Enhance Commercial Annotations Table

  1. Schema Changes
    - Add `problem_type` column (text, not null) - Type of problem being reported
    - Add `attachments` column (jsonb) - Array of file attachment metadata
    - Add `updated_at` column (timestamptz) - Last update timestamp

  2. Problem Types
    - entrega: Delivery issues
    - nota_fiscal: Invoice issues
    - duplicata: Bill issues
    - pagamento: Payment issues
    - outro: Other issues

  3. Attachments Structure
    - Each attachment: { name: string, size: number, type: string, url: string }

  4. Indexes
    - Index on problem_type for filtering by issue category
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commercial_annotations' AND column_name = 'problem_type'
  ) THEN
    ALTER TABLE commercial_annotations ADD COLUMN problem_type text NOT NULL DEFAULT 'outro';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commercial_annotations' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE commercial_annotations ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commercial_annotations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE commercial_annotations ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_commercial_annotations_problem_type ON commercial_annotations(problem_type);

CREATE OR REPLACE FUNCTION update_commercial_annotations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_commercial_annotations_updated_at ON commercial_annotations;

CREATE TRIGGER trigger_update_commercial_annotations_updated_at
  BEFORE UPDATE ON commercial_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_commercial_annotations_updated_at();

CREATE POLICY "Users can update their own annotations"
  ON commercial_annotations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());