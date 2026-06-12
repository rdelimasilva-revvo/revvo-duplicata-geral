import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useSacador } from '@/context/SacadorContext';
import { formatCNPJ } from '@/utils/formatters';

/**
 * Seletor do CNPJ do sacador (entidade emitente do grupo).
 * Define o contexto ativo de Recebíveis — ver SacadorContext.
 */
export default function SacadorSelector() {
  const { sacadores, sacadorAtivo, setSacadorAtivoId } = useSacador();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onClickFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', onClickFora);
    return () => document.removeEventListener('mousedown', onClickFora);
  }, [aberto]);

  if (!sacadorAtivo) return null;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <span className="mb-1 block text-xs font-medium text-gray-500">Sacador</span>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className="inline-flex min-w-[280px] items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors hover:border-[#0854a0] focus:border-[#0854a0] focus:outline-none focus:ring-2 focus:ring-[#0854a0]/30"
      >
        <Building2 className="h-4 w-4 shrink-0 text-[#0854a0]" />
        <span className="flex-1 truncate text-left">
          <span className="font-medium text-gray-900">{formatCNPJ(sacadorAtivo.cnpj)}</span>
          <span className="text-gray-500"> — {sacadorAtivo.razaoSocial} ({sacadorAtivo.tipo})</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${aberto ? 'rotate-180' : ''}`}
        />
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-1 max-h-72 w-full min-w-[280px] overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {sacadores.map((s) => {
            const ativo = s.id === sacadorAtivo.id;
            return (
              <li key={s.id} role="option" aria-selected={ativo}>
                <button
                  type="button"
                  onClick={() => {
                    setSacadorAtivoId(s.id);
                    setAberto(false);
                  }}
                  className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    ativo ? 'bg-[#0854a0]/5' : ''
                  }`}
                >
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${ativo ? 'text-[#0854a0]' : 'text-transparent'}`}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-gray-900">{formatCNPJ(s.cnpj)}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {s.razaoSocial} · {s.tipo} · {s.municipio}/{s.uf}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
