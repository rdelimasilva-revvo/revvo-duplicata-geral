/*
  # Central de Documentos — agreement_documents

  1. New Tables
    - `agreement_documents`
      - `id` (uuid, primary key)
      - `proposal_code` (text) — vincula ao agreement_proposals.code
      - `name` (text) — nome do arquivo exibido
      - `kind` (text) — tipo: contract | extrato | nf | audit_log | draft | other
      - `size_bytes` (bigint) — tamanho em bytes (mock/real)
      - `visibility` (text) — 'both' (empresa + fornecedor) | 'company_only' (rascunho, auditoria)
      - `status` (text) — 'final' | 'draft'
      - `is_signed` (boolean) — se o documento está assinado
      - `generated_at` (timestamptz)
      - `created_by` (uuid, nullable, referencia auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS.
    - SELECT: fornecedor (qualquer authenticated) enxerga apenas documentos com
      visibility='both' AND status='final' AND is_signed=true.
      Empresa (super_admin/admin via user_profile.role) enxerga tudo.
    - INSERT/UPDATE/DELETE: restritos a usuários com role super_admin ou admin.

  3. Notes
    - `kind` e `visibility`/`status` usam CHECK constraints para manter integridade.
*/

CREATE TABLE IF NOT EXISTS public.agreement_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code text NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'other'
    CHECK (kind IN ('contract','extrato','nf','audit_log','draft','other')),
  size_bytes bigint NOT NULL DEFAULT 0,
  visibility text NOT NULL DEFAULT 'both'
    CHECK (visibility IN ('both','company_only')),
  status text NOT NULL DEFAULT 'final'
    CHECK (status IN ('final','draft')),
  is_signed boolean NOT NULL DEFAULT true,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agreement_documents_proposal_code_idx
  ON public.agreement_documents(proposal_code);

ALTER TABLE public.agreement_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='agreement_documents'
      AND policyname='Supplier reads finalized shared documents'
  ) THEN
    CREATE POLICY "Supplier reads finalized shared documents"
      ON public.agreement_documents
      FOR SELECT
      TO authenticated
      USING (
        visibility = 'both' AND status = 'final' AND is_signed = true
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='agreement_documents'
      AND policyname='Company admins read all agreement documents'
  ) THEN
    CREATE POLICY "Company admins read all agreement documents"
      ON public.agreement_documents
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profile up
          WHERE up.id = auth.uid()
            AND up.role IN ('super_admin','admin')
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='agreement_documents'
      AND policyname='Company admins insert agreement documents'
  ) THEN
    CREATE POLICY "Company admins insert agreement documents"
      ON public.agreement_documents
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profile up
          WHERE up.id = auth.uid()
            AND up.role IN ('super_admin','admin')
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='agreement_documents'
      AND policyname='Company admins update agreement documents'
  ) THEN
    CREATE POLICY "Company admins update agreement documents"
      ON public.agreement_documents
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profile up
          WHERE up.id = auth.uid()
            AND up.role IN ('super_admin','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profile up
          WHERE up.id = auth.uid()
            AND up.role IN ('super_admin','admin')
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='agreement_documents'
      AND policyname='Company admins delete agreement documents'
  ) THEN
    CREATE POLICY "Company admins delete agreement documents"
      ON public.agreement_documents
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profile up
          WHERE up.id = auth.uid()
            AND up.role IN ('super_admin','admin')
        )
      );
  END IF;
END $$;
