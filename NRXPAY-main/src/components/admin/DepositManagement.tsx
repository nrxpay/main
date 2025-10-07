import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";

interface Deposit {
  id: string;
  user_id: string;
  username: string;
  amount: number;
  currency: string;
  status: string;
  transaction_hash: string;
  proof_image_url?: string;
  admin_notes?: string;
  created_at: string;
}

export function DepositManagement() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositError) throw depositError;

      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, username');

      if (userError) throw userError;

      const combinedDeposits = depositData.map(deposit => {
        const user = userData.find(u => u.user_id === deposit.user_id);
        return {
          ...deposit,
          username: user?.username || 'Unknown User'
        };
      });

      setDeposits(combinedDeposits);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch deposits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDepositStatus = async (depositId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error: updateError } = await supabase
        .from('deposits')
        .update({
          status,
          admin_notes: notes,
          approved_by: status === 'approved' ? (await supabase.auth.getUser()).data.user?.id : null,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', depositId);

      if (updateError) throw updateError;

      // If approved, update user balance
      if (status === 'approved') {
        const deposit = deposits.find(d => d.id === depositId);
        if (deposit) {
          // First get current balance
          const { data: balanceData, error: balanceQueryError } = await supabase
            .from('user_balances')
            .select('usdt_balance')
            .eq('user_id', deposit.user_id)
            .single();

          if (balanceQueryError) throw balanceQueryError;

          const currentBalance = balanceData?.usdt_balance || 0;
          const newBalance = Number(currentBalance) + deposit.amount;

          const { error: balanceError } = await supabase
            .from('user_balances')
            .update({
              usdt_balance: newBalance
            })
            .eq('user_id', deposit.user_id);

          if (balanceError) throw balanceError;
        }
      }

      toast({
        title: "Success",
        description: `Deposit ${status} successfully`
      });

      fetchDeposits();
      setSelectedDeposit(null);
      setAdminNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} deposit`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.transaction_hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter && statusFilter !== "all" ? deposit.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Deposit Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Deposits</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by username or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-48">
            <Label htmlFor="status-filter">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell className="font-medium">{deposit.username}</TableCell>
                  <TableCell>{deposit.amount}</TableCell>
                  <TableCell>{deposit.currency}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {deposit.transaction_hash?.substring(0, 12)}...
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                  <TableCell>
                    {new Date(deposit.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {deposit.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDeposit(deposit);
                              setAdminNotes("");
                            }}
                          >
                            Review
                          </Button>
                        </>
                      )}
                      {deposit.proof_image_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // In a real app, this would open the image in a modal
                            toast({
                              title: "Proof Image",
                              description: `Image: ${deposit.proof_image_url}`
                            });
                          }}
                        >
                          View Proof
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Review Modal */}
        {selectedDeposit && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Review Deposit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="text-sm font-medium">{selectedDeposit.username}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm font-medium">{selectedDeposit.amount} {selectedDeposit.currency}</p>
                </div>
              </div>
              
              <div>
                <Label>Transaction Hash</Label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {selectedDeposit.transaction_hash}
                </p>
              </div>

              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this deposit..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDeposit(null);
                    setAdminNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateDepositStatus(selectedDeposit.id, 'rejected', adminNotes)}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => updateDepositStatus(selectedDeposit.id, 'approved', adminNotes)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}