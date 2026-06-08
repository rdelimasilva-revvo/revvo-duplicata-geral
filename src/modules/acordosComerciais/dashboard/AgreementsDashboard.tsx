import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Plus, AlertCircle, Scale, AlertTriangle, X, ArrowLeftRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ConflictResolutionDrawer, type ConflictTarget } from '../components/ConflictResolutionDrawer';
import { formatCurrency, formatDate } from '../utils';
import { useAgreementsDashboardStore } from './store';
import {
  useAgreementsData,
  useFilteredAgreements,
  useKpis,
  useSuppliers,
  useTimeSeries,
} from './hooks';
import { KpiCards } from './components/KpiCards';
import { ContractTypeChart, EvolutionChart } from './components/Charts';
import { AgreementsTable } from './components/AgreementsTable';
import { AgreementDrawer } from './components/AgreementDrawer';
import { AllCreditsList } from '../components/AllCreditsList';
import type { AgreementRecord, PipelineStatus } from './types';

interface AgreementsDashboardProps {
  onNewProposal: () => void;
  onVincularCredito?: () => void;
  onOpenReview?: (proposalCode: string) => void;
  onOpenSync?: () => void;
  onBack?: () => void;
}

export function AgreementsDashboard({ onNewProposal, onVincularCredito, onOpenReview, onOpenSync, onBack }: AgreementsDashboardProps) {
  const { loading, error, reload } = useAgreementsData();
  const allAgreements = useAgreementsDashboardStore((s) => s.agreements);
  const updateStatus = useAgreementsDashboardStore((s) => s.updateStatus);

  const filteredAgreements = useFilteredAgreements();
  const kpis = useKpis(allAgreements);
  const timeSeries = useTimeSeries(allAgreements);
  const suppliers = useSuppliers(allAgreements);

  const [selectedAgreement, setSelectedAgreement] = useState<AgreementRecord | null>(null);
  const [conflicts, setConflicts] = useState<ConflictListItem[]>([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [showConflictsPanel, setShowConflictsPanel] = useState(false);
  const [conflictTarget, setConflictTarget] = useState<ConflictTarget | null>(null);

  const loadConflicts = React.useCallback(async () => {
    setLoadingConflicts(true);
    const { data } = await supabase
      .from('proposal_credit_links')
      .select('id, proposal_code, invoice_id, credit_label, amount, status, created_at')
      .eq('status', 'contested')
      .order('created_at', { ascending: false });
    const items: ConflictListItem[] = (data ?? []).map((row) => {
      const agreement = allAgreements.find((a) => a.code === row.proposal_code);
      return {
        linkId: row.id as string,
        proposalCode: row.proposal_code as string,
        invoiceId: row.invoice_id as string,
        creditLabel: (row.credit_label as string) ?? '',
        amount: Number(row.amount ?? 0),
        createdAt: row.created_at as string,
        supplierName: agreement?.supplierName ?? row.proposal_code,
        supplierCnpj: agreement?.supplierCnpj,
      };
    });
    setConflicts(items);
    setLoadingConflicts(false);
  }, [allAgreements]);

  useEffect(() => {
    loadConflicts();
  }, [loadConflicts]);

  const handleStatusChange = async (id: string, status: PipelineStatus) => {
    await updateStatus(id, status);
    setSelectedAgreement((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  if (loading && allAgreements.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#F5F6F7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0070f2]" />
        <p className="text-sm text-gray-500 mt-3">Carregando acordos…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F6F7]">
      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200 flex items-center justify-center transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Acordos Comerciais</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Acompanhe o andamento dos acordos, métricas e tendências do período
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => reload()}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => setShowConflictsPanel(true)}
              className={`relative flex items-center gap-2 px-3 py-2 text-xs font-semibold border rounded-lg transition-colors ${
                conflicts.length > 0
                  ? 'text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100'
                  : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
              }`}
              title="Ver conflitos em aberto"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Conflitos
              {conflicts.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                  {conflicts.length}
                </span>
              )}
            </button>
            {onOpenSync && (
              <button
                onClick={onOpenSync}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                NFs e Pagamentos
              </button>
            )}
            {onVincularCredito && (
              <button
                onClick={onVincularCredito}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0070f2] bg-[#0070f2]/10 border border-[#0070f2]/20 rounded-lg hover:bg-[#0070f2]/15 transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                Vincular Crédito
              </button>
            )}
            <button
              onClick={onNewProposal}
              className="flex items-center gap-2 px-4 py-2 bg-[#0070f2] text-white text-sm font-semibold rounded-lg hover:bg-[#005bc4] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Proposta
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="text-xs text-rose-700">
              Erro ao carregar acordos: <span className="font-semibold">{error}</span>
            </p>
            <button
              onClick={() => reload()}
              className="ml-auto text-xs font-semibold text-rose-700 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <KpiCards metrics={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EvolutionChart data={timeSeries} />
          </div>
          <ContractTypeChart agreements={allAgreements} />
        </div>

        <AllCreditsList />

        <AgreementsTable
          agreements={filteredAgreements}
          suppliers={suppliers}
          onSelect={setSelectedAgreement}
          onOpenReview={onOpenReview}
        />
      </div>

      <AgreementDrawer
        agreement={selectedAgreement}
        onClose={() => setSelectedAgreement(null)}
        onChangeStatus={handleStatusChange}
        onOpenReview={onOpenReview}
      />

      <ConflictsPanel
        open={showConflictsPanel}
        loading={loadingConflicts}
        items={conflicts}
        onClose={() => setShowConflictsPanel(false)}
        onSelect={(item) => {
          setConflictTarget({
            linkId: item.linkId,
            proposalCode: item.proposalCode,
            invoiceId: item.invoiceId,
            invoiceNumber: item.invoiceId,
            creditLabel: item.creditLabel,
            originalAmount: item.amount,
            supplierName: item.supplierName,
            supplierCnpj: item.supplierCnpj,
            createdAt: item.createdAt,
          });
        }}
      />

      <ConflictResolutionDrawer
        target={conflictTarget}
        onClose={() => setConflictTarget(null)}
        onResolved={() => {
          loadConflicts();
        }}
      />
    </div>
  );
}

interface ConflictListItem {
  linkId: string;
  proposalCode: string;
  invoiceId: string;
  creditLabel: string;
  amount: number;
  createdAt: string;
  supplierName: string;
  supplierCnpj?: string;
}

function ConflictsPanel({
  open,
  loading,
  items,
  onClose,
  onSelect,
}: {
  open: boolean;
  loading: boolean;
  items: ConflictListItem[];
  onClose: () => void;
  onSelect: (item: ConflictListItem) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-150"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[560px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 fade-in duration-200"
      >
        <header className="px-6 py-5 border-b border-slate-200 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Conflitos em aberto</h2>
            <p className="text-xs text-slate-500 mt-1">
              {items.length === 0
                ? 'Nenhuma contestação pendente no momento.'
                : `${items.length} ${items.length === 1 ? 'crédito contestado' : 'créditos contestados'} aguardando resolução.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Tudo sob controle</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
                Não há conflitos pendentes nos acordos em andamento.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.linkId}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="w-full text-left rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-colors p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.supplierName}</p>
                        {item.supplierCnpj && (
                          <p className="text-[11px] text-slate-500 font-mono">{item.supplierCnpj}</p>
                        )}
                        <p className="text-[11px] text-slate-600 mt-2 truncate">
                          {item.creditLabel} · Proposta {item.proposalCode}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                          Em Conflito
                        </span>
                        <span className="text-sm font-bold text-slate-900 tabular-nums mt-1">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

