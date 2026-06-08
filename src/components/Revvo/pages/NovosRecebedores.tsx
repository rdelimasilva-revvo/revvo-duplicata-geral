import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CaretDown,
  CaretUp,
  CaretUpDown,
  FunnelSimple,
  X,
  Eye,
  Bank,
  User,
  Calendar,
  ArrowRight,
  FileText,
  Info,
  Clock,
  CheckCircle,
  Warning,
  Download,
  Buildings,
} from '@phosphor-icons/react';
import { StatsCard } from '../../FornecedorDivergente/StatsCard';

type RecebedorStatus = 'pendente' | 'em_cadastramento' | 'cadastrado';
type CanalOrigem = 'Portal' | 'Escrituradora' | 'API' | 'Manual';

interface RecebedorData {
  nome: string;
  cnpj: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoChavePix?: string;
  valorChavePix?: string;
}

interface Recebedor {
  id: string;
  dataSolicitacao: string;
  dataEntrada: string;
  dataCadSap?: string;
  fornecedor: { nome: string; cnpj: string };
  recebedorOriginal: RecebedorData;
  novoRecebedor: RecebedorData;
  canalOrigem: CanalOrigem;
  status: RecebedorStatus;
  motivoAlteracao?: string;
  dataProcessamento?: string;
  usuarioSolicitante?: string;
  observacoes?: string;
}

interface FilterState {
  periodoInicio: string;
  periodoFim: string;
  recebedorOriginal: string;
  novoRecebedor: string;
  fornecedor: string;
  status: RecebedorStatus | '';
}

const STATUS_CONFIG: Record<RecebedorStatus, { label: string; color: string; bgColor: string }> = {
  pendente: { label: 'Pendente', color: '#F59E0B', bgColor: 'bg-amber-100 text-amber-700' },
  em_cadastramento: { label: 'Em Cadastramento', color: '#3B82F6', bgColor: 'bg-blue-100 text-blue-700' },
  cadastrado: { label: 'Cadastrado', color: '#10B981', bgColor: 'bg-emerald-100 text-emerald-700' },
};

