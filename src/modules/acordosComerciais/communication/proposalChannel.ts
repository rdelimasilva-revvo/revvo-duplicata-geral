import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type {
  ProposalChannelEvent,
  ProposalEventMap,
  ProposalEventSource,
  ProposalEventType,
} from './types';

interface ChannelState {
  events: ProposalChannelEvent[];
  subscribed: boolean;
  realtime: RealtimeChannel | null;

  hydrate: (proposalCode?: string) => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => void;
  publish: <T extends ProposalEventType>(
    type: T,
    proposalCode: string,
    payload: ProposalEventMap[T],
    source: ProposalEventSource,
  ) => Promise<ProposalChannelEvent<T> | null>;
  ingest: (event: ProposalChannelEvent) => void;
  clear: () => void;
}

const MAX_EVENTS = 200;

export const useProposalChannelStore = create<ChannelState>((set, get) => ({
  events: [],
  subscribed: false,
  realtime: null,

  hydrate: async (proposalCode) => {
    const query = supabase
      .from('proposal_channel_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_EVENTS);
    const { data, error } = proposalCode
      ? await query.eq('proposal_code', proposalCode)
      : await query;
    if (error) {
      console.error('[proposalChannel] hydrate error', error);
      return;
    }
    set({ events: (data ?? []) as ProposalChannelEvent[] });
  },

  subscribe: () => {
    if (get().subscribed) return;
    const channel = supabase
      .channel('proposal_channel_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'proposal_channel_events' },
        (payload) => {
          const event = payload.new as ProposalChannelEvent;
          get().ingest(event);
        },
      )
      .subscribe();
    set({ realtime: channel, subscribed: true });
  },

  unsubscribe: () => {
    const { realtime } = get();
    if (realtime) {
      supabase.removeChannel(realtime);
    }
    set({ realtime: null, subscribed: false });
  },

  publish: async (type, proposalCode, payload, source) => {
    const { data: userResp } = await supabase.auth.getUser();
    const createdBy = userResp.user?.id ?? null;
    const { data, error } = await supabase
      .from('proposal_channel_events')
      .insert({
        proposal_code: proposalCode,
        event_type: type,
        payload,
        source,
        created_by: createdBy,
      })
      .select()
      .maybeSingle();
    if (error) {
      console.error('[proposalChannel] publish error', error);
      return null;
    }
    if (data) {
      get().ingest(data as ProposalChannelEvent);
    }
    return data as ProposalChannelEvent<typeof type> | null;
  },

  ingest: (event) =>
    set((state) => {
      if (state.events.some((e) => e.id === event.id)) return state;
      const next = [event, ...state.events].slice(0, MAX_EVENTS);
      return { events: next };
    }),

  clear: () => set({ events: [] }),
}));

export function useProposalChannel(proposalCode?: string) {
  const events = useProposalChannelStore((s) => s.events);
  const hydrate = useProposalChannelStore((s) => s.hydrate);
  const subscribe = useProposalChannelStore((s) => s.subscribe);

  useEffect(() => {
    hydrate(proposalCode);
    subscribe();
  }, [hydrate, subscribe, proposalCode]);

  const filtered = useMemo(
    () => (proposalCode ? events.filter((e) => e.proposal_code === proposalCode) : events),
    [events, proposalCode],
  );

  return filtered;
}

export function useProposalEvent<T extends ProposalEventType>(
  type: T,
  proposalCode: string | undefined,
  handler: (event: ProposalChannelEvent<T>) => void,
) {
  const events = useProposalChannel(proposalCode);
  useEffect(() => {
    if (!events.length) return;
    const latest = events.find((e) => e.event_type === type) as
      | ProposalChannelEvent<T>
      | undefined;
    if (latest) handler(latest);
    // intentionally only react to events array reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, type]);
}

export function publishProposalEvent<T extends ProposalEventType>(
  type: T,
  proposalCode: string,
  payload: ProposalEventMap[T],
  source: ProposalEventSource,
) {
  return useProposalChannelStore.getState().publish(type, proposalCode, payload, source);
}
