/*
  # Revoke PUBLIC execute on SECURITY DEFINER trigger functions

  1. Security Changes
    - Revoke EXECUTE from PUBLIC role on log_nf_status_change, log_pagamento_status_change, sync_nf_status_to_pagamentos
    - These are internal trigger functions and must not be callable via RPC by any external role
    - Only postgres and service_role retain execute privileges (as trigger owners)
*/

REVOKE EXECUTE ON FUNCTION public.log_nf_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_pagamento_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_nf_status_to_pagamentos() FROM PUBLIC;
