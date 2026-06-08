import { useState } from 'react';
import { Copy, CalendarCheck, X, FileText } from '@phosphor-icons/react';
import { Invoice, Installment, ExtendedInstallment } from '../types/invoice';
import { formatCurrency } from '../utils/format';

interface InvoicesTableRowProps {
  invoice: Invoice;
  onEditClick: (invoice: Invoice) => void;
  onCancelDuplicate: () => void;
  onCancelInstallment: () => void;
}

export function InvoicesTableRow({
  invoice,
  onEditClick,
  onCancelDuplicate,
  onCancelInstallment
}: InvoicesTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<ExtendedInstallment | null>(null);
  const [showEscriturarModal, setShowEscriturarModal] = useState(false);

  const handleInstallmentClick = (installment: Installment) => {
    setSelectedInstallment(
      selectedInstallment?.number === installment.number ? null : {
        ...installment,
        company: invoice.company,
        bank: invoice.bank,
        updateDate: '18/06/2024 às 09:37',
        status: 'Escriturada',
        itemId: '374c6a2e-f39e-4abb-bb48-acabcd0e40bcb',
        transactionId: '73cd99c6-8e93-47e3-a675-568876e29478',
        businessAssetId: '76cd3076-42a7-47d1-8b53-5b1347d39df2',
        reference: 'AABBCCDD11223344',
        error: '230-999 erro inesperado/serviço indisponível'
      }
    );
  };

  const handleEscriturarClick = () => {
    setShowEscriturarModal(true);
  };

  const confirmEscriturar = () => {
    console.log(`Escriturando duplicatas da fatura ${invoice.id}, nota fiscal ${invoice.numeroNota}`);
    setShowEscriturarModal(false);
  };

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200"
      >
        <td className="px-4 py-4 text-sm text-gray-900">{invoice.id}</td>
        <td className="px-4 py-4 text-sm text-gray-900">{invoice.company}</td>
        <td className="px-4 py-4 text-sm text-gray-900">{invoice.issueDate}</td>
        <td className="px-4 py-4 text-sm text-gray-900">{invoice.dueDate}</td>
        <td className="px-4 py-4 text-sm text-gray-900 text-right font-semibold">
          R$ {formatCurrency(invoice.total)}
        </td>
        <td className="px-4 py-4 text-sm text-gray-900 text-center">
          {invoice.duplicate ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              Sim
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              Não
            </span>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-gray-200">
          <td colSpan={6} className="p-0">
            <div className="bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Fatura {invoice.id}
                    <span className="text-sm text-gray-500 font-normal">
                      Vencimento: {invoice.dueDate}
                    </span>
                  </h2>
                </div>
                <div className="flex gap-2">
                  {invoice.duplicate ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(invoice);
                        }}
                        className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        Alterar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelDuplicate();
                        }}
                        className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        Cancelar duplicata
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEscriturarClick();
                      }}
                      className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Escriturar duplicatas
                    </button>
                  )}
                  <button className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <CalendarCheck size={16} />
                    Solicitar antecipação
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="h-9 w-9 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 px-6 py-4 bg-white">
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Valor total</h4>
                  <p className="text-sm text-gray-900 font-medium">R$ {formatCurrency(invoice.total)}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Sacado</h4>
                  <p className="text-sm text-gray-900">{invoice.drawee.name}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Moeda</h4>
                  <p className="text-sm text-gray-900">{invoice.currency}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Última atualização</h4>
                  <p className="text-sm text-gray-900">{invoice.issueDate}</p>
                </div>

                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Documento</h4>
                  <p className="text-sm text-gray-900">{invoice.drawee.document}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Código</h4>
                  <p className="text-sm text-gray-900">{invoice.drawee.code}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Domicílio Bancário</h4>
                  <p className="text-sm text-gray-900">{invoice.bank.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Agência: {invoice.bank.agency} / Conta: {invoice.bank.account}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Condições de pagamento</h4>
                  <p className="text-sm text-gray-900">{invoice.payment}</p>
                </div>

                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Chave do documento fiscal</h4>
                  <p className="text-xs text-gray-900 break-all">{invoice.fiscalKey}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Número da Nota</h4>
                  <p className="text-sm text-gray-900">{invoice.numeroNota}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Série</h4>
                  <p className="text-sm text-gray-900">{invoice.serie}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">Data de Emissão</h4>
                  <p className="text-sm text-gray-900">{invoice.issueDate}</p>
                </div>
              </div>

              <div className="bg-white px-6 pb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nº Parcela
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vt
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Cpgt
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        MP
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Duplicata
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.installments.map((installment) => (
                      <>
                        <tr
                          key={installment.number}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstallmentClick(installment);
                          }}
                          className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{installment.number}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">R$ {formatCurrency(installment.value)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{installment.dueDate}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{installment.vt}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{installment.cpgt}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{installment.mp}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{installment.duplicate}</td>
                        </tr>
                        {selectedInstallment?.number === installment.number && (
                          <tr className="border-b border-gray-200">
                            <td colSpan={7} className="p-0">
                              <div className="bg-gray-50">
                                <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
                                  <div>
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                      Parcela {installment.number}
                                      <span className="text-sm text-gray-500 font-normal">
                                        Duplicata Escriturada: {installment.duplicate}
                                      </span>
                                    </h2>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditClick(invoice);
                                      }}
                                      className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                      Alterar
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onCancelInstallment();
                                      }}
                                      className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                      Cancelar duplicata
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInstallment(null);
                                      }}
                                      className="h-9 w-9 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 px-6 py-4 bg-white">
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Valor Atualizado</h4>
                                    <p className="text-sm text-gray-900 font-medium">R$ {formatCurrency(installment.value)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Últ. atualiz. 00/00/2023</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Vencimento</h4>
                                    <p className="text-sm text-gray-900">{installment.dueDate}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Domicílio Bancário</h4>
                                    <p className="text-sm text-gray-900">{invoice.bank.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Agência: {invoice.bank.agency} | Conta: {invoice.bank.account}
                                    </p>
                                    <p className="text-xs text-gray-500">Empresa 1</p>
                                    <p className="text-xs text-gray-500">111.111.111/1111-11</p>
                                  </div>

                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Data e Hora da Atualização</h4>
                                    <p className="text-sm text-gray-900">{selectedInstallment.updateDate}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Status</h4>
                                    <p className="text-sm text-gray-900">{selectedInstallment.status}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Manifestação</h4>
                                    <p className="text-sm text-gray-900">Manifestado</p>
                                  </div>

                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Id do Item</h4>
                                    <p className="text-xs text-gray-900 break-all">{selectedInstallment.itemId}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Id da Transação</h4>
                                    <p className="text-xs text-gray-900 break-all">{selectedInstallment.transactionId}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Business Asset Id</h4>
                                    <p className="text-xs text-gray-900 break-all">{selectedInstallment.businessAssetId}</p>
                                  </div>

                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Referência</h4>
                                    <p className="text-sm text-gray-900">{selectedInstallment.reference}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs text-gray-500 mb-1">Erro</h4>
                                    <p className="text-sm text-red-600">{selectedInstallment.error}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}

      {showEscriturarModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
          onClick={() => setShowEscriturarModal(false)}
        >
          <div
            className="bg-white rounded-lg w-[500px] max-w-[90vw] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Escriturar Duplicatas
              </h3>
              <button
                onClick={() => setShowEscriturarModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-[15px] text-gray-700 leading-relaxed">
                Deseja escriturar as duplicatas da fatura <strong>{invoice.id}</strong>, nota fiscal <strong>{invoice.numeroNota}</strong>?
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEscriturarModal(false)}
                className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEscriturar}
                className="h-9 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
