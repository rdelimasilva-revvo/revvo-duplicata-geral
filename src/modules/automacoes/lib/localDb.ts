import {
  mockRuleTypes,
  mockCompanies,
  mockAssetOrigins,
  mockBkpgChannels,
  mockOutputChannels,
  mockBanks,
  mockCustomers,
  mockSuppliers,
} from './mockData';
import { DEFAULT_COMPANY_ID } from '@/modules/automacoes/constants';

/**
 * Banco de dados local do módulo de automações.
 *
 * Substitui o Supabase: expõe um cliente com a mesma API encadeada usada
 * pelas páginas (`from().select().eq()`, `insert`, `update`, `delete`,
 * `maybeSingle`, `single`, `order`, `in`), operando sobre dados em memória.
 * A tabela `rules` (a única mutável) é persistida em localStorage para que
 * regras criadas/editadas sobrevivam ao reload.
 */

type Row = Record<string, any>;

interface QueryError {
  code?: string;
  message: string;
}

interface QueryResult {
  data: any;
  error: QueryError | null;
}

const RULES_STORAGE_KEY = 'automacoes.rules.v1';

function rule(overrides: Row): Row {
  return {
    company_code: [],
    asset_origin_id: null,
    asset_type_id: null,
    bkpg_channel_id: null,
    output_channel_id: null,
    bank_id: null,
    supplier: null,
    customer: null,
    certf_digital: null,
    days_until_due_date_ini: null,
    days_until_due_date_end: null,
    creator: null,
    partner_type: null,
    company_id: DEFAULT_COMPANY_ID,
    active: true,
    ...overrides,
  };
}

function seedRules(): Row[] {
  return [
    rule({
      id: 1,
      name: 'Risco Sacado II',
      description: 'Distribuição de fornecedores programa Risco Sacado Pedrã/ Alfa',
      rule_type_id: 1,
      days_since_creation: 1,
      value_ini: 1000.0,
      value_end: 99999999.99,
      created_at: '2025-12-08T00:00:00.000Z',
      updated_at: '2025-12-08T00:00:00.000Z',
    }),
    rule({
      id: 2,
      name: 'Manifestação de Recusa Automática - Sem Pedido de Compra',
      description: 'Manifestação de Recusa Automática - Sem Pedido de Compra',
      rule_type_id: 3,
      days_since_creation: 5,
      value_ini: 10000.0,
      value_end: 15000.0,
      created_at: '2025-08-21T00:00:00.000Z',
      updated_at: '2025-08-21T00:00:00.000Z',
    }),
    rule({
      id: 3,
      name: 'Escrituração I',
      description: 'Escrituração dos ativos próprios, com fatura de valor superior a 10k.',
      rule_type_id: 2,
      active: false,
      days_since_creation: 5,
      value_ini: 10000.01,
      value_end: 9999999.99,
      created_at: '2025-07-29T00:00:00.000Z',
      updated_at: '2025-07-29T00:00:00.000Z',
    }),
    rule({
      id: 4,
      name: 'CERC Fornecedor',
      description: 'Escrituração para Fornecedores a partir do Ctas a Pagar',
      rule_type_id: 2,
      asset_origin_id: 2,
      days_since_creation: 2,
      value_ini: 1000.0,
      value_end: 9999999.99,
      supplier: ['1', '2'],
      days_until_due_date_ini: 1,
      days_until_due_date_end: 90,
      created_at: '2025-02-10T00:00:00.000Z',
      updated_at: '2025-02-10T00:00:00.000Z',
    }),
    rule({
      id: 5,
      name: 'Escrituração PETRO',
      description: 'Escrituração de recebíveis da Petrobras',
      rule_type_id: 2,
      asset_origin_id: 1,
      days_since_creation: 1,
      value_ini: 5000.0,
      value_end: 9999999.99,
      customer: ['CUST1'],
      due_date_mode: 'relative',
      due_date_rel_days: 30,
      created_at: '2025-02-10T00:00:00.000Z',
      updated_at: '2025-02-10T00:00:00.000Z',
    }),
    rule({
      id: 6,
      name: 'Manifestação de Aceite Automático - Fornecedores Homologados',
      description: 'Aceite automático de duplicatas emitidas por fornecedores homologados com pedido de compra vinculado',
      rule_type_id: 3,
      days_since_creation: 2,
      value_ini: 1000.0,
      value_end: 50000.0,
      created_at: '2025-09-15T00:00:00.000Z',
      updated_at: '2025-09-15T00:00:00.000Z',
    }),
    rule({
      id: 7,
      name: 'Manifestação de Aceite Automático - Baixo Valor',
      description: 'Aceite automático de duplicatas de baixo valor com nota fiscal validada',
      rule_type_id: 3,
      days_since_creation: 1,
      value_ini: 100.0,
      value_end: 5000.0,
      created_at: '2025-10-02T00:00:00.000Z',
      updated_at: '2025-10-02T00:00:00.000Z',
    }),
  ];
}

