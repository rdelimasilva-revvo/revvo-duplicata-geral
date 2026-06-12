import { useState, type ReactNode } from 'react';
import {
  X,
  Check,
  Landmark,
  ShieldCheck,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Bell,
  FileCheck2,
  Send,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { BadgeVariant } from '@/components/ui';
import { BaixaModo, BaixaStatus, Liquidacao, LiquidacaoStatus, NegociacaoTipo } from './types';
import { formatBRL } from './format';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Props {
  liquidacao: Liquidacao;
  /** Modo de report da baixa configurado na tela (automático por padrão). */
  modoBaixa: BaixaModo;
  onClose: () => void;
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

const PRIMARY = '#0854a0';
const TODAY_ISO = '2026-06-12';

const STATUS_LABEL: Record<LiquidacaoStatus, string> = {
  a_liquidar: 'A liquidar',
  parcial: 'Parcial',
  liquidada: 'Liquidada',
  em_atraso: 'Em atraso',
};

const STATUS_VARIANT: Record<LiquidacaoStatus, BadgeVariant> = {
  a_liquidar: 'info',
  parcial: 'warning',
  liquidada: 'success',
  em_atraso: 'danger',
};

const NEGOCIACAO_LABEL: Record<NegociacaoTipo, string> = {
  cessao: 'Cessão',
  onus: 'Ônus',
};

const NEGOCIACAO_DESCRICAO: Record<NegociacaoTipo, string> = {
  cessao: 'O financiador comprou esta duplicata. O pagamento do cliente é devido a ele.',
  onus: 'Esta duplicata foi dada em garantia ao financiador, que recebe a liquidação.',
};

const BAIXA_LABEL: Record<BaixaStatus, string> = {
  pendente: 'Baixa pendente',
  reportada: 'Baixa reportada',
  confirmada: 'Baixa confirmada',
};

const BAIXA_VARIANT: Record<BaixaStatus, BadgeVariant> = {
  pendente: 'warning',
  reportada: 'info',
  confirmada: 'success',
};

type ModalKey = 'liquidar' | 'parcial' | 'notificar' | 'baixa' | null;

// ---------------------------------------------------------------------------
// Auxiliares
// ---------------------------------------------------------------------------

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value}</p>
    </div>
  );
}

