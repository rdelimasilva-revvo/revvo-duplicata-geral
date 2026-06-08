import React, { useState, useCallback } from 'react';
import { X, CheckCircle2, CreditCard, Link2, Send } from 'lucide-react';
import { Credit, Invoice } from '../../abatimento/types';
import { CreditsDashboard } from './CreditsDashboard';
import { LinkageView } from './LinkageView';
import { ConfirmationView } from './ConfirmationView';

type GestorStep = 'credits' | 'linkage' | 'confirmation';

interface LinkedItem {
  invoiceId: string;
  creditId: string;
  nfNumber: string;
  openBalance: number;
  offsetAmount: number;
}

const STEP_CONFIG: { key: GestorStep; label: string; icon: React.ElementType }[] = [
  { key: 'credits', label: 'Selecao de Creditos', icon: CreditCard },
  { key: 'linkage', label: 'Vinculacao', icon: Link2 },
  { key: 'confirmation', label: 'Confirmacao', icon: Send },
];

interface GestorEscrituralProps {
  onBack: () => void;
}

export function GestorEscritural({ onBack }: GestorEscrituralProps) {
  const [currentStep, setCurrentStep] = useState<GestorStep>('credits');
  const [selectedCredits, setSelectedCredits] = useState<Credit[]>([]);
  const [linkedItems, setLinkedItems] = useState<LinkedItem[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(true);

  const currentIdx = STEP_CONFIG.findIndex((s) => s.key === currentStep);

  const toggleCredit = useCallback((credit: Credit) => {
    setSelectedCredits((prev) => {
      const exists = prev.find((c) => c.id === credit.id);
      if (exists) {
        setLinkedItems((items) => items.filter((l) => l.creditId !== credit.id));
        return prev.filter((c) => c.id !== credit.id);
      }
      return [...prev, credit];
    });
  }, []);

  const linkInvoice = useCallback((invoice: Invoice, credit: Credit) => {
    setLinkedItems((prev) => {
      if (prev.find((l) => l.invoiceId === invoice.id)) return prev;
      const usedForCredit = prev
        .filter((l) => l.creditId === credit.id)
        .reduce((sum, l) => sum + l.offsetAmount, 0);
      const remaining = credit.availableValue - usedForCredit;
      if (remaining <= 0) return prev;
      const offsetAmount = Math.min(invoice.openBalance, remaining);
      return [
        ...prev,
        {
          invoiceId: invoice.id,
          creditId: credit.id,
          nfNumber: invoice.nfNumber,
          openBalance: invoice.openBalance,
          offsetAmount,
        },
      ];
    });
  }, []);

  const unlinkInvoice = useCallback((invoiceId: string) => {
    setLinkedItems((prev) => prev.filter((l) => l.invoiceId !== invoiceId));
  }, []);

  const handleReset = () => {
    setCurrentStep('credits');
    setSelectedCredits([]);
    setLinkedItems([]);
    setRequiresApproval(true);
    onBack();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-108px)]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label="Fechar">
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Gestor Escritural</h1>
            <p className="text-[11px] text-gray-400">Fluxo de vinculacao de creditos</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {STEP_CONFIG.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-[#0070f2] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {idx < STEP_CONFIG.length - 1 && (
                  <div className={`w-5 h-0.5 rounded-full ${idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {currentStep === 'credits' ? (
          <div className="h-full overflow-y-auto p-5">
            <CreditsDashboard
              selectedCredits={selectedCredits}
              onToggleCredit={toggleCredit}
              onAdvance={() => setCurrentStep('linkage')}
            />
          </div>
        ) : currentStep === 'linkage' ? (
          <LinkageView
            selectedCredits={selectedCredits}
            linkedItems={linkedItems}
            onLinkInvoice={linkInvoice}
            onUnlinkInvoice={unlinkInvoice}
            requiresApproval={requiresApproval}
            onToggleApproval={() => setRequiresApproval((v) => !v)}
            onAdvance={() => setCurrentStep('confirmation')}
            onBack={() => setCurrentStep('credits')}
          />
        ) : (
          <ConfirmationView
            selectedCredits={selectedCredits}
            linkedItems={linkedItems}
            requiresApproval={requiresApproval}
            onBack={() => setCurrentStep('linkage')}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
