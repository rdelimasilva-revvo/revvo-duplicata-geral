import { ReactNode, useState } from 'react';
import { Buildings, Clock, UserPlus, CheckCircle, Warning, FileText, CreditCard } from '@phosphor-icons/react';
import { DomicileManagementModal } from '@/modules/gestorDomicilio/components/domicile/DomicileManagementModal';
import { UnregisteredSuppliersModal } from '@/modules/gestorDomicilio/components/suppliers/UnregisteredSuppliersModal';
import { cn } from '@/modules/gestorDomicilio/lib/utils';

interface DomicileStatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  status?: 'normal' | 'warning' | 'urgent';
  className?: string;
  secondaryIndicators?: {
    label: string;
    value: string | number;
  }[];
  layout?: 'horizontal' | 'stacked';
}

export function DomicileStatsCard({
  title,
  value,
  icon,
  trend,
  status = 'normal',
  className,
  secondaryIndicators,
  layout = 'horizontal'
}: DomicileStatsCardProps) {
  const getStatusColor = () => {
    return 'bg-white';
  };

  return (
    <div className={cn('flex flex-col rounded-lg px-4 py-4 shadow-sm h-[140px]', getStatusColor(), className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <div className="text-gray-400 flex-shrink-0">{icon}</div>}
      </div>

      {layout === 'stacked' ? (
        <div className="flex flex-col flex-1 justify-between">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {secondaryIndicators && secondaryIndicators.length > 0 && (
            <>
              <div className="my-2 h-px bg-gray-200" />
              <div className="flex gap-6">
                {secondaryIndicators.map((indicator, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-600">{indicator.label}: </span>
                    <span className="font-semibold text-gray-900">{indicator.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-start gap-4 flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {secondaryIndicators && secondaryIndicators.length > 0 && (
            <>
              <div className="h-10 w-[1px] bg-gray-200" />
              <div className="flex gap-4">
                {secondaryIndicators.map((indicator, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs text-gray-500">{indicator.label}</span>
                    <span className="text-sm font-medium text-gray-900">{indicator.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {trend && (
            <div className="ml-auto flex items-center text-sm">
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}
              </span>
              <span className="text-gray-500 ml-1">{trend.period}</span>
            </div>
          )}
        </div>
      )}

      {status === 'urgent' && (
        <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-red-600">
          <Warning className="w-3.5 h-3.5" />
          <span>Ação imediata necessária</span>
        </div>
      )}
      {status === 'warning' && (
        <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <Clock className="w-3.5 h-3.5" />
          <span>Requer atenção</span>
        </div>
      )}
    </div>
  );
}

export function RequestsReceivedCard() {
  return (
    <DomicileStatsCard
      title="Solicitações Recebidas"
      value="23"
      icon={<FileText size={20} />}
      status="normal"
      layout="stacked"
      secondaryIndicators={[
        { label: 'Aprovadas', value: '15' },
        { label: 'Recusadas', value: '3' }
      ]}
    />
  );
}

export function PendingApprovalsCard() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <>
      <div onClick={() => setShowWorkflow(true)} className="cursor-pointer">
        <DomicileStatsCard
          title="Pendentes de Aprovação"
          value="8"
          icon={<Clock size={20} />}
          trend={{ value: -2, isPositive: false, period: 'vs ontem' }}
          status="warning"
        />
      </div>
      {showWorkflow && (
        <DomicileManagementModal
          isOpen={showWorkflow}
          onClose={() => setShowWorkflow(false)}
        />
      )}
    </>
  );
}

export function UnregisteredSuppliersCard() {
  const [showSuppliersModal, setShowSuppliersModal] = useState(false);

  return (
    <>
      <div onClick={() => setShowSuppliersModal(true)} className="cursor-pointer">
        <DomicileStatsCard
          title="Fornecedores não cadastrados"
          value="3"
          icon={<UserPlus size={20} />}
          status="urgent"
        />
      </div>
      {showSuppliersModal && (
        <UnregisteredSuppliersModal
          isOpen={showSuppliersModal}
          onClose={() => setShowSuppliersModal(false)}
        />
      )}
    </>
  );
}

export function UnregisteredAccountsCard() {
  return (
    <DomicileStatsCard
      title="Contas não cadastradas"
      value="5"
      icon={<CreditCard size={20} />}
      status="warning"
    />
  );
}

export function ProcessesInApprovalCard() {
  return (
    <DomicileStatsCard
      title="Em Aprovação"
      value="15"
      icon={<CheckCircle size={20} />}
      status="normal"
    />
  );
}
