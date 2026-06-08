import React from 'react';
import { X, FileText, Users, Link2, Calendar, Building2, Truck, ShieldCheck, AlertCircle, CreditCard as Edit3, Send } from 'lucide-react';
import { useAgreementStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '../utils';

interface AgreementDetailProps {
  agreementId: string;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export function AgreementDetail({ agreementId, onBack, onNavigate }: AgreementDetailProps) {
  const { getAgreement } = useAgreementStore();
  const agreement = getAgreement(agreementId);

  if (!agreement) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Acordo não encontrado</p>
        <button onClick={onBack} className="mt-4 text-[#0070f2] text-sm hover:underline">
          Voltar
        </button>
      </div>
    );
  }

  const canEdit = ['draft', 'pending_linkage', 'inconsistency'].includes(agreement.status);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900">{agreement.code}</h1>
              <StatusBadge status={agreement.status} size="md" />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{agreement.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => onNavigate(`wizard/${agreement.id}`)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0070f2] border border-[#0070f2]/30 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Editar Formalização
            </button>
          )}
          {agreement.status === 'signature_pending' && (
            <button
              onClick={() => onNavigate(`signatures/${agreement.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0070f2] text-white text-sm font-medium rounded-lg hover:bg-[#005bc4] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Validar Assinaturas
            </button>
          )}
          {agreement.status === 'signed' && (
            <button
              onClick={() => onNavigate(`completed/${agreement.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Ver Contrato Assinado
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Informações Gerais
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Tipo de Contrato" value={agreement.contractType === 'venda' ? 'Venda' : agreement.contractType === 'cessao' ? 'Cessão' : 'Fiança'} />
              <InfoRow label="Valor Total" value={formatCurrency(agreement.totalValue)} highlight />
              <InfoRow label="Data de Início" value={formatDate(agreement.startDate)} />
              <InfoRow label="Data de Término" value={formatDate(agreement.endDate)} />
              <InfoRow label="Criado em" value={formatDateTime(agreement.createdAt)} />
              <InfoRow label="Última Atualização" value={formatDateTime(agreement.updatedAt)} />
            </div>
          </div>

          {agreement.formalizationData && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Dados de Formalização
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Número do Acordo" value={agreement.formalizationData.agreementNumber} />
                <InfoRow label="Condições de Pagamento" value={agreement.formalizationData.paymentTerms} />
                <InfoRow label="Taxa de Juros" value={`${agreement.formalizationData.interestRate}% a.m.`} />
                <InfoRow label="Taxa de Multa" value={`${agreement.formalizationData.penaltyRate}%`} />
                <InfoRow label="Período de Carência" value={`${agreement.formalizationData.gracePeriod} dias`} />
                {agreement.formalizationData.internalNotes && (
                  <div className="col-span-2">
                    <InfoRow label="Notas Internas" value={agreement.formalizationData.internalNotes} />
                  </div>
                )}
              </div>
            </div>
          )}

          {agreement.linkedClients.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Clientes Vinculados ({agreement.linkedClients.length})
              </h3>
              <div className="space-y-2">
                {agreement.linkedClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.cnpj} &middot; {client.segment}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      Vinculado em {formatDate(client.linkedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {agreement.documents.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Documentos ({agreement.documents.length})
              </h3>
              <div className="space-y-2">
                {agreement.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#0070f2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(doc.size)} &middot; {doc.uploadedBy} &middot; {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Sacado
            </h3>
            <p className="text-sm font-medium text-gray-800">{agreement.sacadoName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{agreement.sacadoCnpj}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              Fornecedor
            </h3>
            <p className="text-sm font-medium text-gray-800">{agreement.supplierName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{agreement.supplierCnpj}</p>
          </div>

          {agreement.linkedContract && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gray-400" />
                Contrato Vinculado
              </h3>
              <p className="text-sm font-mono font-medium text-[#0070f2]">{agreement.linkedContract}</p>
            </div>
          )}

          {agreement.supplierResponse && (
            <div
              className={`border rounded-xl p-5 ${
                agreement.supplierResponse.type === 'aceite'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <h3
                className={`text-sm font-semibold mb-2 ${
                  agreement.supplierResponse.type === 'aceite' ? 'text-emerald-800' : 'text-red-800'
                }`}
              >
                {agreement.supplierResponse.type === 'aceite' ? 'Aceite do Fornecedor' : 'Recusa do Fornecedor'}
              </h3>
              <p className="text-xs text-gray-600">
                {formatDateTime(agreement.supplierResponse.date)}
              </p>
              {agreement.supplierResponse.reason && (
                <p className="text-sm text-red-700 mt-2 p-2 bg-red-100/50 rounded-md">
                  {agreement.supplierResponse.reason}
                </p>
              )}
            </div>
          )}

          {agreement.signatures.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                Assinaturas
              </h3>
              <div className="space-y-3">
                {agreement.signatures.map((sig) => (
                  <div key={sig.id} className="flex items-start gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        sig.status === 'valid'
                          ? 'bg-emerald-100'
                          : sig.status === 'pending'
                          ? 'bg-amber-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {sig.status === 'valid' ? (
                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : sig.status === 'pending' ? (
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{sig.signerName}</p>
                      <p className="text-xs text-gray-500">{sig.signerRole}</p>
                      {sig.signedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(sig.signedAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm ${highlight ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
        {value}
      </p>
    </div>
  );
}
