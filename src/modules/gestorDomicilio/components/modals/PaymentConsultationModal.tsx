import { useState } from 'react';
import { Calendar, AlertTriangle, Shield, CreditCard, FileText, Search } from 'lucide-react';
import { Modal } from '@/modules/gestorDomicilio/components/ui/Modal';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';
import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { formatCurrency } from '@/modules/gestorDomicilio/utils/format';

interface PaymentConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBills: Bill[];
}

interface PaymentData {
  originalAmount: number;
  interest: number;
  penalty: number;
  fees: number;
  protestFee: number;
  totalAmount: number;
  hasActiveProtest: boolean;
  paymentInstrument: {
    type: 'PIX' | 'Boleto' | 'Transferência';
    details: string;
    validated: boolean;
  };
}

export function PaymentConsultationModal({ isOpen, onClose, selectedBills }: PaymentConsultationModalProps) {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultationResults, setConsultationResults] = useState<Record<string, PaymentData>>({});
  const [showResults, setShowResults] = useState(false);

  const calculateDateDifference = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysDifference = calculateDateDifference(dateRange.startDate, dateRange.endDate);
  const isValidDateRange = daysDifference > 0 && daysDifference <= 30;

  const handleConsultation = async () => {
    setIsConsulting(true);
    
    // Simular consulta DE007
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults: Record<string, PaymentData> = {};
    selectedBills.forEach(bill => {
      const isOverdue = new Date(bill.dueDate.split('/').reverse().join('-')) < new Date();
      mockResults[bill.id] = {
        originalAmount: bill.amount,
        interest: isOverdue ? bill.amount * 0.02 : 0,
        penalty: isOverdue ? bill.amount * 0.02 : 0,
        fees: 15.50,
        protestFee: Math.random() > 0.7 ? 45.00 : 0,
        totalAmount: bill.amount + (isOverdue ? bill.amount * 0.04 : 0) + 15.50 + (Math.random() > 0.7 ? 45.00 : 0),
        hasActiveProtest: Math.random() > 0.8,
        paymentInstrument: {
          type: bill.paymentInstrument.type as 'PIX' | 'Boleto' | 'Transferência',
          details: bill.paymentInstrument.details,
          validated: Math.random() > 0.1
        }
      };
    });
    
    setConsultationResults(mockResults);
    setShowResults(true);
    setIsConsulting(false);
  };

  const totalConsultationAmount = Object.values(consultationResults).reduce((sum, data) => sum + data.totalAmount, 0);
  const hasProtests = Object.values(consultationResults).some(data => data.hasActiveProtest);
  const hasInvalidInstruments = Object.values(consultationResults).some(data => !data.paymentInstrument.validated);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1000px]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Consulta para Pagamento (DE007)</h2>
            <p className="text-sm text-gray-600 mt-1">Consultar informações necessárias para pagar duplicatas em aberto</p>
          </div>
        </div>

        {/* Objetivo da Consulta */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Informações Obtidas na Consulta DE007</p>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>Valores atualizados</strong> com juros, multas e correções</li>
                <li>• <strong>Dados bancários válidos</strong> para quitação</li>
                <li>• <strong>Status de protesto</strong> e taxas cartoriais</li>
                <li>• <strong>Emolumentos</strong> e custas aplicáveis</li>
                <li>• <strong>Validação de instrumentos</strong> de pagamento</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Alerta sobre Período Máximo */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Período Máximo de Consulta</p>
              <p className="text-amber-700">
                Máximo de <strong>30 dias</strong> por consulta. Planeje adequadamente para pagamentos 
                de múltiplos vencimentos e evite consultas desnecessárias.
              </p>
            </div>
          </div>
        </div>

        {!showResults ? (
          <>
            {/* Filtro de Datas */}
            <div className="bg-white border rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-4">Período para Consulta</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full h-[32px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full h-[32px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              
              {daysDifference > 0 && (
                <div className={`text-sm p-2 rounded ${
                  isValidDateRange 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {isValidDateRange 
                    ? `✓ Período válido: ${daysDifference} dias`
                    : `✗ Período inválido: ${daysDifference} dias (máximo 30 dias)`
                  }
                </div>
              )}
            </div>

            {/* Duplicatas Selecionadas */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-3">Duplicatas em Aberto para Consulta ({selectedBills.length})</h3>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">IUD</th>
                      <th className="px-3 py-2 text-left">Sacador</th>
                      <th className="px-3 py-2 text-left">Vencimento</th>
                      <th className="px-3 py-2 text-left">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBills.map((bill) => (
                      <tr key={bill.id} className="border-b">
                        <td className="px-3 py-2 text-blue-600">{bill.iud}</td>
                        <td className="px-3 py-2">{bill.sacador.name}</td>
                        <td className="px-3 py-2">{bill.dueDate}</td>
                        <td className="px-3 py-2">{formatCurrency(bill.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Importância da Consulta */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 mb-2">Por que Consultar Antes de Pagar?</p>
                  <ul className="text-green-700 space-y-1">
                    <li>• <strong>Evita pagamentos incorretos</strong> que impedem baixa automática</li>
                    <li>• <strong>Garante valores exatos</strong> com todas as atualizações</li>
                    <li>• <strong>Valida dados bancários</strong> para evitar fraudes</li>
                    <li>• <strong>Identifica protestos</strong> e custas adicionais</li>
                    <li>• <strong>Assegura quitação completa</strong> da duplicata</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConsultation}
                disabled={!isValidDateRange || selectedBills.length === 0 || isConsulting}
                className="flex items-center gap-2"
              >
                {isConsulting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Consultar DE007
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Resultados da Consulta */}
            <div className="space-y-6">
              {/* Alertas Críticos */}
              {(hasProtests || hasInvalidInstruments) && (
                <div className="space-y-3">
                  {hasProtests && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-red-800 mb-1">Protestos Ativos Detectados</p>
                          <p className="text-red-700">
                            Algumas duplicatas possuem protesto ativo. Taxas cartoriais adicionais aplicáveis.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {hasInvalidInstruments && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-orange-800 mb-1">Validação de Instrumentos</p>
                          <p className="text-orange-700">
                            Alguns instrumentos de pagamento precisam de validação. Verifique dados bancários.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resumo Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Informações para Pagamento - Resumo Geral</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Duplicatas consultadas:</span>
                    <p className="font-medium">{selectedBills.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor total para pagamento:</span>
                    <p className="font-medium text-green-600">{formatCurrency(totalConsultationAmount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duplicatas protestadas:</span>
                    <p className="font-medium text-red-600">
                      {Object.values(consultationResults).filter(data => data.hasActiveProtest).length}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Dados bancários válidos:</span>
                    <p className="font-medium text-blue-600">
                      {Object.values(consultationResults).filter(data => data.paymentInstrument.validated).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalhes por Duplicata */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <div className="bg-gray-100 p-3 border-b">
                  <h4 className="font-medium text-sm">Informações Detalhadas para Pagamento por Duplicata</h4>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">IUD</th>
                      <th className="px-3 py-2 text-left">Valor Base</th>
                      <th className="px-3 py-2 text-left">Juros</th>
                      <th className="px-3 py-2 text-left">Multa</th>
                      <th className="px-3 py-2 text-left">Custas</th>
                      <th className="px-3 py-2 text-left">Valor a Pagar</th>
                      <th className="px-3 py-2 text-left">Dados Bancários</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBills.map((bill) => {
                      const data = consultationResults[bill.id];
                      return (
                        <tr key={bill.id} className="border-b">
                          <td className="px-3 py-2 text-blue-600">{bill.iud}</td>
                          <td className="px-3 py-2">{formatCurrency(data.originalAmount)}</td>
                          <td className="px-3 py-2 text-orange-600">
                            {data.interest > 0 ? formatCurrency(data.interest) : '-'}
                          </td>
                          <td className="px-3 py-2 text-red-600">
                            {data.penalty > 0 ? formatCurrency(data.penalty) : '-'}
                          </td>
                          <td className="px-3 py-2">{formatCurrency(data.fees + data.protestFee)}</td>
                          <td className="px-3 py-2 font-medium text-green-600">{formatCurrency(data.totalAmount)}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span>{data.paymentInstrument.type}</span>
                              {data.paymentInstrument.validated ? (
                                <span className="text-green-600 text-xs">✓</span>
                              ) : (
                                <span className="text-red-600 text-xs">⚠</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {data.hasActiveProtest ? (
                              <span className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                                Com Protesto
                              </span>
                            ) : (
                              <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">
                                Sem Protesto
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Instruções de Pagamento */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-2">Como Proceder com o Pagamento</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• <strong>Use apenas os valores desta consulta</strong> - valores desatualizados causam problemas</li>
                      <li>• <strong>Confirme dados bancários válidos</strong> - instrumentos inválidos podem gerar fraudes</li>
                      <li>• <strong>Pague o valor total exato</strong> - pagamento parcial não quita a duplicata</li>
                      <li>• <strong>Para duplicatas protestadas</strong> - inclua todas as custas cartoriais</li>
                      <li>• <strong>Prazo de validade</strong> - informações válidas por 24 horas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowResults(false)}>
                Consultar Novamente
              </Button>
              <Button variant="primary" onClick={onClose}>
                Prosseguir com Pagamento
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}