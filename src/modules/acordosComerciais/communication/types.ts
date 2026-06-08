export type ProposalEventSource = 'acordos' | 'revisao';

export type ProposalDecision = 'approved' | 'refused';

export interface ProposalCreatedPayload {
  code: string;
  origin_company: string;
  total_original: number;
  total_discount: number;
  invoices_count: number;
  sent_at: string;
}

export interface ProposalViewedPayload {
  code: string;
  viewer_role: 'supplier' | 'manager';
}

export interface ProposalDecidedPayload {
  code: string;
  decision: ProposalDecision;
  refusal_reason?: string;
  total_discount: number;
  affected_invoices_count: number;
}

export interface ProposalDraftPayload {
  code: string;
  reason_excerpt: string;
}

export type ProposalEventMap = {
  'proposal:created': ProposalCreatedPayload;
  'proposal:viewed': ProposalViewedPayload;
  'proposal:decided': ProposalDecidedPayload;
  'proposal:draft_changed': ProposalDraftPayload;
};

export type ProposalEventType = keyof ProposalEventMap;

export interface ProposalChannelEvent<T extends ProposalEventType = ProposalEventType> {
  id: string;
  proposal_code: string;
  event_type: T;
  payload: ProposalEventMap[T];
  source: ProposalEventSource;
  created_by: string | null;
  created_at: string;
}
