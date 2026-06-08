import React, { useState } from 'react';
import {
  FileText,
  Clock,
  ProhibitInset,
  CheckCircle,
  CaretDown,
  CaretUp,
  DotsThree,
  Calendar
} from '@phosphor-icons/react';
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
  Legend,
  ResponsiveContainer
} from 'recharts';

const KPICard = ({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  footer
}: {
  icon: any;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
  footer?: { label: string; value: string };
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconBg} rounded-lg p-3`}>
        <Icon size={24} className={iconColor} weight="regular" />
      </div>
    </div>
    {footer && (
      <>
        <div className="border-t border-gray-100 mt-4 pt-4">
          <p className="text-xs text-gray-500">{footer.label}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">{footer.value}</p>
        </div>
      </>
    )}
  </div>
);

const Badge = ({
  children,
  variant = 'default'
}: {
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'danger' | 'info'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const topSuppliers = [
  { name: 'Metalúrgica São Paulo Ltda', value: 850000 },
  { name: 'Comércio ABC Distribuidora', value: 720000 },
  { name: 'Indústria XYZ S.A.', value: 680000 },
  { name: 'Logística Nacional Express', value: 540000 },
  { name: 'Fornecedora Prime Materials', value: 420000 }
];

const periodData = [
  { name: 'Até 15 dias', value: 35, color: '#3B82F6' },
  { name: '16 a 30 dias', value: 42, color: '#F59E0B' },
  { name: '31 a 60 dias', value: 18, color: '#6B7280' },
  { name: 'Acima de 60 dias', value: 5, color: '#EF4444' }
];

const mockNotifications = [
  {
    id: '001234',
    type: 'Mercantil',
    issueDate: '10/01/2026',
    value: 125000,
    dueDate: '25/02/2026',
    issuer: 'Metalúrgica São Paulo Ltda',
    cnpj: '12.345.678/0001-90',
    deadline: '2 dias',
    deadlineVariant: 'danger' as const,
    status: 'Pendente',
    statusVariant: 'warning' as const
  },
  {
    id: '001235',
    type: 'Mercantil',
    issueDate: '10/01/2026',
    value: 87500,
    dueDate: '28/02/2026',
    issuer: 'Comércio ABC Distribuidora',
    cnpj: '98.765.432/0001-10',
    deadline: 'Vence hoje',
    deadlineVariant: 'danger' as const,
    status: 'Pendente',
    statusVariant: 'warning' as const
  },
  {
    id: '001236',
    type: 'Mercantil',
    issueDate: '08/01/2026',
    value: 65000,
    dueDate: '20/02/2026',
    issuer: 'Indústria XYZ S.A.',
    cnpj: '11.222.333/0001-44',
    deadline: '5 dias',
    deadlineVariant: 'warning' as const,
    status: 'Aceito',
    statusVariant: 'success' as const
  },
  {
    id: '001237',
    type: 'Mercantil',
    issueDate: '05/01/2026',
    value: 42000,
    dueDate: '15/02/2026',
    issuer: 'Logística Nacional Express',
    cnpj: '22.333.444/0001-55',
    deadline: '8 dias',
    deadlineVariant: 'info' as const,
    status: 'Aceito',
    statusVariant: 'success' as const
  },
  {
    id: '001238',
    type: 'Mercantil',
    issueDate: '03/01/2026',
    value: 33000,
    dueDate: '10/02/2026',
    issuer: 'Fornecedora Prime Materials',
    cnpj: '33.444.555/0001-66',
    deadline: 'Expirado',
    deadlineVariant: 'default' as const,
    status: 'Recusado',
    statusVariant: 'danger' as const
  }
];

export default function NotificacoesDuplicatasPage() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(mockNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, id]);
    } else {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatSupplierValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-[1600px] mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Duplicatas Recebidas
          </h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar size={18} />
            Últimos 30 dias
          </button>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={FileText}
            label="Apresentadas"
            value="1.240"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            icon={Clock}
            label="Pendente"
            value="48"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <KPICard
            icon={ProhibitInset}
            label="Rejeitadas"
            value="12"
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
          <KPICard
            icon={CheckCircle}
            label="Aceitas"
            value="1.180"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            footer={{
              label: 'Por decurso de prazo',
              value: 'R$ 450.000,00'
            }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top 5 Sacadores - Duplicatas Recebidas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topSuppliers}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={formatSupplierValue} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={180}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="value" fill="#14B8A6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Proporção por Período
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={periodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {periodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-xl"
          >
            <span className="font-semibold text-gray-900">Filtros de Notificações</span>
            {showFilters ? (
              <CaretUp size={20} className="text-gray-500" />
            ) : (
              <CaretDown size={20} className="text-gray-500" />
            )}
          </button>
          {showFilters && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Todos</option>
                    <option>Pendente</option>
                    <option>Aceito</option>
                    <option>Recusado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emitente
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CNPJ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prazo
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Todos</option>
                    <option>Crítico (até 2 dias)</option>
                    <option>Atenção (3-5 dias)</option>
                    <option>Normal (mais de 5 dias)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedNotifications.length > 0 ? (
                <span className="font-medium text-gray-900">
                  {selectedNotifications.length} notificação(ões) selecionada(s)
                </span>
              ) : (
                'Nenhuma notificação selecionada'
              )}
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Manifestar aceite/recusa em lote
            </button>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === mockNotifications.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duplicata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Data Emissão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Emitente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Prazo Manifestação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => handleSelectOne(notification.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{notification.type}</div>
                        <div className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                          #{notification.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {notification.issueDate}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(notification.value)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {notification.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.issuer}</div>
                        <div className="text-xs text-gray-500">{notification.cnpj}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={notification.deadlineVariant}>
                        {notification.deadline}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={notification.statusVariant}>
                        {notification.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(
                            activeDropdown === notification.id ? null : notification.id
                          )}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <DotsThree size={20} className="text-gray-600" />
                        </button>
                        {activeDropdown === notification.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              Ver detalhes
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              Manifestação
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              Abatimento/Acordo Comercial
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-medium">1</span> a{' '}
              <span className="font-medium">{mockNotifications.length}</span> de{' '}
              <span className="font-medium">48</span> notificações
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Anterior
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Próximo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
