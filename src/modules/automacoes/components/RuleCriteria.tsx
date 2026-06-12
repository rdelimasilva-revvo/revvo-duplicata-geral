import React, { useState } from 'react';
import { Building2, Users, Banknote, Clock, CalendarClock, CalendarCheck, Scale, Info } from 'lucide-react';
import { TransferList } from '@/modules/automacoes/components/TransferList';
import { formatToBRL } from '@/modules/automacoes/utils/currencyUtils';
import type { Database } from '@/modules/automacoes/lib/database.types';

type Rule = Database['public']['Tables']['rules']['Row'];

interface PartyItem {
  id: string;
  name: string | null;
  doc_num?: string | null;
}

export type CriteriaContext = 'escrituracao' | 'manifestacao';

interface RuleCriteriaProps {
  rule: Rule;
  onPatch: (patch: Partial<Rule>) => void;
  emitters: PartyItem[];
  clients: PartyItem[];
  /** Define o vocabulário do bloco (escriturar vs. manifestar). */
  context?: CriteriaContext;
}

/** Vocabulário por contexto, para reaproveitar o bloco em escrituração e manifestação. */
const COPY: Record<CriteriaContext, { title: string; verbInf: string; verbPast: string; verbSubj: string }> = {
  escrituracao: {
    title: 'Critérios de escrituração automática',
    verbInf: 'Escriturar',
    verbPast: 'escriturada',
    verbSubj: 'escriture',
  },
  manifestacao: {
    title: 'Critérios de manifestação automática',
    verbInf: 'Manifestar',
    verbPast: 'manifestada',
    verbSubj: 'manifeste',
  },
};

type CriterionKey = 'emissor' | 'cliente' | 'valor' | 'prazo' | 'emissao' | 'vencimento' | 'divergencia';

function buildTransferItems(items: PartyItem[]) {
  return items.map((item) => ({
    id: item.id.toString(),
    name: item.doc_num ? `${item.name || 'Sem nome'} · ${item.doc_num}` : item.name || 'Sem nome',
  }));
}

function isEnabled(rule: Rule, key: CriterionKey): boolean {
  switch (key) {
    case 'emissor':
      return (rule.supplier?.length ?? 0) > 0;
    case 'cliente':
      return (rule.customer?.length ?? 0) > 0;
    case 'valor':
      return (rule.value_ini ?? 0) > 0 || (rule.value_end ?? 0) > 0;
    case 'prazo':
      return rule.days_until_due_date_ini != null || rule.days_until_due_date_end != null;
    case 'emissao':
      return rule.issue_date_mode != null;
    case 'vencimento':
      return rule.due_date_mode != null;
    case 'divergencia':
      return (rule.value_divergence_pct ?? 0) > 0 || (rule.value_divergence_abs ?? 0) > 0;
    default:
      return false;
  }
}

/** Patch que zera os campos de um critério ao desativá-lo. */
function clearPatch(key: CriterionKey): Partial<Rule> {
  switch (key) {
    case 'emissor':
      return { supplier: [] };
    case 'cliente':
      return { customer: [] };
    case 'valor':
      return { value_ini: null, value_end: null };
    case 'prazo':
      return { days_until_due_date_ini: null, days_until_due_date_end: null };
    case 'emissao':
      return { issue_date_mode: null, issue_date_ini: null, issue_date_end: null, issue_date_rel_days: null };
    case 'vencimento':
      return { due_date_mode: null, due_date_ini: null, due_date_end: null, due_date_rel_days: null };
    case 'divergencia':
      return { value_divergence_pct: null, value_divergence_abs: null };
    default:
      return {};
  }
}

interface CriterionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  children: React.ReactNode;
}

