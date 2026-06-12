import { useEffect, useState } from 'react';
import { FolderLock, Loader2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '../utils';

interface AgreementDocumentRow {
  id: string;
  proposal_code: string;
  name: string;
  kind: 'contract' | 'extrato' | 'nf' | 'audit_log' | 'draft' | 'other';
  size_bytes: number;
  status: 'final' | 'draft';
  is_signed: boolean;
  generated_at: string;
}

interface DocumentsCardProps {
  proposalCode: string;
  title?: string;
  limit?: number;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DocumentsCard({ proposalCode, title = 'Documentos', limit = 4 }: DocumentsCardProps) {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<AgreementDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('agreement_documents')
        .select('*')
        .eq('proposal_code', proposalCode)
        .order('generated_at', { ascending: false })
        .limit(limit);
      if (cancelled) return;
      setDocs((data ?? []) as AgreementDocumentRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [proposalCode, limit]);

  const handleDownload = (doc: AgreementDocumentRow) => {
    const content =
      doc.kind === 'nf'
        ? `Planilha NF - Acordo ${proposalCode} (simulação)`
        : `${doc.name} · Acordo ${proposalCode}\nGerado em ${new Date().toLocaleString('pt-BR')}`;
    const mime = doc.kind === 'nf' ? 'application/vnd.ms-excel' : 'application/pdf';
    triggerDownload(doc.name, content, mime);
    showToast('success', 'Download iniciado', doc.name);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderLock className="w-3.5 h-3.5 text-[#0070f2]" />
          <h3 className="text-xs font-bold text-gray-800">{title}</h3>
        </div>
        <span className="text-[10px] text-gray-400 tabular-nums">
          {loading ? '...' : `${docs.length} ${docs.length === 1 ? 'arquivo' : 'arquivos'}`}
        </span>
      </header>

      {loading ? (
        <div className="py-6 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      ) : docs.length === 0 ? (
        <div className="py-6 px-4 text-center">
          <p className="text-xs text-gray-500">Nenhum documento disponível.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {docs.map((doc) => {
            const Icon = doc.kind === 'nf' ? FileSpreadsheet : FileText;
            const iconCls =
              doc.kind === 'nf'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-red-600 bg-red-50';
            return (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${iconCls}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{doc.name}</p>
                  <p className="text-[10px] text-gray-500 tabular-nums">
                    {formatBytes(doc.size_bytes)} · {formatDate(doc.generated_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  aria-label={`Baixar ${doc.name}`}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[11px] font-semibold hover:border-[#0070f2] hover:text-[#0070f2] hover:bg-blue-50 transition-colors"
                >
                  <Download size={12} />
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
