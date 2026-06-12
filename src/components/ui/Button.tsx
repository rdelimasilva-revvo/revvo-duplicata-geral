import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'outline' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#0854a0] text-white hover:bg-[#0a6ed1] focus:ring-[#0854a0] shadow-sm border-transparent',
  secondary: 'bg-white text-[#32363a] border border-[#d9dde3] hover:bg-[#f5f6f7] hover:border-[#6a6d70] focus:ring-[#0854a0]',
  tertiary: 'bg-transparent text-[#0854a0] hover:bg-[#f5f6f7] focus:ring-[#0854a0] border-transparent',
  ghost: 'bg-transparent text-[#6a6d70] hover:bg-[#f5f6f7] hover:text-[#32363a] focus:ring-[#0854a0] border-transparent',
  danger: 'bg-[#b00] text-white hover:bg-[#d00] focus:ring-[#b00] border border-[#b00]',
  outline: 'bg-white text-[#0854a0] border border-[#0854a0] hover:bg-[#f0f7ff] focus:ring-[#0854a0]',
  success: 'bg-[#107e3e] text-white hover:bg-[#0d6630] focus:ring-[#107e3e] shadow-sm border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-[26px] px-3 text-xs rounded-md gap-1',
  md: 'h-[32px] px-4 text-sm rounded-md gap-1.5',
  lg: 'h-[40px] px-6 text-base rounded-lg gap-2',
};

const spinnerSize: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 };

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-normal
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={spinnerSize[size]} />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
}

export default Button;
