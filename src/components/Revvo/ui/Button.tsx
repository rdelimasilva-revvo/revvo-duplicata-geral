/**
 * Adapter legado — delega ao Button canônico de components/ui/Button.
 * Use o Button canônico diretamente em código novo.
 */
import React from 'react';
import { Button as UIButton } from '../../ui/Button';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => (
  <UIButton variant={variant} size="lg" {...props}>
    {children}
  </UIButton>
);
