import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet, Building2, ChevronDown, ChevronRight, Loader2,
  AlertTriangle, Calendar, Coins,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
}

export interface Credito {
  id: string;
  code: string;
  fornecedor: Fornecedor;
  origin: string;
  totalValue: number;
  remainingValue: number;
  issueDate: string | null;
  expiresAt: string | null;
  status: string;
}

export interface CreditosAgrupados {
  fornecedor: Fornecedor;
  creditos: Credito[];
  subtotalTotal: number;
  subtotalRemaining: number;
}

const ORIGIN_LABEL: Record<string, string> = {
  acordo_comercial: 'Acordo Comercial',
  devolucao: 'Devolução',
  bonificacao: 'Bonificação',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

interface CreditsBySupplierListProps {
  highlightSupplierId?: string | null;
  onSelectCredit?: (credit: Credito) => void;
}

export function CreditsBySupplierList({
  highlightSupplierId,
  onSelectCredit,
}: CreditsBySupplierListProps) {
  const [credits, setCredits] = useState<Credito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSuppliers, setCollapsedSuppliers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('supplier_credits')
          .select('*')
          .order('supplier_name', { ascending: true })
          .order('issue_date', { ascending: false });
        if (fetchError) throw fetchError;
        if (cancelled) return;
        setCredits(
          (data || []).map((r: any) => ({
            id: r.id,
            code: r.code,
            fornecedor: {
              id: r.supplier_id,
              nome: r.supplier_name,
              cnpj: r.supplier_cnpj,
            },
            origin: r.origin,
            totalValue: Number(r.total_value),
            remainingValue: Number(r.remaining_value),
            issueDate: r.issue_date,
            expiresAt: r.expires_at,
            status: r.status,
          })),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar créditos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const grupos = useMemo<CreditosAgrupados[]>(() => {
    const bySupplier = new Map<string, CreditosAgrupados>();
    credits.forEach((credito) => {
      const key = credito.fornecedor.id;
      const existing = bySupplier.get(key);
      if (existing) {
        existing.creditos.push(credito);
        existing.subtotalTotal += credito.totalValue;
        existing.subtotalRemaining += credito.remainingValue;
      } else {
        bySupplier.set(key, {
          fornecedor: credito.fornecedor,
          creditos: [credito],
          subtotalTotal: credito.totalValue,
          subtotalRemaining: credito.remainingValue,
        });
      }
    });
    return Array.from(bySupplier.values()).sort((a, b) =>
      a.fornecedor.nome.localeCompare(b.fornecedor.nome, 'pt-BR'),
    );
  }, [credits]);

  const totalGeralTotal = useMemo(
    () => grupos.reduce((sum, g) => sum + g.subtotalTotal, 0),
    [grupos],
  );
  const totalGeralRemaining = useMemo(
    () => grupos.reduce((sum, g) => sum + g.subtotalRemaining, 0),
    [grupos],
  );
  const totalCreditos = useMemo(
    () => grupos.reduce((sum, g) => sum + g.creditos.length, 0),
    [grupos],
  );

  const toggleSupplier = (supplierId: string) => {
    setCollapsedSuppliers((prev) => ({ ...prev, [supplierId]: !prev[supplierId] }));
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#0070f2]" />
        <span className="text-xs text-gray-500">Carregando créditos disponíveis…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-rose-800">Não foi possível carregar os créditos</p>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (grupos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <Coins className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-600">Nenhum crédito disponível</p>
        <p className="text-xs text-gray-400 mt-1">
          Quando houver créditos elegíveis, eles aparecerão aqui agrupados por fornecedor.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#0070f2]" />
          <h2 className="text-sm font-bold text-gray-800">Créditos por Fornecedor</h2>
          <span className="text-[11px] text-gray-400">
            ({totalCreditos} {totalCreditos === 1 ? 'crédito' : 'créditos'} em {grupos.length}{' '}
            {grupos.length === 1 ? 'fornecedor' : 'fornecedores'})
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
              Saldo disponível
            </p>
            <p className="text-sm font-bold text-[#0070f2] tabular-nums">
              {formatCurrency(totalGeralRemaining)}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {grupos.map((grupo) => {
          const collapsed = !!collapsedSuppliers[grupo.fornecedor.id];
          const highlighted = highlightSupplierId === grupo.fornecedor.id;
          return (
            <div
              key={grupo.fornecedor.id}
              className={`transition-colors ${highlighted ? 'bg-[#0070f2]/5' : 'bg-white'}`}
            >
              <button
                onClick={() => toggleSupplier(grupo.fornecedor.id)}
                className="w-full px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      highlighted ? 'bg-[#0070f2]/15' : 'bg-gray-100'
                    }`}
                  >
                    <Building2
                      className={`w-4 h-4 ${
                        highlighted ? 'text-[#0070f2]' : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {grupo.fornecedor.nome}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {grupo.fornecedor.cnpj} · {grupo.creditos.length}{' '}
                      {grupo.creditos.length === 1 ? 'crédito' : 'créditos'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                      Total emitido
                    </p>
                    <p className="text-xs font-semibold text-gray-700 tabular-nums">
                      {formatCurrency(grupo.subtotalTotal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                      Subtotal disponível
                    </p>
                    <p className="text-sm font-bold text-[#0070f2] tabular-nums">
                      {formatCurrency(grupo.subtotalRemaining)}
                    </p>
                  </div>
                </div>
              </button>

              {!collapsed && (
                <div className="px-5 pb-4 pt-1">
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/60 border-b border-gray-100">
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Código
                            </th>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Origem
                            </th>
                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Validade
                            </th>
                            <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Valor Total
                            </th>
                            <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Saldo
                            </th>
                            <th className="text-center px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {grupo.creditos.map((credito) => {
                            const consumed = credito.totalValue - credito.remainingValue;
                            const pct =
                              credito.totalValue > 0
                                ? (consumed / credito.totalValue) * 100
                                : 0;
                            return (
                              <tr
                                key={credito.id}
                                onClick={() => onSelectCredit?.(credito)}
                                className={`transition-colors ${
                                  onSelectCredit
                                    ? 'hover:bg-[#0070f2]/5 cursor-pointer'
                                    : 'hover:bg-gray-50/50'
                                }`}
                              >
                                <td className="px-3 py-2.5">
                                  <span className="text-[11px] font-mono font-bold text-gray-700">
                                    {credito.code}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="text-[11px] text-gray-600">
                                    {ORIGIN_LABEL[credito.origin] || credito.origin}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  {credito.expiresAt ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 tabular-nums">
                                      <Calendar className="w-2.5 h-2.5 text-gray-400" />
                                      {format(parseISO(credito.expiresAt), 'dd/MM/yyyy')}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-gray-300">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <span className="text-[11px] font-semibold text-gray-700 tabular-nums">
                                    {formatCurrency(credito.totalValue)}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-bold text-[#0070f2] tabular-nums">
                                      {formatCurrency(credito.remainingValue)}
                                    </span>
                                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          pct >= 100
                                            ? 'bg-gray-300'
                                            : pct > 0
                                              ? 'bg-amber-400'
                                              : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.min(100, 100 - pct)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <span
                                    className={`inline-flex px-2 py-0.5 text-[9px] font-semibold rounded-full ${
                                      credito.status === 'partial'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : credito.status === 'consumed'
                                          ? 'bg-gray-50 text-gray-500 border border-gray-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}
                                  >
                                    {credito.status === 'partial'
                                      ? 'Parcial'
                                      : credito.status === 'consumed'
                                        ? 'Consumido'
                                        : 'Disponível'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-gray-50/80 border-t border-gray-200">
                            <td
                              colSpan={3}
                              className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right"
                            >
                              Subtotal {grupo.fornecedor.nome}
                            </td>
                            <td className="px-3 py-2 text-right text-[11px] font-bold text-gray-700 tabular-nums">
                              {formatCurrency(grupo.subtotalTotal)}
                            </td>
                            <td className="px-3 py-2 text-right text-xs font-bold text-[#0070f2] tabular-nums">
                              {formatCurrency(grupo.subtotalRemaining)}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-4 bg-gradient-to-r from-[#0070f2]/5 via-[#0070f2]/10 to-[#0070f2]/5 border-t-2 border-[#0070f2]/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0070f2] flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                Total Geral
              </p>
              <p className="text-[11px] text-gray-600">
                {totalCreditos} {totalCreditos === 1 ? 'crédito' : 'créditos'} ·{' '}
                {grupos.length} {grupos.length === 1 ? 'fornecedor' : 'fornecedores'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                Emitido
              </p>
              <p className="text-sm font-semibold text-gray-700 tabular-nums">
                {formatCurrency(totalGeralTotal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                Disponível
              </p>
              <p className="text-lg font-bold text-[#0070f2] tabular-nums">
                {formatCurrency(totalGeralRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
