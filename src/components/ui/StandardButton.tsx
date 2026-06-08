import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface StandardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const StandardButton: React.FC<StandardButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-normal transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#0854a0] text-white hover:bg-[#0a6ed1] focus:ring-[#0854a0] shadow-sm',
    secondary: 'bg-white text-[#32363a] border border-[#d9dde3] hover:bg-[#f5f6f7] hover:border-[#6a6d70] focus:ring-[#0854a0]',
    tertiary: 'bg-transparent text-[#0854a0] hover:bg-[#f5f6f7] focus:ring-[#0854a0]',
    ghost: 'bg-transparent text-[#6a6d70] hover:bg-[#f5f6f7] hover:text-[#32363a] focus:ring-[#0854a0]',
    danger: 'bg-[#b00] text-white hover:bg-[#d00] focus:ring-[#b00] border border-[#b00]',
    outline: 'bg-white text-[#0854a0] border border-[#0854a0] hover:bg-[#f0f7ff] focus:ring-[#0854a0]',
    success: 'bg-[#107e3e] text-white hover:bg-[#0d6630] focus:ring-[#107e3e] shadow-sm',
  };

  const sizeStyles = {
    sm: 'h-[26px] px-3 text-xs rounded-md gap-1',
    md: 'h-[32px] px-4 text-sm rounded-md gap-1.5',
    lg: 'h-[40px] px-6 text-base rounded-lg gap-2',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
          {children}
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default StandardButton;