function CriterionCard({ icon, title, description, enabled, onToggle, children }: CriterionCardProps) {
  return (
    <div
      className={`rounded-lg border transition-colors ${
        enabled ? 'border-[#0070F2]/40 bg-[#F7FAFF]' : 'border-[#E8EAED] bg-white'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
            enabled ? 'bg-[#0070F2]/10 text-[#0070F2]' : 'bg-[#F0F1F3] text-[#8A94A6]'
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[#1D2D3E]">{title}</p>
          <p className="text-[12px] leading-snug text-[#8A94A6]">{description}</p>
        </div>
        <label className="relative inline-flex flex-shrink-0 cursor-pointer items-center pt-1">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-[22px] w-10 rounded-full bg-[#D3D6DA] after:absolute after:left-[2px] after:top-[2px] after:h-[18px] after:w-[18px] after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0070F2] peer-checked:after:translate-x-[18px] peer-checked:after:border-white peer-focus:outline-none" />
        </label>
      </div>
      {enabled && <div className="border-t border-[#E8EAED] px-4 py-4">{children}</div>}
    </div>
  );
}

/** Seletor de modo (Intervalo fixo | Janela relativa) para critérios de data. */
function ModeTabs({
  mode,
  onChange,
}: {
  mode: 'range' | 'relative';
  onChange: (mode: 'range' | 'relative') => void;
}) {
  return (
    <div className="mb-3 inline-flex rounded-[6px] border border-[#D3D6DA] p-0.5">
      {(['range', 'relative'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`h-[28px] rounded-[4px] px-3 text-[12px] font-medium transition-colors ${
            mode === m ? 'bg-[#0070F2] text-white' : 'text-[#556B82] hover:bg-[#F5F6F7]'
          }`}
        >
          {m === 'range' ? 'Intervalo de datas' : 'Janela relativa'}
        </button>
      ))}
    </div>
  );
}

export function RuleCriteria({ rule, onPatch, emitters, clients, context = 'escrituracao' }: RuleCriteriaProps) {
  const copy = COPY[context];

  // Estado de ativação por critério. Inicializado a partir dos valores da regra.
  const [enabled, setEnabled] = useState<Record<CriterionKey, boolean>>({
    emissor: isEnabled(rule, 'emissor'),
    cliente: isEnabled(rule, 'cliente'),
    valor: isEnabled(rule, 'valor'),
    prazo: isEnabled(rule, 'prazo'),
    emissao: isEnabled(rule, 'emissao'),
    vencimento: isEnabled(rule, 'vencimento'),
    divergencia: isEnabled(rule, 'divergencia'),
  });

  const activeCount = Object.values(enabled).filter(Boolean).length;

  const toggle = (key: CriterionKey, next: boolean, enablePatch: Partial<Rule>) => {
    setEnabled((prev) => ({ ...prev, [key]: next }));
    onPatch(next ? enablePatch : clearPatch(key));
  };

  const emitterItems = buildTransferItems(emitters);
  const clientItems = buildTransferItems(clients);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#1D2D3E]">{copy.title}</h3>
        <p className="mt-1 flex items-start gap-1.5 text-[12px] leading-snug text-[#556B82]">
          <Info size={14} className="mt-0.5 flex-shrink-0 text-[#0070F2]" />
          <span>
            Ative um ou mais critérios. A duplicata será{' '}
            <strong className="font-semibold text-[#1D2D3E]">{copy.verbPast}</strong> automaticamente quando atender a{' '}
            <strong className="font-semibold text-[#1D2D3E]">todos</strong> os critérios ativos.
          </span>
        </p>
      </div>

      {activeCount === 0 && (
        <div className="rounded-lg border border-dashed border-[#E0A800]/50 bg-[#FFF9E6] px-4 py-2.5 text-[12px] text-[#8A6D00]">
          Nenhum critério ativo — ative pelo menos um para que a regra {copy.verbSubj} duplicatas.
        </div>
      )}

      {/* CNPJ do emissor */}
      <CriterionCard
        icon={<Building2 size={16} />}
        title="CNPJ do emissor"
        description={`${copy.verbInf} apenas duplicatas emitidas pelos emissores selecionados.`}
        enabled={enabled.emissor}
        onToggle={(next) => toggle('emissor', next, { supplier: rule.supplier?.length ? rule.supplier : [] })}
      >
        <TransferList
          label="Emissores"
          searchPlaceholder="Buscar por razão social ou CNPJ..."
          availableItems={emitterItems}
          selectedItemIds={(rule.supplier || []).map(String)}
          onAdd={(ids) => onPatch({ supplier: [...new Set([...(rule.supplier || []), ...ids])] })}
          onRemove={(ids) => onPatch({ supplier: (rule.supplier || []).filter((x) => !ids.includes(x)) })}
          onAddAll={() => onPatch({ supplier: emitterItems.map((i) => i.id) })}
          onRemoveAll={() => onPatch({ supplier: [] })}
        />
      </CriterionCard>

      {/* CNPJ do cliente */}
      <CriterionCard
        icon={<Users size={16} />}
        title="CNPJ do cliente"
        description={`${copy.verbInf} apenas duplicatas cujo sacado/cliente esteja entre os selecionados.`}
        enabled={enabled.cliente}
        onToggle={(next) => toggle('cliente', next, { customer: rule.customer?.length ? rule.customer : [] })}
      >
        <TransferList
          label="Clientes"
          searchPlaceholder="Buscar por razão social ou CNPJ..."
          availableItems={clientItems}
          selectedItemIds={(rule.customer || []).map(String)}
          onAdd={(ids) => onPatch({ customer: [...new Set([...(rule.customer || []), ...ids])] })}
          onRemove={(ids) => onPatch({ customer: (rule.customer || []).filter((x) => !ids.includes(x)) })}
          onAddAll={() => onPatch({ customer: clientItems.map((i) => i.id) })}
          onRemoveAll={() => onPatch({ customer: [] })}
        />
      </CriterionCard>

      {/* Valor */}
      <CriterionCard
        icon={<Banknote size={16} />}
        title="Valor"
        description={`${copy.verbInf} duplicatas cujo valor esteja dentro da faixa informada.`}
        enabled={enabled.valor}
        onToggle={(next) => toggle('valor', next, { value_ini: rule.value_ini ?? 0, value_end: rule.value_end ?? 0 })}
      >
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Valor de</label>
            <input
              type="text"
              className="input-field w-full"
              value={formatToBRL(rule.value_ini || 0)}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                onPatch({ value_ini: numeric ? parseFloat((Number(numeric) / 100).toFixed(2)) : 0 });
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Valor até</label>
            <input
              type="text"
              className="input-field w-full"
              value={formatToBRL(rule.value_end || 0)}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '');
                onPatch({ value_end: numeric ? parseFloat((Number(numeric) / 100).toFixed(2)) : 0 });
              }}
            />
          </div>
        </div>
      </CriterionCard>

      {/* Prazo (dias até o vencimento) */}
      <CriterionCard
        icon={<Clock size={16} />}
        title="Prazo (dias até o vencimento)"
        description={`${copy.verbInf} quando o número de dias entre hoje e o vencimento estiver na faixa.`}
        enabled={enabled.prazo}
        onToggle={(next) =>
          toggle('prazo', next, {
            days_until_due_date_ini: rule.days_until_due_date_ini ?? 0,
            days_until_due_date_end: rule.days_until_due_date_end ?? 90,
          })
        }
      >
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">De (dias)</label>
            <input
              type="number"
              min={0}
              className="input-field w-full"
              value={rule.days_until_due_date_ini ?? ''}
              onChange={(e) =>
                onPatch({ days_until_due_date_ini: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Até (dias)</label>
            <input
              type="number"
              min={0}
              className="input-field w-full"
              value={rule.days_until_due_date_end ?? ''}
              onChange={(e) =>
                onPatch({ days_until_due_date_end: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </div>
        </div>
      </CriterionCard>

      {/* Data de emissão */}
      <CriterionCard
        icon={<CalendarClock size={16} />}
        title="Data de emissão"
        description="Restringir pela data em que a duplicata foi emitida."
        enabled={enabled.emissao}
        onToggle={(next) => toggle('emissao', next, { issue_date_mode: rule.issue_date_mode ?? 'range' })}
      >
        <ModeTabs
          mode={(rule.issue_date_mode as 'range' | 'relative') || 'range'}
          onChange={(mode) => onPatch({ issue_date_mode: mode })}
        />
        {(rule.issue_date_mode || 'range') === 'range' ? (
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Emitidas a partir de</label>
              <input
                type="date"
                className="input-field w-full"
                value={rule.issue_date_ini || ''}
                onChange={(e) => onPatch({ issue_date_ini: e.target.value || null })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Emitidas até</label>
              <input
                type="date"
                className="input-field w-full"
                value={rule.issue_date_end || ''}
                onChange={(e) => onPatch({ issue_date_end: e.target.value || null })}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Emitidas nos últimos</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                className="input-field w-28"
                value={rule.issue_date_rel_days ?? ''}
                onChange={(e) =>
                  onPatch({ issue_date_rel_days: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
              <span className="text-[13px] text-[#556B82]">dias (janela móvel a partir de hoje)</span>
            </div>
          </div>
        )}
      </CriterionCard>

      {/* Data de vencimento */}
      <CriterionCard
        icon={<CalendarCheck size={16} />}
        title="Data de vencimento"
        description="Restringir pela data de vencimento da duplicata."
        enabled={enabled.vencimento}
        onToggle={(next) => toggle('vencimento', next, { due_date_mode: rule.due_date_mode ?? 'range' })}
      >
        <ModeTabs
          mode={(rule.due_date_mode as 'range' | 'relative') || 'range'}
          onChange={(mode) => onPatch({ due_date_mode: mode })}
        />
        {(rule.due_date_mode || 'range') === 'range' ? (
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Vencendo a partir de</label>
              <input
                type="date"
                className="input-field w-full"
                value={rule.due_date_ini || ''}
                onChange={(e) => onPatch({ due_date_ini: e.target.value || null })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Vencendo até</label>
              <input
                type="date"
                className="input-field w-full"
                value={rule.due_date_end || ''}
                onChange={(e) => onPatch({ due_date_end: e.target.value || null })}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Vencendo nos próximos</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                className="input-field w-28"
                value={rule.due_date_rel_days ?? ''}
                onChange={(e) =>
                  onPatch({ due_date_rel_days: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
              <span className="text-[13px] text-[#556B82]">dias (janela móvel a partir de hoje)</span>
            </div>
          </div>
        )}
      </CriterionCard>

      {/* Divergência de valor — exclusivo de manifestação */}
      {context === 'manifestacao' && (
        <CriterionCard
          icon={<Scale size={16} />}
          title="Divergência de valor"
          description="Aplicar quando a diferença entre o valor da duplicata e o da nota fiscal/pedido estiver dentro da tolerância."
          enabled={enabled.divergencia}
          onToggle={(next) =>
            toggle('divergencia', next, {
              value_divergence_pct: rule.value_divergence_pct ?? 0,
              value_divergence_abs: rule.value_divergence_abs ?? null,
            })
          }
        >
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Tolerância (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input-field w-full pr-7"
                  value={rule.value_divergence_pct ?? ''}
                  onChange={(e) =>
                    onPatch({ value_divergence_pct: e.target.value === '' ? null : Number(e.target.value) })
                  }
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8A94A6]">
                  %
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1D2D3E]">Tolerância (R$)</label>
              <input
                type="text"
                className="input-field w-full"
                value={formatToBRL(rule.value_divergence_abs || 0)}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/\D/g, '');
                  onPatch({ value_divergence_abs: numeric ? parseFloat((Number(numeric) / 100).toFixed(2)) : null });
                }}
              />
            </div>
          </div>
          <p className="mt-2 text-[12px] leading-snug text-[#8A94A6]">
            Informe um ou ambos os limites. A divergência é aceita quando não ultrapassa nenhum dos valores preenchidos.
          </p>
        </CriterionCard>
      )}
    </div>
  );
}
