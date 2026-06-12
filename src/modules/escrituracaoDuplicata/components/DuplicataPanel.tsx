import { useState, type ReactNode } from 'react';
import {
  X,
  Check,
  Lock,
  AlertCircle,
  Pencil,
  CreditCard,
  Paperclip,
  CheckCircle2,
  Ban,
  Landmark,
  ShieldCheck,
  ArrowRightLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import type { BadgeVariant } from '@/components/ui';
import { Button } from '@/components/ui';
import { CreditoVinculado, Duplicata, DuplicataStatus, EfeitoTipo } from '../types/duplicata';
import { formatBRL } from '../utils/format';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Props {
  duplicata: Duplicata;
  onClose: () => void;
  showToast: (type: ToastType, title: string, message?: string) => void;
  /** Abre direto o fluxo de resolver pendência (vindo do link "Resolver") */
  openResolve?: boolean;
}

const PRIMARY = '#0854a0';
const TODAY_ISO = '2026-06-12';

const STATUS_LABEL: Record<DuplicataStatus, string> = {
  ativa: 'Ativa',
  aguardando: 'Aguardando',
  negociada: 'Negociada',
  paga: 'Paga',
  cancelada: 'Cancelada',
};

const STATUS_VARIANT: Record<DuplicataStatus, BadgeVariant> = {
  ativa: 'info',
  aguardando: 'danger',
  negociada: 'neutral',
  paga: 'success',
  cancelada: 'neutral',
};

// Efeitos de crédito (cessão / ônus) registrados na CERC
const EFEITO_LABEL: Record<EfeitoTipo, string> = {
  cessao: 'Cessão',
  onus: 'Ônus',
};

const EFEITO_DESCRICAO: Record<EfeitoTipo, string> = {
  cessao: 'O financiador comprou esta duplicata. O pagamento é devido a ele.',
  onus: 'Esta duplicata está dada em garantia ao financiador.',
};

// Motivos de cancelamento em linguagem simples
const MOTIVOS_CANCELAMENTO = [
  'Cliente desistiu da compra',
  'Erro no cadastro da nota',
  'Duplicata lançada em duplicidade',
  'Valor incorreto',
  'Outro motivo',
];

type ModalKey =
  | 'editar'
  | 'forma'
  | 'pagar'
  | 'cancelar'
  | 'anexar'
  | 'resolver'
  | null;

// ---------------------------------------------------------------------------
// Permissões de ação por status (com motivo do bloqueio para o tooltip)
// ---------------------------------------------------------------------------

function bloqueioPorStatus(status: DuplicataStatus): string {
  switch (status) {
    case 'negociada':
      return 'Esta duplicata foi negociada e não pode ser alterada.';
    case 'paga':
      return 'Esta duplicata já foi paga e não pode mais ser alterada.';
    case 'cancelada':
      return 'Esta duplicata foi cancelada e não pode mais ser alterada.';
    case 'aguardando':
      return 'Resolva a pendência desta duplicata antes de continuar.';
    default:
      return '';
  }
}

interface Permissao {
  enabled: boolean;
  reason?: string;
}

function getPermissoes(d: Duplicata) {
  const s = d.status;
  const bloqueio = bloqueioPorStatus(s);

  const editar: Permissao =
    s === 'ativa' ? { enabled: true } : { enabled: false, reason: bloqueio };

  const forma: Permissao =
    s === 'ativa' ? { enabled: true } : { enabled: false, reason: bloqueio };

  const anexar: Permissao =
    s === 'ativa' || s === 'aguardando' || s === 'negociada'
      ? { enabled: true }
      : { enabled: false, reason: bloqueio };

  const pagar: Permissao =
    s === 'ativa' || s === 'negociada'
      ? { enabled: true }
      : {
          enabled: false,
          reason:
            s === 'paga'
              ? 'Esta duplicata já está paga.'
              : s === 'cancelada'
                ? 'Esta duplicata foi cancelada.'
                : bloqueio,
        };

  const cancelar: Permissao =
    s === 'paga' || s === 'cancelada'
      ? {
          enabled: false,
          reason:
            s === 'paga'
              ? 'Não é possível cancelar uma duplicata já paga.'
              : 'Esta duplicata já foi cancelada.',
        }
      : { enabled: true };

  return { editar, forma, anexar, pagar, cancelar };
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value}</p>
    </div>
  );
}

