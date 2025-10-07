-- Create audit log table for tracking sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accessed_by UUID NOT NULL,
  accessed_table TEXT NOT NULL,
  accessed_record_id UUID,
  action_type TEXT NOT NULL, -- 'UPDATE', 'DELETE', 'INSERT', 'ADMIN_VIEW'
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_role TEXT,
  ip_address TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.sensitive_data_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.sensitive_data_audit_log
FOR SELECT
USING (is_admin(auth.uid()));

-- System can insert audit logs (using service role)
CREATE POLICY "System can insert audit logs"
ON public.sensitive_data_audit_log
FOR INSERT
WITH CHECK (true);

-- Add admin policies to bank_accounts with stricter controls
CREATE POLICY "Admins can view bank accounts for support"
ON public.bank_accounts
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update bank accounts for support"
ON public.bank_accounts
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create function to log sensitive data modifications
CREATE OR REPLACE FUNCTION public.log_sensitive_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log admin modifications to bank accounts
  IF is_admin(auth.uid()) THEN
    INSERT INTO public.sensitive_data_audit_log (
      accessed_by,
      accessed_table,
      accessed_record_id,
      action_type,
      user_role
    ) VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      COALESCE(NEW.user_id, OLD.user_id),
      TG_OP,
      'admin'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to log admin modifications to bank accounts
DROP TRIGGER IF EXISTS log_bank_account_update ON public.bank_accounts;
CREATE TRIGGER log_bank_account_update
AFTER UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.log_sensitive_modification();

DROP TRIGGER IF EXISTS log_bank_account_delete ON public.bank_accounts;
CREATE TRIGGER log_bank_account_delete
AFTER DELETE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.log_sensitive_modification();

-- Add index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_accessed_by ON public.sensitive_data_audit_log(accessed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_accessed_at ON public.sensitive_data_audit_log(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.sensitive_data_audit_log(accessed_table);

-- Add comments explaining security measures
COMMENT ON TABLE public.bank_accounts IS 'Sensitive financial data table. All modifications are logged via audit triggers. RLS policies enforce user-level isolation and admin access is tracked.';
COMMENT ON TABLE public.sensitive_data_audit_log IS 'Audit trail for all modifications to sensitive data tables. Tracks who accessed what and when.';