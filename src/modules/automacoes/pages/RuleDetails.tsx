import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '@/modules/automacoes/lib/supabase';
import { Notification } from '@/modules/automacoes/components/Notification';
import { TransferList } from '@/modules/automacoes/components/TransferList';
import { RuleCriteria } from '@/modules/automacoes/components/RuleCriteria';
import { formatToBRL } from '@/modules/automacoes/utils/currencyUtils';
import { useStore } from '@/modules/automacoes/store/useStore';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesModal } from '@/components/common/UnsavedChangesModal';
import type { Database } from '@/modules/automacoes/lib/database.types';
import {
  mockCompanies,
  mockRuleTypes,
  mockAssetOrigins,
  mockBkpgChannels,
  mockOutputChannels,
  mockBanks,
  mockCustomers,
  mockSuppliers,
  createDefaultRule,
} from '@/modules/automacoes/lib/mockData';

type Rule = Database['public']['Tables']['rules']['Row'];
type Company = Database['public']['Tables']['company']['Row'];
type RuleType = Database['public']['Tables']['rule_type']['Row'];
type AssetOrigin = Database['public']['Tables']['asset_origin']['Row'];
type BkpgChannel = Database['public']['Tables']['bkpg_channel']['Row'];
type Customer = Database['public']['Tables']['customer']['Row'];
type OutputChannel = Database['public']['Tables']['output_channel']['Row'];
type Bank = Database['public']['Tables']['banks']['Row'];
type Supplier = Database['public']['Tables']['supplier']['Row'];

interface RuleDetailsProps {
  basePath?: string;
  ruleId?: string | null;
}

