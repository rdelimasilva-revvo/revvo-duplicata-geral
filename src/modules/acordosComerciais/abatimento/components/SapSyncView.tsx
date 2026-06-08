import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, Loader2, RefreshCw, Database, ArrowRight,
  FileText, CreditCard, ShieldCheck,
} from 'lucide-react';
import { useAbatimentoStore } from '../store';
import { formatCurrency } from '../../utils';

const READ_STEPS = [
  { label: 'BAPI_FI_DOCUMENT_READ — Validar credito no SAP', bapi: 'BAPI_FI_DOCUMENT_READ', duration: 1200 },
  { label: 'ZREVVO_AP_ACC_GETOPENITEMS — Conferir itens em aberto', bapi: 'ZREVVO_AP_ACC_GETOPENITEMS', duration: 1000 },
  { label: 'Validar regras de compensacao e limites', bapi: null, duration: 1400 },
  { label: 'Sincronizar saldos SAP/Sankhya', bapi: null, duration: 1100 },
  { label: 'Gerar protocolo de pre-abatimento', bapi: null, duration: 800 },
];

const WRITE_STEPS = [
  { label: 'ZREVVO_BAPI_PAYMENT_UPDATE — Atualizar valor de pagamento', bapi: 'ZREVVO_BAPI_PAYMENT_UPDATE', duration: 1500 },
  { label: 'Registrar compensacao no ledger', bapi: null, duration: 1000 },
  { label: 'Atualizar saldos de NFs e creditos', bapi: null, duration: 1200 },
  { label: 'Gerar documento contabil (FI)', bapi: null, duration: 900 },
  { label: 'Confirmar gravacao — COMMIT WORK', bapi: null, duration: 600 },
];

interface SapSyncViewProps {
  mode?: 'read' | 'write';
}

export function SapSyncView({ mode = 'read' }: SapSyncViewProps) {
  const {
    setCurrentStep, setSapSyncComplete, requiresSupplierApproval,
    getSelectedCredit, linkedInvoices, getTotalLinked, getRemainingBalance,
    setSettlementOutcome,
  } = useAbatimentoStore();

  const steps = mode === 'write' ? WRITE_STEPS : READ_STEPS;
  const [currentSapStep, setCurrentSapStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const credit = getSelectedCredit();
  const totalLinked = getTotalLinked();
  const remaining = getRemainingBalance();

  useEffect(() => {
    if (currentSapStep >= steps.length) {
      setIsComplete(true);
      if (mode === 'read') {
        setSapSyncComplete(true);
      } else {
        setSettlementOutcome(remaining === 0 ? 'liquidada' : 'paga_parcialmente');
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentSapStep((prev) => prev + 1);
    }, steps[currentSapStep].duration);

    return () => clearTimeout(timer);
  }, [currentSapStep, steps, mode, setSapSyncComplete, setSettlementOutcome, remaining]);

  const progress = (currentSapStep / steps.length) * 100;

  const handleProceed = () => {
    if (mode === 'write') {
      setCurrentStep('validacao_assinatura');
    } else if (requiresSupplierApproval) {
      setCurrentStep('aceite_fornecedor');
    } else {
      setCurrentStep('escrita_sap');
    }
  };

  const nextLabel = mode === 'write'
    ? 'Prosseguir para Assinatura'
    : requiresSupplierApproval
      ? 'Prosseguir para Aceite do Fornecedor'
      : 'Prosseguir para Escrita SAP';

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          {isComplete ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-[#0070f2] animate-spin" />
            </div>
          )}
          <h2 className="text-lg font-bold text-gray-900">
            {isComplete
              ? mode === 'write' ? 'Gravacao SAP Concluida' : 'Sincronizacao Concluida'
              : mode === 'write' ? 'Gravando no SAP' : 'Sincronizando com SAP/Sankhya'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isComplete
              ? mode === 'write'
                ? 'A compensacao foi registrada com sucesso no SAP'
                : 'Todos os dados foram validados com sucesso'
              : mode === 'write'
                ? 'Registrando a compensacao no sistema de gestao'
                : 'Validando dados do abatimento no sistema de gestao'}
          </p>
          {mode === 'write' && !isComplete && (
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#0070f2] font-mono bg-blue-50 px-2 py-0.5 rounded">
              <Database className="w-3 h-3" /> ZREVVO_BAPI_PAYMENT_UPDATE
            </span>
          )}
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-[#0070f2]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const done = idx < currentSapStep;
            const running = idx === currentSapStep && !isComplete;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                  done
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : running
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-100 bg-gray-50/30'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : running ? (
                  <Loader2 className="w-4 h-4 text-[#0070f2] animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm ${
                      done ? 'text-emerald-700 font-medium' : running ? 'text-[#0070f2] font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.bapi && running && (
                    <span className="block text-[9px] font-mono text-[#0070f2]/60 mt-0.5">
                      Executando {step.bapi}...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isComplete && credit && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {mode === 'write' ? 'Resultado da Gravacao' : 'Resumo da Validacao'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Credito
              </span>
              <span className="font-mono font-bold text-[#0070f2]">{credit.code}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <FileText className="w-3 h-3" /> NFs vinculadas
              </span>
              <span className="font-medium text-gray-700">{linkedInvoices.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total compensado</span>
              <span className="font-medium text-gray-700">{formatCurrency(totalLinked)}</span>
            </div>
            {mode === 'write' && (
              <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                <span className="text-gray-500">Resultado</span>
                <span className={`font-semibold ${remaining === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {remaining === 0 ? 'Liquidada' : 'Paga Parcialmente'}
                </span>
              </div>
            )}
          </div>
        )}

        {isComplete && (
          <div className="mt-6 text-center">
            <button
              onClick={handleProceed}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0070f2] text-white text-sm font-semibold rounded-lg hover:bg-[#005bc4] transition-colors shadow-sm"
            >
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
