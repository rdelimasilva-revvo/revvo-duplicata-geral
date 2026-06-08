import { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Building2, CreditCard, Calendar, Banknote, QrCode, Landmark, AlertTriangle, Server } from 'lucide-react';
import { Bill, BoletoPayment, TransferenciaPayment, PixPayment } from '@/modules/notificacaoDuplicata/types/bill';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import { AbatimentoInlineForm } from './AbatimentoInlineForm';
import { AUTO_ANALYSIS_STATUSES, MANIFESTABLE_STATUSES, STATUS_CONFIG } from '@/modules/notificacaoDuplicata/utils/statusConfig';
import type { AbatimentoData } from '@/modules/notificacaoDuplicata/components/modals/AbatimentoRegistrationModal';

interface BillDetailsExpandedProps {
  bill: Bill;
  onClose: () => void;
  onAccept?: (bill: Bill) => void;
  onReject?: (bill: Bill) => void;
  onEditClick?: (bill: Bill) => void;
  onCancelDuplicate?: () => void;
}

function isBoletoPayment(instrument: Bill['paymentInstrument']): instrument is BoletoPayment {
  return instrument.type === 'Boleto' && 'codigoBarras' in instrument;
}

function isTransferenciaPayment(instrument: Bill['paymentInstrument']): instrument is TransferenciaPayment {
  return instrument.type === 'Transferência' && 'ispbCompe' in instrument;
}

function isPixPayment(instrument: Bill['paymentInstrument']): instrument is PixPayment {
  return instrument.type === 'PIX' && 'chavePix' in instrument;
}

function getDuplicataType(type: string): string {
  if (type.toLowerCase().includes('mercantil')) return 'DM';
  if (type.toLowerCase().includes('servico') || type.toLowerCase().includes('serviço')) return 'DS';
  return type;
}

