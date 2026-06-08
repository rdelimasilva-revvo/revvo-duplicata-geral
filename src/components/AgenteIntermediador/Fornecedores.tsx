import React, { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Eye,
  X,
  FileText,
  DollarSign,
  Building2,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Plus,
} from 'lucide-react';
import { mockSuppliers, Supplier, SupplierDuplicate } from './mockSuppliers';
import NovoFornecedorWizard from './NovoFornecedorWizard';

const ClubeAntecipacaoToggle: React.FC<{
  active: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}> = ({ active, onToggle, size = 'sm' }) => {
  const dims =
    size === 'sm'
      ? { track: 'w-9 h-5', knob: 'w-3.5 h-3.5', translate: 'translate-x-4' }
      : { track: 'w-11 h-6', knob: 'w-4 h-4', translate: 'translate-x-5' };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative inline-flex items-center ${dims.track} rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
        active ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block ${dims.knob} bg-white rounded-full shadow transform transition-transform ${
          active ? dims.translate : 'translate-x-1'
        }`}
      />
    </button>
  );
};

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

const statusBadge = (status: Supplier['status']) => {
  const map = {
    Ativo: 'bg-green-50 text-green-700 border-green-200',
    Pendente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Inativo: 'bg-gray-100 text-gray-600 border-gray-200',
  } as const;
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status]}`;
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

const SupplierDrawer: React.FC<{
  supplier: Supplier;
  onClose: () => void;
  onToggleClube: (id: string) => void;
}> = ({ supplier, onClose, onToggleClube }) => {
  const totalValue = supplier.duplicates.reduce((s, d) => s + d.valor, 0);
  const liquidated = supplier.duplicates.filter((d) => d.status === 'Liquidada').length;
  const overdue = supplier.duplicates.filter((d) => d.status === 'Vencida').length;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={`Duplicatas de ${supplier.name}`}
    >
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-blue-600">
              Fornecedor
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{supplier.name}</h2>
            <div className="text-sm text-gray-500 mt-1">
              CNPJ {supplier.cnpj} · {supplier.city}/{supplier.state}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50">
              <Zap
                className={`w-4 h-4 ${
                  supplier.clubeAntecipacao ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              <span className="text-xs font-medium text-gray-700">
                Clube de Antecipação
              </span>
              <ClubeAntecipacaoToggle
                active={supplier.clubeAntecipacao}
                onToggle={() => onToggleClube(supplier.id)}
                size="md"
              />
              <span
                className={`text-xs font-semibold ${
                  supplier.clubeAntecipacao ? 'text-blue-700' : 'text-gray-500'
                }`}
              >
                {supplier.clubeAntecipacao ? 'Ativo' : 'Inativo'}
              </span>
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

        <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50">
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Duplicatas listadas
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {supplier.duplicates.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Valor exibido
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {formatCurrencyCompact(totalValue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Liquidadas
            </div>
            <div className="text-lg font-bold text-green-700 mt-1">{liquidated}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Vencidas
            </div>
            <div className="text-lg font-bold text-red-700 mt-1">{overdue}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white sticky top-0 z-10 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Nº Duplicata</th>
                <th className="px-6 py-3">Sacado</th>
                <th className="px-6 py-3">Emissão</th>
                <th className="px-6 py-3">Vencimento</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {supplier.duplicates.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{d.numero}</td>
                  <td className="px-6 py-3 text-gray-700">
                    <div>{d.sacado}</div>
                    <div className="text-xs text-gray-500">{d.cnpjSacado}</div>
                  </td>
                  <td className="px-6 py-3 text-gray-700">{d.emissao}</td>
                  <td className="px-6 py-3 text-gray-700">{d.vencimento}</td>
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

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <div className="text-xs text-gray-500">
            Última atividade em {supplier.lastActivity}
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

const Fornecedores: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Supplier['status']>('all');
  const [clubeFilter, setClubeFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleCreateSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => [supplier, ...prev]);
  };

  const toggleClube = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, clubeAntecipacao: !s.clubeAntecipacao } : s
      )
    );
  };

  const selected = useMemo(
    () => suppliers.find((s) => s.id === selectedId) ?? null,
    [suppliers, selectedId]
  );

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.cnpj.includes(search);
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchClube =
        clubeFilter === 'all' ||
        (clubeFilter === 'active' && s.clubeAntecipacao) ||
        (clubeFilter === 'inactive' && !s.clubeAntecipacao);
      return matchSearch && matchStatus && matchClube;
    });
  }, [suppliers, search, statusFilter, clubeFilter]);

  const totalSuppliers = suppliers.length;
  const totalDuplicates = suppliers.reduce((s, x) => s + x.totalDuplicates, 0);
  const totalBilled = suppliers.reduce((s, x) => s + x.totalBilled, 0);
  const totalClube = suppliers.filter((s) => s.clubeAntecipacao).length;

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600 mt-1">
              Lista de fornecedores que emitiram duplicatas via parceiro de escrituração.
              Clique em um fornecedor para visualizar suas duplicatas geradas.
            </p>
          </div>
          <button
            onClick={() => setWizardOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Fornecedores listados</div>
              <div className="text-xl font-bold text-gray-900">{totalSuppliers}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Duplicatas acumuladas</div>
              <div className="text-xl font-bold text-gray-900">
                {totalDuplicates.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Volume total faturado</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrencyCompact(totalBilled)}
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">No Clube de Antecipação</div>
              <div className="text-xl font-bold text-gray-900">
                {totalClube}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  / {totalSuppliers}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou CNPJ..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-2">
                {(['all', 'Ativo', 'Pendente', 'Inativo'] as const).map((s) => (
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
              <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />
              <div className="flex gap-2">
                {(
                  [
                    { key: 'all', label: 'Clube: Todos' },
                    { key: 'active', label: 'No Clube' },
                    { key: 'inactive', label: 'Fora do Clube' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setClubeFilter(opt.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      clubeFilter === opt.key
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Fornecedor</th>
                  <th className="px-6 py-3">Localização</th>
                  <th className="px-6 py-3 text-right">Duplicatas</th>
                  <th className="px-6 py-3 text-right">Total Faturado</th>
                  <th className="px-6 py-3 text-right">Ticket Médio</th>
                  <th className="px-6 py-3 text-center">Prazo Médio</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Clube Antec.</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                      Nenhum fornecedor encontrado para o filtro atual.
                    </td>
                  </tr>
                )}
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedId(s.id)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">CNPJ {s.cnpj}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {s.city}/{s.state}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {s.totalDuplicates.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {formatCurrencyCompact(s.totalBilled)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700">
                      {formatCurrency(s.averageTicket)}
                    </td>
                    <td className="px-6 py-3 text-center text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {s.averageDays} dias
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={statusBadge(s.status)}>{s.status}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <ClubeAntecipacaoToggle
                          active={s.clubeAntecipacao}
                          onToggle={() => toggleClube(s.id)}
                        />
                        <span
                          className={`text-xs font-medium ${
                            s.clubeAntecipacao ? 'text-blue-700' : 'text-gray-400'
                          }`}
                        >
                          {s.clubeAntecipacao ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(s.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver duplicatas
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <SupplierDrawer
          supplier={selected}
          onClose={() => setSelectedId(null)}
          onToggleClube={toggleClube}
        />
      )}

      {wizardOpen && (
        <NovoFornecedorWizard
          onClose={() => setWizardOpen(false)}
          onCreate={handleCreateSupplier}
        />
      )}
    </div>
  );
};

export default Fornecedores;
