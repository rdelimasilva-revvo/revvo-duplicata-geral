import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { mockBills } from '@/modules/notificacaoDuplicata/data/mockBills';
import { ReceivedBillsTable } from '@/modules/notificacaoDuplicata/components/bills/ReceivedBillsTable';
import { ReceivedBillsFilterBar, ReceivedBillsFilters } from '@/modules/notificacaoDuplicata/components/filters/ReceivedBillsFilterBar';
import { ManifestationStatusChart } from '@/modules/notificacaoDuplicata/components/charts/ManifestationStatusChart';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { AbatimentoRegistrationModal, AbatimentoData } from '@/modules/notificacaoDuplicata/components/modals/AbatimentoRegistrationModal';

function DuplicatasRecebidasPage() {
  const navigate = useNavigate();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAbatimentoModal, setShowAbatimentoModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filters, setFilters] = useState<ReceivedBillsFilters>({
    search: '',
    issueDateFrom: '',
    issueDateTo: '',
    remainingDays: '',
  });

  const allBills = mockBills;

  const parseBrDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  };

  const filteredBills = useMemo(() => {
    return allBills.filter((bill) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesNota = (bill.numeroNota || bill.notaFiscal?.numero || '').toLowerCase().includes(term);
        const matchesDocContabil = (bill.erp?.documentoContabil || '').toLowerCase().includes(term);
        const matchesCnpj = bill.sacador.cnpj.toLowerCase().replace(/[.\-\/]/g, '').includes(term.replace(/[.\-\/]/g, ''));
        const matchesRazaoSocial = bill.sacador.name.toLowerCase().includes(term);
        const matchesId = bill.id.toLowerCase().includes(term);
        if (!matchesNota && !matchesDocContabil && !matchesCnpj && !matchesRazaoSocial && !matchesId) {
          return false;
        }
      }

      if (filters.issueDateFrom || filters.issueDateTo) {
        const issueDate = parseBrDate(bill.issueDate);
        if (issueDate) {
          if (filters.issueDateFrom) {
            const from = new Date(filters.issueDateFrom + 'T00:00:00');
            if (issueDate < from) return false;
          }
          if (filters.issueDateTo) {
            const to = new Date(filters.issueDateTo + 'T23:59:59');
            if (issueDate > to) return false;
          }
        }
      }

      if (filters.remainingDays) {
        const days = bill.diasParaManifestacao;
        switch (filters.remainingDays) {
          case '0': if (days !== 0) return false; break;
          case '1-3': if (days < 1 || days > 3) return false; break;
          case '4-7': if (days < 4 || days > 7) return false; break;
          case '8-15': if (days < 8 || days > 15) return false; break;
          case '15+': if (days <= 15) return false; break;
        }
      }

      return true;
    });
  }, [allBills, filters]);

  const handleFilterChange = useCallback((newFilters: ReceivedBillsFilters) => {
    setFilters(newFilters);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalAmount = allBills.reduce((sum, bill) => sum + bill.amount, 0);

  const handleAccept = (bill: Bill) => {
    setSelectedBill(bill);
    setShowAcceptModal(true);
  };

  const handleReject = (bill: Bill) => {
    setSelectedBill(bill);
    setShowRejectModal(true);
  };

  const handleEditClick = (bill: Bill) => {
    console.log('Editando duplicata:', bill.id);
  };

  const handleCancelDuplicate = () => {
    setShowCancelModal(true);
  };

  const handleCancelInstallment = () => {
    console.log('Cancelando parcela');
  };

  const handleAbatimento = (bill: Bill) => {
    setSelectedBill(bill);
    setShowAbatimentoModal(true);
  };

  const confirmAbatimento = (data: AbatimentoData) => {
    console.log('Registrando abatimento:', {
      bill: selectedBill?.id,
      ...data,
    });
    setShowAbatimentoModal(false);
    setSelectedBill(null);
  };

  const confirmAccept = () => {
    console.log('Aceitando duplicata:', selectedBill?.id);
    setShowAcceptModal(false);
    setSelectedBill(null);
  };

  const confirmReject = () => {
    console.log('Rejeitando duplicata:', selectedBill?.id);
    setShowRejectModal(false);
    setSelectedBill(null);
  };

  const confirmCancel = () => {
    console.log('Cancelando duplicata');
    setShowCancelModal(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-full max-h-full overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Duplicatas Recebidas</h1>
            <p className="text-xs sm:text-sm text-gray-600">Todas as Duplicatas</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Total de Duplicatas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{allBills.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Valor Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Aguardando Manifestação</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {allBills.filter(b => b.statusManifestacao === 'em_fila_analise_manual').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-4 md:mb-6 h-[420px]">
          <ManifestationStatusChart />
        </div>

        {/* Filters */}
        <ReceivedBillsFilterBar onFilterChange={handleFilterChange} />

        {/* Bills Table */}
        <ReceivedBillsTable
          bills={filteredBills}
          onAccept={handleAccept}
          onReject={handleReject}
          onEditClick={handleEditClick}
          onCancelDuplicate={handleCancelDuplicate}
          onCancelInstallment={handleCancelInstallment}
          onAbatimento={handleAbatimento}
        />
      </div>

      {/* Accept Modal */}
      {showAcceptModal && selectedBill && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]"
          onClick={() => setShowAcceptModal(false)}
        >
          <div
            className="bg-white rounded-lg w-[500px] max-w-[90vw] shadow-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-[#f5f6f7] rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#32363a]">
                Aceitar Duplicata
              </h3>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-[#6a6d70] hover:text-[#32363a] transition-colors p-1 rounded hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-[#32363a] leading-relaxed">
                Deseja confirmar o aceite da duplicata <strong>{selectedBill.id}</strong>?
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-[#fafafa] rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="h-10 px-6 border border-[#D9DDE3] rounded-lg text-sm font-semibold text-[#007BFF] bg-white hover:bg-[rgba(0,123,255,0.08)] hover:border-[#0066E0] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAccept}
                className="h-10 px-6 rounded-lg text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-all duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedBill && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-lg w-[500px] max-w-[90vw] shadow-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-[#f5f6f7] rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#32363a]">
                Recusar Duplicata
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-[#6a6d70] hover:text-[#32363a] transition-colors p-1 rounded hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-[#32363a] leading-relaxed">
                Deseja confirmar a recusa da duplicata <strong>{selectedBill.id}</strong>?
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-[#fafafa] rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="h-10 px-6 border border-[#D9DDE3] rounded-lg text-sm font-semibold text-[#007BFF] bg-white hover:bg-[rgba(0,123,255,0.08)] hover:border-[#0066E0] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="h-10 px-6 rounded-lg text-sm font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] transition-all duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Duplicate Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-white rounded-lg w-[500px] max-w-[90vw] shadow-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-[#f5f6f7] rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#32363a]">
                Cancelar Duplicata
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-[#6a6d70] hover:text-[#32363a] transition-colors p-1 rounded hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-[#32363a] leading-relaxed">
                Deseja confirmar o cancelamento da duplicata?
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-[#fafafa] rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="h-10 px-6 border border-[#D9DDE3] rounded-lg text-sm font-semibold text-[#007BFF] bg-white hover:bg-[rgba(0,123,255,0.08)] hover:border-[#0066E0] transition-all duration-200"
              >
                Não
              </button>
              <button
                onClick={confirmCancel}
                className="h-10 px-6 rounded-lg text-sm font-bold text-white bg-[#0854a0] hover:bg-[#0066E0] transition-all duration-200"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abatimento Modal */}
      {showAbatimentoModal && selectedBill && (
        <AbatimentoRegistrationModal
          bill={selectedBill}
          onClose={() => {
            setShowAbatimentoModal(false);
            setSelectedBill(null);
          }}
          onConfirm={confirmAbatimento}
        />
      )}
    </div>
  );
}

export default DuplicatasRecebidasPage;