export function BillDetailsExpanded({
  bill,
  onClose,
  onAccept,
  onReject,
  onEditClick,
  onCancelDuplicate
}: BillDetailsExpandedProps) {
  const isInAutoAnalysis = AUTO_ANALYSIS_STATUSES.includes(bill.statusManifestacao);
  const showManifestationButtons = MANIFESTABLE_STATUSES.includes(bill.statusManifestacao) || isInAutoAnalysis;
  const [aceitarComRessalva, setAceitarComRessalva] = useState(false);
  const [abatimentoData, setAbatimentoData] = useState<AbatimentoData | null>(null);
  const [abatimentoErrors, setAbatimentoErrors] = useState<Record<string, string>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleAcceptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aceitarComRessalva) {
      const errors: Record<string, string> = {};
      if (!abatimentoData || abatimentoData.valorAbatimento <= 0) {
        errors.valorAbatimento = 'Informe o valor do abatimento';
      }
      if (!abatimentoData?.motivo) {
        errors.motivo = 'Selecione o motivo do abatimento';
      }
      if (!abatimentoData?.dataAcordo) {
        errors.dataAcordo = 'Informe a data de análise';
      }
      if (abatimentoData && abatimentoData.valorAbatimento >= bill.amount) {
        errors.valorAbatimento = 'O valor do abatimento deve ser menor que o valor da duplicata';
      }
      if (Object.keys(errors).length > 0) {
        setAbatimentoErrors(errors);
        return;
      }
      setShowConfirmDialog(true);
    } else {
      onAccept?.(bill);
    }
  };

  const handleConfirmRessalva = () => {
    setShowConfirmDialog(false);
    console.log('Aceito com ressalva:', { bill: bill.id, abatimento: abatimentoData });
    onAccept?.(bill);
  };

  const getDetailedStatusBadge = () => {
    const config = STATUS_CONFIG[bill.statusManifestacao];
    if (!config) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">-</span>;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const renderPaymentInstrument = () => {
    const instrument = bill.paymentInstrument;

    if (isBoletoPayment(instrument)) {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tipo de Boleto</p>
              <p className="text-sm font-medium text-gray-900">{instrument.tipoBoleto}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Identificador do Boleto</p>
              <p className="text-sm font-medium text-gray-900">{instrument.identificadorBoleto}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Código de Barras</p>
            <p className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-900 break-all">{instrument.codigoBarras}</p>
          </div>
        </div>
      );
    }

    if (isTransferenciaPayment(instrument)) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tipo de Conta</p>
            <p className="text-sm font-medium text-gray-900">{instrument.tipoConta}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">ISPB/COMPE</p>
            <p className="text-sm font-medium text-gray-900">{instrument.ispbCompe}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Agência</p>
            <p className="text-sm font-medium text-gray-900">{instrument.agencia}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Conta</p>
            <p className="text-sm font-medium text-gray-900">{instrument.conta}-{instrument.digitoConta}</p>
          </div>
        </div>
      );
    }

    if (isPixPayment(instrument)) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tipo de Chave PIX</p>
            <p className="text-sm font-medium text-gray-900">{instrument.tipoChavePix}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Chave PIX</p>
            <p className="text-sm font-medium text-gray-900 break-all">{instrument.chavePix}</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p className="text-sm text-gray-900">{'details' in instrument ? instrument.details : '-'}</p>
      </div>
    );
  };

  const getPaymentIcon = () => {
    const type = bill.paymentInstrument.type;
    if (type === 'Boleto') return <FileText className="w-4 h-4 text-gray-500" />;
    if (type === 'PIX') return <QrCode className="w-4 h-4 text-gray-500" />;
    return <Landmark className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Detalhes da Nota Fiscal</h2>
          {bill.notaFiscal && (
            <span className="text-sm text-gray-500">NF {bill.notaFiscal.numero} | Série {bill.notaFiscal.serie}</span>
          )}
        </div>
        <div className="flex gap-2">
          {showManifestationButtons ? (
            <>
              <button
                onClick={handleAcceptClick}
                disabled={isInAutoAnalysis}
                className={`h-9 px-4 border rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isInAutoAnalysis
                    ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                    : aceitarComRessalva
                      ? 'border-[#0854a0] text-[#0854a0] bg-[#e5f0fa] hover:bg-[#d6e8f8]'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <CheckCircle size={16} />
                {aceitarComRessalva ? 'Aceitar com Ressalva' : 'Aceitar'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.(bill);
                }}
                disabled={isInAutoAnalysis}
                className={`h-9 px-4 border rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isInAutoAnalysis
                    ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <XCircle size={16} />
                Recusar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.(bill);
                }}
                className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Alterar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelDuplicate?.();
                }}
                className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancelar duplicata
              </button>
            </>
          )}
          <button className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Solicitar antecipação
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-9 w-9 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Sacado (Devedor)</h3>
                  </div>
                  {bill.sacado ? (
                    <div className="pl-6">
                      <p className="font-semibold text-gray-900">{bill.sacado.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{bill.sacado.cnpj}</p>
                    </div>
                  ) : (
                    <div className="pl-6">
                      <p className="text-xs text-gray-500">Não informado</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2 justify-end">
                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cedente (Fornecedor)</h3>
                    <Building2 className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="pr-6">
                    <p className="font-semibold text-gray-900">{bill.sacador.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{bill.sacador.cnpj}</p>
                  </div>
                </div>
              </div>
            </div>

            {bill.notaFiscal && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Dados do Documento Fiscal</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Número da Nota</p>
                    <p className="text-sm font-semibold text-blue-600">{bill.notaFiscal.numero}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Série</p>
                    <p className="text-sm font-semibold text-gray-900">{bill.notaFiscal.serie}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Data de Emissão</p>
                    <p className="text-sm font-semibold text-gray-900">{bill.notaFiscal.dataEmissao}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Valor Total da Nota</p>
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(bill.amount)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Chave de Acesso NFe (44 dígitos)</p>
                  <p className="text-xs font-mono font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 break-all">{bill.notaFiscal.chave}</p>
                </div>
              </div>
            )}

            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Valores e Datas da Nota</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Valor Total da Nota Fiscal</p>
                  <p className="text-base font-bold text-blue-600">{formatCurrency(bill.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Vencimento Original</p>
                  <p className="text-sm font-semibold text-gray-900">{bill.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Valor de Abatimento</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {bill.discountValue > 0 ? formatCurrency(bill.discountValue) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Valor Atualizado</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {bill.updateValue > 0 ? formatCurrency(bill.updateValue) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Vencimento Atual</p>
                  <p className="text-sm font-semibold text-gray-900">{bill.currentDueDate || bill.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Última Atualização</p>
                  <p className="text-sm font-medium text-gray-900">{bill.lastUpdateDate}</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Duplicata Vinculada</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">IUD (Identificador Único)</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{bill.iud}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tipo de Duplicata</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getDuplicataType(bill.type)} - {bill.type}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Status da Manifestação</p>
                  {getDetailedStatusBadge()}
                </div>
              </div>
            </div>

            {bill.erp && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Informações ERP</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Documento Contábil</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{bill.erp.documentoContabil}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Empresa</p>
                    <p className="text-sm font-semibold text-gray-900">{bill.erp.empresa}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Ano</p>
                    <p className="text-sm font-semibold text-gray-900">{bill.erp.ano}</p>
                  </div>
                </div>
              </div>
            )}

            {bill.ressalvaValor != null && bill.ressalvaValor > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Ressalva de Valor</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Valor da Ressalva</p>
                    <p className="text-base font-bold text-gray-900">-{formatCurrency(bill.ressalvaValor)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Valor Aceito</p>
                    <p className="text-base font-bold text-gray-900">{formatCurrency(bill.amount - bill.ressalvaValor)}</p>
                  </div>
                  {bill.ressalvaMotivo && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-0.5">Motivo</p>
                      <p className="text-sm font-medium text-gray-900">{bill.ressalvaMotivo}</p>
                    </div>
                  )}
                  {bill.ressalvaData && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Data da Ressalva</p>
                      <p className="text-sm font-medium text-gray-900">{bill.ressalvaData}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                {getPaymentIcon()}
                <CreditCard className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Instrumento de Pagamento</h3>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-0.5">Tipo de Instrumento</p>
                <p className="text-sm font-bold text-gray-900">{bill.paymentInstrument.type}</p>
              </div>
              {renderPaymentInstrument()}
            </div>

            {bill.parcelas && bill.parcelas.length > 0 && (
              <div className="p-4 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Parcelas</h3>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nº</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vencimento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.parcelas.map((parcela, index) => (
                        <tr key={parcela.numero} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 text-gray-900 font-medium">{parcela.numero}</td>
                          <td className="px-3 py-2 text-gray-900 font-semibold">{formatCurrency(parcela.valor)}</td>
                          <td className="px-3 py-2 text-gray-900">{parcela.vencimento}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!bill.parcelas?.length && (
              <div className="p-4 flex-1 flex items-center justify-center text-gray-400 text-sm">
                Sem informações adicionais
              </div>
            )}
          </div>
        </div>

        {MANIFESTABLE_STATUSES.includes(bill.statusManifestacao) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={aceitarComRessalva}
                  onChange={(e) => {
                    setAceitarComRessalva(e.target.checked);
                    if (!e.target.checked) {
                      setAbatimentoData(null);
                      setAbatimentoErrors({});
                    }
                  }}
                  className="w-[18px] h-[18px] rounded border-2 border-[#89919a] text-[#0854a0] focus:ring-[#0854a0] focus:ring-2 focus:ring-opacity-20 cursor-pointer transition-colors group-hover:border-[#0854a0]"
                  id="checkbox-ressalva-expanded"
                />
              </div>
              <div>
                <span className="text-sm text-[#32363a] font-semibold transition-colors">
                  Aceitar com ressalva de valor
                </span>
                <p className="text-xs text-[#6a6d70] mt-0.5">
                  Registrar um abatimento antes de aceitar esta duplicata
                </p>
              </div>
            </label>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                aceitarComRessalva ? 'max-h-[800px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <AbatimentoInlineForm
                bill={bill}
                errors={abatimentoErrors}
                onChange={(data) => {
                  setAbatimentoData(data);
                  if (Object.keys(abatimentoErrors).length > 0) {
                    setAbatimentoErrors({});
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1100]"
          onClick={() => setShowConfirmDialog(false)}
        >
          <div
            className="bg-white rounded-lg w-[520px] max-w-[90vw] shadow-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-[#f5f6f7] rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#32363a]">
                Confirmar aceite com ressalva
              </h3>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="text-[#6a6d70] hover:text-[#32363a] transition-colors p-1 rounded hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-[#32363a] leading-relaxed mb-4">
                Deseja aceitar a duplicata <strong>{bill.id}</strong> com ressalva de valor?
              </p>

              {abatimentoData && (
                <div className="bg-[#f5f6f7] border border-[#d9d9d9] rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6a6d70]">Valor Original</span>
                    <span className="font-medium text-[#32363a]">{formatCurrency(bill.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6a6d70]">(-) Abatimento</span>
                    <span className="font-medium text-[#b00]">-{formatCurrency(abatimentoData.valorAbatimento)}</span>
                  </div>
                  <div className="border-t border-[#d9d9d9] pt-2 flex justify-between text-sm">
                    <span className="font-semibold text-[#32363a]">Valor Final</span>
                    <span className="font-bold text-[#107e3e] text-base">
                      {formatCurrency(bill.amount - abatimentoData.valorAbatimento)}
                    </span>
                  </div>
                  <div className="border-t border-[#d9d9d9] pt-2 mt-2">
                    <p className="text-xs text-[#6a6d70]">
                      Motivo: <span className="text-[#32363a]">{abatimentoData.motivo}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-[#fafafa] rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="h-10 px-6 border border-[#D9DDE3] rounded-lg text-sm font-semibold text-[#007BFF] bg-white hover:bg-[rgba(0,123,255,0.08)] hover:border-[#0066E0] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRessalva}
                className="h-10 px-6 rounded-lg text-sm font-bold text-white bg-[#0854a0] hover:bg-[#0066E0] transition-all duration-200"
              >
                Confirmar Aceite com Ressalva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
