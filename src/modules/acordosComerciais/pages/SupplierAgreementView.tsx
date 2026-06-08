import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Scale,
  Warehouse,
} from 'lucide-react';
import {
  DownloadSimple,
  X as XIcon,
  ChatCircleText,
  ClockCounterClockwise,
  SealCheck,
  FilePdf,
  Check,
} from '@phosphor-icons/react';
import { useAgreementStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '../utils';
import { credits as mockCredits } from '../abatimento/mockData';
import { DocumentCenter } from '../components/DocumentCenter';
import { getAuthedSupplierCnpj } from '../components/AcordoAccessGate';

interface SupplierAgreementViewProps {
  agreementId: string;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

type TabId = 'documento' | 'extrato' | 'repositorio';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill' | 'bold' }> }[] = [
  { id: 'documento', label: 'Documento', icon: FilePdf },
  { id: 'extrato', label: 'Extrato de Créditos', icon: ClockCounterClockwise },
  { id: 'repositorio', label: 'Central de Documentos', icon: DownloadSimple },
];

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SupplierAgreementView({ agreementId, onBack }: SupplierAgreementViewProps) {
  const { getAgreement, setSupplierResponse } = useAgreementStore();
  const { showToast } = useToast();
  const rawAgreement = getAgreement(agreementId);
  const authedCnpj = getAuthedSupplierCnpj();
  const agreementCnpjDigits = rawAgreement?.supplierCnpj?.replace(/\D/g, '') ?? '';
  const cnpjMatches = !authedCnpj || authedCnpj === agreementCnpjDigits;
  const agreement = cnpjMatches ? rawAgreement : undefined;

  const [tab, setTab] = useState<TabId>('documento');
  const [showContestModal, setShowContestModal] = useState(false);
  const [contestReason, setContestReason] = useState('');
  const [contestCategory, setContestCategory] = useState<'valor' | 'prazo' | 'mercadoria' | 'outro'>(
    'valor',
  );
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [formalizing, setFormalizing] = useState(false);

  if (!agreement) {
    const blocked = rawAgreement && !cnpjMatches;
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center max-w-sm w-full">
          <button
            type="button"
            onClick={onBack}
            aria-label="Fechar"
            className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <XIcon size={16} weight="regular" />
          </button>
          <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-3">
            <Warehouse className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {blocked ? 'Acordo não disponível' : 'Acordo não encontrado'}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {blocked
              ? 'Este acordo pertence a outro CNPJ. O portal exibe apenas propostas vinculadas ao fornecedor autenticado.'
              : 'A proposta solicitada não está mais disponível ou foi removida.'}
          </p>
        </div>
      </div>
    );
  }

  const supplierCredits = useMemo(
    () =>
      mockCredits.filter(
        (c) => c.supplierId && agreement.supplierName.toLowerCase().includes((c.supplierName || '').split(' ')[0].toLowerCase()),
      ),
    [agreement.supplierName],
  );

  const supplierCreditsFallback = useMemo(() => {
    if (supplierCredits.length > 0) return supplierCredits;
    return mockCredits.slice(0, 4);
  }, [supplierCredits]);

  const creditTotals = useMemo(() => {
    const totalAvailable = supplierCreditsFallback.reduce(
      (s, c) => s + (c.availableValue || 0),
      0,
    );
    const totalUsed = supplierCreditsFallback.reduce((s, c) => s + (c.usedValue || 0), 0);
    return { totalAvailable, totalUsed, base: totalAvailable + totalUsed };
  }, [supplierCreditsFallback]);

  const isPending = agreement.status === 'pending_supplier_aceite';
  const alreadyResponded = !!agreement.supplierResponse;

  const handleDownloadContract = () => {
    const contractContent = [
      `ACORDO COMERCIAL ${agreement.code}`,
      '',
      `Fornecedor: ${agreement.supplierName} (${agreement.supplierCnpj})`,
      `Sacado:     ${agreement.sacadoName} (${agreement.sacadoCnpj})`,
      `Vigencia:   ${formatDate(agreement.startDate)} a ${formatDate(agreement.endDate)}`,
      `Valor:      ${formatCurrency(agreement.totalValue)}`,
      '',
      '— documento gerado pela plataforma Revvo.',
    ].join('\n');
    downloadBlob(`${agreement.code}-acordo.pdf`, contractContent, 'application/pdf');
    showToast('success', 'Download iniciado', `${agreement.code}-acordo.pdf`);
  };

  const handleDownloadStatement = () => {
    const body = [
      `EXTRATO DE CREDITOS — ${agreement.supplierName}`,
      `Acordo: ${agreement.code}`,
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      '',
      'DATA | CREDITO | MOVIMENTO | VALOR | SALDO',
      '------------------------------------------------',
      ...supplierCreditsFallback.map(
        (c) =>
          `${formatDate(c.issueDate)} | ${c.code.padEnd(10, ' ')} | ${c.usedValue > 0 ? 'CONSUMO' : 'DISPONIVEL'} | ${formatCurrency(c.usedValue || c.availableValue)} | ${formatCurrency(c.availableValue)}`,
      ),
      '',
      `Total consumido:    ${formatCurrency(creditTotals.totalUsed)}`,
      `Saldo remanescente: ${formatCurrency(creditTotals.totalAvailable)}`,
    ].join('\n');
    downloadBlob(`${agreement.code}-extrato-creditos.pdf`, body, 'application/pdf');
    showToast('success', 'Extrato baixado', 'Consulte o arquivo gerado.');
  };

  const openContest = () => {
    setContestCategory('valor');
    setContestReason('');
    setShowContestModal(true);
  };

  const submitContest = () => {
    if (!contestReason.trim()) return;
    setSupplierResponse(agreementId, {
      type: 'recusa',
      date: new Date().toISOString(),
      reason: `[${contestCategory.toUpperCase()}] ${contestReason.trim()}`,
    });
    setShowContestModal(false);
    showToast(
      'warning',
      'Contestação enviada',
      'A empresa foi notificada e abrirá uma nova versão para análise.',
    );
  };

  const openSignature = () => {
    setAgreedTerms(false);
    setSignatureOpen(true);
  };

  const submitSignature = async () => {
    if (!agreedTerms || formalizing) return;
    setFormalizing(true);
    await new Promise((r) => setTimeout(r, 650));
    setSupplierResponse(agreementId, { type: 'aceite', date: new Date().toISOString() });
    setFormalizing(false);
    setSignatureOpen(false);
    showToast(
      'success',
      'Acordo formalizado',
      `Assinatura digital registrada em ${new Date().toLocaleTimeString('pt-BR')}.`,
    );
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-slate-50"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif' }}
    >
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0070f2]/10 text-[#0070f2] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Portal do Fornecedor
            </p>
            <h1 className="text-base font-bold text-gray-900 truncate">
              {agreement.code} · {agreement.title}
            </h1>
          </div>
          <StatusBadge status={agreement.status} size="sm" />
          <button
            type="button"
            onClick={onBack}
            aria-label="Fechar"
            title="Fechar"
            className="w-8 h-8 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
          >
            <XIcon size={16} weight="bold" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Sacado
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {agreement.sacadoName}
              </p>
              <p className="text-[11px] text-gray-500 font-mono">{agreement.sacadoCnpj}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Valor total
              </p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(agreement.totalValue)}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {formatDate(agreement.startDate)} → {formatDate(agreement.endDate)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <KpiMini
              label="Crédito disponível"
              value={formatCurrency(creditTotals.totalAvailable)}
              tone="blue"
            />
            <KpiMini
              label="Crédito consumido"
              value={formatCurrency(creditTotals.totalUsed)}
              tone="emerald"
            />
            <KpiMini
              label="Movimentos"
              value={String(supplierCreditsFallback.length)}
              tone="slate"
            />
          </div>
        </section>

        <nav className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 h-11 text-xs font-semibold transition-colors relative ${
                    active
                      ? 'text-[#0070f2]'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50/70'
                  }`}
                >
                  <Icon size={14} weight={active ? 'fill' : 'regular'} />
                  {t.label}
                  {active && (
                    <span className="absolute left-4 right-4 bottom-0 h-0.5 bg-[#0070f2] rounded-t" />
                  )}
                </button>
              );
            })}
          </div>

          {tab === 'documento' && (
            <div className="p-5">
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Contrato {agreement.code}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadContract}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#0070f2] hover:text-[#0070f2] hover:bg-blue-50 transition-colors"
                  >
                    <DownloadSimple size={13} weight="bold" />
                    Baixar PDF do Acordo
                  </button>
                </div>

                <article className="bg-white rounded-lg border border-gray-200 p-8 text-left space-y-4">
                  <p className="text-center text-sm font-bold text-gray-800 border-b pb-3">
                    ACORDO COMERCIAL {agreement.code}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Pelo presente instrumento, as partes abaixo qualificadas celebram o presente
                    Acordo Comercial, regido pelas seguintes cláusulas e condições:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-700">
                    <InfoRow label="Sacado" value={`${agreement.sacadoName} · ${agreement.sacadoCnpj}`} />
                    <InfoRow label="Fornecedor" value={`${agreement.supplierName} · ${agreement.supplierCnpj}`} />
                    <InfoRow label="Vigência" value={`${formatDate(agreement.startDate)} a ${formatDate(agreement.endDate)}`} />
                    <InfoRow label="Valor total" value={formatCurrency(agreement.totalValue)} />
                  </div>
                  {agreement.formalizationData && (
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 pt-3 border-t border-gray-100">
                      <InfoRow label="Pagamento" value={agreement.formalizationData.paymentTerms} />
                      <InfoRow label="Juros" value={`${agreement.formalizationData.interestRate}% ao mês`} />
                      <InfoRow label="Multa" value={`${agreement.formalizationData.penaltyRate}% atraso`} />
                      <InfoRow label="Carência" value={`${agreement.formalizationData.gracePeriod} dias`} />
                    </div>
                  )}
                </article>

                {agreement.documents.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Anexos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {agreement.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="inline-flex items-center gap-2 h-8 px-3 rounded-md bg-white border border-gray-200 text-xs text-gray-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0070f2]" />
                          <span className="font-semibold">{doc.name}</span>
                          <span className="text-[10px] text-gray-400 tabular-nums">
                            {formatFileSize(doc.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'extrato' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Extrato de Créditos</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Histórico cronológico de saldo consumido e remanescente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadStatement}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#0070f2] hover:text-[#0070f2] hover:bg-blue-50 transition-colors"
                >
                  <DownloadSimple size={13} weight="bold" />
                  Baixar Extrato
                </button>
              </div>

              {supplierCreditsFallback.length === 0 ? (
                <EmptyState />
              ) : (
                <ol className="relative border-l-2 border-gray-100 pl-5 space-y-4">
                  {supplierCreditsFallback.map((c, idx) => {
                    const consumed = (c.usedValue || 0) > 0;
                    const remaining = c.availableValue || 0;
                    return (
                      <li key={c.id ?? idx} className="relative">
                        <span
                          className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                            consumed ? 'bg-emerald-500' : 'bg-[#0070f2]'
                          }`}
                        />
                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                {formatDate(c.issueDate)} · {c.code}
                              </p>
                              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                {consumed ? 'Consumo de crédito' : 'Crédito disponibilizado'}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {c.type === 'bonificacao' ? 'Bonificação' : 'Abatimento comercial'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-sm font-bold tabular-nums ${
                                  consumed ? 'text-emerald-700' : 'text-[#0070f2]'
                                }`}
                              >
                                {consumed ? '-' : '+'}
                                {formatCurrency(consumed ? c.usedValue : c.availableValue)}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5 tabular-nums">
                                Saldo: {formatCurrency(remaining)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}

          {tab === 'repositorio' && (
            <div className="p-5">
              <DocumentCenter
                proposalCode={agreement.code}
                totals={{
                  original: agreement.totalValue,
                  discount: 0,
                  credits: creditTotals.totalUsed,
                  final: agreement.totalValue - creditTotals.totalUsed,
                }}
                supplierName={agreement.supplierName}
                originCompany={agreement.sacadoName}
              />
            </div>
          )}
        </nav>

        {isPending && !alreadyResponded && (
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">Decisão do fornecedor</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Revise os termos e formalize digitalmente, ou abra uma contestação para apontar
                  divergências.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={openSignature}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <SealCheck size={14} weight="bold" />
                Assinar digitalmente
              </button>
              <button
                type="button"
                onClick={openContest}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 active:bg-rose-100 transition-colors"
              >
                <ChatCircleText size={14} weight="bold" />
                Contestar proposta
              </button>
            </div>
          </section>
        )}

        {alreadyResponded && agreement.supplierResponse && (
          <section
            className={`rounded-xl border shadow-sm p-5 ${
              agreement.supplierResponse.type === 'aceite'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {agreement.supplierResponse.type === 'aceite' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${
                    agreement.supplierResponse.type === 'aceite'
                      ? 'text-emerald-800'
                      : 'text-rose-800'
                  }`}
                >
                  {agreement.supplierResponse.type === 'aceite'
                    ? 'Acordo formalizado'
                    : 'Contestação registrada'}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {formatDateTime(agreement.supplierResponse.date)}
                </p>
                {agreement.supplierResponse.reason && (
                  <p className="text-xs text-rose-700 mt-2">{agreement.supplierResponse.reason}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {showContestModal && (
        <ModalShell
          title="Contestar proposta"
          subtitle="Explique a divergência encontrada nesta proposta para que a empresa possa gerar uma nova versão."
          onClose={() => setShowContestModal(false)}
        >
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Categoria
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'valor', label: 'Valor' },
                    { id: 'prazo', label: 'Prazo' },
                    { id: 'mercadoria', label: 'Mercadoria' },
                    { id: 'outro', label: 'Outro' },
                  ] as const
                ).map((c) => {
                  const active = contestCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setContestCategory(c.id)}
                      className={`h-8 rounded-md text-[11px] font-semibold border transition-colors ${
                        active
                          ? 'bg-[#0070f2] text-white border-[#0070f2]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="contest-reason"
                className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Justificativa <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="contest-reason"
                rows={5}
                value={contestReason}
                onChange={(e) => setContestReason(e.target.value)}
                placeholder="Descreva em detalhes a divergência identificada…"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                autoFocus
              />
              <p className="text-[11px] text-gray-500 mt-1">
                A empresa receberá esta contestação junto com a categoria selecionada.
              </p>
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
            <button
              type="button"
              disabled={!contestReason.trim()}
              onClick={submitContest}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChatCircleText size={13} weight="bold" />
              Enviar Contestação
            </button>
          </div>
        </ModalShell>
      )}

      {signatureOpen && (
        <ModalShell
          title="Assinatura digital"
          subtitle="Formalize a sua aceitação dos termos do acordo comercial."
          onClose={() => (formalizing ? null : setSignatureOpen(false))}
        >
          <div className="px-5 py-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Ao formalizar a assinatura digital do acordo{' '}
              <span className="font-semibold text-gray-900">{agreement.code}</span>, o fornecedor
              declara aceitar integralmente os termos, valores e prazos ali descritos.
            </p>

            <label
              htmlFor="signature-terms"
              className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-xs leading-relaxed cursor-pointer select-none transition-colors ${
                agreedTerms
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-gray-200 hover:border-emerald-300'
              } ${formalizing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                id="signature-terms"
                type="checkbox"
                className="sr-only peer"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                disabled={formalizing}
                required
                aria-required="true"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ${
                  agreedTerms
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'bg-white border-gray-300 hover:border-emerald-400'
                }`}
              >
                {agreedTerms && <Check size={10} weight="bold" className="text-white" />}
              </span>
              <span className="text-gray-700">
                Li e <span className="font-semibold">concordo com os termos</span> do acordo.
                Entendo que esta assinatura digital possui validade jurídica.{' '}
                <span className="text-rose-600">*</span>
              </span>
            </label>
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
            <button
              type="button"
              onClick={submitSignature}
              disabled={!agreedTerms || formalizing}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SealCheck size={13} weight="bold" />
              {formalizing ? 'Formalizando…' : 'Formalizar assinatura'}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function KpiMini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'blue' | 'emerald' | 'slate';
}) {
  const palette = {
    blue: 'text-[#0070f2]',
    emerald: 'text-emerald-700',
    slate: 'text-slate-700',
  }[tone];
  return (
    <div className="bg-slate-50 border border-gray-100 rounded-xl px-4 py-3">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold mt-1 tabular-nums ${palette}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <ArrowLeft className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700">Sem movimentos registrados</p>
      <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
        Os créditos e consumos do fornecedor aparecerão aqui assim que forem movimentados.
      </p>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 animate-overlay-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-modal-in">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
          >
            <XIcon size={15} weight="bold" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
