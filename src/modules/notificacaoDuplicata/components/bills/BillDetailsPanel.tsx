import { useState, useRef } from 'react';
import { X, Copy, Check, XCircle, CheckCircle2, PenLine, Loader2, ClipboardList, Ban, PackageX } from 'lucide-react';
import { Bill, BoletoPayment, TransferenciaPayment, PixPayment } from '@/modules/notificacaoDuplicata/types/bill';
import { Dialog } from '@/modules/notificacaoDuplicata/components/ui/Dialog';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/modules/notificacaoDuplicata/components/ui/Toast';
import { RejectDialog } from '@/modules/notificacaoDuplicata/components/ui/RejectDialog';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import { AbatimentoInlineForm } from '@/modules/notificacaoDuplicata/components/bills/AbatimentoInlineForm';
import { CommercialAnnotationModal } from '@/modules/notificacaoDuplicata/components/modals/CommercialAnnotationModal';
import { ACCEPTED_STATUSES, REJECTED_STATUSES, AUTO_ANALYSIS_STATUSES } from '@/modules/notificacaoDuplicata/utils/statusConfig';
import type { AbatimentoData } from '@/modules/notificacaoDuplicata/components/modals/AbatimentoRegistrationModal';

function getStatusLabel(status: Bill['statusManifestacao']) {
  const labels: Record<string, string> = {
    recebida: 'Recebida',
    em_fila_processamento: 'Em Fila de Processamento',
    em_analise_automatica: 'Em Análise Automática',
    em_fila_analise_manual: 'Em Fila de Análise Manual',
    aceite_automatico: 'Aceite Automático',
    recusa_automatica: 'Recusa Automática',
    reprocessamento: 'Reprocessamento',
    aceite_manual: 'Aceite Manual',
    recusa_manual: 'Recusa Manual',
    contestada: 'Contestada',
  };
  return labels[status] ?? status;
}

function getStatusStyle(status: Bill['statusManifestacao']) {
  const styles: Record<string, string> = {
    recebida: 'bg-gray-100 text-gray-700',
    em_fila_processamento: 'bg-sky-100 text-sky-700',
    em_analise_automatica: 'bg-sky-100 text-sky-700',
    em_fila_analise_manual: 'bg-amber-100 text-amber-800',
    aceite_automatico: 'bg-emerald-100 text-emerald-700',
    recusa_automatica: 'bg-red-100 text-red-700',
    reprocessamento: 'bg-sky-100 text-sky-700',
    aceite_manual: 'bg-emerald-100 text-emerald-700',
    recusa_manual: 'bg-red-100 text-red-700',
    contestada: 'bg-orange-100 text-orange-700',
  };
  return styles[status] ?? 'bg-gray-100 text-gray-700';
}

const AUTOMATIC_PROCESS_STATUSES = AUTO_ANALYSIS_STATUSES;

function getEspecie(type: string): string {
  if (type.toLowerCase().includes('mercantil')) return 'DM';
  if (type.toLowerCase().includes('servico') || type.toLowerCase().includes('serviço')) return 'DS';
  return type.substring(0, 2).toUpperCase();
}

function isBoletoPayment(p: Bill['paymentInstrument']): p is BoletoPayment {
  return p.type === 'Boleto' && 'codigoBarras' in p;
}

function isTransferenciaPayment(p: Bill['paymentInstrument']): p is TransferenciaPayment {
  return p.type === 'Transferência' && 'agencia' in p;
}

function isPixPayment(p: Bill['paymentInstrument']): p is PixPayment {
  return p.type === 'PIX' && 'chavePix' in p;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copiar"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 min-h-[28px] flex items-end">{children}</p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{children}</h3>
  );
}

interface BillDetailsPanelProps {
  bill: Bill;
  onClose: () => void;
  allowOverrideAutoRejection?: boolean;
}

