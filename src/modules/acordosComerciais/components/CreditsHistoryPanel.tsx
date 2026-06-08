import React, { useState, useMemo } from 'react';
import { History, CheckCircle2, Clock, ArrowDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

interface LinkageRecord {
  id: string;
  date: string;
  creditCode: string;
  invoiceNf: string;
  supplierId: string;
  supplierName: string;
  offsetAmount: number;
  status: 'confirmado' | 'pendente';
}

interface CreditsHistoryPanelProps {
  selectedSupplierId: string | null;
}

const mockHistory: LinkageRecord[] = [
  {
    id: 'lh1', date: '2026-04-08', creditCode: 'CR-2026-0011', invoiceNf: 'NF-2026-004522',
    supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.', offsetAmount: 42000, status: 'confirmado',
  },
  {
    id: 'lh2', date: '2026-04-05', creditCode: 'CR-2026-0041', invoiceNf: 'NF-2026-008902',
    supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda', offsetAmount: 60000, status: 'confirmado',
  },
  {
    id: 'lh3', date: '2026-04-03', creditCode: 'CR-2026-0041', invoiceNf: 'NF-2026-008905',
    supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda', offsetAmount: 35000, status: 'confirmado',
  },
  {
    id: 'lh4', date: '2026-04-02', creditCode: 'CR-2026-0055', invoiceNf: 'NF-2026-012301',
    supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio', offsetAmount: 80000, status: 'confirmado',
  },
  {
    id: 'lh5', date: '2026-04-01', creditCode: 'CR-2026-0055', invoiceNf: 'NF-2026-012303',
    supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio', offsetAmount: 100000, status: 'confirmado',
  },
  {
    id: 'lh6', date: '2026-03-28', creditCode: 'CR-2026-0011', invoiceNf: 'NF-2026-004525',
    supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.', offsetAmount: 33200, status: 'confirmado',
  },
];

export function CreditsHistoryPanel({ selectedSupplierId }: CreditsHistoryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const filteredHistory = useMemo(() => {
    if (!selectedSupplierId) return mockHistory;
    return mockHistory.filter((r) => r.supplierId === selectedSupplierId);
  }, [selectedSupplierId]);

  const displayedRecords = expanded ? filteredHistory : filteredHistory.slice(0, 4);
  const totalOffset = filteredHistory.reduce((sum, r) => sum + r.offsetAmount, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <History className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Histórico de Vinculações</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {filteredHistory.length} vinculação{filteredHistory.length !== 1 ? 'ões' : ''} realizada{filteredHistory.length !== 1 ? 's' : ''}
              {' '}&middot;{' '}
              Total compensado: <span className="font-semibold text-gray-600">{formatCurrency(totalOffset)}</span>
            </p>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-gray-400">Nenhuma vinculação para este fornecedor</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-50">
            {displayedRecords.map((record) => (
              <div key={record.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  record.status === 'confirmado' ? 'bg-emerald-50' : 'bg-amber-50'
                }`}>
                  {record.status === 'confirmado' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-medium text-[#0070f2]">{record.creditCode}</span>
                    <ArrowDownRight className="w-3 h-3 text-gray-300" />
                    <span className="text-[11px] font-mono text-gray-600">{record.invoiceNf}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{record.supplierName}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-800 tabular-nums">{formatCurrency(record.offsetAmount)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(record.date)}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredHistory.length > 4 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              {expanded ? (
                <>
                  Mostrar menos <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Ver todas ({filteredHistory.length}) <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
