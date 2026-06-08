export interface SupplierDuplicate {
  id: string;
  numero: string;
  sacado: string;
  cnpjSacado: string;
  emissao: string;
  vencimento: string;
  valor: number;
  status: 'Emitida' | 'Liquidada' | 'Vencida' | 'Cancelada';
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
  totalDuplicates: number;
  totalBilled: number;
  averageTicket: number;
  averageDays: number;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  lastActivity: string;
  clubeAntecipacao: boolean;
  duplicates: SupplierDuplicate[];
}

const buildDuplicates = (
  seed: string,
  count: number,
  baseValue: number
): SupplierDuplicate[] => {
  const sacados = [
    { name: 'Alpha Distribuidora S.A.', cnpj: '12.345.678/0001-90' },
    { name: 'Mercado Central Ltda', cnpj: '23.456.789/0001-01' },
    { name: 'Indústria Beta S.A.', cnpj: '34.567.890/0001-12' },
    { name: 'Rede Sul Comércio Ltda', cnpj: '45.678.901/0001-23' },
    { name: 'Comércio Omega EIRELI', cnpj: '56.789.012/0001-34' },
  ];
  const statuses: SupplierDuplicate['status'][] = [
    'Emitida',
    'Liquidada',
    'Vencida',
    'Liquidada',
    'Emitida',
  ];
  return Array.from({ length: count }, (_, i) => {
    const sacado = sacados[i % sacados.length];
    const status = statuses[i % statuses.length];
    const emissaoDay = 1 + (i % 27);
    const vencDay = 1 + ((i + 15) % 27);
    return {
      id: `${seed}-${i + 1}`,
      numero: `${seed}-${String(i + 1).padStart(4, '0')}`,
      sacado: sacado.name,
      cnpjSacado: sacado.cnpj,
      emissao: `${String(emissaoDay).padStart(2, '0')}/05/2026`,
      vencimento: `${String(vencDay).padStart(2, '0')}/06/2026`,
      valor: baseValue * (0.6 + ((i * 17) % 100) / 100),
      status,
    };
  });
};

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Fornecedor Alpha Ltda',
    cnpj: '11.222.333/0001-44',
    city: 'São Paulo',
    state: 'SP',
    totalDuplicates: 2340,
    totalBilled: 8500000,
    averageTicket: 3632,
    averageDays: 30,
    status: 'Ativo',
    lastActivity: '07/06/2026',
    clubeAntecipacao: true,
    duplicates: buildDuplicates('ALP', 12, 4200),
  },
  {
    id: 'sup-002',
    name: 'Beta Indústria S.A.',
    cnpj: '22.333.444/0001-55',
    city: 'Campinas',
    state: 'SP',
    totalDuplicates: 1890,
    totalBilled: 6750000,
    averageTicket: 3571,
    averageDays: 28,
    status: 'Ativo',
    lastActivity: '07/06/2026',
    clubeAntecipacao: true,
    duplicates: buildDuplicates('BET', 10, 3800),
  },
  {
    id: 'sup-003',
    name: 'Gamma Comércio Ltda',
    cnpj: '33.444.555/0001-66',
    city: 'Belo Horizonte',
    state: 'MG',
    totalDuplicates: 1650,
    totalBilled: 5200000,
    averageTicket: 3151,
    averageDays: 35,
    status: 'Ativo',
    lastActivity: '06/06/2026',
    clubeAntecipacao: false,
    duplicates: buildDuplicates('GAM', 9, 3300),
  },
  {
    id: 'sup-004',
    name: 'Delta Serviços S.A.',
    cnpj: '44.555.666/0001-77',
    city: 'Curitiba',
    state: 'PR',
    totalDuplicates: 1420,
    totalBilled: 4800000,
    averageTicket: 3380,
    averageDays: 32,
    status: 'Ativo',
    lastActivity: '06/06/2026',
    clubeAntecipacao: true,
    duplicates: buildDuplicates('DEL', 8, 3600),
  },
  {
    id: 'sup-005',
    name: 'Epsilon Tech Ltda',
    cnpj: '55.666.777/0001-88',
    city: 'Florianópolis',
    state: 'SC',
    totalDuplicates: 1280,
    totalBilled: 4200000,
    averageTicket: 3281,
    averageDays: 25,
    status: 'Ativo',
    lastActivity: '05/06/2026',
    clubeAntecipacao: false,
    duplicates: buildDuplicates('EPS', 7, 3100),
  },
  {
    id: 'sup-006',
    name: 'Zeta Logística Ltda',
    cnpj: '66.777.888/0001-99',
    city: 'Porto Alegre',
    state: 'RS',
    totalDuplicates: 980,
    totalBilled: 3100000,
    averageTicket: 3163,
    averageDays: 40,
    status: 'Pendente',
    lastActivity: '03/06/2026',
    clubeAntecipacao: false,
    duplicates: buildDuplicates('ZET', 6, 2800),
  },
  {
    id: 'sup-007',
    name: 'Theta Atacadista S.A.',
    cnpj: '77.888.999/0001-10',
    city: 'Salvador',
    state: 'BA',
    totalDuplicates: 720,
    totalBilled: 2400000,
    averageTicket: 3333,
    averageDays: 45,
    status: 'Ativo',
    lastActivity: '04/06/2026',
    clubeAntecipacao: true,
    duplicates: buildDuplicates('THE', 5, 2500),
  },
  {
    id: 'sup-008',
    name: 'Iota Distribuição Ltda',
    cnpj: '88.999.000/0001-21',
    city: 'Recife',
    state: 'PE',
    totalDuplicates: 540,
    totalBilled: 1700000,
    averageTicket: 3148,
    averageDays: 38,
    status: 'Inativo',
    lastActivity: '15/05/2026',
    clubeAntecipacao: false,
    duplicates: buildDuplicates('IOT', 4, 2100),
  },
];
