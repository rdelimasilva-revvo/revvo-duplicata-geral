/**
 * Exporta dados tabulares como arquivo CSV compatível com Excel pt-BR.
 *
 * - Usa `;` como separador (padrão do Excel em português brasileiro);
 * - Inclui BOM UTF-8 para que acentos sejam exibidos corretamente no Excel;
 * - Escapa células que contêm aspas, separador ou quebras de linha;
 * - Dispara o download via Blob + link temporário.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const escapeCell = (cell: string | number): string => {
    const text = String(cell);
    if (/[";\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCell).join(';')
  );
  const bom = String.fromCharCode(0xfeff);
  const csv = bom + lines.join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.toLowerCase().endsWith('.csv')
    ? filename
    : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
