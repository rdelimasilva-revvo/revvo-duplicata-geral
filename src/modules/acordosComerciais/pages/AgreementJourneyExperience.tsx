import React, { useState, useMemo, useEffect } from 'react';
import {
  X, ArrowRight, Check, Search, Sparkles, Building2,
  Handshake, Send, Clock, PartyPopper, Loader2, ChevronRight,
  Wallet, FileText, MailCheck, Inbox, ShieldCheck, Pencil,
  AlertCircle, TrendingUp, Plus, Minus, CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { credits, invoices, suppliers } from '../abatimento/mockData';
import { formatCurrency, formatDate } from '../utils';
import type { Credit, Invoice } from '../abatimento/types';

type StepId = 'welcome' | 'partner' | 'opportunity' | 'distribute' | 'review' | 'sent' | 'waiting' | 'done';

interface Step {
  id: StepId;
  label: string;
  friendly: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: 'partner', label: '1. Parceiro', friendly: 'Com quem vamos conversar', icon: <Handshake className="w-4 h-4" /> },
  { id: 'opportunity', label: '2. Oportunidade', friendly: 'O que podemos compensar', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'distribute', label: '3. Distribuição', friendly: 'Como o valor será aplicado', icon: <Wallet className="w-4 h-4" /> },
  { id: 'review', label: '4. Revisão', friendly: 'Tudo certo para enviar', icon: <FileText className="w-4 h-4" /> },
  { id: 'waiting', label: '5. Resposta', friendly: 'Palavra com o fornecedor', icon: <Inbox className="w-4 h-4" /> },
  { id: 'done', label: '6. Efetivação', friendly: 'Registro final no ERP', icon: <CheckCircle2 className="w-4 h-4" /> },
];

interface AgreementJourneyExperienceProps {
  onExit: () => void;
}