export function BillDetailsPanel({ bill, onClose, allowOverrideAutoRejection }: BillDetailsPanelProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mercadoriaNaoRecebida, setMercadoriaNaoRecebida] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastData, setSuccessToastData] = useState({ title: '', message: '' });
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>(() => {
    if (allowOverrideAutoRejection && bill.statusManifestacao === 'recusa_automatica') return 'pending';
    if (ACCEPTED_STATUSES.includes(bill.statusManifestacao)) return 'accepted';
    if (REJECTED_STATUSES.includes(bill.statusManifestacao)) return 'rejected';
    return 'pending';
  });
  const [aceitarComRessalva, setAceitarComRessalva] = useState(false);
  const [acceptedWithRessalva, setAcceptedWithRessalva] = useState(false);
  const [abatimentoData, setAbatimentoData] = useState<AbatimentoData | null>(null);
  const [abatimentoErrors, setAbatimentoErrors] = useState<Record<string, string>>({});
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [decisionTimestamp, setDecisionTimestamp] = useState<Date | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDescription, setRejectionDescription] = useState('');
  const abatimentoRef = useRef<HTMLDivElement>(null);

  const isAutomatic = ['aceite_automatico', 'recusa_automatica'].includes(bill.statusManifestacao);
  const isInAutoAnalysis = AUTOMATIC_PROCESS_STATUSES.includes(bill.statusManifestacao);
  const canAnnotate = [...ACCEPTED_STATUSES, ...REJECTED_STATUSES].includes(bill.statusManifestacao);

  const getManifestationInfo = () => {
    if (decisionTimestamp) {
      const date = decisionTimestamp.toLocaleDateString('pt-BR');
      const time = decisionTimestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${date} ${time}, usuário logado`;
    }
    if (bill.manifestacaoData) {
      const user = isAutomatic ? 'automação' : (bill.manifestacaoUsuario || 'usuário');
      const time = bill.manifestacaoHora || '';
      return `${bill.manifestacaoData}${time ? ' ' + time : ''}, ${user}`;
    }
    if (isAutomatic) return 'automação';
    return '';
  };
  const displayNumeroNota = bill.numeroNota ?? bill.notaFiscal?.numero ?? bill.id;
  const duplicatas = bill.duplicatas ?? [{ item: '037', numero: 1, dataEmissao: bill.issueDate, dataVencimento: bill.dueDate, valor: bill.amount, iud: bill.iud }];

  const handleAccept = () => {
    if (aceitarComRessalva) {
      const errors: Record<string, string> = {};
      if (!abatimentoData || abatimentoData.valorAbatimento <= 0) {
        errors.valorAbatimento = 'Informe um valor válido';
      } else if (abatimentoData.valorAbatimento > bill.amount) {
        errors.valorAbatimento = 'O abatimento não pode ser maior que o valor original';
      }
      if (!abatimentoData?.motivo) {
        errors.motivo = 'Selecione um motivo';
      }
      if (!abatimentoData?.dataAcordo) {
        errors.dataAcordo = 'Informe a data de análise';
      }
      setAbatimentoErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    setMercadoriaNaoRecebida(false);
    setShowConfirmDialog(true);
  };
  const handleReject = () => setShowRejectDialog(true);

  const handleConfirmAccept = async () => {
    setShowConfirmDialog(false);
    setDecisionTimestamp(new Date());
    const isRessalva = aceitarComRessalva && abatimentoData;
    const ressalvaMsg = isRessalva
      ? `Aceito com ressalva de valor. Abatimento de ${formatCurrency(abatimentoData!.valorAbatimento)} registrado.`
      : 'Manifestação de aceite enviada com sucesso.';
    const toastMessage = mercadoriaNaoRecebida
      ? `${ressalvaMsg} Sinalizado: mercadoria não recebida.`
      : ressalvaMsg;
    setSuccessToastData({
      title: isRessalva ? 'Aceito com ressalva' : 'Aceito com sucesso',
      message: toastMessage,
    });
    setShowSuccessToast(true);
    setAcceptedWithRessalva(!!isRessalva);
    setStatus('accepted');

    try {
      await supabase.from('duplicata_acceptance_log').insert({
        bill_id: bill.id,
        numero_nota: displayNumeroNota,
        mercadoria_nao_recebida: mercadoriaNaoRecebida,
        com_ressalva: !!isRessalva,
        valor_abatimento: isRessalva ? abatimentoData!.valorAbatimento : null,
        motivo: isRessalva ? abatimentoData!.motivo : null,
        accepted_at: new Date().toISOString(),
        owner_id: null,
      });
    } catch (err) {
      console.error('Erro ao registrar aceite:', err);
    }
  };

  const REJECTION_REASON_LABELS: Record<string, string> = {
    '01': '01 - Falta de aceite',
    '02': '02 - Divergência nos dados da duplicata',
    '03': '03 - Divergência nos valores',
    '04': '04 - Duplicata não corresponde à mercadoria/serviço',
    '05': '05 - Mercadoria não recebida',
    '06': '06 - Serviço não prestado',
    '07': '07 - Falta de comprovação da entrega',
    '08': '08 - Prazo de vencimento incorreto',
    '09': '09 - Outros motivos (especificar)',
  };

  const handleConfirmReject = (reason: string, description: string) => {
    setShowRejectDialog(false);
    setDecisionTimestamp(new Date());
    setRejectionReason(REJECTION_REASON_LABELS[reason] || reason);
    setRejectionDescription(description);
    setSuccessToastData({
      title: 'Recusa de duplicata',
      message: 'Manifestação enviada com sucesso',
    });
    setShowSuccessToast(true);
    setStatus('rejected');
  };

  const payment = bill.paymentInstrument;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
        <div className="flex-shrink-0 px-4 sm:px-8 pt-6 sm:pt-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes da Nota Fiscal</h2>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusStyle(bill.statusManifestacao)}`}>
                  {getStatusLabel(bill.statusManifestacao)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">NF {displayNumeroNota}{bill.notaFiscal ? ` | Série ${bill.notaFiscal.serie}` : ''}{bill.erp?.documentoContabil ? ` | Doc. Contábil ${bill.erp.documentoContabil}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              {canAnnotate && (
                <button
                  onClick={() => setShowAnnotationModal(true)}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Anotação Comercial"
                >
                  <PenLine size={16} />
                  Anotação Comercial
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-end gap-12 mt-6 pb-6 border-b border-gray-200">
            <div>
              <SectionLabel>Valor da Nota Fiscal</SectionLabel>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
            </div>
            <div>
              <SectionLabel>Data de Emissão</SectionLabel>
              <p className="text-base text-gray-900">{bill.notaFiscal?.dataEmissao ?? bill.issueDate}</p>
            </div>
            <div>
              <SectionLabel>Duplicatas</SectionLabel>
              <p className="text-base text-gray-900">{duplicatas.length}</p>
            </div>
            {status === 'pending' && (
              <div>
                <SectionLabel>Prazo Manifestação</SectionLabel>
                <p className="text-base text-gray-900">{bill.diasParaManifestacao} dias</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-6">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-7 space-y-8">
              {bill.notaFiscal && (
                <section>
                  <SectionTitle>Dados da Nota Fiscal</SectionTitle>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <SectionLabel>Número NF</SectionLabel>
                      <p className="text-sm text-blue-600 font-semibold">{bill.notaFiscal.numero}</p>
                    </div>
                    <div>
                      <SectionLabel>Série</SectionLabel>
                      <p className="text-sm text-gray-900">{bill.notaFiscal.serie}</p>
                    </div>
                    <div>
                      <SectionLabel>Data de Emissão</SectionLabel>
                      <p className="text-sm text-gray-900">{bill.notaFiscal.dataEmissao}</p>
                    </div>
                    <div>
                      <SectionLabel>Valor Total Líquido</SectionLabel>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(bill.amount)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <SectionLabel>Chave de Acesso NFe</SectionLabel>
                    <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1.5">
                      <p className="text-xs text-gray-700 font-mono">{bill.notaFiscal.chave}</p>
                      <CopyButton text={bill.notaFiscal.chave} />
                    </div>
                  </div>
                </section>
              )}

              <div className="grid grid-cols-2 gap-8">
                {bill.sacado && (
                  <section>
                    <SectionTitle>Sacado (Devedor)</SectionTitle>
                    <p className="text-base font-semibold text-gray-900">{bill.sacado.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{bill.sacado.cnpj}</p>
                    {bill.sacado.address && (
                      <div className="mt-3">
                        <SectionLabel>Endereço</SectionLabel>
                        <p className="text-sm text-gray-900">{bill.sacado.address}</p>
                      </div>
                    )}
                  </section>
                )}

                <section>
                  <SectionTitle>Cedente (Fornecedor)</SectionTitle>
                  <p className="text-base font-semibold text-gray-900">{bill.sacador.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{bill.sacador.cnpj}</p>
                  {bill.sacador.address && (
                    <div className="mt-3">
                      <SectionLabel>Endereço</SectionLabel>
                      <p className="text-sm text-gray-900">{bill.sacador.address}</p>
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="col-span-5">
              <section>
                <SectionTitle>Valores</SectionTitle>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Valor da Nota Fiscal</p>
                    <p className="text-sm text-gray-900 mt-0.5">{formatCurrency(bill.amount)}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Valor Total Líquido</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-8 border-t border-dashed border-gray-200 pt-8">
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-7">
                <section>
                  <SectionTitle>Dados de Pagamento</SectionTitle>
                {isBoletoPayment(payment) ? (
                  <>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <SectionLabel>Instrumento de Pgto</SectionLabel>
                        <p className="text-sm text-gray-900">Boleto</p>
                      </div>
                      <div>
                        <SectionLabel>Tipo</SectionLabel>
                        <p className="text-sm text-gray-900">{payment.tipoBoleto}</p>
                      </div>
                      <div className="col-span-2">
                        <SectionLabel>Identificador</SectionLabel>
                        <p className="text-sm text-gray-900">{payment.identificadorBoleto}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <SectionLabel>Código de Barras</SectionLabel>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-700 font-mono">{payment.codigoBarras}</p>
                        <CopyButton text={payment.codigoBarras} />
                      </div>
                    </div>
                  </>
                ) : isTransferenciaPayment(payment) ? (
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <SectionLabel>Instrumento de Pgto</SectionLabel>
                      <p className="text-sm text-gray-900">Transferência</p>
                    </div>
                    <div>
                      <SectionLabel>Banco</SectionLabel>
                      <p className="text-sm text-gray-900">{payment.ispbCompe}</p>
                    </div>
                    <div>
                      <SectionLabel>Agência</SectionLabel>
                      <p className="text-sm text-gray-900">{payment.agencia}</p>
                    </div>
                    <div>
                      <SectionLabel>Conta</SectionLabel>
                      <p className="text-sm text-gray-900">{payment.conta}-{payment.digitoConta}</p>
                    </div>
                  </div>
                ) : isPixPayment(payment) ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <SectionLabel>Instrumento de Pgto</SectionLabel>
                      <p className="text-sm text-gray-900">PIX</p>
                    </div>
                    <div>
                      <SectionLabel>Tipo Chave</SectionLabel>
                      <p className="text-sm text-gray-900">{payment.tipoChavePix}</p>
                    </div>
                    <div>
                      <SectionLabel>Chave PIX</SectionLabel>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-gray-900">{payment.chavePix}</p>
                        <CopyButton text={payment.chavePix} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <SectionLabel>Instrumento de Pgto</SectionLabel>
                      <p className="text-sm text-gray-900">{payment.type}</p>
                    </div>
                    {'details' in payment && (
                      <div>
                        <SectionLabel>Detalhes</SectionLabel>
                        <p className="text-sm text-gray-900">{payment.details}</p>
                      </div>
                    )}
                  </div>
                )}
                </section>
              </div>

              <div className="col-span-5">
                {bill.erp && (
                  <section>
                    <SectionTitle>Informações ERP</SectionTitle>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <SectionLabel>Documento Contábil</SectionLabel>
                        <p className="text-sm text-gray-900 font-mono">{bill.erp.documentoContabil}</p>
                      </div>
                      <div>
                        <SectionLabel>Empresa</SectionLabel>
                        <p className="text-sm text-gray-900">{bill.erp.empresa}</p>
                      </div>
                      <div>
                        <SectionLabel>Ano</SectionLabel>
                        <p className="text-sm text-gray-900">{bill.erp.ano}</p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <SectionTitle>Duplicatas Vinculadas</SectionTitle>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nº Duplicata</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data de Emissão</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data de Vencimento</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IUD</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicatas.map((dup, index) => (
                    <tr key={dup.numero} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{dup.numero}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900">{dup.dataEmissao}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900">{dup.dataVencimento}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900 text-right font-semibold">{formatCurrency(dup.valor)}</td>
                      <td className="px-4 py-2.5 text-sm font-mono text-gray-900">{dup.item}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-700 font-mono">{dup.iud}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {status === 'accepted' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  {acceptedWithRessalva ? 'Duplicata aceita com ressalva de valor' : 'Duplicata aceita'}
                  {getManifestationInfo() && (
                    <span className="font-normal"> &mdash; {getManifestationInfo()}</span>
                  )}
                </p>
                {acceptedWithRessalva && abatimentoData && (
                  <p className="text-xs text-green-700 mt-1">
                    Abatimento de {formatCurrency(abatimentoData.valorAbatimento)} registrado ({abatimentoData.motivo})
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-sm text-red-800 font-medium">
                  Duplicata recusada
                  {getManifestationInfo() && (
                    <span className="font-normal"> &mdash; {getManifestationInfo()}</span>
                  )}
                </p>
                {rejectionReason && (
                  <p className="text-xs text-red-700">
                    <span className="font-semibold">Motivo:</span> {rejectionReason}
                  </p>
                )}
                {rejectionDescription && (
                  <p className="text-xs text-red-700">
                    <span className="font-semibold">Justificativa:</span> {rejectionDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'pending' && AUTOMATIC_PROCESS_STATUSES.includes(bill.statusManifestacao) && (
            <div className="mt-6 bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-sky-600 flex-shrink-0 animate-spin" />
              <div>
                <p className="text-sm text-sky-800 font-medium">Em processo automático de manifestação</p>
                <p className="text-xs text-sky-700 mt-0.5">
                  Status: {getStatusLabel(bill.statusManifestacao)} &mdash; A duplicata está sendo processada automaticamente. Caso necessário, você poderá intervir manualmente após a conclusão.
                </p>
              </div>
            </div>
          )}

          {status === 'pending' && bill.statusManifestacao === 'em_fila_analise_manual' && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Em fila de análise manual</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Confirme que esta dívida pertence à sua empresa antes de manifestar. Você tem {bill.diasParaManifestacao} dias para realizar a manifestação.
                </p>
              </div>
            </div>
          )}

          {status === 'pending' && allowOverrideAutoRejection && bill.statusManifestacao === 'recusa_automatica' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <Ban className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Duplicata recusada automaticamente</p>
                <p className="text-xs text-red-700 mt-0.5">
                  Você pode aceitar esta duplicata mesmo após a recusa automática, ou confirmar a recusa definitivamente.
                </p>
              </div>
            </div>
          )}

          {status === 'pending' && !AUTOMATIC_PROCESS_STATUSES.includes(bill.statusManifestacao) && bill.statusManifestacao !== 'em_fila_analise_manual' && !(allowOverrideAutoRejection && bill.statusManifestacao === 'recusa_automatica') && (
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-900">
                Confirme que esta dívida pertence à sua empresa antes de manifestar. Você tem {bill.diasParaManifestacao} dias para realizar a manifestação.
              </p>
            </div>
          )}

          {status === 'pending' && aceitarComRessalva && (
            <div ref={abatimentoRef} className="mt-6 pt-6 border-t border-gray-200">
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out max-h-[800px] opacity-100"
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

        {status === 'pending' && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-8 py-3 sm:py-4 rounded-b-lg shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className={`inline-flex items-center gap-3 select-none group ${isInAutoAnalysis ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={aceitarComRessalva}
                    disabled={isInAutoAnalysis}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAceitarComRessalva(checked);
                      if (!checked) {
                        setAbatimentoData(null);
                        setAbatimentoErrors({});
                      } else {
                        setTimeout(() => {
                          abatimentoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }
                    }}
                    className="w-[18px] h-[18px] rounded border-2 border-[#89919a] text-[#0854a0] focus:ring-[#0854a0] focus:ring-2 focus:ring-opacity-20 cursor-pointer transition-colors group-hover:border-[#0854a0] disabled:cursor-not-allowed"
                    id="checkbox-ressalva"
                    aria-describedby="ressalva-description"
                  />
                </div>
                <div>
                  <span className="text-sm text-[#32363a] font-semibold transition-colors">
                    Aceitar com ressalva de valor
                  </span>
                  <p id="ressalva-description" className="text-xs text-[#6a6d70] mt-0.5 hidden sm:block">
                    Registrar um abatimento antes de aceitar esta duplicata
                  </p>
                </div>
              </label>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleReject}
                  disabled={isInAutoAnalysis}
                  className={`h-10 flex-1 sm:flex-none px-4 sm:px-6 rounded-lg text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                    isInAutoAnalysis
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#EF4444] hover:bg-[#DC2626]'
                  }`}
                >
                  <XCircle size={16} />
                  Recusar
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isInAutoAnalysis}
                  className={`h-10 flex-1 sm:flex-none px-4 sm:px-6 rounded-lg text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                    isInAutoAnalysis
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#0854a0] hover:bg-[#0066E0]'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {aceitarComRessalva ? 'Aceitar com Ressalva' : 'Aceitar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showConfirmDialog}
        title={aceitarComRessalva ? 'Aceitar com Ressalva' : 'Aceitar Duplicata'}
        onConfirm={handleConfirmAccept}
        onCancel={() => setShowConfirmDialog(false)}
      >
        <div className="space-y-4">
          {aceitarComRessalva && abatimentoData ? (
            <div className="space-y-3">
              <p className="text-sm text-[#32363a]">
                Deseja aceitar esta duplicata com ressalva de valor?
              </p>
              <div className="bg-[#f5f6f7] border border-[#d9d9d9] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6a6d70]">Valor Original:</span>
                  <span className="font-semibold text-[#32363a]">{formatCurrency(bill.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6a6d70]">Abatimento:</span>
                  <span className="font-semibold text-[#b00]">- {formatCurrency(abatimentoData.valorAbatimento)}</span>
                </div>
                <div className="border-t border-[#d9d9d9] pt-2 flex justify-between">
                  <span className="font-semibold text-[#32363a]">Valor Final:</span>
                  <span className="font-bold text-[#107e3e]">{formatCurrency(bill.amount - abatimentoData.valorAbatimento)}</span>
                </div>
              </div>
              <p className="text-xs text-[#6a6d70]">
                Motivo: {abatimentoData.motivo}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#32363a]">Deseja realmente aceitar esta duplicata?</p>
          )}

          <label
            className={`flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              mercadoriaNaoRecebida
                ? 'bg-amber-50 border-amber-300'
                : 'bg-white border-[#d9d9d9] hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <PackageX
                className={`w-4 h-4 flex-shrink-0 ${
                  mercadoriaNaoRecebida ? 'text-amber-600' : 'text-[#6a6d70]'
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#32363a]">
                  Mercadoria não recebida
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={mercadoriaNaoRecebida}
              onClick={() => setMercadoriaNaoRecebida((v) => !v)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-400 ${
                mercadoriaNaoRecebida ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  mercadoriaNaoRecebida ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        </div>
      </Dialog>

      <RejectDialog
        isOpen={showRejectDialog}
        onConfirm={handleConfirmReject}
        onCancel={() => setShowRejectDialog(false)}
        billData={{
          sacado: `${bill.sacador.name} ${bill.sacador.cnpj}`,
          date: bill.issueDate,
          value: bill.amount,
          dueDate: bill.dueDate,
          invoiceNumber: bill.notaFiscal?.numero || '-',
          orderNumber: bill.id,
        }}
      />

      <Toast
        isOpen={showSuccessToast}
        title={successToastData.title}
        message={successToastData.message}
        onClose={() => setShowSuccessToast(false)}
      />

      {showAnnotationModal && (
        <CommercialAnnotationModal
          bill={bill}
          onClose={() => setShowAnnotationModal(false)}
          onSave={(data) => {
            console.log('Anotação comercial salva:', data);
            setShowAnnotationModal(false);
          }}
        />
      )}
    </>
  );
}
