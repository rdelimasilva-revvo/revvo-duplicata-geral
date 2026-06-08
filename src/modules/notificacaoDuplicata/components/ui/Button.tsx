import { cn } from '@/modules/notificacaoDuplicata/utils/cn';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'success' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-2',
        {
          'bg-[#007BFF] text-white font-bold hover:bg-[#0066E0]': variant === 'primary',
          'bg-white text-[#007BFF] font-semibold border border-[#D9DDE3] hover:bg-[rgba(0,123,255,0.08)] hover:border-[#0066E0]': variant === 'secondary',
          'text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium': variant === 'ghost',
          'text-[#007BFF] hover:text-[#0066E0] hover:underline font-semibold': variant === 'link',
          'bg-[#10B981] text-white font-bold hover:bg-[#059669]': variant === 'success',
          'bg-[#EF4444] text-white font-bold hover:bg-[#DC2626]': variant === 'danger',
          'h-6 px-2 text-xs gap-1': size === 'xs',
          'h-7 px-4 text-sm gap-1.5': size === 'sm',
          'h-10 px-6 text-base gap-2': size === 'md',
          'h-12 px-8 text-lg gap-2.5': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}