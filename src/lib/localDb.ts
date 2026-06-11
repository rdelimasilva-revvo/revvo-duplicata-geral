// Banco de dados local que substitui o Supabase em toda a aplicação.
//
// Expõe um cliente com a mesma API usada pelas páginas: `from()` com o builder
// encadeado (`select/eq/in/order/limit/not/lt/insert/update/delete/upsert/
// single/maybeSingle`), `auth` (sessão de demonstração sempre ativa),
// `channel()/removeChannel()` (eventos em memória na mesma aba) e os gatilhos
// de sincronização NF ⇄ pagamentos portados de
// supabase/migrations/20260515184211_create_synchronized_nf_payments_tables.sql.
//
// Mutações são persistidas em localStorage; o seed vem de ./localSeed.

import { buildSeedTables } from './localSeed';

type Row = Record<string, any>;

interface QueryError {
  code?: string;
  message: string;
}

interface QueryResult {
  data: any;
  error: QueryError | null;
  count?: number | null;
}

const STORAGE_KEY = 'revvo.localdb.v1';
const SEED_VERSION = 1;

const DEMO_USER = {
  id: 'a0000000-0000-4000-8000-000000000001',
  email: 'super.admin@revvo.test',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date(0).toISOString(),
};

const DEMO_SESSION = {
  access_token: 'local-demo-token',
  refresh_token: 'local-demo-refresh',
  token_type: 'bearer',
  expires_in: 3600 * 24 * 365,
  expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
  user: DEMO_USER,
};

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `local-${Date.now().toString(16)}-${Math.floor(Math.random() * 0xffffff).toString(16)}`;
}

// ---------------------------------------------------------------------------
// Armazenamento
// ---------------------------------------------------------------------------

function loadTables(): Record<string, Row[]> {
  const seed = buildSeedTables();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === SEED_VERSION && parsed.tables) {
        // Mantém as tabelas mutadas; tabelas novas no seed entram normalmente.
        return { ...seed, ...parsed.tables };
      }
    }
  } catch {
    // storage indisponível ou corrompido: segue só com o seed
  }
  return seed;
}

const tables: Record<string, Row[]> = loadTables();
const dirtyTables = new Set<string>();

