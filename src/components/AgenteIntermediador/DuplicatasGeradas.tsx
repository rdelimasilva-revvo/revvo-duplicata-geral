import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Download,
  FilterX,
  X,
  Hash,
  User,
  Building2,
  Calendar,
  Banknote,
  Copy,
  Printer,
} from 'lucide-react';
import { mockSuppliers, SupplierDuplicate } from './mockSuppliers';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/csvExport';

interface FlatDuplicate extends SupplierDuplicate {
  supplierId: string;
  supplierName: string;
  supplierCnpj: string;
}

const SACADO_FIXO = {
  name: 'Indústria de Cosméticos S.A.',
  cnpj: '12.345.678/0001-90',
};

const allDuplicates: FlatDuplicate[] = mockSuppliers.flatMap((s) =>
  s.duplicates.map((d) => ({
    ...d,
    sacado: SACADO_FIXO.name,
    cnpjSacado: SACADO_FIXO.cnpj,
    supplierId: s.id,
    supplierName: s.name,
    supplierCnpj: s.cnpj,
  }))
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatCurrencyCompact = (value: number) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
};

const duplicateStatusBadge = (status: SupplierDuplicate['status']) => {
  const map = {
    Emitida: 'bg-blue-50 text-blue-700 border-blue-200',
    Liquidada: 'bg-green-50 text-green-700 border-green-200',
    Vencida: 'bg-red-50 text-red-700 border-red-200',
    Cancelada: 'bg-gray-100 text-gray-600 border-gray-200',
  } as const;
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status]}`;
};

const STATUSES: Array<'all' | SupplierDuplicate['status']> = [
  'all',
  'Emitida',
  'Liquidada',
  'Vencida',
  'Cancelada',
];

const PAGE_SIZES = [10, 25, 50];

const FILTERS_STORAGE_KEY = 'duplicatas-geradas:filters';

interface StoredFilters {
  search: string;
  status: 'all' | SupplierDuplicate['status'];
  supplier: string;
  pageSize: number;
}

const loadStoredFilters = (): Partial<StoredFilters> => {
  try {
    const raw = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredFilters>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const CSV_HEADERS = [
  'Nº Duplicata',
  'Fornecedor',
  'CNPJ do Fornecedor',
  'Sacado',
  'CNPJ do Sacado',
  'Emissão',
  'Vencimento',
  'Valor',
  'Status',
];

const buildCsvRows = (items: FlatDuplicate[]): (string | number)[][] =>
  items.map((d) => [
    d.numero,
    d.supplierName,
    d.supplierCnpj,
    d.sacado,
    d.cnpjSacado,
    d.emissao,
    d.vencimento,
    formatCurrency(d.valor),
    d.status,
  ]);

const parseBrDate = (s: string) => {
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const daysBetween = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

const DuplicateDetailModal: React.FC<{
  duplicate: FlatDuplicate;
  onClose: () => void;
}> = ({ duplicate: d, onClose }) => {
  const emissao = parseBrDate(d.emissao);
  const vencimento = parseBrDate(d.vencimento);
  const prazo = daysBetween(emissao, vencimento);
  const hoje = new Date(2026, 5, 8);
  const diasParaVencer = daysBetween(hoje, vencimento);

  const timeline = [
    {
      label: 'Duplicata emitida',
      date: d.emissao,
      done: true,
      tone: 'blue' as const,
    },
    {
      label: 'Registro no parceiro de escrituração',
      date: d.emissao,
      done: true,
      tone: 'blue' as const,
    },
    {
      label: 'Notificação enviada ao sacado',
      date: d.emissao,
      done: true,
      tone: 'blue' as const,
    },
    {
      label: d.status === 'Liquidada' ? 'Pagamento liquidado' : 'Vencimento',
      date: d.vencimento,
      done: d.status === 'Liquidada' || d.status === 'Vencida',
      tone:
        d.status === 'Liquidada'
          ? ('green' as const)
          : d.status === 'Vencida'
            ? ('red' as const)
            : ('gray' as const),
    },
  ];

  const toneDot = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-300',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Duplicata ${d.numero}`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-blue-600">
                Duplicata
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">{d.numero}</h2>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={duplicateStatusBadge(d.status)}>{d.status}</span>
                {d.status === 'Emitida' && diasParaVencer >= 0 && (
                  <span className="text-xs text-gray-500">
                    Vence em {diasParaVencer} dia{diasParaVencer === 1 ? '' : 's'}
                  </span>
                )}
                {d.status === 'Vencida' && diasParaVencer < 0 && (
                  <span className="text-xs text-red-600 font-medium">
                    Vencida há {Math.abs(diasParaVencer)} dia
                    {Math.abs(diasParaVencer) === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 -mr-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" /> Valor da duplicata
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(d.valor)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Emissão
              </div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {d.emissao}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Vencimento
              </div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {d.vencimento}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Prazo de {prazo} dias
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Fornecedor (Sacador)
              </div>
              <div className="mt-2">
                <div className="font-semibold text-gray-900">{d.supplierName}</div>
                <div className="text-sm text-gray-500">CNPJ {d.supplierCnpj}</div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Sacado (Devedor)
              </div>
              <div className="mt-2">
                <div className="font-semibold text-gray-900">{d.sacado}</div>
                <div className="text-sm text-gray-500">CNPJ {d.cnpjSacado}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Identificação
            </div>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  Número da duplicata
                </div>
                <div className="text-sm font-medium text-gray-900">{d.numero}</div>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  ID interno
                </div>
                <div className="text-sm font-mono text-gray-700">{d.id}</div>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  Chave de escrituração
                </div>
                <div className="text-sm font-mono text-gray-700">
                  ESC-{d.supplierId.toUpperCase()}-{d.id}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Linha do tempo
            </div>
            <ol className="relative border-l border-gray-200 ml-2 space-y-4">
              {timeline.map((step, idx) => (
                <li key={idx} className="pl-5 relative">
                  <span
                    className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow ${
                      step.done ? toneDot[step.tone] : 'bg-gray-200'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-sm font-medium ${
                        step.done ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500">{step.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard?.writeText(d.numero)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar Nº
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const DuplicatasGeradas: React.FC = () => {
  const { showToast } = useToast();
  const [stored] = useState(loadStoredFilters);
  const [search, setSearch] = useState(
    typeof stored.search === 'string' ? stored.search : ''
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | SupplierDuplicate['status']
  >(stored.status && STATUSES.includes(stored.status) ? stored.status : 'all');
  const [supplierFilter, setSupplierFilter] = useState<string>(
    typeof stored.supplier === 'string' ? stored.supplier : 'all'
  );
  const [pageSize, setPageSize] = useState<number>(
    typeof stored.pageSize === 'number' && PAGE_SIZES.includes(stored.pageSize)
      ? stored.pageSize
      : 10
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => allDuplicates.find((d) => d.id === selectedId) ?? null,
    [selectedId]
  );

  const filtered = useMemo(() => {
    return allDuplicates.filter((d) => {
      const matchSearch =
        !search ||
        d.numero.toLowerCase().includes(search.toLowerCase()) ||
        d.sacado.toLowerCase().includes(search.toLowerCase()) ||
        d.supplierName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchSupplier =
        supplierFilter === 'all' || d.supplierId === supplierFilter;
      return matchSearch && matchStatus && matchSupplier;
    });
  }, [search, statusFilter, supplierFilter]);

  const hasActiveFilters =
    search !== '' || statusFilter !== 'all' || supplierFilter !== 'all';

  // Persiste filtros na sessão para o usuário não reconfigurar a cada navegação
  useEffect(() => {
    try {
      if (hasActiveFilters || pageSize !== 10) {
        sessionStorage.setItem(
          FILTERS_STORAGE_KEY,
          JSON.stringify({
            search,
            status: statusFilter,
            supplier: supplierFilter,
            pageSize,
          } satisfies StoredFilters)
        );
      } else {
        sessionStorage.removeItem(FILTERS_STORAGE_KEY);
      }
    } catch {
      // sessionStorage indisponível — segue sem persistência
    }
  }, [search, statusFilter, supplierFilter, pageSize, hasActiveFilters]);

  // Volta para a primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, supplierFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const selectedDuplicates = useMemo(
    () => allDuplicates.filter((d) => selectedIds.has(d.id)),
    [selectedIds]
  );
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((d) => selectedIds.has(d.id));
  const someFilteredSelected = filtered.some((d) => selectedIds.has(d.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someFilteredSelected && !allFilteredSelected;
    }
  }, [someFilteredSelected, allFilteredSelected]);

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((d) => next.delete(d.id));
      } else {
        filtered.forEach((d) => next.add(d.id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSupplierFilter('all');
    setCurrentPage(1);
    try {
      sessionStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch {
      // sessionStorage indisponível — nada a limpar
    }
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      showToast(
        'warning',
        'Nenhuma duplicata para exportar',
        'Ajuste os filtros e tente novamente.'
      );
      return;
    }
    const dateStamp = new Date().toISOString().slice(0, 10);
    exportToCsv(
      `duplicatas-${dateStamp}.csv`,
      CSV_HEADERS,
      buildCsvRows(filtered)
    );
    showToast(
      'success',
      `${filtered.length} duplicata${filtered.length === 1 ? '' : 's'} exportada${filtered.length === 1 ? '' : 's'}`,
      'O arquivo CSV foi gerado com as linhas filtradas.'
    );
  };

  const handleBulkExport = () => {
    const count = selectedDuplicates.length;
    const dateStamp = new Date().toISOString().slice(0, 10);
    exportToCsv(
      `duplicatas-selecionadas-${dateStamp}.csv`,
      CSV_HEADERS,
      buildCsvRows(selectedDuplicates)
    );
    setSelectedIds(new Set());
    showToast(
      'success',
      `${count} duplicata${count === 1 ? '' : 's'} exportada${count === 1 ? '' : 's'}`,
      'O arquivo CSV foi gerado com as duplicatas selecionadas.'
    );
  };

  const handleBulkCopy = () => {
    const count = selectedDuplicates.length;
    navigator.clipboard?.writeText(
      selectedDuplicates.map((d) => d.numero).join('\n')
    );
    setSelectedIds(new Set());
    showToast(
      'success',
      `${count} número${count === 1 ? '' : 's'} copiado${count === 1 ? '' : 's'}`,
      'Os números das duplicatas foram copiados para a área de transferência.'
    );
  };

  const total = allDuplicates.length;
  const totalValue = allDuplicates.reduce((s, d) => s + d.valor, 0);
  const liquidated = allDuplicates.filter((d) => d.status === 'Liquidada').length;
  const overdue = allDuplicates.filter((d) => d.status === 'Vencida').length;

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="w-full space-y-6">
        <div className="flex items-start justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Duplicatas</h1>
            <p className="text-gray-600 mt-1">
              Visão consolidada de todas as duplicatas registradas pelos fornecedores
              via parceiro de escrituração.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Duplicatas registradas</div>
              <div className="text-xl font-bold text-gray-900">
                {total.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Valor total</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrencyCompact(totalValue)}
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Liquidadas</div>
              <div className="text-xl font-bold text-gray-900">{liquidated}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Vencidas</div>
              <div className="text-xl font-bold text-gray-900">{overdue}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nº, fornecedor ou sacado..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos os fornecedores</option>
                {mockSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s === 'all' ? 'Todos' : s}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  title="Limpar filtros e busca"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  Limpar filtros
                </button>
              )}
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                title="Exportar todas as linhas filtradas em CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="sticky top-0 z-20 px-6 py-3 bg-blue-50 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium text-blue-800">
                {selectedIds.size} duplicata{selectedIds.size === 1 ? '' : 's'}{' '}
                selecionada{selectedIds.size === 1 ? '' : 's'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkExport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
                <button
                  onClick={handleBulkCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar números
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-blue-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar seleção
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="pl-6 pr-2 py-3 w-10">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      aria-label="Selecionar todas as duplicatas filtradas"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3">Nº Duplicata</th>
                  <th className="px-6 py-3">Fornecedor</th>
                  <th className="px-6 py-3">Sacado</th>
                  <th className="px-6 py-3">Emissão</th>
                  <th className="px-6 py-3">Vencimento</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      Nenhuma duplicata encontrada para o filtro atual.
                    </td>
                  </tr>
                )}
                {paginated.map((d) => (
                  <tr
                    key={d.id}
                    className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                      selectedIds.has(d.id) ? 'bg-blue-50/60' : ''
                    }`}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <td
                      className="pl-6 pr-2 py-3 w-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(d.id)}
                        onChange={() => toggleSelectOne(d.id)}
                        aria-label={`Selecionar duplicata ${d.numero}`}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-3 font-medium text-blue-700 hover:underline">
                      {d.numero}
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900">{d.supplierName}</div>
                      <div className="text-xs text-gray-500">{d.supplierCnpj}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-700">{d.sacado}</div>
                      <div className="text-xs text-gray-500">{d.cnpjSacado}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{d.emissao}</td>
                    <td className="px-6 py-3 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                        {d.vencimento}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(d.valor)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={duplicateStatusBadge(d.status)}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-3">
            <div>
              Exibindo{' '}
              {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} de {filtered.length}{' '}
              duplicata{filtered.length === 1 ? '' : 's'} filtrada
              {filtered.length === 1 ? '' : 's'} ({total} no total)
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                Itens por página
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Próxima página"
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="hidden lg:block text-gray-400">
                Clique em uma duplicata para ver detalhes
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <DuplicateDetailModal
          duplicate={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default DuplicatasGeradas;
