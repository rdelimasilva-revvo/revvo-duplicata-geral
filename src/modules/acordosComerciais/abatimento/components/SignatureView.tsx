import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, Fingerprint, Award, Download,
  FileText, CreditCard, TrendingDown, SplitSquareHorizontal,
} from 'lucide-react';
import { useAbatimentoStore } from '../store';
import { CREDIT_TYPE_LABELS, OUTCOME_CONFIG } from '../types';
import { formatCurrency } from '../../utils';
import { useToast } from '@/context/ToastContext';

export function SignatureView() {
  const {
    getSelectedCredit, linkedInvoices, getTotalLinked, getRemainingBalance,
    settlementOutcome, getClassification, hasPartialLiquidations,
  } = useAbatimentoStore();
  const { showToast } = useToast();
  const credit = getSelectedCredit();
  const totalLinked = getTotalLinked();
  const remaining = getRemainingBalance();
  const classification = linkedInvoices.length > 0 ? getClassification() : null;
  const hasPartials = hasPartialLiquidations();
  const outcome = settlementOutcome || (remaining === 0 ? 'liquidada' : 'paga_parcialmente');
  const outcomeConfig = OUTCOME_CONFIG[outcome];

  const [signatures, setSignatures] = useState([
    { id: 's1', name: 'Carlos Mendes', role: 'Diretor Financeiro', status: 'pending' as const },
    { id: 's2', name: 'Ana Paula Costa', role: 'Gerente de Contratos', status: 'pending' as const },
  ]);
  const [isFinalized, setIsFinalized] = useState(false);

  const handleValidate = (sigId: string) => {
    setSignatures((prev) =>
      prev.map((s) =>
        s.id === sigId ? { ...s, status: 'valid' as const } : s
      )
    );
    showToast('success', 'Assinatura validada');
  };

  const allSigned = signatures.every((s) => s.status === 'valid');

  const handleFinalize = () => {
    setIsFinalized(true);
    const outcomeLabel = outcome === 'liquidada' ? 'Liquidada' : 'Paga Parcialmente';
    showToast('success', `Abatimento finalizado — ${outcomeLabel}`, 'O protocolo foi gerado com sucesso');
  };

  if (!credit) return null;

  if (isFinalized) {
    const isLiquidada = outcome === 'liquidada';

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg text-center">
          <div className={`border-2 rounded-2xl p-8 mb-6 ${
            isLiquidada
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isLiquidada ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              {isLiquidada ? (
                <Award className="w-8 h-8 text-emerald-600" />
              ) : (
                <SplitSquareHorizontal className="w-8 h-8 text-amber-600" />
              )}
            </div>
            <h2 className={`text-xl font-bold mb-1 ${isLiquidada ? 'text-emerald-900' : 'text-amber-900'}`}>
              {isLiquidada ? 'Abatimento Liquidado' : 'Abatimento — Paga Parcialmente'}
            </h2>
            <p className={`text-sm mb-1 ${isLiquidada ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isLiquidada
                ? 'O credito foi integralmente compensado contra as NFs selecionadas'
                : 'O credito foi parcialmente utilizado. O saldo residual permanece disponivel'}
            </p>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold mt-3 ${outcomeConfig.color} ${outcomeConfig.bg} ${outcomeConfig.border} border`}>
              {isLiquidada ? <CheckCircle2 className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {outcomeConfig.label}
            </span>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-mono font-bold text-gray-800">
                PROT-ABT-{Date.now().toString().slice(-8)}
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Credito</span>
              <span className="font-mono font-bold text-[#0070f2]">{credit.code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tipo</span>
              <span className="text-gray-700">{CREDIT_TYPE_LABELS[credit.type]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">NFs compensadas</span>
              <span className="font-bold text-gray-900">{linkedInvoices.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total compensado</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalLinked)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
              <span className="text-gray-500">Saldo restante do credito</span>
              <span className={`font-bold ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatCurrency(remaining)}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#0070f2] bg-blue-50 px-3 py-1.5 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
                O credito residual de {formatCurrency(remaining)} esta disponivel para uso futuro
              </div>
            )}
            {hasPartials && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                <SplitSquareHorizontal className="w-3.5 h-3.5" />
                NFs com baixa parcial foram registradas
              </div>
            )}
          </div>

          <button className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 bg-[#0070f2] text-white text-sm font-semibold rounded-lg hover:bg-[#005bc4] transition-colors">
            <Download className="w-4 h-4" />
            Download Protocolo PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <ShieldCheck className="w-10 h-10 text-[#0070f2] mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-900">Validacao de Assinaturas</h2>
          <p className="text-sm text-gray-500">Confirme as assinaturas digitais para finalizar o abatimento</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Resumo
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">Credito</p>
              <p className="text-sm font-mono font-bold text-[#0070f2]">{credit.code}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">Total Compensado</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(totalLinked)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">NFs</p>
              <p className="text-sm font-bold text-gray-900">{linkedInvoices.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400">Resultado</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${outcomeConfig.color} ${outcomeConfig.bg}`}>
                {outcomeConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {signatures.map((sig) => (
            <div
              key={sig.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                sig.status === 'valid'
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      sig.status === 'valid' ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}
                  >
                    {sig.status === 'valid' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Fingerprint className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{sig.name}</p>
                    <p className="text-xs text-gray-500">{sig.role}</p>
                  </div>
                </div>
                {sig.status === 'valid' ? (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    Validado
                  </span>
                ) : (
                  <button
                    onClick={() => handleValidate(sig.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0070f2] rounded-lg hover:bg-[#005bc4] transition-colors"
                  >
                    Validar Assinatura
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {allSigned && (
          <div className="text-center pt-4">
            <button
              onClick={handleFinalize}
              className="px-8 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Finalizar Abatimento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
