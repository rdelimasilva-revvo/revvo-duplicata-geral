import React, { useEffect, useState, useCallback } from 'react';
import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import { SapValidationStep } from '../types';

interface SapSyncAnimationProps {
  steps: SapValidationStep[];
  onComplete: () => void;
  isSimulating?: boolean;
}

export function SapSyncAnimation({ steps: initialSteps, onComplete, isSimulating = false }: SapSyncAnimationProps) {
  const [steps, setSteps] = useState<SapValidationStep[]>(initialSteps);
  const [progress, setProgress] = useState(0);

  const runSimulation = useCallback(() => {
    if (!isSimulating) return;

    let currentStepIndex = 0;
    const totalSteps = initialSteps.length;

    const interval = setInterval(() => {
      if (currentStepIndex < totalSteps) {
        setSteps((prev) =>
          prev.map((s, i) => {
            if (i < currentStepIndex) return { ...s, status: 'completed' };
            if (i === currentStepIndex) return { ...s, status: 'running' };
            return s;
          })
        );
        setProgress(((currentStepIndex + 0.5) / totalSteps) * 100);
        currentStepIndex++;
      } else {
        setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
        setProgress(100);
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, initialSteps, onComplete]);

  useEffect(() => {
    const cleanup = runSimulation();
    return cleanup;
  }, [runSimulation]);

  useEffect(() => {
    if (!isSimulating) {
      const completed = steps.filter((s) => s.status === 'completed').length;
      setProgress((completed / steps.length) * 100);
    }
  }, [steps, isSimulating]);

  const statusIcon = (status: SapValidationStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-[#0070f2] animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso da Sincronização</span>
          <span className="text-sm font-semibold text-[#0070f2]">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#0070f2] to-blue-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
              step.status === 'running'
                ? 'bg-blue-50/50 border-blue-200'
                : step.status === 'completed'
                ? 'bg-emerald-50/50 border-emerald-200'
                : step.status === 'error'
                ? 'bg-red-50/50 border-red-200'
                : 'bg-gray-50/50 border-gray-100'
            }`}
          >
            <div className="mt-0.5">{statusIcon(step.status)}</div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.status === 'completed'
                    ? 'text-emerald-700'
                    : step.status === 'running'
                    ? 'text-[#0070f2]'
                    : step.status === 'error'
                    ? 'text-red-700'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              {step.description && (
                <p
                  className={`text-xs mt-0.5 ${
                    step.status === 'error' ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
