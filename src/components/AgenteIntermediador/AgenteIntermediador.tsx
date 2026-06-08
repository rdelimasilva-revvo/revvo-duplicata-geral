import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

// Mock data for the dashboard
const mockData = {
  volumes: {
    totalDuplicates: 45680,
    totalBilled: 125600000, // R$ 125.6M
    billedToSacado: 89200000, // R$ 89.2M
    billedToSacadoOutros: 36400000, // R$ 36.4M
    growthRate: 12.5
  },
  tickets: {
    averageTicket: 2750,
    medianTicket: 1850,
    maxTicket: 45000,
    minTicket: 150,
    ticketGrowth: 8.3
  },
  deadlines: {
    averageDays: 32,
    medianDays: 28,
    maxDays: 90,
    minDays: 7,
    onTimeRate: 87.5
  },
  suppliers: {
    totalSuppliers: 1250,
    activeSuppliers: 1180,
    newSuppliers: 45,
    topSuppliers: [
      { name: 'Fornecedor Alpha Ltda', duplicates: 2340, value: 8500000 },
      { name: 'Beta Indústria S.A.', duplicates: 1890, value: 6750000 },
      { name: 'Gamma Comércio Ltda', duplicates: 1650, value: 5200000 },
      { name: 'Delta Serviços S.A.', duplicates: 1420, value: 4800000 },
      { name: 'Epsilon Tech Ltda', duplicates: 1280, value: 4200000 }
    ]
  },
  monthlyData: [
    { month: 'Jan', duplicates: 3800, billed: 10200000 },
    { month: 'Fev', duplicates: 4100, billed: 11500000 },
    { month: 'Mar', duplicates: 3950, billed: 10800000 },
    { month: 'Abr', duplicates: 4300, billed: 12100000 },
    { month: 'Mai', duplicates: 4650, billed: 13200000 },
    { month: 'Jun', duplicates: 4200, billed: 11800000 }
  ]
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className={`p-6 rounded-lg border border-gray-200 shadow-sm bg-white ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white p-6 rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const ProgressBar = ({ label, value, total, color = 'blue', showPercentage = true }) => {
  const percentage = (value / total) * 100;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-gray-900 font-medium">{value.toLocaleString('pt-BR')}</span>
          {showPercentage && (
            <span className="text-gray-500">({percentage.toFixed(1)}%)</span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

const AgenteIntermediador = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCurrencyCompact = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agente Intermediador</h1>
            <p className="text-gray-600 mt-1">
              Análise de duplicatas criadas pelos fornecedores - {currentTime.toLocaleDateString('pt-BR')} às {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
        </div>

        {/* Volume de Duplicatas */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-blue-600 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">Volume de Duplicatas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Duplicatas"
              value={mockData.volumes.totalDuplicates.toLocaleString('pt-BR')}
              subtitle="Criadas pelos fornecedores"
              icon={FileText}
              trend="up"
              trendValue={`+${mockData.volumes.growthRate}%`}
              color="blue"
            />
            <StatCard
              title="Valor Total Faturado"
              value={formatCurrencyCompact(mockData.volumes.totalBilled)}
              subtitle="Soma de todas as duplicatas"
              icon={DollarSign}
              trend="up"
              trendValue="+15.2%"
              color="green"
            />
            <StatCard
              title="Faturado vs Sacado"
              value={formatCurrencyCompact(mockData.volumes.billedToSacado)}
              subtitle={`${((mockData.volumes.billedToSacado / mockData.volumes.totalBilled) * 100).toFixed(1)}% do total`}
              icon={Target}
              color="indigo"
            />
            <StatCard
              title="Faturado vs Sacado-Outros"
              value={formatCurrencyCompact(mockData.volumes.billedToSacadoOutros)}
              subtitle={`${((mockData.volumes.billedToSacadoOutros / mockData.volumes.totalBilled) * 100).toFixed(1)}% do total`}
              icon={Building2}
              color="purple"
            />
          </div>
        </div>

        {/* Distribuição de Faturamento */}
        <ChartCard title="Distribuição de Faturamento" className="col-span-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ProgressBar
                label="Sacado Direto"
                value={mockData.volumes.billedToSacado}
                total={mockData.volumes.totalBilled}
                color="indigo"
                showPercentage={false}
              />
              <ProgressBar
                label="Sacado-Outros"
                value={mockData.volumes.billedToSacadoOutros}
                total={mockData.volumes.totalBilled}
                color="purple"
                showPercentage={false}
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {((mockData.volumes.billedToSacado / mockData.volumes.totalBilled) * 100).toFixed(1)}%
                </div>
                <div className="text-gray-700 font-medium">Concentração Sacado Direto</div>
                <div className="text-sm text-gray-500 mt-1">
                  Maior parte do faturamento
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* KPIs de Tickets */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-green-600 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">KPIs de Tickets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Ticket Médio"
              value={formatCurrency(mockData.tickets.averageTicket)}
              subtitle="Por duplicata"
              icon={BarChart3}
              trend="up"
              trendValue={`+${mockData.tickets.ticketGrowth}%`}
              color="green"
            />
            <StatCard
              title="Ticket Mediano"
              value={formatCurrency(mockData.tickets.medianTicket)}
              subtitle="Valor central"
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Maior Ticket"
              value={formatCurrency(mockData.tickets.maxTicket)}
              subtitle="Valor máximo"
              icon={ArrowUpRight}
              color="purple"
            />
            <StatCard
              title="Menor Ticket"
              value={formatCurrency(mockData.tickets.minTicket)}
              subtitle="Valor mínimo"
              icon={ArrowDownRight}
              color="yellow"
            />
            <StatCard
              title="Variação"
              value={`${((mockData.tickets.maxTicket / mockData.tickets.minTicket)).toFixed(0)}x`}
              subtitle="Max vs Min"
              icon={TrendingUp}
              color="indigo"
            />
          </div>
        </div>

        {/* KPIs de Prazos */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-yellow-600 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">KPIs de Prazos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Prazo Médio"
              value={`${mockData.deadlines.averageDays} dias`}
              subtitle="Tempo médio de vencimento"
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Prazo Mediano"
              value={`${mockData.deadlines.medianDays} dias`}
              subtitle="Prazo central"
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Maior Prazo"
              value={`${mockData.deadlines.maxDays} dias`}
              subtitle="Prazo máximo"
              icon={ArrowUpRight}
              color="red"
            />
            <StatCard
              title="Menor Prazo"
              value={`${mockData.deadlines.minDays} dias`}
              subtitle="Prazo mínimo"
              icon={ArrowDownRight}
              color="green"
            />
            <StatCard
              title="Taxa de Pontualidade"
              value={`${mockData.deadlines.onTimeRate}%`}
              subtitle="Pagamentos no prazo"
              icon={Target}
              trend="up"
              trendValue="+2.3%"
              color="green"
            />
          </div>
        </div>

        {/* Top Fornecedores */}
        <ChartCard title="Top 5 Fornecedores por Volume" className="col-span-full">
          <div className="space-y-4">
            {mockData.suppliers.topSuppliers.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-sm text-gray-500">{supplier.duplicates.toLocaleString('pt-BR')} duplicatas</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{formatCurrencyCompact(supplier.value)}</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(supplier.value / supplier.duplicates)} / duplicata
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Resumo de Fornecedores */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-purple-600 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">Resumo de Fornecedores</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total de Fornecedores"
              value={mockData.suppliers.totalSuppliers.toLocaleString('pt-BR')}
              subtitle="Cadastrados na plataforma"
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Fornecedores Ativos"
              value={mockData.suppliers.activeSuppliers.toLocaleString('pt-BR')}
              subtitle={`${((mockData.suppliers.activeSuppliers / mockData.suppliers.totalSuppliers) * 100).toFixed(1)}% do total`}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Novos Fornecedores"
              value={mockData.suppliers.newSuppliers.toLocaleString('pt-BR')}
              subtitle="Últimos 30 dias"
              icon={Building2}
              trend="up"
              trendValue="+18.4%"
              color="blue"
            />
          </div>
        </div>

        {/* Evolução Mensal */}
        <ChartCard title="Evolução Mensal - Últimos 6 Meses" className="col-span-full">
          <div className="space-y-6">
            <div className="grid grid-cols-6 gap-4">
              {mockData.monthlyData.map((month, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {month.duplicates.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-blue-500 mb-2">duplicatas</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrencyCompact(month.billed)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{month.month}</div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AgenteIntermediador;