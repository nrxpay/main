import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Deposit {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_hash: string | null;
  created_at: string;
  admin_notes: string | null;
  type?: 'deposit' | 'transaction'; // To distinguish between regular deposits and admin transactions
  description?: string; // For admin transactions
}

export function DepositHistory() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchDeposits();
    
    // Set up real-time updates for deposits and transactions
    const depositsChannel = supabase
      .channel('deposits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDeposits();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('transactions-deposits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDeposits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(depositsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [user]);

  const fetchDeposits = async () => {
    try {
      // Fetch regular deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Fetch deposit transactions from admin panel
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Merge and format the data
      const regularDeposits: Deposit[] = (depositsData || []).map(deposit => ({
        ...deposit,
        type: 'deposit' as const
      }));

      const transactionDeposits: Deposit[] = (transactionsData || []).map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        transaction_hash: transaction.reference_id,
        created_at: transaction.created_at,
        admin_notes: transaction.description,
        type: 'transaction' as const,
        description: transaction.description
      }));

      // Combine and sort by date
      const allDeposits = [...regularDeposits, ...transactionDeposits]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setDeposits(allDeposits);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-orange-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Deposit History</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Deposit History</h3>
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No deposits found</p>
          <p className="text-sm">Your deposit history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Deposit History</h3>
      <div className="space-y-3">
        {deposits.map((deposit) => (
          <div key={deposit.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  ${deposit.amount} {deposit.currency}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(deposit.created_at)}
              </span>
            </div>
            
            {deposit.transaction_hash && (
              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">
                  {deposit.type === 'transaction' ? 'Reference ID:' : 'Transaction ID:'}
                </span>
                <br />
                <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                  {deposit.transaction_hash}
                </code>
              </div>
            )}

            {deposit.type === 'transaction' && deposit.description && (
              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Description:</span>
                <br />
                <span className="text-xs">{deposit.description}</span>
              </div>
            )}

            <Badge 
              variant={getStatusVariant(deposit.status)}
              className={`absolute bottom-2 right-2 flex items-center space-x-1 ${getStatusColor(deposit.status)}`}
            >
              {getStatusIcon(deposit.status)}
              <span className="capitalize">{deposit.status}</span>
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}