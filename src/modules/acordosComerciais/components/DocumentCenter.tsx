import { useEffect, useMemo, useState } from 'react';
import { FileText, Shield, Sparkles, Loader2, FolderLock } from 'lucide-react';
import {
  DownloadSimple,
  FileArchive,
  FilePdf,
  FileXls,
  ClockCounterClockwise,
  PencilSimple,
} from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useAuthStore, ROLE_LEVEL } from '@/store/authStore';
import { formatCurrency, formatDate } from '../utils';

type DocKind = 'contract' | 'extrato' | 'nf' | 'audit_log' | 'draft' | 'other';
type DocStatus = 'final' | 'draft';
type DocVisibility = 'both' | 'company_only';

interface AgreementDocument {
  id: string;
  proposal_code: string;
  name: string;
  kind: DocKind;
  size_bytes: number;
  visibility: DocVisibility;
  status: DocStatus;
  is_signed: boolean;
  generated_at: string;
  created_at: string;
}

interface DocumentCenterProps {
  proposalCode: string;
  totals: { original: number; discount: number; credits: number; final: number };
  supplierName: string;
  originCompany: string;
}

const KIND_META: Record<DocKind, { label: string; icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill' | 'bold' | 'duotone'; className?: string }>; color: string }> = {
  contract: { label: 'Contrato', icon: FilePdf, color: 'text-red-600 bg-red-50 border-red-100' },
  extrato: { label: 'Extrato', icon: FilePdf, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  nf: { label: 'Nota Fiscal', icon: FileXls, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  audit_log: { label: 'Auditoria', icon: ClockCounterClockwise, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  draft: { label: 'Rascunho', icon: PencilSimple, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  other: { label: 'Documento', icon: FileText as never, color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildExtratoLiquidacao(
  proposalCode: string,
  supplierName: string,
  originCompany: string,
  totals: DocumentCenterProps['totals'],
): string {
  const now = new Date();
  const lines = [
    'EXTRATO DE LIQUIDACAO',
    '============================================',
    '',
    `Acordo:              #${proposalCode}`,
    `Empresa de origem:   ${originCompany}`,
    `Fornecedor:          ${supplierName}`,
    `Gerado em:           ${now.toLocaleString('pt-BR')}`,
    '',
    'CONSOLIDACAO FINANCEIRA',
    '--------------------------------------------',
    `Valor Bruto:         ${formatCurrency(totals.original)}`,
    `Creditos Vinculados: ${formatCurrency(totals.credits)}`,
    `Desconto Proposto:   ${formatCurrency(totals.discount)}`,
    `Valor Liquido:       ${formatCurrency(totals.final)}`,
    '',
    'Este documento consolida a liquidacao financeira do acordo',
    'e foi gerado automaticamente pela plataforma Revvo.',
  ];
  return lines.join('\n');
}

function buildZipMock(docs: AgreementDocument[], proposalCode: string): string {
  const header = [
    `PACOTE DE DOCUMENTOS - ACORDO ${proposalCode}`,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    `Total de arquivos: ${docs.length}`,
    '',
    'CONTEUDO:',
  ];
  const body = docs.map(
    (d, i) =>
      `  ${String(i + 1).padStart(2, '0')}. ${d.name.padEnd(42, ' ')} ${formatBytes(d.size_bytes).padStart(8, ' ')}`,
  );
  return [...header, ...body, '', '(Simulacao de pacote .zip — conteudo consolidado)'].join('\n');
}

export function DocumentCenter({
  proposalCode,
  totals,
  supplierName,
  originCompany,
}: DocumentCenterProps) {
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const isCompanyViewer =
    user !== null && user.role !== 'user' && ROLE_LEVEL[user.role] <= ROLE_LEVEL.admin;

  const [documents, setDocuments] = useState<AgreementDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [zipping, setZipping] = useState(false);

  const loadDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agreement_documents')
      .select('*')
      .eq('proposal_code', proposalCode)
      .order('generated_at', { ascending: false });
    if (error) {
      console.error('[DocumentCenter] load error', error);
    } else {
      setDocuments((data ?? []) as AgreementDocument[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalCode]);

  const seedIfEmpty = async () => {
    if (!isCompanyViewer) return;
    const { count } = await supabase
      .from('agreement_documents')
      .select('id', { count: 'exact', head: true })
      .eq('proposal_code', proposalCode);
    if ((count ?? 0) > 0) return;

    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
    const seed = [
      {
        proposal_code: proposalCode,
        name: `Contrato-${proposalCode}.pdf`,
        kind: 'contract' as const,
        size_bytes: 482_311,
        visibility: 'both' as const,
        status: 'final' as const,
        is_signed: true,
        generated_at: daysAgo(3),
      },
      {
        proposal_code: proposalCode,
        name: `NF-consolidadas-${proposalCode}.xlsx`,
        kind: 'nf' as const,
        size_bytes: 128_450,
        visibility: 'both' as const,
        status: 'final' as const,
        is_signed: true,
        generated_at: daysAgo(2),
      },
      {
        proposal_code: proposalCode,
        name: `Rascunho-Aditivo-${proposalCode}.pdf`,
        kind: 'draft' as const,
        size_bytes: 84_112,
        visibility: 'company_only' as const,
        status: 'draft' as const,
        is_signed: false,
        generated_at: daysAgo(1),
      },
      {
        proposal_code: proposalCode,
        name: `Auditoria-${proposalCode}.log`,
        kind: 'audit_log' as const,
        size_bytes: 22_980,
        visibility: 'company_only' as const,
        status: 'final' as const,
        is_signed: true,
        generated_at: daysAgo(0.25),
      },
    ];
    await supabase.from('agreement_documents').insert(seed);
    await loadDocuments();
  };

  useEffect(() => {
    seedIfEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalCode, isCompanyViewer]);

  const visibleDocuments = useMemo(() => {
    if (isCompanyViewer) return documents;
    return documents.filter(
      (d) => d.visibility === 'both' && d.status === 'final' && d.is_signed,
    );
  }, [documents, isCompanyViewer]);

  const handleDownload = (doc: AgreementDocument) => {
    setDownloadingId(doc.id);
    const content =
      doc.kind === 'audit_log'
        ? `LOG DE AUDITORIA — Acordo ${proposalCode}\nGerado em ${new Date().toISOString()}\n` +
          `Usuario: ${user?.email ?? 'n/a'}\nAcao: DOWNLOAD ${doc.name}\n`
        : doc.kind === 'nf'
          ? `Planilha de Notas Fiscais do acordo ${proposalCode} (simulacao).`
          : `Documento ${doc.name} — Acordo ${proposalCode}.\nGerado em ${new Date().toLocaleString('pt-BR')}.`;
    const mime =
      doc.kind === 'nf' ? 'application/vnd.ms-excel' : doc.kind === 'audit_log' ? 'text/plain' : 'application/pdf';
    triggerDownload(doc.name, content, mime);
    showToast('success', 'Download iniciado', doc.name);
    setTimeout(() => setDownloadingId(null), 400);
  };

  const handleGenerateExtrato = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const content = buildExtratoLiquidacao(proposalCode, supplierName, originCompany, totals);
      const name = `Extrato-Liquidacao-${proposalCode}.pdf`;
      triggerDownload(name, content, 'application/pdf');

      if (isCompanyViewer) {
        await supabase.from('agreement_documents').insert({
          proposal_code: proposalCode,
          name,
          kind: 'extrato',
          size_bytes: new Blob([content]).size,
          visibility: 'both',
          status: 'final',
          is_signed: true,
          generated_at: new Date().toISOString(),
        });
        await loadDocuments();
      }
      showToast(
        'success',
        'Extrato de liquidação gerado',
        'O PDF consolidado foi baixado e arquivado na Central de Documentos.',
      );
    } catch (err) {
      console.error(err);
      showToast('error', 'Não foi possível gerar o extrato', 'Tente novamente em instantes.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    if (zipping || visibleDocuments.length === 0) return;
    setZipping(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const content = buildZipMock(visibleDocuments, proposalCode);
    triggerDownload(`Documentos-${proposalCode}.zip`, content, 'application/zip');
    showToast(
      'success',
      'Pacote .zip gerado',
      `${visibleDocuments.length} arquivo${visibleDocuments.length === 1 ? '' : 's'} compactado${visibleDocuments.length === 1 ? '' : 's'}.`,
    );
    setZipping(false);
  };

  const totalBytes = visibleDocuments.reduce((s, d) => s + d.size_bytes, 0);

  return (
    <section
      aria-label="Documentos do Acordo"
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif' }}
    >
      <header className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-blue-600" />
            Documentos do Acordo
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-lg">
            Central compartilhada entre empresa e fornecedor.{' '}
            {isCompanyViewer
              ? 'Você está visualizando todos os arquivos, incluindo rascunhos e logs.'
              : 'Apenas documentos finalizados e assinados estão disponíveis para download.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateExtrato}
            disabled={generating}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 active:bg-blue-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            title="Gerar Extrato de Liquidação consolidado"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Gerar Extrato
          </button>
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={zipping || visibleDocuments.length === 0}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 active:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2"
            title="Baixar todos os documentos compactados em .zip"
          >
            {zipping ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileArchive size={14} weight="bold" />
            )}
            Baixar Tudo
          </button>
        </div>
      </header>

      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-3 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          Perfil: {isCompanyViewer ? 'Empresa (visão completa)' : 'Fornecedor (somente finalizados)'}
        </span>
        <span className="tabular-nums">
          {visibleDocuments.length} {visibleDocuments.length === 1 ? 'arquivo' : 'arquivos'} ·{' '}
          {formatBytes(totalBytes)}
        </span>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : visibleDocuments.length === 0 ? (
        <div className="py-14 px-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <FolderLock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Nenhum documento disponível</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {isCompanyViewer
              ? 'Gere um extrato ou aguarde a criação dos arquivos do acordo.'
              : 'Os documentos aparecerão aqui assim que forem finalizados e assinados pela empresa.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {visibleDocuments.map((doc) => {
            const meta = KIND_META[doc.kind];
            const Icon = meta.icon;
            const isDownloading = downloadingId === doc.id;
            return (
              <li
                key={doc.id}
                className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-blue-50/40"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${meta.color}`}
                >
                  <Icon size={18} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
                      {meta.label}
                    </span>
                    {doc.status === 'draft' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                        Rascunho
                      </span>
                    )}
                    {!doc.is_signed && doc.status === 'final' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full">
                        Não assinado
                      </span>
                    )}
                    {doc.visibility === 'company_only' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                        <Shield className="w-2.5 h-2.5" /> Interno
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 tabular-nums">
                    {formatBytes(doc.size_bytes)} · Gerado em {formatDate(doc.generated_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={isDownloading}
                  aria-label={`Baixar ${doc.name}`}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <DownloadSimple size={14} weight="bold" />
                  )}
                  Baixar
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