function persist() {
  try {
    const snapshot: Record<string, Row[]> = {};
    dirtyTables.forEach((name) => {
      snapshot[name] = tables[name];
    });
    const raw = localStorage.getItem(STORAGE_KEY);
    const prev = raw ? JSON.parse(raw) : null;
    const merged = {
      version: SEED_VERSION,
      tables: { ...(prev?.tables ?? {}), ...snapshot },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // sem persistência, mas o estado em memória continua válido
  }
}

function getTable(name: string): Row[] {
  if (!tables[name]) tables[name] = [];
  return tables[name];
}

// ---------------------------------------------------------------------------
// Canais (realtime em memória, mesma aba)
// ---------------------------------------------------------------------------

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface ChannelListener {
  event: string;
  table?: string;
  callback: (payload: Row) => void;
}

class LocalChannel {
  listeners: ChannelListener[] = [];

  constructor(public name: string) {}

  on(_type: string, filter: { event?: string; table?: string } | ((payload: Row) => void), callback?: (payload: Row) => void) {
    if (typeof filter === 'function') {
      this.listeners.push({ event: '*', callback: filter });
    } else {
      this.listeners.push({
        event: filter?.event ?? '*',
        table: filter?.table,
        callback: callback ?? (() => undefined),
      });
    }
    return this;
  }

  subscribe(callback?: (status: string) => void) {
    activeChannels.add(this);
    callback?.('SUBSCRIBED');
    return this;
  }

  unsubscribe() {
    activeChannels.delete(this);
    return Promise.resolve('ok');
  }
}

const activeChannels = new Set<LocalChannel>();

function notifyChange(table: string, eventType: ChangeEvent, newRow: Row | null, oldRow: Row | null) {
  // Notificação assíncrona para imitar o realtime e evitar reentrância em setState.
  setTimeout(() => {
    activeChannels.forEach((channel) => {
      channel.listeners.forEach((listener) => {
        if (listener.table && listener.table !== table) return;
        if (listener.event !== '*' && listener.event !== eventType) return;
        listener.callback({
          eventType,
          schema: 'public',
          table,
          new: newRow ?? {},
          old: oldRow ?? {},
        });
      });
    });
  }, 0);
}

// ---------------------------------------------------------------------------
// Gatilhos portados das migrações (sync NF ⇄ pagamentos + histórico)
// ---------------------------------------------------------------------------

function runUpdateTriggers(table: string, oldRow: Row, newRow: Row) {
  if (table === 'notas_fiscais' && oldRow.status !== newRow.status) {
    const map: Record<string, { status: string; tipo: string }> = {
      pago: { status: 'confirmado', tipo: 'pagamento' },
      creditado: { status: 'confirmado', tipo: 'credito' },
      liquidado: { status: 'confirmado', tipo: 'liquidacao' },
      pendente: { status: 'pendente', tipo: 'pagamento' },
    };
    const target = map[newRow.status] ?? { status: 'pendente', tipo: 'pagamento' };
    const pagamentos = getTable('pagamentos_creditos');
    let found = false;
    pagamentos.forEach((row, index) => {
      if (row.transaction_id === newRow.transaction_id) {
        found = true;
        pagamentos[index] = { ...row, status: target.status, tipo: target.tipo, updated_at: new Date().toISOString() };
      }
    });
    if (!found) {
      pagamentos.push({
        id: newId(),
        transaction_id: newRow.transaction_id,
        empresa_id: newRow.empresa_id ?? '',
        fornecedor_id: newRow.fornecedor_id ?? '',
        empresa_nome: '',
        tipo: target.tipo,
        valor: newRow.valor ?? 0,
        status: target.status,
        referencia_nf: newRow.numero_nf ?? '',
        data_operacao: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    dirtyTables.add('pagamentos_creditos');

    const historico = getTable('historico_movimentacoes');
    historico.push({
      id: newId(),
      transaction_id: newRow.transaction_id,
      tabela_origem: 'notas_fiscais',
      acao: 'status_alterado',
      valor_anterior: oldRow.status,
      valor_novo: newRow.status,
      usuario_id: '',
      usuario_nome: 'Sistema',
      motivo: null,
      created_at: new Date().toISOString(),
    });
    dirtyTables.add('historico_movimentacoes');
  }

  if (table === 'pagamentos_creditos' && oldRow.status !== newRow.status) {
    const historico = getTable('historico_movimentacoes');
    historico.push({
      id: newId(),
      transaction_id: newRow.transaction_id,
      tabela_origem: 'pagamentos_creditos',
      acao: 'status_alterado',
      valor_anterior: oldRow.status,
      valor_novo: newRow.status,
      usuario_id: '',
      usuario_nome: 'Sistema',
      motivo: null,
      created_at: new Date().toISOString(),
    });
    dirtyTables.add('historico_movimentacoes');
  }
}

// ---------------------------------------------------------------------------
// Query builder
// ---------------------------------------------------------------------------

type Operation = 'select' | 'insert' | 'update' | 'delete' | 'upsert';
type ReturnMode = 'many' | 'single' | 'maybeSingle';

function compareValues(a: any, b: any): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a) < String(b) ? -1 : 1;
}

class QueryBuilder implements PromiseLike<QueryResult> {
  private filters: Array<(row: Row) => boolean> = [];
  private orderings: Array<{ column: string; ascending: boolean }> = [];
  private limitCount: number | null = null;
  private returnMode: ReturnMode = 'many';
  private returnRows: boolean;
  private wantCount = false;
  private headOnly = false;

  constructor(
    private table: string,
    private operation: Operation,
    private payload: Row[] | Row | null = null,
    private upsertOptions: { onConflict?: string } | null = null,
  ) {
    this.returnRows = operation === 'select';
  }

  select(_columns?: string, options?: { count?: string; head?: boolean }) {
    this.returnRows = true;
    if (options?.count) this.wantCount = true;
    if (options?.head) this.headOnly = true;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => String(row[column]) === String(value));
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((row) => String(row[column]) !== String(value));
    return this;
  }

  in(column: string, values: any[]) {
    const set = new Set((values ?? []).map(String));
    this.filters.push((row) => set.has(String(row[column])));
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((row) => (value === null ? row[column] === null || row[column] === undefined : row[column] === value));
    return this;
  }

  not(column: string, operator: string, value: any) {
    if (operator === 'is' && value === null) {
      this.filters.push((row) => row[column] !== null && row[column] !== undefined);
    } else {
      this.filters.push((row) => !(String(row[column]) === String(value)));
    }
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((row) => row[column] !== null && row[column] !== undefined && String(row[column]) < String(value));
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((row) => row[column] !== null && row[column] !== undefined && String(row[column]) <= String(value));
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((row) => row[column] !== null && row[column] !== undefined && String(row[column]) > String(value));
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((row) => row[column] !== null && row[column] !== undefined && String(row[column]) >= String(value));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderings.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
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
    return Promise.resolve().then(() => this.execute()).then(onfulfilled, onrejected);
  }

  private matches(row: Row): boolean {
    return this.filters.every((filter) => filter(row));
  }

  private finalize(rows: Row[]): QueryResult {
    const count = this.wantCount ? rows.length : undefined;

    if (!this.returnRows) {
      return { data: null, error: null, count: count ?? null };
    }

    let result = [...rows];
    for (let i = this.orderings.length - 1; i >= 0; i -= 1) {
      const { column, ascending } = this.orderings[i];
      result.sort((a, b) => (ascending ? compareValues(a[column], b[column]) : compareValues(b[column], a[column])));
    }
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    if (this.headOnly) {
      return { data: null, error: null, count: count ?? null };
    }

    if (this.returnMode === 'single') {
      if (result.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'Nenhum registro encontrado' }, count: count ?? null };
      }
      return { data: result[0], error: null, count: count ?? null };
    }
    if (this.returnMode === 'maybeSingle') {
      return { data: result[0] ?? null, error: null, count: count ?? null };
    }
    return { data: result, error: null, count: count ?? null };
  }

  private withDefaults(row: Row): Row {
    const now = new Date().toISOString();
    return {
      id: row.id ?? newId(),
      created_at: row.created_at ?? now,
      ...row,
    };
  }

  private execute(): QueryResult {
    const table = getTable(this.table);

    if (this.operation === 'select') {
      return this.finalize(table.filter((row) => this.matches(row)));
    }

    if (this.operation === 'insert') {
      const rows = (Array.isArray(this.payload) ? this.payload : [this.payload ?? {}]).map((row) => this.withDefaults(row as Row));
      table.push(...rows);
      dirtyTables.add(this.table);
      persist();
      rows.forEach((row) => notifyChange(this.table, 'INSERT', row, null));
      return this.finalize(rows);
    }

    if (this.operation === 'upsert') {
      const conflictKey = (this.upsertOptions?.onConflict ?? 'id').split(',')[0].trim();
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
      const affected: Row[] = [];
      rows.forEach((incoming) => {
        const index = table.findIndex((row) => String(row[conflictKey]) === String((incoming as Row)[conflictKey]));
        if (index >= 0) {
          const old = table[index];
          table[index] = { ...old, ...(incoming as Row) };
          affected.push(table[index]);
          notifyChange(this.table, 'UPDATE', table[index], old);
        } else {
          const created = this.withDefaults(incoming as Row);
          table.push(created);
          affected.push(created);
          notifyChange(this.table, 'INSERT', created, null);
        }
      });
      dirtyTables.add(this.table);
      persist();
      return this.finalize(affected);
    }

    if (this.operation === 'update') {
      const updated: Row[] = [];
      table.forEach((row, index) => {
        if (this.matches(row)) {
          const old = row;
          const next: Row = { ...row, ...(this.payload as Row) };
          if ('updated_at' in next && !(this.payload as Row)?.updated_at) {
            next.updated_at = new Date().toISOString();
          }
          table[index] = next;
          updated.push(next);
          runUpdateTriggers(this.table, old, next);
          notifyChange(this.table, 'UPDATE', next, old);
        }
      });
      dirtyTables.add(this.table);
      persist();
      return this.finalize(updated);
    }

    // delete
    const removed = table.filter((row) => this.matches(row));
    const remaining = table.filter((row) => !this.matches(row));
    table.length = 0;
    table.push(...remaining);
    dirtyTables.add(this.table);
    persist();
    removed.forEach((row) => notifyChange(this.table, 'DELETE', null, row));
    return { data: null, error: null };
  }
}

