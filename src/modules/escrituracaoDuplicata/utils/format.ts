export function formatCurrency(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

/** Valor em Real com separador de milhar, ex.: R$ 3.250,00 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
