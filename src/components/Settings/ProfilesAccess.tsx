import React, { useMemo, useState } from 'react';
import { X } from '@phosphor-icons/react';

type Role = { id: string; name: string };
type Company = { id: string; name: string };
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  company: Company;
  role: Role;
};

type InviteUserModalProps = {
  roles: Role[];
  companies: Company[];
  onClose: () => void;
  onSubmit: (user: Omit<User, 'id' | 'company' | 'role'> & { roleId: string; companyId: string }) => void;
};

const InviteUserModal: React.FC<InviteUserModalProps> = ({ roles, companies, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    birthDate: '',
    roleId: roles[0]?.id || '',
    companyId: companies[0]?.id || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar convite.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Convidar Usuário</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <input
              className="w-full h-10 px-3 border rounded-md"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full h-10 px-3 border rounded-md"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Telefone</label>
            <input
              className="w-full h-10 px-3 border rounded-md"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Documento</label>
            <input
              className="w-full h-10 px-3 border rounded-md"
              value={form.document}
              onChange={(e) => handleChange('document', e.target.value)}
              placeholder="RG, CPF ou CNPJ"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Data de Nascimento</label>
            <input
              className="w-full h-10 px-3 border rounded-md"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Empresa</label>
              <select
                className="w-full h-10 px-3 border rounded-md"
                value={form.companyId}
                onChange={(e) => handleChange('companyId', e.target.value)}
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Função</label>
              <select
                className="w-full h-10 px-3 border rounded-md"
                value={form.roleId}
                onChange={(e) => handleChange('roleId', e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 border rounded-md">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserProfilesHeader: React.FC<{ roles: Role[]; companies: Company[]; onInvite: (payload: Omit<User, 'id' | 'company' | 'role'> & { roleId: string; companyId: string }) => void; }> = ({ roles, companies, onInvite }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Perfis e Acessos</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
          style={{ minHeight: 40 }}
          onClick={() => setIsModalOpen(true)}
        >
          Convidar Usuário
        </button>
      </div>
      {isModalOpen && (
        <InviteUserModal
          roles={roles}
          companies={companies}
          onSubmit={onInvite}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ currentPage, totalPages, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-end gap-2 mt-3">
      {currentPage > 1 && (
        <button className="h-9 px-3 border rounded-md" onClick={onPrev}>Anterior</button>
      )}
      {currentPage < totalPages && (
        <button className="h-9 px-3 border rounded-md bg-blue-600 text-white" onClick={onNext}>Próxima</button>
      )}
    </div>
  );
};

const pageSize = 8;

const ProfilesAccess: React.FC = () => {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);

  const roles: Role[] = [
    { id: 'admin', name: 'Administrador' },
    { id: 'viewer', name: 'Visualizador' },
    { id: 'operator', name: 'Operador' },
  ];

  const companies: Company[] = [
    { id: 'all', name: 'Todas as empresas' },
    { id: 'revvo', name: 'Revvo S.A.' },
    { id: 'acme', name: 'ACME Ltda' },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesCompany = companyFilter === 'all' || user.company.id === companyFilter;
      const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;
      return matchesSearch && matchesCompany && matchesRole;
    });
  }, [users, search, companyFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pageItems = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleInvite = (payload: Omit<User, 'id' | 'company' | 'role'> & { roleId: string; companyId: string }) => {
    const company = companies.find(c => c.id === payload.companyId) || companies[0];
    const role = roles.find(r => r.id === payload.roleId) || roles[0];
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      document: payload.document,
      birthDate: payload.birthDate,
      company,
      role,
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentPage(1);
  };

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="h-full w-full bg-[#F5F6F7] p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <UserProfilesHeader roles={roles} companies={companies} onInvite={handleInvite} />

        <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <input
              className="h-10 px-3 border rounded-md"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="h-10 px-3 border rounded-md"
              value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
            <select
              className="h-10 px-3 border rounded-md"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Todas as funções</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Telefone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Documento</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Data de Nascimento</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Empresa</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Função</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
              {pageItems.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone || '-'}</td>
                  <td className="px-4 py-3">{user.document || '-'}</td>
                  <td className="px-4 py-3">{user.birthDate || '-'}</td>
                  <td className="px-4 py-3">{user.company.name}</td>
                  <td className="px-4 py-3">{user.role.name}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} • {filteredUsers.length} itens
            </span>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilesAccess;

