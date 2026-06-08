import React from 'react';
import { AgreementStatus, STATUS_CONFIG } from '../types';

interface StatusBadgeProps {
  status: AgreementStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.color} ${config.border} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
