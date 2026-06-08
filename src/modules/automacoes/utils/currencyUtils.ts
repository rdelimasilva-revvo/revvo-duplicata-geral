// Formats a number to Brazilian currency string
export function formatToBRL(value: number | null): string {
  if (value === null) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Converts a string with Brazilian currency format to a number
export function parseBRLString(value: string): number | null {
  if (!value) return null;
  
  // Remove currency symbol, spaces, and dots (thousand separators)
  const cleanValue = value
    .replace(/[R$\s.]/g, '')
    .replace(',', '.');
  
  const number = parseFloat(cleanValue);
  return isNaN(number) ? null : number;
}

// Formats a number input value to Brazilian currency format
export function formatInputValue(value: string): string {
  // Remove any non-numeric characters except comma
  let cleanValue = value.replace(/[^\d,]/g, '');
  
  // Handle empty input
  if (!cleanValue) return 'R$ 0,';
  
  // Split into integer and decimal parts
  let [integerPart = '', decimalPart = ''] = cleanValue.split(',');
  
  // Limit integer part length but don't discard input
  if (integerPart.length > 15) {
    integerPart = integerPart.slice(0, 15);
  }
  
  // Format integer part with thousand separators
  // If integer part is empty or just zeros, use '0'
  integerPart = integerPart.replace(/^0+/, '') || '0';
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Format decimal part (limit to 2 digits)
  const formattedDecimal = decimalPart ? `,${decimalPart.slice(0, 2)}` : ',';
  
  return `R$ ${formattedInteger}${formattedDecimal}`;
}