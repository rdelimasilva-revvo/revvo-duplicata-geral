import React, { useState } from 'react';
import { Building2, Store, ShieldCheck, X } from 'lucide-react';
import { useAgreementStore } from '../store';

type Profile = 'company' | 'supplier';

interface AcordoAccessGateProps {
  children: React.ReactNode;
}

const SESSION_KEY = 'acordos_access_profile_v2';
const SESSION_CNPJ_KEY = 'acordos_access_supplier_cnpj';
const LEGACY_SESSION_KEY = 'acordos_access_profile';

if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // ignore storage access issues
  }
}

function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

export function getAuthedSupplierCnpj(): string | null {
  if (typeof window === 'undefined') return null;
  const profile = sessionStorage.getItem(SESSION_KEY);
  if (profile !== 'supplier') return null;
  const raw = sessionStorage.getItem(SESSION_CNPJ_KEY);
  return raw ? normalizeCnpj(raw) : null;
}

export function clearAcordosAccessSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_CNPJ_KEY);
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

export function AcordoAccessGate({ children }: AcordoAccessGateProps) {
  const { setRole } = useAgreementStore();
  const [authedProfile, setAuthedProfile] = useState<Profile | null>(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored === 'company' || stored === 'supplier' ? stored : null;
  });

  React.useEffect(() => {
    if (authedProfile) {
      setRole(authedProfile === 'supplier' ? 'supplier' : 'internal');
    }
  }, [authedProfile, setRole]);

  const handleSignOut = () => {
    clearAcordosAccessSession();
    setAuthedProfile(null);
  };

  const handleSelect = (selected: Profile) => {
    sessionStorage.setItem(SESSION_KEY, selected);
    sessionStorage.removeItem(SESSION_CNPJ_KEY);
    setAuthedProfile(selected);
  };

  if (authedProfile) {
    const label = `Trocar perfil dos Acordos (${authedProfile === 'company' ? 'Colaborador' : 'Fornecedor'})`;
    return (
      <div className="relative">
        {children}
        <button
          onClick={handleSignOut}
          aria-label={label}
          title={label}
          className="fixed top-[56px] right-4 z-40 flex items-center justify-center w-8 h-8 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#007BFF] to-[#0066E0] px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Acordos Comerciais</h1>
                <p className="text-blue-100 text-sm">Selecione como deseja visualizar o módulo</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Como você deseja acessar a seção de Acordos?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Escolha o perfil que melhor descreve sua relação com o processo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSelect('company')}
                className="group text-left p-5 rounded-xl border-2 border-slate-200 hover:border-[#007BFF] hover:bg-blue-50/50 transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-blue-100 group-hover:bg-[#007BFF] group-hover:text-white text-[#0066E0] flex items-center justify-center mb-3 transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-900 mb-1">Empresa</div>
                <div className="text-xs text-slate-500">
                  Acesso interno para criação e gestão de acordos comerciais.
                </div>
              </button>

              <button
                onClick={() => handleSelect('supplier')}
                className="group text-left p-5 rounded-xl border-2 border-slate-200 hover:border-[#007BFF] hover:bg-blue-50/50 transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-blue-100 group-hover:bg-[#007BFF] group-hover:text-white text-[#0066E0] flex items-center justify-center mb-3 transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-900 mb-1">Fornecedor</div>
                <div className="text-xs text-slate-500">
                  Revisão de proposta para visualizar e responder acordos recebidos.
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          A seleção define apenas a experiência exibida. Os demais módulos do sistema continuam acessíveis normalmente.
        </p>
      </div>
    </div>
  );
}
