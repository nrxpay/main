import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Pause, RefreshCw } from "lucide-react";

interface Withdrawal {
  id: string;
  username: string | null;
  amount_usdt: number;
  amount_inr: number;
  usdt_rate: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  admin_notes: string | null;
}

export function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      // First fetch withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Then fetch user data for all user_ids in withdrawals
      if (withdrawalsData && withdrawalsData.length > 0) {
        const userIds = [...new Set(withdrawalsData.map(w => w.user_id))];
        const { data: userData, error: userError } = await supabase
          .from('user_data')
          .select('user_id, username')
          .in('user_id', userIds);

        if (userError) throw userError;

        // Create a map of user_id to username
        const userMap = new Map(userData?.map(u => [u.user_id, u.username]) || []);

        // Merge withdrawals with usernames
        const withdrawalsWithUsernames = withdrawalsData.map(withdrawal => ({
          ...withdrawal,
          username: userMap.get(withdrawal.user_id) || 'N/A'
        }));

        setWithdrawals(withdrawalsWithUsernames);
      } else {
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateWithdrawalStatus = async (withdrawalId: string, status: string, adminNotes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      // First get the withdrawal details
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();

      if (withdrawalError) throw withdrawalError;

      const updateData: any = {
        status,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      // Update withdrawal status
      const { error: updateError } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      // If approved, deduct the USDT amount from user's balance
      if (status === 'approved') {
        const { data: userBalance, error: balanceError } = await supabase
          .from('user_balances')
          .select('usdt_balance')
          .eq('user_id', withdrawal.user_id)
          .single();

        if (balanceError) throw balanceError;

        const newBalance = parseFloat(userBalance.usdt_balance.toString()) - parseFloat(withdrawal.amount_usdt.toString());

        const { error: balanceUpdateError } = await supabase
          .from('user_balances')
          .update({ usdt_balance: newBalance })
          .eq('user_id', withdrawal.user_id);

        if (balanceUpdateError) throw balanceUpdateError;
      }

      toast.success(`Withdrawal ${status} successfully`);
      fetchWithdrawals();
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast.error('Failed to update withdrawal status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ongoing: { label: 'Ongoing', variant: 'secondary' as const },
      approved: { label: 'Approved', variant: 'default' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      suspended: { label: 'Suspended', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'secondary' as const 
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Withdrawal Management</CardTitle>
          <Button 
            onClick={fetchWithdrawals}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>USDT Amount</TableHead>
                <TableHead>INR Amount</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No withdrawals found
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      {withdrawal.username || 'N/A'}
                    </TableCell>
                    <TableCell>{withdrawal.amount_usdt} USDT</TableCell>
                    <TableCell>₹{withdrawal.amount_inr}</TableCell>
                    <TableCell>₹{withdrawal.usdt_rate}</TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell>
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {withdrawal.status === 'ongoing' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected', 'Rejected by admin')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'suspended', 'Suspended pending review')}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          </>
                        )}
                        {withdrawal.status !== 'ongoing' && (
                          <span className="text-sm text-muted-foreground">
                            {withdrawal.approved_at ? `Processed on ${new Date(withdrawal.approved_at).toLocaleDateString()}` : 'No action available'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}