// ---------------------------------------------------------------------------
// Auth (sessão de demonstração sempre ativa)
// ---------------------------------------------------------------------------

const localAuth = {
  async getUser() {
    return { data: { user: DEMO_USER }, error: null };
  },
  async getSession() {
    return { data: { session: DEMO_SESSION }, error: null };
  },
  async signInWithPassword({ email }: { email: string; password: string }) {
    const user = { ...DEMO_USER, email: email || DEMO_USER.email };
    return { data: { user, session: { ...DEMO_SESSION, user } }, error: null };
  },
  async signUp({ email }: { email: string; password: string }) {
    const user = { ...DEMO_USER, email: email || DEMO_USER.email };
    return { data: { user, session: { ...DEMO_SESSION, user } }, error: null };
  },
  async signOut() {
    return { error: null };
  },
  onAuthStateChange(_callback: (event: string, session: unknown) => void) {
    return { data: { subscription: { unsubscribe() {} } } };
  },
};

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------

export const localDb = {
  auth: localAuth,

  from(table: string) {
    return {
      select: (columns?: string, options?: { count?: string; head?: boolean }) =>
        new QueryBuilder(table, 'select').select(columns, options),
      insert: (rows: Row[] | Row) => new QueryBuilder(table, 'insert', rows),
      update: (values: Row) => new QueryBuilder(table, 'update', values),
      upsert: (rows: Row[] | Row, options?: { onConflict?: string }) =>
        new QueryBuilder(table, 'upsert', rows, options ?? null),
      delete: () => new QueryBuilder(table, 'delete'),
    };
  },

  channel(name: string) {
    return new LocalChannel(name);
  },

  removeChannel(channel: LocalChannel) {
    channel?.unsubscribe?.();
    return Promise.resolve('ok');
  },
};

export type LocalDbClient = typeof localDb;