const mockRecebedores: Recebedor[] = [
  { id: 'REC-001', dataSolicitacao: '2024-01-15', dataEntrada: '2024-01-14', dataCadSap: '2024-01-16', fornecedor: { nome: 'Indústrias Reunidas São Paulo Ltda', cnpj: '12.345.678/0001-90' }, recebedorOriginal: { nome: 'Distribuidora ABC Comércio Ltda', cnpj: '98.765.432/0001-10', banco: 'Banco do Brasil', agencia: '1234-5', conta: '12345-6', tipoChavePix: 'CNPJ', valorChavePix: '98.765.432/0001-10' }, novoRecebedor: { nome: 'ABC Factoring S.A.', cnpj: '11.222.333/0001-44', banco: 'Itaú Unibanco', agencia: '0987', conta: '98765-4', tipoChavePix: 'CNPJ', valorChavePix: '11.222.333/0001-44' }, canalOrigem: 'Portal', status: 'cadastrado', motivoAlteracao: 'Cessão de crédito autorizada', dataProcessamento: '2024-01-16', usuarioSolicitante: 'maria.silva@empresa.com.br', observacoes: 'Documentação verificada e aprovada pelo gestor.' },
  { id: 'REC-002', dataSolicitacao: '2024-01-18', dataEntrada: '2024-01-17', fornecedor: { nome: 'Metalúrgica Precision Brasil S.A.', cnpj: '23.456.789/0001-01' }, recebedorOriginal: { nome: 'Metalúrgica Precision Brasil S.A.', cnpj: '23.456.789/0001-01', banco: 'Bradesco', agencia: '2345-6', conta: '23456-7', tipoChavePix: 'Email', valorChavePix: 'financeiro@precision.com.br' }, novoRecebedor: { nome: 'Banco Safra S.A. - FIDC', cnpj: '22.333.444/0001-55', banco: 'Safra', agencia: '0001', conta: '11111-1', tipoChavePix: 'Chave Aleatória', valorChavePix: '7d9f6d8a-3b4e-4f2c-9a1b-8e5c7d6f4a3b' }, canalOrigem: 'Escrituradora', status: 'em_cadastramento', motivoAlteracao: 'Antecipação de recebíveis', usuarioSolicitante: 'joao.santos@precision.com.br' },
  { id: 'REC-003', dataSolicitacao: '2024-01-20', dataEntrada: '2024-01-19', fornecedor: { nome: 'Tecnologia Digital Solutions Ltda', cnpj: '34.567.890/0001-12' }, recebedorOriginal: { nome: 'Tecnologia Digital Solutions Ltda', cnpj: '34.567.890/0001-12', banco: 'Santander', agencia: '3456-7', conta: '34567-8', tipoChavePix: 'Telefone', valorChavePix: '+55 11 98765-4321' }, novoRecebedor: { nome: 'Creditas Soluções Financeiras', cnpj: '33.444.555/0001-66', banco: 'Creditas', agencia: '0001', conta: '22222-2', tipoChavePix: 'CPF', valorChavePix: '123.456.789-00' }, canalOrigem: 'API', status: 'pendente', motivoAlteracao: 'Documentação incompleta', usuarioSolicitante: 'pedro.oliveira@digital.com.br', observacoes: 'Falta contrato de cessão assinado.' },
  { id: 'REC-004', dataSolicitacao: '2024-01-22', dataEntrada: '2024-01-21', dataCadSap: '2024-01-23', fornecedor: { nome: 'Agroindustrial Vale Verde Ltda', cnpj: '45.678.901/0001-23' }, recebedorOriginal: { nome: 'Agroindustrial Vale Verde Ltda', cnpj: '45.678.901/0001-23', banco: 'Banco do Brasil', agencia: '4567-8', conta: '45678-9', tipoChavePix: 'CNPJ', valorChavePix: '45.678.901/0001-23' }, novoRecebedor: { nome: 'Sicredi FIDC Agro', cnpj: '44.555.666/0001-77', banco: 'Sicredi', agencia: '0002', conta: '33333-3', tipoChavePix: 'Chave Aleatória', valorChavePix: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6' }, canalOrigem: 'Manual', status: 'cadastrado', motivoAlteracao: 'Financiamento agrícola', dataProcessamento: '2024-01-23', usuarioSolicitante: 'ana.costa@valeverde.agro.br' },
  { id: 'REC-005', dataSolicitacao: '2024-01-25', dataEntrada: '2024-01-24', fornecedor: { nome: 'Construtora Horizonte Engenharia', cnpj: '56.789.012/0001-34' }, recebedorOriginal: { nome: 'Construtora Horizonte Engenharia', cnpj: '56.789.012/0001-34', banco: 'Caixa Econômica', agencia: '5678-9', conta: '56789-0', tipoChavePix: 'Telefone', valorChavePix: '+55 21 99876-5432' }, novoRecebedor: { nome: 'BTG Pactual Crédito', cnpj: '55.666.777/0001-88', banco: 'BTG Pactual', agencia: '0003', conta: '44444-4', tipoChavePix: 'Email', valorChavePix: 'credito@btgpactual.com.br' }, canalOrigem: 'Portal', status: 'em_cadastramento', motivoAlteracao: 'Cessão para garantia de projeto', usuarioSolicitante: 'carlos.mendes@horizonte.eng.br' },
  { id: 'REC-006', dataSolicitacao: '2024-02-01', dataEntrada: '2024-01-31', dataCadSap: '2024-02-02', fornecedor: { nome: 'Transportadora Rodoviária Nacional', cnpj: '67.890.123/0001-45' }, recebedorOriginal: { nome: 'Transportadora Rodoviária Nacional', cnpj: '67.890.123/0001-45', banco: 'Itaú', agencia: '6789-0', conta: '67890-1', tipoChavePix: 'CNPJ', valorChavePix: '67.890.123/0001-45' }, novoRecebedor: { nome: 'Omni Banco S.A.', cnpj: '66.777.888/0001-99', banco: 'Omni', agencia: '0004', conta: '55555-5', tipoChavePix: 'CNPJ', valorChavePix: '66.777.888/0001-99' }, canalOrigem: 'Escrituradora', status: 'cadastrado', motivoAlteracao: 'Antecipação de fretes', dataProcessamento: '2024-02-02', usuarioSolicitante: 'lucia.ferreira@rodoviarianac.com.br' },
  { id: 'REC-007', dataSolicitacao: '2024-02-05', dataEntrada: '2024-02-04', fornecedor: { nome: 'Químicos Industriais do Brasil SA', cnpj: '78.901.234/0001-56' }, recebedorOriginal: { nome: 'Químicos Industriais do Brasil SA', cnpj: '78.901.234/0001-56', banco: 'Bradesco', agencia: '7890-1', conta: '78901-2', tipoChavePix: 'CPF', valorChavePix: '987.654.321-00' }, novoRecebedor: { nome: 'Daycoval Asset', cnpj: '77.888.999/0001-00', banco: 'Daycoval', agencia: '0005', conta: '66666-6', tipoChavePix: 'Email', valorChavePix: 'operacoes@daycoval.com.br' }, canalOrigem: 'API', status: 'pendente', motivoAlteracao: 'CNPJ do novo recebedor irregular', usuarioSolicitante: 'roberto.lima@quimicosbr.ind.br', observacoes: 'Aguardando regularização cadastral.' },
  { id: 'REC-008', dataSolicitacao: '2024-02-08', dataEntrada: '2024-02-07', dataCadSap: '2024-02-09', fornecedor: { nome: 'Embalagens Flexíveis Premium Ltda', cnpj: '89.012.345/0001-67' }, recebedorOriginal: { nome: 'Embalagens Flexíveis Premium Ltda', cnpj: '89.012.345/0001-67', banco: 'Santander', agencia: '8901-2', conta: '89012-3', tipoChavePix: 'Telefone', valorChavePix: '+55 11 97654-3210' }, novoRecebedor: { nome: 'Votorantim Asset Management', cnpj: '88.999.000/0001-11', banco: 'BV', agencia: '0006', conta: '77777-7', tipoChavePix: 'Chave Aleatória', valorChavePix: 'f9e8d7c6-b5a4-3210-9876-543210fedcba' }, canalOrigem: 'Manual', status: 'cadastrado', motivoAlteracao: 'Operação de factoring', dataProcessamento: '2024-02-09', usuarioSolicitante: 'fernanda.alves@premiumemb.com.br' },
  { id: 'REC-009', dataSolicitacao: '2024-02-12', dataEntrada: '2024-02-11', fornecedor: { nome: 'Alimentos Naturais Orgânicos ME', cnpj: '90.123.456/0001-78' }, recebedorOriginal: { nome: 'Alimentos Naturais Orgânicos ME', cnpj: '90.123.456/0001-78', banco: 'Banco do Brasil', agencia: '9012-3', conta: '90123-4', tipoChavePix: 'CNPJ', valorChavePix: '90.123.456/0001-78' }, novoRecebedor: { nome: 'Stone Pagamentos S.A.', cnpj: '99.000.111/0001-22', banco: 'Stone', agencia: '0007', conta: '88888-8', tipoChavePix: 'CNPJ', valorChavePix: '99.000.111/0001-22' }, canalOrigem: 'Portal', status: 'em_cadastramento', motivoAlteracao: 'Migração de recebíveis', usuarioSolicitante: 'marcos.santos@organicosnat.com.br' },
  { id: 'REC-010', dataSolicitacao: '2024-02-15', dataEntrada: '2024-02-14', dataCadSap: '2024-02-16', fornecedor: { nome: 'Têxtil Nordeste Confecções Ltda', cnpj: '01.234.567/0001-89' }, recebedorOriginal: { nome: 'Têxtil Nordeste Confecções Ltda', cnpj: '01.234.567/0001-89', banco: 'Caixa Econômica', agencia: '0123-4', conta: '01234-5', tipoChavePix: 'Email', valorChavePix: 'contato@textilne.com.br' }, novoRecebedor: { nome: 'Banco Pine S.A.', cnpj: '00.111.222/0001-33', banco: 'Pine', agencia: '0008', conta: '99999-9', tipoChavePix: 'CPF', valorChavePix: '111.222.333-44' }, canalOrigem: 'Escrituradora', status: 'cadastrado', motivoAlteracao: 'Desconto de duplicatas', dataProcessamento: '2024-02-16', usuarioSolicitante: 'patricia.vieira@textilne.com.br' },
  { id: 'REC-011', dataSolicitacao: '2024-02-18', dataEntrada: '2024-02-17', fornecedor: { nome: 'Siderúrgica Sul Metais SA', cnpj: '12.345.098/0001-90' }, recebedorOriginal: { nome: 'Siderúrgica Sul Metais SA', cnpj: '12.345.098/0001-90', banco: 'Itaú', agencia: '1234-0', conta: '12340-6', tipoChavePix: 'Telefone', valorChavePix: '+55 51 98765-4321' }, novoRecebedor: { nome: 'XP Investimentos CCTVM', cnpj: '12.223.334/0001-44', banco: 'XP', agencia: '0009', conta: '10101-0', tipoChavePix: 'Email', valorChavePix: 'investimentos@xpi.com.br' }, canalOrigem: 'API', status: 'pendente', motivoAlteracao: 'Operação fora do prazo permitido', usuarioSolicitante: 'ricardo.moura@siderurgicasul.ind.br', observacoes: 'Solicitação realizada após corte diário.' },
  { id: 'REC-012', dataSolicitacao: '2024-02-20', dataEntrada: '2024-02-19', fornecedor: { nome: 'Papelaria Central Distribuidora', cnpj: '23.456.109/0001-01' }, recebedorOriginal: { nome: 'Papelaria Central Distribuidora', cnpj: '23.456.109/0001-01', banco: 'Bradesco', agencia: '2345-0', conta: '23450-7', tipoChavePix: 'CNPJ', valorChavePix: '23.456.109/0001-01' }, novoRecebedor: { nome: 'Banco Modal S.A.', cnpj: '23.334.445/0001-55', banco: 'Modal', agencia: '0010', conta: '20202-0', tipoChavePix: 'Chave Aleatória', valorChavePix: '1a2b3c4d-5e6f-7890-abcd-ef1234567890' }, canalOrigem: 'Manual', status: 'em_cadastramento', motivoAlteracao: 'Cessão de crédito comercial', usuarioSolicitante: 'amanda.reis@papelariacentral.com.br' },
  { id: 'REC-013', dataSolicitacao: '2024-02-22', dataEntrada: '2024-02-21', dataCadSap: '2024-02-23', fornecedor: { nome: 'Eletrônicos Tech Import Ltda', cnpj: '34.567.210/0001-12' }, recebedorOriginal: { nome: 'Eletrônicos Tech Import Ltda', cnpj: '34.567.210/0001-12', banco: 'Santander', agencia: '3456-0', conta: '34560-8', tipoChavePix: 'Email', valorChavePix: 'financeiro@techimport.com.br' }, novoRecebedor: { nome: 'Banco Inter S.A.', cnpj: '34.445.556/0001-66', banco: 'Inter', agencia: '0001', conta: '30303-0', tipoChavePix: 'CNPJ', valorChavePix: '34.445.556/0001-66' }, canalOrigem: 'Portal', status: 'cadastrado', motivoAlteracao: 'Capital de giro', dataProcessamento: '2024-02-23', usuarioSolicitante: 'bruno.cardoso@techimport.com.br' },
  { id: 'REC-014', dataSolicitacao: '2024-02-25', dataEntrada: '2024-02-24', fornecedor: { nome: 'Farmacêutica Vida Saudável SA', cnpj: '45.678.321/0001-23' }, recebedorOriginal: { nome: 'Farmacêutica Vida Saudável SA', cnpj: '45.678.321/0001-23', banco: 'Banco do Brasil', agencia: '4567-0', conta: '45670-9', tipoChavePix: 'Telefone', valorChavePix: '+55 61 99123-4567' }, novoRecebedor: { nome: 'ABC Brasil DTVM', cnpj: '45.556.667/0001-77', banco: 'ABC Brasil', agencia: '0012', conta: '40404-0', tipoChavePix: 'CPF', valorChavePix: '555.666.777-88' }, canalOrigem: 'Escrituradora', status: 'pendente', motivoAlteracao: 'Securitização de recebíveis', usuarioSolicitante: 'juliana.castro@vidasaudavel.far.br' },
  { id: 'REC-015', dataSolicitacao: '2024-02-28', dataEntrada: '2024-02-27', dataCadSap: '2024-03-01', fornecedor: { nome: 'Autopeças Nacional Comércio Ltda', cnpj: '56.789.432/0001-34' }, recebedorOriginal: { nome: 'Autopeças Nacional Comércio Ltda', cnpj: '56.789.432/0001-34', banco: 'Caixa Econômica', agencia: '5678-0', conta: '56780-0', tipoChavePix: 'CNPJ', valorChavePix: '56.789.432/0001-34' }, novoRecebedor: { nome: 'Banco Original S.A.', cnpj: '56.667.778/0001-88', banco: 'Original', agencia: '0013', conta: '50505-0', tipoChavePix: 'Email', valorChavePix: 'original@bancooriginal.com.br' }, canalOrigem: 'API', status: 'cadastrado', motivoAlteracao: 'Antecipação para fornecedores', dataProcessamento: '2024-03-01', usuarioSolicitante: 'eduardo.silva@autopecasnac.com.br', observacoes: 'Operação aprovada com prioridade.' },
];

const initialFilters: FilterState = { periodoInicio: '', periodoFim: '', recebedorOriginal: '', novoRecebedor: '', fornecedor: '', status: '' };

const getUniqueFornecedores = (): string[] => [...new Set(mockRecebedores.map((r) => r.fornecedor.nome))].sort();
const getUniqueRecebedoresOriginais = (): string[] => [...new Set(mockRecebedores.map((r) => r.recebedorOriginal.nome))].sort();
const getUniqueNovosRecebedores = (): string[] => [...new Set(mockRecebedores.map((r) => r.novoRecebedor.nome))].sort();

function StatusBadge({ status }: { status: RecebedorStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

type SortField = 'dataSolicitacao' | 'dataEntrada' | 'dataCadSap' | 'fornecedor' | 'recebedorOriginal' | 'novoRecebedor' | 'canalOrigem' | 'status';
type SortDirection = 'asc' | 'desc' | null;

function RecebedorCard({ data, variant }: { data: RecebedorData; variant: 'original' | 'novo' }) {
  const borderColor = variant === 'original' ? 'border-gray-200' : 'border-blue-200';
  const bgColor = variant === 'original' ? 'bg-gray-50' : 'bg-blue-50';
  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mt-3`}>
      <p className="text-sm font-medium text-gray-900">{data.nome}</p>
      <p className="text-xs text-gray-500 mt-1">CNPJ: {data.cnpj}</p>

      <div className="mt-3 pt-3 border-t border-gray-200/50">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Dados Bancários</p>
        <div className="grid grid-cols-3 gap-2">
          <div><p className="text-xs text-gray-500">Banco</p><p className="text-sm font-medium text-gray-900">{data.banco}</p></div>
          <div><p className="text-xs text-gray-500">Agência</p><p className="text-sm font-medium text-gray-900">{data.agencia}</p></div>
          <div><p className="text-xs text-gray-500">Conta</p><p className="text-sm font-medium text-gray-900">{data.conta}</p></div>
        </div>
      </div>

      {data.tipoChavePix && data.valorChavePix && (
        <div className="mt-3 pt-3 border-t border-gray-200/50">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Chave Pix</p>
          <div className="grid grid-cols-2 gap-2">
            <div><p className="text-xs text-gray-500">Tipo de Chave</p><p className="text-sm font-medium text-gray-900">{data.tipoChavePix}</p></div>
            <div><p className="text-xs text-gray-500">Valor da Chave</p><p className="text-sm font-medium text-gray-900 break-all">{data.valorChavePix}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <span className="text-xs text-gray-500 min-w-[120px]">{label}:</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

function DetailModal({ recebedor, isOpen, onClose }: { recebedor: Recebedor | null; isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !recebedor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalhes da Solicitação</h2>
            <p className="text-sm text-gray-500 mt-0.5">ID: {recebedor.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={18} className="text-gray-400" />
              <span>Solicitado em:</span>
              <span className="font-medium text-gray-900">{formatDate(recebedor.dataSolicitacao)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={18} className="text-gray-400" />
              <span>Data Entrada:</span>
              <span className="font-medium text-gray-900">{formatDate(recebedor.dataEntrada)}</span>
            </div>
            {recebedor.dataCadSap && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={18} className="text-gray-400" />
                <span>Data Cad. SAP:</span>
                <span className="font-medium text-gray-900">{formatDate(recebedor.dataCadSap)}</span>
              </div>
            )}
            {recebedor.dataProcessamento && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={18} className="text-gray-400" />
                <span>Processado em:</span>
                <span className="font-medium text-gray-900">{formatDate(recebedor.dataProcessamento)}</span>
              </div>
            )}
            <StatusBadge status={recebedor.status} />
          </div>

          <div className="mb-6">
            <SectionTitle icon={<User size={18} />} title="Fornecedor" />
            <div className="bg-gray-50 rounded-lg p-4 mt-3">
              <p className="text-sm font-medium text-gray-900">{recebedor.fornecedor.nome}</p>
              <p className="text-sm text-gray-500 mt-1">CNPJ: {recebedor.fornecedor.cnpj}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <SectionTitle icon={<Bank size={18} />} title="Recebedor Original" />
              <RecebedorCard data={recebedor.recebedorOriginal} variant="original" />
            </div>
            <div className="relative">
              <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-full w-6 h-6 items-center justify-center bg-blue-100 rounded-full">
                <ArrowRight size={14} className="text-blue-600" weight="bold" />
              </div>
              <SectionTitle icon={<Bank size={18} />} title="Novo Recebedor" />
              <RecebedorCard data={recebedor.novoRecebedor} variant="novo" />
            </div>
          </div>

          <div className="mb-6">
            <SectionTitle icon={<FileText size={18} />} title="Informações Adicionais" />
            <div className="bg-gray-50 rounded-lg p-4 mt-3 space-y-3">
              <InfoRow label="Canal de Origem" value={recebedor.canalOrigem} />
              {recebedor.motivoAlteracao && <InfoRow label="Motivo da Alteração" value={recebedor.motivoAlteracao} />}
              {recebedor.usuarioSolicitante && <InfoRow label="Usuário Solicitante" value={recebedor.usuarioSolicitante} />}
            </div>
          </div>

          {recebedor.observacoes && (
            <div className="mb-6">
              <SectionTitle icon={<Info size={18} />} title="Observações" />
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                <p className="text-sm text-yellow-800">{recebedor.observacoes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 h-[26px] text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export const NovosRecebedores: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedRecebedor, setSelectedRecebedor] = useState<Recebedor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const fornecedores = useMemo(() => getUniqueFornecedores(), []);
  const recebedoresOriginais = useMemo(() => getUniqueRecebedoresOriginais(), []);
  const novosRecebedores = useMemo(() => getUniqueNovosRecebedores(), []);

  const filteredData = useMemo(() => {
    return mockRecebedores.filter((item) => {
      if (filters.periodoInicio && item.dataSolicitacao < filters.periodoInicio) return false;
      if (filters.periodoFim && item.dataSolicitacao > filters.periodoFim) return false;
      if (filters.fornecedor && item.fornecedor.nome !== filters.fornecedor) return false;
      if (filters.recebedorOriginal && item.recebedorOriginal.nome !== filters.recebedorOriginal) return false;
      if (filters.novoRecebedor && item.novoRecebedor.nome !== filters.novoRecebedor) return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return filteredData;
    return [...filteredData].sort((a, b) => {
      let valueA: string, valueB: string;
      switch (sortField) {
        case 'dataSolicitacao': valueA = a.dataSolicitacao; valueB = b.dataSolicitacao; break;
        case 'dataEntrada': valueA = a.dataEntrada; valueB = b.dataEntrada; break;
        case 'dataCadSap': valueA = a.dataCadSap || ''; valueB = b.dataCadSap || ''; break;
        case 'fornecedor': valueA = a.fornecedor.nome; valueB = b.fornecedor.nome; break;
        case 'recebedorOriginal': valueA = a.recebedorOriginal.nome; valueB = b.recebedorOriginal.nome; break;
        case 'novoRecebedor': valueA = a.novoRecebedor.nome; valueB = b.novoRecebedor.nome; break;
        case 'canalOrigem': valueA = a.canalOrigem; valueB = b.canalOrigem; break;
        case 'status': valueA = a.status; valueB = b.status; break;
        default: return 0;
      }
      const comparison = valueA.localeCompare(valueB, 'pt-BR');
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  const stats = useMemo(() => ({
    total: mockRecebedores.length,
    pendente: mockRecebedores.filter(r => r.status === 'pendente').length,
    emCadastramento: mockRecebedores.filter(r => r.status === 'em_cadastramento').length,
    cadastrado: mockRecebedores.filter(r => r.status === 'cadastrado').length,
  }), []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
    } else { setSortField(field); setSortDirection('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <CaretUpDown size={14} className="text-gray-400" />;
    if (sortDirection === 'asc') return <CaretUp size={14} className="text-blue-600" weight="bold" />;
    return <CaretDown size={14} className="text-blue-600" weight="bold" />;
  };

  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleClearFilters = useCallback(() => setFilters(initialFilters), []);

  const handleRowClick = useCallback((recebedor: Recebedor) => {
    setSelectedRecebedor(recebedor);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRecebedor(null);
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Novos Recebedores</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center px-4 h-[26px] text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm bg-white">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total de Solicitações"
            value={stats.total}
            icon={<Buildings size={20} />}
            layout="stacked"
          />
          <StatsCard
            title="Pendente"
            value={stats.pendente}
            icon={<Warning size={20} />}
            layout="stacked"
          />
          <StatsCard
            title="Em Cadastramento"
            value={stats.emCadastramento}
            icon={<Clock size={20} />}
            layout="stacked"
          />
          <StatsCard
            title="Cadastrado"
            value={stats.cadastrado}
            icon={<CheckCircle size={20} />}
            layout="stacked"
          />
        </div>

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
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label htmlFor="periodoInicio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Período Início
                  </label>
                  <input
                    type="date"
                    id="periodoInicio"
                    value={filters.periodoInicio}
                    onChange={(e) => handleFilterChange('periodoInicio', e.target.value)}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="periodoFim" className="block text-sm font-semibold text-gray-700 mb-2">
                    Período Fim
                  </label>
                  <input
                    type="date"
                    id="periodoFim"
                    value={filters.periodoFim}
                    onChange={(e) => handleFilterChange('periodoFim', e.target.value)}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="fornecedor" className="block text-sm font-semibold text-gray-700 mb-2">
                    Fornecedor
                  </label>
                  <select
                    id="fornecedor"
                    value={filters.fornecedor}
                    onChange={(e) => handleFilterChange('fornecedor', e.target.value)}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Todos</option>
                    {fornecedores.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="recebedorOriginal" className="block text-sm font-semibold text-gray-700 mb-2">
                    Recebedor Original
                  </label>
                  <select
                    id="recebedorOriginal"
                    value={filters.recebedorOriginal}
                    onChange={(e) => handleFilterChange('recebedorOriginal', e.target.value)}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Todos</option>
                    {recebedoresOriginais.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="novoRecebedor" className="block text-sm font-semibold text-gray-700 mb-2">
                    Novo Recebedor
                  </label>
                  <select
                    id="novoRecebedor"
                    value={filters.novoRecebedor}
                    onChange={(e) => handleFilterChange('novoRecebedor', e.target.value)}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Todos</option>
                    {novosRecebedores.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value as RecebedorStatus | '')}
                    className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Todos os Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleClearFilters}
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Solicitações de Alteração ({sortedData.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('dataSolicitacao')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Data Solicitação
                      <SortIcon field="dataSolicitacao" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('dataEntrada')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Data Entrada
                      <SortIcon field="dataEntrada" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('dataCadSap')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Data Cad. SAP
                      <SortIcon field="dataCadSap" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('fornecedor')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Fornecedor
                      <SortIcon field="fornecedor" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('recebedorOriginal')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Recebedor Original
                      <SortIcon field="recebedorOriginal" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('novoRecebedor')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Novo Recebedor
                      <SortIcon field="novoRecebedor" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('canalOrigem')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Canal
                      <SortIcon field="canalOrigem" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 font-medium text-xs text-gray-600">
                      Status
                      <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="px-4 py-2 font-medium text-center text-xs text-gray-600 w-20">
                    <Eye className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatDate(item.dataSolicitacao)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatDate(item.dataEntrada)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {item.dataCadSap ? formatDate(item.dataCadSap) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium truncate max-w-[180px]">{item.fornecedor.nome}</span>
                        <span className="text-xs text-gray-500">{item.fornecedor.cnpj}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm truncate max-w-[180px]">{item.recebedorOriginal.nome}</span>
                        <span className="text-xs text-gray-500">{item.recebedorOriginal.cnpj}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm truncate max-w-[180px]">{item.novoRecebedor.nome}</span>
                        <span className="text-xs text-gray-500">{item.novoRecebedor.cnpj}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md">
                        {item.canalOrigem}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRowClick(item)}
                        className="inline-flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 text-gray-400 hover:text-blue-600 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <div className="text-center py-12">
              <Buildings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum registro encontrado</p>
              <p className="text-gray-400">Ajuste os filtros ou tente uma busca diferente</p>
            </div>
          )}
        </div>
      </div>

      <DetailModal recebedor={selectedRecebedor} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};
