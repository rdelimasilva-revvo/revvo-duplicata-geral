import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  MagnifyingGlass,
  Check,
  CheckCircle as CheckCircleIcon,
  Export as ExportIcon,
  X as XIcon,
  FileArrowDown,
  Link as LinkIcon,
  ClockCounterClockwise,
  Funnel,
  Warning,
} from '@phosphor-icons/react';
import { useAgreementsDashboardStore } from '../store';
import {
  CONTRACT_TYPE_LABEL,
  PIPELINE_CONFIG,
  PIPELINE_ORDER,
  RISK_CONFIG,
  type AgreementRecord,
  type PipelineStatus,
} from '../types';
import { formatCurrency, formatDate } from '../../utils';
import { useToast } from '@/context/ToastContext';
import { useCreditLinksStore } from '../../creditLinks/store';
import { useSharedCompanies } from '../../context/SharedCompaniesContext';

interface AgreementsTableProps {
  agreements: AgreementRecord[];
  suppliers: string[];
  onSelect: (agreement: AgreementRecord) => void;
  onOpenReview?: (proposalCode: string) => void;
}

type QuickFilter = 'all' | 'pending' | 'approved' | 'with_credit';

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'approved', label: 'Aprovados' },
  { id: 'with_credit', label: 'Com Crédito' },
];

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCsv(value: string | number | null | undefined) {
  const str = String(value ?? '');
  if (str.includes('"') || str.includes(';') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildAuditCsv(rows: AgreementRecord[], totals: { bruto: number; abat: number; liquido: number }) {
  const header = [
    'Codigo',
    'Titulo',
    'Fornecedor',
    'CNPJ Fornecedor',
    'Sacado',
    'Estado',
    'Tipo',
    'Valor Bruto',
    'Abatimentos',
    'Valor Liquido',
    'Risco',
    'Atualizado em',
  ].join(';');
  const lines = rows.map((a) =>
    [
      a.code,
      a.title,
      a.supplierName,
      a.supplierCnpj,
      a.sacadoName,
      PIPELINE_CONFIG[a.status].label,
      CONTRACT_TYPE_LABEL[a.contractType],
      a.totalValue.toFixed(2).replace('.', ','),
      '0,00',
      a.totalValue.toFixed(2).replace('.', ','),
      RISK_CONFIG[a.riskLevel].label,
      formatDate(a.updatedAt, 'dd/MM/yyyy HH:mm'),
    ]
      .map(escapeCsv)
      .join(';'),
  );
  const totalsLine = [
    'TOTAIS',
    '',
    '',
    '',
    '',
    '',
    '',
    totals.bruto.toFixed(2).replace('.', ','),
    totals.abat.toFixed(2).replace('.', ','),
    totals.liquido.toFixed(2).replace('.', ','),
    '',
    '',
    '',
  ].join(';');
  return [header, ...lines, totalsLine].join('\n');
}

export function AgreementsTable({ agreements, suppliers, onSelect, onOpenReview }: AgreementsTableProps) {
  const { byCnpj: companiesByCnpj } = useSharedCompanies();
  const filters = useAgreementsDashboardStore((s) => s.filters);
  const setFilter = useAgreementsDashboardStore((s) => s.setFilter);
  const resetFilters = useAgreementsDashboardStore((s) => s.resetFilters);
  const updateStatus = useAgreementsDashboardStore((s) => s.updateStatus);
  const creditLinks = useCreditLinksStore((s) => s.links);
  const { showToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [bulkBusy, setBulkBusy] = useState(false);

  const agreementHasCredit = useMemo(() => {
    const withCreditCodes = new Set<string>(creditLinks.map((l) => l.proposalCode));
    return (a: AgreementRecord) => withCreditCodes.has(a.code);
  }, [creditLinks]);

  const finalAgreements = useMemo(() => {
    switch (quickFilter) {
      case 'pending':
        return agreements.filter((a) => ['pending_approval', 'in_negotiation', 'draft'].includes(a.status));
      case 'approved':
        return agreements.filter((a) => ['active', 'completed'].includes(a.status));
      case 'with_credit':
        return agreements.filter(agreementHasCredit);
      default:
        return agreements;
    }
  }, [agreements, quickFilter, agreementHasCredit]);

  const hasFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.supplier !== 'all' ||
    filters.riskLevel !== 'all' ||
    quickFilter !== 'all';

  const selectedAgreements = useMemo(
    () => finalAgreements.filter((a) => selectedIds.has(a.id)),
    [finalAgreements, selectedIds],
  );

  const allSelected =
    finalAgreements.length > 0 && selectedAgreements.length === finalAgreements.length;
  const someSelected = selectedAgreements.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected || someSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(finalAgreements.map((a) => a.id)));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkApprove = async () => {
    if (selectedAgreements.length === 0) return;
    setBulkBusy(true);
    try {
      for (const a of selectedAgreements) {
        if (a.status !== 'active' && a.status !== 'completed') {
          await updateStatus(a.id, 'active');
        }
      }
      showToast(
        'success',
        'Aprovação em lote concluída',
        `${selectedAgreements.length} acordo${selectedAgreements.length === 1 ? '' : 's'} movido${selectedAgreements.length === 1 ? '' : 's'} para Ativo.`,
      );
      clearSelection();
    } finally {
      setBulkBusy(false);
    }
  };

  const computeTotals = (rows: AgreementRecord[]) => {
    const bruto = rows.reduce((s, a) => s + a.totalValue, 0);
    const abat = 0;
    return { bruto, abat, liquido: bruto - abat };
  };

  const handleExportSelected = () => {
    const rows = selectedAgreements.length > 0 ? selectedAgreements : finalAgreements;
    if (rows.length === 0) {
      showToast('warning', 'Nada para exportar', 'Não há linhas visíveis na tabela.');
      return;
    }
    const csv = buildAuditCsv(rows, computeTotals(rows));
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    downloadBlob(`acordos-auditoria-${ts}.csv`, csv, 'text/csv;charset=utf-8');
    showToast(
      'success',
      'Relatório de auditoria gerado',
      `${rows.length} linha${rows.length === 1 ? '' : 's'} exportada${rows.length === 1 ? '' : 's'} em CSV.`,
    );
  };

  const handleExportPdf = () => {
    const rows = finalAgreements;
    if (rows.length === 0) {
      showToast('warning', 'Nada para exportar', 'Não há linhas visíveis na tabela.');
      return;
    }
    const totals = computeTotals(rows);
    const now = new Date();
    const body = [
      'RELATORIO DE AUDITORIA - ACORDOS COMERCIAIS',
      `Gerado em: ${now.toLocaleString('pt-BR')}`,
      `Filtros ativos: ${hasFilters ? 'sim' : 'nao'}`,
      `Registros: ${rows.length}`,
      '',
      'Codigo | Fornecedor | Estado | Bruto | Abatimento | Liquido',
      '--------------------------------------------------------------------',
      ...rows.map(
        (a) =>
          `${a.code.padEnd(8, ' ')} | ${a.supplierName.slice(0, 28).padEnd(28, ' ')} | ${PIPELINE_CONFIG[a.status].label.padEnd(14, ' ')} | ${formatCurrency(a.totalValue).padStart(14, ' ')} | ${formatCurrency(0).padStart(12, ' ')} | ${formatCurrency(a.totalValue).padStart(14, ' ')}`,
      ),
      '',
      'CONSOLIDADO',
      `Valor Bruto:    ${formatCurrency(totals.bruto)}`,
      `Abatimentos:    ${formatCurrency(totals.abat)}`,
      `Valor Liquido:  ${formatCurrency(totals.liquido)}`,
    ].join('\n');
    const ts = now.toISOString().replace(/[:.]/g, '-');
    downloadBlob(`acordos-auditoria-${ts}.pdf`, body, 'application/pdf');
    showToast('success', 'PDF de auditoria gerado', 'Arquivo disponível para download.');
  };

  const totals = useMemo(() => computeTotals(finalAgreements), [finalAgreements]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden relative">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Todos os Acordos</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {finalAgreements.length}{' '}
              {finalAgreements.length === 1 ? 'acordo' : 'acordos'} correspondentes aos filtros ·
              Bruto {formatCurrency(totals.bruto, { withCents: false })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Exportar relatório de auditoria (PDF)"
            >
              <FileArrowDown size={13} weight="bold" />
              PDF
            </button>
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Exportar relatório de auditoria (CSV)"
            >
              <ExportIcon size={13} weight="bold" />
              CSV
            </button>
            {hasFilters && (
              <button
                onClick={() => {
                  resetFilters();
                  setQuickFilter('all');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XIcon size={12} weight="bold" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlass
              size={14}
              weight="bold"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por CNPJ, fornecedor ou ID…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value as typeof filters.status)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] bg-white"
          >
            <option value="all">Todos os estados</option>
            {PIPELINE_ORDER.map((s) => (
              <option key={s} value={s}>
                {PIPELINE_CONFIG[s].label}
              </option>
            ))}
          </select>
          <select
            value={filters.supplier}
            onChange={(e) => setFilter('supplier', e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] bg-white"
          >
            <option value="all">Todos os fornecedores</option>
            {suppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider inline-flex items-center gap-1">
            <Funnel size={11} weight="fill" /> Filtros rápidos
          </span>
          {QUICK_FILTERS.map((q) => {
            const active = quickFilter === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setQuickFilter(q.id)}
                className={`inline-flex items-center gap-1 h-7 px-3 text-[11px] font-semibold rounded-full border transition-colors ${
                  active
                    ? 'bg-[#0070f2] text-white border-[#0070f2] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {q.id === 'with_credit' && <LinkIcon size={11} weight="bold" />}
                {q.id === 'pending' && <ClockCounterClockwise size={11} weight="bold" />}
                {q.id === 'approved' && <CheckCircleIcon size={11} weight="bold" />}
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="w-10 px-3 py-2.5">
                <label className="inline-flex items-center justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    aria-label="Selecionar todos"
                  />
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      allSelected || someSelected
                        ? 'bg-[#0070f2] border-[#0070f2]'
                        : 'bg-white border-gray-300 hover:border-[#0070f2]'
                    }`}
                  >
                    {allSelected ? (
                      <Check size={10} weight="bold" className="text-white" />
                    ) : someSelected ? (
                      <span className="w-2 h-0.5 bg-white rounded" />
                    ) : null}
                  </span>
                </label>
              </th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Código
              </th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Tipo
              </th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Atualizado
              </th>
              <th className="w-10 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {finalAgreements.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <MagnifyingGlass size={22} weight="bold" className="text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Nenhum acordo encontrado
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Ajuste os filtros, limpe a busca ou crie uma nova proposta para visualizar
                    resultados aqui.
                  </p>
                </td>
              </tr>
            ) : (
              finalAgreements.map((a) => {
                const cfg = PIPELINE_CONFIG[a.status];
                const hasCredit = agreementHasCredit(a);
                const isSelected = selectedIds.has(a.id);
                const company = companiesByCnpj.get(a.supplierCnpj);
                const pendingProposalCode = company?.pendingProposalCodes[0];
                const contestedProposalCode = company?.contestedProposalCodes?.[0];
                const hasContestedProposal = !!contestedProposalCode && !!onOpenReview;
                const hasPendingProposal = !!pendingProposalCode && !!onOpenReview;
                return (
                  <tr
                    key={a.id}
                    className={`cursor-pointer transition-colors group ${
                      isSelected ? 'bg-[#0070f2]/5' : 'hover:bg-gray-50/70'
                    }`}
                    onClick={() => {
                      if (hasContestedProposal) {
                        onOpenReview!(contestedProposalCode!);
                      } else if (hasPendingProposal) {
                        onOpenReview!(pendingProposalCode!);
                      } else {
                        onSelect(a);
                      }
                    }}
                  >
                    <td
                      className="px-3 py-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(a.id);
                      }}
                    >
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isSelected}
                          readOnly
                          aria-label={`Selecionar ${a.code}`}
                        />
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#0070f2] border-[#0070f2]'
                              : 'bg-white border-gray-300 hover:border-[#0070f2]'
                          }`}
                        >
                          {isSelected && (
                            <Check size={10} weight="bold" className="text-white" />
                          )}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-xs font-mono font-bold text-gray-800">{a.code}</span>
                        {hasCredit && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"
                            title="Este acordo possui vínculo de crédito"
                          >
                            <LinkIcon size={9} weight="bold" />
                            Crédito
                          </span>
                        )}
                        {hasContestedProposal && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-full"
                            title={`Proposta em conflito ${contestedProposalCode} · clique para revisar disputa`}
                          >
                            <Warning size={9} weight="fill" />
                            Em Conflito
                          </span>
                        )}
                        {!hasContestedProposal && hasPendingProposal && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse"
                            title={`Proposta pendente ${pendingProposalCode} · clique para revisar`}
                          >
                            <ClockCounterClockwise size={9} weight="bold" />
                            Rever proposta
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 min-w-[180px]">
                      <p className="text-xs font-semibold text-gray-800 truncate max-w-[220px]">
                        {a.supplierName}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[220px]">
                        {a.supplierCnpj}
                      </p>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-600">
                        {CONTRACT_TYPE_LABEL[a.contractType]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-xs font-bold text-gray-800 tabular-nums">
                        {formatCurrency(a.totalValue, { withCents: false })}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className="text-[11px] text-gray-500 tabular-nums">
                        {formatDate(a.updatedAt, 'dd MMM yyyy')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#0070f2] transition-colors" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedAgreements.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-modal-in"
          role="region"
          aria-label="Barra de ações em lote"
        >
          <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-xl shadow-2xl border border-gray-800">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 text-[11px] font-bold tabular-nums">
              {selectedAgreements.length}
            </span>
            <span className="text-xs font-semibold pr-1">
              {selectedAgreements.length === 1 ? 'acordo selecionado' : 'acordos selecionados'}
            </span>
            <button
              type="button"
              onClick={handleBulkApprove}
              disabled={bulkBusy}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white text-[11px] font-semibold transition-colors disabled:opacity-60"
            >
              <CheckCircleIcon size={12} weight="bold" />
              Aprovar em Lote
            </button>
            <button
              type="button"
              onClick={handleExportSelected}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-[11px] font-semibold transition-colors"
            >
              <ExportIcon size={12} weight="bold" />
              Exportar Selecionados
            </button>
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Limpar seleção"
              className="ml-1 inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <XIcon size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
