/**
 * Formatadores centralizados para exibição de dados no padrão brasileiro.
 * Use sempre estas funções em vez de formatar inline nos componentes.
 */

/** Formata um CNPJ (14 dígitos) como 00.000.000/0000-00. Aceita entrada parcial (máscara progressiva). */
export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

/** Formata um CPF (11 dígitos) como 000.000.000-00. Aceita entrada parcial (máscara progressiva). */
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
};

/** Formata um valor numérico como moeda brasileira (R$ 1.234,56). */
export const formatCurrencyBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/** Formata um número com separador de milhares brasileiro (1.234.567). */
export const formatNumberBR = (value: number): string =>
  new Intl.NumberFormat('pt-BR').format(value);

/** Formata uma data como dd/mm/aaaa. Aceita Date ou string ISO. */
export const formatDatePtBR = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** Formata data e hora como dd/mm/aaaa hh:mm. Aceita Date ou string ISO. */
export const formatDateTimePtBR = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Converte texto digitado em input de moeda para número (centavos como decimais)
 * e devolve o valor formatado para exibição. Útil para máscaras de moeda em tempo real.
 */
export const maskCurrencyInput = (raw: string): { numeric: number; display: string } => {
  const digits = raw.replace(/\D/g, '');
  const numeric = digits ? parseInt(digits, 10) / 100 : 0;
  return { numeric, display: formatCurrencyBRL(numeric) };
};
