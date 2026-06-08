import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '@/modules/automacoes/lib/supabase';
import { Notification } from '@/modules/automacoes/components/Notification';
import { formatToBRL } from '@/modules/automacoes/utils/currencyUtils';
import { useStore } from '@/modules/automacoes/store/useStore';
import {
  mockCompanies,
  mockRuleTypes,
  mockAssetOrigins,
  mockBkpgChannels,
  mockOutputChannels,
  mockBanks,
  mockCustomers,
  mockSuppliers,
} from '@/modules/automacoes/lib/mockData';
import type { Database } from '@/modules/automacoes/lib/database.types';

type Rule = Database['public']['Tables']['rules']['Row'];
type Company = Database['public']['Tables']['company']['Row'];
type RuleType = Database['public']['Tables']['rule_type']['Row'];
type AssetOrigin = Database['public']['Tables']['asset_origin']['Row'];
type BkpgChannel = Database['public']['Tables']['bkpg_channel']['Row'];
type Customer = Database['public']['Tables']['customer']['Row'];
type Supplier = Database['public']['Tables']['supplier']['Row'];
type OutputChannel = Database['public']['Tables']['output_channel']['Row'];
type Bank = Database['public']['Tables']['banks']['Row'];

export default function NewRule({ basePath = '/app/automacoes' }) {
  const navigate = useNavigate();
  const { companyId } = useStore();
  const [rule, setRule] = useState<Rule>({
    id: 0,
    created_at: new Date().toISOString(),
    name: '',
    description: '',
    rule_type_id: null,
    company_code: [],
    days_since_creation: null,
    value_ini: null,
    value_end: null,
    days_until_due_date_ini: null,
    days_until_due_date_end: null,
    active: false,
    asset_type_id: null,
    company_id: companyId,
    bkpg_channel_id: null,
    creator: null,
    updated_at: null,
    asset_origin_id: 2,
    supplier: [],
    customer: [],
    certf_digital: null
  }); 
  const [companies, setCompanies] = useState<Company[]>([]);
  const [ruleTypes, setRuleTypes] = useState<RuleType[]>([]);
  const [assetOrigins, setAssetOrigins] = useState<AssetOrigin[]>([]);
  const [bkpgChannels, setBkpgChannels] = useState<BkpgChannel[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([]);
  const [outputChannels, setOutputChannels] = useState<OutputChannel[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<number[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBanksToAdd, setSelectedBanksToAdd] = useState<number[]>([]);
  const [selectedBanksToRemove, setSelectedBanksToRemove] = useState<number[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomersToAdd, setSelectedCustomersToAdd] = useState<string[]>([]);
  const [selectedCustomersToRemove, setSelectedCustomersToRemove] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (companyId) {
      setRule(prev => ({
        ...prev,
        company_id: companyId
      }));
    }
  }, [companyId, rule.asset_origin_id]);

  // Update customers/suppliers when selected companies change
  useEffect(() => {
    if (rule.company_code && rule.company_code.length > 0) {
      const selectedCompanies = companies
        .filter(company => company.company_code && rule.company_code?.includes(company.company_code))
        .map(company => company.id);
      
      if (selectedCompanies.length > 0) {
        loadCustomers(selectedCompanies);
        loadSuppliers(selectedCompanies);
      }
    }
  }, [rule.company_code]);

  async function loadSuppliers(companyIds: number[]) {
    try {
      const { data, error } = await supabase
        .from('supplier')
        .select('*')
        .in('company_id', companyIds);

      if (error) throw error;
      setAvailableSuppliers(data?.length ? data : mockSuppliers as unknown as Supplier[]);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setAvailableSuppliers(mockSuppliers as unknown as Supplier[]);
    }
  }

  async function loadCustomers(companyIds: number[]) {
    try {
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .in('company_id', companyIds);

      if (error) throw error;
      setAvailableCustomers(data?.length ? data : mockCustomers as unknown as Customer[]);
    } catch (error) {
      console.error('Error loading customers:', error);
      setAvailableCustomers(mockCustomers as unknown as Customer[]);
    }
  }

  async function loadDropdownData() {
    try {
      const { data: currentCompany } = await supabase
        .from('company')
        .select('corporate_group_id')
        .eq('id', companyId)
        .maybeSingle();

      const companiesQuery = currentCompany?.corporate_group_id
        ? supabase
            .from('company')
            .select('*')
            .eq('corporate_group_id', currentCompany.corporate_group_id)
        : supabase.from('company').select('*');

      const [
        companiesResult,
        { data: ruleTypesData },
        { data: originsData },
        { data: channelsData },
        { data: outputChannelsData },
        { data: banksData }
      ] = await Promise.all([
        companiesQuery,
        supabase.from('rule_type').select('*'),
        supabase.from('asset_origin').select('*'),
        supabase.from('bkpg_channel').select('*'),
        supabase.from('output_channel').select('*'),
        supabase.from('banks').select('*'),
      ]);

      setCompanies(companiesResult.data?.length ? companiesResult.data : mockCompanies as unknown as Company[]);
      setRuleTypes(ruleTypesData?.length ? ruleTypesData : mockRuleTypes as unknown as RuleType[]);
      setAssetOrigins(originsData?.length ? originsData : mockAssetOrigins as unknown as AssetOrigin[]);
      setBkpgChannels(channelsData?.length ? channelsData : mockBkpgChannels as unknown as BkpgChannel[]);
      setOutputChannels(outputChannelsData?.length ? outputChannelsData : mockOutputChannels as unknown as OutputChannel[]);
      setBanks(banksData?.length ? banksData : mockBanks as unknown as Bank[]);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setCompanies(mockCompanies as unknown as Company[]);
      setRuleTypes(mockRuleTypes as unknown as RuleType[]);
      setAssetOrigins(mockAssetOrigins as unknown as AssetOrigin[]);
      setBkpgChannels(mockBkpgChannels as unknown as BkpgChannel[]);
      setOutputChannels(mockOutputChannels as unknown as OutputChannel[]);
      setBanks(mockBanks as unknown as Bank[]);
    }
  }

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => Number(option.value));
    
    // Handle "all companies" option
    if (selectedOptions.includes(-1)) {
      setRule(prev => ({
        ...prev,
        company_code: companies.map(company => company.company_code || '').filter(Boolean)
      }));
      return;
    }

    // Get the clicked company ID (last item in selectedOptions)
    const clickedCompanyId = selectedOptions[selectedOptions.length - 1];
    const clickedCompany = companies.find(company => company.id === clickedCompanyId);
    
    if (!clickedCompany?.company_code) return;

    // Toggle the clicked company's selection
    setRule(prev => {
      const currentCodes = prev.company_code || [];
      const isSelected = currentCodes.includes(clickedCompany.company_code!);

      return {
        ...prev,
        company_code: isSelected
          ? currentCodes.filter(code => code !== clickedCompany.company_code)
          : [...currentCodes, clickedCompany.company_code!]
      };
    });
  };

  const getSelectedCompanyIds = () => {
    if (!rule.company_code) return [];
    
    return companies
      .filter(company => company.company_code && rule.company_code.includes(company.company_code))
      .map(company => company.id.toString());
  };

  async function handleSave() {
    try {
      // Validações detalhadas com mensagens específicas
      const validationErrors = [];
      
      if (!rule.name?.trim()) {
        validationErrors.push('O nome da regra é obrigatório');
      }
      
      if (!rule.rule_type_id) {
        validationErrors.push('O tipo de regra é obrigatório');
      }

      if (rule.rule_type_id === 2) {
        if (!rule.output_channel_id) {
          validationErrors.push('O canal de saída é obrigatório para regras de Risco Sacado');
        }
        if (selectedBanks.length === 0) {
          validationErrors.push('Selecione pelo menos um banco autorizado');
        }
      }
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // Preparar dados para inserção
      const ruleData = {
        name: rule.name.trim(),
        description: rule.description?.trim() || null,
        partner_type: rule.asset_origin_id === 2 ? 1 : 2,
        asset_type_id: rule.rule_type_id === 1 || rule.rule_type_id === 2 ? 1 : null,
        company_code: Array.isArray(rule.company_code) ? rule.company_code : [],
        rule_type_id: rule.rule_type_id ? Number(rule.rule_type_id) : null,
        asset_origin_id: rule.asset_origin_id ? Number(rule.asset_origin_id) : null,
        bkpg_channel_id: rule.bkpg_channel_id ? Number(rule.bkpg_channel_id) : null,
        partner: Array.isArray(rule.partner) ? rule.partner : [],
        value_ini: rule.value_ini !== null && !isNaN(rule.value_ini) ? Number(rule.value_ini.toFixed(2)) : null,
        value_end: rule.value_end !== null && !isNaN(rule.value_end) ? Number(rule.value_end.toFixed(2)) : null,
        days_since_creation: rule.days_since_creation ? Number(rule.days_since_creation) : null,
        active: Boolean(rule.active),
        company_id: Number(companyId),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        output_channel_id: rule.output_channel_id,
        bank_id: rule.rule_type_id === 2 ? selectedBanks : []
      };

      const { data, error } = await supabase
        .from('rules')
        .insert([ruleData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe uma regra com este nome.');
        } else if (error.code === '22P02') {
          throw new Error('Erro de formato: verifique se todos os campos estão preenchidos corretamente.');
        } else if (error.code === '23502') {
          throw new Error('Campos obrigatórios não foram preenchidos.');
        }
        throw new Error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
      }

      if (!data) {
        throw new Error('Não foi possível criar a regra. Nenhum dado retornado.');
      }

      setNotification({
        type: 'success',
        message: 'Regra criada com sucesso!'
      });

      // Aguarda a notificação ser exibida antes de navegar
      setTimeout(() => navigate(basePath), 500);

    } catch (error) {
      console.error('Error saving rule:', error);
      
      let errorMessage = 'Erro ao salvar a regra. Por favor, tente novamente.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = (error as any).message || (error as any).details || errorMessage;
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    }
  }

  // Customer management functions
  const handleAddSelected = () => {
    if (!rule) return;
    
    // Pega a lista atual baseada na origem do ativo
    const currentList = rule.asset_origin_id === 2 ? (rule.supplier || []) : (rule.customer || []);
    
    // Adiciona os itens selecionados à lista atual
    const newList = [...new Set([...currentList, ...selectedCustomersToAdd])];
    
    // Atualiza o estado da regra com a nova lista
    setRule(prev => ({
      ...prev,
      supplier: prev.asset_origin_id === 2 ? newList : prev.supplier || [],
      customer: prev.asset_origin_id !== 2 ? newList : prev.customer || []
    }));
    
    // Limpa a seleção
    setSelectedCustomersToAdd([]);
  };

  const handleRemoveSelected = () => {
    if (!rule) return;
    
    // Pega a lista atual baseada na origem do ativo
    const currentList = rule.asset_origin_id === 2 ? (rule.supplier || []) : (rule.customer || []);
    
    // Remove os itens selecionados da lista atual
    const updatedList = currentList.filter(id => !selectedCustomersToRemove.includes(id));
    
    // Atualiza o estado da regra com a lista atualizada
    setRule(prev => ({
      ...prev,
      supplier: prev.asset_origin_id === 2 ? updatedList : prev.supplier || [],
      customer: prev.asset_origin_id !== 2 ? updatedList : prev.customer || []
    }));
    
    // Limpa a seleção
    setSelectedCustomersToRemove([]);
  };

  const handleAddAllCustomers = () => {
    const allIds = (rule.asset_origin_id === 2 ? availableSuppliers : availableCustomers)
      .map(item => item.id);
    
    const uniqueIds = Array.from(new Set(allIds));
    
    setRule(prev => ({
      ...prev,
      supplier: prev.asset_origin_id === 2 ? uniqueIds : [],
      customer: prev.asset_origin_id !== 2 ? uniqueIds : []
    }));
    setSelectedCustomersToAdd([]);
  };

  const handleRemoveAllCustomers = () => {
    setRule(prev => ({
      ...prev,
      supplier: prev.asset_origin_id === 2 ? [] : prev.supplier,
      customer: prev.asset_origin_id !== 2 ? [] : prev.customer
    }));
  };

  const handleToggleSelect = (customerId: string) => {
    setSelectedCustomersToAdd(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleToggleRemove = (customerId: string) => {
    setSelectedCustomersToRemove(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const filteredCustomers = availableCustomers.filter(customer => 
    customer && !(rule.asset_origin_id === 2 ? rule.supplier || [] : rule.customer || []).includes(customer.id) && (
      customer.id.toString().toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer.name?.toLowerCase() || '').includes(customerSearch.toLowerCase())
    )
  );

  const selectedCustomerDetails = availableCustomers.filter(
    customer => customer && (rule.asset_origin_id === 2 ? rule.supplier?.includes(customer.id.toString()) : rule.customer?.includes(customer.id.toString()))
  );

  return (
    <div className="max-w-4xl mx-auto">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">
          Nova Regra
        </h1>
        <button
          onClick={() => navigate(basePath)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* First Section */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium text-primary mb-1">
                Nome da Regra
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={rule.name || ''}
                onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="ml-4 flex items-center">
              <span className="mr-2 text-sm">Regra ativa</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.active || false}
                  onChange={(e) => setRule(prev => ({ ...prev, active: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Descrição
            </label>
            <input
              type="text"
              className="input-field w-full"
              value={rule.description || ''}
              onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Empresas
              </label>
              <select 
                multiple
                size={5}
                className="select-field w-full h-32 overflow-y-auto cursor-pointer focus:outline-none"
                value={getSelectedCompanyIds()}
                onChange={handleCompanyChange}
              >
                <option value="-1" className="font-medium text-blue-600">
                  Todas as empresas
                </option>
                {companies.map(company => (
                  <option
                    key={company.id}
                    value={company.id}
                    className={`py-1 px-2 hover:bg-gray-100 ${
                      rule.company_code?.includes(company.company_code || '')
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Tipo de Regra
              </label>
              <select
                className="select-field w-full"
                value={rule.rule_type_id || ''}
                onChange={(e) => setRule(prev => ({
                  ...prev,
                  rule_type_id: e.target.value ? Number(e.target.value) : null,
                  // Set default asset origin based on rule type
                  asset_origin_id: e.target.value === '1' ? 1 : e.target.value === '2' ? 2 : null
                }))}
              >
                <option value="">Selecione o tipo de regra</option>
                {ruleTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Origem do Ativo
              </label>
              <select
                className="select-field w-full"
                value={rule.asset_origin_id || ''}
                onChange={(e) => setRule(prev => ({ ...prev, asset_origin_id: Number(e.target.value) }))}
              >
                <option value="">Selecione a origem do ativo</option>
                {assetOrigins.map(origin => (
                  <option key={origin.id} value={origin.id}>
                    {origin.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Canal de obtenção de dados
              </label>
              <select
                className="select-field w-full"
                value={rule.bkpg_channel_id || ''}
                onChange={(e) => setRule(prev => ({ ...prev, bkpg_channel_id: Number(e.target.value) }))}
              >
                <option value="">Selecione o canal</option>
                {bkpgChannels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="my-6" />

          {rule.rule_type_id === 1 ? (
            <>
              <h3 className="text-lg font-medium text-primary">Seleção de Faturas</h3>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {rule.asset_origin_id === 2 ? 'Fornecedores' : 'Clientes'}
                </label>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
                  {/* Left Panel - Available Items */}
                  <div className="border rounded-md p-4">
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder={`Buscar ${rule.asset_origin_id === 2 ? 'fornecedores' : 'clientes'}...`}
                        className="input-field w-full pl-8"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <div className="h-48 overflow-y-auto">
                      {(rule.asset_origin_id === 2 ? availableSuppliers : availableCustomers)
                        .filter(item => {
                          const currentList = rule.asset_origin_id === 2 ? (rule.supplier || []) : (rule.customer || []);
                          return !currentList.includes(item.id.toString()) &&
                            (item.name?.toLowerCase() || '').includes(customerSearch.toLowerCase());
                        })
                        .map(item => (
                          <div
                            key={item.id}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                setSelectedCustomersToAdd(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCustomersToAdd.includes(item.id.toString())}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedCustomersToAdd(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }}
                              className="mr-2"
                            />
                            <div className="text-sm">{item.name || 'Sem nome'}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Middle Section - Action Buttons */}
                  <div className="flex flex-col justify-center gap-2">
                    <button
                      onClick={() => {
                        if (selectedCustomersToAdd.length > 0) {
                          handleAddSelected();
                        }
                      }}
                      disabled={selectedCustomersToAdd.length === 0}
                      className="btn bg-[#0070F2] text-white hover:bg-[#0060D2] whitespace-nowrap"
                    >
                      Adicionar &gt;
                    </button>
                    <button
                      onClick={handleRemoveSelected}
                      disabled={selectedCustomersToRemove.length === 0}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      &lt; Remover
                    </button>
                    <button
                      onClick={handleAddAllCustomers}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      Adicionar todos &gt;&gt;
                    </button>
                    <button
                      onClick={handleRemoveAllCustomers}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      &lt;&lt; Remover todos
                    </button>
                  </div>

                  {/* Right Panel - Selected Items */}
                  <div className="border rounded-md p-4">
                    <div className="h-48 overflow-y-auto">
                      {(rule.asset_origin_id === 2 ? availableSuppliers : availableCustomers)
                        .filter(item => {
                          const currentList = rule.asset_origin_id === 2 ? (rule.supplier || []) : (rule.customer || []);
                          return currentList.includes(item.id.toString());
                        })
                        .map(item => (
                          <div
                            key={item.id}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                setSelectedCustomersToRemove(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCustomersToRemove.includes(item.id.toString())}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedCustomersToRemove(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }}
                              className="mr-2"
                            />
                            <div className="text-sm">{item.name || 'Sem nome'}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Valor inicial
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input-field w-full"
                      value={formatToBRL(rule.value_ini || 0)}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        const value = numericValue ? parseFloat((Number(numericValue) / 100).toFixed(2)) : 0;
                        setRule(prev => ({ ...prev, value_ini: value }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Valor final
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input-field w-full"
                      value={formatToBRL(rule.value_end || 0)}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        const value = numericValue ? parseFloat((Number(numericValue) / 100).toFixed(2)) : 0;
                        setRule(prev => ({ ...prev, value_end: value }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Dias desde a criação do ativo
                </label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={rule.days_since_creation || ''}
                  onChange={(e) => setRule(prev => ({ ...prev, days_since_creation: Number(e.target.value) }))}
                />
              </div>
            </>
          ) : rule.rule_type_id === 2 ? (
            <>
              <h3 className="text-lg font-medium text-primary">Configuração de Risco Sacado</h3>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {rule.asset_origin_id === 2 ? 'Fornecedores' : 'Clientes'}
                </label>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
                  {/* Left Panel - Available Items */}
                  <div className="border rounded-md p-4">
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder={`Buscar ${rule.asset_origin_id === 2 ? 'fornecedores' : 'clientes'}...`}
                        className="input-field w-full pl-8"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <div className="h-48 overflow-y-auto">
                      {(rule.asset_origin_id === 2 ? availableSuppliers : availableCustomers)
                        .filter(item => {
                          const currentList = rule.asset_origin_id === 2 ? (rule.supplier || []) : (rule.customer || []);
                          return !currentList.includes(item.id.toString()) &&
                            (item.name?.toLowerCase() || '').includes(customerSearch.toLowerCase());
                        })
                        .map(item => (
                          <div
                            key={item.id}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                setSelectedCustomersToAdd(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCustomersToAdd.includes(item.id.toString())}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedCustomersToAdd(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }}
                              className="mr-2"
                            />
                            <div className="text-sm">{item.name || 'Sem nome'}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Middle Section - Action Buttons */}
                  <div className="flex flex-col justify-center gap-2">
                    <button
                      onClick={() => {
                        if (selectedCustomersToAdd.length > 0) {
                          handleAddSelected();
                        }
                      }}
                      disabled={selectedCustomersToAdd.length === 0}
                      className="btn bg-[#0070F2] text-white hover:bg-[#0060D2] whitespace-nowrap"
                    >
                      Adicionar &gt;
                    </button>
                    <button
                      onClick={handleRemoveSelected}
                      disabled={selectedCustomersToRemove.length === 0}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      &lt; Remover
                    </button>
                    <button
                      onClick={handleAddAllCustomers}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      Adicionar todos &gt;&gt;
                    </button>
                    <button
                      onClick={handleRemoveAllCustomers}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      &lt;&lt; Remover todos
                    </button>
                  </div>

                  {/* Right Panel - Selected Items */}
                  <div className="border rounded-md p-4">
                    <div className="h-48 overflow-y-auto">
                      {(rule.asset_origin_id === 2 ? availableSuppliers : availableCustomers)
                        .filter(item => {
                          const currentList = rule.asset_origin_id === 2 ? (rule.supplier || []) : (rule.customer || []);
                          return currentList.includes(item.id.toString());
                        })
                        .map(item => (
                          <div
                            key={item.id}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                setSelectedCustomersToRemove(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCustomersToRemove.includes(item.id.toString())}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedCustomersToRemove(prev => 
                                  prev.includes(item.id.toString())
                                    ? prev.filter(id => id !== item.id.toString())
                                    : [...prev, item.id.toString()]
                                );
                              }}
                              className="mr-2"
                            />
                            <div className="text-sm">{item.name || 'Sem nome'}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Valor inicial
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input-field w-full"
                        value={formatToBRL(rule.value_ini || 0)}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '');
                          const value = numericValue ? parseFloat((Number(numericValue) / 100).toFixed(2)) : 0;
                          setRule(prev => ({ ...prev, value_ini: value }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Valor final
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input-field w-full"
                        value={formatToBRL(rule.value_end || 0)}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '');
                          const value = numericValue ? parseFloat((Number(numericValue) / 100).toFixed(2)) : 0;
                          setRule(prev => ({ ...prev, value_end: value }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Dias desde a criação do ativo
                  </label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={rule.days_since_creation || ''}
                    onChange={(e) => setRule(prev => ({ ...prev, days_since_creation: Number(e.target.value) }))}
                  />
                </div>

                <label className="block text-sm font-medium text-primary mb-1">
                  Canal de saída
                </label>
                <select
                  className="select-field w-full"
                  value={rule.output_channel_id || ''}
                  onChange={(e) => setRule(prev => ({
                    ...prev,
                    output_channel_id: e.target.value ? Number(e.target.value) : null
                  }))}
                >
                  <option value="">Selecione o canal de saída</option>
                  {outputChannels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-primary mb-1">
                  Bancos autorizados
                </label>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
                  {/* Left Panel - Available Banks */}
                  <div className="border rounded-md p-4">
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder="Buscar bancos..."
                        className="input-field w-full pl-8"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                      />
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <div className="h-48 overflow-y-auto">
                      {banks
                        .filter(bank => 
                          !selectedBanks.includes(bank.id) &&
                          bank.name.toLowerCase().includes(bankSearch.toLowerCase())
                        )
                        .map(bank => (
                          <div
                            key={bank.id}
                            className="flex items-center p-2 hover:bg-gray-50"
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                setSelectedBanksToAdd(prev => 
                                  prev.includes(bank.id)
                                    ? prev.filter(id => id !== bank.id)
                                    : [...prev, bank.id]
                                );
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedBanksToAdd.includes(bank.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedBanksToAdd(prev => 
                                  prev.includes(bank.id)
                                    ? prev.filter(id => id !== bank.id)
                                    : [...prev, bank.id]
                                );
                              }}
                              className="mr-2"
                            />
                            <div className="text-sm">{bank.name}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Middle Section - Action Buttons */}
                  <div className="flex flex-col justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedBanks(prev => [...prev, ...selectedBanksToAdd]);
                        setSelectedBanksToAdd([]);
                      }}
                      disabled={selectedBanksToAdd.length === 0}
                      className="btn bg-[#0070F2] text-white hover:bg-[#0060D2] whitespace-nowrap"
                    >
                      Adicionar &gt;
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBanks(prev => 
                          prev.filter(id => !selectedBanksToRemove.includes(id))
                        );
                        setSelectedBanksToRemove([]);
                      }}
                      disabled={selectedBanksToRemove.length === 0}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      &lt; Remover
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBanks(banks.map(bank => bank.id));
                        setSelectedBanksToAdd([]);
                      }}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      Adicionar todos &gt;&gt;
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBanks([]);
                        setSelectedBanksToRemove([]);
                      }}
                      className="btn bg-white border border-gray-300 text-[#0070F2] hover:bg-gray-50 whitespace-nowrap"
                    >
                      &lt;&lt; Remover todos
                    </button>
                  </div>

                  {/* Right Panel - Selected Banks */}
                  <div className="border rounded-md p-4">
                    <div className="h-48 overflow-y-auto">
                      {banks
                        .filter(bank => selectedBanks.includes(bank.id))
                        .map(bank => (
                          <div
                            key={bank.id}
                            className="flex items-center p-2 hover:bg-gray-50"
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox') {
                                setSelectedBanksToRemove(prev => 
                                  prev.includes(bank.id)
                                    ? prev.filter(id => id !== bank.id)
                                    : [...prev, bank.id]
                                );
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedBanksToRemove.includes(bank.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedBanksToRemove(prev => 
                                  prev.includes(bank.id)
                                    ? prev.filter(id => id !== bank.id)
                                    : [...prev, bank.id]
                                );
                              }}
                              className="mr-2"
                            />
                            <div className="text-sm">{bank.name}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => navigate(basePath)}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700">
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
