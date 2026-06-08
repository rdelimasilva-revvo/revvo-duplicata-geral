/*
  # Fix security issues on sync functions

  1. Security Changes
    - Set immutable search_path on all 4 functions to prevent path manipulation
    - Revoke EXECUTE from anon and authenticated roles on SECURITY DEFINER functions
    - These are trigger-only functions and should never be called directly via RPC
*/

-- Fix search_path on all functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.log_pagamento_status_change() SET search_path = '';
ALTER FUNCTION public.sync_nf_status_to_pagamentos() SET search_path = '';
ALTER FUNCTION public.log_nf_status_change() SET search_path = '';

-- Revoke direct execution on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.log_nf_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_pagamento_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_nf_status_to_pagamentos() FROM anon, authenticated;
