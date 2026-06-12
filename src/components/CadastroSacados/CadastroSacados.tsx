import { useMemo, useState } from 'react';
import { Loader2, Plus, Search, UserSquare2, X } from 'lucide-react';
import { useActionFeedback } from '../../hooks/useActionFeedback';

interface Sacado {
  id: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  municipio: string;
  uf: string;
  status: 'ativo' | 'inativo';
}

const initialSacados: Sacado[] = [
  {
    id: '1',
    razaoSocial: 'Comercial QWE EIRELI',
    cnpj: '55.666.777/0001-88',
    email: 'financeiro@comercialqwe.com.br',
    telefone: '(11) 3456-7890',
    municipio: 'São Paulo',
    uf: 'SP',
    status: 'ativo',
  },
  {
    id: '2',
    razaoSocial: 'Distribuidora GHI S.A.',
    cnpj: '66.777.888/0001-99',
    email: 'contato@distribuidoraghi.com.br',
    telefone: '(21) 2345-6789',
    municipio: 'Rio de Janeiro',
    uf: 'RJ',
    status: 'ativo',
  },
  {
    id: '3',
    razaoSocial: 'Comercial UVW S.A.',
    cnpj: '22.333.444/0001-55',
    email: 'cobranca@comercialuvw.com.br',
    telefone: '(31) 3456-1234',
    municipio: 'Belo Horizonte',
    uf: 'MG',
    status: 'ativo',
  },
  {
    id: '4',
    razaoSocial: 'Atacadista RST LTDA',
    cnpj: '33.444.555/0001-66',
    email: 'financeiro@atacadistarst.com.br',
    telefone: '(41) 3210-9876',
    municipio: 'Curitiba',
    uf: 'PR',
    status: 'inativo',
  },
];

const emptyForm = {
  razaoSocial: '',
  cnpj: '',
  email: '',
  telefone: '',
  municipio: '',
  uf: '',
};

const CadastroSacados = () => {
  const [sacados, setSacados] = useState<Sacado[]>(initialSacados);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { run, isRunning } = useActionFeedback();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sacados;
    return sacados.filter(
      s =>
        s.razaoSocial.toLowerCase().includes(q) ||
        s.cnpj.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        s.email.toLowerCase().includes(q)
    );
  }, [query, sacados]);

  const canSubmit = form.razaoSocial.trim() && form.cnpj.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isRunning) return;
    const result = await run(
      async () => {
        setSacados(prev => [
          {
            id: String(Date.now()),
            razaoSocial: form.razaoSocial.trim(),
            cnpj: form.cnpj.trim(),
            email: form.email.trim(),
            telefone: form.telefone.trim(),
            municipio: form.municipio.trim(),
            uf: form.uf.trim().toUpperCase(),
            status: 'ativo',
          },
          ...prev,
        ]);
        return true;
      },
      {
        successTitle: 'Sacado cadastrado',
        successMessage: form.razaoSocial.trim(),
      }
    );
    if (result) {
      setForm(emptyForm);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Sacados</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os sacados das suas duplicatas escrituradas
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0070f2] text-white text-sm font-medium rounded-lg hover:bg-[#0058c4] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Cadastrar sacado
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por razão social, CNPJ ou e-mail..."
                className="w-full h-[36px] pl-9 pr-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2] placeholder-gray-400"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <UserSquare2 className="w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhum sacado encontrado
              </h2>
              <p className="text-sm text-gray-500 max-w-md">
                {query
                  ? 'Ajuste a busca ou cadastre um novo sacado.'
                  : 'Cadastre o primeiro sacado para começar.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  <th className="px-4 py-3 font-medium">Razão Social</th>
                  <th className="px-4 py-3 font-medium">CNPJ</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Município/UF</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sacado => (
                  <tr key={sacado.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{sacado.razaoSocial}</td>
                    <td className="px-4 py-3 text-gray-600">{sacado.cnpj}</td>
                    <td className="px-4 py-3 text-gray-600">{sacado.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{sacado.telefone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {sacado.municipio ? `${sacado.municipio}/${sacado.uf}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          sacado.status === 'ativo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {sacado.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Cadastrar sacado</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.razaoSocial}
                  onChange={e => setForm({ ...form, razaoSocial: e.target.value })}
                  className="w-full h-[36px] px-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2]"
                  placeholder="Razão social do sacado"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.cnpj}
                    onChange={e => setForm({ ...form, cnpj: e.target.value })}
                    className="w-full h-[36px] px-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2]"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                    className="w-full h-[36px] px-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2]"
                    placeholder="(00) 0000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full h-[36px] px-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2]"
                  placeholder="contato@empresa.com.br"
                />
              </div>
              <div className="grid grid-cols-[1fr_120px] gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                  <input
                    type="text"
                    value={form.municipio}
                    onChange={e => setForm({ ...form, municipio: e.target.value })}
                    className="w-full h-[36px] px-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2]"
                    placeholder="Município"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                  <input
                    type="text"
                    value={form.uf}
                    maxLength={2}
                    onChange={e => setForm({ ...form, uf: e.target.value })}
                    className="w-full h-[36px] px-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2] uppercase"
                    placeholder="UF"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || isRunning}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0070f2] rounded-lg hover:bg-[#0058c4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRunning && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isRunning ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastroSacados;