function loadRules(): Row[] {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // storage indisponível ou corrompido: usa o seed
  }
  return seedRules();
}

let rulesStore: Row[] = loadRules();

function persistRules() {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rulesStore));
  } catch {
    // sem persistência, mas o estado em memória continua válido
  }
}

const lookupTables: Record<string, Row[]> = {
  rule_type: mockRuleTypes as Row[],
  company: mockCompanies as Row[],
  asset_origin: mockAssetOrigins as Row[],
  bkpg_channel: mockBkpgChannels as Row[],
  output_channel: mockOutputChannels as Row[],
  banks: mockBanks as Row[],
  customer: mockCustomers as Row[],
  supplier: mockSuppliers as Row[],
};

function getTable(name: string): Row[] {
  if (name === 'rules') return rulesStore;
  return lookupTables[name] || [];
}

function looseEquals(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}

type Operation = 'select' | 'insert' | 'update' | 'delete';
type ReturnMode = 'many' | 'single' | 'maybeSingle';

class QueryBuilder implements PromiseLike<QueryResult> {
  private filters: Array<(row: Row) => boolean> = [];
  private orderColumn: string | null = null;
  private returnMode: ReturnMode = 'many';
  private returnRows: boolean;

  constructor(
    private table: string,
    private operation: Operation,
    private payload: Row[] | Row | null = null,
  ) {
    this.returnRows = operation === 'select';
  }

  select(_columns?: string) {
    this.returnRows = true;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => looseEquals(row[column], value));
    return this;
  }

  in(column: string, values: unknown[]) {
    const set = new Set(values.map(String));
    this.filters.push((row) => set.has(String(row[column])));
    return this;
  }

  order(column: string) {
    this.orderColumn = column;
    return this;
  }

  single() {
    this.returnMode = 'single';
    return this;
  }

  maybeSingle() {
    this.returnMode = 'maybeSingle';
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private matches(row: Row): boolean {
    return this.filters.every((filter) => filter(row));
  }

  private finalize(rows: Row[]): QueryResult {
    if (!this.returnRows) return { data: null, error: null };

    let result = [...rows];
    if (this.orderColumn) {
      const column = this.orderColumn;
      result.sort((a, b) => (a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0));
    }

    if (this.returnMode === 'single') {
      if (result.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'Nenhum registro encontrado' } };
      }
      return { data: result[0], error: null };
    }
    if (this.returnMode === 'maybeSingle') {
      return { data: result[0] ?? null, error: null };
    }
    return { data: result, error: null };
  }

  private execute(): QueryResult {
    const table = getTable(this.table);

    if (this.operation === 'select') {
      return this.finalize(table.filter((row) => this.matches(row)));
    }

    if (this.operation === 'insert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const nextId = table.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
      const inserted = rows.map((row, index) => ({ ...row, id: row?.id ?? nextId + index }));
      table.push(...inserted);
      if (this.table === 'rules') persistRules();
      return this.finalize(inserted);
    }

    if (this.operation === 'update') {
      const updated: Row[] = [];
      table.forEach((row, index) => {
        if (this.matches(row)) {
          table[index] = { ...row, ...(this.payload as Row) };
          updated.push(table[index]);
        }
      });
      if (this.table === 'rules') persistRules();
      return this.finalize(updated);
    }

    // delete
    const remaining = table.filter((row) => !this.matches(row));
    table.length = 0;
    table.push(...remaining);
    if (this.table === 'rules') persistRules();
    return { data: null, error: null };
  }
}

export const localDb = {
  from(table: string) {
    return {
      select: (columns?: string) => new QueryBuilder(table, 'select').select(columns),
      insert: (rows: Row[] | Row) => new QueryBuilder(table, 'insert', rows),
      update: (values: Row) => new QueryBuilder(table, 'update', values),
      delete: () => new QueryBuilder(table, 'delete'),
    };
  },
};
