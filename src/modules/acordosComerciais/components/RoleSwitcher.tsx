import React from 'react';
import { UserCog, Truck } from 'lucide-react';
import { UserRole } from '../types';
import { useAgreementStore } from '../store';

export function RoleSwitcher() {
  const { currentRole, setRole } = useAgreementStore();

  const roles: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'internal', label: 'Gestor Revvo', icon: <UserCog className="w-4 h-4" />, desc: 'Visão interna' },
    { value: 'supplier', label: 'Fornecedor', icon: <Truck className="w-4 h-4" />, desc: 'Portal externo' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {roles.map((role) => (
        <button
          key={role.value}
          onClick={() => setRole(role.value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            currentRole === role.value
              ? role.value === 'internal'
                ? 'bg-white text-[#0070f2] shadow-sm'
                : 'bg-white text-teal-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {role.icon}
          <span>{role.label}</span>
        </button>
      ))}
    </div>
  );
}
