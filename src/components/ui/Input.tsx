import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
  validate?: (value: string) => string | undefined;
}

export function Input({
  label,
  error,
  success,
  hint,
  required,
  icon,
  validate,
  className = '',
  onBlur,
  ...props
}: InputProps) {
  const [internalError, setInternalError] = useState<string>();
  const displayError = error || internalError;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (validate) {
      const validationError = validate(e.target.value);
      setInternalError(validationError);
    }
    onBlur?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full h-10 px-3
            ${icon ? 'pl-10' : ''}
            border rounded-md
            text-sm text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${displayError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            ${success ? 'border-green-300 focus:ring-green-500' : ''}
            ${className}
          `}
          onBlur={handleBlur}
          {...props}
        />
        {displayError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
        {success && !displayError && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>
      {displayError && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          {displayError}
        </p>
      )}
      {success && !displayError && (
        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
          {success}
        </p>
      )}
      {hint && !displayError && !success && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
