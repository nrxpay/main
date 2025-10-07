import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Withdrawal {
  id: string;
  amount_usdt: number;
  amount_inr: number;
  status: string;
  usdt_rate: number;
  created_at: string;
  admin_notes?: string;
  type?: 'withdrawal' | 'transaction'; // To distinguish between regular withdrawals and admin transactions
  amount?: number; // For admin transactions
  currency?: string; // For admin transactions
  description?: string; // For admin transactions
}

const WithdrawHistory = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
      
      // Subscribe to real-time updates for withdrawals and transactions
      const withdrawalsSubscription = supabase
        .channel('withdrawal_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'withdrawals', filter: `user_id=eq.${user.id}` },
          () => {
            fetchWithdrawals();
          }
        )
        .subscribe();

      const transactionsSubscription = supabase
        .channel('transactions_withdrawal_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
          () => {
            fetchWithdrawals();
          }
        )
        .subscribe();

      return () => {
        withdrawalsSubscription.unsubscribe();
        transactionsSubscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchWithdrawals = async () => {
    if (!user) return;
    
    try {
      // Fetch regular withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (withdrawalsError) throw withdrawalsError;

      // Fetch withdrawal transactions from admin panel
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Merge and format the data
      const regularWithdrawals: Withdrawal[] = (withdrawalsData || []).map(withdrawal => ({
        ...withdrawal,
        type: 'withdrawal' as const
      }));

      const transactionWithdrawals: Withdrawal[] = (transactionsData || []).map(transaction => ({
        id: transaction.id,
        amount_usdt: transaction.currency === 'USDT' ? transaction.amount : 0,
        amount_inr: transaction.currency === 'INR' ? transaction.amount : 0,
        status: transaction.status,
        usdt_rate: 1, // Default rate for admin transactions
        created_at: transaction.created_at,
        admin_notes: transaction.description,
        type: 'transaction' as const,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description
      }));

      // Combine and sort by date
      const allWithdrawals = [...regularWithdrawals, ...transactionWithdrawals]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setWithdrawals(allWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return <Clock className="h-3 w-3" />;
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-3 w-3" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'default' as const;
      case 'completed':
      case 'approved':
        return 'default' as const;
      case 'rejected':
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <Minus className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No withdrawal history found</p>
          <p className="text-sm">Your withdrawal history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {withdrawals.map((withdrawal) => (
        <Card key={withdrawal.id} className="p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold">
                {withdrawal.type === 'transaction' 
                  ? `${withdrawal.currency === 'USDT' ? '$' : '₹'}${withdrawal.amount} ${withdrawal.currency}`
                  : `$${withdrawal.amount_usdt} USDT`
                }
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {formatDate(withdrawal.created_at)}
                </p>
                <Badge variant={getStatusVariant(withdrawal.status)} className="text-xs mt-1">
                  {getStatusIcon(withdrawal.status)}
                  <span className="ml-1 capitalize">{withdrawal.status}</span>
                </Badge>
              </div>
            </div>

            {withdrawal.type === 'withdrawal' && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">INR Amount:</span>
                  <span className="font-medium">₹{withdrawal.amount_inr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">{withdrawal.usdt_rate}</span>
                </div>
              </div>
            )}

            {withdrawal.type === 'transaction' && withdrawal.description && (
              <div className="space-y-1 mt-2">
                <p className="text-xs font-medium text-muted-foreground">Description:</p>
                <p className="text-sm text-gray-600">
                  {withdrawal.description}
                </p>
              </div>
            )}

            {withdrawal.admin_notes && (
              <div className="space-y-1 mt-2">
                <p className="text-xs font-medium text-muted-foreground">Admin Notes:</p>
                <p className="text-sm text-red-600 font-medium">
                  {withdrawal.admin_notes}
                </p>
              </div>
            )}
        </Card>
      ))}
    </div>
  );
};

export default WithdrawHistory;