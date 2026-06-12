/** Valor em Real com separador de milhar, ex.: R$ 3.250,00 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** dd/mm/aaaa -> aaaa-mm-dd (para comparar com <input type="date">). */
export function toISO(v: string): string {
  const [d, m, y] = v.split('/');
  return `${y}-${m}-${d}`;
}
