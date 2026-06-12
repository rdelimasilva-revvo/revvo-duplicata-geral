import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, MoreVertical, Power, Trash2, ArrowUpDown, Filter, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/modules/automacoes/lib/supabase';
import { useStore } from '@/modules/automacoes/store/useStore';
import { formatToBRL } from '@/modules/automacoes/utils/currencyUtils';
import { formatDate } from '@/modules/automacoes/utils/dateUtils';
import { Notification } from '@/modules/automacoes/components/Notification';
import { DeleteConfirmationModal } from '@/modules/automacoes/components/DeleteConfirmationModal';
import { NewRuleModal } from '@/modules/automacoes/components/NewRuleModal';
import { UndoToast } from '@/components/common/UndoToast';
import { mockRules, mockRuleTypes } from '@/modules/automacoes/lib/mockData';
import type { Database } from '@/modules/automacoes/lib/database.types';

type Rule = Database['public']['Tables']['rules']['Row'];
type RuleType = Database['public']['Tables']['rule_type']['Row'];

type TabType = 'manifestacao' | 'escrituracao';

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') return true;
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: string }).message;
    return msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network');
  }
  return false;
}

export default function RulesList({ basePath = '/app/automacoes' }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleTypes, setRuleTypes] = useState<RuleType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('manifestacao');
  const [selectedRuleType, setSelectedRuleType] = useState<number | ''>('');
  const [sortField, setSortField] = useState<'name' | 'updated_at'>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletedRule, setDeletedRule] = useState<Rule | null>(null);
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const navigate = useNavigate();
  const { companyId } = useStore();

  useEffect(() => {
    loadRules();
  }, [companyId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.rule-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  function loadMockData() {
    const adaptedRules = mockRules.map(r => ({
      ...r,
      rule_type_id: r.rule_type ?? null,
      active: r.status === 'active',
      value_ini: r.amount_min ?? null,
      value_end: r.amount_max ?? null,
      company_code: null,
      asset_origin_id: null,
      asset_type_id: null,
      bkpg_channel_id: null,
      output_channel_id: null,
      bank_id: null,
      supplier: null,
      customer: null,
      certf_digital: null,
      days_until_due_date_ini: null,
      days_until_due_date_end: null,
      creator: null,
    })) as unknown as Rule[];

    const sortedRules = sortRules(adaptedRules, sortField, sortDirection);
    setRules(sortedRules);
    setRuleTypes(mockRuleTypes as unknown as RuleType[]);
    setUsingMockData(true);
  }

  async function loadRules() {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: rulesData, error: rulesError },
        { data: ruleTypesData, error: ruleTypesError }
      ] = await Promise.all([
        supabase
          .from('rules')
          .select('*')
          .eq('company_id', companyId),
        supabase
          .from('rule_type')
          .select('*')
      ]);

      if (rulesError) throw rulesError;
      if (ruleTypesError) throw ruleTypesError;

      const sortedRules = sortRules(rulesData || [], sortField, sortDirection);
      setRules(sortedRules);
      setRuleTypes(ruleTypesData || []);
      setUsingMockData(false);
    } catch (err) {
      console.error('Error loading rules:', err);
      if (isNetworkError(err)) {
        loadMockData();
      } else {
        setError('Não foi possível carregar as regras. Tente novamente.');
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActive = async (rule: Rule, event?: React.SyntheticEvent) => {
    event?.stopPropagation();
    try {
      if (!usingMockData) {
        const { error } = await supabase
          .from('rules')
          .update({ active: !rule.active })
          .eq('id', rule.id);

        if (error) throw error;
      }

      setRules(prev => prev.map(r =>
        r.id === rule.id ? { ...r, active: !r.active } : r
      ));

      setNotification({
        type: 'success',
        message: `Regra ${!rule.active ? 'ativada' : 'desativada'} com sucesso!`
      });
    } catch (err) {
      console.error('Error toggling rule:', err);
      setRules(prev => prev.map(r =>
        r.id === rule.id ? { ...r, active: !r.active } : r
      ));
      setNotification({
        type: 'success',
        message: `Regra ${!rule.active ? 'ativada' : 'desativada'} localmente.`
      });
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (ruleId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    setRuleToDelete(rule);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;

    setDeleting(true);
    try {
      if (!usingMockData) {
        const { error } = await supabase
          .from('rules')
          .delete()
          .eq('id', ruleToDelete.id);

        if (error) throw error;
      }

      setRules(prev => prev.filter(rule => rule.id !== ruleToDelete.id));
      setDeletedRule(ruleToDelete);
      setDeleteModalOpen(false);
      setRuleToDelete(null);
    } catch (err) {
      console.error('Error deleting rule:', err);
      setNotification({
        type: 'error',
        message: 'Erro ao excluir a regra'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUndoDelete = async () => {
    if (!deletedRule) return;

    const ruleToRestore = deletedRule;
    setDeletedRule(null);

    try {
      if (usingMockData) {
        setRules(prev => sortRules([...prev, ruleToRestore], sortField, sortDirection));
      } else {
        // Re-insere a regra com os mesmos dados (o banco gera um novo id)
        const { id: _id, ...ruleData } = ruleToRestore;
        const { data, error } = await supabase
          .from('rules')
          .insert([ruleData])
          .select()
          .single();

        if (error) throw error;

        setRules(prev => sortRules([...prev, (data ?? ruleToRestore) as Rule], sortField, sortDirection));
      }

      setNotification({
        type: 'success',
        message: 'Exclusão desfeita com sucesso!'
      });
    } catch (err) {
      console.error('Error restoring rule:', err);
      setNotification({
        type: 'error',
        message: 'Não foi possível desfazer a exclusão da regra.'
      });
    }
  };

  const sortRules = (rules: Rule[], field: 'name' | 'updated_at', direction: 'asc' | 'desc') => {
    return [...rules].sort((a, b) => {
      let comparison = 0;

      if (field === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (field === 'updated_at') {
        comparison = new Date(a.updated_at || '').getTime() - new Date(b.updated_at || '').getTime();
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field: 'name' | 'updated_at') => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    setRules(sortRules(rules, field, newDirection));
  };

  const getTabRuleTypeId = (tab: TabType): number | null => {
    const ruleType = ruleTypes.find(type => {
      const typeName = type.name?.toLowerCase();
      if (tab === 'manifestacao') {
        return typeName?.includes('manifest');
      }
      if (tab === 'escrituracao') {
        return typeName === 'escrituração de duplicatas';
      }
      return false;
    });
    return ruleType?.id || null;
  };

  const filteredRules = rules.filter(rule => {
    const tabRuleTypeId = getTabRuleTypeId(activeTab);
    const matchesTab = tabRuleTypeId ? rule.rule_type_id === tabRuleTypeId : true;
    const matchesFilter = selectedRuleType === '' || rule.rule_type_id === selectedRuleType;
    return matchesTab && matchesFilter;
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRuleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        ruleName={ruleToDelete?.name || ''}
        loading={deleting}
      />
      <NewRuleModal
        isOpen={isNewRuleModalOpen}
        onClose={() => setIsNewRuleModalOpen(false)}
        onSuccess={() => {
          setNotification({
            type: 'success',
            message: 'Regra criada com sucesso!'
          });
          loadRules();
        }}
      />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {deletedRule && (
        <UndoToast
          message={`Regra "${deletedRule.name}" excluída.`}
          onUndo={handleUndoDelete}
          onClose={() => setDeletedRule(null)}
          duration={10000}
        />
      )}

      {usingMockData && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            Exibindo dados de demonstração. A conexão com o servidor não está disponível no momento.
          </p>
          <button
            onClick={loadRules}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      {error && !usingMockData && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
          <button
            onClick={loadRules}
            className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">Parametrização de Regras</h1>
        <button
          onClick={() => setIsNewRuleModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Nova regra
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('manifestacao')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'manifestacao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manifestação
          </button>
          <button
            onClick={() => setActiveTab('escrituracao')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'escrituracao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Escrituração
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar regras..."
            className="input-field w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => handleSort('name')}
            className={`flex items-center gap-1 text-sm font-medium ${
              sortField === 'name' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Nome da Regra
            <ArrowUpDown size={16} className={sortField === 'name' ? 'text-blue-600' : 'text-gray-400'} />
          </button>
          <button
            onClick={() => handleSort('updated_at')}
            className={`flex items-center gap-1 text-sm font-medium ${
              sortField === 'updated_at' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Data de Atualização
            <ArrowUpDown size={16} className={sortField === 'updated_at' ? 'text-blue-600' : 'text-gray-400'} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedRuleType}
            onChange={(e) => setSelectedRuleType(e.target.value ? Number(e.target.value) : '')}
            className="select-field text-sm"
          >
            <option value="">Todos os tipos</option>
            {ruleTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <RefreshCw size={24} className="animate-spin mb-3" />
          <p className="text-sm">Carregando regras...</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-1">Nenhuma regra encontrada.</p>
          <p className="text-sm text-gray-400">Clique em "Nova regra" para criar uma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-xl border cursor-pointer transition-all hover:shadow-md hover:border-blue-200 flex flex-col ${
                rule.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => navigate(`${basePath}/rule/${rule.id}`)}
            >
              <div className={`p-4 flex-grow flex flex-col ${rule.active ? '' : 'opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    rule.active ? 'bg-blue-50 text-[#0070F2]' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Zap size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                      {ruleTypes.find(type => type.id === rule.rule_type_id)?.name || 'Tipo não definido'}
                    </p>
                    <h3 className="font-semibold text-gray-900 leading-snug">{rule.name}</h3>
                  </div>
                  <div className="relative rule-menu -mt-1 -mr-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === rule.id ? null : rule.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>
                    {openMenuId === rule.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleToggleActive(rule, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Power size={16} className="mr-2" />
                            {rule.active ? 'Desativar regra' : 'Ativar regra'}
                          </button>
                          <button
                            onClick={(e) => handleDelete(rule.id, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Excluir regra
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {rule.description && rule.description !== rule.name && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-2">{rule.description}</p>
                )}

                <div className="mt-auto pt-3">
                  <div className={`rounded-lg border border-gray-100 divide-y divide-gray-100 text-sm ${
                    rule.active ? 'bg-gray-50' : 'bg-white/60'
                  }`}>
                    <div className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="text-gray-500">Faixa de valor</span>
                      <span className="font-medium text-gray-800 tabular-nums text-right">
                        {formatToBRL(rule.value_ini)} – {formatToBRL(rule.value_end)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="text-gray-500">Dias desde criação</span>
                      <span className="font-medium text-gray-800 tabular-nums">
                        {rule.days_since_creation ?? 0} {(rule.days_since_creation ?? 0) === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="px-4 py-3 border-t border-gray-100 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <label
                  className="relative inline-flex items-center gap-2 cursor-pointer"
                  title={rule.active ? 'Inativar regra' : 'Ativar regra'}
                >
                  <input
                    type="checkbox"
                    checked={rule.active || false}
                    onChange={() => handleToggleActive(rule)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-[22px] bg-[#D3D6DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#0070F2]" />
                  <span className={`text-xs font-medium ${rule.active ? 'text-green-700' : 'text-gray-500'}`}>
                    {rule.active ? 'Ativa' : 'Inativa'}
                  </span>
                </label>
                <span className="text-xs text-gray-400" title={`Criada em ${formatDate(rule.created_at)}`}>
                  Atualizada em {formatDate(rule.updated_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
