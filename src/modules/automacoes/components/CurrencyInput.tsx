import React, { useState } from 'react';

interface CurrencyInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

export function CurrencyInput({ value, onChange, className = '' }: CurrencyInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const formatToCurrency = (value: number | null): string => {
    if (value === null) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseValue = (value: string): number | null => {
    if (!value) return null;
    // Remove currency symbol, dots and replace comma with period
    const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return isNaN(parseFloat(cleanValue)) ? null : parseFloat(cleanValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove currency symbol and all non-numeric characters except comma and period
    const rawValue = e.target.value
      .replace(/[R$\s]/g, '')  // Remove currency symbol and spaces
      .replace(/\./g, '')      // Remove dots (thousand separators)
      .replace(',', '.');      // Replace comma with period for decimal

    if (!rawValue) {
      setInputValue('');
      onChange(null);
      return;
    }

    // Validate if it's a valid number
    const numericValue = Number(rawValue);
    if (isNaN(numericValue)) return;

    // Format for display
    const formattedValue = 
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);

    setInputValue(formattedValue);
    // Store the exact numeric value with 2 decimal places
    onChange(Number(numericValue.toFixed(2)));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    setInputValue(formatToCurrency(value));
  };

  return (
    <input
      type="text"
      className={`input-field ${className}`}
      value={isFocused ? inputValue : formatToCurrency(value)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}