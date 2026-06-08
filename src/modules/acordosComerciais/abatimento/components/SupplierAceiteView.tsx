import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, CreditCard, Building2, Clock, CreditCard as Edit3, RefreshCw, AlertTriangle, ArrowRight, SplitSquareHorizontal } from 'lucide-react';
import { useAbatimentoStore } from '../store';
import { CREDIT_TYPE_LABELS, SupplierAdjustment } from '../types';
import { formatCurrency } from '../../utils';
import { useToast } from '@/context/ToastContext';

type Decision = 'aceite' | 'recusa' | 'ajuste' | null;

export function SupplierAceiteView() {
  const {
    getSelectedCredit, linkedInvoices, getTotalLinked, getRemainingBalance,
    setCurrentStep, applySupplierAdjustments, supplierAdjustedCart, reprocessing,
    setReprocessing, hasPartialLiquidations,
  } = useAbatimentoStore();
  const { showToast } = useToast();
  const credit = getSelectedCredit();
  const totalLinked = getTotalLinked();
  const remaining = getRemainingBalance();
  const hasPartials = hasPartialLiquidations();

  const [decision, setDecision] = useState<Decision>(null);
  const [recusaMotivo, setRecusaMotivo] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, { amount: number; reason: string }>>({});
  const [isAdjusting, setIsAdjusting] = useState(false);

  if (!credit) return null;

  const handleAceite = () => {
    setDecision('aceite');
    showToast('success', 'Aceite registrado', 'O fornecedor aceitou o abatimento');
    setTimeout(() => setCurrentStep('escrita_sap'), 1500);
  };

  const handleRecusa = () => {
    if (!recusaMotivo.trim()) return;
    setDecision('recusa');
    showToast('info', 'Recusa registrada', 'O motivo foi enviado ao gestor');
  };

  const handleStartAdjust = () => {
    setIsAdjusting(true);
    const initial: Record<string, { amount: number; reason: string }> = {};
    linkedInvoices.forEach((item) => {
      initial[item.invoiceId] = { amount: item.offsetAmount, reason: '' };
    });
    setAdjustments(initial);
  };

  const handleSubmitAdjustments = () => {
    const adjList: SupplierAdjustment[] = linkedInvoices
      .filter((item) => {
        const adj = adjustments[item.invoiceId];
        return adj && adj.amount !== item.offsetAmount;
      })
      .map((item) => ({
        invoiceId: item.invoiceId,
        suggestedAmount: adjustments[item.invoiceId].amount,
        reason: adjustments[item.invoiceId].reason || 'Ajuste solicitado pelo fornecedor',
      }));

    if (adjList.length === 0) {
      showToast('info', 'Nenhum ajuste realizado', 'Os valores permanecem inalterados');
      setIsAdjusting(false);
      return;
    }

    applySupplierAdjustments(adjList);
    setDecision('ajuste');
    setReprocessing(true);
    showToast('info', 'Ajustes enviados', 'O acordo sera reprocessado pelo gestor');
  };

  if (decision === 'aceite') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-emerald-800 mb-1">Aceite Confirmado</h2>
          <p className="text-sm text-gray-500 mb-6">
            O abatimento foi aceito. Prosseguindo para escrita SAP...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#0070f2]">
            <Clock className="w-4 h-4 animate-pulse" />
            Redirecionando...
          </div>
        </div>
      </div>
    );
  }

  if (decision === 'recusa') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-red-800 mb-1">Abatimento Recusado</h2>
          <p className="text-sm text-gray-500 mb-2">O motivo foi enviado ao gestor interno.</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
            <p className="text-xs font-semibold text-red-700 mb-1">Motivo:</p>
            <p className="text-sm text-red-600">{recusaMotivo}</p>
          </div>
        </div>
      </div>
    );
  }

  if (decision === 'ajuste') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-amber-800 mb-1">Reprocessar Acordo</h2>
          <p className="text-sm text-gray-500 mb-4">
            O fornecedor ajustou o vinculo. O acordo sera reprocessado pelo gestor interno.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2 mb-4">
            <p className="text-xs font-semibold text-amber-700">Ajustes solicitados:</p>
            {linkedInvoices.map((item) => {
              const adj = adjustments[item.invoiceId];
              if (!adj || adj.amount === item.offsetAmount) return null;
              return (
                <div key={item.invoiceId} className="flex justify-between text-xs">
                  <span className="font-mono text-gray-600">{item.nfNumber}</span>
                  <div className="text-right">
                    <span className="text-gray-400 line-through mr-2">{formatCurrency(item.offsetAmount)}</span>
                    <span className="font-semibold text-amber-700">{formatCurrency(adj.amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              setReprocessing(false);
              setCurrentStep('formalizacao');
            }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Voltar para Formalizacao
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-200" />
          <div>
            <h2 className="text-base font-bold">Portal do Fornecedor</h2>
            <p className="text-teal-100 text-xs">Simulacao de visualizacao do fornecedor</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-5">
        {supplierAdjustedCart && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Este acordo ja foi ajustado anteriormente. Revise os valores atualizados.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            Resumo do Abatimento
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400 uppercase">Credito</p>
              <p className="text-sm font-mono font-bold text-[#0070f2]">{credit.code}</p>
              <p className="text-xs text-gray-500 mt-0.5">{CREDIT_TYPE_LABELS[credit.type]}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400 uppercase">Valor do Credito</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(credit.availableValue)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400 uppercase">Total a Compensar</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(totalLinked)}</p>
            </div>
          </div>
          {remaining > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#0070f2] bg-blue-50 px-3 py-1.5 rounded-lg">
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              Credito residual de {formatCurrency(remaining)} permanecera disponivel
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              NFs Vinculadas ({linkedInvoices.length})
              {hasPartials && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                  BAIXA PARCIAL
                </span>
              )}
            </h3>
            {!isAdjusting && (
              <button
                onClick={handleStartAdjust}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Ajustar Vinculo
              </button>
            )}
          </div>

          <div className="space-y-2">
            {linkedInvoices.map((item) => (
              <div
                key={item.invoiceId}
                className={`p-3 rounded-lg border transition-colors ${
                  item.isPartialLiquidation ? 'bg-amber-50/30 border-amber-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-mono font-medium text-gray-800">{item.nfNumber}</p>
                      {item.isPartialLiquidation && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                          PARCIAL
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Saldo aberto: {formatCurrency(item.openBalance)}
                    </p>
                  </div>
                  {isAdjusting ? (
                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                        <input
                          type="number"
                          value={adjustments[item.invoiceId]?.amount ?? item.offsetAmount}
                          onChange={(e) =>
                            setAdjustments((prev) => ({
                              ...prev,
                              [item.invoiceId]: {
                                ...prev[item.invoiceId],
                                amount: Math.min(parseFloat(e.target.value) || 0, item.openBalance),
                              },
                            }))
                          }
                          max={item.openBalance}
                          min={0}
                          step={0.01}
                          className="w-full pl-7 pr-2 py-1 text-xs font-medium border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-400 text-gray-800 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(item.offsetAmount)}</span>
                  )}
                </div>
                {isAdjusting && (
                  <input
                    type="text"
                    placeholder="Motivo do ajuste (opcional)"
                    value={adjustments[item.invoiceId]?.reason ?? ''}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        [item.invoiceId]: { ...prev[item.invoiceId], reason: e.target.value },
                      }))
                    }
                    className="w-full mt-2 px-2 py-1 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-300 text-gray-600"
                  />
                )}
              </div>
            ))}
          </div>

          {isAdjusting && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsAdjusting(false)}
                className="flex-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitAdjustments}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Enviar Ajustes
              </button>
            </div>
          )}
        </div>

        {!isAdjusting && (
          <div className="bg-white border-2 border-teal-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Sua Decisao</h3>
            <p className="text-sm text-gray-500 mb-5">
              Analise os termos do abatimento e selecione sua decisao
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                Dar Aceite
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-red-600 text-sm font-semibold rounded-xl border-2 border-red-200 hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Dar Recusa
              </button>
            </div>

            {showConfirmModal === false && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={recusaMotivo}
                  onChange={(e) => setRecusaMotivo(e.target.value)}
                  placeholder="Informe o motivo da recusa (obrigatorio)..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none"
                />
                <button
                  onClick={handleRecusa}
                  disabled={!recusaMotivo.trim()}
                  className="w-full py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar Recusa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showConfirmModal === true && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirmar Aceite</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ao confirmar, voce aceita o abatimento de{' '}
                <strong>{formatCurrency(totalLinked)}</strong> sobre o credito{' '}
                <strong>{credit.code}</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null as unknown as boolean)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAceite}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Confirmar Aceite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