// Crédito vinculado: financiador + dados do efeito vindo da CERC
function CreditoVinculadoCard({ credito }: { credito: CreditoVinculado }) {
  const isCessao = credito.tipo === 'cessao';
  const registradora = credito.registradora ?? 'CERC';
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Faixa de identificação do efeito */}
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
              {EFEITO_LABEL[credito.tipo]}
            </Badge>
            <span className="text-xs text-gray-500">registrado na {registradora}</span>
          </div>
          <p className="mt-1 text-xs leading-snug text-gray-600">
            {EFEITO_DESCRICAO[credito.tipo]}
          </p>
        </div>
      </div>

      {/* Financiador */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <Landmark size={18} className="shrink-0 text-gray-400" />
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Financiador</p>
          <p className="truncate text-sm font-medium text-gray-900">{credito.financiador}</p>
          {credito.financiadorCnpj && (
            <p className="text-xs text-gray-500">{credito.financiadorCnpj}</p>
          )}
        </div>
      </div>

      {/* Dados do efeito vindos da CERC */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <Info
          label={isCessao ? 'Valor cedido' : 'Valor onerado'}
          value={formatBRL(credito.valorEfeito)}
        />
        <Info label="Registrado em" value={credito.registradoEm} />
        {credito.contrato && <Info label="Contrato" value={credito.contrato} />}
        {credito.protocoloCerc && (
          <Info label={`Protocolo ${registradora}`} value={credito.protocoloCerc} />
        )}
        {credito.validade && <Info label="Validade do efeito" value={credito.validade} />}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  permissao,
  variant = 'secondary',
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  permissao: Permissao;
  variant?: 'primary' | 'secondary';
}) {
  const disabled = !permissao.enabled;
  return (
    <div className="group relative">
      <Button
        variant={variant}
        size="md"
        fullWidth
        disabled={disabled}
        onClick={onClick}
        icon={icon}
        className="!justify-start"
      >
        {label}
      </Button>
      {disabled && permissao.reason && (
        <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-max max-w-[260px] rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {permissao.reason}
        </span>
      )}
    </div>
  );
}

