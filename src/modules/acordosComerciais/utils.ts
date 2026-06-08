import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FormatCurrencyOptions {
  withCents?: boolean;
}

export function formatCurrency(value: number, options: FormatCurrencyOptions = {}): string {
  const { withCents = true } = options;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  }).format(value);
}

export function formatDate(dateStr: string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), pattern, { locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  return formatDate(dateStr, "dd/MM/yyyy HH:mm");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatCnpj(cnpj: string): string {
  return cnpj;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
