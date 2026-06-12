import React from 'react';
import { Check } from 'lucide-react';
import {
  StepperList,
  StepItem,
  StepNumberBubble,
  StepText,
  ProgressTrack,
  ProgressFill,
} from '../styles';
import { WIZARD_STEPS, WizardStepId } from '../types';

interface StepperProps {
  currentIndex: number;
  onJumpTo: (id: WizardStepId) => void;
}

export function Stepper({ currentIndex, onJumpTo }: StepperProps) {
  const percent = ((currentIndex + 1) / WIZARD_STEPS.length) * 100;

  return (
    <>
      <ProgressTrack>
        <ProgressFill $percent={percent} />
      </ProgressTrack>
      <StepperList>
        {WIZARD_STEPS.map((step) => {
          const state =
            step.index < currentIndex
              ? 'completed'
              : step.index === currentIndex
                ? 'active'
                : 'upcoming';
          const clickable = step.index < currentIndex;
          return (
            <StepItem
              key={step.id}
              $state={state}
              $clickable={clickable}
              onClick={clickable ? () => onJumpTo(step.id) : undefined}
              role={clickable ? 'button' : undefined}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <StepNumberBubble $state={state}>
                {state === 'completed' ? <Check size={14} /> : step.index + 1}
              </StepNumberBubble>
              <StepText>
                <span>{step.title}</span>
                <span>{step.description}</span>
              </StepText>
            </StepItem>
          );
        })}
      </StepperList>
    </>
  );
}
