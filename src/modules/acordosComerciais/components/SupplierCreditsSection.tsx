import React, { useState, useMemo } from 'react';
import {
  ChevronDown, Building2, FileText,
  Link2, AlertTriangle, Search,
  CreditCard, ArrowRight, Clock, Ban,
} from 'lucide-react';
import { credits, invoices, suppliers } from '../abatimento/mockData';
import { CREDIT_TYPE_LABELS, OFFSET_STATUS_CONFIG } from '../abatimento/types';
import type { Credit, Invoice } from '../abatimento/types';
import { formatCurrency, formatDate } from '../utils';

interface SupplierCreditsSectionProps {
  onNavigateGestor: () => void;
  onNavigateSupplierAbatimento?: (supplierId: string) => void;
  selectedSupplierId: string | null;
}

interface SupplierGroup {
  id: string;
  name: string;
  cnpj: string;
  credits: Credit[];
  invoices: Invoice[];
  totalCredits: number;
  totalOpenInvoices: number;
}

export function SupplierCreditsSection({ onNavigateGestor, onNavigateSupplierAbatimento, selectedSupplierId }: SupplierCreditsSectionProps) {
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<Record<string, 'credits' | 'invoices' | null>>({});

  const supplierGroups = useMemo(() => {
    const groups: SupplierGroup[] = [];

    const targetSuppliers = selectedSupplierId
      ? suppliers.filter((s) => s.id === selectedSupplierId)
      : suppliers;

    targetSuppliers.forEach((sup) => {
      const supCredits = credits.filter(
        (c) => c.supplierId === sup.id && c.availableValue > 0 && c.status !== 'expirado'
      );
      const supInvoices = invoices.filter(
        (inv) => inv.supplierId === sup.id && inv.openBalance > 0
      );

      if (!selectedSupplierId && supCredits.length === 0) return;

      groups.push({
        id: sup.id,
        name: sup.name,
        cnpj: sup.cnpj,
        credits: supCredits,
        invoices: supInvoices,
        totalCredits: supCredits.reduce((s, c) => s + c.availableValue, 0),
        totalOpenInvoices: supInvoices.reduce((s, inv) => s + inv.openBalance, 0),
      });
    });

    return groups.sort((a, b) => b.totalCredits - a.totalCredits);
  }, [selectedSupplierId]);

  const toggleSupplier = (id: string) => {
    setExpandedSupplier((prev) => (prev === id ? null : id));
  };

  const toggleSection = (supplierId: string, section: 'credits' | 'invoices') => {
    setExpandedSection((prev) => ({
      ...prev,
      [supplierId]: prev[supplierId] === section ? null : section,
    }));
  };

  if (selectedSupplierId) {
    const group = supplierGroups[0];
    if (!group || group.credits.length === 0) {
      const supplierName = suppliers.find((s) => s.id === selectedSupplierId)?.name || 'fornecedor selecionado';
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Ban className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Nenhum crédito disponível</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Não existem créditos pendentes para <span className="font-medium text-gray-600">{supplierName}</span>. Esta situação não afeta outras operações do sistema.
          </p>
        </div>
      );
    }

    return <SingleSupplierView group={group} onNavigateGestor={onNavigateGestor} />;
  }

  if (supplierGroups.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Nenhum fornecedor com créditos encontrado</p>
        <p className="text-xs text-gray-400 mt-0.5">Selecione um fornecedor no filtro acima</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {supplierGroups.map((group) => {
        const isExpanded = expandedSupplier === group.id;
        const activeSection = expandedSection[group.id] || null;
        const coveragePercent = group.totalOpenInvoices > 0
          ? Math.min(100, Math.round((group.totalCredits / group.totalOpenInvoices) * 100))
          : 0;

        return (
          <div key={group.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSupplier(group.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-gray-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">{group.name}</p>
                  <span className="text-[10px] text-gray-400 font-mono">{group.cnpj}</span>
                </div>
                <div className="flex items-center gap-4 mt-0.5">
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-[#0070f2]">{group.credits.length}</span> crédito{group.credits.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700">{group.invoices.length}</span> NF{group.invoices.length !== 1 ? 's' : ''} em aberto
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-medium text-gray-400 uppercase">Créditos</p>
                  <p className="text-sm font-bold text-[#0070f2] tabular-nums">{formatCurrency(group.totalCredits)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-gray-400 uppercase">NFs abertas</p>
                  <p className="text-sm font-bold text-gray-700 tabular-nums">{formatCurrency(group.totalOpenInvoices)}</p>
                </div>
                <div className="w-16">
                  <p className="text-[10px] font-medium text-gray-400 uppercase text-center mb-1">Cobertura</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        coveragePercent >= 80 ? 'bg-emerald-500' : coveragePercent >= 40 ? 'bg-amber-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${coveragePercent}%` }}
                    />
                  </div>
                  <p className={`text-[10px] font-semibold text-center mt-0.5 ${
                    coveragePercent >= 80 ? 'text-emerald-600' : coveragePercent >= 40 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {coveragePercent}%
                  </p>
                </div>

                <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100">
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => toggleSection(group.id, 'credits')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                      activeSection === 'credits'
                        ? 'text-[#0070f2] bg-[#0070f2]/5 border-b-2 border-[#0070f2]'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Créditos Disponíveis ({group.credits.length})
                  </button>
                  <button
                    onClick={() => toggleSection(group.id, 'invoices')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                      activeSection === 'invoices'
                        ? 'text-[#0070f2] bg-[#0070f2]/5 border-b-2 border-[#0070f2]'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Notas Fiscais em Aberto ({group.invoices.length})
                  </button>
                </div>

                {activeSection === 'credits' && (
                  <div className="p-4">
                    <div className="space-y-2">
                      {group.credits.map((credit) => (
                        <CreditRow key={credit.id} credit={credit} />
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'invoices' && (
                  <div className="p-4">
                    <InvoiceTable invoices={group.invoices} />
                  </div>
                )}

                {!activeSection && (
                  <div className="p-4 flex items-center justify-center gap-2">
                    <p className="text-xs text-gray-400">Selecione uma aba acima para ver os detalhes</p>
                  </div>
                )}

                <div className="px-4 pb-4 space-y-2">
                  {onNavigateSupplierAbatimento && (
                    <button
                      onClick={() => onNavigateSupplierAbatimento(group.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0070f2] text-white text-xs font-semibold rounded-lg hover:bg-[#005bc4] transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Vincular faturas deste fornecedor
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!onNavigateSupplierAbatimento && (
                    <button
                      onClick={onNavigateGestor}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0070f2] text-white text-xs font-semibold rounded-lg hover:bg-[#005bc4] transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Vincular Creditos as Notas Fiscais
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SingleSupplierView({ group, onNavigateGestor }: { group: SupplierGroup; onNavigateGestor: () => void }) {
  const coveragePercent = group.totalOpenInvoices > 0
    ? Math.min(100, Math.round((group.totalCredits / group.totalOpenInvoices) * 100))
    : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-[#0070f2]/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-[#0070f2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800">{group.name}</p>
              <span className="text-[10px] text-gray-400 font-mono">{group.cnpj}</span>
            </div>
            <div className="flex items-center gap-4 mt-0.5">
              <span className="text-[11px] text-gray-500">
                <span className="font-semibold text-[#0070f2]">{group.credits.length}</span> crédito{group.credits.length !== 1 ? 's' : ''} pendentes
              </span>
              <span className="text-[11px] text-gray-500">
                <span className="font-semibold text-gray-700">{group.invoices.length}</span> NF{group.invoices.length !== 1 ? 's' : ''} em aberto
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-medium text-gray-400 uppercase">Total créditos</p>
              <p className="text-sm font-bold text-[#0070f2] tabular-nums">{formatCurrency(group.totalCredits)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium text-gray-400 uppercase">Total NFs abertas</p>
              <p className="text-sm font-bold text-gray-700 tabular-nums">{formatCurrency(group.totalOpenInvoices)}</p>
            </div>
            <div className="w-20">
              <p className="text-[10px] font-medium text-gray-400 uppercase text-center mb-1">Cobertura</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    coveragePercent >= 80 ? 'bg-emerald-500' : coveragePercent >= 40 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
              <p className={`text-[10px] font-semibold text-center mt-0.5 ${
                coveragePercent >= 80 ? 'text-emerald-600' : coveragePercent >= 40 ? 'text-amber-600' : 'text-red-500'
              }`}>
                {coveragePercent}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-[#0070f2]" />
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Créditos Pendentes</h3>
            <span className="text-[10px] text-gray-400">({group.credits.length})</span>
          </div>
          <div className="space-y-2">
            {group.credits.map((credit) => (
              <CreditRow key={credit.id} credit={credit} />
            ))}
          </div>
        </div>
      </div>

      {group.invoices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Notas Fiscais em Aberto</h3>
              <span className="text-[10px] text-gray-400">({group.invoices.length})</span>
            </div>
            <InvoiceTable invoices={group.invoices} />
          </div>
        </div>
      )}

      <button
        onClick={onNavigateGestor}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0070f2] text-white text-sm font-semibold rounded-xl hover:bg-[#005bc4] transition-colors shadow-sm"
      >
        <Link2 className="w-4 h-4" />
        Vincular Créditos às Notas Fiscais
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function CreditRow({ credit }: { credit: Credit }) {
  const isExpiring = new Date(credit.expirationDate) <= new Date(Date.now() + 90 * 86400000);
  const usedPercent = credit.totalValue > 0 ? Math.round((credit.usedValue / credit.totalValue) * 100) : 0;

  return (
    <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-[#0070f2]">{credit.code}</span>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
            {CREDIT_TYPE_LABELS[credit.type]}
          </span>
          {isExpiring && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 rounded flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              Expira em breve
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{credit.description}</p>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="w-24">
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-gray-400">Uso</span>
            <span className="font-semibold text-gray-600">{usedPercent}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0070f2]/40 rounded-full" style={{ width: `${usedPercent}%` }} />
          </div>
        </div>

        <div className="text-right min-w-[100px]">
          <p className="text-[10px] text-gray-400">Disponível</p>
          <p className="text-sm font-bold text-gray-800 tabular-nums">{formatCurrency(credit.availableValue)}</p>
        </div>

        <div className="text-right min-w-[80px]">
          <p className="text-[10px] text-gray-400">Expira em</p>
          <p className={`text-[11px] font-medium tabular-nums ${isExpiring ? 'text-amber-600' : 'text-gray-600'}`}>
            {formatDate(credit.expirationDate)}
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoiceTable({ invoices: invList }: { invoices: Invoice[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">NF</th>
            <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Duplicata</th>
            <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
            <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Valor bruto</th>
            <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Compensado</th>
            <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Saldo aberto</th>
            <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Vencimento</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invList.map((inv) => {
            const cfg = OFFSET_STATUS_CONFIG[inv.offsetStatus];
            const isPastDue = new Date(inv.dueDate) < new Date() && inv.openBalance > 0;

            return (
              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-2">
                  <span className="text-[11px] font-mono font-medium text-gray-700">{inv.nfNumber}</span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-[11px] text-gray-500">{inv.duplicateCode}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-[11px] text-gray-600 tabular-nums">{formatCurrency(inv.grossValue)}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-[11px] text-gray-500 tabular-nums">{formatCurrency(inv.alreadyOffset)}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-[11px] font-semibold text-gray-800 tabular-nums">{formatCurrency(inv.openBalance)}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-[11px] tabular-nums ${isPastDue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {formatDate(inv.dueDate)}
                    {isPastDue && (
                      <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1 -mt-0.5" />
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
