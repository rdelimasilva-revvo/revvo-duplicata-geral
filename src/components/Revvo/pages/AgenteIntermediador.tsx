import React from 'react';
import { Card } from '../ui/Card';
import { FilterAccordion } from '../ui/FilterAccordion';
import {
  Users,
  UserPlus,
  CheckCircle,
  Ticket,
  Clock,
  TrendUp
} from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', value: 45 },
  { month: 'Fev', value: 52 },
  { month: 'Mar', value: 48 },
  { month: 'Abr', value: 61 },
  { month: 'Mai', value: 55 },
  { month: 'Jun', value: 67 },
  { month: 'Jul', value: 73 },
  { month: 'Ago', value: 69 },
  { month: 'Set', value: 78 },
  { month: 'Out', value: 84 },
  { month: 'Nov', value: 91 },
  { month: 'Dez', value: 88 }
];

const topFornecedores = [
  { rank: 1, nome: 'Tech Solutions Brasil Ltda', tickets: 156, valor: 'R$ 2.450.000' },
  { rank: 2, nome: 'Distribuidora Nacional S.A.', tickets: 142, valor: 'R$ 2.180.000' },
  { rank: 3, nome: 'Indústria Metalúrgica XYZ', tickets: 128, valor: 'R$ 1.920.000' },
  { rank: 4, nome: 'Logística Express Corp', tickets: 115, valor: 'R$ 1.750.000' },
  { rank: 5, nome: 'Comércio ABC Ltda ME', tickets: 98, valor: 'R$ 1.450.000' }
];

export const AgenteIntermediador: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Agente Intermediador</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard analítico de fornecedores e operações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-blue-600 uppercase">Total Fornecedores</p>
            <Users size={20} weight="bold" className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-700">248</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs font-medium text-green-600">X 12%</span>
            <span className="text-xs text-blue-600">vs. mês anterior</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-green-600 uppercase">Fornecedores Ativos</p>
            <CheckCircle size={20} weight="bold" className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-700">231</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs font-medium text-green-600">X 8%</span>
            <span className="text-xs text-green-600">vs. mês anterior</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-purple-600 uppercase">Novos Este Mês</p>
            <UserPlus size={20} weight="bold" className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-700">17</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs font-medium text-red-600">X 5%</span>
            <span className="text-xs text-purple-600">vs. mês anterior</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendUp size={18} weight="bold" className="text-[#0066FF]" />
            Top 5 Fornecedores
          </h3>
          <div className="space-y-3">
            {topFornecedores.map((forn) => (
              <div
                key={forn.rank}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-[#0066FF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {forn.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{forn.nome}</p>
                  <p className="text-xs text-gray-500">{forn.tickets} tickets processados</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{forn.valor}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Evolução Mensal de Fornecedores</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
              <Bar dataKey="value" fill="#0066FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">KPIs de Tickets</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-cyan-50 to-white border border-cyan-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-cyan-600 uppercase">Total de Tickets</p>
            <Ticket size={18} weight="bold" className="text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-cyan-700">1.847</p>
          <p className="text-xs text-cyan-600 mt-1">No último mês</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-green-600 uppercase">Tickets Aprovados</p>
            <CheckCircle size={18} weight="bold" className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700">1.623</p>
          <p className="text-xs text-green-600 mt-1">Taxa: 87.9%</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-white border border-yellow-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-yellow-600 uppercase">Em Processamento</p>
            <Clock size={18} weight="bold" className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-700">156</p>
          <p className="text-xs text-yellow-600 mt-1">Aguardando</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-white border border-red-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-red-600 uppercase">Tickets Rejeitados</p>
            <Ticket size={18} weight="bold" className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-700">68</p>
          <p className="text-xs text-red-600 mt-1">Taxa: 3.7%</p>
        </Card>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">KPIs de Prazos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-blue-600 uppercase">Prazo Médio</p>
            <Clock size={18} weight="bold" className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700">2.4 dias</p>
          <p className="text-xs text-blue-600 mt-1">Para aprovação</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-green-600 uppercase">Dentro do Prazo</p>
            <CheckCircle size={18} weight="bold" className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700">94.2%</p>
          <p className="text-xs text-green-600 mt-1">Conformidade</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-white border border-orange-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-orange-600 uppercase">Próximos ao Prazo</p>
            <Clock size={18} weight="bold" className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-700">23</p>
          <p className="text-xs text-orange-600 mt-1">Vencem em 24h</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-white border border-red-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-red-600 uppercase">Fora do Prazo</p>
            <Clock size={18} weight="bold" className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-700">8</p>
          <p className="text-xs text-red-600 mt-1">Requer atenção</p>
        </Card>
      </div>

      <FilterAccordion>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Período</label>
            <select className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]">
              <option>Último Mês</option>
              <option>Últimos 3 Meses</option>
              <option>Últimos 6 Meses</option>
              <option>Último Ano</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fornecedor</label>
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]">
              <option>Todos</option>
              <option>Ativo</option>
              <option>Inativo</option>
              <option>Pendente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]">
              <option>Todos</option>
              <option>Nacional</option>
              <option>Internacional</option>
            </select>
          </div>
        </div>
      </FilterAccordion>
    </div>
  );
};
