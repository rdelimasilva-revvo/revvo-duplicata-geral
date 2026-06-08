import { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import type { AbatimentoData } from '@/modules/notificacaoDuplicata/components/modals/AbatimentoRegistrationModal';

const motivosAbatimento = [
  'Devolução de Mercadoria',
  'Desconto Comercial',
  'Erro de Faturamento',
  'Bonificação',
  'Acordo Comercial',
  'Outros',
];

interface AbatimentoInlineFormProps {
  bill: Bill;
  errors: Record<string, string>;
  onChange: (data: AbatimentoData) => void;
}

export function AbatimentoInlineForm({ bill, errors, onChange }: AbatimentoInlineFormProps) {
  const [valorAbatimento, setValorAbatimento] = useState('');
  const [motivo, setMotivo] = useState('');
  const [dataAcordo, setDataAcordo] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [observacoes, setObservacoes] = useState('');

  const valorOriginal = bill.amount;
  const valorAbatimentoNum = parseFloat(valorAbatimento.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const valorFinal = Math.max(0, valorOriginal - valorAbatimentoNum);

  useEffect(() => {
    onChange({
      valorAbatimento: valorAbatimentoNum,
      motivo,
      dataAcordo,
      observacoes,
    });
  }, [valorAbatimento, motivo, dataAcordo, observacoes]);

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
  };

  const inputBaseClass = 'w-full px-3 py-2.5 border rounded-lg text-sm bg-white transition-all outline-none';
  const inputNormalClass = `${inputBaseClass} text-gray-900 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100`;
  const inputErrorClass = `${inputBaseClass} text-gray-900 border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100`;

  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-blue-600" />
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Registro de Abatimento
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Informe os dados do abatimento para aceitar com ressalva de valor
        </p>
      </div>

      <div className="px-5 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="inline-valor-abatimento" className="block text-sm font-medium text-gray-700 mb-1.5">
                Valor do Abatimento (R$) <span className="text-red-500">*</span>
              </label>
              <input
                id="inline-valor-abatimento"
                type="text"
                value={valorAbatimento}
                onChange={handleValorChange}
                placeholder="0,00"
                aria-required="true"
                aria-invalid={!!errors.valorAbatimento}
                aria-describedby={errors.valorAbatimento ? 'inline-valor-error' : undefined}
                className={errors.valorAbatimento ? inputErrorClass : inputNormalClass}
              />
              {errors.valorAbatimento && (
                <p id="inline-valor-error" className="text-xs text-red-500 mt-1.5" role="alert">
                  {errors.valorAbatimento}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="inline-motivo-abatimento" className="block text-sm font-medium text-gray-700 mb-1.5">
                Motivo do Abatimento <span className="text-red-500">*</span>
              </label>
              <select
                id="inline-motivo-abatimento"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.motivo}
                aria-describedby={errors.motivo ? 'inline-motivo-error' : undefined}
                className={errors.motivo ? inputErrorClass : inputNormalClass}
              >
                <option value="">Selecione um motivo</option>
                {motivosAbatimento.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.motivo && (
                <p id="inline-motivo-error" className="text-xs text-red-500 mt-1.5" role="alert">
                  {errors.motivo}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="inline-data-analise" className="block text-sm font-medium text-gray-700 mb-1.5">
                Data de Análise <span className="text-red-500">*</span>
              </label>
              <input
                id="inline-data-analise"
                type="date"
                value={dataAcordo}
                onChange={(e) => setDataAcordo(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.dataAcordo}
                aria-describedby={errors.dataAcordo ? 'inline-data-error' : undefined}
                className={errors.dataAcordo ? inputErrorClass : inputNormalClass}
              />
              {errors.dataAcordo && (
                <p id="inline-data-error" className="text-xs text-red-500 mt-1.5" role="alert">
                  {errors.dataAcordo}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-5">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-5">
                Simulação do Novo Valor
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
                    O novo valor da duplicata será de <strong>{formatCurrency(valorFinal)}</strong> após
                    aplicação do abatimento de <strong>{formatCurrency(valorAbatimentoNum)}</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="inline-justificativa" className="block text-sm font-medium text-gray-700 mb-1.5">
            Justificativa Abatimento <span className="text-gray-400 font-normal ml-1">(opcional)</span>
          </label>
          <textarea
            id="inline-justificativa"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Informações adicionais sobre o abatimento..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
          />
        </div>
      </div>
    </section>
  );
}
