import React from 'react';
import { FileText, RefreshCw, UserCheck, ShieldCheck, CheckCircle2, Database } from 'lucide-react';
import { AbatimentoStep } from '../types';

interface StepDef {
  key: AbatimentoStep;
  label: string;
  icon: React.ElementType;
}

const ALL_STEPS: StepDef[] = [
  { key: 'formalizacao', label: 'Formalizacao', icon: FileText },
  { key: 'sincronizacao_sap', label: 'Sincronizacao SAP', icon: RefreshCw },
  { key: 'aceite_fornecedor', label: 'Aceite Fornecedor', icon: UserCheck },
  { key: 'escrita_sap', label: 'Escrita SAP', icon: Database },
  { key: 'validacao_assinatura', label: 'Validacao Assinatura', icon: ShieldCheck },
];

const DIRECT_STEPS: StepDef[] = [
  { key: 'formalizacao', label: 'Formalizacao', icon: FileText },
  { key: 'sincronizacao_sap', label: 'Sincronizacao SAP', icon: RefreshCw },
  { key: 'escrita_sap', label: 'Escrita SAP', icon: Database },
  { key: 'validacao_assinatura', label: 'Validacao Assinatura', icon: ShieldCheck },
];

interface AbatimentoStepperProps {
  currentStep: AbatimentoStep;
  requiresSupplierApproval?: boolean;
  onStepClick?: (step: AbatimentoStep) => void;
}

export function AbatimentoStepper({ currentStep, requiresSupplierApproval = true, onStepClick }: AbatimentoStepperProps) {
  const steps = requiresSupplierApproval ? ALL_STEPS : DIRECT_STEPS;
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <button
              onClick={() => onStepClick?.(step.key)}
              disabled={!onStepClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
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
              <span className="hidden lg:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className={`w-6 h-0.5 rounded-full transition-colors duration-300 ${
                  idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
