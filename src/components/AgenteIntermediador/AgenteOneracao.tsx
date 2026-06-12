import React, { useMemo, useState } from 'react';
import {
  Lock,
  Unlock,
  Search,
  Building,
  FileText,
  DollarSign,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Plus,
  X,
  Eye,
  Hash,
  Banknote,
  Link2,
} from 'lucide-react';
import { mockSuppliers } from './mockSuppliers';

type OneracaoStatus = 'Ativa' | 'Liberada' | 'Pendente' | 'Vencida';
type OneracaoTipo = 'Penhor' | 'Cessão Fiduciária' | 'Caução';

interface Oneracao {
  id: string;
  numero: string;
  duplicataNumero: string;
  duplicataId: string;
  supplierId: string;
  supplierName: string;
  supplierCnpj: string;
  instituicao: string;
  instituicaoCodigo: string;
  tipo: OneracaoTipo;
  valor: number;
  dataOneracao: string;
  validade: string;
  status: OneracaoStatus;
  observacao?: string;
}

const INSTITUICOES = [
  { codigo: '341', nome: 'Banco Itaú S.A.' },
  { codigo: '237', nome: 'Banco Bradesco S.A.' },
  { codigo: '001', nome: 'Banco do Brasil S.A.' },
  { codigo: '033', nome: 'Banco Santander S.A.' },
  { codigo: '104', nome: 'Caixa Econômica Federal' },
  { codigo: '260', nome: 'Nu Pagamentos S.A.' },
];

const buildOneracoes = (): Oneracao[] => {
  const tipos: OneracaoTipo[] = ['Penhor', 'Cessão Fiduciária', 'Caução'];
  const statuses: OneracaoStatus[] = [
    'Ativa',
    'Liberada',
    'Ativa',
    'Pendente',
    'Vencida',
    'Ativa',
    'Liberada',
    'Ativa',
  ];
  const result: Oneracao[] = [];
  let counter = 1;
  mockSuppliers.slice(0, 6).forEach((s, sIdx) => {
    const take = Math.min(s.duplicates.length, 3 + (sIdx % 2));
    for (let i = 0; i < take; i++) {
      const dup = s.duplicates[i];
      const inst = INSTITUICOES[(sIdx + i) % INSTITUICOES.length];
      const tipo = tipos[(sIdx + i) % tipos.length];
      const status = statuses[(counter - 1) % statuses.length];
      const onDay = ((counter * 3) % 27) + 1;
      const valDay = ((counter * 5) % 27) + 1;
      result.push({
        id: `one-${String(counter).padStart(3, '0')}`,
        numero: `ON-2026-${String(counter).padStart(4, '0')}`,
        duplicataNumero: dup.numero,
        duplicataId: dup.id,
        supplierId: s.id,
        supplierName: s.name,
        supplierCnpj: s.cnpj,
        instituicao: inst.nome,
        instituicaoCodigo: inst.codigo,
        tipo,
        valor: dup.valor * (0.7 + (i % 3) * 0.1),
        dataOneracao: `${String(onDay).padStart(2, '0')}/05/2026`,
        validade: `${String(valDay).padStart(2, '0')}/09/2026`,
        status,
        observacao:
          status === 'Vencida'
            ? 'Renovação não realizada — necessária reavaliação do contrato.'
            : status === 'Pendente'
              ? 'Aguardando confirmação da instituição financeira.'
              : undefined,
      });
      counter += 1;
    }
  });
  return result;
};

const initialOneracoes = buildOneracoes();

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

const statusMeta: Record<
  OneracaoStatus,
  { badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Ativa: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Lock,
  },
  Liberada: {
    badge: 'bg-green-50 text-green-700 border-green-200',
    icon: Unlock,
  },
  Pendente: {
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: CalendarClock,
  },
  Vencida: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertTriangle,
  },
};

