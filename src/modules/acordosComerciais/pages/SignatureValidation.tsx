import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Fingerprint,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useAgreementStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { formatDateTime } from '../utils';

interface SignatureValidationProps {
  agreementId: string;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export function SignatureValidation({ agreementId, onBack, onNavigate }: SignatureValidationProps) {
  const { getAgreement, completeSignature } = useAgreementStore();
  const { showToast } = useToast();
  const agreement = getAgreement(agreementId);

  if (!agreement) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Acordo não encontrado</p>
        <button onClick={onBack} className="mt-4 text-[#0070f2] text-sm hover:underline">Voltar</button>
      </div>
    );
  }

  const allSigned = agreement.signatures.every((s) => s.status === 'valid');

  const handleSign = (signatureId: string) => {
    completeSignature(agreementId, signatureId);
    const updated = getAgreement(agreementId);
    if (updated?.status === 'signed') {
      showToast('success', 'Contrato assinado', 'Todas as assinaturas foram validadas');
      setTimeout(() => onNavigate(`completed/${agreementId}`), 1000);
    } else {
      showToast('success', 'Assinatura validada', 'Aguardando assinaturas restantes');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Fechar">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">Validação de Assinaturas</h1>
            <StatusBadge status={agreement.status} />
          </div>
          <p className="text-sm text-gray-500">{agreement.code} - {agreement.title}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#0070f2]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Assinaturas Digitais</h2>
            <p className="text-sm text-gray-500">
              Valide as assinaturas digitais para finalizar o contrato
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {agreement.signatures.map((sig) => (
            <div
              key={sig.id}
              className={`rounded-xl border-2 p-5 transition-all ${
                sig.status === 'valid'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : sig.status === 'pending'
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      sig.status === 'valid'
                        ? 'bg-emerald-100'
                        : sig.status === 'pending'
                        ? 'bg-amber-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {sig.status === 'valid' ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    ) : sig.status === 'pending' ? (
                      <Clock className="w-6 h-6 text-amber-600" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{sig.signerName}</p>
                    <p className="text-sm text-gray-500">{sig.signerRole}</p>
                    {sig.status === 'valid' && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                          Certificado: {sig.certificateId}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          Assinado em: {formatDateTime(sig.signedAt)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-700">
                          <Award className="w-3.5 h-3.5" />
                          Assinatura válida - ICP-Brasil
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {sig.status === 'valid' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Validada
                    </span>
                  )}
                  {sig.status === 'pending' && (
                    <button
                      onClick={() => handleSign(sig.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#0070f2] rounded-lg hover:bg-[#005bc4] transition-colors"
                    >
                      Assinar Agora
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {allSigned && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-base font-semibold text-emerald-800">Todas as Assinaturas Validadas</p>
          <p className="text-sm text-emerald-600 mt-1">O contrato foi assinado digitalmente com sucesso</p>
          <button
            onClick={() => onNavigate(`completed/${agreementId}`)}
            className="mt-4 px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Ver Contrato Assinado
          </button>
        </div>
      )}
    </div>
  );
}
