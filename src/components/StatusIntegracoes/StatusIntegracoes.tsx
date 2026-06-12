import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Clock,
  Zap,
} from 'lucide-react';

type StatusType = 'operacional' | 'instavel' | 'inativo';

interface IntegrationItem {
  nome: string;
  descricao: string;
  status: StatusType;
  ultimaExecucao: string;
  latencia: string;
  detalhe: string;
}

const cercApis: IntegrationItem[] = [
  {
    nome: 'CERC - Registro de Recebíveis',
    descricao: 'Envio e registro de duplicatas escriturais',
    status: 'operacional',
    ultimaExecucao: 'há 2 min',
    latencia: '180 ms',
    detalhe: 'Última sincronização concluída com sucesso',
  },
  {
    nome: 'CERC - Consulta de Agenda',
    descricao: 'Consulta da agenda de recebíveis dos sacados',
    status: 'operacional',
    ultimaExecucao: 'há 5 min',
    latencia: '240 ms',
    detalhe: 'Respondendo dentro do SLA',
  },
  {
    nome: 'CERC - Opt-in / Opt-out',
    descricao: 'Gestão de autorizações de acesso a recebíveis',
    status: 'operacional',
    ultimaExecucao: 'há 1 min',
    latencia: '150 ms',
    detalhe: 'Autorizações sincronizadas',
  },
  {
    nome: 'CERC - Liquidações',
    descricao: 'Recebimento de eventos de liquidação',
    status: 'operacional',
    ultimaExecucao: 'há 8 min',
    latencia: '320 ms',
    detalhe: 'Webhook ativo e processando eventos',
  },
];

const sapRotinas: IntegrationItem[] = [
  {
    nome: 'SAP - Escrituração de NF-e',
    descricao: 'Rotina de importação de notas fiscais eletrônicas',
    status: 'operacional',
    ultimaExecucao: 'há 12 min',
    latencia: 'Job 4,2 s',
    detalhe: 'Job batch concluído sem erros',
  },
  {
    nome: 'SAP - Conciliação de Pagamentos',
    descricao: 'Rotina de conciliação financeira diária',
    status: 'operacional',
    ultimaExecucao: 'há 35 min',
    latencia: 'Job 9,7 s',
    detalhe: 'Próxima execução agendada para 18:00',
  },
  {
    nome: 'SAP - Cadastro de Fornecedores',
    descricao: 'Sincronização de mestre de fornecedores',
    status: 'operacional',
    ultimaExecucao: 'há 20 min',
    latencia: 'Job 3,1 s',
    detalhe: 'Registros atualizados via IDoc',
  },
  {
    nome: 'SAP - Exportação Contábil',
    descricao: 'Geração de lançamentos contábeis (FI)',
    status: 'operacional',
    ultimaExecucao: 'há 50 min',
    latencia: 'Job 6,5 s',
    detalhe: 'Lançamentos gerados com sucesso',
  },
];

const statusConfig: Record<
  StatusType,
  { label: string; badge: string; icon: React.ElementType; iconColor: string }
> = {
  operacional: {
    label: 'Operacional',
    badge: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
  },
  instavel: {
    label: 'Instável',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
  },
  inativo: {
    label: 'Inativo',
    badge: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
};

const StatusBadge = ({ status }: { status: StatusType }) => {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${cfg.badge}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const IntegrationCard = ({ item }: { item: IntegrationItem }) => {
  const cfg = statusConfig[item.status];
  const Icon = cfg.icon;
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{item.nome}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{item.descricao}</p>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {item.ultimaExecucao}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          {item.latencia}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2">{item.detalhe}</p>
    </div>
  );
};

const StatusIntegracoes = () => {
  const [lastUpdate, setLastUpdate] = useState('agora mesmo');
  const [refreshing, setRefreshing] = useState(false);

  const allItems = [...cercApis, ...sapRotinas];
  const operacionais = allItems.filter((i) => i.status === 'operacional').length;
  const total = allItems.length;
  const todoOperacional = operacionais === total;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastUpdate('agora mesmo');
    setRefreshing(false);
  };

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Status integrações</h1>
            <p className="text-gray-600">
              Monitoramento das APIs da CERC e das rotinas no SAP
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 h-9 bg-revvo-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Overall status banner */}
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border mb-6 ${
            todoOperacional
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          {todoOperacional ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-semibold ${
                todoOperacional ? 'text-green-800' : 'text-yellow-800'
              }`}
            >
              {todoOperacional
                ? 'Todos os sistemas operacionais'
                : 'Atenção: há integrações com instabilidade'}
            </p>
            <p
              className={`text-xs ${
                todoOperacional ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {operacionais} de {total} integrações operando normalmente
            </p>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Atualizado {lastUpdate}
          </span>
        </div>

        {/* CERC APIs */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-revvo-blue" />
            <h2 className="text-lg font-semibold text-gray-900">APIs CERC</h2>
            <span className="text-xs text-gray-400">
              ({cercApis.filter((i) => i.status === 'operacional').length}/{cercApis.length} rodando)
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cercApis.map((item) => (
              <IntegrationCard key={item.nome} item={item} />
            ))}
          </div>
        </section>

        {/* SAP routines */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-revvo-blue" />
            <h2 className="text-lg font-semibold text-gray-900">Rotinas SAP</h2>
            <span className="text-xs text-gray-400">
              ({sapRotinas.filter((i) => i.status === 'operacional').length}/{sapRotinas.length} ativas)
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sapRotinas.map((item) => (
              <IntegrationCard key={item.nome} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatusIntegracoes;
