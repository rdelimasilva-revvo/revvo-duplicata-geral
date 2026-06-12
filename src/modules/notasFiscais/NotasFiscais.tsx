import { useMemo, useState, type ReactNode } from 'react';
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  X,
  FileText,
  Send,
  Mail,
  CalendarDays,
  Coins,
  Building2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSacador } from '@/context/SacadorContext';
import { formatCNPJ } from '@/utils/formatters';
import { Button } from '@/components/ui';
import { mockNotasFiscais } from './mockData';
import {
  FormaPagamento,
  NotaFiscal,
  PendenciaTipo,
} from './types';
import {
  estaPronta,
  formatBRL,
  fromISO,
  getPendencia,
  somaParcelas,
  toISO,
} from './utils';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

const FORMAS: FormaPagamento[] = ['Boleto', 'PIX', 'Transferência'];

const inputCls =
  'w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// dd/mm/aaaa -> aaaa-mm-dd só para comparar no filtro de período
const dataParaISO = (v: string | null) => toISO(v);

function NotasFiscais() {
  const { showToast } = useToast();
  const { sacadorAtivo } = useSacador();

  const [notas, setNotas] = useState<NotaFiscal[]>(mockNotasFiscais);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [enviandoIds, setEnviandoIds] = useState<Set<string>>(new Set());
  const [showEnviadas, setShowEnviadas] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [periodoDe, setPeriodoDe] = useState('');
  const [periodoAte, setPeriodoAte] = useState('');

  const [resolver, setResolver] = useState<{ notaId: string; tipo: PendenciaTipo } | null>(null);
  const [detalhe, setDetalhe] = useState<string | null>(null);
  const [confirmarIds, setConfirmarIds] = useState<string[] | null>(null);

  const clientes = useMemo(
    () =>
      Array.from(
        new Set(
          mockNotasFiscais
            .filter((n) => !sacadorAtivo || n.sacadorId === sacadorAtivo.id)
            .map((n) => n.cliente),
        ),
      ).sort(),
    [sacadorAtivo],
  );

  // Filtro por sacador ativo, período (emissão), cliente e busca livre (número ou cliente).
  const filtradas = useMemo(() => {
    return notas.filter((n) => {
      if (sacadorAtivo && n.sacadorId !== sacadorAtivo.id) return false;
      if (clienteFiltro && n.cliente !== clienteFiltro) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!n.numero.toLowerCase().includes(q) && !n.cliente.toLowerCase().includes(q))
          return false;
      }
      const emissaoISO = dataParaISO(n.emissao);
      if (periodoDe && emissaoISO < periodoDe) return false;
      if (periodoAte && emissaoISO > periodoAte) return false;
      return true;
    });
  }, [notas, sacadorAtivo, clienteFiltro, busca, periodoDe, periodoAte]);

  // Notas que aparecem na tabela: enviadas ficam ocultas por padrão.
  const visiveis = useMemo(
    () => filtradas.filter((n) => showEnviadas || !n.enviada),
    [filtradas, showEnviadas],
  );

  // Resumo: conta apenas as não enviadas do recorte atual.
  const resumo = useMemo(() => {
    const naoEnviadas = filtradas.filter((n) => !n.enviada);
    const prontas = naoEnviadas.filter((n) => estaPronta(n)).length;
    const faltando = naoEnviadas.length - prontas;
    return { paraRegistrar: naoEnviadas.length, prontas, faltando };
  }, [filtradas]);

  const prontasVisiveis = useMemo(
    () => visiveis.filter((n) => estaPronta(n)),
    [visiveis],
  );
  const todasProntasMarcadas =
    prontasVisiveis.length > 0 && prontasVisiveis.every((n) => selectedIds.has(n.id));

  const marcarTodasProntas = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (todasProntasMarcadas) prontasVisiveis.forEach((n) => next.delete(n.id));
      else prontasVisiveis.forEach((n) => next.add(n.id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selecionadas = useMemo(
    () => notas.filter((n) => selectedIds.has(n.id)),
    [notas, selectedIds],
  );
  const totalSelecionado = selecionadas.reduce((acc, n) => acc + n.valor, 0);

  // Resolver pendência: atualiza a nota; o aviso some e o checkbox habilita na hora.
  const salvarResolucao = (notaId: string, patch: Partial<NotaFiscal>) => {
    setNotas((prev) => prev.map((n) => (n.id === notaId ? { ...n, ...patch } : n)));
    setResolver(null);
  };

  // Confirmar envio (selecionadas ou individual).
  const confirmarEnvio = (
    ids: string[],
    drafts: Record<string, { parcelas: number[]; forma: FormaPagamento }>,
  ) => {
    console.log('[NotasFiscais] registrar notas', ids, drafts);

    // Aplica edições de parcelas/forma e marca como "enviando".
    setNotas((prev) =>
      prev.map((n) => {
        const d = drafts[n.id];
        if (!d) return n;
        return {
          ...n,
          formaPagamento: d.forma,
          parcelas: n.parcelas.map((p, i) => ({ ...p, valor: d.parcelas[i] ?? p.valor })),
        };
      }),
    );
    setEnviandoIds(new Set(ids));
    setConfirmarIds(null);
    setSelectedIds(new Set());

    // Stub de envio: depois de um instante, as notas somem da lista (viram enviadas).
    setTimeout(() => {
      setNotas((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, enviada: true } : n)));
      setEnviandoIds(new Set());
      showToast(
        'success',
        `${ids.length} ${ids.length === 1 ? 'nota enviada.' : 'notas enviadas.'}`,
        'Acompanhe no Início.',
      );
    }, 1200);
  };

  const limparFiltros = () => {
    setBusca('');
    setClienteFiltro('');
    setPeriodoDe('');
    setPeriodoAte('');
  };

  const temFiltro = busca || clienteFiltro || periodoDe || periodoAte;

  return (
    <div className="min-h-full bg-gray-100">
      <div className="w-full p-4 md:p-6 pb-28">
        {/* 1. Topo: título + emissor (mesmo sacador selecionado em Início) */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Notas Fiscais</h1>
          <p className="mt-1 text-sm text-gray-500">
            Veja quais notas ainda não viraram duplicata e registre as que estão prontas.
          </p>
          {sacadorAtivo && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
              <Building2 className="h-4 w-4 shrink-0 text-[#0854a0]" />
              <span className="text-xs font-medium text-gray-500">Emissor</span>
              <span className="font-medium text-gray-900">{sacadorAtivo.razaoSocial}</span>
              <span className="text-gray-500">· {formatCNPJ(sacadorAtivo.cnpj)}</span>
            </div>
          )}
        </div>

        {/* Busca rápida */}
        <div className="mb-4 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número da nota ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={cx(inputCls, 'h-11 pl-10')}
          />
        </div>

        {/* Filtros (período, cliente) */}
        <div className="mb-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cx(
              'flex w-full items-center justify-between bg-white px-6 py-4 transition-colors hover:bg-gray-50',
              !filtersOpen && 'rounded-lg',
            )}
          >
            <span className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-700" />
              <span className="text-base font-semibold text-gray-900">Filtros</span>
            </span>
            {filtersOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-700" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-700" />
            )}
          </button>

          {filtersOpen && (
            <div className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Período (de)">
                  <input
                    type="date"
                    value={periodoDe}
                    onChange={(e) => setPeriodoDe(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Período (até)">
                  <input
                    type="date"
                    value={periodoAte}
                    onChange={(e) => setPeriodoAte(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Cliente">
                  <select
                    value={clienteFiltro}
                    onChange={(e) => setClienteFiltro(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Todos os clientes</option>
                    {clientes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" size="md" onClick={limparFiltros} disabled={!temFiltro}>
                  Limpar
                </Button>
                <Button variant="primary" size="md" onClick={() => setFiltersOpen(false)}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Linha de resumo + toggle "Mostrar enviadas" */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{resumo.paraRegistrar}</span> notas para
            registrar
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="font-semibold text-gray-900">{resumo.prontas}</span> prontas
            <span className="mx-1.5 text-gray-300">·</span>
            <span className={cx('font-semibold', resumo.faltando > 0 ? 'text-amber-700' : 'text-gray-900')}>
              {resumo.faltando}
            </span>{' '}
            faltando dados
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#0854a0] focus:ring-[#0854a0]"
              checked={showEnviadas}
              onChange={(e) => setShowEnviadas(e.target.checked)}
            />
            Mostrar enviadas
          </label>
        </div>

        {/* 3. Tabela */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-600">
                  <th className="px-4 py-2.5">
                    <label className="flex cursor-pointer items-center gap-2" title="Marcar todas as prontas">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#0854a0] focus:ring-[#0854a0]"
                        checked={todasProntasMarcadas}
                        onChange={marcarTodasProntas}
                        disabled={prontasVisiveis.length === 0}
                        aria-label="Marcar todas as prontas"
                      />
                      <span className="font-normal text-gray-500">todas prontas</span>
                    </label>
                  </th>
                  <th className="px-4 py-2.5">Nota</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Valor</th>
                  <th className="px-4 py-2.5">Parcelas</th>
                  <th className="px-4 py-2.5">Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      Nenhuma nota encontrada.
                    </td>
                  </tr>
                ) : (
                  visiveis.map((n) => {
                    const enviando = enviandoIds.has(n.id);
                    const pendencia = getPendencia(n);
                    const pronta = !n.enviada && !pendencia;

                    if (n.enviada) {
                      // Linha esmaecida, sem checkbox.
                      return (
                        <tr key={n.id} className="border-b border-gray-200 bg-gray-50/40 text-gray-400">
                          <td className="px-4 py-3">
                            <span className="text-xs italic">enviada</span>
                          </td>
                          <td className="px-4 py-3">{n.numero}</td>
                          <td className="px-4 py-3">{n.cliente}</td>
                          <td className="px-4 py-3">{formatBRL(n.valor)}</td>
                          <td className="px-4 py-3">{n.parcelas.length}x</td>
                          <td className="px-4 py-3">{n.vencimento ?? '—'}</td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={n.id}
                        onClick={() => !enviando && setDetalhe(n.id)}
                        className={cx(
                          'border-b border-gray-200',
                          enviando ? 'opacity-60' : 'cursor-pointer hover:bg-gray-50',
                        )}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-[#0854a0] focus:ring-[#0854a0] disabled:cursor-not-allowed"
                            checked={selectedIds.has(n.id)}
                            onChange={() => toggleOne(n.id)}
                            disabled={!pronta || enviando}
                            aria-label={`Selecionar ${n.numero}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{n.numero}</td>
                        <td className="px-4 py-3 text-gray-900">
                          <div className="flex flex-col gap-1">
                            <span>{n.cliente}</span>
                            {enviando && (
                              <span className="flex items-center gap-1 text-xs font-medium text-[#0854a0]">
                                <Send className="h-3 w-3 animate-pulse" />
                                Enviando...
                              </span>
                            )}
                            {!enviando && pendencia && (
                              <span className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  {pendencia.aviso}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setResolver({ notaId: n.id, tipo: pendencia.tipo });
                                  }}
                                  className="text-xs font-semibold text-[#0854a0] hover:underline"
                                >
                                  Resolver
                                </button>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{formatBRL(n.valor)}</td>
                        <td className="px-4 py-3 text-gray-700">{n.parcelas.length}x</td>
                        <td className="px-4 py-3 text-gray-700">{n.vencimento ?? '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Barra de seleção fixa no rodapé */}
      {selecionadas.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex w-full items-center justify-between gap-4 px-6 py-3">
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{selecionadas.length}</span>{' '}
              {selecionadas.length === 1 ? 'nota' : 'notas'}
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="font-semibold text-gray-900">{formatBRL(totalSelecionado)}</span>
            </span>
            <Button
              variant="primary"
              size="md"
              icon={<Send size={16} />}
              onClick={() => setConfirmarIds([...selectedIds])}
            >
              Registrar selecionadas
            </Button>
          </div>
        </div>
      )}

      {/* Modal inline para resolver pendência */}
      {resolver && (
        <ResolverModal
          nota={notas.find((n) => n.id === resolver.notaId)!}
          tipo={resolver.tipo}
          onClose={() => setResolver(null)}
          onSave={(patch) => salvarResolucao(resolver.notaId, patch)}
        />
      )}

      {/* 6. Painel de detalhe da nota */}
      {detalhe && (
        <DetalheNotaPanel
          nota={notas.find((n) => n.id === detalhe)!}
          onClose={() => setDetalhe(null)}
          onRegistrar={() => {
            setConfirmarIds([detalhe]);
            setDetalhe(null);
          }}
          onResolver={(tipo) => {
            setResolver({ notaId: detalhe, tipo });
            setDetalhe(null);
          }}
        />
      )}

      {/* 5. Painel de confirmação */}
      {confirmarIds && (
        <ConfirmarPanel
          notas={notas.filter((n) => confirmarIds.includes(n.id))}
          onClose={() => setConfirmarIds(null)}
          onConfirm={(drafts) => confirmarEnvio(confirmarIds, drafts)}
        />
      )}
    </div>
  );
}

/* ------------------------------ Subcomponentes ------------------------------ */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function SlideOver({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-gray-200 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

const RESOLVER_INFO: Record<
  PendenciaTipo,
  { titulo: string; descricao: string; icon: ReactNode }
> = {
  email: {
    titulo: 'Adicionar e-mail do cliente',
    descricao: 'Informe o e-mail para onde o cliente vai receber a cobrança.',
    icon: <Mail className="h-5 w-5 text-amber-600" />,
  },
  vencimento: {
    titulo: 'Informar a data de vencimento',
    descricao: 'A data de vencimento precisa ser depois da data de emissão.',
    icon: <CalendarDays className="h-5 w-5 text-amber-600" />,
  },
  parcelas: {
    titulo: 'Ajustar as parcelas',
    descricao: 'A soma das parcelas não pode passar do valor da nota.',
    icon: <Coins className="h-5 w-5 text-amber-600" />,
  },
};

function ResolverModal({
  nota,
  tipo,
  onClose,
  onSave,
}: {
  nota: NotaFiscal;
  tipo: PendenciaTipo;
  onClose: () => void;
  onSave: (patch: Partial<NotaFiscal>) => void;
}) {
  const info = RESOLVER_INFO[tipo];

  const [email, setEmail] = useState(nota.clienteEmail ?? '');
  const [venc, setVenc] = useState(toISO(nota.vencimento));
  const [parcelas, setParcelas] = useState<number[]>(nota.parcelas.map((p) => p.valor));

  const somaP = parcelas.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const emailOk = /\S+@\S+\.\S+/.test(email.trim());
  const vencOk = !!venc && (!nota.emissao || venc > toISO(nota.emissao));
  const parcelasOk = somaP <= nota.valor + 0.005;

  const podeSalvar =
    (tipo === 'email' && emailOk) ||
    (tipo === 'vencimento' && vencOk) ||
    (tipo === 'parcelas' && parcelasOk);

  const salvar = () => {
    if (tipo === 'email') onSave({ clienteEmail: email.trim() });
    if (tipo === 'vencimento') onSave({ vencimento: fromISO(venc) });
    if (tipo === 'parcelas')
      onSave({ parcelas: nota.parcelas.map((p, i) => ({ ...p, valor: parcelas[i] })) });
  };

  return (
    <Overlay onClose={onClose}>
      <div className="w-[420px] max-w-[92vw] rounded-lg bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
          <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
            {info.icon}
          </span>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{info.titulo}</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {nota.numero} · {nota.cliente}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="mb-3 text-sm text-gray-600">{info.descricao}</p>

          {tipo === 'email' && (
            <Field label="E-mail do cliente">
              <input
                type="email"
                autoFocus
                placeholder="nome@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </Field>
          )}

          {tipo === 'vencimento' && (
            <Field label="Data de vencimento">
              <input
                type="date"
                autoFocus
                value={venc}
                min={toISO(nota.emissao)}
                onChange={(e) => setVenc(e.target.value)}
                className={inputCls}
              />
            </Field>
          )}

          {tipo === 'parcelas' && (
            <div>
              <p className="mb-2 text-xs text-gray-500">
                Valor da nota: <span className="font-semibold text-gray-700">{formatBRL(nota.valor)}</span>
              </p>
              <div className="flex flex-col gap-2">
                {parcelas.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-gray-600">Parcela {i + 1}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={v}
                      onChange={(e) => {
                        const next = [...parcelas];
                        next[i] = parseFloat(e.target.value) || 0;
                        setParcelas(next);
                      }}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
              <p
                className={cx(
                  'mt-2 text-xs',
                  parcelasOk ? 'text-gray-500' : 'font-medium text-amber-700',
                )}
              >
                Soma das parcelas: {formatBRL(somaP)}
                {!parcelasOk && ' — acima do valor da nota'}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" disabled={!podeSalvar} onClick={salvar}>
            Salvar
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

function DetalheNotaPanel({
  nota,
  onClose,
  onRegistrar,
  onResolver,
}: {
  nota: NotaFiscal;
  onClose: () => void;
  onRegistrar: () => void;
  onResolver: (tipo: PendenciaTipo) => void;
}) {
  const pendencia = getPendencia(nota);
  const pronta = estaPronta(nota);

  return (
    <SlideOver
      title="Detalhe da nota"
      onClose={onClose}
      footer={
        pronta ? (
          <Button variant="primary" size="md" fullWidth icon={<Send size={16} />} onClick={onRegistrar}>
            Registrar esta nota
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => pendencia && onResolver(pendencia.tipo)}
          >
            Resolver: {pendencia?.aviso}
          </Button>
        )
      }
    >
      <div className="flex items-center gap-2 text-gray-900">
        <FileText className="h-5 w-5 text-[#0854a0]" />
        <span className="text-lg font-semibold">{nota.numero}</span>
      </div>

      {pendencia && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          {pendencia.aviso}
        </div>
      )}

      <dl className="mt-4 space-y-3 text-sm">
        <Linha label="Cliente" valor={nota.cliente} />
        <Linha label="E-mail" valor={nota.clienteEmail ?? '— não cadastrado'} />
        <Linha label="Valor" valor={formatBRL(nota.valor)} />
        <Linha label="Emissão" valor={nota.emissao} />
        <Linha label="Vencimento" valor={nota.vencimento ?? '— não informado'} />
        <Linha label="Forma de pagamento" valor={nota.formaPagamento} />
      </dl>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Parcelas ({nota.parcelas.length})
        </p>
        <div className="overflow-hidden rounded-md border border-gray-200">
          {nota.parcelas.map((p, i) => (
            <div
              key={p.numero}
              className={cx(
                'flex items-center justify-between px-3 py-2 text-sm',
                i > 0 && 'border-t border-gray-100',
              )}
            >
              <span className="text-gray-600">
                {p.numero}ª · vence {p.vencimento}
              </span>
              <span className="font-medium text-gray-900">{formatBRL(p.valor)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-700">Total das parcelas</span>
            <span className="font-semibold text-gray-900">{formatBRL(somaParcelas(nota))}</span>
          </div>
        </div>
      </div>
    </SlideOver>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{valor}</dd>
    </div>
  );
}

function ConfirmarPanel({
  notas,
  onClose,
  onConfirm,
}: {
  notas: NotaFiscal[];
  onClose: () => void;
  onConfirm: (drafts: Record<string, { parcelas: number[]; forma: FormaPagamento }>) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, { parcelas: number[]; forma: FormaPagamento }>>(
    () =>
      Object.fromEntries(
        notas.map((n) => [n.id, { parcelas: n.parcelas.map((p) => p.valor), forma: n.formaPagamento }]),
      ),
  );

  const setForma = (id: string, forma: FormaPagamento) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], forma } }));

  const setParcela = (id: string, idx: number, valor: number) =>
    setDrafts((d) => {
      const parcelas = [...d[id].parcelas];
      parcelas[idx] = valor;
      return { ...d, [id]: { ...d[id], parcelas } };
    });

  const total = notas.reduce((acc, n) => acc + n.valor, 0);

  return (
    <SlideOver
      title="Confirmar registro"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Voltar
          </Button>
          <Button variant="primary" size="md" icon={<Send size={16} />} onClick={() => onConfirm(drafts)}>
            Confirmar
          </Button>
        </div>
      }
    >
      {/* Resumo */}
      <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-700">
          Você vai registrar{' '}
          <span className="font-semibold text-gray-900">
            {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
          </span>{' '}
          no total de <span className="font-semibold text-gray-900">{formatBRL(total)}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {notas.map((n) => {
          const draft = drafts[n.id];
          return (
            <div key={n.id} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{n.numero}</span>
                <span className="text-sm text-gray-500">{formatBRL(n.valor)}</span>
              </div>
              <p className="mb-3 text-xs text-gray-500">{n.cliente}</p>

              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Forma de pagamento
              </label>
              <select
                value={draft.forma}
                onChange={(e) => setForma(n.id, e.target.value as FormaPagamento)}
                className={cx(inputCls, 'mb-3')}
              >
                {FORMAS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <p className="mb-1.5 text-xs font-semibold text-gray-600">Parcelas</p>
              <div className="flex flex-col gap-2">
                {n.parcelas.map((p, i) => (
                  <div key={p.numero} className="flex items-center gap-2">
                    <span className="w-24 flex-shrink-0 text-xs text-gray-500">
                      {p.numero}ª · {p.vencimento}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={draft.parcelas[i]}
                      onChange={(e) => setParcela(n.id, i, parseFloat(e.target.value) || 0)}
                      className={cx(inputCls, 'h-8')}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SlideOver>
  );
}

export default NotasFiscais;
