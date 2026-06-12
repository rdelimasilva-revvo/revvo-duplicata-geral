import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  X,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  RotateCw,
  Landmark,
  Coins,
  Lightbulb,
  Copy,
  Building2,
  Filter,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Status = 'liquidado' | 'pendente' | 'em_transito' | 'falha_registradora' | 'erro';
type Registradora = 'CERC' | 'B3';

interface ReconciliationRow {
  id: string;
  nf_number: string;
  duplicata_id: string;
  original_recipient_name: string;
  original_recipient_cnpj: string;
  new_recipient_name: string;
  new_recipient_cnpj: string;
  original_bank_name: string;
  original_agency: string;
  original_account: string;
  new_bank_name: string;
  new_agency: string;
  new_account: string;
  registradora: string | null;
  registradora_id: string | null;
  processor_confirmed: boolean;
  processor_confirmed_at: string | null;
  amount: number;
  gross_value: number;
  net_value: number;
  issue_date: string | null;
  due_date: string | null;
  settlement_date: string | null;
  status: Status;
  error_reason: string | null;
  error_code: string | null;
  error_suggestion: string | null;
  created_at?: string;
}

const STATUS_META: Record<Status, { label: string; className: string; dot: string }> = {
  liquidado: { label: 'Sucesso', className: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-500' },
  pendente: { label: 'Pendente', className: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  em_transito: { label: 'Em trânsito', className: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  falha_registradora: { label: 'Falha Registradora', className: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  erro: { label: 'Erro Liquidação', className: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
};

const REG_STYLES: Record<Registradora, string> = {
  CERC: 'bg-blue-50 text-blue-700 ring-blue-200',
  B3: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

function normalizeRegistradora(v: string | null | undefined): Registradora | null {
  if (!v) return null;
  const s = v.toString().trim().toUpperCase();
  if (s === 'CERC') return 'CERC';
  if (s === 'B3') return 'B3';
  return null;
}

function formatCurrency(v: number) {
  return (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatDate(v: string | null | undefined) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatDateTime(v: string | null | undefined) {
  if (!v) return '—';
  return new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function csvEscape(v: string | number | null | undefined) {
  const s = v == null ? '' : String(v);
  if (/[",;\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function isNegotiated(row: ReconciliationRow) {
  const orig = (row.original_bank_name || '').trim().toLowerCase();
  const newB = (row.new_bank_name || '').trim().toLowerCase();
  return !!newB && newB !== orig;
}

function exportCSV(rows: ReconciliationRow[]) {
  const header = [
    'NF', 'Duplicata', 'Emissão', 'Vencimento', 'Valor Bruto', 'Valor Líquido',
    'Fornecedor Original', 'CNPJ Fornecedor', 'Financeira/Banco', 'Registradora', 'ID Registro',
    'Confirmado', 'Confirmado em', 'Status', 'Erro',
  ];
  const lines = rows.map((r) => [
    r.nf_number, r.duplicata_id, formatDate(r.issue_date), formatDate(r.due_date),
    r.gross_value, r.net_value,
    r.original_recipient_name, r.original_recipient_cnpj,
    isNegotiated(r) ? r.new_bank_name : '',
    normalizeRegistradora(r.registradora) ?? '',
    r.registradora_id ?? '',
    r.processor_confirmed ? 'Sim' : 'Não', formatDateTime(r.processor_confirmed_at),
    STATUS_META[r.status].label, r.error_reason ?? '',
  ].map(csvEscape).join(';'));
  const blob = new Blob([header.join(';') + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conciliacao-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const PaymentReport = () => {
  const [rows, setRows] = useState<ReconciliationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [registradoraFilter, setRegistradoraFilter] = useState<'all' | Registradora>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [detail, setDetail] = useState<ReconciliationRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reprocessing, setReprocessing] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_reconciliation')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (!error && data) setRows(data as ReconciliationRow[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const periodDays = periodFilter === '7d' ? 7 : periodFilter === '30d' ? 30 : periodFilter === '90d' ? 90 : null;
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (registradoraFilter !== 'all' && normalizeRegistradora(r.registradora) !== registradoraFilter) return false;
      if (periodDays && r.due_date) {
        const diff = (new Date(r.due_date).getTime() - now) / 86400000;
        if (diff > periodDays || diff < -periodDays) return false;
      }
      if (!q) return true;
      return [
        r.nf_number, r.duplicata_id, r.original_recipient_cnpj, r.new_recipient_cnpj,
        r.original_recipient_name, r.new_bank_name, r.registradora_id,
      ].some((f) => (f || '').toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, registradoraFilter, periodFilter]);

  const kpis = useMemo(() => {
    const totalValue = filtered.reduce((a, r) => a + Number(r.net_value || r.amount || 0), 0);
    const sucesso = filtered.filter((r) => r.status === 'liquidado').length;
    const erro = filtered.filter((r) => r.status === 'erro' || r.status === 'falha_registradora').length;
    const pendenteReg = filtered.filter((r) => (r.status === 'pendente' || r.status === 'em_transito') && normalizeRegistradora(r.registradora)).length;
    const total = filtered.length || 1;
    const sucessoPct = Math.round((sucesso / total) * 100);
    return { totalValue, sucesso, erro, pendenteReg, sucessoPct, total: filtered.length };
  }, [filtered]);

  const errorSelected = useMemo(
    () => filtered.filter((r) => selected.has(r.id) && (r.status === 'erro' || r.status === 'falha_registradora')),
    [filtered, selected]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    const selectable = filtered.filter((r) => r.status === 'erro' || r.status === 'falha_registradora');
    if (selectable.every((r) => selected.has(r.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectable.map((r) => r.id)));
    }
  };

  const handleReprocess = async () => {
    if (errorSelected.length === 0) return;
    setReprocessing(true);
    await new Promise((r) => setTimeout(r, 900));
    setRows((prev) =>
      prev.map((r) =>
        errorSelected.some((s) => s.id === r.id)
          ? { ...r, status: 'pendente' as Status, error_reason: null, error_code: null, error_suggestion: null }
          : r
      )
    );
    setFlash(`${errorSelected.length} título(s) reenfileirado(s) para reprocessamento.`);
    setSelected(new Set());
    setReprocessing(false);
    setTimeout(() => setFlash(null), 3500);
  };

  return (
    <div className="bg-gray-100 flex flex-col overflow-x-hidden">
      <div className="p-4 md:p-6 flex-1">
        <header className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Relatório de Pagamentos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Listagem de títulos com rastreabilidade de liquidação e registradoras.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReprocess}
              disabled={errorSelected.length === 0 || reprocessing}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {reprocessing ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />}
              Reprocessar
              {errorSelected.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-xs font-semibold rounded bg-red-50 text-red-600">
                  {errorSelected.length}
                </span>
              )}
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-[#0070F2] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Download size={14} />
              Exportar
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KpiCard
            icon={<Coins size={20} />}
            top="Volume total"
            value={formatCurrency(kpis.totalValue)}
            sub={`${kpis.total} títulos`}
          />
          <KpiSuccessError sucesso={kpis.sucesso} erro={kpis.erro} pct={kpis.sucessoPct} />
          <KpiCard
            icon={<Shield size={20} />}
            top="Pendente registradora"
            value={String(kpis.pendenteReg)}
            status="warning"
          />
          <KpiCard
            icon={<AlertTriangle size={20} />}
            top="Requer atenção"
            value={String(kpis.erro)}
            status="urgent"
          />
        </div>

        {flash && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
            <CheckCircle2 size={14} />
            {flash}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 w-full overflow-hidden mb-4">
          <button
            className="flex items-center justify-between w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-900 text-base">Filtros</span>
            </div>
            <ChevronUp className={`w-5 h-5 text-gray-700 transition-transform ${filtersOpen ? '' : 'rotate-180'}`} />
          </button>
          {filtersOpen && (
          <div className="flex flex-wrap items-center gap-3 px-6 pb-6 pt-2 border-t border-gray-200">
            <div className="relative flex-1 min-w-[260px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por NF, duplicata, CNPJ ou ID de registro"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <SelectField
              label="Vencimento"
              value={periodFilter}
              onChange={(v) => setPeriodFilter(v as typeof periodFilter)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: '7d', label: '± 7 dias' },
                { value: '30d', label: '± 30 dias' },
                { value: '90d', label: '± 90 dias' },
              ]}
            />
            <SelectField
              label="Registradora"
              value={registradoraFilter}
              onChange={(v) => setRegistradoraFilter(v as typeof registradoraFilter)}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'CERC', label: 'CERC' },
                { value: 'B3', label: 'B3' },
              ]}
            />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as 'all' | Status)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'liquidado', label: 'Sucesso' },
                { value: 'pendente', label: 'Pendente' },
                { value: 'em_transito', label: 'Em trânsito' },
                { value: 'falha_registradora', label: 'Falha Registradora' },
                { value: 'erro', label: 'Erro Liquidação' },
              ]}
            />
          </div>
          )}
        </div>

        <div className="mb-3 px-1">
          <h2 className="text-lg font-medium text-gray-900">
            {selected.size === 0
              ? 'Nenhum item selecionado'
              : `${selected.size} ${selected.size === 1 ? 'item selecionado' : 'itens selecionados'}`}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 w-10">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        filtered.filter((r) => r.status === 'erro' || r.status === 'falha_registradora').length > 0 &&
                        filtered
                          .filter((r) => r.status === 'erro' || r.status === 'falha_registradora')
                          .every((r) => selected.has(r.id))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">Título</th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">Origem</th>
                  <th className="px-4 py-2 font-medium text-right text-xs text-gray-600">Valor</th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">Pgto 2 Etapas</th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">Confirmação</th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">Status</th>
                  <th className="px-4 py-2 font-medium text-right text-xs text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center">
                      <Loader2 size={20} className="animate-spin text-gray-400 mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-sm text-gray-400">
                      Nenhum título encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const status = STATUS_META[row.status];
                    const isError = row.status === 'erro' || row.status === 'falha_registradora';
                    const negotiated = isNegotiated(row);
                    const reg = normalizeRegistradora(row.registradora);
                    const isSelected = selected.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 align-top">
                          {isError && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(row.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 tabular-nums leading-tight">
                              NF {row.nf_number}
                            </span>
                            <span className="text-xs text-gray-400 tabular-nums mt-0.5">Dup. {row.duplicata_id}</span>
                            <span className="text-xs text-gray-400 tabular-nums mt-0.5">Emissão {formatDate(row.issue_date)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top max-w-[260px]">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="mt-0.5 text-gray-400 shrink-0">
                              <Building2 size={14} />
                            </span>
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold text-gray-900 truncate leading-tight">
                                {row.original_recipient_name}
                              </span>
                              {negotiated && row.new_bank_name && (
                                <span className="block text-xs text-gray-400 truncate mt-0.5">
                                  via {row.new_bank_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">
                              {formatCurrency(Number(row.net_value || row.amount))}
                            </span>
                            {row.gross_value && Number(row.gross_value) !== Number(row.net_value) && (
                              <span className="text-xs text-gray-400 tabular-nums line-through mt-0.5">
                                {formatCurrency(Number(row.gross_value))}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          {reg ? (
                            <div className="flex flex-col">
                              <span className={`inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${REG_STYLES[reg]}`}>
                                <Shield size={11} />
                                {reg}
                              </span>
                              {row.registradora_id && (
                                <span className="text-xs text-gray-400 tabular-nums mt-1">{row.registradora_id}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-300 tabular-nums">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          {row.processor_confirmed ? (
                            <div className="flex flex-col">
                              <span className="inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-green-200">
                                <CheckCircle2 size={11} />
                                Confirmado
                              </span>
                              {row.processor_confirmed_at && (
                                <span className="text-xs text-gray-400 tabular-nums mt-1">
                                  {formatDateTime(row.processor_confirmed_at)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 ring-1 ring-gray-200">
                              <Clock size={11} />
                              Aguardando
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${status.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-right">
                          <button
                            onClick={() => setDetail(row)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
            <span>{filtered.length} de {rows.length} títulos</span>
          </div>
        </div>
      </div>

      {detail && <DetailDrawer row={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

function KpiCard({
  icon, top, value, sub, status,
}: { icon?: React.ReactNode; top: string; value: string; sub?: string; status?: 'warning' | 'urgent' }) {
  return (
    <div className="flex flex-col rounded-lg px-4 py-4 shadow-sm h-[140px] bg-white">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{top}</p>
        {icon && <div className="text-gray-400 flex-shrink-0">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      {status === 'urgent' && (
        <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Ação imediata necessária</span>
        </div>
      )}
      {status === 'warning' && (
        <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <Clock className="w-3.5 h-3.5" />
          <span>Requer atenção</span>
        </div>
      )}
    </div>
  );
}

function KpiSuccessError({ sucesso, erro, pct }: { sucesso: number; erro: number; pct: number }) {
  const errorPct = 100 - pct;
  return (
    <div className="flex flex-col rounded-lg px-4 py-4 shadow-sm h-[140px] bg-white">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">Sucesso vs Erro</p>
        <div className="text-gray-400 flex-shrink-0"><CheckCircle2 size={20} /></div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">{pct}%</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
          <div className="h-full bg-red-400" style={{ width: `${errorPct}%` }} />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-gray-500 tabular-nums">
        <span className="text-green-600 font-medium">{sucesso} ok</span>
        <span className="text-red-600 font-medium">{erro} erro</span>
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none h-9 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </label>
  );
}

function DetailDrawer({ row, onClose }: { row: ReconciliationRow; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const isError = row.status === 'erro' || row.status === 'falha_registradora';
  const isRegFailure = row.status === 'falha_registradora';
  const negotiated = isNegotiated(row);
  const reg = normalizeRegistradora(row.registradora);

  const toneBorder = isRegFailure ? 'border-amber-200' : 'border-red-200';
  const toneBg = isRegFailure ? 'bg-amber-50/60' : 'bg-red-50/60';
  const toneText = isRegFailure ? 'text-amber-900' : 'text-red-900';
  const toneLabel = isRegFailure ? 'text-amber-700' : 'text-red-600';

  const copyCode = async () => {
    if (!row.error_code) return;
    try {
      await navigator.clipboard.writeText(row.error_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[580px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
          <div className="min-w-0">
            <div className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold ${isError ? toneLabel : 'text-gray-500'}`}>
              {isError && <AlertTriangle size={13} />}
              {STATUS_META[row.status].label}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 tabular-nums truncate">NF {row.nf_number}</h2>
            <div className="text-xs text-gray-500 tabular-nums">Dup. {row.duplicata_id} · Emissão {formatDate(row.issue_date)}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isError && (
            <div className={`rounded-xl border ${toneBorder} ${toneBg} p-4`}>
              <div className={`flex items-center justify-between text-xs uppercase tracking-wider font-semibold ${toneLabel}`}>
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={13} />
                  Código do erro
                </span>
                {row.error_code && (
                  <button onClick={copyCode} className="inline-flex items-center gap-1 text-xs font-medium normal-case tracking-normal text-gray-500 hover:text-gray-800">
                    <Copy size={11} />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                )}
              </div>
              <div className="mt-2 font-mono text-sm font-semibold text-gray-900 tabular-nums">
                {row.error_code || '—'}
              </div>
              <p className={`mt-2 text-sm leading-relaxed ${toneText}`}>
                {row.error_reason || 'Erro não especificado.'}
              </p>
            </div>
          )}

          {row.error_suggestion && (
            <div className="rounded-xl border border-green-200 bg-green-50/60 p-4">
              <div className="flex items-center gap-1.5 text-green-700 text-xs uppercase tracking-wider font-semibold">
                <Lightbulb size={13} />
                Sugestão de correção
              </div>
              <p className="mt-2 text-sm text-green-900 leading-relaxed">
                {row.error_suggestion}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
              <Building2 size={13} />
              Origem
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{row.original_recipient_name}</span>
              <span className="text-xs text-gray-400 tabular-nums mt-0.5">{row.original_recipient_cnpj}</span>
              {negotiated && row.new_bank_name && (
                <span className="mt-2 inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                  <Landmark size={11} />
                  Negociado com {row.new_bank_name}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Section label="Registradora">
              {reg ? (
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${REG_STYLES[reg]}`}>
                    <Shield size={12} />
                    {reg}
                  </span>
                  {row.registradora_id && (
                    <div className="mt-1 text-xs text-gray-500 tabular-nums">{row.registradora_id}</div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Sem intermediação</span>
              )}
            </Section>
            <Section label="Valor líquido">
              <span className="text-base font-semibold text-gray-900 tabular-nums">
                {formatCurrency(Number(row.net_value || row.amount))}
              </span>
              {row.gross_value && Number(row.gross_value) !== Number(row.net_value) && (
                <div className="text-xs text-gray-400 tabular-nums">
                  Bruto {formatCurrency(Number(row.gross_value))}
                </div>
              )}
            </Section>
            <Section label="Vencimento">
              <span className="text-sm text-gray-700 tabular-nums">{formatDate(row.due_date)}</span>
            </Section>
            <Section label="Registro">
              <span className="text-sm text-gray-700 tabular-nums">{formatDateTime(row.created_at)}</span>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1.5">{label}</div>
      {children}
    </div>
  );
}

export default PaymentReport;