export default function RuleDetails({ basePath = '/app/automacoes', ruleId }: RuleDetailsProps) {
  const params = useParams();
  const id = ruleId || params.id;
  const navigate = useNavigate();
  const { companyId } = useStore();
  const { markChanged, markSaved, confirmIfUnsaved, isConfirmOpen, handleConfirm, handleCancel } = useUnsavedChanges();

  const [rule, setRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [ruleTypes, setRuleTypes] = useState<RuleType[]>([]);
  const [assetOrigins, setAssetOrigins] = useState<AssetOrigin[]>([]);
  const [bkpgChannels, setBkpgChannels] = useState<BkpgChannel[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([]);
  const [outputChannels, setOutputChannels] = useState<OutputChannel[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<number[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Resolve o tipo da regra pelo NOME (robusto a divergências de ID entre
  // ambientes), em vez de assumir IDs fixos.
  const selectedRuleType = ruleTypes.find((t) => t.id === rule?.rule_type_id);
  const selectedRuleTypeName = (selectedRuleType?.name || '').toLowerCase();
  const isEscrituracao = selectedRuleTypeName.includes('escritur');
  const isManifestacao = selectedRuleTypeName.includes('manifest');
  const usesCriteria = isEscrituracao || isManifestacao;
  const criteriaContext = isManifestacao ? 'manifestacao' : 'escrituracao';

  // Aplica um patch parcial na regra marcando o formulário como alterado.
  const patchRule = useCallback(
    (patch: Partial<Rule>) => {
      markChanged();
      setRule((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [markChanged],
  );

  const loadDropdownData = useCallback(async () => {
    try {
      const { data: currentCompany, error: companyError } = await supabase
        .from('company')
        .select('corporate_group_id')
        .eq('id', companyId)
        .maybeSingle();

      if (companyError) {
        console.warn('Error loading company:', companyError);
      }

      const companiesQuery = currentCompany?.corporate_group_id
        ? supabase.from('company').select('*').eq('corporate_group_id', currentCompany.corporate_group_id)
        : supabase.from('company').select('*');

      const [companiesResult, { data: ruleTypesData }, { data: originsData }, { data: channelsData }, { data: outputChannelsData }, { data: banksData }] =
        await Promise.all([
          companiesQuery,
          supabase.from('rule_type').select('*'),
          supabase.from('asset_origin').select('*'),
          supabase.from('bkpg_channel').select('*'),
          supabase.from('output_channel').select('*'),
          supabase.from('banks').select('*'),
        ]);

      setCompanies(companiesResult.data?.length ? companiesResult.data : mockCompanies);
      setRuleTypes(ruleTypesData?.length ? ruleTypesData : mockRuleTypes);
      setAssetOrigins(originsData?.length ? originsData : mockAssetOrigins);
      setBkpgChannels(channelsData?.length ? channelsData : mockBkpgChannels);
      setOutputChannels(outputChannelsData?.length ? outputChannelsData : mockOutputChannels);
      setBanks(banksData?.length ? banksData : mockBanks);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setCompanies(mockCompanies);
      setRuleTypes(mockRuleTypes);
      setAssetOrigins(mockAssetOrigins);
      setBkpgChannels(mockBkpgChannels);
      setOutputChannels(mockOutputChannels);
      setBanks(mockBanks);
    }
  }, [companyId]);

  async function loadSuppliers(companyIds: number[]) {
    if (!companyIds.length) return;
    try {
      const { data, error } = await supabase.from('supplier').select('*').in('company_id', companyIds);
      if (error) throw error;
      setAvailableSuppliers(data?.length ? data : mockSuppliers);
    } catch {
      setAvailableSuppliers(mockSuppliers);
    }
  }

  async function loadCustomers(companyIds: number[]) {
    if (!companyIds.length) return;
    try {
      const { data, error } = await supabase.from('customer').select('*').in('company_id', companyIds);
      if (error) throw error;
      setAvailableCustomers(data?.length ? data : mockCustomers);
    } catch {
      setAvailableCustomers(mockCustomers);
    }
  }

  async function loadRule() {
    if (!id || id === 'undefined') {
      setRule(createDefaultRule(companyId, mockCompanies, mockBkpgChannels, mockOutputChannels, mockBanks));
      setAvailableCustomers(mockCustomers);
      setAvailableSuppliers(mockSuppliers);
      setSelectedBanks([mockBanks[0]?.id || 0]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ruleId = parseInt(id);
      if (isNaN(ruleId)) throw new Error('ID inválido');

      const { data: ruleData, error } = await supabase.from('rules').select('*').eq('id', ruleId).maybeSingle();
      if (error) throw error;
      if (!ruleData) throw new Error('Regra não encontrada');

      setRule(ruleData);

      if (ruleData.company_code?.length > 0 && companies.length > 0) {
        const selectedCompanyIds = companies
          .filter((c) => c.company_code && ruleData.company_code?.includes(c.company_code))
          .map((c) => c.id);
        if (selectedCompanyIds.length > 0) {
          if (ruleData.asset_origin_id === 2) {
            await loadSuppliers(selectedCompanyIds);
          } else {
            await loadCustomers(selectedCompanyIds);
          }
        }
      }
    } catch (error) {
      console.error('Error loading rule:', error);
      setNotification({ type: 'error', message: 'Erro ao carregar a regra. Por favor, tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadDropdownData();
        await loadRule();
      } catch (error) {
        console.error('Error initializing data:', error);
        setNotification({ type: 'error', message: 'Erro ao carregar os dados. Por favor, recarregue a página.' });
        setLoading(false);
      }
    };

    if (id) {
      initializeData();
    } else {
      setLoading(false);
    }
  }, [id, loadDropdownData]);

  useEffect(() => {
    if (!rule || !companies.length) return;
    try {
      const selectedCompanyIds = companies
        .filter((c) => c.company_code && rule.company_code?.includes(c.company_code))
        .map((c) => c.id);

      if (selectedCompanyIds.length > 0) {
        // Escrituração e manifestação usam emissor (supplier) E cliente
        // (customer) como critérios independentes — ambas as listas são necessárias.
        if (usesCriteria || rule.asset_origin_id === 2) loadSuppliers(selectedCompanyIds);
        if (usesCriteria || rule.asset_origin_id !== 2) loadCustomers(selectedCompanyIds);
      } else {
        if (usesCriteria || rule.asset_origin_id === 2) setAvailableSuppliers(mockSuppliers);
        if (usesCriteria || rule.asset_origin_id !== 2) setAvailableCustomers(mockCustomers);
      }
    } catch {
      if (usesCriteria || rule.asset_origin_id === 2) setAvailableSuppliers(mockSuppliers);
      if (usesCriteria || rule.asset_origin_id !== 2) setAvailableCustomers(mockCustomers);
    }
  }, [rule?.asset_origin_id, companies, rule?.company_code, usesCriteria]);

  useEffect(() => {
    if (rule?.rule_type_id === 2 && rule.bank_id) {
      const bankIds = Array.isArray(rule.bank_id) ? rule.bank_id.map((i) => Number(i)) : [Number(rule.bank_id)];
      setSelectedBanks(bankIds);
    } else {
      setSelectedBanks([]);
    }
  }, [rule]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));

    if (selectedOptions.includes(-1)) {
      setRule((prev) => ({
        ...prev!,
        company_code: companies.map((c) => c.company_code || '').filter(Boolean),
      }));
      return;
    }

    const clickedCompanyId = selectedOptions[selectedOptions.length - 1];
    const clickedCompany = companies.find((c) => c.id === clickedCompanyId);
    if (!clickedCompany?.company_code) return;

    setRule((prev) => {
      const currentCodes = prev?.company_code || [];
      const isSelected = currentCodes.includes(clickedCompany.company_code!);
      return {
        ...prev!,
        company_code: isSelected
          ? currentCodes.filter((code) => code !== clickedCompany.company_code)
          : [...currentCodes, clickedCompany.company_code!],
      };
    });
  };

  const getSelectedCompanyIds = () => {
    if (!rule?.company_code) return [];
    return companies.filter((c) => c.company_code && rule.company_code.includes(c.company_code)).map((c) => c.id.toString());
  };

  const isSupplierMode = rule?.asset_origin_id === 2;
  const currentList = isSupplierMode ? rule?.supplier || [] : rule?.customer || [];
  const transferItems = (isSupplierMode ? availableSuppliers : availableCustomers).map((item) => ({
    id: item.id.toString(),
    name: item.name || 'Sem nome',
  }));

  const handleTransferAdd = (ids: string[]) => {
    if (!rule) return;
    const newList = [...new Set([...currentList, ...ids])];
    setRule((prev) => ({
      ...prev!,
      supplier: isSupplierMode ? newList : prev!.supplier || [],
      customer: !isSupplierMode ? newList : prev!.customer || [],
    }));
  };

  const handleTransferRemove = (ids: string[]) => {
    if (!rule) return;
    const updated = currentList.filter((x) => !ids.includes(x));
    setRule((prev) => ({
      ...prev!,
      supplier: isSupplierMode ? updated : prev!.supplier || [],
      customer: !isSupplierMode ? updated : prev!.customer || [],
    }));
  };

  const handleTransferAddAll = () => {
    if (!rule) return;
    const allIds = transferItems.filter((item) => !currentList.includes(item.id)).map((item) => item.id);
    const newList = [...currentList, ...allIds];
    setRule((prev) => ({
      ...prev!,
      supplier: isSupplierMode ? newList : prev!.supplier,
      customer: !isSupplierMode ? newList : prev!.customer,
    }));
  };

  const handleTransferRemoveAll = () => {
    if (!rule) return;
    setRule((prev) => ({
      ...prev!,
      supplier: isSupplierMode ? [] : prev!.supplier,
      customer: !isSupplierMode ? [] : prev!.customer,
    }));
  };

  const bankTransferItems = banks.map((b) => ({ id: b.id.toString(), name: b.name }));

  async function handleSave() {
    try {
      if (!rule) return;

      const validationErrors: string[] = [];
      if (!rule.name?.trim()) validationErrors.push('O nome da regra é obrigatório');
      if (!rule.rule_type_id) validationErrors.push('O tipo de regra é obrigatório');

      if (usesCriteria) {
        // Escrituração/manifestação: pelo menos um critério precisa estar ativo.
        const hasCriterio =
          (rule.supplier?.length ?? 0) > 0 ||
          (rule.customer?.length ?? 0) > 0 ||
          (rule.value_ini ?? 0) > 0 ||
          (rule.value_end ?? 0) > 0 ||
          rule.days_until_due_date_ini != null ||
          rule.days_until_due_date_end != null ||
          rule.issue_date_mode != null ||
          rule.due_date_mode != null ||
          (rule.value_divergence_pct ?? 0) > 0 ||
          (rule.value_divergence_abs ?? 0) > 0;
        if (!hasCriterio) validationErrors.push(`Defina pelo menos um critério de ${isManifestacao ? 'manifestação' : 'escrituração'}`);
      } else if (rule.rule_type_id === 2) {
        if (!rule.output_channel_id) validationErrors.push('O canal de saída é obrigatório para regras de Risco Sacado');
        if (selectedBanks.length === 0) validationErrors.push('Selecione pelo menos um banco');
        const items = rule.asset_origin_id === 2 ? rule.supplier : rule.customer;
        if (!items?.length) validationErrors.push(`Selecione pelo menos um ${rule.asset_origin_id === 2 ? 'fornecedor' : 'cliente'}`);
      } else if (rule.rule_type_id === 1) {
        const items = rule.asset_origin_id === 2 ? rule.supplier : rule.customer;
        if (!items?.length) validationErrors.push(`Selecione pelo menos um ${rule.asset_origin_id === 2 ? 'fornecedor' : 'cliente'}`);
      }

      if (validationErrors.length > 0) throw new Error(validationErrors.join('\n'));

      const ruleData = {
        created_at: new Date().toISOString(),
        name: rule.name.trim(),
        description: rule.description?.trim() || null,
        company_code: Array.isArray(rule.company_code) ? rule.company_code : [],
        rule_type_id: rule.rule_type_id ? Number(rule.rule_type_id) : null,
        asset_origin_id: rule.asset_origin_id ? Number(rule.asset_origin_id) : null,
        bkpg_channel_id: rule.bkpg_channel_id ? Number(rule.bkpg_channel_id) : null,
        // Escrituração/manifestação mantêm emissor e cliente como critérios independentes.
        supplier: usesCriteria || rule.asset_origin_id === 2 ? rule.supplier || [] : [],
        customer: usesCriteria || rule.asset_origin_id !== 2 ? rule.customer || [] : [],
        value_ini: rule.value_ini !== null && !isNaN(rule.value_ini) ? Number(rule.value_ini.toFixed(2)) : null,
        value_end: rule.value_end !== null && !isNaN(rule.value_end) ? Number(rule.value_end.toFixed(2)) : null,
        days_since_creation: rule.days_since_creation ? Number(rule.days_since_creation) : null,
        days_until_due_date_ini: rule.days_until_due_date_ini ?? null,
        days_until_due_date_end: rule.days_until_due_date_end ?? null,
        issue_date_mode: rule.issue_date_mode ?? null,
        issue_date_ini: rule.issue_date_ini ?? null,
        issue_date_end: rule.issue_date_end ?? null,
        issue_date_rel_days: rule.issue_date_rel_days ?? null,
        due_date_mode: rule.due_date_mode ?? null,
        due_date_ini: rule.due_date_ini ?? null,
        due_date_end: rule.due_date_end ?? null,
        due_date_rel_days: rule.due_date_rel_days ?? null,
        value_divergence_pct: isManifestacao ? rule.value_divergence_pct ?? null : null,
        value_divergence_abs: isManifestacao ? rule.value_divergence_abs ?? null : null,
        active: Boolean(rule.active),
        company_id: companyId,
        updated_at: new Date().toISOString(),
        output_channel_id: usesCriteria ? null : rule.output_channel_id,
        bank_id: !usesCriteria && rule.rule_type_id === 2 ? selectedBanks : [],
        asset_type_id: [1, 2, 3].includes(rule.rule_type_id!) ? 1 : null,
      };

      const { error } = await supabase.from('rules').update(ruleData).eq('id', id).select().maybeSingle();

      if (error) {
        if (error.code === '23505') throw new Error('Já existe uma regra com este nome.');
        if (error.code === '22P02') throw new Error('Erro de formato: verifique se todos os campos estão preenchidos corretamente.');
        if (error.code === '23502') throw new Error('Campos obrigatórios não foram preenchidos.');
        throw new Error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
      }

      markSaved();
      setNotification({ type: 'success', message: 'Regra atualizada com sucesso!' });
      setTimeout(() => navigate(basePath), 500);
    } catch (error) {
      console.error('Error saving rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar a regra. Por favor, tente novamente.';
      setNotification({ type: 'error', message: errorMessage });
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0070F2] border-r-transparent" />
          <span className="text-sm text-[#556B82]">Carregando detalhes da regra...</span>
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="max-w-4xl mx-auto">
        {notification && <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-[#1D2D3E]">Erro ao carregar regra</h1>
          <button onClick={() => navigate(basePath)} className="text-[#556B82] hover:text-[#1D2D3E] transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="bg-white rounded-lg border border-[#D3D6DA] p-6">
          <p className="text-sm text-red-600 mb-4">Regra não encontrada ou erro ao carregar os dados.</p>
          <button onClick={() => navigate(basePath)} className="btn btn-primary">
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {notification && <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

      <UnsavedChangesModal isOpen={isConfirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} />

      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-[#1D2D3E]">Detalhes da Regra</h1>
        <button onClick={() => confirmIfUnsaved(() => navigate(basePath))} className="text-[#556B82] hover:text-[#1D2D3E] transition-colors p-1 rounded-md hover:bg-[#F5F6F7]">
          <X size={20} />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#D3D6DA] p-6">
        <div className="space-y-5">
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Nome da Regra</label>
              <input
                type="text"
                className="input-field w-full"
                value={rule.name || ''}
                onChange={(e) => { markChanged(); setRule((prev) => ({ ...prev!, name: e.target.value })); }}
              />
            </div>
            <div className="flex items-center gap-2.5 pt-6">
              <span className="text-[13px] text-[#556B82] whitespace-nowrap">Regra ativa</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.active || false}
                  onChange={(e) => { markChanged(); setRule((prev) => ({ ...prev!, active: e.target.checked })); }}
                  className="sr-only peer"
                />
                <div className="w-10 h-[22px] bg-[#D3D6DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#0070F2]" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Descrição</label>
            <input
              type="text"
              className="input-field w-full"
              value={rule.description || ''}
              onChange={(e) => setRule((prev) => ({ ...prev!, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Empresas</label>
              <select
                multiple
                size={6}
                className="w-full border border-[#D3D6DA] rounded-[6px] text-[13px] overflow-y-auto cursor-pointer focus:outline-none focus:border-[#0070F2] focus:ring-1 focus:ring-[#0070F2]/20"
                value={getSelectedCompanyIds()}
                onChange={handleCompanyChange}
              >
                <option value="-1" className="px-3 py-1.5 text-[#0070F2] font-medium">
                  Todas as empresas
                </option>
                {companies.map((company) => (
                  <option
                    key={company.id}
                    value={company.id}
                    className={`px-3 py-1.5 ${rule.company_code?.includes(company.company_code || '') ? 'text-[#0070F2] bg-[#EBF3FF]' : 'text-[#1D2D3E]'}`}
                  >
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Tipo de Regra</label>
              <select
                className="select-field w-full"
                value={rule.rule_type_id || ''}
                onChange={(e) => setRule((prev) => ({ ...prev!, rule_type_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Selecione o tipo de regra</option>
                {ruleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Origem do Ativo</label>
              <select
                className="select-field w-full"
                value={rule.asset_origin_id || ''}
                onChange={(e) => setRule((prev) => ({ ...prev!, asset_origin_id: Number(e.target.value) }))}
              >
                <option value="">Selecione a origem do ativo</option>
                {assetOrigins.map((origin) => (
                  <option key={origin.id} value={origin.id}>
                    {origin.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Canal de obtenção de dados</label>
              <select
                className="select-field w-full"
                value={rule.bkpg_channel_id || ''}
                onChange={(e) => setRule((prev) => ({ ...prev!, bkpg_channel_id: Number(e.target.value) }))}
              >
                <option value="">Selecione o canal</option>
                {bkpgChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {usesCriteria ? (
            <>
              <hr className="border-[#E8EAED] my-1" />

              <RuleCriteria
                context={criteriaContext}
                rule={rule}
                onPatch={patchRule}
                emitters={availableSuppliers}
                clients={availableCustomers}
              />
            </>
          ) : (rule.rule_type_id === 1 || rule.rule_type_id === 2 || rule.rule_type_id === 3) ? (
            <>
              <hr className="border-[#E8EAED] my-1" />

              <h3 className="text-base font-semibold text-[#1D2D3E]">Seleção de Faturas</h3>

              <TransferList
                label={isSupplierMode ? 'Fornecedores' : 'Clientes'}
                searchPlaceholder={`Buscar ${isSupplierMode ? 'fornecedores' : 'clientes'}...`}
                availableItems={transferItems}
                selectedItemIds={currentList}
                onAdd={handleTransferAdd}
                onRemove={handleTransferRemove}
                onAddAll={handleTransferAddAll}
                onRemoveAll={handleTransferRemoveAll}
              />

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Valor inicial</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formatToBRL(rule.value_ini || 0)}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      const value = numericValue ? parseFloat((Number(numericValue) / 100).toFixed(2)) : 0;
                      setRule((prev) => ({ ...prev!, value_ini: value }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Valor final</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formatToBRL(rule.value_end || 0)}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      const value = numericValue ? parseFloat((Number(numericValue) / 100).toFixed(2)) : 0;
                      setRule((prev) => ({ ...prev!, value_end: value }));
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Dias desde a criação do ativo</label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={rule.days_since_creation || ''}
                  onChange={(e) => setRule((prev) => ({ ...prev!, days_since_creation: Number(e.target.value) }))}
                />
              </div>

              {rule.rule_type_id === 2 && (
                <>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1D2D3E] mb-1.5">Canal de saída</label>
                    <select
                      className="select-field w-full"
                      value={rule.output_channel_id || ''}
                      onChange={(e) => setRule((prev) => ({ ...prev!, output_channel_id: e.target.value ? Number(e.target.value) : null }))}
                    >
                      <option value="">Selecione o canal de saída</option>
                      {outputChannels.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          {channel.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <TransferList
                    label="Bancos autorizados"
                    searchPlaceholder="Buscar bancos..."
                    availableItems={bankTransferItems}
                    selectedItemIds={selectedBanks.map(String)}
                    onAdd={(ids) => {
                      setSelectedBanks((prev) => [...prev, ...ids.map(Number)]);
                    }}
                    onRemove={(ids) => {
                      setSelectedBanks((prev) => prev.filter((b) => !ids.map(Number).includes(b)));
                    }}
                    onAddAll={() => {
                      const available = banks.filter((b) => !selectedBanks.includes(b.id)).map((b) => b.id);
                      setSelectedBanks((prev) => [...prev, ...available]);
                    }}
                    onRemoveAll={() => setSelectedBanks([])}
                  />
                </>
              )}
            </>
          ) : null}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8EAED]">
            <button
              onClick={() => confirmIfUnsaved(() => navigate(basePath))}
              className="h-[34px] px-5 rounded-[6px] text-[13px] font-medium text-[#556B82] hover:bg-[#F5F6F7] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="h-[34px] px-6 rounded-[6px] text-[13px] font-medium bg-[#0070F2] text-white hover:bg-[#0060D2] transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
