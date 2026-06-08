import { Bill } from '../types/bill';

export function calculateUrgency(bill: Bill): { level: 'critical' | 'high' | 'medium' | 'low'; daysUntilDeadline: number } {
  if (!bill.manifestationDeadline || bill.manifestationStatus === 'completed') {
    return { level: 'low', daysUntilDeadline: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(bill.manifestationDeadline);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let level: 'critical' | 'high' | 'medium' | 'low';

  if (daysUntilDeadline < 0) {
    level = 'critical';
  } else if (daysUntilDeadline <= 2) {
    level = 'critical';
  } else if (daysUntilDeadline <= 5) {
    level = 'high';
  } else if (daysUntilDeadline <= 10) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { level, daysUntilDeadline };
}

export function sortByUrgency(bills: Bill[]): Bill[] {
  const urgencyWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  return [...bills].sort((a, b) => {
    const urgencyA = calculateUrgency(a);
    const urgencyB = calculateUrgency(b);

    const weightDiff = urgencyWeight[urgencyB.level] - urgencyWeight[urgencyA.level];
    if (weightDiff !== 0) return weightDiff;

    return urgencyA.daysUntilDeadline - urgencyB.daysUntilDeadline;
  });
}
