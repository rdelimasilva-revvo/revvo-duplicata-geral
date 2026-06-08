import React from 'react';
import { Warning } from '@phosphor-icons/react';

interface AlertBannerProps {
  message: string;
  variant?: 'warning' | 'danger' | 'info';
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ message, variant = 'warning' }) => {
  const variants = {
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    danger: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800'
  };

  const iconColors = {
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 ${variants[variant]} mb-6`}>
      <Warning size={20} weight="fill" className={iconColors[variant]} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
