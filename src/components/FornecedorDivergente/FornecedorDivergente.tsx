import React, { useState, useEffect, useRef } from 'react';
import {
  Buildings,
  Clock,
  FunnelSimple,
  FileText,
  CurrencyDollar,
  Phone,
  Envelope,
  MapPin,
  CaretDown,
  X,
  UserPlus,
  DotsThree
} from '@phosphor-icons/react';
import { StatsCard } from './StatsCard';

interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  status: 'pendente' | 'em_cadastramento' | 'cadastrado';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  duplicates: number;
  totalValue: number;
  analyst: string;
  dataEntrada: string;
  dataCadSap?: string;
  registrationDate?: string;
  lastUpdate: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  bankInfo?: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: string;
    nomeTitular: string;
    cpfCnpjTitular: string;
    tipoChavePix?: string;
    valorChavePix?: string;
  };
  documents?: {
    cnpj_card: boolean;
    social_contract: boolean;
    bank_references: boolean;
    financial_statements: boolean;
  };
}

const mockSuppliers: Supplier[] = [
  {
    id: 'UNR-001',
    name: 'Empresa Nova Tecnologia LTDA',
    cnpj: '12.345.678/0001-90',
    status: 'pendente',
    risk: 'MEDIUM',
    duplicates: 5,
    totalValue: 125000.00,
    analyst: 'Ana Silva',
    dataEntrada: '2024-01-12',
    lastUpdate: '2024-01-15T10:30:00Z',
    contact: {
      email: 'contato@novateconologia.com.br',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - São Paulo/SP'
    },
    bankInfo: {
      banco: '341 - Itaú Unibanco S.A.',
      agencia: '1234',
      conta: '56789-0',
      tipoConta: 'Conta Corrente',
      nomeTitular: 'Empresa Nova Tecnologia LTDA',
      cpfCnpjTitular: '12.345.678/0001-90',
      tipoChavePix: 'CNPJ',
      valorChavePix: '12.345.678/0001-90'
    },
    documents: {
      cnpj_card: true,
      social_contract: false,
      bank_references: false,
      financial_statements: false
    }
  },
  {
    id: 'UNR-002',
    name: 'Distribuidora Regional Sul S.A.',
    cnpj: '98.765.432/0001-10',
    status: 'em_cadastramento',
    risk: 'LOW',
    duplicates: 12,
    totalValue: 340000.00,
    analyst: 'Carlos Mendes',
    dataEntrada: '2024-01-08',
    registrationDate: '2024-01-10T14:20:00Z',
    lastUpdate: '2024-01-16T09:15:00Z',
    contact: {
      email: 'financeiro@distregional.com.br',
      phone: '(51) 88888-8888',
      address: 'Av. Principal, 456 - Porto Alegre/RS'
    },
    bankInfo: {
      banco: '237 - Banco Bradesco S.A.',
      agencia: '5678',
      conta: '12345-6',
      tipoConta: 'Conta Corrente',
      nomeTitular: 'Distribuidora Regional Sul S.A.',
      cpfCnpjTitular: '98.765.432/0001-10',
      tipoChavePix: 'E-mail',
      valorChavePix: 'financeiro@distregional.com.br'
    },
    documents: {
      cnpj_card: true,
      social_contract: true,
      bank_references: true,
      financial_statements: false
    }
  },
  {
    id: 'UNR-003',
    name: 'Indústria Metalúrgica ABC EIRELI',
    cnpj: '11.222.333/0001-44',
    status: 'cadastrado',
    risk: 'HIGH',
    duplicates: 8,
    totalValue: 280000.00,
    analyst: 'Maria Santos',
    dataEntrada: '2024-01-05',
    dataCadSap: '2024-01-14',
    lastUpdate: '2024-01-14T16:45:00Z',
    contact: {
      email: 'admin@metalurgicaabc.com.br',
      phone: '(19) 77777-7777',
      address: 'Distrito Industrial, 789 - Campinas/SP'
    },
    bankInfo: {
      banco: '001 - Banco do Brasil S.A.',
      agencia: '9876',
      conta: '54321-8',
      tipoConta: 'Conta Corrente',
      nomeTitular: 'Indústria Metalúrgica ABC EIRELI',
      cpfCnpjTitular: '11.222.333/0001-44',
      tipoChavePix: 'Celular',
      valorChavePix: '+55 19 97777-7777'
    },
    documents: {
      cnpj_card: true,
      social_contract: true,
      bank_references: false,
      financial_statements: false
    }
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; color: string }> = {
    pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
    em_cadastramento: { label: 'Em Cadastramento', color: 'bg-blue-100 text-blue-700' },
    cadastrado: { label: 'Cadastrado', color: 'bg-emerald-100 text-emerald-700' },
  };

  const config = statusConfig[status] || statusConfig.pendente;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const RiskBadge = ({ risk }: { risk: string }) => {
  const riskConfig = {
    LOW: { label: 'BAIXO', color: 'bg-green-100 text-green-800' },
    MEDIUM: { label: 'MÉDIO', color: 'bg-yellow-100 text-yellow-800' },
    HIGH: { label: 'ALTO', color: 'bg-red-100 text-red-800' }
  };

  const config = riskConfig[risk] || riskConfig.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const FornecedorDivergente = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: suppliers.length,
    pendente: suppliers.filter(s => s.status === 'pendente').length,
    emCadastramento: suppliers.filter(s => s.status === 'em_cadastramento').length,
    cadastrado: suppliers.filter(s => s.status === 'cadastrado').length,
    totalValue: suppliers.reduce((sum, s) => sum + s.totalValue, 0)
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateBR = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const getDocumentStatus = (documents: any) => {
    const total = Object.keys(documents).length;
    const completed = Object.values(documents).filter(Boolean).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  return (
    <div className="p-8 bg-gray-100 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Novos Recebedores</h1>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Pendente"
            value={stats.pendente}
            icon={<Clock size={20} />}
            layout="stacked"
          />
          <StatsCard
            title="Em Cadastramento"
            value={stats.emCadastramento}
            icon={<FileText size={20} />}
            layout="stacked"
          />
          <StatsCard
            title="Cadastrado"
            value={stats.cadastrado}
            icon={<UserPlus size={20} />}
            layout="stacked"
          />
          <StatsCard
            title="Valor Total em Duplicatas"
            value={formatCurrency(stats.totalValue)}
            icon={<CurrencyDollar size={20} />}
            layout="stacked"
          />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <button
            className="flex items-center justify-between w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <div className="flex items-center gap-3">
              <FunnelSimple className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-900 text-base">Filtros</span>
            </div>
            <CaretDown className={`w-5 h-5 text-gray-700 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isFiltersExpanded && (
            <div className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="searchTerm" className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar Fornecedor
                  </label>
                  <input
                    type="text"
                    id="searchTerm"
                    placeholder="Nome ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="all">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_cadastramento">Em Cadastramento</option>
                    <option value="cadastrado">Cadastrado</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="px-6 h-[26px] bg-white text-gray-700 font-medium text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Limpar
                </button>
                <button
                  className="px-6 h-[26px] bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Fornecedores Não Cadastrados ({filteredSuppliers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
                    Fornecedor / ID
                  </th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
                    CNPJ
                  </th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
                    Data Entrada
                  </th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
                    Data Cad. SAP
                  </th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
                    Duplicatas
                  </th>
                  <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
                    Valor Total
                  </th>
                  <th className="px-4 py-2 font-medium text-center text-xs text-gray-600 w-20">
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{supplier.name}</span>
                        <span className="text-xs text-gray-500">{supplier.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {supplier.cnpj}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={supplier.status} />
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatDateBR(supplier.dataEntrada)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {supplier.dataCadSap ? formatDateBR(supplier.dataCadSap) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {supplier.duplicates}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(supplier.totalValue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block" ref={openMenuId === supplier.id ? menuRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === supplier.id ? null : supplier.id);
                          }}
                          className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          <DotsThree size={24} className="text-gray-500 hover:text-gray-700" />
                        </button>
                        {openMenuId === supplier.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(supplier);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Detalhes Fornecedor
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Buildings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum fornecedor encontrado</p>
              <p className="text-gray-400">Ajuste os filtros ou tente uma busca diferente</p>
            </div>
          )}
        </div>

        {showModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Buildings className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Detalhes do Fornecedor</h2>
                    <p className="text-xs text-gray-400">{selectedSupplier.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informações Básicas</h3>
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-xs text-gray-400">Nome</label>
                        <p className="text-sm font-medium text-gray-900 leading-tight">{selectedSupplier.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400">CNPJ</label>
                          <p className="text-sm text-gray-900">{selectedSupplier.cnpj}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Status</label>
                          <div className="mt-0.5">
                            <StatusBadge status={selectedSupplier.status} />
                          </div>
                        </div>
                      </div>
                      <div className={`grid gap-3 ${selectedSupplier.dataCadSap ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <div>
                          <label className="text-xs text-gray-400">Data Entrada</label>
                          <p className="text-sm text-gray-900">{formatDateBR(selectedSupplier.dataEntrada)}</p>
                        </div>
                        {selectedSupplier.dataCadSap && (
                          <div>
                            <label className="text-xs text-gray-400">Data Cad. SAP</label>
                            <p className="text-sm text-gray-900">{formatDateBR(selectedSupplier.dataCadSap)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedSupplier.bankInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dados Bancários</h3>
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-xs text-gray-400">Banco</label>
                          <p className="text-sm font-medium text-gray-900 leading-tight">{selectedSupplier.bankInfo.banco}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-gray-400">Agência</label>
                            <p className="text-sm text-gray-900">{selectedSupplier.bankInfo.agencia}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Conta</label>
                            <p className="text-sm text-gray-900">{selectedSupplier.bankInfo.conta}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Tipo</label>
                            <p className="text-sm text-gray-900">{selectedSupplier.bankInfo.tipoConta}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400">Titular</label>
                            <p className="text-sm text-gray-900 leading-tight">{selectedSupplier.bankInfo.nomeTitular}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">CPF/CNPJ</label>
                            <p className="text-sm text-gray-900">{selectedSupplier.bankInfo.cpfCnpjTitular}</p>
                          </div>
                        </div>
                        {selectedSupplier.bankInfo.tipoChavePix && selectedSupplier.bankInfo.valorChavePix && (
                          <div className="grid grid-cols-2 gap-3 pt-2.5 mt-2.5 border-t border-gray-200/60">
                            <div>
                              <label className="text-xs text-gray-400">Tipo Chave PIX</label>
                              <p className="text-sm text-gray-900">{selectedSupplier.bankInfo.tipoChavePix}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Chave PIX</label>
                              <p className="text-sm text-gray-900 break-all">{selectedSupplier.bankInfo.valorChavePix}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedSupplier.contact && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Contato</span>
                    {selectedSupplier.contact.email && (
                      <div className="flex items-center gap-1.5">
                        <Envelope className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedSupplier.contact.email}</span>
                      </div>
                    )}
                    {selectedSupplier.contact.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedSupplier.contact.phone}</span>
                      </div>
                    )}
                    {selectedSupplier.contact.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedSupplier.contact.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end px-6 py-3 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FornecedorDivergente;