// Cartão do liquidante (financiador que recebe o pagamento)
function LiquidanteCard({ l }: { l: Liquidacao }) {
  const isCessao = l.negociacao === 'cessao';
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div
        className="flex items-start gap-3 rounded-t-lg border-b border-gray-200 px-4 py-3"
        style={{ backgroundColor: '#eef4fb' }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          {isCessao ? <ArrowRightLeft size={18} /> : <ShieldCheck size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">
              {NEGOCIACAO_LABEL[l.negociacao]}
            </Badge>
            <span className="text-xs text-gray-500">registrado na {l.registradora}</span>
          </div>
          <p className="mt-1 text-xs leading-snug text-gray-600">
            {NEGOCIACAO_DESCRICAO[l.negociacao]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <Landmark size={18} className="shrink-0 text-gray-400" />
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Liquidante (financiador)</p>
          <p className="truncate text-sm font-medium text-gray-900">{l.liquidante}</p>
          <p className="text-xs text-gray-500">{l.liquidanteCnpj}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <Info label={isCessao ? 'Valor cedido' : 'Valor onerado'} value={formatBRL(l.valorCedido)} />
        <Info label="Registrado em" value={l.registradoEm} />
        <Info label="Contrato" value={l.contrato} />
        <Info label={`Protocolo ${l.registradora}`} value={l.protocoloCerc} />
      </div>
    </div>
  );
}

// Tracking da liquidação: cessão registrada → cliente notificado →
// aguardando pagamento → liquidada (ou em atraso).
function Tracking({ l, modoBaixa }: { l: Liquidacao; modoBaixa: BaixaModo }) {
  type StepState = 'done' | 'current' | 'pending' | 'paid' | 'late';
  const steps: { label: string; date?: string; hint?: string; state: StepState }[] = [];

  steps.push({
    label: `${NEGOCIACAO_LABEL[l.negociacao]} registrada`,
    date: l.registradoEm,
    state: 'done',
  });

  steps.push({
    label: 'Cliente notificado',
    date: l.notificadoEm,
    hint: l.clienteNotificado ? undefined : 'O cliente ainda não foi avisado de que deve pagar o liquidante.',
    state: l.clienteNotificado ? 'done' : 'current',
  });

  if (l.status === 'liquidada') {
    steps.push({ label: 'Aguardando pagamento do cliente', date: undefined, state: 'done' });
    steps.push({
      label: 'Liquidada pelo cliente',
      date: l.liquidadaEm,
      hint: 'O cliente pagou o liquidante integralmente.',
      state: 'paid',
    });
    // Após a liquidação, a baixa do efeito precisa ser reportada à registradora.
    const baixa = l.baixaRegistradora ?? 'pendente';
    steps.push({
      label:
        baixa === 'confirmada'
          ? `Baixa confirmada pela ${l.registradora}`
          : baixa === 'reportada'
            ? `Baixa reportada à ${l.registradora}`
            : `Baixa à ${l.registradora} pendente`,
      date: baixa === 'pendente' ? undefined : l.baixaReportadaEm,
      hint:
        baixa === 'confirmada'
          ? `Efeito encerrado na registradora${l.baixaModo ? ` (baixa ${l.baixaModo === 'manual' ? 'manual' : 'automática'})` : ''}.`
          : baixa === 'reportada'
            ? `Aguardando confirmação da registradora${l.baixaModo ? ` (baixa ${l.baixaModo === 'manual' ? 'manual' : 'automática'})` : ''}.`
            : modoBaixa === 'automatico'
              ? 'Será reportada automaticamente à registradora.'
              : 'Modo manual — reporte a baixa para encerrar o efeito.',
      state: baixa === 'confirmada' ? 'paid' : baixa === 'reportada' ? 'done' : 'current',
    });
  } else if (l.status === 'parcial') {
    steps.push({
      label: 'Pagamento parcial recebido',
      date: l.ultimoPagamentoEm,
      hint: `O liquidante recebeu ${formatBRL(l.valorLiquidado)} de ${formatBRL(l.valorCedido)}.`,
      state: 'current',
    });
    steps.push({ label: 'Liquidação total', date: undefined, state: 'pending' });
  } else if (l.status === 'em_atraso') {
    if (l.valorLiquidado > 0) {
      steps.push({
        label: 'Pagamento parcial recebido',
        date: l.ultimoPagamentoEm,
        hint: `Recebido ${formatBRL(l.valorLiquidado)} de ${formatBRL(l.valorCedido)}.`,
        state: 'done',
      });
    }
    steps.push({
      label: 'Pagamento em atraso',
      date: l.vencimento,
      hint: `Venceu há ${l.diasAtraso} dia${l.diasAtraso === 1 ? '' : 's'} sem liquidação total.`,
      state: 'late',
    });
  } else {
    steps.push({
      label: 'Aguardando pagamento do cliente',
      date: l.vencimento,
      hint: `Previsto para ${l.vencimento}.`,
      state: l.clienteNotificado ? 'current' : 'pending',
    });
    steps.push({ label: 'Liquidada pelo cliente', date: undefined, state: 'pending' });
  }

  const dot = (state: StepState) => {
    switch (state) {
      case 'done':
        return (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            <Check size={12} strokeWidth={3} />
          </span>
        );
      case 'paid':
        return (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        );
      case 'late':
        return (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
            <AlertTriangle size={11} strokeWidth={2.5} />
          </span>
        );
      case 'current':
        return (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white"
            style={{ borderColor: PRIMARY }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PRIMARY }} />
          </span>
        );
      default:
        return (
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-200 bg-white" />
        );
    }
  };

  return (
    <ol className="mt-1">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            {dot(s.state)}
            {i < steps.length - 1 && (
              <span className="my-1 w-px flex-1 bg-gray-200" style={{ minHeight: 24 }} />
            )}
          </div>
          <div className="-mt-0.5 pb-4">
            <p
              className={[
                'text-sm font-medium',
                s.state === 'pending' ? 'text-gray-400' : 'text-gray-900',
                s.state === 'paid' ? 'text-green-700' : '',
                s.state === 'late' ? 'text-red-700' : '',
              ].join(' ')}
            >
              {s.label}
            </p>
            {s.date && <p className="text-xs text-gray-500">{s.date}</p>}
            {s.hint && (
              <p
                className={[
                  'mt-0.5 text-xs',
                  s.state === 'late' ? 'text-red-600' : 'text-gray-500',
                ].join(' ')}
              >
                {s.hint}
              </p>
            )}
            {s.state === 'current' && !s.hint && (
              <p className="text-xs font-medium" style={{ color: PRIMARY }}>
                Em andamento
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Modal de ação — z acima do painel lateral.
function ActionModal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

const fieldCls =
  'w-full h-10 px-3 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function LiquidacaoPanel({ liquidacao, modoBaixa, onClose, showToast }: Props) {
  const l = liquidacao;
  const [modal, setModal] = useState<ModalKey>(null);

  const saldo = Math.max(0, l.valorCedido - l.valorLiquidado);
  const pct = l.valorCedido > 0 ? Math.min(100, Math.round((l.valorLiquidado / l.valorCedido) * 100)) : 0;
  const concluida = l.status === 'liquidada';

  const [pagamentoData, setPagamentoData] = useState(TODAY_ISO);
  const [pagamentoValor, setPagamentoValor] = useState(formatBRL(saldo));

  const concluir = (title: string, message: string) => {
    // stub — em produção dispararia a chamada de serviço correspondente
    console.log('[Liquidações] ação concluída:', title, '| liquidação', l.id);
    showToast('success', title, message);
    setModal(null);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <header className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs text-gray-500">Duplicata {l.duplicataNumero}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-gray-900">{l.cliente}</h2>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[l.status]} size="sm">
                {STATUS_LABEL[l.status]}
              </Badge>
              <Badge variant="neutral" size="sm">
                {NEGOCIACAO_LABEL[l.negociacao]}
              </Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>

        {/* Corpo */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {/* Aviso contextual */}
          {l.status === 'em_atraso' && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-red-400 bg-red-50 px-4 py-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Liquidação em atraso há {l.diasAtraso} dia{l.diasAtraso === 1 ? '' : 's'}
                </p>
                <p className="mt-0.5 text-sm text-red-700">
                  O cliente ainda não liquidou {formatBRL(saldo)} devidos a {l.liquidante}.
                </p>
              </div>
            </div>
          )}
          {l.status === 'liquidada' && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-green-400 bg-green-50 px-4 py-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" />
              <p className="text-sm text-green-800">
                O cliente pagou {l.liquidante} em {l.liquidadaEm}. Liquidação concluída.
              </p>
            </div>
          )}
          {!l.clienteNotificado && l.status !== 'liquidada' && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
              <Bell size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Cliente ainda não notificado</p>
                <p className="mt-0.5 text-sm text-amber-700">
                  Avise o cliente de que o pagamento deve ser feito ao liquidante.
                </p>
                <div className="mt-2">
                  <Button variant="secondary" size="sm" onClick={() => setModal('notificar')}>
                    Notificar cliente
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Conciliação */}
          <h3 className="mb-3 text-sm font-bold text-gray-900">Liquidação</h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Liquidado ao liquidante</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatBRL(l.valorLiquidado)}
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    de {formatBRL(l.valorCedido)}
                  </span>
                </p>
              </div>
              <span
                className={[
                  'text-sm font-semibold',
                  concluida ? 'text-green-600' : l.status === 'em_atraso' ? 'text-red-600' : 'text-gray-600',
                ].join(' ')}
              >
                {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={[
                  'h-full rounded-full transition-all',
                  concluida ? 'bg-green-500' : l.status === 'em_atraso' ? 'bg-red-500' : 'bg-[#0854a0]',
                ].join(' ')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-gray-100 pt-3">
              <Info label="Saldo a liquidar" value={formatBRL(saldo)} />
              <Info label="Previsto para" value={l.vencimento} />
              {l.ultimoPagamentoEm && <Info label="Último pagamento" value={l.ultimoPagamentoEm} />}
              {l.liquidadaEm && <Info label="Liquidada em" value={l.liquidadaEm} />}
            </div>
          </div>

          {/* Flag de baixa na registradora (após a liquidação) */}
          {concluida && (() => {
            const baixa = l.baixaRegistradora ?? 'pendente';
            const pendente = baixa === 'pendente';
            // Pendente + modo automático = aguardando o report automático (informativo);
            // pendente + modo manual = requer ação do operador (double check).
            const pendenteManual = pendente && modoBaixa === 'manual';
            const origem = l.baixaModo; // como já foi reportada (quando resolvida)
            return (
              <div
                className={cx(
                  'mt-3 flex items-center justify-between gap-3 rounded-lg border px-4 py-3',
                  pendenteManual
                    ? 'border-amber-300 bg-amber-50'
                    : pendente
                      ? 'border-blue-200 bg-[#eef4fb]'
                      : 'border-gray-200 bg-white',
                )}
              >
                <div className="flex items-start gap-3">
                  <FileCheck2
                    size={18}
                    className={cx(
                      'mt-0.5 shrink-0',
                      pendenteManual ? 'text-amber-600' : pendente ? 'text-[#0854a0]' : 'text-gray-400',
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Baixa na {l.registradora}</p>
                    <p
                      className={cx(
                        'mt-0.5 text-xs',
                        pendenteManual ? 'text-amber-700' : pendente ? 'text-[#0854a0]' : 'text-gray-500',
                      )}
                    >
                      {pendente
                        ? modoBaixa === 'automatico'
                          ? 'Será reportada automaticamente à registradora.'
                          : 'Modo manual — reporte a baixa para encerrar o efeito.'
                        : baixa === 'reportada'
                          ? `Reportada${origem ? ` (${origem === 'manual' ? 'manual' : 'automática'})` : ''} em ${l.baixaReportadaEm} — aguardando confirmação.`
                          : `Confirmada${origem ? ` (${origem === 'manual' ? 'manual' : 'automática'})` : ''} em ${l.baixaReportadaEm} — efeito encerrado.`}
                    </p>
                  </div>
                </div>
                {pendente ? (
                  <Button
                    variant={pendenteManual ? 'primary' : 'secondary'}
                    size="sm"
                    icon={<Send size={14} />}
                    onClick={() => setModal('baixa')}
                  >
                    {modoBaixa === 'automatico' ? 'Reportar agora' : 'Reportar baixa'}
                  </Button>
                ) : (
                  <Badge variant={BAIXA_VARIANT[baixa]} size="sm">
                    {BAIXA_LABEL[baixa]}
                  </Badge>
                )}
              </div>
            );
          })()}

          {/* Liquidante */}
          <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900">Quem recebe o pagamento</h3>
          <LiquidanteCard l={l} />

          {/* Dados da duplicata */}
          <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900">Dados da duplicata</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Info label="Cliente (sacado)" value={l.cliente} />
            <Info label="CNPJ" value={l.clienteCnpj} />
            <Info label="Valor da duplicata" value={formatBRL(l.valor)} />
            <Info label="Vencimento" value={l.vencimento} />
            <Info label="Parcela" value={l.parcela} />
            <Info label="Nota de origem" value={l.notaOrigem} />
            <Info label="Forma de pagamento" value={l.formaPagamento} />
            <Info label="Tipo" value={l.tipoDuplicata} />
          </div>

          {/* Tracking */}
          <h3 className="mb-2 mt-6 text-sm font-bold text-gray-900">Tracking da liquidação</h3>
          <Tracking l={l} modoBaixa={modoBaixa} />

          {/* Ações */}
          <h3 className="mb-3 mt-4 text-sm font-bold text-gray-900">O que você pode fazer</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={concluida}
              icon={<CheckCircle2 size={16} />}
              className="!justify-start"
              onClick={() => setModal('liquidar')}
            >
              {concluida ? 'Liquidação concluída' : 'Registrar liquidação total'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              disabled={concluida}
              icon={<Coins size={16} />}
              className="!justify-start"
              onClick={() => {
                setPagamentoValor(formatBRL(saldo));
                setModal('parcial');
              }}
            >
              Registrar pagamento parcial
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              disabled={l.clienteNotificado}
              icon={<Bell size={16} />}
              className="!justify-start"
              onClick={() => setModal('notificar')}
            >
              {l.clienteNotificado ? 'Cliente já notificado' : 'Notificar cliente'}
            </Button>
            {concluida && (l.baixaRegistradora ?? 'pendente') === 'pendente' && (
              <Button
                variant="secondary"
                size="md"
                fullWidth
                icon={<Send size={16} />}
                className="!justify-start"
                onClick={() => setModal('baixa')}
              >
                {modoBaixa === 'automatico'
                  ? `Reportar baixa agora (double check)`
                  : `Reportar baixa à ${l.registradora}`}
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              fullWidth
              icon={<FileCheck2 size={16} />}
              className="!justify-start"
              onClick={() => showToast('info', 'Comprovante de liquidação', 'O comprovante será disponibilizado em breve.')}
            >
              Ver comprovante de liquidação
            </Button>
          </div>
        </div>
      </aside>

      {/* ----------------------------- Modais ----------------------------- */}

      {modal === 'liquidar' && (
        <ActionModal
          title="Registrar liquidação total"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  concluir(
                    'Liquidação registrada',
                    `${formatBRL(saldo)} confirmados como pagos a ${l.liquidante}.`,
                  )
                }
              >
                Confirmar liquidação
              </Button>
            </>
          }
        >
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-gray-600">
              Confirme que o cliente <strong>{l.cliente}</strong> pagou o saldo de{' '}
              <strong>{formatBRL(saldo)}</strong> ao liquidante <strong>{l.liquidante}</strong>.
            </p>
            <div>
              <label className={labelCls}>Data do pagamento</label>
              <input
                type="date"
                className={fieldCls}
                value={pagamentoData}
                onChange={(e) => setPagamentoData(e.target.value)}
              />
            </div>
          </div>
        </ActionModal>
      )}

      {modal === 'parcial' && (
        <ActionModal
          title="Registrar pagamento parcial"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  concluir(
                    'Pagamento parcial registrado',
                    `Recebimento de ${pagamentoValor} lançado para ${l.liquidante}.`,
                  )
                }
              >
                Registrar pagamento
              </Button>
            </>
          }
        >
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className={labelCls}>Valor recebido</label>
              <input
                className={fieldCls}
                value={pagamentoValor}
                onChange={(e) => setPagamentoValor(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Saldo a liquidar: {formatBRL(saldo)}</p>
            </div>
            <div>
              <label className={labelCls}>Data do pagamento</label>
              <input
                type="date"
                className={fieldCls}
                value={pagamentoData}
                onChange={(e) => setPagamentoData(e.target.value)}
              />
            </div>
          </div>
        </ActionModal>
      )}

      {modal === 'notificar' && (
        <ActionModal
          title="Notificar cliente"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  concluir(
                    'Cliente notificado',
                    `${l.cliente} foi avisado de que o pagamento é devido a ${l.liquidante}.`,
                  )
                }
              >
                Enviar notificação
              </Button>
            </>
          }
        >
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-gray-600">
              Será enviado um aviso ao cliente <strong>{l.cliente}</strong> informando que esta
              duplicata foi {l.negociacao === 'cessao' ? 'cedida' : 'onerada'} e que o pagamento de{' '}
              <strong>{formatBRL(l.valorCedido)}</strong> deve ser feito a{' '}
              <strong>{l.liquidante}</strong>.
            </p>
          </div>
        </ActionModal>
      )}

      {modal === 'baixa' && (
        <ActionModal
          title={`Reportar baixa à ${l.registradora}`}
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  concluir(
                    'Baixa reportada',
                    `A baixa da duplicata ${l.duplicataNumero} foi enviada à ${l.registradora}.`,
                  )
                }
              >
                Reportar baixa
              </Button>
            </>
          }
        >
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            {modoBaixa === 'automatico' && (
              <div className="flex items-start gap-2 rounded-md border-l-4 border-blue-300 bg-[#eef4fb] px-3 py-2 text-xs text-[#0854a0]">
                <FileCheck2 size={14} className="mt-0.5 shrink-0" />
                <span>
                  O modo automático está ativo — esta baixa seria reportada sem intervenção. Use o
                  report manual abaixo apenas para double check.
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600">
              A liquidação foi concluída em <strong>{l.liquidadaEm}</strong>. Reporte a baixa do
              efeito de {l.negociacao === 'cessao' ? 'cessão' : 'ônus'} à{' '}
              <strong>{l.registradora}</strong> para encerrar o vínculo do título com{' '}
              <strong>{l.liquidante}</strong>.
            </p>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <p>Contrato: {l.contrato}</p>
              <p>Protocolo {l.registradora}: {l.protocoloCerc}</p>
            </div>
          </div>
        </ActionModal>
      )}
    </div>
  );
}

export default LiquidacaoPanel;
