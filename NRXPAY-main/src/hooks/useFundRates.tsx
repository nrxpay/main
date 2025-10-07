import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FundRate {
  id: string;
  fund_type: string;
  rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFundRates = () => {
  const [rates, setRates] = useState<FundRate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('fund_rates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Error fetching fund rates:', error);
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return {
    rates,
    loading,
    refetch: fetchRates,
  };
};
