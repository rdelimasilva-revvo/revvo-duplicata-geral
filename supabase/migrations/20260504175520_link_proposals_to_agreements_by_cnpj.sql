/*
  # Link agreement proposals to commercial agreements by supplier CNPJ

  1. Schema changes
    - Add `origin_cnpj` text column to `agreement_proposals` (default '') so we can match
      a proposal to the related commercial agreement via the supplier CNPJ.

  2. Data seeding
    - For each `commercial_agreements` row in status `pending_approval` or `in_negotiation`,
      ensure there is at least one linked `agreement_proposals` row with:
        * `origin_cnpj`  = agreement.supplier_cnpj
        * `origin_company` = agreement.supplier_name
        * status = 'pending'
      This gives both tables a shared set of companies for the demo.

  3. Notes
    - Existing proposal rows keep their `origin_cnpj` = '' (no destructive updates).
    - No RLS changes: existing policies already cover authenticated reads/writes.
*/

ALTER TABLE public.agreement_proposals
  ADD COLUMN IF NOT EXISTS origin_cnpj text NOT NULL DEFAULT '';

DO $$
DECLARE
  agr record;
  proposal_code text;
  dis_value numeric;
BEGIN
  FOR agr IN
    SELECT code, supplier_name, supplier_cnpj, total_value
    FROM public.commercial_agreements
    WHERE status IN ('pending_approval', 'in_negotiation', 'active')
      AND supplier_cnpj <> ''
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.agreement_proposals WHERE origin_cnpj = agr.supplier_cnpj
    ) THEN
      proposal_code := 'PRP-' || upper(substring(md5(agr.code), 1, 6));
      dis_value := round((agr.total_value * 0.12)::numeric, 2);
      INSERT INTO public.agreement_proposals (
        code, origin_company, origin_cnpj, title, message,
        total_original, total_discount, invoices_count,
        status, sent_at, deadline
      ) VALUES (
        proposal_code,
        agr.supplier_name,
        agr.supplier_cnpj,
        'Proposta de abatimento - ' || agr.code,
        'Proposta gerada automaticamente a partir do acordo ' || agr.code || '. Revise os abatimentos sugeridos.',
        agr.total_value,
        dis_value,
        3,
        'pending',
        now() - interval '2 days',
        now() + interval '12 days'
      )
      ON CONFLICT (code) DO NOTHING;
    END IF;
  END LOOP;
END $$;
