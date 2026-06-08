import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormState {
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
  role: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    document: '',
    birthDate: '',
    role: 'Usuário',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.email.trim()) newErrors.email = 'Email é obrigatório';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // manter lógica existente futuramente: aqui apenas simula sucesso
      navigate(-1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-2xl font-semibold mb-6">Meu Perfil</div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nome</label>
          <input
            className={`w-full h-11 px-3 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Digite seu nome"
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            className={`w-full h-11 px-3 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@exemplo.com"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Telefone</label>
          <input
            className="w-full h-11 px-3 border border-gray-300 rounded-md"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Digite seu telefone"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Documento</label>
          <input
            className="w-full h-11 px-3 border border-gray-300 rounded-md"
            value={form.document}
            onChange={(e) => handleChange('document', e.target.value)}
            placeholder="RG, CPF ou CNPJ"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
          <input
            className="w-full h-11 px-3 border border-gray-300 rounded-md"
            type="date"
            value={form.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Função</label>
          <input
            className="w-full h-11 px-3 border border-gray-300 rounded-md bg-gray-100"
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
            disabled
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-10 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-10 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;

