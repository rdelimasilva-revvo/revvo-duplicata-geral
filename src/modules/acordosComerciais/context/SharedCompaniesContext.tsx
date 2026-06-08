import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface SharedCompany {
  cnpj: string;
  name: string;
  agreementsCount: number;
  pendingProposalsCount: number;
  approvedProposalsCount: number;
  pendingProposalCodes: string[];
  approvedProposalCodes: string[];
  refusedProposalCodes: string[];
  contestedProposalCodes: string[];
  agreementsTotalValue: number;
  availableCredit: number;
  openInvoices: number;
}

interface SharedCompaniesState {
  companies: SharedCompany[];
  byCnpj: Map<string, SharedCompany>;
  loading: boolean;
  reload: () => Promise<void>;
}

const Ctx = createContext<SharedCompaniesState | null>(null);

async function fetchSharedCompanies(): Promise<SharedCompany[]> {
  const [agreementsRes, proposalsRes, creditsRes, invoicesRes] = await Promise.all([
    supabase
      .from('commercial_agreements')
      .select('supplier_cnpj, supplier_name, total_value, status'),
    supabase
      .from('agreement_proposals')
      .select('code, origin_cnpj, origin_company, status'),
    supabase
      .from('supplier_credits')
      .select('supplier_cnpj, remaining_value, status'),
    supabase
      .from('eligible_invoices')
      .select('supplier_id, open_balance, status'),
  ]);

  const byCnpj = new Map<string, SharedCompany>();
  const upsert = (cnpj: string, name: string): SharedCompany => {
    const normalized = cnpj?.trim() ?? '';
    if (!normalized) {
      return {
        cnpj: '',
        name,
        agreementsCount: 0,
        pendingProposalsCount: 0,
        approvedProposalsCount: 0,
        pendingProposalCodes: [],
        approvedProposalCodes: [],
        refusedProposalCodes: [],
        contestedProposalCodes: [],
        agreementsTotalValue: 0,
        availableCredit: 0,
        openInvoices: 0,
      };
    }
    let existing = byCnpj.get(normalized);
    if (!existing) {
      existing = {
        cnpj: normalized,
        name,
        agreementsCount: 0,
        pendingProposalsCount: 0,
        approvedProposalsCount: 0,
        pendingProposalCodes: [],
        approvedProposalCodes: [],
        refusedProposalCodes: [],
        contestedProposalCodes: [],
        agreementsTotalValue: 0,
        availableCredit: 0,
        openInvoices: 0,
      };
      byCnpj.set(normalized, existing);
    }
    if (!existing.name && name) existing.name = name;
    return existing;
  };

  for (const row of agreementsRes.data ?? []) {
    const c = upsert(row.supplier_cnpj ?? '', row.supplier_name ?? '');
    if (!c.cnpj) continue;
    c.agreementsCount += 1;
    c.agreementsTotalValue += Number(row.total_value ?? 0);
  }

  for (const row of proposalsRes.data ?? []) {
    const c = upsert(row.origin_cnpj ?? '', row.origin_company ?? '');
    if (!c.cnpj) continue;
    if (row.status === 'pending') {
      c.pendingProposalsCount += 1;
      c.pendingProposalCodes.push(row.code);
    } else if (row.status === 'approved') {
      c.approvedProposalsCount += 1;
      c.approvedProposalCodes.push(row.code);
    } else if (row.status === 'refused') {
      c.refusedProposalCodes.push(row.code);
    } else if (row.status === 'contested') {
      c.contestedProposalCodes.push(row.code);
    }
  }

  for (const row of creditsRes.data ?? []) {
    const c = byCnpj.get((row as { supplier_cnpj?: string }).supplier_cnpj ?? '');
    if (!c) continue;
    if (row.status === 'available') {
      c.availableCredit += Number(row.remaining_value ?? 0);
    }
  }

  for (const row of invoicesRes.data ?? []) {
    const cnpj = (row as { supplier_id?: string }).supplier_id ?? '';
    const c = byCnpj.get(cnpj);
    if (!c) continue;
    if (row.status === 'livre' || row.status === 'available') {
      c.openInvoices += Number(row.open_balance ?? 0);
    }
  }

  return Array.from(byCnpj.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function SharedCompaniesProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<SharedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchSharedCompanies();
      setCompanies(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const byCnpj = useMemo(() => {
    const m = new Map<string, SharedCompany>();
    for (const c of companies) m.set(c.cnpj, c);
    return m;
  }, [companies]);

  const value = useMemo<SharedCompaniesState>(
    () => ({ companies, byCnpj, loading, reload }),
    [companies, byCnpj, loading, reload],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSharedCompanies(): SharedCompaniesState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      companies: [],
      byCnpj: new Map(),
      loading: false,
      reload: async () => {},
    };
  }
  return ctx;
}
