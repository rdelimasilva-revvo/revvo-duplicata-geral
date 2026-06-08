import React from 'react';
import {
  X,
  Download,
  Share2,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Calendar,
  Users,
  Fingerprint,
} from 'lucide-react';
import { useAgreementStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils';

interface CompletedAgreementProps {
  agreementId: string;
  onBack: () => void;
}

export function CompletedAgreement({ agreementId, onBack }: CompletedAgreementProps) {
  const { getAgreement } = useAgreementStore();
  const agreement = getAgreement(agreementId);

  if (!agreement) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Acordo não encontrado</p>
        <button onClick={onBack} className="mt-4 text-[#0070f2] text-sm hover:underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900">Contrato Assinado</h1>
              <StatusBadge status={agreement.status} size="md" />
            </div>
            <p className="text-sm text-gray-500">{agreement.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0070f2] text-white text-sm font-medium rounded-lg hover:bg-[#005bc4] transition-colors">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-emerald-900 mb-1">Acordo Comercial Finalizado</h2>
        <p className="text-sm text-emerald-700">
          Este acordo foi devidamente formalizado, aceito e assinado digitalmente
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Resumo do Acordo
          </h3>
          <div className="space-y-3">
            <SummaryRow label="Título" value={agreement.title} />
            <SummaryRow label="Valor Total" value={formatCurrency(agreement.totalValue)} highlight />
            <SummaryRow label="Tipo" value={agreement.contractType === 'venda' ? 'Venda' : agreement.contractType === 'cessao' ? 'Cessão' : 'Fiança'} />
            <SummaryRow label="Sacado" value={agreement.sacadoName} />
            <SummaryRow label="Fornecedor" value={agreement.supplierName} />
            {agreement.linkedContract && (
              <SummaryRow label="Contrato Vinculado" value={agreement.linkedContract} />
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Datas e Condições
          </h3>
          <div className="space-y-3">
            <SummaryRow label="Vigência" value={`${formatDate(agreement.startDate)} a ${formatDate(agreement.endDate)}`} />
            {agreement.formalizationData && (
              <>
                <SummaryRow label="Pagamento" value={agreement.formalizationData.paymentTerms} />
                <SummaryRow label="Juros" value={`${agreement.formalizationData.interestRate}% a.m.`} />
                <SummaryRow label="Multa" value={`${agreement.formalizationData.penaltyRate}%`} />
                <SummaryRow label="Carência" value={`${agreement.formalizationData.gracePeriod} dias`} />
              </>
            )}
          </div>
        </div>
      </div>

      {agreement.linkedClients.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            Clientes Vinculados ({agreement.linkedClients.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {agreement.linkedClients.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#0070f2]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.cnpj}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          Assinaturas Digitais
        </h3>
        <div className="space-y-3">
          {agreement.signatures.map((sig) => (
            <div key={sig.id} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{sig.signerName}</p>
                  <p className="text-xs text-gray-500">{sig.signerRole}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                  <Fingerprint className="w-3.5 h-3.5" />
                  {sig.certificateId}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(sig.signedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {agreement.supplierResponse && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">
              Aceite do fornecedor em {formatDateTime(agreement.supplierResponse.date)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${highlight ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}
