import React, { useMemo, useState } from 'react';
import {
  Search,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Download,
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'all' | SupplierDuplicate['status']>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const total = allDuplicates.length;
  const totalValue = allDuplicates.reduce((s, d) => s + d.valor, 0);
  const liquidated = allDuplicates.filter((d) => d.status === 'Liquidada').length;
  const overdue = allDuplicates.filter((d) => d.status === 'Vencida').length;

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Duplicatas</h1>
            <p className="text-gray-600 mt-1">
              Visão consolidada de todas as duplicatas registradas pelos fornecedores
              via parceiro de escrituração.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      Nenhuma duplicata encontrada para o filtro atual.
                    </td>
                  </tr>
                )}
                {filtered.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(d.id)}
                  >
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

          <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <div>
              Exibindo {filtered.length} de {total} duplicatas
            </div>
            <div className="text-gray-400">
              Clique em uma duplicata para ver detalhes
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
