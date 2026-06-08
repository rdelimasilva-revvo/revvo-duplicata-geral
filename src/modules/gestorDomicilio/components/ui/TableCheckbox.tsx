import { InputHTMLAttributes } from 'react';
import { cn } from '@/modules/gestorDomicilio/utils/cn';

interface TableCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  disabled?: boolean;
}

export function TableCheckbox({ checked, disabled, className, ...props }: TableCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      className={cn(
        "w-4 h-4 rounded border-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}