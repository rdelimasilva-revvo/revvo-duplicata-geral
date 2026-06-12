import React, { useMemo, useState } from 'react';
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sliders,
  FileSignature,
  ClipboardCheck,
  Zap,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Supplier } from './mockSuppliers';
import { maskCurrencyInput } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const UF_LIST = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

interface FormData {
  name: string;
  cnpj: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  taxaAntecipacao: string;
  limiteMensal: string;
  prazoMaximoDias: string;
  termoAceito: boolean;
}

const initialForm: FormData = {
  name: '',
  cnpj: '',
  city: '',
  state: 'SP',
  email: '',
  phone: '',
  taxaAntecipacao: '1.85',
  limiteMensal: '500000',
  prazoMaximoDias: '60',
  termoAceito: false,
};

const formatCnpj = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const todayBR = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const STEPS = [
  { key: 'dados', label: 'Dados do Fornecedor', icon: Building2 },
  { key: 'clube', label: 'Condições do Clube', icon: Sliders },
  { key: 'termo', label: 'Termo de Adesão', icon: FileSignature },
  { key: 'revisao', label: 'Revisão', icon: ClipboardCheck },
] as const;

interface Props {
  onClose: () => void;
  onCreate: (supplier: Supplier) => void;
}

const NovoFornecedorWizard: React.FC<Props> = ({ onClose, onCreate }) => {
  const { showToast } = useToast();
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [limiteMensalDisplay, setLimiteMensalDisplay] = useState(() =>
    initialForm.limiteMensal
      ? maskCurrencyInput(Number(initialForm.limiteMensal).toFixed(2)).display
      : ''
  );

  const stepKey = STEPS[stepIdx].key;

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (stepKey === 'dados') {
      if (!form.name.trim()) e.name = 'Razão social é obrigatória';
      if (form.cnpj.replace(/\D/g, '').length !== 14) e.cnpj = 'CNPJ deve ter 14 dígitos';
      if (!form.city.trim()) e.city = 'Cidade é obrigatória';
      if (!form.email.trim()) e.email = 'E-mail é obrigatório';
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
        e.email = 'E-mail inválido';
    }
    if (stepKey === 'clube') {
      const taxa = Number(form.taxaAntecipacao);
      const limite = Number(form.limiteMensal);
      const prazo = Number(form.prazoMaximoDias);
      if (!form.taxaAntecipacao || Number.isNaN(taxa) || taxa <= 0 || taxa > 100)
        e.taxaAntecipacao = 'Informe uma taxa entre 0 e 100%';
      if (!form.limiteMensal || Number.isNaN(limite) || limite <= 0)
        e.limiteMensal = 'Informe um limite positivo';
      if (!form.prazoMaximoDias || Number.isNaN(prazo) || prazo < 1 || prazo > 365)
        e.prazoMaximoDias = 'Prazo entre 1 e 365 dias';
    }
    if (stepKey === 'termo') {
      if (!form.termoAceito) e.termoAceito = 'É necessário aceitar o termo';
    }
    return e;
  }, [form, stepKey]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLimiteMensalChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      update('limiteMensal', '');
      setLimiteMensalDisplay('');
      return;
    }
    const { numeric, display } = maskCurrencyInput(raw);
    update('limiteMensal', String(numeric));
    setLimiteMensalDisplay(display);
  };

  const handleNext = () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setShowErrors(false);
    setStepIdx((i) => Math.max(i - 1, 0));
  };

  const handleFinish = async () => {
    if (submitting) return;
    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: form.name.trim(),
      cnpj: form.cnpj,
      city: form.city.trim(),
      state: form.state,
      totalDuplicates: 0,
      totalBilled: 0,
      averageTicket: 0,
      averageDays: Number(form.prazoMaximoDias),
      status: 'Ativo',
      lastActivity: todayBR(),
      clubeAntecipacao: true,
      duplicates: [],
    };
    setSubmitError(null);
    setSubmitting(true);
    try {
      await Promise.resolve(onCreate(supplier));
      showToast(
        'success',
        'Fornecedor cadastrado',
        `${supplier.name} foi adicionado ao Clube de Antecipação.`
      );
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : 'Ocorreu um erro inesperado ao processar o cadastro.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Novo fornecedor no Clube de Antecipação"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-blue-600">
              <Zap className="w-3.5 h-3.5" /> Cadastro no Clube de Antecipação
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-1">
              Novo Fornecedor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 -mr-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const active = idx === stepIdx;
              const done = idx < stepIdx;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : done
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-400 border border-gray-300'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div
                      className={`text-xs font-medium hidden sm:block truncate ${
                        active ? 'text-blue-700' : done ? 'text-green-700' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 ${
                        done ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {stepKey === 'dados' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Dados básicos do fornecedor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Razão social <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Ex.: Fornecedor Exemplo Ltda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  {showErrors && errors.name && (
                    <FieldError text={errors.name} />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.cnpj}
                    onChange={(e) => update('cnpj', formatCnpj(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  {showErrors && errors.cnpj && (
                    <FieldError text={errors.cnpj} />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="financeiro@fornecedor.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  {showErrors && errors.email && (
                    <FieldError text={errors.email} />
                  )}
                </div>
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="Ex.: São Paulo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                    {showErrors && errors.city && (
                      <FieldError text={errors.city} />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      UF
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => update('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      {UF_LIST.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="(11) 0000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {stepKey === 'clube' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Condições comerciais do Clube
              </h3>
              <p className="text-xs text-gray-500">
                Defina os parâmetros padrão de antecipação que serão aplicados às
                duplicatas deste fornecedor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Taxa de antecipação (% a.m.) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={form.taxaAntecipacao}
                      onChange={(e) => update('taxaAntecipacao', e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      %
                    </span>
                  </div>
                  {showErrors && errors.taxaAntecipacao && (
                    <FieldError text={errors.taxaAntecipacao} />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Limite mensal (R$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={limiteMensalDisplay}
                    onChange={(e) => handleLimiteMensalChange(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  {showErrors && errors.limiteMensal && (
                    <FieldError text={errors.limiteMensal} />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Prazo máximo (dias) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.prazoMaximoDias}
                    onChange={(e) => update('prazoMaximoDias', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  {showErrors && errors.prazoMaximoDias && (
                    <FieldError text={errors.prazoMaximoDias} />
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100 flex gap-3">
                <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  Estas condições poderão ser ajustadas individualmente por duplicata
                  depois do cadastro. O fornecedor receberá um e-mail informando que
                  está apto a operar no Clube de Antecipação.
                </div>
              </div>
            </div>
          )}

          {stepKey === 'termo' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Termo de adesão ao Clube de Antecipação
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-72 overflow-y-auto text-xs text-gray-700 leading-relaxed space-y-3">
                <p>
                  <strong>1. Objeto.</strong> O presente termo regula a adesão do
                  fornecedor ao Clube de Antecipação operado pela Revvo, autorizando
                  o desconto antecipado de duplicatas mercantis registradas em registradora
                  homologada pelo Bacen.
                </p>
                <p>
                  <strong>2. Condições financeiras.</strong> A taxa de antecipação e o
                  limite mensal informados no passo anterior poderão ser revistos mediante
                  aviso prévio de 30 (trinta) dias, sem retroatividade sobre operações
                  já contratadas.
                </p>
                <p>
                  <strong>3. Compromissos do fornecedor.</strong> O fornecedor declara
                  ser o legítimo titular dos créditos representados pelas duplicatas,
                  responsabilizando-se civil e criminalmente pela veracidade das
                  informações apresentadas.
                </p>
                <p>
                  <strong>4. Vigência.</strong> Este termo vigora por prazo indeterminado
                  e poderá ser denunciado por qualquer das partes mediante notificação
                  com 15 (quinze) dias de antecedência.
                </p>
                <p>
                  <strong>5. Foro.</strong> Fica eleito o foro da comarca de São Paulo/SP
                  para dirimir quaisquer controvérsias decorrentes deste termo.
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.termoAceito}
                  onChange={(e) => update('termoAceito', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Declaro estar ciente e de acordo com os termos acima, autorizando o
                  cadastro do fornecedor <strong>{form.name || '—'}</strong> no Clube de
                  Antecipação.
                </span>
              </label>
              {showErrors && errors.termoAceito && (
                <FieldError text={errors.termoAceito} />
              )}
            </div>
          )}

          {stepKey === 'revisao' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Revise os dados antes de confirmar
              </h3>

              <ReviewSection title="Dados do fornecedor">
                <ReviewRow label="Razão social" value={form.name} />
                <ReviewRow label="CNPJ" value={form.cnpj} />
                <ReviewRow label="E-mail" value={form.email} />
                <ReviewRow
                  label="Localização"
                  value={`${form.city}/${form.state}`}
                />
                {form.phone && <ReviewRow label="Telefone" value={form.phone} />}
              </ReviewSection>

              <ReviewSection title="Condições do Clube">
                <ReviewRow
                  label="Taxa de antecipação"
                  value={`${form.taxaAntecipacao}% a.m.`}
                />
                <ReviewRow
                  label="Limite mensal"
                  value={limiteMensalDisplay}
                />
                <ReviewRow
                  label="Prazo máximo"
                  value={`${form.prazoMaximoDias} dias`}
                />
              </ReviewSection>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex gap-3">
                <Check className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-green-900 leading-relaxed">
                  Ao confirmar, o fornecedor será cadastrado e marcado como
                  <strong> ativo no Clube de Antecipação</strong>. Ele aparecerá
                  imediatamente na listagem.
                </div>
              </div>

              {submitError && (
                <div
                  className="p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-900 leading-relaxed space-y-1">
                    <div className="text-sm font-semibold text-red-800">
                      Não foi possível cadastrar o fornecedor
                    </div>
                    <p>{submitError}</p>
                    <p>Tente novamente; se persistir, contate o suporte.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            {stepIdx < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Avançar
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {submitting ? 'Cadastrando...' : 'Cadastrar no Clube'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldError: React.FC<{ text: string }> = ({ text }) => (
  <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
    <AlertCircle className="w-3 h-3" />
    {text}
  </div>
);

const ReviewSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
      {title}
    </div>
    <div className="divide-y divide-gray-100">{children}</div>
  </div>
);

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="px-4 py-2.5 flex items-center justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 text-right">{value || '—'}</span>
  </div>
);

export default NovoFornecedorWizard;
