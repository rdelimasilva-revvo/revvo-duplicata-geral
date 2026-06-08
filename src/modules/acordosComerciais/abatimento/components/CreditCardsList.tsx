import React from 'react';
import { CreditCard, TrendingUp, CheckCircle2, AlertCircle, Clock, RefreshCw, Loader2, Database } from 'lucide-react';
import { useAbatimentoStore } from '../store';
import { Credit, CREDIT_TYPE_LABELS } from '../types';
import { formatCurrency, formatDate } from '../../utils';

function CreditStatusIcon({ status }: { status: Credit['status'] }) {
  switch (status) {
    case 'disponivel':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'parcialmente_utilizado':
      return <TrendingUp className="w-4 h-4 text-blue-500" />;
    case 'utilizado':
      return <Clock className="w-4 h-4 text-gray-400" />;
    case 'expirado':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
  }
}

function CreditStatusLabel({ status }: { status: Credit['status'] }) {
  const config: Record<Credit['status'], { label: string; cls: string }> = {
    disponivel: { label: 'Disponivel', cls: 'text-emerald-700 bg-emerald-50' },
    parcialmente_utilizado: { label: 'Parcial', cls: 'text-blue-700 bg-blue-50' },
    utilizado: { label: 'Utilizado', cls: 'text-gray-500 bg-gray-100' },
    expirado: { label: 'Expirado', cls: 'text-red-600 bg-red-50' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.cls}`}>
      {c.label}
    </span>
  );
}

function SyncIcon() {
  return (
    <div className="group/sync relative inline-flex">
      <RefreshCw className="w-3 h-3 text-[#0070f2]/50" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-gray-800 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover/sync:opacity-100 transition-opacity pointer-events-none z-10">
        Sincronizado via SAP
      </div>
    </div>
  );
}

export function CreditCardsList() {
  const {
    getSupplierCredits, selectedCreditId, setSelectedCredit,
    selectedSupplierId, bapiLoadingCredits, bapiNoCreditsFim,
  } = useAbatimentoStore();
  const credits = getSupplierCredits();

  if (!selectedSupplierId) {
    return (
      <div className="p-4 text-center">
        <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Selecione um fornecedor</p>
      </div>
    );
  }

  if (bapiLoadingCredits) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-6 h-6 text-[#0070f2] animate-spin mx-auto mb-2" />
        <p className="text-xs font-medium text-[#0070f2]">Consultando SAP...</p>
        <p className="text-[10px] text-gray-400 mt-1 font-mono">BAPI_FI_DOCUMENT_READ</p>
      </div>
    );
  }

  if (bapiNoCreditsFim) {
    return (
      <div className="p-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <Database className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-600 mb-1">FIM</p>
          <p className="text-[11px] text-gray-500">
            Nenhum credito encontrado no SAP para este fornecedor.
          </p>
          <p className="text-[9px] text-gray-400 mt-2 font-mono">BAPI_FI_DOCUMENT_READ: 0 registros</p>
        </div>
      </div>
    );
  }

  const available = credits.filter((c) => c.availableValue > 0);
  const exhausted = credits.filter((c) => c.availableValue === 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Creditos Disponiveis ({available.length})
        </h3>
        <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
          <RefreshCw className="w-2.5 h-2.5" /> SAP
        </span>
      </div>

      {available.length === 0 && (
        <div className="p-4 text-center bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400">Nenhum credito disponivel</p>
        </div>
      )}

      {available.map((credit) => (
        <button
          key={credit.id}
          onClick={() => setSelectedCredit(credit.id)}
          className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
            selectedCreditId === credit.id
              ? 'border-[#0070f2] bg-blue-50/60 ring-1 ring-[#0070f2]/20 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <CreditStatusIcon status={credit.status} />
              <span className="text-xs font-mono font-semibold text-[#0070f2] truncate">{credit.code}</span>
            </div>
            <CreditStatusLabel status={credit.status} />
          </div>
          <p className="text-xs text-gray-600 truncate mb-2">{credit.description}</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase flex items-center gap-1">
                Disponivel <SyncIcon />
              </p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(credit.availableValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase flex items-center gap-1 justify-end">
                Total <SyncIcon />
              </p>
              <p className="text-xs text-gray-500">{formatCurrency(credit.totalValue)}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0070f2] rounded-full transition-all duration-500"
                style={{ width: `${((credit.totalValue - credit.availableValue) / credit.totalValue) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">{CREDIT_TYPE_LABELS[credit.type]}</span>
              <span className="text-[10px] text-gray-400">Exp: {formatDate(credit.expirationDate)}</span>
            </div>
          </div>
        </button>
      ))}

      {exhausted.length > 0 && (
        <>
          <div className="pt-2 mt-2 border-t border-gray-100">
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">
              Esgotados / Expirados ({exhausted.length})
            </h4>
          </div>
          {exhausted.map((credit) => (
            <div key={credit.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <CreditStatusIcon status={credit.status} />
                <span className="text-xs font-mono text-gray-400">{credit.code}</span>
                <CreditStatusLabel status={credit.status} />
              </div>
              <p className="text-xs text-gray-400 truncate">{credit.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(credit.totalValue)}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
