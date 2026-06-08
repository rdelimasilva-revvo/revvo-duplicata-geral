import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  MapPin,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data for dashboards
const receivablesData = {
  transactional: {
    totalDuplicates: 15420,
    processedToday: 342,
    pendingProcessing: 89,
    averageProcessingTime: '2.3h'
  },
  credit: {
    totalCreditGranted: 45600000,
    averageTicket: 125000,
    approvalRate: 87.5,
    rejectionRate: 12.5
  },
  fileExchange: {
    filesReceived: 1250,
    filesProcessed: 1198,
    filesSent: 1156,
    errorRate: 4.2
  }
};

const payablesData = {
  processing: {
    totalProcessed: 8950,
    processingRate: 94.2,
    averageTime: '1.8h',
    queueSize: 156
  },
  acceptanceRejection: {
    totalVolume: 12340,
    acceptances: 10567,
    rejections: 1773,
    acceptanceRate: 85.6
  },
  automations: {
    totalExecuted: 5680,
    successfulAutomations: 5234,
    failedAutomations: 446,
    successRate: 92.1
  },
  errorMap: [
    { type: 'Dados Inválidos', count: 145, percentage: 32.5 },
    { type: 'Timeout de Conexão', count: 89, percentage: 20.0 },
    { type: 'Formato Incorreto', count: 76, percentage: 17.0 },
    { type: 'Duplicata Inexistente', count: 68, percentage: 15.2 },
    { type: 'Outros', count: 68, percentage: 15.3 }
  ]
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
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

const ProgressBar = ({ label, value, total, color = 'blue' }) => {
  const percentage = (value / total) * 100;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-900 font-medium">{value.toLocaleString()}</span>
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

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Escritural</h1>
            <p className="text-gray-600 mt-1">
              Visão geral dos processos de escrituração - {currentTime.toLocaleDateString('pt-BR')} às {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
        </div>

        {/* Contas a Receber Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-blue-600 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">Contas a Receber</h2>
          </div>

          {/* Transacional de Escrituração */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Transacional de Escrituração de Duplicatas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total de Duplicatas"
                value={receivablesData.transactional.totalDuplicates.toLocaleString()}
                subtitle="Processadas este mês"
                icon={FileText}
                trend="up"
                trendValue="+12.5%"
                color="blue"
              />
              <StatCard
                title="Processadas Hoje"
                value={receivablesData.transactional.processedToday.toLocaleString()}
                subtitle="Últimas 24 horas"
                icon={CheckCircle}
                trend="up"
                trendValue="+8.2%"
                color="green"
              />
              <StatCard
                title="Pendentes"
                value={receivablesData.transactional.pendingProcessing.toLocaleString()}
                subtitle="Aguardando processamento"
                icon={Clock}
                color="yellow"
              />
              <StatCard
                title="Tempo Médio"
                value={receivablesData.transactional.averageProcessingTime}
                subtitle="Processamento por duplicata"
                icon={Activity}
                trend="down"
                trendValue="-15.3%"
                color="purple"
              />
            </div>
          </div>

          {/* Crédito Relacionado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Crédito Relacionado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Crédito Concedido"
                value={`R$ ${(receivablesData.credit.totalCreditGranted / 1000000).toFixed(1)}M`}
                subtitle="Total no período"
                icon={DollarSign}
                trend="up"
                trendValue="+18.7%"
                color="green"
              />
              <StatCard
                title="Ticket Médio"
                value={`R$ ${(receivablesData.credit.averageTicket / 1000).toFixed(0)}K`}
                subtitle="Por operação"
                icon={TrendingUp}
                trend="up"
                trendValue="+5.4%"
                color="blue"
              />
              <StatCard
                title="Taxa de Aprovação"
                value={`${receivablesData.credit.approvalRate}%`}
                subtitle="Análises aprovadas"
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Taxa de Rejeição"
                value={`${receivablesData.credit.rejectionRate}%`}
                subtitle="Análises rejeitadas"
                icon={XCircle}
                color="red"
              />
            </div>
          </div>

          {/* KPIs de Troca de Arquivos */}
          <ChartCard title="KPIs de Troca de Arquivos" className="col-span-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <ProgressBar
                  label="Arquivos Recebidos"
                  value={receivablesData.fileExchange.filesReceived}
                  total={1500}
                  color="blue"
                />
                <ProgressBar
                  label="Arquivos Processados"
                  value={receivablesData.fileExchange.filesProcessed}
                  total={receivablesData.fileExchange.filesReceived}
                  color="green"
                />
                <ProgressBar
                  label="Arquivos Enviados"
                  value={receivablesData.fileExchange.filesSent}
                  total={receivablesData.fileExchange.filesProcessed}
                  color="purple"
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {receivablesData.fileExchange.errorRate}%
                  </div>
                  <div className="text-gray-700 font-medium">Taxa de Erro</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {receivablesData.fileExchange.filesReceived - receivablesData.fileExchange.filesProcessed} arquivos com erro
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Contas a Pagar Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-red-600 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-900">Contas a Pagar</h2>
          </div>

          {/* KPIs de Processamento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">KPIs de Processamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Processado"
                value={payablesData.processing.totalProcessed.toLocaleString()}
                subtitle="Duplicatas processadas"
                icon={BarChart3}
                trend="up"
                trendValue="+9.8%"
                color="blue"
              />
              <StatCard
                title="Taxa de Processamento"
                value={`${payablesData.processing.processingRate}%`}
                subtitle="Eficiência do sistema"
                icon={TrendingUp}
                trend="up"
                trendValue="+2.1%"
                color="green"
              />
              <StatCard
                title="Tempo Médio"
                value={payablesData.processing.averageTime}
                subtitle="Por duplicata"
                icon={Clock}
                trend="down"
                trendValue="-12.7%"
                color="purple"
              />
              <StatCard
                title="Fila de Processamento"
                value={payablesData.processing.queueSize.toLocaleString()}
                subtitle="Aguardando processamento"
                icon={RefreshCw}
                color="yellow"
              />
            </div>
          </div>

          {/* Volume de Aceites e Recusas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Volume de Aceites e Recusas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Volume Total"
                value={payablesData.acceptanceRejection.totalVolume.toLocaleString()}
                subtitle="Duplicatas analisadas"
                icon={PieChart}
                color="blue"
              />
              <StatCard
                title="Aceites"
                value={payablesData.acceptanceRejection.acceptances.toLocaleString()}
                subtitle="Duplicatas aceitas"
                icon={CheckCircle}
                trend="up"
                trendValue="+6.3%"
                color="green"
              />
              <StatCard
                title="Recusas"
                value={payablesData.acceptanceRejection.rejections.toLocaleString()}
                subtitle="Duplicatas recusadas"
                icon={XCircle}
                trend="down"
                trendValue="-3.2%"
                color="red"
              />
              <StatCard
                title="Taxa de Aceite"
                value={`${payablesData.acceptanceRejection.acceptanceRate}%`}
                subtitle="Percentual de aprovação"
                icon={TrendingUp}
                color="green"
              />
            </div>
          </div>

          {/* Automações de Manifestações */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Automações de Manifestações Executadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Executadas"
                value={payablesData.automations.totalExecuted.toLocaleString()}
                subtitle="Automações processadas"
                icon={Zap}
                trend="up"
                trendValue="+14.2%"
                color="blue"
              />
              <StatCard
                title="Sucessos"
                value={payablesData.automations.successfulAutomations.toLocaleString()}
                subtitle="Automações bem-sucedidas"
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Falhas"
                value={payablesData.automations.failedAutomations.toLocaleString()}
                subtitle="Automações com erro"
                icon={AlertTriangle}
                color="red"
              />
              <StatCard
                title="Taxa de Sucesso"
                value={`${payablesData.automations.successRate}%`}
                subtitle="Eficiência das automações"
                icon={TrendingUp}
                trend="up"
                trendValue="+1.8%"
                color="green"
              />
            </div>
          </div>

          {/* Mapa de Erros */}
          <ChartCard title="Mapa de Erros" className="col-span-full">
            <div className="space-y-4">
              {payablesData.errorMap.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{error.type}</div>
                      <div className="text-sm text-gray-500">{error.count} ocorrências</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{error.percentage}%</div>
                      <div className="text-sm text-gray-500">do total</div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-red-500 rounded-full"
                        style={{ width: `${error.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Home;