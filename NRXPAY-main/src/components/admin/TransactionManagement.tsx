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
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Search, CheckCircle, XCircle, Clock, Plus, CreditCard } from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  username: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  reference_id: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
}

export function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<Array<{user_id: string, username: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // New transaction form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, username');

      if (userError) throw userError;

      setUsers(userData || []);

      const combinedTransactions = transactionData.map(transaction => {
        const user = userData.find(u => u.user_id === transaction.user_id);
        return {
          ...transaction,
          username: user?.username || 'Unknown'
        };
      });

      setTransactions(combinedTransactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: 'approved' | 'rejected') => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) throw new Error("Transaction not found");

      const { error } = await supabase
        .from('transactions')
        .update({
          status,
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Update user balance if transaction is approved
      if (status === 'approved') {
        await updateUserBalance(transaction.user_id, transaction.amount, transaction.type, transaction.currency);
      }

      toast({
        title: "Success",
        description: `Transaction ${status} successfully`
      });

      fetchTransactions();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} transaction`,
        variant: "destructive"
      });
    }
  };

  const updateUserBalance = async (userId: string, amount: number, type: string, currency: string) => {
    try {
      const balanceField = currency === 'USDT' ? 'usdt_balance' : 'current_balance';
      const increment = type === 'withdrawal' ? -amount : amount;

      // Get current balance and update it
      const { data: currentBalance } = await supabase
        .from('user_balances')
        .select(balanceField)
        .eq('user_id', userId)
        .single();

      if (currentBalance) {
        const newBalance = Math.max(0, (currentBalance[balanceField] || 0) + increment);
        await supabase
          .from('user_balances')
          .update({ [balanceField]: newBalance })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error("Failed to update user balance:", error);
    }
  };

  const createTransaction = async () => {
    if (!selectedUserId || !transactionType || !amount || !user) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUserId,
          type: transactionType,
          amount: parseFloat(amount),
          currency,
          description: description || `${transactionType} created by admin`,
          status: 'approved', // Admin-created transactions are auto-approved
          reference_id: `ADM-${Date.now()}`,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user balance immediately
      await updateUserBalance(selectedUserId, parseFloat(amount), transactionType, currency);

      toast({
        title: "Success",
        description: "Transaction created successfully"
      });

      // Reset form
      setSelectedUserId("");
      setTransactionType("");
      setAmount("");
      setDescription("");
      setCurrency("INR");

      fetchTransactions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference_id?.includes(searchTerm) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter && statusFilter !== "all" ? transaction.status === statusFilter : true;
    const matchesType = typeFilter && typeFilter !== "all" ? transaction.type === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
    <div className="space-y-6">
      {/* Create New Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="reward">Reward</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Transaction description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Button 
                onClick={createTransaction}
                disabled={!selectedUserId || !transactionType || !amount || creating}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Create Transaction
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Transaction Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Transactions</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by username, reference, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-36">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                  <TableCell>{transaction.currency}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {transaction.reference_id || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transaction.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateTransactionStatus(transaction.id, 'approved')}
                          className="h-8 px-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateTransactionStatus(transaction.id, 'rejected')}
                          className="h-8 px-2"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}