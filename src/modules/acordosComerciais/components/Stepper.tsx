import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                    : isCurrent
                    ? 'bg-[#0070f2] text-white shadow-md shadow-blue-200 ring-4 ring-blue-100'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-sm font-medium leading-tight ${
                    isCompleted ? 'text-emerald-700' : isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className={`text-xs mt-0.5 ${isCurrent ? 'text-gray-500' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {!isLast && (
              <div className="flex-1 mx-4">
                <div className="h-[2px] rounded-full bg-gray-200 relative overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500 w-full' : 'bg-gray-200 w-0'
                    }`}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
