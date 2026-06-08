import { useEffect, useMemo } from 'react';
import { differenceInDays, format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgreementsDashboardStore } from './store';
import { PIPELINE_CONFIG, PIPELINE_ORDER, type AgreementRecord, type PipelineStatus } from './types';

export const useAgreementsData = () => {
  const { agreements, loading, error, loadAgreements } = useAgreementsDashboardStore();

  useEffect(() => {
    if (agreements.length === 0 && !loading) {
      loadAgreements();
    }
  }, []);

  return { agreements, loading, error, reload: loadAgreements };
};

export const useFilteredAgreements = () => {
  const { agreements } = useAgreementsDashboardStore();
  const filters = useAgreementsDashboardStore((s) => s.filters);

  return useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return agreements.filter((a) => {
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.supplier !== 'all' && a.supplierName !== filters.supplier) return false;
      if (filters.riskLevel !== 'all' && a.riskLevel !== filters.riskLevel) return false;
      if (!q) return true;
      return (
        a.code.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.supplierName.toLowerCase().includes(q) ||
        a.supplierCnpj.includes(q) ||
        a.sacadoName.toLowerCase().includes(q)
      );
    });
  }, [agreements, filters]);
};

export interface KpiMetrics {
  totalValue: number;
  activeValue: number;
  totalCount: number;
  activeCount: number;
  inProgressCount: number;
  conversionRate: number;
  avgProgress: number;
  avgCycleDays: number;
}

export const useKpis = (agreements: AgreementRecord[]): KpiMetrics => {
  return useMemo(() => {
    const total = agreements.length;
    if (total === 0) {
      return {
        totalValue: 0,
        activeValue: 0,
        totalCount: 0,
        activeCount: 0,
        inProgressCount: 0,
        conversionRate: 0,
        avgProgress: 0,
        avgCycleDays: 0,
      };
    }

    const activeAgreements = agreements.filter((a) => a.status === 'active');
    const inProgress = agreements.filter((a) =>
      ['draft', 'in_negotiation', 'pending_approval'].includes(a.status),
    );
    const closed = agreements.filter((a) => ['active', 'completed', 'rejected'].includes(a.status));
    const converted = agreements.filter((a) => ['active', 'completed'].includes(a.status));

    const totalValue = agreements.reduce((s, a) => s + a.totalValue, 0);
    const activeValue = activeAgreements.reduce((s, a) => s + a.totalValue, 0);
    const avgProgress =
      agreements.reduce((s, a) => s + a.progressPercent, 0) / total;

    const cycleDays = agreements
      .filter((a) => ['active', 'completed'].includes(a.status))
      .map((a) => differenceInDays(parseISO(a.updatedAt), parseISO(a.createdAt)));
    const avgCycleDays = cycleDays.length
      ? cycleDays.reduce((s, d) => s + d, 0) / cycleDays.length
      : 0;

    return {
      totalValue,
      activeValue,
      totalCount: total,
      activeCount: activeAgreements.length,
      inProgressCount: inProgress.length,
      conversionRate: closed.length ? (converted.length / closed.length) * 100 : 0,
      avgProgress,
      avgCycleDays: Math.round(avgCycleDays),
    };
  }, [agreements]);
};

export interface PipelineStageData {
  id: PipelineStatus;
  label: string;
  count: number;
  value: number;
  fill: string;
  pctOfTotal: number;
}

export const usePipelineData = (agreements: AgreementRecord[]): PipelineStageData[] => {
  return useMemo(() => {
    const totalValue = agreements.reduce((s, a) => s + a.totalValue, 0);
    return PIPELINE_ORDER.map((status) => {
      const cfg = PIPELINE_CONFIG[status];
      const inStage = agreements.filter((a) => a.status === status);
      const value = inStage.reduce((s, a) => s + a.totalValue, 0);
      return {
        id: status,
        label: cfg.label,
        count: inStage.length,
        value,
        fill: cfg.fill,
        pctOfTotal: totalValue > 0 ? (value / totalValue) * 100 : 0,
      };
    });
  }, [agreements]);
};

export interface TimeSeriesPoint {
  month: string;
  label: string;
  created: number;
  closed: number;
  value: number;
}

export const useTimeSeries = (agreements: AgreementRecord[]): TimeSeriesPoint[] => {
  return useMemo(() => {
    const now = new Date();
    const buckets: TimeSeriesPoint[] = Array.from({ length: 6 }, (_, idx) => {
      const date = startOfMonth(subMonths(now, 5 - idx));
      return {
        month: format(date, 'yyyy-MM'),
        label: format(date, 'MMM', { locale: ptBR }),
        created: 0,
        closed: 0,
        value: 0,
      };
    });

    for (const a of agreements) {
      const created = format(parseISO(a.createdAt), 'yyyy-MM');
      const bucket = buckets.find((b) => b.month === created);
      if (bucket) {
        bucket.created += 1;
        bucket.value += a.totalValue;
      }
      if (['active', 'completed', 'rejected'].includes(a.status)) {
        const closedMonth = format(parseISO(a.updatedAt), 'yyyy-MM');
        const closedBucket = buckets.find((b) => b.month === closedMonth);
        if (closedBucket) closedBucket.closed += 1;
      }
    }

    return buckets;
  }, [agreements]);
};

export const useSuppliers = (agreements: AgreementRecord[]) =>
  useMemo(() => {
    const set = new Set<string>();
    agreements.forEach((a) => set.add(a.supplierName));
    return Array.from(set).sort();
  }, [agreements]);