export function AgreementJourneyExperience({ onExit }: AgreementJourneyExperienceProps) {
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [personalMessage, setPersonalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [supplierResponse, setSupplierResponse] = useState<'idle' | 'thinking' | 'accepted' | 'counter'>('idle');
  const [counterValue, setCounterValue] = useState<number | null>(null);
  const [erpSyncing, setErpSyncing] = useState(false);
  const [erpDone, setErpDone] = useState(false);

  const supplier = useMemo(
    () => suppliers.find((s) => s.id === selectedSupplierId) || null,
    [selectedSupplierId],
  );

  const supplierCredits = useMemo<Credit[]>(
    () =>
      supplier
        ? credits.filter(
            (c) => c.supplierId === supplier.id && c.availableValue > 0 && c.status !== 'expirado',
          )
        : [],
    [supplier],
  );

  const supplierInvoices = useMemo<Invoice[]>(
    () =>
      supplier
        ? invoices.filter((i) => i.supplierId === supplier.id && i.openBalance > 0 && i.offsetStatus !== 'liquidada')
        : [],
    [supplier],
  );

  const selectedCredit = useMemo(
    () => supplierCredits.find((c) => c.id === selectedCreditId) || null,
    [supplierCredits, selectedCreditId],
  );

  const distributedTotal = useMemo(
    () => Object.values(distribution).reduce((s, v) => s + (v || 0), 0),
    [distribution],
  );

  const remaining = selectedCredit ? selectedCredit.availableValue - distributedTotal : 0;
  const isBalanced = Math.abs(remaining) < 0.01 && distributedTotal > 0;

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progressPercent = stepIndex >= 0 ? ((stepIndex + 1) / STEPS.length) * 100 : 0;

  const filteredSuppliers = useMemo(() => {
    const withCredits = suppliers.filter((sup) =>
      credits.some((c) => c.supplierId === sup.id && c.availableValue > 0),
    );
    if (!search) return withCredits;
    const q = search.toLowerCase();
    return withCredits.filter((s) => s.name.toLowerCase().includes(q) || s.cnpj.includes(q));
  }, [search]);

  useEffect(() => {
    if (currentStep === 'waiting' && supplierResponse === 'idle') {
      const t1 = setTimeout(() => setSupplierResponse('thinking'), 1200);
      const t2 = setTimeout(() => {
        setSupplierResponse(Math.random() > 0.35 ? 'accepted' : 'counter');
        if (Math.random() <= 0.35 && selectedCredit) {
          setCounterValue(Math.round(distributedTotal * 0.85));
        }
      }, 4200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [currentStep, supplierResponse, distributedTotal, selectedCredit]);

  const goTo = (id: StepId) => setCurrentStep(id);

  const handleSendProposal = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      goTo('sent');
      setTimeout(() => goTo('waiting'), 2200);
    }, 1600);
  };

  const handleEffectERP = () => {
    setErpSyncing(true);
    setTimeout(() => {
      setErpSyncing(false);
      setErpDone(true);
      showToast('success', 'Abatimento efetivado', 'ERP conciliou a compensação com sucesso.');
    }, 2400);
  };

  const handleAutoDistribute = () => {
    if (!selectedCredit) return;
    const eligible = supplierInvoices.filter((i) => i.openBalance > 0);
    let remainingAmt = selectedCredit.availableValue;
    const next: Record<string, number> = {};
    for (const inv of eligible) {
      if (remainingAmt <= 0) break;
      const take = Math.min(inv.openBalance, remainingAmt);
      next[inv.id] = Math.round(take * 100) / 100;
      remainingAmt -= take;
    }
    setDistribution(next);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-3.5 h-3.5" />
            Fechar
          </button>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0070f2] to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 tabular-nums">
            {currentStep === 'welcome' ? 'Início' : `${stepIndex + 1} de ${STEPS.length}`}
          </span>
        </div>

        {currentStep !== 'welcome' && (
          <div className="max-w-5xl mx-auto px-6 pb-3 flex items-center gap-1.5 overflow-x-auto">
            {STEPS.map((s, idx) => {
              const isCurrent = s.id === currentStep;
              const isDone = idx < stepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => isDone && goTo(s.id)}
                  disabled={!isDone}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#0070f2]/10 text-[#0070f2] ring-1 ring-[#0070f2]/30'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : s.icon}
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {currentStep === 'welcome' && (
          <WelcomeStep onStart={() => goTo('partner')} />
        )}

        {currentStep === 'partner' && (
          <StepShell
            title="Com quem você vai conversar hoje?"
            subtitle="Escolha um parceiro para vermos juntos o que pode ser compensado."
          >
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Busque por nome ou CNPJ…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredSuppliers.map((sup) => {
                const supCredits = credits.filter(
                  (c) => c.supplierId === sup.id && c.availableValue > 0 && c.status !== 'expirado',
                );
                const total = supCredits.reduce((s, c) => s + c.availableValue, 0);
                const isSelected = selectedSupplierId === sup.id;
                return (
                  <button
                    key={sup.id}
                    onClick={() => setSelectedSupplierId(sup.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#0070f2] bg-[#0070f2]/5 shadow-md scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#0070f2] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{sup.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{sup.cnpj}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase">Créditos</p>
                            <p className="text-xs font-bold text-[#0070f2]">{supCredits.length}</p>
                          </div>
                          <div className="w-px h-6 bg-gray-200" />
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase">Valor disponível</p>
                            <p className="text-xs font-bold text-gray-800 tabular-nums">
                              {formatCurrency(total)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#0070f2] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <StepFooter
              onNext={() => {
                if (!selectedSupplierId) {
                  showToast('warning', 'Escolha um parceiro', 'Selecione um fornecedor para continuar.');
                  return;
                }
                goTo('opportunity');
              }}
              nextLabel="Ver oportunidades"
              nextEnabled={!!selectedSupplierId}
            />
          </StepShell>
        )}

        {currentStep === 'opportunity' && supplier && (
          <StepShell
            title={`Olha o que encontramos com ${supplier.name}`}
            subtitle="Escolha um crédito — vamos aplicá-lo em faturas abertas."
          >
            <div className="bg-gradient-to-br from-[#0070f2]/5 to-teal-50 border border-[#0070f2]/20 rounded-xl p-4 mb-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#0070f2]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">
                  {supplierCredits.length} crédito{supplierCredits.length !== 1 ? 's' : ''} · {supplierInvoices.length} fatura{supplierInvoices.length !== 1 ? 's' : ''} compatível{supplierInvoices.length !== 1 ? 'eis' : ''}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Potencial de abatimento de {formatCurrency(supplierCredits.reduce((s, c) => s + c.availableValue, 0))}
                </p>
              </div>
            </div>

            {supplierCredits.length === 0 ? (
              <EmptyBlock message="Nenhum crédito elegível no momento." />
            ) : (
              <div className="space-y-2.5">
                {supplierCredits.map((c) => {
                  const isSel = selectedCreditId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCreditId(c.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSel ? 'border-[#0070f2] bg-[#0070f2]/5 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSel ? 'bg-[#0070f2] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#0070f2]">{c.code}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                              {c.type === 'devolucao' ? 'Devolução' : c.type === 'bonificacao' ? 'Bonificação' : c.type === 'acordo_comercial' ? 'Acordo' : 'Nota de débito'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 truncate">{c.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Expira {formatDate(c.expirationDate)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-gray-400 uppercase">Disponível</p>
                          <p className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(c.availableValue)}</p>
                        </div>
                        {isSel && (
                          <div className="w-6 h-6 rounded-full bg-[#0070f2] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <StepFooter
              onBack={() => goTo('partner')}
              onNext={() => {
                if (!selectedCreditId) {
                  showToast('warning', 'Escolha um crédito', 'Selecione o crédito que vamos aplicar.');
                  return;
                }
                setDistribution({});
                goTo('distribute');
              }}
              nextLabel="Distribuir valor"
              nextEnabled={!!selectedCreditId}
            />
          </StepShell>
        )}

        {currentStep === 'distribute' && selectedCredit && (
          <StepShell
            title="Quanto vai para cada fatura?"
            subtitle="Distribua o valor até zerar o saldo. Use a sugestão automática ou ajuste manualmente."
          >
            <div className="grid grid-cols-3 gap-3 mb-5">
              <BalanceTile label="Crédito total" value={formatCurrency(selectedCredit.availableValue)} tone="neutral" />
              <BalanceTile label="Distribuído" value={formatCurrency(distributedTotal)} tone="blue" />
              <BalanceTile
                label="Saldo restante"
                value={formatCurrency(remaining)}
                tone={isBalanced ? 'green' : remaining < 0 ? 'red' : 'amber'}
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-700">
                Faturas em aberto de {selectedCredit.supplierName}
              </p>
              <button
                onClick={handleAutoDistribute}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#0070f2] bg-[#0070f2]/5 hover:bg-[#0070f2]/10 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Sugerir distribuição
              </button>
            </div>

            {supplierInvoices.length === 0 ? (
              <EmptyBlock message="Nenhuma fatura compatível encontrada." />
            ) : (
              <div className="space-y-2">
                {supplierInvoices.map((inv) => {
                  const value = distribution[inv.id] || 0;
                  const isFull = value >= inv.openBalance && value > 0;
                  return (
                    <div
                      key={inv.id}
                      className={`p-3 rounded-xl border transition-all ${
                        value > 0 ? 'border-[#0070f2]/40 bg-[#0070f2]/5' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-gray-800">{inv.nfNumber}</span>
                            <span className="text-[10px] text-gray-400">·</span>
                            <span className="text-[10px] text-gray-500">{inv.duplicateCode}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">Vence {formatDate(inv.dueDate)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[9px] text-gray-400 uppercase">Em aberto</p>
                          <p className="text-xs font-bold text-gray-700 tabular-nums">{formatCurrency(inv.openBalance)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              const nv = Math.max(0, value - 500);
                              setDistribution({ ...distribution, [inv.id]: nv });
                            }}
                            className="w-7 h-7 rounded-md bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-500" />
                          </button>
                          <input
                            type="number"
                            value={value || ''}
                            placeholder="0"
                            onChange={(e) => {
                              const num = Math.max(0, Math.min(inv.openBalance, Number(e.target.value) || 0));
                              setDistribution({ ...distribution, [inv.id]: num });
                            }}
                            className="w-24 text-center text-xs font-bold tabular-nums border border-gray-200 rounded-md py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                          />
                          <button
                            onClick={() => {
                              const nv = Math.min(inv.openBalance, value + 500);
                              setDistribution({ ...distribution, [inv.id]: nv });
                            }}
                            className="w-7 h-7 rounded-md bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                        {isFull && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Integral
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isBalanced && distributedTotal > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700">
                  {remaining > 0
                    ? `Ainda sobra ${formatCurrency(remaining)} para distribuir.`
                    : `Você distribuiu ${formatCurrency(Math.abs(remaining))} a mais.`}
                </p>
              </div>
            )}

            <StepFooter
              onBack={() => goTo('opportunity')}
              onNext={() => {
                if (!isBalanced) {
                  showToast('warning', 'Ajuste os valores', 'Distribua exatamente o crédito disponível antes de avançar.');
                  return;
                }
                goTo('review');
              }}
              nextLabel="Revisar proposta"
              nextEnabled={isBalanced}
            />
          </StepShell>
        )}

        {currentStep === 'review' && selectedCredit && supplier && (
          <StepShell
            title="Tudo certo para enviar?"
            subtitle="Dê uma última olhada. Se quiser, deixe uma mensagem pessoal para o fornecedor."
          >
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 bg-gradient-to-br from-[#0070f2]/5 to-white border-b border-gray-100">
                <p className="text-[10px] font-bold text-[#0070f2] uppercase tracking-widest">Proposta</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{supplier.name}</p>
                <p className="text-xs text-gray-500 font-mono">{supplier.cnpj}</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Crédito aplicado</span>
                  <span className="text-xs font-bold text-gray-800">{selectedCredit.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Valor total compensado</span>
                  <span className="text-sm font-bold text-[#0070f2] tabular-nums">{formatCurrency(distributedTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Faturas impactadas</span>
                  <span className="text-xs font-bold text-gray-800">
                    {Object.values(distribution).filter((v) => v > 0).length}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Mensagem ao fornecedor (opcional)
                  </label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Ex: Olá! Seguem as condições negociadas. Qualquer dúvida, estou à disposição."
                    rows={3}
                    className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                  />
                </div>
              </div>
            </div>

            <StepFooter
              onBack={() => goTo('distribute')}
              onNext={handleSendProposal}
              nextLabel={sending ? 'Enviando…' : 'Enviar ao fornecedor'}
              nextIcon={sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              nextEnabled={!sending}
            />
          </StepShell>
        )}

        {currentStep === 'sent' && (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
                <MailCheck className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-6">Proposta enviada!</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              O fornecedor recebeu um e-mail e uma notificação no portal. Agora é só aguardar.
            </p>
          </div>
        )}

        {currentStep === 'waiting' && (
          <StepShell
            title="No lado do fornecedor…"
            subtitle="Simulação em tempo real da análise no portal do parceiro."
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{supplier?.name}</p>
                  <p className="text-[10px] text-gray-500">Portal do Fornecedor</p>
                </div>
              </div>

              {supplierResponse === 'idle' && (
                <WaitingState icon={<Inbox className="w-8 h-8" />} text="Aguardando o fornecedor abrir o aviso…" />
              )}
              {supplierResponse === 'thinking' && (
                <WaitingState icon={<Pencil className="w-8 h-8 animate-pulse" />} text="Fornecedor analisando a proposta…" tone="amber" />
              )}
              {supplierResponse === 'accepted' && (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-gray-900">Fornecedor aceitou a proposta</p>
                  <p className="text-xs text-gray-500 mt-1">Assinatura digital registrada · {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              )}
              {supplierResponse === 'counter' && counterValue && (
                <div className="py-4 space-y-3">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Fornecedor pediu ajuste</p>
                    <p className="text-xs text-gray-500 mt-1">Nova sugestão: {formatCurrency(counterValue)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-600 italic">
                    "Agradeço a proposta. Pedimos ajustar o valor para refletir descontos já aplicados no ciclo anterior."
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSupplierResponse('accepted');
                        showToast('success', 'Ajuste aceito', 'Nova versão gerada preservando o histórico.');
                      }}
                      className="flex-1 px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Aceitar contraproposta
                    </button>
                    <button
                      onClick={() => {
                        goTo('distribute');
                        setSupplierResponse('idle');
                      }}
                      className="flex-1 px-3 py-2 text-xs font-semibold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Revisar distribuição
                    </button>
                  </div>
                </div>
              )}
            </div>

            <StepFooter
              onNext={() => goTo('done')}
              nextLabel="Efetivar no ERP"
              nextEnabled={supplierResponse === 'accepted'}
            />
          </StepShell>
        )}

        {currentStep === 'done' && (
          <StepShell
            title="Só falta a baixa financeira"
            subtitle="Acione o ERP para que a compensação entre definitivamente no sistema."
          >
            {!erpDone ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                  erpSyncing ? 'bg-[#0070f2]/10 text-[#0070f2]' : 'bg-gray-100 text-gray-400'
                }`}>
                  {erpSyncing ? (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-10 h-10" />
                  )}
                </div>
                <p className="text-base font-bold text-gray-900 mt-4">
                  {erpSyncing ? 'Enviando ao ERP…' : 'Pronto para efetivar'}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  {erpSyncing
                    ? 'Conciliando faturas, aplicando crédito e registrando o evento.'
                    : 'Clique no botão abaixo para confirmar a compensação no sistema financeiro.'}
                </p>
                {!erpSyncing && (
                  <button
                    onClick={handleEffectERP}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#0070f2] text-white text-sm font-semibold rounded-xl hover:bg-[#005bc4] transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Efetivar agora
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <PartyPopper className="w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-5">Abatimento concluído!</h2>
                <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                  {formatCurrency(distributedTotal)} compensados em {Object.values(distribution).filter((v) => v > 0).length} fatura{Object.values(distribution).filter((v) => v > 0).length !== 1 ? 's' : ''} de {supplier?.name}. Tudo registrado e pronto para auditoria.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-6 max-w-lg mx-auto">
                  <FinalStat label="Valor" value={formatCurrency(distributedTotal)} />
                  <FinalStat label="Faturas" value={String(Object.values(distribution).filter((v) => v > 0).length)} />
                  <FinalStat label="Parceiro" value={supplier?.name.split(' ')[0] || '—'} />
                </div>
                <div className="flex gap-2 justify-center mt-6">
                  <button
                    onClick={onExit}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voltar à visão geral
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep('partner');
                      setSelectedSupplierId(null);
                      setSelectedCreditId(null);
                      setDistribution({});
                      setPersonalMessage('');
                      setSupplierResponse('idle');
                      setErpDone(false);
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0070f2] rounded-lg hover:bg-[#005bc4] transition-colors shadow-sm inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Nova jornada
                  </button>
                </div>
              </div>
            )}
          </StepShell>
        )}
      </div>
    </div>
  );
}

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0070f2] to-teal-500 flex items-center justify-center mx-auto shadow-lg">
        <Handshake className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mt-6">Vamos fechar um acordo?</h1>
      <p className="text-base text-gray-500 mt-3 max-w-xl mx-auto leading-relaxed">
        Em 6 passos, você escolhe o parceiro, aplica o crédito disponível,
        envia a proposta e efetiva tudo no ERP. Sem planilha, sem retrabalho.
      </p>

      <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mt-10">
        {[
          { icon: <Handshake className="w-5 h-5" />, label: 'Escolher parceiro' },
          { icon: <Wallet className="w-5 h-5" />, label: 'Aplicar crédito' },
          { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Efetivar no ERP' },
        ].map((h) => (
          <div key={h.label} className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-[#0070f2]/10 text-[#0070f2] flex items-center justify-center mx-auto">
              {h.icon}
            </div>
            <p className="text-xs font-semibold text-gray-700 mt-2">{h.label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 bg-[#0070f2] text-white text-sm font-bold rounded-xl hover:bg-[#005bc4] transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
      >
        Começar agora
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

function StepFooter({
  onBack,
  onNext,
  nextLabel,
  nextIcon,
  nextEnabled = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextIcon?: React.ReactNode;
  nextEnabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>
      ) : <span />}
      <button
        onClick={onNext}
        disabled={!nextEnabled}
        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
          nextEnabled
            ? 'bg-[#0070f2] text-white hover:bg-[#005bc4] shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {nextLabel}
        {nextIcon || <ArrowRight className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function BalanceTile({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'blue' | 'green' | 'amber' | 'red' }) {
  const toneMap = {
    neutral: 'bg-gray-50 border-gray-200 text-gray-800',
    blue: 'bg-[#0070f2]/5 border-[#0070f2]/20 text-[#0070f2]',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-rose-50 border-rose-200 text-rose-700',
  };
  return (
    <div className={`p-4 rounded-xl border ${toneMap[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-lg font-bold tabular-nums mt-1">{value}</p>
    </div>
  );
}

function WaitingState({ icon, text, tone = 'gray' }: { icon: React.ReactNode; text: string; tone?: 'gray' | 'amber' }) {
  const bg = tone === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500';
  return (
    <div className="py-10 text-center">
      <div className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center mx-auto`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-700 mt-3">{text}</p>
      <div className="flex gap-1 justify-center mt-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="py-10 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
      <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

function FinalStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-emerald-100">
      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-800 mt-1 truncate">{value}</p>
    </div>
  );
}
