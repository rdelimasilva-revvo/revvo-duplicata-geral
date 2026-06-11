// A aplicação não usa mais o Supabase: o cliente exportado aqui é um banco
// local (memória + localStorage) com a mesma API encadeada. Ver ./localDb.
import { localDb } from './localDb';

export const supabase = localDb;
