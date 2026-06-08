import React, { useState } from 'react';
import {
  CheckCircle2, CreditCard, FileText, Building2, Loader2, Send,
  ArrowLeft, UserCheck, UserX,
} from 'lucide-react';
import { Credit, CREDIT_TYPE_LABELS } from '../../abatimento/types';
import { formatCurrency } from '../../utils';
import { useToast } from '@/context/ToastContext';

interface LinkedItem {
  invoiceId: string;
  creditId: string;
  nfNumber: string;
  openBalance: number;
  offsetAmount: number;
}

interface ConfirmationViewProps {
  selectedCredits: Credit[];
  linkedItems: LinkedItem[];
  requiresApproval: boolean;
  onBack: () => void;
  onReset: () => void;
}

export function ConfirmationView({
  selectedCredits, linkedItems, requiresApproval, onBack, onReset,
}: ConfirmationViewProps) {
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const totalCredits = selectedCredits.reduce((sum, c) => sum + c.availableValue, 0);
  const totalLinked = linkedItems.reduce((sum, l) => sum + l.offsetAmount, 0);
  const difference = totalCredits - totalLinked;

  const getItemsForCredit = (creditId: string) => linkedItems.filter((l) => l.creditId === creditId);
  const getCreditTotal = (creditId: string) =>
    getItemsForCredit(creditId).reduce((sum, l) => sum + l.offsetAmount, 0);

  const handleSubmit = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      showToast('success', 'Proposta enviada com sucesso', requiresApproval
        ? 'A proposta foi enviada para o Portal do Fornecedor'
        : 'O abatimento sera processado diretamente');
    }, 2000);
  };

  if (isSent) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Proposta Enviada</h2>
          <p className="text-sm text-gray-500 mb-6">
            {requiresApproval
              ? 'A proposta foi enviada para o Portal do Fornecedor. Voce sera notificado quando houver uma resposta.'
              : 'O abatimento sera processado diretamente pelo sistema. Acompanhe o status na lista de acordos.'}
          </p>

          <div className="bg-white border border-gray-200 rounded-md p-4 text-left space-y-3 mb-6 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resumo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Creditos vinculados</span>
              <span className="font-semibold text-gray-800">{selectedCredits.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Faturas vinculadas</span>
              <span className="font-semibold text-gray-800">{linkedItems.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total compensado</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalLinked)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-500">Aprovacao do fornecedor</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                requiresApproval ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
              }`}>
                {requiresApproval ? 'Pendente' : 'Nao necessaria'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onReset}
              className="px-5 py-2.5 bg-[#0070f2] text-white text-sm font-semibold rounded-md hover:bg-[#005bc4] transition-colors shadow-sm"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Send className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Confirmacao e Envio</h2>
            <p className="text-xs text-gray-500">Revise os dados antes de enviar a proposta</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Creditos</p>
            <p className="text-lg font-bold text-[#0070f2] mt-1">{formatCurrency(totalCredits)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Vinculado</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalLinked)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Diferenca</p>
            <p className={`text-lg font-bold mt-1 ${difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatCurrency(difference)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0070f2]" />
            <span className="text-sm font-semibold text-gray-800">Vinculacoes por Credito</span>
          </div>

          <div className="divide-y divide-gray-100">
            {selectedCredits.map((credit) => {
              const items = getItemsForCredit(credit.id);
              const creditTotal = getCreditTotal(credit.id);

              return (
                <div key={credit.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#0070f2]">{credit.code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {CREDIT_TYPE_LABELS[credit.type]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Vinculado: </span>
                      <span className="text-xs font-bold text-gray-700">{formatCurrency(creditTotal)}</span>
                      <span className="text-xs text-gray-400"> / {formatCurrency(credit.availableValue)}</span>
                    </div>
                  </div>

                  {items.length > 0 ? (
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div key={item.invoiceId} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-mono text-gray-700">{item.nfNumber}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-800">{formatCurrency(item.offsetAmount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic px-3">Nenhuma fatura vinculada</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
          <div className="flex items-center gap-3">
            {requiresApproval ? (
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-amber-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <UserX className="w-4 h-4 text-emerald-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {requiresApproval
                  ? 'Aprovacao do fornecedor necessaria'
                  : 'Processamento direto'}
              </p>
              <p className="text-xs text-gray-500">
                {requiresApproval
                  ? 'A proposta sera enviada ao Portal do Fornecedor para aceite'
                  : 'O abatimento sera registrado diretamente no sistema'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0070f2] text-white text-sm font-semibold rounded-md hover:bg-[#005bc4] disabled:opacity-60 transition-colors shadow-sm"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Proposta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
