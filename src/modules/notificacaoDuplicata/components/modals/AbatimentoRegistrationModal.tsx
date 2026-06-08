import { useState, useEffect, useCallback } from 'react';
import { X, Receipt } from 'lucide-react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import { StandardButton } from '../../../../components/ui';

interface AbatimentoRegistrationModalProps {
  bill: Bill;
  onClose: () => void;
  onConfirm: (abatimentoData: AbatimentoData) => Promise<void> | void;
}

export interface AbatimentoData {
  valorAbatimento: number;
  motivo: string;
  dataAcordo: string;
  observacoes: string;
}

const motivosAbatimento = [
  'Devolução de Mercadoria',
  'Desconto Comercial',
  'Erro de Faturamento',
  'Bonificação',
  'Acordo Comercial',
  'Outros',
];

export function AbatimentoRegistrationModal({
  bill,
  onClose,
  onConfirm,
}: AbatimentoRegistrationModalProps) {
  const [valorAbatimento, setValorAbatimento] = useState('');
  const [motivo, setMotivo] = useState('');
  const [dataAcordo, setDataAcordo] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [observacoes, setObservacoes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  const valorOriginal = bill.amount;
  const valorAbatimentoNum = parseFloat(valorAbatimento.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const valorFinal = Math.max(0, valorOriginal - valorAbatimentoNum);

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setValorAbatimento(formatted);
    if (errors.valorAbatimento) {
      setErrors((prev) => ({ ...prev, valorAbatimento: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!valorAbatimento || valorAbatimentoNum <= 0) {
      newErrors.valorAbatimento = 'Informe um valor valido';
    } else if (valorAbatimentoNum > valorOriginal) {
      newErrors.valorAbatimento = 'O abatimento nao pode ser maior que o valor original';
    }

    if (!motivo) {
      newErrors.motivo = 'Selecione um motivo';
    }

    if (!dataAcordo) {
      newErrors.dataAcordo = 'Informe a data de analise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onConfirm({
        valorAbatimento: valorAbatimentoNum,
        motivo,
        dataAcordo,
        observacoes,
      });
    } catch (error) {
      console.error('Erro ao confirmar abatimento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass = 'w-full px-3 py-2.5 border rounded-lg text-sm bg-white transition-all outline-none';
  const inputNormalClass = `${inputBaseClass} text-gray-900 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed`;
  const inputErrorClass = `${inputBaseClass} text-gray-900 border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
      style={{ fontFamily: '"72", "72full", Arial, Helvetica, sans-serif' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lg w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-xl flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#f5f6f7] flex-shrink-0 rounded-t-lg">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              Duplicata #{bill.id}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Cedente: {bill.sacador.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Valor Original</p>
              <p className="text-base font-semibold text-gray-900">
                {formatCurrency(valorOriginal)}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
              Em Aberto
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"
              aria-label="Fechar modal"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="flex items-center gap-2 mb-5">
            <Receipt size={16} className="text-blue-600" />
            <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Registro de Abatimento
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="valor-abatimento" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Valor do Abatimento (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  id="valor-abatimento"
                  type="text"
                  value={valorAbatimento}
                  onChange={handleValorChange}
                  placeholder="0,00"
                  aria-required="true"
                  aria-invalid={!!errors.valorAbatimento}
                  aria-describedby={errors.valorAbatimento ? 'valor-error' : undefined}
                  disabled={isLoading}
                  className={errors.valorAbatimento ? inputErrorClass : inputNormalClass}
                />
                {errors.valorAbatimento && (
                  <p id="valor-error" className="text-xs text-red-500 mt-1.5" role="alert">{errors.valorAbatimento}</p>
                )}
              </div>

              <div>
                <label htmlFor="motivo-abatimento" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Motivo do Abatimento <span className="text-red-500">*</span>
                </label>
                <select
                  id="motivo-abatimento"
                  value={motivo}
                  onChange={(e) => {
                    setMotivo(e.target.value);
                    if (errors.motivo) {
                      setErrors((prev) => ({ ...prev, motivo: '' }));
                    }
                  }}
                  aria-required="true"
                  aria-invalid={!!errors.motivo}
                  aria-describedby={errors.motivo ? 'motivo-error' : undefined}
                  disabled={isLoading}
                  className={errors.motivo ? inputErrorClass : inputNormalClass}
                >
                  <option value="">Selecione um motivo</option>
                  {motivosAbatimento.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.motivo && (
                  <p id="motivo-error" className="text-xs text-red-500 mt-1.5" role="alert">{errors.motivo}</p>
                )}
              </div>

              <div>
                <label htmlFor="data-analise" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data de Analise <span className="text-red-500">*</span>
                </label>
                <input
                  id="data-analise"
                  type="date"
                  value={dataAcordo}
                  onChange={(e) => {
                    setDataAcordo(e.target.value);
                    if (errors.dataAcordo) {
                      setErrors((prev) => ({ ...prev, dataAcordo: '' }));
                    }
                  }}
                  aria-required="true"
                  aria-invalid={!!errors.dataAcordo}
                  aria-describedby={errors.dataAcordo ? 'data-error' : undefined}
                  disabled={isLoading}
                  className={errors.dataAcordo ? inputErrorClass : inputNormalClass}
                />
                {errors.dataAcordo && (
                  <p id="data-error" className="text-xs text-red-500 mt-1.5" role="alert">{errors.dataAcordo}</p>
                )}
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-5">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-5">
                  Simulacao do Novo Valor
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Valor Original</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(valorOriginal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-500">(-) Abatimento</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(valorAbatimentoNum)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Valor Final
                    </span>
                    <span className="text-base font-bold text-blue-600">
                      {formatCurrency(valorFinal)}
                    </span>
                  </div>
                </div>

                {valorAbatimentoNum > 0 && (
                  <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      O novo valor da duplicata sera de <strong>{formatCurrency(valorFinal)}</strong> apos
                      aplicacao do abatimento de <strong>{formatCurrency(valorAbatimentoNum)}</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="justificativa" className="block text-sm font-medium text-gray-700 mb-1.5">
              Justificativa Abatimento <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <textarea
              id="justificativa"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              placeholder="Informacoes adicionais sobre o abatimento..."
              disabled={isLoading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 flex-shrink-0 rounded-b-lg">
          <StandardButton
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </StandardButton>
          <StandardButton
            variant="primary"
            size="md"
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            Confirmar Abatimento
          </StandardButton>
        </div>
      </div>
    </div>
  );
}
