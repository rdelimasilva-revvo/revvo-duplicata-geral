import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FilterAccordion } from '../ui/FilterAccordion';
import {
  Bank,
  CheckCircle,
  Warning,
  XCircle,
  PencilSimple,
  Trash
} from '@phosphor-icons/react';

interface OptIn {
  id: string;
  banco: string;
  tipo: string;
  dataAdesao: string;
  dataVencimento: string;
  status: 'ativo' | 'vencendo' | 'vencido';
  diasRestantes: number;
}

const mockOptIns: OptIn[] = [
  {
    id: '1',
    banco: 'Banco do Brasil',
    tipo: 'Antecipação de Recebíveis',
    dataAdesao: '15/01/2024',
    dataVencimento: '15/01/2026',
    status: 'ativo',
    diasRestantes: 365
  },
  {
    id: '2',
    banco: 'Itaú Unibanco',
    tipo: 'Desconto de Duplicatas',
    dataAdesao: '20/03/2024',
    dataVencimento: '20/03/2025',
    status: 'vencendo',
    diasRestantes: 68
  },
  {
    id: '3',
    banco: 'Bradesco',
    tipo: 'Crédito Rotativo',
    dataAdesao: '10/02/2024',
    dataVencimento: '10/02/2026',
    status: 'ativo',
    diasRestantes: 396
  },
  {
    id: '4',
    banco: 'Santander',
    tipo: 'Capital de Giro',
    dataAdesao: '05/01/2024',
    dataVencimento: '05/01/2025',
    status: 'vencido',
    diasRestantes: -8
  },
  {
    id: '5',
    banco: 'Caixa Econômica Federal',
    tipo: 'Antecipação de Recebíveis',
    dataAdesao: '18/04/2024',
    dataVencimento: '18/04/2025',
    status: 'vencendo',
    diasRestantes: 97
  },
  {
    id: '6',
    banco: 'Safra',
    tipo: 'Desconto de Duplicatas',
    dataAdesao: '22/06/2024',
    dataVencimento: '22/06/2026',
    status: 'ativo',
    diasRestantes: 528
  }
];

export const GestaoOptIn: React.FC = () => {
  const totalOptIns = mockOptIns.length;
  const ativos = mockOptIns.filter(o => o.status === 'ativo').length;
  const vencendo = mockOptIns.filter(o => o.status === 'vencendo').length;
  const vencidos = mockOptIns.filter(o => o.status === 'vencido').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="success">Ativo</Badge>;
      case 'vencendo':
        return <Badge variant="warning">Vencendo em Breve</Badge>;
      case 'vencido':
        return <Badge variant="danger">Vencido</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Gestão de Opt-in</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as adesões com bancos e financiadores</p>
        </div>
        <Button variant="primary" icon={<Bank size={14} weight="bold" />}>
          Nova Adesão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-blue-600 uppercase">Total</p>
            <Bank size={20} weight="bold" className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-700">{totalOptIns}</p>
          <p className="text-xs text-blue-600 mt-1">Opt-ins cadastrados</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-cyan-50 to-white border border-cyan-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-cyan-600 uppercase">Ativos</p>
            <CheckCircle size={20} weight="bold" className="text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-cyan-700">{ativos}</p>
          <p className="text-xs text-cyan-600 mt-1">Em vigência</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-white border border-yellow-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-yellow-600 uppercase">Vencendo</p>
            <Warning size={20} weight="bold" className="text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-700">{vencendo}</p>
          <p className="text-xs text-yellow-600 mt-1">Próximos 90 dias</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-white border border-red-100">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-red-600 uppercase">Vencidos</p>
            <XCircle size={20} weight="bold" className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-700">{vencidos}</p>
          <p className="text-xs text-red-600 mt-1">Requer renovação</p>
        </Card>
      </div>

      <FilterAccordion>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Banco</label>
            <input
              type="text"
              placeholder="Buscar banco..."
              className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]">
              <option>Todos</option>
              <option>Antecipação de Recebíveis</option>
              <option>Desconto de Duplicatas</option>
              <option>Capital de Giro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]">
              <option>Todos</option>
              <option>Ativo</option>
              <option>Vencendo</option>
              <option>Vencido</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vencimento até</label>
            <input
              type="date"
              className="w-full h-8 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
            />
          </div>
        </div>
      </FilterAccordion>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Banco/Financiador</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data Adesão</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data Vencimento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dias Restantes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockOptIns.map((opt) => (
                <tr key={opt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{opt.banco}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{opt.tipo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{opt.dataAdesao}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{opt.dataVencimento}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${
                      opt.diasRestantes < 0 ? 'text-red-600' :
                      opt.diasRestantes < 90 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {opt.diasRestantes < 0 ? `${Math.abs(opt.diasRestantes)} dias atrás` : `${opt.diasRestantes} dias`}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(opt.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <PencilSimple size={16} weight="bold" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 transition-colors">
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
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
