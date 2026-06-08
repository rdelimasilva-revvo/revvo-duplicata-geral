import React from 'react';
import {
  CreditCard, X, CheckCircle2, AlertCircle, ShoppingCart, Send,
  RefreshCw, SplitSquareHorizontal, TrendingDown, Zap,
} from 'lucide-react';
import { useAbatimentoStore } from '../store';
import { CREDIT_TYPE_LABELS, CLASSIFICATION_CONFIG } from '../types';
import { formatCurrency } from '../../utils';

interface VinculacaoChecklistProps {
  onFinalize: () => void;
}

export function VinculacaoChecklist({ onFinalize }: VinculacaoChecklistProps) {
  const {
    getSelectedCredit, linkedInvoices, removeInvoiceFromCart, updateOffsetAmount,
    clearCart, getTotalLinked, getRemainingBalance, getResidualBalance,
    canFinalize, selectedCreditId, getClassification, getOperationType,
    hasPartialLiquidations, requiresSupplierApproval, setRequiresSupplierApproval,
  } = useAbatimentoStore();

  const credit = getSelectedCredit();
  const totalLinked = getTotalLinked();
  const remaining = getRemainingBalance();
  const residual = getResidualBalance();
  const isOverBudget = remaining < 0;
  const isValid = canFinalize();
  const classification = linkedInvoices.length > 0 ? getClassification() : null;
  const operationType = getOperationType();
  const hasPartials = hasPartialLiquidations();

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Credito Selecionado
        </h3>
        {credit ? (
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200/60">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-[#0070f2]" />
              <span className="text-xs font-mono font-bold text-[#0070f2]">{credit.code}</span>
              <RefreshCw className="w-3 h-3 text-[#0070f2]/40" />
            </div>
            <p className="text-[11px] text-gray-600 truncate mb-2">{credit.description}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  Disponivel <RefreshCw className="w-2.5 h-2.5 text-gray-300" />
                </p>
                <p className="text-base font-bold text-gray-900">{formatCurrency(credit.availableValue)}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                {CREDIT_TYPE_LABELS[credit.type]}
              </span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-[#0070f2]'}`}
                style={{ width: `${Math.min(100, (totalLinked / credit.availableValue) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
            <CreditCard className="w-5 h-5 text-gray-300 mx-auto mb-1" />
            <p className="text-[11px] text-gray-400">Selecione um credito</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            NFs Selecionadas ({linkedInvoices.length})
          </h3>
          {linkedInvoices.length > 0 && (
            <button onClick={clearCart} className="text-[10px] text-red-500 hover:text-red-700 font-medium transition-colors">
              Limpar
            </button>
          )}
        </div>

        {linkedInvoices.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingCart className="w-7 h-7 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              {selectedCreditId ? 'Clique no + nas notas fiscais para adicionar' : 'Selecione um credito e adicione notas fiscais'}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {linkedInvoices.map((item) => (
              <div
                key={item.invoiceId}
                className={`p-2.5 rounded-lg border bg-white hover:border-gray-300 transition-colors group ${
                  item.isPartialLiquidation ? 'border-amber-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-semibold text-gray-800">{item.nfNumber}</span>
                    {item.isPartialLiquidation && (
                      <span className="text-[8px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                        PARCIAL
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeInvoiceFromCart(item.invoiceId)}
                    className="p-0.5 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
                  <span>Saldo: {formatCurrency(item.openBalance)}</span>
                  <RefreshCw className="w-2.5 h-2.5 text-gray-300" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Valor a compensar</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                    <input
                      type="number"
                      value={item.offsetAmount || ''}
                      onChange={(e) => updateOffsetAmount(item.invoiceId, parseFloat(e.target.value) || 0)}
                      max={item.openBalance}
                      min={0}
                      step={0.01}
                      className={`w-full pl-7 pr-2 py-1 text-xs font-medium border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                        item.offsetAmount > item.openBalance
                          ? 'border-red-300 focus:ring-red-300 text-red-700 bg-red-50'
                          : 'border-gray-200 focus:ring-[#0070f2]/30 focus:border-[#0070f2] text-gray-800'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-gray-50/80">
        <div className="p-3 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                Valor do Credito <RefreshCw className="w-2.5 h-2.5 text-gray-300" />
              </span>
              <span className="font-medium text-gray-700">{credit ? formatCurrency(credit.availableValue) : '-'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                Total Abatido <RefreshCw className="w-2.5 h-2.5 text-gray-300" />
              </span>
              <span className="font-medium text-gray-700">{formatCurrency(totalLinked)}</span>
            </div>
            <div className="border-t border-gray-200 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700">Diferenca / Residual</span>
                <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : remaining > 0 ? 'text-[#0070f2]' : 'text-emerald-600'}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
            {remaining > 0 && linkedInvoices.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-[#0070f2]">
                <TrendingDown className="w-3 h-3" />
                <span>Credito residual de {formatCurrency(residual)} para uso futuro</span>
              </div>
            )}
            <div className="flex justify-between text-xs pt-1 border-t border-dashed border-gray-200">
              <span className="text-gray-500">Tipo de Operacao</span>
              <span className="font-medium text-gray-700">{operationType}</span>
            </div>
            {classification && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Classificacao</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${CLASSIFICATION_CONFIG[classification].color} ${CLASSIFICATION_CONFIG[classification].bg}`}>
                  {CLASSIFICATION_CONFIG[classification].label}
                </span>
              </div>
            )}
          </div>

          {isOverBudget && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <p className="text-[10px] text-red-600 font-medium">O valor das NFs excede o credito disponivel</p>
            </div>
          )}

          {hasPartials && !isOverBudget && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
              <SplitSquareHorizontal className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-[10px] text-amber-600 font-medium">NFs com baixa parcial identificadas</p>
            </div>
          )}

          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-[10px] text-gray-500">Necessita aprovacao do fornecedor?</span>
            <button
              onClick={() => setRequiresSupplierApproval(!requiresSupplierApproval)}
              className={`relative w-8 h-4.5 rounded-full transition-colors ${
                requiresSupplierApproval ? 'bg-[#0070f2]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  requiresSupplierApproval ? 'translate-x-[14px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <button
            onClick={onFinalize}
            disabled={!isValid}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isValid
                ? 'bg-[#0070f2] text-white hover:bg-[#005bc4] shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {requiresSupplierApproval ? (
              <>
                <Send className="w-4 h-4" />
                Enviar para Aceite
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Confirmar Direto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
