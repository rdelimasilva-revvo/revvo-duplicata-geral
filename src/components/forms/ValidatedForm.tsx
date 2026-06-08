import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HelpTooltip } from '@/components/ui/Tooltip';

interface FormData {
  cnpj: string;
  valor: string;
  email: string;
  descricao: string;
}

const validateCNPJ = (cnpj: string): string | undefined => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (!cleaned) return 'CNPJ é obrigatório';
  if (cleaned.length !== 14) return 'CNPJ deve ter 14 dígitos';
  return undefined;
};

const validateValor = (valor: string): string | undefined => {
  if (!valor) return 'Valor é obrigatório';
  const num = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
  if (isNaN(num)) return 'Valor inválido';
  if (num <= 0) return 'Valor deve ser maior que zero';
  if (num > 1000000) return 'Valor não pode exceder R$ 1.000.000,00';
  return undefined;
};

const validateEmail = (email: string): string | undefined => {
  if (!email) return 'E-mail é obrigatório';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'E-mail inválido';
  return undefined;
};

const validateDescricao = (descricao: string): string | undefined => {
  if (!descricao) return 'Descrição é obrigatória';
  if (descricao.length < 10) return `Mínimo 10 caracteres (atual: ${descricao.length})`;
  if (descricao.length > 500) return `Máximo 500 caracteres (atual: ${descricao.length})`;
  return undefined;
};

export function ValidatedForm() {
  const [formData, setFormData] = useState<FormData>({
    cnpj: '',
    valor: '',
    email: '',
    descricao: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      cnpj: validateCNPJ(formData.cnpj),
      valor: validateValor(formData.valor),
      email: validateEmail(formData.email),
      descricao: validateDescricao(formData.descricao)
    };

    if (Object.values(errors).some(err => err !== undefined)) {
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      console.log('Form submitted:', formData);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-medium text-gray-700">CNPJ</label>
            <HelpTooltip content="Digite apenas números (14 dígitos)" />
          </div>
          <Input
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            validate={validateCNPJ}
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-medium text-gray-700">Valor</label>
            <HelpTooltip content="Valor entre R$ 0,01 e R$ 1.000.000,00" />
          </div>
          <Input
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            placeholder="R$ 0,00"
            validate={validateValor}
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-medium text-gray-700">E-mail</label>
          <HelpTooltip content="E-mail válido para notificações" />
        </div>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="usuario@exemplo.com"
          validate={validateEmail}
          required
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <HelpTooltip content="Entre 10 e 500 caracteres" />
        </div>
        <textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descreva o motivo da solicitação..."
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.descricao && (
          <p className="mt-1 text-xs text-gray-500">
            {formData.descricao.length}/500 caracteres
          </p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          Formulário enviado com sucesso!
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          Erro ao enviar formulário. Tente novamente.
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          Enviar Formulário
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setFormData({ cnpj: '', valor: '', email: '', descricao: '' });
            setSubmitStatus('idle');
          }}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}
