import { FileText, Clock, Ban, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { PENDING_STATUSES, ACCEPTED_STATUSES, REJECTED_STATUSES } from '@/modules/notificacaoDuplicata/utils/statusConfig';

interface KPIGridProps {
  bills: Bill[];
}

export function KPIGrid({ bills }: KPIGridProps) {
  const kpis = useMemo(() => {
    const total = bills.length;
    const pendentes = bills.filter(b => PENDING_STATUSES.includes(b.statusManifestacao)).length;
    const rejeitadas = bills.filter(b => REJECTED_STATUSES.includes(b.statusManifestacao)).length;
    const aceitas = bills.filter(b => ACCEPTED_STATUSES.includes(b.statusManifestacao)).length;

    return [
      { label: 'Duplicatas recebidas', value: total.toLocaleString('pt-BR'), icon: FileText, key: 'total' },
      { label: 'Pendentes de manifestação', value: pendentes.toLocaleString('pt-BR'), icon: Clock, key: 'pendentes' },
      { label: 'Rejeitadas', value: rejeitadas.toLocaleString('pt-BR'), icon: Ban, key: 'rejeitadas' },
      { label: 'Total aceitas', value: aceitas.toLocaleString('pt-BR'), icon: CheckCircle, key: 'aceitas' },
    ];
  }, [bills]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-6 flex items-center gap-4 transition-all duration-200 hover:shadow-md h-[88px]"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
            <Icon className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium leading-snug block break-words text-gray-500">
              {label}
            </span>
            <div className="text-2xl font-bold leading-snug mt-1 text-gray-900">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
