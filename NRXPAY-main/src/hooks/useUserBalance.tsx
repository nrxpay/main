import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UserBalance {
  current_balance: number;
  usdt_balance: number;
}

export const useUserBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance>({ current_balance: 0, usdt_balance: 0 });
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('current_balance, usdt_balance')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      // Use the most recent record or default values
      const latestBalance = data?.[0] || { current_balance: 0, usdt_balance: 0 };
      setBalance(latestBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (amount: number, type: 'win' | 'lose', currency: 'INR' | 'USDT' = 'INR') => {
    if (!user) return false;

    try {
      const column = currency === 'USDT' ? 'usdt_balance' : 'current_balance';
      const currentBalance = currency === 'USDT' ? balance.usdt_balance : balance.current_balance;
      const newBalance = type === 'win' ? currentBalance + amount : currentBalance - amount;

      if (newBalance < 0) {
        toast.error('Insufficient balance');
        return false;
      }

      const { error } = await supabase
        .from('user_balances')
        .upsert({ 
          user_id: user.id,
          [column]: newBalance 
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setBalance(prev => ({
        ...prev,
        [column]: newBalance
      }));

      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
      return false;
    }
  };

  useEffect(() => {
    fetchBalance();

    // Subscribe to balance changes
    const subscription = supabase
      .channel('user_balance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_balances', filter: `user_id=eq.${user?.id}` },
        () => {
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return { balance, loading, updateBalance, refetch: fetchBalance };
};