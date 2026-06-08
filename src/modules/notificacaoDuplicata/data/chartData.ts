import { formatChartDate } from '@/modules/notificacaoDuplicata/utils/format';

export const dueAmountsData = [
  { date: '12/12', amount: 75400 },
  { date: '14/12', amount: 88050 },
  { date: '15/12', amount: 86124 },
  { date: '16/12', amount: 103879 },
  { date: '18/12', amount: 139432 },
  { date: '20/12', amount: 92753 },
  { date: '22/12', amount: 155231 },
  { date: '23/12', amount: 144023 },
  { date: '25/12', amount: 187494 },
  { date: '27/12', amount: 108090 },
  { date: '28/12', amount: 143827 },
  { date: '29/12', amount: 185003 }
].map(item => ({
  ...item,
  formattedDate: formatChartDate(item.date),
}));