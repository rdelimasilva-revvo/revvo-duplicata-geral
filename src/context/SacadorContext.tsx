import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { getStoredSacadorId, storeSacadorId } from '@/utils/storage';

/**
 * Sacador = entidade emitente do próprio grupo (matriz + filiais).
 * Selecionar o CNPJ do sacador define o contexto ativo de Recebíveis:
 * as demais telas (Notas Fiscais, Duplicatas, Liquidações, etc.) leem
 * `sacadorAtivo` para escopar os dados àquele CNPJ.
 */
export interface Sacador {
  id: string;
  razaoSocial: string;
  /** CNPJ em 14 dígitos, sem máscara. Use formatCNPJ() para exibir. */
  cnpj: string;
  tipo: 'Matriz' | 'Filial';
  municipio: string;
  uf: string;
}

// Stub — substituir pela fonte real (estabelecimentos do grupo) quando disponível.
export const sacadores: Sacador[] = [
  {
    id: 'matriz',
    razaoSocial: 'ACME Comércio S.A.',
    cnpj: '12345678000190',
    tipo: 'Matriz',
    municipio: 'São Paulo',
    uf: 'SP',
  },
  {
    id: 'filial-rj',
    razaoSocial: 'ACME Comércio S.A.',
    cnpj: '12345678000271',
    tipo: 'Filial',
    municipio: 'Rio de Janeiro',
    uf: 'RJ',
  },
  {
    id: 'filial-mg',
    razaoSocial: 'ACME Comércio S.A.',
    cnpj: '12345678000352',
    tipo: 'Filial',
    municipio: 'Belo Horizonte',
    uf: 'MG',
  },
];

interface SacadorContextType {
  sacadores: Sacador[];
  sacadorAtivo: Sacador | null;
  setSacadorAtivoId: (id: string) => void;
}

const SacadorContext = createContext<SacadorContextType | undefined>(undefined);

export const SacadorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sacadorId, setSacadorId] = useState<string>(() => {
    const stored = getStoredSacadorId();
    return stored && sacadores.some((s) => s.id === stored) ? stored : sacadores[0].id;
  });

  const setSacadorAtivoId = (id: string) => {
    setSacadorId(id);
    storeSacadorId(id);
  };

  const sacadorAtivo = useMemo(
    () => sacadores.find((s) => s.id === sacadorId) ?? null,
    [sacadorId]
  );

  return (
    <SacadorContext.Provider value={{ sacadores, sacadorAtivo, setSacadorAtivoId }}>
      {children}
    </SacadorContext.Provider>
  );
};

export const useSacador = () => {
  const context = useContext(SacadorContext);
  if (context === undefined) {
    throw new Error('useSacador must be used within a SacadorProvider');
  }
  return context;
};
