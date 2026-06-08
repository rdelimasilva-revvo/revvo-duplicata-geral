import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatChartDate = (date: string) => {
  const [day, month] = date.split('/');
  return format(new Date(2024, parseInt(month) - 1, parseInt(day)), 'd MMM', {
    locale: ptBR,
  });
};

export const chartColors = {
  primary: '#3b82f6',
  grid: '#e5e7eb',
  text: '#1D2D3E',
};

export const defaultChartMargins = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 5,
};