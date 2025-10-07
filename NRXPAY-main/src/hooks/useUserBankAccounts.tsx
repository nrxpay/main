import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BankAccount {
  user_id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  branch_name: string;
  ifsc_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserBankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBankAccounts = async () => {
    if (!user) {
      setBankAccounts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, [user]);

  // Set up real-time subscription for bank accounts
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('bank_accounts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bank_accounts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBankAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    bankAccounts,
    loading,
    refetch: fetchBankAccounts,
  };
};