import { useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { DotsThreeVertical } from '@phosphor-icons/react';
import { Pendency } from '../../types/pendency';
import { formatCurrency } from '../../utils/format';

interface PendenciesListProps {
  pendencies: Pendency[];
  onSelectPendency?: (pendency: Pendency) => void;
}

export function PendenciesList({ pendencies, onSelectPendency }: PendenciesListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getPriorityBadge = (priority: Pendency['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    const labels = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const getStatusBadge = (status: Pendency['status']) => {
    const config = {
      urgent: {
        icon: AlertCircle,
        label: 'Urgente',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
      partial: {
        icon: Clock,
        label: 'Parcial',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      pending: {
        icon: Clock,
        label: 'Pendente',
        className: 'bg-gray-50 text-gray-700 border-gray-200',
      },
    };

    const { icon: Icon, label, className } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-red-600 font-semibold">Vencido</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-semibold">Hoje</span>;
    } else if (diffDays === 1) {
      return <span className="text-orange-600">Amanhã</span>;
    } else if (diffDays <= 3) {
      return <span className="text-yellow-600">{diffDays} dias</span>;
    } else {
      return <span className="text-gray-600">{diffDays} dias</span>;
    }
  };

  const getProgressPercentage = (pendency: Pendency) => {
    return Math.round(((pendency.totalBills - pendency.pendingBills) / pendency.totalBills) * 100);
  };

  if (pendencies.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhuma pendência encontrada</h3>
        <p className="text-sm text-gray-500">Todas as manifestações estão em dia</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Progresso
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duplicatas
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Valor Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vencimento
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pendencies.map((pendency) => {
              const progressPercentage = getProgressPercentage(pendency);

              return (
                <tr
                  key={pendency.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelectPendency?.(pendency)}
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{pendency.supplierName}</span>
                      <span className="text-xs text-gray-500">{pendency.supplierDocument}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(pendency.status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-full max-w-[120px] bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressPercentage === 100
                              ? 'bg-green-500'
                              : progressPercentage > 50
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-900">
                        {pendency.pendingBills} / {pendency.totalBills}
                      </span>
                      <span className="text-xs text-gray-500">pendentes</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(pendency.totalAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {formatDate(pendency.dueDate)}
                      <span className="text-xs text-gray-500">
                        {pendency.dueDate.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getPriorityBadge(pendency.priority)}
                  </td>
                  <td className="px-4 py-4 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === pendency.id ? null : pendency.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <DotsThreeVertical size={32} />
                    </button>
                    {openMenuId === pendency.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPendency?.(pendency);
                              setOpenMenuId(null);
                            }}
                          >
                            Ver detalhes
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Processar em lote', pendency.id);
                              setOpenMenuId(null);
                            }}
                          >
                            Processar em lote
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Exportar duplicatas', pendency.id);
                              setOpenMenuId(null);
                            }}
                          >
                            Exportar duplicatas
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total: <strong>{pendencies.length}</strong> fornecedores com pendências
          </span>
          <span>
            Total de duplicatas pendentes:{' '}
            <strong>
              {pendencies.reduce((sum, p) => sum + p.pendingBills, 0)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