const StatusBadge: React.FC<{ status: OneracaoStatus }> = ({ status }) => {
  const m = statusMeta[status];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${m.badge}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const tipoBadge = (tipo: OneracaoTipo) => {
  const map: Record<OneracaoTipo, string> = {
    Penhor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Cessão Fiduciária': 'bg-purple-50 text-purple-700 border-purple-200',
    Caução: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[tipo]}`;
};

const OneracaoDetailModal: React.FC<{
  oneracao: Oneracao;
  onClose: () => void;
  onLiberar: (id: string) => void;
}> = ({ oneracao: o, onClose, onLiberar }) => {
  const timeline = [
    { label: 'Oneração registrada', date: o.dataOneracao, done: true, tone: 'blue' as const },
    { label: 'Confirmação da instituição', date: o.dataOneracao, done: o.status !== 'Pendente', tone: 'blue' as const },
    { label: 'Vigência ativa', date: o.dataOneracao, done: o.status === 'Ativa' || o.status === 'Liberada' || o.status === 'Vencida', tone: 'blue' as const },
    {
      label:
        o.status === 'Liberada'
          ? 'Oneração liberada'
          : o.status === 'Vencida'
            ? 'Vencimento sem renovação'
            : 'Validade prevista',
      date: o.validade,
      done: o.status === 'Liberada' || o.status === 'Vencida',
      tone:
        o.status === 'Liberada'
          ? ('green' as const)
          : o.status === 'Vencida'
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
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-indigo-600">
                Oneração
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">{o.numero}</h2>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={o.status} />
                <span className={tipoBadge(o.tipo)}>{o.tipo}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {o.observacao && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-900">{o.observacao}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" /> Valor onerado
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(o.valor)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Data da oneração
              </div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {o.dataOneracao}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Validade
              </div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {o.validade}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Instituição (Agente)
              </div>
              <div className="mt-2">
                <div className="font-semibold text-gray-900">{o.instituicao}</div>
                <div className="text-sm text-gray-500">Código {o.instituicaoCodigo}</div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Fornecedor
              </div>
              <div className="mt-2">
                <div className="font-semibold text-gray-900">{o.supplierName}</div>
                <div className="text-sm text-gray-500">CNPJ {o.supplierCnpj}</div>
              </div>
            </div>
          </div>

          <div className="border border-blue-100 bg-blue-50/40 rounded-lg p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> Duplicata vinculada
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" />
              <div className="font-mono font-semibold text-gray-900">
                {o.duplicataNumero}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Linha do tempo
            </div>
            <ol className="flex items-center gap-3">
              {timeline.map((step, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      step.done ? toneDot[step.tone] : 'bg-gray-200'
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      step.done ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < timeline.length - 1 && (
                    <span className="text-gray-300 mx-1">→</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-2">
            {o.status === 'Ativa' && (
              <button
                onClick={() => onLiberar(o.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg"
              >
                <Unlock className="w-3.5 h-3.5" />
                Liberar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgenteOneracao: React.FC = () => {
  const [oneracoes, setOneracoes] = useState<Oneracao[]>(initialOneracoes);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OneracaoStatus>('all');
  const [instFilter, setInstFilter] = useState<string>('all');
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      oneracoes.filter((o) => {
        const matchSearch =
          !search ||
          o.numero.toLowerCase().includes(search.toLowerCase()) ||
          o.duplicataNumero.toLowerCase().includes(search.toLowerCase()) ||
          o.supplierName.toLowerCase().includes(search.toLowerCase()) ||
          o.instituicao.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        const matchInst =
          instFilter === 'all' || o.instituicaoCodigo === instFilter;
        return matchSearch && matchStatus && matchInst;
      }),
    [oneracoes, search, statusFilter, instFilter]
  );

  const detail = oneracoes.find((o) => o.id === detailId) ?? null;

  const counts = {
    total: oneracoes.length,
    ativa: oneracoes.filter((o) => o.status === 'Ativa').length,
    liberada: oneracoes.filter((o) => o.status === 'Liberada').length,
    pendente: oneracoes.filter((o) => o.status === 'Pendente').length,
    vencida: oneracoes.filter((o) => o.status === 'Vencida').length,
  };
  const totalValorAtivo = oneracoes
    .filter((o) => o.status === 'Ativa')
    .reduce((s, o) => s + o.valor, 0);

  const liberar = (id: string) => {
    setOneracoes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Liberada' } : o))
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="w-full space-y-6">
        <div className="flex items-start justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agente de oneração</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe duplicatas oneradas (penhor, cessão fiduciária ou caução)
              junto às instituições financeiras parceiras.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nova oneração
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Onerações</div>
              <div className="text-xl font-bold text-gray-900">{counts.total}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Ativas</div>
              <div className="text-xl font-bold text-gray-900">{counts.ativa}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Liberadas</div>
              <div className="text-xl font-bold text-gray-900">{counts.liberada}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Vencidas / Pendentes</div>
              <div className="text-xl font-bold text-gray-900">
                {counts.vencida + counts.pendente}
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Valor onerado (ativo)</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrencyCompact(totalValorAtivo)}
              </div>
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
                placeholder="Buscar por nº, duplicata, fornecedor ou instituição..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={instFilter}
                onChange={(e) => setInstFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todas as instituições</option>
                {INSTITUICOES.map((i) => (
                  <option key={i.codigo} value={i.codigo}>
                    {i.codigo} — {i.nome}
                  </option>
                ))}
              </select>
              {(['all', 'Ativa', 'Liberada', 'Pendente', 'Vencida'] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      statusFilter === s
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'all' ? 'Todos' : s}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Nº Oneração</th>
                  <th className="px-6 py-3">Duplicata</th>
                  <th className="px-6 py-3">Fornecedor</th>
                  <th className="px-6 py-3">Instituição</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                  <th className="px-6 py-3">Validade</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                      Nenhuma oneração encontrada.
                    </td>
                  </tr>
                )}
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                    onClick={() => setDetailId(o.id)}
                  >
                    <td className="px-6 py-3 font-medium text-indigo-700 hover:underline">
                      {o.numero}
                    </td>
                    <td className="px-6 py-3 text-gray-700 font-mono text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-gray-400" />
                        {o.duplicataNumero}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900">{o.supplierName}</div>
                      <div className="text-xs text-gray-500">{o.supplierCnpj}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-gray-900 text-xs">{o.instituicao}</div>
                          <div className="text-xs text-gray-500">
                            Código {o.instituicaoCodigo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={tipoBadge(o.tipo)}>{o.tipo}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(o.valor)}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                        {o.validade}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailId(o.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                        aria-label="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <div>
              Exibindo {filtered.length} de {oneracoes.length} onerações
            </div>
            <div className="text-gray-400">
              Clique em uma oneração para ver detalhes
            </div>
          </div>
        </div>
      </div>

      {detail && (
        <OneracaoDetailModal
          oneracao={detail}
          onClose={() => setDetailId(null)}
          onLiberar={(id) => {
            liberar(id);
            setDetailId(null);
          }}
        />
      )}
    </div>
  );
};

export default AgenteOneracao;
