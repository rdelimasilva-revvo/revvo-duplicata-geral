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