/**
 * Adapter legado — delega ao Badge canônico de components/ui/Badge.
 * Use o Badge canônico diretamente em código novo.
 */
import React from 'react';
import { Badge as UIBadge } from '../../ui/Badge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => (
  <UIBadge variant={variant} size="sm">
    {children}
  </UIBadge>
);
