import { ReactNode } from 'react';
import { useState } from 'react';
import { Building2, Clock, UserPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DomicileManagementModal } from '@/modules/notificacaoDuplicata/components/domicile/DomicileManagementModal';
import { UnregisteredSuppliersModal } from '@/modules/notificacaoDuplicata/components/suppliers/UnregisteredSuppliersModal';
import { cn } from '@/modules/notificacaoDuplicata/lib/utils';

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
}

export function DomicileStatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  status = 'normal',
  className 
}: DomicileStatsCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return 'border-l-4 border-l-amber-500 bg-amber-50';
      case 'urgent':
        return 'border-l-4 border-l-red-500 bg-red-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-white';
    }
  };

  return (
    <div className={cn("rounded-lg p-6 shadow-sm", getStatusColor(), className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{value}</p>
        {trend && (
          <div className="ml-3 flex items-center text-sm">
            <span className={cn(
              "font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}
            </span>
            <span className="text-gray-500 ml-1">{trend.period}</span>
          </div>
        )}
      </div>
      {status === 'urgent' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="w-3 h-3" />
          <span>Ação imediata necessária</span>
        </div>
      )}
      {status === 'warning' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <Clock className="w-3 h-3" />
          <span>Requer atenção</span>
        </div>
      )}
    </div>
  );
}

// Cards específicos para domicílio
export function DomicileDailyChangesCard() {
  return (
    <DomicileStatsCard
      title="Trocas de Domicílio Hoje"
      value="12"
      icon={<Building2 size={20} />}
      trend={{ value: 3, isPositive: true, period: "vs ontem" }}
      status="normal"
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
          trend={{ value: -2, isPositive: false, period: "vs ontem" }}
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
          title="Fornecedores Não Cadastrados"
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

export function ProcessesInApprovalCard() {
  return (
    <DomicileStatsCard
      title="Processos em Aprovação"
      value="15"
      icon={<CheckCircle2 size={20} />}
      trend={{ value: 5, isPositive: true, period: "esta semana" }}
      status="normal"
    />
  );
}