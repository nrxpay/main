import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface USDTRate {
  buy_rate: number;
  sell_rate: number;
}

export const useUSDTRates = () => {
  const [rates, setRates] = useState<USDTRate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('usdt_rates')
        .select('buy_rate, sell_rate')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setRates(data || { buy_rate: 98, sell_rate: 98 }); // fallback rates
    } catch (error) {
      console.error('Error fetching USDT rates:', error);
      setRates({ buy_rate: 98, sell_rate: 98 }); // fallback rates
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();

    // Subscribe to rate changes
    const subscription = supabase
      .channel('usdt_rates_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'usdt_rates' },
        () => {
          fetchRates();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { rates, loading, refetch: fetchRates };
};