import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { KPICard } from '../ui/KPICard';
import { FilterAccordion } from '../ui/FilterAccordion';
import {
  Bank,
  Warning,
  CheckCircle,
  Clock
} from '@phosphor-icons/react';

interface Domicilio {
  id: string;
  numeroTitulo: string;
  fornecedor: string;
  bancoAtual: string;
  bancoSolicitado: string;
  valor: number;
  dataSolicitacao: string;
  prazoResposta: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'critico';
  acaoRequerida: boolean;
}

const mockDomicilios: Domicilio[] = [
  {
    id: '1',
    numeroTitulo: 'TIT-2025-0001',
    fornecedor: 'Fornecedor ABC Ltda',
    bancoAtual: 'Banco do Brasil',
    bancoSolicitado: 'Itaú Unibanco',
    valor: 35600.00,
    dataSolicitacao: '10/01/2025',
    prazoResposta: '13/01/2025',
    status: 'critico',
    acaoRequerida: true
  },
  {
    id: '2',
    numeroTitulo: 'TIT-2025-0002',
    fornecedor: 'Distribuidora XYZ S.A.',
    bancoAtual: 'Bradesco',
    bancoSolicitado: 'Santander',
    valor: 52800.50,
    dataSolicitacao: '08/01/2025',
    prazoResposta: '18/01/2025',
    status: 'pendente',
    acaoRequerida: false
  },
  {
    id: '3',
    numeroTitulo: 'TIT-2025-0003',
    fornecedor: 'Indústria Delta Corp',
    bancoAtual: 'Santander',
    bancoSolicitado: 'Banco do Brasil',
    valor: 18900.00,
    dataSolicitacao: '05/01/2025',
    prazoResposta: '15/01/2025',
    status: 'aprovado',
    acaoRequerida: false
  },
  {
    id: '4',
    numeroTitulo: 'TIT-2025-0004',
    fornecedor: 'Comércio Beta ME',
    bancoAtual: 'Caixa',
    bancoSolicitado: 'Bradesco',
    valor: 9450.75,
    dataSolicitacao: '12/01/2025',
    prazoResposta: '14/01/2025',
    status: 'critico',
    acaoRequerida: true
  },
  {
    id: '5',
    numeroTitulo: 'TIT-2025-0005',
    fornecedor: 'Logística Omega Ltda',
    bancoAtual: 'Itaú Unibanco',
    bancoSolicitado: 'Safra',
    valor: 78200.00,
    dataSolicitacao: '09/01/2025',
    prazoResposta: '19/01/2025',
    status: 'pendente',
    acaoRequerida: false
  },
  {
    id: '6',
    numeroTitulo: 'TIT-2025-0006',
    fornecedor: 'Tech Solutions Inc',
    bancoAtual: 'Safra',
    bancoSolicitado: 'Caixa',
    valor: 44500.00,
    dataSolicitacao: '06/01/2025',
    prazoResposta: '16/01/2025',
    status: 'rejeitado',
    acaoRequerida: false
  }
];

export const GestaoDomicilio: React.FC = () => {
  const criticos = mockDomicilios.filter(d => d.status === 'critico').length;
  const pendentes = mockDomicilios.filter(d => d.status === 'pendente').length;
  const aprovados = mockDomicilios.filter(d => d.status === 'aprovado').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge variant="success">Aprovado</Badge>;
      case 'pendente':
        return <Badge variant="warning">Pendente</Badge>;
      case 'rejeitado':
        return <Badge variant="danger">Rejeitado</Badge>;
      case 'critico':
        return <Badge variant="danger">Crítico</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Gestão de Domicílio Certo</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as mudanças de domicílio bancário</p>
        </div>
        <Button variant="primary" icon={<Bank size={14} weight="bold" />}>
          Nova Solicitação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Casos Críticos"
          value={criticos}
          icon={<Warning size={20} weight="bold" />}
          alert="Ação imediata necessária"
        />
        <KPICard
          title="Pendentes"
          value={pendentes}
          icon={<Clock size={20} weight="bold" />}
          subtitle="Aguardando resposta"
        />
        <KPICard
          title="Aprovados"
          value={aprovados}
          icon={<CheckCircle size={20} weight="bold" />}
          subtitle="Este mês"
        />
        <KPICard
          title="Total de Títulos"
          value={mockDomicilios.length}
          icon={<Bank size={20} weight="bold" />}
          subtitle="Em gestão"
        />
      </div>

      <FilterAccordion>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Número do Título</label>
            <input
              type="text"
              placeholder="Buscar título..."
              className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
            />
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Banco</label>
            <select className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]">
              <option>Todos</option>
              <option>Banco do Brasil</option>
              <option>Itaú Unibanco</option>
              <option>Bradesco</option>
              <option>Santander</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]">
              <option>Todos</option>
              <option>Crítico</option>
              <option>Pendente</option>
              <option>Aprovado</option>
              <option>Rejeitado</option>
            </select>
          </div>
        </div>
      </FilterAccordion>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nº Título</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fornecedor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Banco Atual</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Banco Solicitado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prazo Resposta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ação Requerida</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockDomicilios.map((dom) => (
                <tr key={dom.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{dom.numeroTitulo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dom.fornecedor}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dom.bancoAtual}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dom.bancoSolicitado}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    R$ {dom.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dom.prazoResposta}</td>
                  <td className="px-4 py-3">
                    {dom.acaoRequerida ? (
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Urgente
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(dom.status)}</td>
                  <td className="px-4 py-3">
                    <Button variant="primary">Visualizar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
