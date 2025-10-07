import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavingsAccount {
  id: string;
  user_id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  mobile_number: string;
  status: string;
  show_recharge_popup: boolean;
  created_at: string;
}

interface CurrentAccount {
  id: string;
  user_id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  mobile_number: string;
  status: string;
  show_recharge_popup: boolean;
  created_at: string;
}

interface CorporateAccount {
  id: string;
  user_id: string;
  company_name: string;
  company_type: string;
  registration_number: string;
  gst_number?: string;
  pan_number: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  status: string;
  show_recharge_popup: boolean;
  created_at: string;
}

export const useUserAccounts = (userId?: string) => {
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);
  const [corporateAccounts, setCorporateAccounts] = useState<CorporateAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserAccounts();
      
      // Set up real-time subscriptions for popup flag changes
      const savingsSubscription = supabase
        .channel('savings_popup_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'savings_accounts',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchUserAccounts();
        })
        .subscribe();

      const currentSubscription = supabase
        .channel('current_popup_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'current_accounts',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchUserAccounts();
        })
        .subscribe();

      const corporateSubscription = supabase
        .channel('corporate_popup_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'corporate_accounts',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchUserAccounts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(savingsSubscription);
        supabase.removeChannel(currentSubscription);
        supabase.removeChannel(corporateSubscription);
      };
    }
  }, [userId]);

  const fetchUserAccounts = async () => {
    try {
      const [savingsData, currentData, corporateData] = await Promise.all([
        supabase
          .from("savings_accounts")
          .select("*")
          .eq("user_id", userId)
          .order('created_at', { ascending: false }),
        supabase
          .from("current_accounts")
          .select("*")
          .eq("user_id", userId)
          .order('created_at', { ascending: false }),
        supabase
          .from("corporate_accounts")
          .select("*")
          .eq("user_id", userId)
          .order('created_at', { ascending: false })
      ]);

      if (savingsData.error) throw savingsData.error;
      if (currentData.error) throw currentData.error;
      if (corporateData.error) throw corporateData.error;

      setSavingsAccounts(savingsData.data || []);
      setCurrentAccounts(currentData.data || []);
      setCorporateAccounts(corporateData.data || []);
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your account information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    savingsAccounts,
    currentAccounts,
    corporateAccounts,
    loading,
    refetch: fetchUserAccounts
  };
};