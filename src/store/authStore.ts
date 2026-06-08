import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { translateSupabaseError } from '../utils/errorTranslation';

export type UserRole = 'super_admin' | 'admin' | 'user';

export const ROLE_LEVEL: Record<UserRole, number> = {
  super_admin: 1,
  admin: 2,
  user: 3,
};

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  bootstrapTestSession: () => Promise<void>;
  hasRoleLevel: (minLevel: number) => boolean;
}

export const TEST_SUPER_ADMIN = {
  email: 'super.admin@revvo.test',
  password: 'Revvo!SuperAdmin2026',
  name: 'Super Admin (Teste)',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: authData, error: authError } = await supabase.auth
        .signInWithPassword({ email, password });

      if (authError) throw authError;

      if (!authData.user) throw new Error('No user data returned');

      const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      set({
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: profile?.name ?? authData.user.email!,
          role: (profile?.role as UserRole) ?? 'user',
        },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: translateSupabaseError(error instanceof Error ? error.message : 'An error occurred'),
        isLoading: false 
      });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: authData, error: authError } = await supabase.auth
        .signUp({ email, password });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      const { error: profileError } = await supabase
        .from('user_profile')
        .insert([{ id: authData.user.id, email, name }]);

      if (profileError) throw profileError;

      set({
        user: {
          id: authData.user.id,
          email,
          name,
          role: 'user',
        },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: translateSupabaseError(error instanceof Error ? error.message : 'An error occurred'),
        isLoading: false 
      });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isLoading: false });
    } catch (error) {
      set({
        error: translateSupabaseError(error instanceof Error ? error.message : 'An error occurred'),
        isLoading: false
      });
    }
  },

  hasRoleLevel: (minLevel: number) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    return ROLE_LEVEL[user.role] <= minLevel;
  },

  bootstrapTestSession: async () => {
    if (useAuthStore.getState().user) return;
    set({ isLoading: true, error: null });

    const ensureProfile = async (userId: string, email: string) => {
      await supabase
        .from('user_profile')
        .upsert(
          { id: userId, email, name: TEST_SUPER_ADMIN.name, role: 'super_admin' },
          { onConflict: 'id' },
        );
    };

    const hydrateFromSession = async (userId: string, email: string) => {
      await ensureProfile(userId, email);
      const { data: profile } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      set({
        user: {
          id: userId,
          email,
          name: profile?.name ?? TEST_SUPER_ADMIN.name,
          role: (profile?.role as UserRole) ?? 'super_admin',
        },
        isLoading: false,
        error: null,
      });
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const u = sessionData.session.user;
        await hydrateFromSession(u.id, u.email ?? TEST_SUPER_ADMIN.email);
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_SUPER_ADMIN.email,
        password: TEST_SUPER_ADMIN.password,
      });

      if (!signInError && signInData.user) {
        await hydrateFromSession(signInData.user.id, signInData.user.email ?? TEST_SUPER_ADMIN.email);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_SUPER_ADMIN.email,
        password: TEST_SUPER_ADMIN.password,
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Não foi possível criar a sessão de teste.');

      if (!signUpData.session) {
        const { data: retry, error: retryError } = await supabase.auth.signInWithPassword({
          email: TEST_SUPER_ADMIN.email,
          password: TEST_SUPER_ADMIN.password,
        });
        if (retryError || !retry.user) throw retryError ?? new Error('Login pós-cadastro falhou.');
        await hydrateFromSession(retry.user.id, retry.user.email ?? TEST_SUPER_ADMIN.email);
        return;
      }

      await hydrateFromSession(signUpData.user.id, signUpData.user.email ?? TEST_SUPER_ADMIN.email);
    } catch (error) {
      set({
        error: translateSupabaseError(
          error instanceof Error ? error.message : 'Falha ao iniciar sessão de teste',
        ),
        isLoading: false,
      });
    }
  },
}));