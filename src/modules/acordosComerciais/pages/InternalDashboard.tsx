import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Building2, ChevronDown, Filter, X, Receipt,
  TrendingUp, AlertCircle, Sparkles, Handshake,
} from 'lucide-react';
import { useAgreementStore } from '../store';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { WorkflowPipeline, type PipelineStageId, buildStages } from '../components/WorkflowPipeline';
import { StageAgreementsList } from '../components/StageAgreementsList';
import { SupplierCreditsSection } from '../components/SupplierCreditsSection';
import { CreditsHistoryPanel } from '../components/CreditsHistoryPanel';
import { credits, suppliers } from '../abatimento/mockData';
import { useAbatimentoStore } from '../abatimento/store';
import { useToast } from '@/context/ToastContext';

interface InternalDashboardProps {
  onNavigate: (path: string) => void;
}

export function InternalDashboard({ onNavigate }: InternalDashboardProps) {
  const { agreements } = useAgreementStore();
  const { showToast } = useToast();
  const setAbatimentoSupplier = useAbatimentoStore((s) => s.setSelectedSupplier);

  const [activeStage, setActiveStage] = useState<PipelineStageId>('discover');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  const suppliersWithCredits = useMemo(
    () =>
      suppliers.filter((sup) =>
        credits.some((c) => c.supplierId === sup.id && c.availableValue > 0 && c.status !== 'expirado'),
      ),
    [],
  );

  const filteredDropdownSuppliers = useMemo(() => {
    if (!supplierSearch) return suppliersWithCredits;
    const q = supplierSearch.toLowerCase();
    return suppliersWithCredits.filter(
      (s) => s.name.toLowerCase().includes(q) || s.cnpj.includes(q),
    );
  }, [suppliersWithCredits, supplierSearch]);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === selectedSupplierId) || null,
    [selectedSupplierId],
  );

  const scopedAgreements = useMemo(() => {
    if (!selectedSupplier) return agreements;
    return agreements.filter((a) => a.supplierName === selectedSupplier.name);
  }, [agreements, selectedSupplier]);

  const scopedCredits = useMemo(() => {
    return selectedSupplierId
      ? credits.filter((c) => c.supplierId === selectedSupplierId)
      : credits;
  }, [selectedSupplierId]);

  const creditsAvailableCount = useMemo(
    () => scopedCredits.filter((c) => c.availableValue > 0 && c.status !== 'expirado').length,
    [scopedCredits],
  );

  const freeBalanceCount = useMemo(
    () => scopedCredits.filter((c) => c.type === 'bonificacao' && c.availableValue > 0).length,
    [scopedCredits],
  );

  const totals = useMemo(() => {
    const available = scopedCredits
      .filter((c) => c.availableValue > 0 && c.status !== 'expirado')
      .reduce((s, c) => s + c.availableValue, 0);
    const used = scopedCredits.reduce((s, c) => s + c.usedValue, 0);
    const overdue = scopedAgreements.filter((a) =>
      ['inconsistency', 'rejected'].includes(a.status),
    ).length;
    return { available, used, overdue };
  }, [scopedCredits, scopedAgreements]);

  const formatKpiValue = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);

  const stages = useMemo(
    () => buildStages(scopedAgreements, creditsAvailableCount, freeBalanceCount),
    [scopedAgreements, creditsAvailableCount, freeBalanceCount],
  );
  const currentStage = stages.find((s) => s.id === activeStage) || stages[0];

  const requireSupplier = (action: string) => {
    if (!selectedSupplierId) {
      showToast(
        'warning',
        'Selecione um fornecedor',
        `Selecione um fornecedor no filtro primeiro para ${action}.`,
      );
      return false;
    }
    return true;
  };

  const handleStagePrimaryAction = (stageId: PipelineStageId) => {
    switch (stageId) {
      case 'discover':
        showToast('info', 'Explore os créditos', 'Selecione um fornecedor e expanda as faturas abaixo.');
        break;
      case 'link':
        if (!requireSupplier('iniciar a vinculação')) return;
        setAbatimentoSupplier(selectedSupplierId!);
        onNavigate('abatimento');
        break;
      case 'send':
        showToast('success', 'Lembretes enviados', `${currentStage.count} fornecedor(es) receberam novo aviso.`);
        break;
      case 'analyze':
        showToast('info', 'Visão do fornecedor', 'Alterne para a persona Fornecedor para ver a análise da proposta.');
        break;
      case 'handle_refusal':
        if (currentStage.agreements[0]) {
          onNavigate(`wizard/${currentStage.agreements[0].id}`);
        } else {
          showToast('info', 'Sem recusas', 'Nenhum acordo recusado aguardando revisão.');
        }
        break;
      case 'finalize':
        showToast('success', 'ERP acionado', 'Solicitação de efetivação enviada ao sistema financeiro.');
        break;
      case 'free_balance':
        showToast('info', 'Portal do fornecedor', 'Alterne a persona para acessar o painel do fornecedor.');
        break;
    }
  };

  const handleStageItemAction = (stageId: PipelineStageId, agreementId: string) => {
    switch (stageId) {
      case 'link':
        if (!requireSupplier('vincular faturas')) return;
        setAbatimentoSupplier(selectedSupplierId!);
        onNavigate('abatimento');
        break;
      case 'send':
        showToast('success', 'Lembrete enviado', 'O fornecedor receberá notificação imediata.');
        break;
      case 'analyze':
        onNavigate(`detail/${agreementId}`);
        break;
      case 'handle_refusal':
        onNavigate(`wizard/${agreementId}`);
        break;
      case 'finalize':
        onNavigate(`completed/${agreementId}`);
        break;
    }
  };

  const handleOpenAgreement = (id: string) => {
    onNavigate(`detail/${id}`);
  };

  const handleNavigateToAbatimentoFromSupplier = (supplierId: string) => {
    setAbatimentoSupplier(supplierId);
    onNavigate('abatimento');
  };

  const handleNovoAcordo = () => {
    onNavigate('nova-proposta');
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0070f2] to-[#005bc4] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Acordos Comerciais</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Jornada guiada de abatimento: visualizar, vincular, aprovar e efetivar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <button
            onClick={() => onNavigate('abatimento')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            Abatimento
          </button>
          <button
            onClick={() => onNavigate('journey')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0070f2] to-teal-500 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all shadow-sm"
          >
            <Handshake className="w-4 h-4" />
            Jornada guiada
          </button>
          <button
            onClick={handleNovoAcordo}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#0070f2] border border-[#0070f2] text-sm font-medium rounded-lg hover:bg-[#0070f2]/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Acordo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiTile
          label="Créditos disponíveis"
          value={formatKpiValue(totals.available)}
          hint={`${creditsAvailableCount} créditos elegíveis`}
          accent="blue"
        />
        <KpiTile
          label="Total utilizado"
          value={formatKpiValue(totals.used)}
          hint="Abatimentos já efetivados"
          accent="emerald"
        />
        <KpiTile
          label="Em andamento"
          value={String(scopedAgreements.filter((a) =>
            ['draft', 'sap_syncing', 'pending_linkage', 'pending_supplier_aceite', 'signature_pending'].includes(a.status),
          ).length)}
          hint="Acordos ativos no pipeline"
          accent="amber"
        />
        <KpiTile
          label="Requer atenção"
          value={String(totals.overdue)}
          hint="Inconsistências e recusas"
          accent="rose"
          icon={<AlertCircle className="w-4 h-4" />}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0070f2]/10 flex items-center justify-center flex-shrink-0">
            <Filter className="w-4 h-4 text-[#0070f2]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Escopo: Fornecedor
            </p>
            <div className="relative">
              <button
                onClick={() => setSupplierDropdownOpen(!supplierDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left bg-white"
              >
                {selectedSupplier ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-800">{selectedSupplier.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{selectedSupplier.cnpj}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">
                    Selecione um fornecedor para filtrar a jornada e o pipeline…
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    supplierDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {supplierDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou CNPJ..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredDropdownSuppliers.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-gray-400 text-center">
                        Nenhum fornecedor encontrado
                      </div>
                    ) : (
                      filteredDropdownSuppliers.map((sup) => {
                        const supCredits = credits.filter(
                          (c) => c.supplierId === sup.id && c.availableValue > 0 && c.status !== 'expirado',
                        );
                        const totalCredits = supCredits.reduce((s, c) => s + c.availableValue, 0);
                        return (
                          <button
                            key={sup.id}
                            onClick={() => {
                              setSelectedSupplierId(sup.id);
                              setSupplierDropdownOpen(false);
                              setSupplierSearch('');
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${
                              selectedSupplierId === sup.id ? 'bg-[#0070f2]/5' : ''
                            }`}
                          >
                            <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{sup.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{sup.cnpj}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] text-gray-400">
                                {supCredits.length} crédito{supCredits.length !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs font-semibold text-[#0070f2] tabular-nums">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                  maximumFractionDigits: 0,
                                }).format(totalCredits)}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {selectedSupplier && (
            <button
              onClick={() => setSelectedSupplierId(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors self-end"
            >
              <X className="w-3 h-3" />
              Limpar filtro
            </button>
          )}
        </div>
      </div>

      <WorkflowPipeline
        agreements={scopedAgreements}
        creditsAvailableCount={creditsAvailableCount}
        freeBalanceCount={freeBalanceCount}
        activeStageId={activeStage}
        onStageSelect={setActiveStage}
        onPrimaryAction={handleStagePrimaryAction}
      />

      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white ${currentStage.accentBg}`}>
                {currentStage.icon}
              </div>
              <h2 className="text-sm font-bold text-gray-800">
                Itens em {currentStage.short}
              </h2>
              <span className="text-[10px] text-gray-400 font-mono">
                etapa {currentStage.order} · {currentStage.count} item{currentStage.count !== 1 ? 'ns' : ''}
              </span>
            </div>
            {selectedSupplier && (
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Filtrado por {selectedSupplier.name}
              </span>
            )}
          </div>

          <StageAgreementsList
            stageId={activeStage}
            stageTitle={currentStage.short}
            agreements={currentStage.agreements}
            onOpenAgreement={handleOpenAgreement}
            onActionClick={handleStageItemAction}
          />

          {activeStage === 'discover' && (
            <SupplierCreditsSection
              onNavigateGestor={() => {
                if (!requireSupplier('iniciar a vinculação')) return;
                setAbatimentoSupplier(selectedSupplierId!);
                onNavigate('abatimento');
              }}
              onNavigateSupplierAbatimento={handleNavigateToAbatimentoFromSupplier}
              selectedSupplierId={selectedSupplierId}
            />
          )}
        </div>

        <div className="space-y-4">
          <InsightsPanel
            stageId={activeStage}
            agreementsCount={currentStage.count}
            supplierName={selectedSupplier?.name}
          />
          <CreditsHistoryPanel selectedSupplierId={selectedSupplierId} />
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  accent: 'blue' | 'emerald' | 'amber' | 'rose';
  icon?: React.ReactNode;
}) {
  const palette: Record<string, { text: string; bg: string; ring: string }> = {
    blue: { text: 'text-[#0070f2]', bg: 'bg-blue-50', ring: 'ring-blue-100' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-100' },
  };
  const c = palette[accent];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <div className={`w-7 h-7 rounded-md ${c.bg} ${c.text} flex items-center justify-center ring-4 ${c.ring}`}>
          {icon || <TrendingUp className="w-3.5 h-3.5" />}
        </div>
      </div>
      <p className={`text-xl font-bold mt-2 ${c.text}`}>{value}</p>
      <p className="text-[10px] text-gray-500 mt-1">{hint}</p>
    </div>
  );
}

function InsightsPanel({
  stageId,
  agreementsCount,
  supplierName,
}: {
  stageId: PipelineStageId;
  agreementsCount: number;
  supplierName?: string;
}) {
  const insights = getStageInsights(stageId, agreementsCount, supplierName);
  return (
    <div className="bg-gradient-to-br from-[#0070f2]/5 to-white border border-[#0070f2]/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-[#0070f2]/10 text-[#0070f2] flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
          Como avançar na etapa
        </p>
      </div>
      <ul className="space-y-2">
        {insights.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 leading-relaxed">
            <span className="w-4 h-4 rounded-full bg-[#0070f2]/10 text-[#0070f2] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getStageInsights(
  stageId: PipelineStageId,
  count: number,
  supplier?: string,
): string[] {
  switch (stageId) {
    case 'discover':
      return [
        supplier
          ? `Revise os ${count} créditos de ${supplier} e as NFs compatíveis listadas ao lado.`
          : 'Selecione um fornecedor acima para habilitar a análise dirigida.',
        'Use o filtro por empresa para agrupar créditos e notas da mesma razão social.',
        'Expanda um fornecedor no painel para iniciar a vinculação direto dali.',
      ];
    case 'link':
      return [
        'Distribua o valor do crédito entre as faturas até zerar a diferença.',
        'Se o total não bater, o sistema bloqueia o avanço automaticamente.',
        'Verifique alertas de inconsistência retornados pelo SAP.',
      ];
    case 'send':
      return [
        'O fornecedor é notificado por e-mail assim que a proposta é finalizada.',
        'Lembretes automáticos são disparados antes do prazo expirar.',
        'Acompanhe o status "lido" direto no card do acordo.',
      ];
    case 'analyze':
      return [
        'O fornecedor acessa o portal para conferir valores e condições.',
        'Toda decisão (aceite ou recusa) fica registrada com data, hora e autor.',
        'Alterne para a persona Fornecedor para ver a experiência real.',
      ];
    case 'handle_refusal':
      return [
        'Consulte o motivo informado pelo fornecedor antes de ajustar.',
        'Gere uma nova versão mantendo o histórico da proposta anterior.',
        'Envie a nova versão direto do wizard de formalização.',
      ];
    case 'finalize':
      return [
        'Ao assinar, o ERP recebe o evento e executa a compensação.',
        'Confirme no painel de efetivações se o lançamento foi conciliado.',
        'Divergências voltam para a etapa de tratamento de recusa.',
      ];
    case 'free_balance':
      return [
        'O saldo livre permite que o fornecedor escolha em qual NF aplicar.',
        'A decisão do fornecedor é registrada e o sistema conclui automaticamente.',
        'Habilite essa opção para fornecedores estratégicos via configurações.',
      ];
  }
}
