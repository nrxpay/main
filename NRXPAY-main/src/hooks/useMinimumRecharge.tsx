import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MinimumRechargeConfig {
  id: string;
  account_type: string;
  minimum_amount: number;
  currency: string;
  is_active: boolean;
}

export const useMinimumRecharge = () => {
  const [configs, setConfigs] = useState<MinimumRechargeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('minimum_recharge_config')
        .select('*')
        .eq('is_active', true)
        .order('account_type');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error("Error fetching minimum recharge configs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const getMinimumAmount = (accountType: string): number => {
    const config = configs.find(c => c.account_type === accountType);
    return config?.minimum_amount || 0;
  };

  const getMinimumAmountDisplay = (accountType: string): string => {
    const config = configs.find(c => c.account_type === accountType);
    return config ? `$${config.minimum_amount}` : '$0';
  };

  return {
    configs,
    loading,
    getMinimumAmount,
    getMinimumAmountDisplay,
    refetch: fetchConfigs
  };
};