import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/modules/automacoes/lib/supabase';
import { useStore } from '@/modules/automacoes/store/useStore';
import { mockRuleTypes } from '@/modules/automacoes/lib/mockData';

interface Company {
  id: string;
  name: string;
  doc_num: string;
}

interface RuleType {
  id: number;
  name: string;
}

interface NewRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MOCK_COMPANIES = [
  { id: '1', name: 'Silimed - Filial 4', doc_num: '00000001' },
  { id: '2', name: 'Silimed - Filial 3', doc_num: '00000002' },
  { id: '3', name: 'Silimed - Filial 2', doc_num: '00000003' },
  { id: '4', name: 'Silimed - Filial 7', doc_num: '00000004' },
  { id: '5', name: 'revvo', doc_num: '00000005' },
];

const MOCK_ASSET_ORIGINS = [
  { id: 1, name: 'Cliente' },
  { id: 2, name: 'Fornecedor' },
];

const MOCK_CHANNELS = [
  { id: 1, name: 'API' },
  { id: 2, name: 'Manual' },
  { id: 3, name: 'Importação' },
];

export function NewRuleModal({ isOpen, onClose, onSuccess }: NewRuleModalProps) {
  const { companyId } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [ruleTypeId, setRuleTypeId] = useState<number | null>(null);
  const [assetOriginId, setAssetOriginId] = useState<number>(2);
  const [channelId, setChannelId] = useState<number | null>(null);

  const [ruleTypes, setRuleTypes] = useState<RuleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRuleTypes();
    }
  }, [isOpen]);

  async function loadRuleTypes() {
    const fallback: RuleType[] = mockRuleTypes.map(({ id, name }) => ({ id, name }));
    try {
      const { data, error } = await supabase
        .from('rule_type')
        .select('id, name')
        .order('id');

      if (error) throw error;
      setRuleTypes(data?.length ? data : fallback);
    } catch {
      setRuleTypes(fallback);
    }
  }

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };

  const handleSelectAllCompanies = () => {
    const allIds = MOCK_COMPANIES.map(c => c.id);
    if (selectedCompanies.length === allIds.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(allIds);
    }
  };

  const isAllCompaniesSelected = () => {
    return selectedCompanies.length === MOCK_COMPANIES.length;
  };

  async function handleSave() {
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error('O nome da regra é obrigatório');
      }

      if (!ruleTypeId) {
        throw new Error('O tipo de regra é obrigatório');
      }

      const ruleData = {
        name: name.trim(),
        description: description.trim() || null,
        active,
        rule_type_id: ruleTypeId,
        company_id: companyId,
        days_since_creation: 0,
        value_ini: 0,
        value_end: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('rules')
        .insert([ruleData]);

      if (error) throw error;

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving rule:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar a regra');
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setName('');
    setDescription('');
    setActive(false);
    setSelectedCompanies([]);
    setRuleTypeId(null);
    setAssetOriginId(2);
    setChannelId(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">Nova Regra</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Nome da Regra
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:border-transparent"
                  placeholder="Digite o nome da regra"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <span className="text-sm text-[#1A1A1A]">Regra ativa</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0070F2]"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:border-transparent"
                placeholder="Digite a descrição da regra"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Empresas do Grupo
                </label>
                <div className="border border-gray-300 rounded-md p-2 h-40 overflow-y-auto bg-white">
                  <label className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded">
                    <input
                      type="checkbox"
                      checked={isAllCompaniesSelected()}
                      onChange={handleSelectAllCompanies}
                      className="mr-2 rounded border-gray-300 text-[#0070F2] focus:ring-[#0070F2]"
                    />
                    <span className="text-sm font-medium text-[#0070F2]">Todas as empresas</span>
                  </label>
                  {MOCK_COMPANIES.map(company => (
                    <label
                      key={company.id}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={() => handleCompanyToggle(company.id)}
                        className="mr-2 rounded border-gray-300 text-[#0070F2] focus:ring-[#0070F2]"
                      />
                      <span className="text-sm text-[#1A1A1A]">{company.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Tipo de Regra
                </label>
                <select
                  value={ruleTypeId || ''}
                  onChange={(e) => setRuleTypeId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:border-transparent bg-white"
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
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Origem do Ativo
                </label>
                <select
                  value={assetOriginId}
                  onChange={(e) => setAssetOriginId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:border-transparent bg-white"
                >
                  {MOCK_ASSET_ORIGINS.map(origin => (
                    <option key={origin.id} value={origin.id}>
                      {origin.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Canal de obtenção de dados
                </label>
                <select
                  value={channelId || ''}
                  onChange={(e) => setChannelId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:border-transparent bg-white"
                >
                  <option value="">Selecione o canal</option>
                  {MOCK_CHANNELS.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-white bg-[#0070F2] hover:bg-[#0060D2] rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
