import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses = 'h-12 px-8 text-base inline-flex items-center justify-center gap-2 rounded-[50px] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-2';

  const variants = {
    primary: 'bg-[#007BFF] text-white font-bold hover:bg-[#0066E0]',
    secondary: 'bg-white text-[#007BFF] font-semibold border border-[#D9DDE3] hover:bg-[rgba(0,123,255,0.08)] hover:border-[#0066E0]',
    success: 'bg-[#10B981] text-white font-bold hover:bg-[#059669]',
    danger: 'bg-[#EF4444] text-white font-bold hover:bg-[#DC2626]'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};