// Linha do tempo: Criada → Registrada → [Negociada] → Paga (ou Cancelada)
function Timeline({ d }: { d: Duplicata }) {
  type StepState = 'done' | 'current' | 'pending' | 'paid' | 'canceled';
  const steps: { label: string; date?: string; state: StepState }[] = [];

  steps.push({
    label: 'Criada',
    date: d.criadaEm,
    state: d.criadaEm ? 'done' : 'pending',
  });

  if (d.status === 'cancelada') {
    steps.push({
      label: 'Registrada',
      date: d.registradaEm,
      state: d.registradaEm ? 'done' : 'pending',
    });
    steps.push({ label: 'Cancelada', date: d.canceladaEm, state: 'canceled' });
  } else {
    steps.push({
      label: 'Registrada',
      date: d.registradaEm,
      state: d.registradaEm
        ? 'done'
        : d.status === 'aguardando'
          ? 'current'
          : 'pending',
    });
    if (d.status === 'negociada' || d.negociadaEm) {
      steps.push({
        label: 'Negociada',
        date: d.negociadaEm,
        state: d.negociadaEm ? 'done' : 'pending',
      });
    }
    steps.push({
      label: 'Paga',
      date: d.pagaEm,
      state: d.pagaEm ? 'paid' : 'pending',
    });
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
      case 'canceled':
        return (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
            <X size={12} strokeWidth={3} />
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
              <span className="my-1 w-px flex-1 bg-gray-200" style={{ minHeight: 22 }} />
            )}
          </div>
          <div className="-mt-0.5 pb-4">
            <p
              className={[
                'text-sm font-medium',
                s.state === 'pending' ? 'text-gray-400' : 'text-gray-900',
                s.state === 'paid' ? 'text-green-700' : '',
                s.state === 'canceled' ? 'text-red-700' : '',
              ].join(' ')}
            >
              {s.label}
            </p>
            {s.date && <p className="text-xs text-gray-500">{s.date}</p>}
            {s.state === 'current' && (
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

// Modal de ação — mesma identidade do componente Modal canônico (components/ui),
// porém com z acima do painel lateral.
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

// Define o campo do "Resolver pendência" conforme o motivo (linguagem simples)
interface CampoResolucao {
  label: string;
  placeholder?: string;
  type?: 'text' | 'email';
  select?: string[];
}

function campoResolucao(motivo?: string): CampoResolucao {
  const m = (motivo || '').toLowerCase();
  if (m.includes('e-mail') || m.includes('email')) {
    return { label: 'E-mail do cliente', placeholder: 'cliente@empresa.com.br', type: 'email' };
  }
  if (m.includes('cnpj') || m.includes('cpf')) {
    return { label: 'CNPJ ou CPF do cliente', placeholder: '00.000.000/0000-00', type: 'text' };
  }
  if (m.includes('forma de pagamento')) {
    return { label: 'Forma de pagamento', select: ['Boleto', 'Pix', 'Transferência'] };
  }
  return { label: 'Informação necessária', placeholder: 'Preencha a informação', type: 'text' };
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function DuplicataPanel({ duplicata, onClose, showToast, openResolve }: Props) {
  const d = duplicata;
  const perms = getPermissoes(d);
  const [modal, setModal] = useState<ModalKey>(openResolve ? 'resolver' : null);

  // estados dos formulários
  const [editValor, setEditValor] = useState(formatBRL(d.valor));
  const [editVenc, setEditVenc] = useState('');
  const [formaPgto, setFormaPgto] = useState(d.formaPagamento);
  const [pagarTipo, setPagarTipo] = useState<'total' | 'parcial'>('total');
  const [pagarValor, setPagarValor] = useState(formatBRL(d.valor));
  const [pagarData, setPagarData] = useState(TODAY_ISO);
  const [motivoCancel, setMotivoCancel] = useState('');
  const [resolucao, setResolucao] = useState('');

  const concluir = (title: string, message: string) => {
    // stub — em produção dispararia a chamada de serviço correspondente
    console.log('[Duplicatas] ação concluída:', title, '| duplicata', d.id);
    showToast('success', title, message);
    setModal(null);
  };

  const campo = campoResolucao(d.motivoPendencia);

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <header className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs text-gray-500">Duplicata {d.numero}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-gray-900">{d.cliente}</h2>
            <div className="mt-2">
              <Badge variant={STATUS_VARIANT[d.status]} size="sm">
                {STATUS_LABEL[d.status]}
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
          {/* Aviso de pendência */}
          {d.status === 'aguardando' && d.motivoPendencia && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-red-400 bg-red-50 px-4 py-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Esta duplicata está aguardando para ser registrada
                </p>
                <p className="mt-0.5 text-sm text-red-700">{d.motivoPendencia}</p>
                <div className="mt-2">
                  <Button variant="danger" size="sm" onClick={() => setModal('resolver')}>
                    Resolver pendência
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Aviso de negociada */}
          {d.status === 'negociada' && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 px-4 py-3">
              <Lock size={18} className="mt-0.5 shrink-0 text-gray-500" />
              <p className="text-sm text-gray-600">
                Duplicata negociada — alterações bloqueadas.
              </p>
            </div>
          )}

          {/* Aviso de cancelada */}
          {d.status === 'cancelada' && d.motivoCancelamento && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 px-4 py-3">
              <Ban size={18} className="mt-0.5 shrink-0 text-gray-500" />
              <p className="text-sm text-gray-600">
                Duplicata cancelada — motivo: {d.motivoCancelamento}.
              </p>
            </div>
          )}

          {/* Dados principais */}
          <h3 className="mb-3 text-sm font-bold text-gray-900">Dados principais</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Info label="Cliente" value={d.cliente} />
            <Info label="Valor" value={formatBRL(d.valor)} />
            <Info label="Vencimento" value={d.vencimento} />
            <Info label="Parcela" value={d.parcela} />
            <Info label="Nota de origem" value={d.notaOrigem} />
            <Info label="Forma de pagamento" value={d.formaPagamento} />
            <Info
              label="Origem"
              value={d.origem === 'automatica' ? 'Automática' : 'Manual'}
            />
          </div>

          {/* Crédito vinculado (cessão ou ônus) — financiador + efeito da CERC */}
          {d.creditoVinculado && (
            <>
              <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900">Crédito vinculado</h3>
              <CreditoVinculadoCard credito={d.creditoVinculado} />
            </>
          )}

          {/* Linha do tempo */}
          <h3 className="mb-2 mt-6 text-sm font-bold text-gray-900">Linha do tempo</h3>
          <Timeline d={d} />

          {/* Ações */}
          <h3 className="mb-3 mt-4 text-sm font-bold text-gray-900">
            O que você pode fazer
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <ActionButton
              icon={<Pencil size={16} />}
              label="Editar valor ou vencimento"
              permissao={perms.editar}
              onClick={() => setModal('editar')}
            />
            <ActionButton
              icon={<Paperclip size={16} />}
              label="Anexar nota fiscal"
              permissao={perms.anexar}
              onClick={() => setModal('anexar')}
            />
            <ActionButton
              icon={<CreditCard size={16} />}
              label="Alterar forma de pagamento"
              permissao={perms.forma}
              onClick={() => setModal('forma')}
            />
            <ActionButton
              icon={<CheckCircle2 size={16} />}
              label="Marcar como paga"
              permissao={perms.pagar}
              variant="primary"
              onClick={() => setModal('pagar')}
            />
            <ActionButton
              icon={<Ban size={16} />}
              label="Cancelar duplicata"
              permissao={perms.cancelar}
              onClick={() => setModal('cancelar')}
            />
          </div>
        </div>
      </aside>

      {/* ----------------------------- Modais ----------------------------- */}

      {modal === 'editar' && (
        <ActionModal
          title="Editar valor ou vencimento"
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
                    'Vencimento atualizado',
                    'A alteração será registrada no próximo envio.',
                  )
                }
              >
                Salvar alterações
              </Button>
            </>
          }
        >
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className={labelCls}>Valor</label>
              <input
                className={fieldCls}
                value={editValor}
                onChange={(e) => setEditValor(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Novo vencimento</label>
              <input
                type="date"
                className={fieldCls}
                value={editVenc}
                onChange={(e) => setEditVenc(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Vencimento atual: {d.vencimento}</p>
            </div>
          </div>
        </ActionModal>
      )}

      {modal === 'forma' && (
        <ActionModal
          title="Alterar forma de pagamento"
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
                    'Forma de pagamento atualizada',
                    'A alteração será registrada no próximo envio.',
                  )
                }
              >
                Salvar
              </Button>
            </>
          }
        >
          <div onClick={(e) => e.stopPropagation()}>
            <label className={labelCls}>Forma de pagamento</label>
            <select
              className={fieldCls}
              value={formaPgto}
              onChange={(e) => setFormaPgto(e.target.value)}
            >
              <option value="Boleto">Boleto</option>
              <option value="Pix">Pix</option>
              <option value="Transferência">Transferência</option>
            </select>
          </div>
        </ActionModal>
      )}

      {modal === 'pagar' && (
        <ActionModal
          title="Marcar como paga"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  concluir('Pagamento registrado', 'A baixa será registrada no próximo envio.')
                }
              >
                Confirmar pagamento
              </Button>
            </>
          }
        >
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className={labelCls}>Data do pagamento</label>
              <input
                type="date"
                className={fieldCls}
                value={pagarData}
                onChange={(e) => setPagarData(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Tipo de pagamento</label>
              <div className="flex gap-4 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="pagarTipo"
                    className="text-blue-600 focus:ring-blue-500"
                    checked={pagarTipo === 'total'}
                    onChange={() => {
                      setPagarTipo('total');
                      setPagarValor(formatBRL(d.valor));
                    }}
                  />
                  Pagamento total
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="pagarTipo"
                    className="text-blue-600 focus:ring-blue-500"
                    checked={pagarTipo === 'parcial'}
                    onChange={() => setPagarTipo('parcial')}
                  />
                  Pagamento parcial
                </label>
              </div>
            </div>
            <div>
              <label className={labelCls}>Valor pago</label>
              <input
                className={`${fieldCls} ${pagarTipo === 'total' ? 'bg-gray-50 text-gray-500' : ''}`}
                value={pagarValor}
                disabled={pagarTipo === 'total'}
                onChange={(e) => setPagarValor(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Valor da duplicata: {formatBRL(d.valor)}
              </p>
            </div>
          </div>
        </ActionModal>
      )}

      {modal === 'cancelar' && (
        <ActionModal
          title="Cancelar duplicata"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Voltar
              </Button>
              <Button
                variant="danger"
                disabled={!motivoCancel}
                onClick={() =>
                  concluir(
                    'Duplicata cancelada',
                    'O cancelamento será registrado no próximo envio.',
                  )
                }
              >
                Confirmar cancelamento
              </Button>
            </>
          }
        >
          <div onClick={(e) => e.stopPropagation()}>
            <label className={labelCls}>Por que está cancelando?</label>
            <select
              className={fieldCls}
              value={motivoCancel}
              onChange={(e) => setMotivoCancel(e.target.value)}
            >
              <option value="">Selecione o motivo</option>
              {MOTIVOS_CANCELAMENTO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="mt-4 text-sm text-gray-500">
              Esta ação não pode ser desfeita. A duplicata deixará de ser cobrada.
            </p>
          </div>
        </ActionModal>
      )}

      {modal === 'anexar' && (
        <ActionModal
          title="Anexar nota fiscal"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  concluir('Nota fiscal anexada', 'O arquivo foi vinculado a esta duplicata.')
                }
              >
                Anexar
              </Button>
            </>
          }
        >
          <div onClick={(e) => e.stopPropagation()}>
            <label className={labelCls}>Selecione o arquivo (PDF ou XML)</label>
            <input
              type="file"
              accept=".pdf,.xml"
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#0854a0] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#0a6ed1]"
            />
            <p className="mt-3 text-xs text-gray-500">Nota de origem atual: {d.notaOrigem}</p>
          </div>
        </ActionModal>
      )}

      {modal === 'resolver' && (
        <ActionModal
          title="Resolver pendência"
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
                    'Pendência resolvida',
                    'A duplicata será enviada para registro no próximo envio.',
                  )
                }
              >
                Salvar e enviar
              </Button>
            </>
          }
        >
          <div onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start gap-2 rounded-md border-l-4 border-red-400 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {d.motivoPendencia}
            </div>
            <label className={labelCls}>{campo.label}</label>
            {campo.select ? (
              <select
                className={fieldCls}
                value={resolucao}
                onChange={(e) => setResolucao(e.target.value)}
              >
                <option value="">Selecione</option>
                {campo.select.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={campo.type ?? 'text'}
                className={fieldCls}
                placeholder={campo.placeholder}
                value={resolucao}
                onChange={(e) => setResolucao(e.target.value)}
              />
            )}
          </div>
        </ActionModal>
      )}
    </div>
  );
}

export default DuplicataPanel;
