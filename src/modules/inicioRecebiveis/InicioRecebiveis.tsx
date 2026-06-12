import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  Hourglass,
  Mail,
  TrendingUp,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui';
import SacadorSelector from '@/components/Recebiveis/SacadorSelector';
import { status, resumo, pendenciasIniciais } from './data/mockData';

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

type Pendencia = (typeof pendenciasIniciais)[number];

export default function InicioRecebiveis() {
  const { showToast } = useToast();
  const [pendencias, setPendencias] = useState<Pendencia[]>(pendenciasIniciais);
  const [abertaId, setAbertaId] = useState<string | null>(null);

  const precisamDeVoce = useMemo(
    () => pendencias.reduce((soma, p) => soma + p.quantidade, 0),
    [pendencias]
  );

  const resolver = (id: string, titulo: string, mensagem: string) => {
    // Stub — aqui entraria a chamada real.
    console.log('[Início] pendência resolvida:', id);
    setPendencias((atual) => atual.filter((p) => p.id !== id));
    setAbertaId(null);
    showToast('success', titulo, mensagem);
  };

  return (
    <div className="min-h-full bg-gray-100">
      <div className="w-full p-4 md:p-6 text-gray-900">
        {/* 1. Título + saudação + status */}
        <header className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Início</h1>
          <p className="mt-1 text-sm text-gray-500">
            {saudacao()} — aqui você acompanha o envio automático das suas notas.
          </p>

          <div className="mt-4">
            <SacadorSelector />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {status.conectado ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                <AlertCircle className="h-4 w-4" />
                Indisponível
              </span>
            )}

            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
              <Clock className="h-4 w-4" />
              {status.enviosAbertos
                ? 'Envios abertos até 20h'
                : 'Envios fechados — retomam no próximo dia útil, 8h'}
            </span>
          </div>
        </header>

        {/* 2. Três cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Registradas hoje"
            value={resumo.registradasHoje}
            icon={<FileCheck size={20} />}
          />
          <StatCard
            title="Aguardando"
            value={resumo.aguardando}
            icon={<Hourglass size={20} />}
          />
          {precisamDeVoce > 0 ? (
            <StatCard
              title="Precisam de você"
              value={precisamDeVoce}
              icon={<AlertCircle size={20} />}
              status="urgent"
            />
          ) : (
            <StatCard
              title="Tudo certo"
              value={0}
              icon={<CheckCircle2 size={20} />}
              status="ok"
            />
          )}
        </section>

        {/* 3. Lista de pendências */}
        <section>
          <h2 className="mb-3 text-base font-bold text-gray-900">O que precisa de você</h2>

          {pendencias.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-6 text-green-800 shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-sm font-medium">Nenhuma pendência. Você está em dia.</span>
            </div>
          ) : (
            <ul className="space-y-3">
              {pendencias.map((p) => (
                <li
                  key={p.id}
                  className="overflow-hidden rounded-lg bg-white shadow-sm"
                >
                  <PendenciaRow
                    pendencia={p}
                    aberta={abertaId === p.id}
                    onToggle={() => setAbertaId(abertaId === p.id ? null : p.id)}
                    onResolver={resolver}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- StatCard (padrão SAP/revvo) ---------- */

function StatCard({
  title,
  value,
  icon,
  status = 'normal',
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  status?: 'normal' | 'urgent' | 'ok';
}) {
  const cardBg = status === 'ok' ? 'bg-green-50' : 'bg-white';
  const iconColor =
    status === 'urgent' ? 'text-red-500' : status === 'ok' ? 'text-green-600' : 'text-gray-400';
  const valueColor =
    status === 'urgent' ? 'text-red-600' : status === 'ok' ? 'text-green-700' : 'text-gray-900';

  return (
    <div className={`flex flex-col rounded-lg px-4 py-4 shadow-sm h-[140px] ${cardBg}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`flex-shrink-0 ${iconColor}`}>{icon}</div>
      </div>

      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>

      {status === 'urgent' && (
        <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Ação imediata necessária</span>
        </div>
      )}
      {status === 'ok' && (
        <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Nada precisa de você agora</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Linha de pendência ---------- */

function PendenciaRow({
  pendencia,
  aberta,
  onToggle,
  onResolver,
}: {
  pendencia: Pendencia;
  aberta: boolean;
  onToggle: () => void;
  onResolver: (id: string, titulo: string, mensagem: string) => void;
}) {
  const { icone, rotulo } = iconeERotulo(pendencia.tipo);

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          {icone}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-900">{pendencia.titulo}</span>
        <Button
          variant="primary"
          size="md"
          onClick={onToggle}
        >
          {rotulo}
          {aberta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {aberta && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          {pendencia.tipo === 'clientes-sem-email' && (
            <PainelSemEmail pendencia={pendencia} onResolver={onResolver} />
          )}
          {pendencia.tipo === 'valor-acima' && (
            <PainelValorAcima pendencia={pendencia} onResolver={onResolver} />
          )}
          {pendencia.tipo === 'recusada' && (
            <PainelRecusada pendencia={pendencia} onResolver={onResolver} />
          )}
        </div>
      )}
    </>
  );
}

function iconeERotulo(tipo: string): { icone: React.ReactNode; rotulo: string } {
  switch (tipo) {
    case 'clientes-sem-email':
      return { icone: <Mail className="h-4 w-4" />, rotulo: 'Resolver' };
    case 'valor-acima':
      return { icone: <TrendingUp className="h-4 w-4" />, rotulo: 'Ver detalhe' };
    case 'recusada':
      return { icone: <XCircle className="h-4 w-4" />, rotulo: 'Ver motivo' };
    default:
      return { icone: <AlertCircle className="h-4 w-4" />, rotulo: 'Abrir' };
  }
}

/* ---------- Painel: clientes sem e-mail (modal inline) ---------- */

function PainelSemEmail({
  pendencia,
  onResolver,
}: {
  pendencia: Pendencia;
  onResolver: (id: string, titulo: string, mensagem: string) => void;
}) {
  const clientes = (pendencia as any).clientes as { id: string; nome: string; email: string }[];
  const [emails, setEmails] = useState<Record<string, string>>(
    Object.fromEntries(clientes.map((c) => [c.id, c.email]))
  );

  const todosPreenchidos = clientes.every((c) => emails[c.id]?.trim());

  const salvar = () => {
    console.log('[Início] e-mails salvos:', emails);
    onResolver(
      pendencia.id,
      'E-mails salvos',
      'Os clientes agora vão receber o aviso das notas.'
    );
  };

  return (
    <div>
      <p className="mb-3 text-sm text-gray-600">{(pendencia as any).descricao}</p>
      <div className="space-y-3">
        {clientes.map((c) => (
          <div key={c.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label className="w-56 shrink-0 text-sm font-medium text-gray-700">{c.nome}</label>
            <input
              type="email"
              value={emails[c.id]}
              onChange={(e) => setEmails((prev) => ({ ...prev, [c.id]: e.target.value }))}
              placeholder="email@cliente.com.br"
              className="h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" size="md" disabled={!todosPreenchidos} onClick={salvar}>
          Salvar
        </Button>
      </div>
    </div>
  );
}

/* ---------- Painel: valor acima da fatura ---------- */

function PainelValorAcima({
  pendencia,
  onResolver,
}: {
  pendencia: Pendencia;
  onResolver: (id: string, titulo: string, mensagem: string) => void;
}) {
  const p = pendencia as any;
  return (
    <div>
      <p className="text-sm text-gray-600">{p.descricao}</p>
      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={() => onResolver(pendencia.id, 'Nota confirmada', 'A nota foi liberada para envio.')}
        >
          {p.acaoConfirmar}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Painel: nota recusada ---------- */

function PainelRecusada({
  pendencia,
  onResolver,
}: {
  pendencia: Pendencia;
  onResolver: (id: string, titulo: string, mensagem: string) => void;
}) {
  const p = pendencia as any;
  return (
    <div>
      <p className="text-sm text-gray-700">{p.motivo}</p>
      <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#0854a0]">
        <span className="font-semibold">O que fazer: </span>
        {p.oQueFazer}
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={() => onResolver(pendencia.id, 'Nota reenviada', 'Vamos tentar registrar a nota de novo.')}
        >
          {p.acaoConfirmar}
        </Button>
      </div>
    </div>
  );
}
