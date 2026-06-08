import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Clock, AlertTriangle, Ban } from 'lucide-react';
import { mockBills } from '@/modules/notificacaoDuplicata/data/mockBills';
import { BillsTable } from '@/modules/notificacaoDuplicata/components/bills/BillsTable';
import { BillDetailsPanel } from '@/modules/notificacaoDuplicata/components/bills/BillDetailsPanel';
import { FilterBar } from '@/modules/notificacaoDuplicata/components/filters/FilterBar';
import { CommercialAnnotationModal } from '@/modules/notificacaoDuplicata/components/modals/CommercialAnnotationModal';
import { Bill, BillFilters } from '@/modules/notificacaoDuplicata/types/bill';
import { MANIFESTABLE_STATUSES } from '@/modules/notificacaoDuplicata/utils/statusConfig';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';

type TabKey = 'manifestacao' | 'recusa';

function ManifestacoesPendentesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('manifestacao');

  useEffect(() => {
    const billId = searchParams.get('id');
    if (billId) {
      const found = mockBills.find(b => b.id === billId);
      if (found) setSelectedBill(found);
    }
  }, [searchParams]);
  const [filters, setFilters] = useState<BillFilters | undefined>(undefined);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [billForAnnotation, setBillForAnnotation] = useState<Bill | null>(null);

  const pendingBills = useMemo(
    () => mockBills.filter(b => MANIFESTABLE_STATUSES.includes(b.statusManifestacao)),
    []
  );

  const pendingRejectionBills = useMemo(
    () => mockBills.filter(b => b.statusManifestacao === 'recusa_automatica'),
    []
  );

  const activeBills = activeTab === 'manifestacao' ? pendingBills : pendingRejectionBills;

  const totalAmount = useMemo(
    () => activeBills.reduce((sum, b) => sum + b.amount, 0),
    [activeBills]
  );

  const urgentCount = useMemo(
    () => pendingBills.filter(b => b.diasParaManifestacao > 0 && b.diasParaManifestacao <= 3).length,
    [pendingBills]
  );

  const warningCount = useMemo(
    () => pendingBills.filter(b => b.diasParaManifestacao >= 4 && b.diasParaManifestacao <= 7).length,
    [pendingBills]
  );

  const handleAnnotation = (bill: Bill) => {
    setBillForAnnotation(bill);
    setShowAnnotationModal(true);
  };

  const handleSaveAnnotation = async (data: {
    problemType: string;
    description: string;
    occurrenceDate: string;
    attachments: File[];
    additionalNotes: string;
  }) => {
    console.log('Salvando anotacao comercial:', {
      bill: billForAnnotation?.id,
      ...data,
    });
    setShowAnnotationModal(false);
    setBillForAnnotation(null);
  };

  const handleFilterChange = (newFilters: BillFilters) => {
    const hasActiveFilter = newFilters.dueDate || newFilters.sacador || newFilters.status || newFilters.urgentOnly;
    setFilters(hasActiveFilter ? newFilters : undefined);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSelectedBill(null);
    setFilters(undefined);
  };

  const tabs = [
    { key: 'manifestacao' as TabKey, label: 'Pendentes de Manifestação', count: pendingBills.length },
    { key: 'recusa' as TabKey, label: 'Pendentes de Recusa', count: pendingRejectionBills.length },
  ];

  return (
    <div className={
      selectedBill
        ? 'p-3 sm:p-4 md:p-6 h-full flex flex-col overflow-hidden bg-gray-50'
        : 'p-3 sm:p-4 md:p-6 min-h-full max-h-full overflow-y-auto overflow-x-hidden bg-gray-50'
    }>
      {selectedBill ? (
        <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Manifestações Pendentes</h1>
              <p className="text-xs sm:text-sm text-gray-600">Duplicatas aguardando manifestação manual</p>
            </div>
            <button
              onClick={() => setSelectedBill(null)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-700" strokeWidth={2} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <BillDetailsPanel
              bill={selectedBill}
              onClose={() => setSelectedBill(null)}
              allowOverrideAutoRejection={activeTab === 'recusa'}
            />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Manifestações Pendentes</h1>
              <p className="text-xs sm:text-sm text-gray-600">Duplicatas aguardando manifestação manual</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-700" strokeWidth={2} />
            </button>
          </div>

          <div className="border-b border-gray-200 mb-4 md:mb-6">
            <nav className="flex gap-0 -mb-px" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    relative px-4 sm:px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap
                    ${activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    <span className={`
                      inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold
                      ${activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'manifestacao' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 truncate">Pendentes de Manifestação</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{pendingBills.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 truncate">Valor Total Pendente</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{formatCurrency(totalAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 truncate">Urgentes (até 3 dias)</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{urgentCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {urgentCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Atenção: duplicatas próximas do decurso de prazo</p>
                    <p className="text-xs text-red-700 mt-0.5">
                      {urgentCount} duplicata{urgentCount > 1 ? 's' : ''} com prazo de manifestação inferior a 3 dias.
                      O não tratamento resultará em aceite tácito automático.
                    </p>
                  </div>
                </div>
              )}

              {warningCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Duplicatas com prazo de manifestação se aproximando</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {warningCount} duplicata{warningCount > 1 ? 's' : ''} com prazo de manifestação entre 4 e 7 dias.
                      Recomenda-se a análise antecipada para evitar o decurso de prazo.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'recusa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Ban className="w-5 h-5 text-red-500" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 truncate">Recusadas Automaticamente</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{pendingRejectionBills.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 truncate">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <FilterBar onFilterChange={handleFilterChange} />
          <BillsTable
            bills={activeBills}
            onSelectBill={setSelectedBill}
            onAnnotation={handleAnnotation}
            filters={filters}
            selectableStatuses={activeTab === 'recusa' ? ['recusa_automatica'] : undefined}
          />
        </div>
      )}

      {showAnnotationModal && billForAnnotation && (
        <CommercialAnnotationModal
          bill={billForAnnotation}
          onClose={() => {
            setShowAnnotationModal(false);
            setBillForAnnotation(null);
          }}
          onSave={handleSaveAnnotation}
        />
      )}
    </div>
  );
}

export default ManifestacoesPendentesPage;
