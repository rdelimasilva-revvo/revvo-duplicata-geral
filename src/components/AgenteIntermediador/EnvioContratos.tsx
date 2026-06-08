import React, { useMemo, useRef, useState } from 'react';
import {
  FileSignature,
  UploadCloud,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Eye,
  Trash2,
  AlertCircle,
  Building2,
  Calendar,
  X,
  Download,
} from 'lucide-react';
import { mockSuppliers } from './mockSuppliers';

type ContratoStatus = 'Rascunho' | 'Enviado' | 'Processado' | 'Recusado';

interface Contrato {
  id: string;
  numero: string;
  supplierId: string;
  supplierName: string;
  supplierCnpj: string;
  fileName: string;
  fileSizeKb: number;
  envioEm: string;
  valor: number;
  status: ContratoStatus;
  observacao?: string;
}

const initialContratos: Contrato[] = [
  {
    id: 'ctr-001',
    numero: 'CTR-2026-0001',
    supplierId: 'sup-001',
    supplierName: 'Fornecedor Alpha Ltda',
    supplierCnpj: '11.222.333/0001-44',
    fileName: 'contrato-alpha-fornec-2026.pdf',
    fileSizeKb: 482,
    envioEm: '06/06/2026 14:23',
    valor: 1250000,
    status: 'Processado',
  },
  {
    id: 'ctr-002',
    numero: 'CTR-2026-0002',
    supplierId: 'sup-002',
    supplierName: 'Beta Indústria S.A.',
    supplierCnpj: '22.333.444/0001-55',
    fileName: 'contrato-beta-industria.pdf',
    fileSizeKb: 612,
    envioEm: '07/06/2026 09:11',
    valor: 980000,
    status: 'Enviado',
  },
  {
    id: 'ctr-003',
    numero: 'CTR-2026-0003',
    supplierId: 'sup-003',
    supplierName: 'Gamma Comércio Ltda',
    supplierCnpj: '33.444.555/0001-66',
    fileName: 'gamma-prestacao-servicos.pdf',
    fileSizeKb: 358,
    envioEm: '07/06/2026 16:45',
    valor: 520000,
    status: 'Recusado',
    observacao: 'Cláusula 4.2 ausente — reenviar versão corrigida',
  },
  {
    id: 'ctr-004',
    numero: 'CTR-2026-0004',
    supplierId: 'sup-004',
    supplierName: 'Delta Serviços S.A.',
    supplierCnpj: '44.555.666/0001-77',
    fileName: 'delta-fornecimento-2026.pdf',
    fileSizeKb: 745,
    envioEm: '—',
    valor: 1450000,
    status: 'Rascunho',
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatCurrencyCompact = (value: number) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
};

const formatFileSize = (kb: number) =>
  kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

const statusMeta: Record<
  ContratoStatus,
  { badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Rascunho: {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: FileText,
  },
  Enviado: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  Processado: {
    badge: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle2,
  },
  Recusado: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const StatusBadge: React.FC<{ status: ContratoStatus }> = ({ status }) => {
  const m = statusMeta[status];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${m.badge}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const UploadModal: React.FC<{
  onClose: () => void;
  onConfirm: (c: Omit<Contrato, 'id' | 'numero'>) => void;
}> = ({ onClose, onConfirm }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [supplierId, setSupplierId] = useState<string>(mockSuppliers[0].id);
  const [valor, setValor] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const supplier = mockSuppliers.find((s) => s.id === supplierId)!;

  const submit = () => {
    if (!file || !valor) return;
    onConfirm({
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierCnpj: supplier.cnpj,
      fileName: file.name,
      fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
      envioEm: '08/06/2026 ' + new Date().toTimeString().slice(0, 5),
      valor: Number(valor.replace(/\D/g, '')) / 100,
      status: 'Enviado',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Enviar novo contrato
              </h2>
              <p className="text-xs text-gray-500">
                Anexe o PDF e selecione o fornecedor vinculado.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Fornecedor
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
            >
              {mockSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.cnpj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Valor do contrato
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value.replace(/\D/g, ''))}
              placeholder="R$ 0,00"
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            {valor && (
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(Number(valor) / 100)}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Arquivo do contrato
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) setFile(f);
              }}
              onClick={() => fileRef.current?.click()}
              className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
              {file ? (
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-900">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(Math.round(file.size / 1024))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-700 mt-2">
                    Clique ou arraste o arquivo aqui
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    PDF até 10MB
                  </div>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!file || !valor}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Enviar contrato
          </button>
        </div>
      </div>
    </div>
  );
};

const ContratoDetailModal: React.FC<{
  contrato: Contrato;
  onClose: () => void;
}> = ({ contrato: c, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-blue-600">
              Contrato
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">{c.numero}</h2>
            <div className="mt-1.5">
              <StatusBadge status={c.status} />
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-1"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {c.status === 'Recusado' && c.observacao && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-red-900">
                Contrato recusado
              </div>
              <div className="text-xs text-red-700 mt-0.5">{c.observacao}</div>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Fornecedor vinculado
          </div>
          <div className="mt-2">
            <div className="font-semibold text-gray-900">{c.supplierName}</div>
            <div className="text-sm text-gray-500">CNPJ {c.supplierCnpj}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="text-xs text-gray-500">Valor do contrato</div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(c.valor)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Enviado em
            </div>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {c.envioEm}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {c.fileName}
              </div>
              <div className="text-xs text-gray-500">
                PDF · {formatFileSize(c.fileSizeKb)}
              </div>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <Download className="w-3.5 h-3.5" />
            Baixar
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Fechar
        </button>
        {c.status === 'Rascunho' && (
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Send className="w-4 h-4" />
            Enviar agora
          </button>
        )}
      </div>
    </div>
  </div>
);

const EnvioContratos: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>(initialContratos);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContratoStatus>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      contratos.filter((c) => {
        const matchSearch =
          !search ||
          c.numero.toLowerCase().includes(search.toLowerCase()) ||
          c.supplierName.toLowerCase().includes(search.toLowerCase()) ||
          c.fileName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [contratos, search, statusFilter]
  );

  const detail = contratos.find((c) => c.id === detailId) ?? null;

  const counts = {
    total: contratos.length,
    enviado: contratos.filter((c) => c.status === 'Enviado').length,
    processado: contratos.filter((c) => c.status === 'Processado').length,
    recusado: contratos.filter((c) => c.status === 'Recusado').length,
  };
  const totalValor = contratos.reduce((s, c) => s + c.valor, 0);

  const addContrato = (data: Omit<Contrato, 'id' | 'numero'>) => {
    const nextNum = contratos.length + 1;
    const novo: Contrato = {
      ...data,
      id: `ctr-${String(nextNum).padStart(3, '0')}`,
      numero: `CTR-2026-${String(nextNum).padStart(4, '0')}`,
    };
    setContratos((prev) => [novo, ...prev]);
    setUploadOpen(false);
  };

  const removeContrato = (id: string) => {
    setContratos((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Envio de contratos</h1>
            <p className="text-gray-600 mt-1">
              Anexe contratos vinculados a fornecedores e acompanhe a escrituração
              junto ao parceiro.
            </p>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Novo contrato
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total de contratos</div>
              <div className="text-xl font-bold text-gray-900">{counts.total}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Enviados</div>
              <div className="text-xl font-bold text-gray-900">{counts.enviado}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Processados</div>
              <div className="text-xl font-bold text-gray-900">{counts.processado}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Recusados</div>
              <div className="text-xl font-bold text-gray-900">{counts.recusado}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Valor acumulado</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrencyCompact(totalValor)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nº, fornecedor ou arquivo..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(
                ['all', 'Rascunho', 'Enviado', 'Processado', 'Recusado'] as const
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s === 'all' ? 'Todos' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Nº Contrato</th>
                  <th className="px-6 py-3">Fornecedor</th>
                  <th className="px-6 py-3">Arquivo</th>
                  <th className="px-6 py-3">Envio</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      Nenhum contrato encontrado.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    onClick={() => setDetailId(c.id)}
                  >
                    <td className="px-6 py-3 font-medium text-blue-700 hover:underline">
                      {c.numero}
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-gray-900">{c.supplierName}</div>
                      <div className="text-xs text-gray-500">{c.supplierCnpj}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <div>
                          <div className="text-gray-900 truncate max-w-[220px]">
                            {c.fileName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(c.fileSizeKb)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{c.envioEm}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(c.valor)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailId(c.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          aria-label="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeContrato(c.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <div>
              Exibindo {filtered.length} de {contratos.length} contratos
            </div>
            <div className="text-gray-400">
              Clique em um contrato para ver detalhes
            </div>
          </div>
        </div>
      </div>

      {uploadOpen && (
        <UploadModal onClose={() => setUploadOpen(false)} onConfirm={addContrato} />
      )}
      {detail && (
        <ContratoDetailModal contrato={detail} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
};

export default EnvioContratos;
