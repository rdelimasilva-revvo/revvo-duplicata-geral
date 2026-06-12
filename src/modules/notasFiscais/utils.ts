import { NotaFiscal, Pendencia } from './types';

/** Valor em Real com separador de milhar, ex.: R$ 3.250,00 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// dd/mm/aaaa -> aaaa-mm-dd (para <input type="date">)
export function toISO(v: string | null): string {
  if (!v) return '';
  const [d, m, y] = v.split('/');
  return `${y}-${m}-${d}`;
}

// aaaa-mm-dd -> dd/mm/aaaa
export function fromISO(v: string): string {
  if (!v) return '';
  const [y, m, d] = v.split('-');
  return `${d}/${m}/${y}`;
}

export function somaParcelas(nota: NotaFiscal): number {
  return nota.parcelas.reduce((acc, p) => acc + p.valor, 0);
}

/**
 * As regras simples, calculadas localmente:
 * 1. Cliente tem e-mail cadastrado?
 * 2. Soma das parcelas é menor ou igual ao valor da nota?
 * 3. Nota ainda não foi enviada?
 * Retorna a primeira pendência encontrada, ou null se a nota está pronta.
 */
export function getPendencia(nota: NotaFiscal): Pendencia | null {
  if (!nota.clienteEmail || !nota.clienteEmail.trim()) {
    return { tipo: 'email', aviso: 'falta e-mail' };
  }

  if (somaParcelas(nota) > nota.valor + 0.005) {
    return { tipo: 'parcelas', aviso: 'parcelas acima do valor' };
  }

  return null;
}

/** Pronta para registrar: não enviada e sem nenhuma pendência. */
export function estaPronta(nota: NotaFiscal): boolean {
  return !nota.enviada && getPendencia(nota) === null;
}
