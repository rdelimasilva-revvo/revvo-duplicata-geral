/*
  # Canal de eventos entre microfrontends

  ## Objetivo
  Estabelecer uma fila persistente e em tempo real para comunicação bidirecional
  entre os microfrontends "Acordos Comerciais" (lado Empresa) e
  "Revisão de Proposta" (lado Fornecedor). Cada evento publicado fica
  persistido em Supabase e é distribuído via Realtime (broadcast) para qualquer
  MFE que esteja inscrito.

  ## Tabela criada
  - `proposal_channel_events`
    - `id` (uuid PK)
    - `proposal_code` (text) — código humano da proposta (ex.: IDT428)
    - `event_type` (text) — tipo do evento (proposal:created, proposal:viewed, ...)
    - `payload` (jsonb) — payload tipado do evento
    - `source` (text) — origem do evento ('acordos' | 'revisao')
    - `created_by` (uuid, nullable) — autor do evento
    - `created_at` (timestamptz)

  ## Segurança
  - RLS habilitado.
  - SELECT/INSERT permitidos a qualquer usuário autenticado (canal interno
    entre microfrontends do mesmo tenant).
  - Sem UPDATE/DELETE público — eventos são imutáveis.

  ## Índice
  - (proposal_code, created_at desc) para leitura rápida do histórico por proposta.
*/

CREATE TABLE IF NOT EXISTS proposal_channel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_channel_events_code_time
  ON proposal_channel_events (proposal_code, created_at DESC);

ALTER TABLE proposal_channel_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'proposal_channel_events'
      AND policyname = 'Authenticated can read events'
  ) THEN
    CREATE POLICY "Authenticated can read events"
      ON proposal_channel_events
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'proposal_channel_events'
      AND policyname = 'Authenticated can publish events'
  ) THEN
    CREATE POLICY "Authenticated can publish events"
      ON proposal_channel_events
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE proposal_channel_events;
