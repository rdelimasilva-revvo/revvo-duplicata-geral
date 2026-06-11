// O módulo de automações não usa mais o Supabase: o cliente exportado aqui
// é um banco local (memória + localStorage) com a mesma API encadeada.
import { localDb } from './localDb';

export const supabase = localDb;
