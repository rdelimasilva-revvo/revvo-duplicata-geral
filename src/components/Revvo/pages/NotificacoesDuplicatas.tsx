import React, { useState } from 'react';
import { FilterSection, FilterButtons } from '../ui/FilterSection';
import { StatCard } from '../ui/StatCard';
import { StandardButton } from '../../../components/ui';
import {
  DollarSign,
  FileText,
  CheckCircle,
  Users,
  Calendar,
  AlertCircle,
  MoreVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const vencimentosData = [
  { periodo: 'Hoje', valor: 145000, count: 12 },
  { periodo: 'Amanhã', valor: 268000, count: 18 },
  { periodo: '2-3 dias', valor: 352000, count: 24 },
  { periodo: '4-7 dias', valor: 489000, count: 31 },
  { periodo: '8-15 dias', valor: 605000, count: 42 },
  { periodo: '16-30 dias', valor: 578000, count: 38 },
  { periodo: '+30 dias', valor: 425000, count: 28 }
];

const proporcaoPeriodoData = [
  { name: 'Vencido', value: 15, color: '#EF4444' },
  { name: 'Hoje-3 dias', value: 28, color: '#F59E0B' },
  { name: '4-15 dias', value: 32, color: '#3B82F6' },
  { name: '+15 dias', value: 25, color: '#06B6D4' }
];

const topSacadoresData = [
  { nome: 'ABC Indústria S.A.', valor: 1245000, count: 45 },
  { nome: 'Distribuidora Nacional Ltda', valor: 987000, count: 32 },
  { nome: 'Tech Solutions Brasil', valor: 856000, count: 28 },
  { nome: 'Comércio XYZ ME', valor: 745000, count: 24 },
  { nome: 'Logística Express Corp', valor: 623000, count: 19 }
];

interface Duplicata {
  id: string;
  numeroNF: string;
  sacado: string;
  valor: number;
  dataEmissao: string;
  vencimento: string;
  diasVencimento: number;
  diasParaManifestacao: number;
  status: 'a_vencer' | 'vencido' | 'manifestado' | 'critico';
  manifestacao?: string;
}

type SortField = 'dataEmissao' | 'numeroNF' | 'diasVencimento' | 'diasParaManifestacao' | 'sacado' | 'valor';
type SortOrder = 'asc' | 'desc';

const mockDuplicatas: Duplicata[] = [
  {
    id: '1',
    numeroNF: 'NF-2025-0001',
    sacado: 'ABC Indústria S.A.',
    valor: 45600.00,
    dataEmissao: '03/01/2026',
    vencimento: '13/01/2025',
    diasVencimento: 0,
    diasParaManifestacao: 2,
    status: 'critico'
  },
  {
    id: '2',
    numeroNF: 'NF-2025-0002',
    sacado: 'Distribuidora Nacional Ltda',
    valor: 89500.50,
    dataEmissao: '05/01/2026',
    vencimento: '15/01/2025',
    diasVencimento: 2,
    diasParaManifestacao: 8,
    status: 'a_vencer'
  },
  {
    id: '3',
    numeroNF: 'NF-2025-0003',
    sacado: 'Tech Solutions Brasil',
    valor: 32100.00,
    dataEmissao: '30/12/2025',
    vencimento: '10/01/2025',
    diasVencimento: -3,
    diasParaManifestacao: 0,
    status: 'vencido'
  },
  {
    id: '4',
    numeroNF: 'NF-2025-0004',
    sacado: 'Comércio XYZ ME',
    valor: 15750.75,
    dataEmissao: '08/01/2026',
    vencimento: '18/01/2025',
    diasVencimento: 5,
    diasParaManifestacao: 12,
    status: 'a_vencer',
    manifestacao: 'Aceito'
  },
  {
    id: '5',
    numeroNF: 'NF-2025-0005',
    sacado: 'Logística Express Corp',
    valor: 67890.00,
    dataEmissao: '10/01/2026',
    vencimento: '20/01/2025',
    diasVencimento: 7,
    diasParaManifestacao: 0,
    status: 'manifestado',
    manifestacao: 'Desconhecimento'
  },
  {
    id: '6',
    numeroNF: 'NF-2025-0006',
    sacado: 'ABC Indústria S.A.',
    valor: 52300.00,
    dataEmissao: '13/01/2026',
    vencimento: '25/01/2025',
    diasVencimento: 12,
    diasParaManifestacao: 15,
    status: 'a_vencer'
  },
  {
    id: '7',
    numeroNF: 'NF-2025-0007',
    sacado: 'Distribuidora Nacional Ltda',
    valor: 41200.50,
    dataEmissao: '04/01/2026',
    vencimento: '14/01/2025',
    diasVencimento: 1,
    diasParaManifestacao: 5,
    status: 'a_vencer'
  },
  {
    id: '8',
    numeroNF: 'NF-2025-0008',
    sacado: 'Tech Solutions Brasil',
    valor: 28900.00,
    dataEmissao: '12/01/2026',
    vencimento: '22/01/2025',
    diasVencimento: 9,
    diasParaManifestacao: 14,
    status: 'a_vencer'
  }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
        <p className="font-semibold mb-1">{payload[0].payload.periodo}</p>
        <p className="text-cyan-400">
          Valor: R$ {payload[0].value.toLocaleString('pt-BR')}
        </p>
        <p className="text-gray-300">
          Duplicatas: {payload[0].payload.count}
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const NotificacoesDuplicatas: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalAPagar = mockDuplicatas.reduce((sum, d) => sum + d.valor, 0);
  const totalAtivos = mockDuplicatas.length;
  const manifestados = mockDuplicatas.filter(d => d.manifestacao).length;
  const totalSacados = new Set(mockDuplicatas.map(d => d.sacado)).size;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(mockDuplicatas.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedDuplicatas = () => {
    if (!sortField) return mockDuplicatas;

    return [...mockDuplicatas].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'valor') {
        aValue = a.valor;
        bValue = b.valor;
      } else if (sortField === 'diasVencimento' || sortField === 'diasParaManifestacao') {
        aValue = a[sortField];
        bValue = b[sortField];
      } else if (sortField === 'sacado' || sortField === 'numeroNF') {
        aValue = a[sortField].toLowerCase();
        bValue = b[sortField].toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedDuplicatas = getSortedDuplicatas();

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const getManifestationBadge = (dias: number) => {
    if (dias === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Expirado
        </span>
      );
    }
    if (dias <= 2) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          {dias}d - Urgente
        </span>
      );
    }
    if (dias <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          {dias}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        {dias}d
      </span>
    );
  };

  const getStatusBadge = (status: string, diasVencimento: number) => {
    if (status === 'vencido' || diasVencimento < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Vencido
        </span>
      );
    }
    if (status === 'critico' || diasVencimento === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          Crítico
        </span>
      );
    }
    if (status === 'manifestado') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Manifestado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        A Vencer
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Notificações de Duplicatas - Contas a Pagar
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e gerencie as duplicatas a pagar
          </p>
        </div>

        <FilterSection title="Filtros de Pesquisa">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Data de Vencimento
              </label>
              <input
                type="date"
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Código do Cliente/Sacador
              </label>
              <input
                type="text"
                placeholder="Digite o código..."
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Todos</option>
                <option>A Vencer</option>
                <option>Vencido</option>
                <option>Manifestado</option>
                <option>Crítico</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Valor Mínimo
              </label>
              <input
                type="text"
                placeholder="R$ 0,00"
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <FilterButtons
            onClear={() => console.log('Limpar filtros')}
            onApply={() => console.log('Aplicar filtros')}
          />
        </FilterSection>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="A Pagar"
            value={`R$ ${(totalAPagar / 1000).toFixed(0)}k`}
            subtitle={`Total: R$ ${totalAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend={{ value: '+12.5%', isPositive: false }}
            icon={<DollarSign size={20} />}
          />
          <StatCard
            title="Total de Ativos"
            value={totalAtivos}
            subtitle="Duplicatas ativas"
            trend={{ value: '+8', isPositive: true }}
            icon={<FileText size={20} />}
          />
          <StatCard
            title="Manifestados"
            value={manifestados}
            subtitle={`${((manifestados / totalAtivos) * 100).toFixed(1)}% do total`}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="Total de Sacados"
            value={totalSacados}
            subtitle="Clientes únicos"
            icon={<Users size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">
                  Próximos Vencimentos
                </h3>
                <span className="text-xs text-gray-500">Valor em R$ mil</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vencimentosData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="periodo"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                  <Bar dataKey="valor" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Proporção por Período
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={proporcaoPeriodoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={CustomPieLabel}
                    labelLine={false}
                  >
                    {proporcaoPeriodoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {proporcaoPeriodoData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Top 5 Sacadores
              </h3>
              <div className="space-y-3">
                {topSacadoresData.map((sacador, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-gray-700 font-medium truncate mr-2">
                        {sacador.nome}
                      </span>
                      <span className="text-gray-900 font-bold">
                        {(sacador.valor / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full"
                        style={{ width: `${(sacador.valor / 1245000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800 mb-1">
              Atenção aos Prazos Legais
            </p>
            <p className="text-xs text-yellow-700">
              3 duplicatas requerem manifestação imediata. O prazo legal para manifestação é de até 3 dias úteis após o vencimento.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === mockDuplicatas.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('dataEmissao')}
                  >
                    <div className="flex items-center gap-1">
                      Data
                      {renderSortIcon('dataEmissao')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('numeroNF')}
                  >
                    <div className="flex items-center gap-1">
                      Número Duplicata
                      {renderSortIcon('numeroNF')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('diasVencimento')}
                  >
                    <div className="flex items-center gap-1">
                      Qtd Dias Pendente
                      {renderSortIcon('diasVencimento')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('sacado')}
                  >
                    <div className="flex items-center gap-1">
                      Emitente
                      {renderSortIcon('sacado')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('diasParaManifestacao')}
                  >
                    <div className="flex items-center gap-1">
                      Tempo p/ Manifestação
                      {renderSortIcon('diasParaManifestacao')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleSort('valor')}
                  >
                    <div className="flex items-center gap-1">
                      Valor
                      {renderSortIcon('valor')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedDuplicatas.map((dup) => (
                  <tr
                    key={dup.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(dup.id)}
                        onChange={() => handleSelectOne(dup.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dup.dataEmissao}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {dup.numeroNF}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        dup.diasVencimento < 0 ? 'text-red-600' :
                        dup.diasVencimento === 0 ? 'text-orange-600' :
                        dup.diasVencimento <= 3 ? 'text-yellow-600' :
                        'text-gray-700'
                      }`}>
                        {dup.diasVencimento < 0 ? `${Math.abs(dup.diasVencimento)}d atrás` :
                         dup.diasVencimento === 0 ? 'Hoje' :
                         `${dup.diasVencimento}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dup.sacado}
                    </td>
                    <td className="px-4 py-3">
                      {getManifestationBadge(dup.diasParaManifestacao)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      R$ {dup.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === dup.id ? null : dup.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>
                      {openMenuId === dup.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                console.log('Abatimentos', dup.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Abatimentos
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                console.log('Acordo comercial', dup.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Acordo comercial
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedIds.size > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">
                {selectedIds.size} item(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <StandardButton variant="secondary" size="sm">
                  Exportar Selecionados
                </StandardButton>
                <StandardButton variant="primary" size="sm">
                  Processar em Lote
                </StandardButton>
              </div>
            </div>
          )}

          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1-8</span> de <span className="font-medium">8</span> resultados
            </span>
            <div className="flex gap-2">
              <StandardButton variant="secondary" size="sm" disabled>
                Anterior
              </StandardButton>
              <StandardButton variant="primary" size="sm">
                1
              </StandardButton>
              <StandardButton variant="secondary" size="sm" disabled>
                Próximo
              </StandardButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
