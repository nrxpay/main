import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Edit, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CryptoRate {
  id: string;
  crypto_type: string;
  crypto_symbol: string;
  rate_inr: number;
  is_active: boolean;
}

interface CryptoTransaction {
  id: string;
  username: string;
  crypto_type: string;
  crypto_symbol: string;
  quantity: number;
  rate_inr: number;
  total_inr: number;
  transaction_id: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export default function CryptoManagement() {
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editedRates, setEditedRates] = useState<Record<string, number>>({});
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [editedTransactions, setEditedTransactions] = useState<Record<string, Partial<CryptoTransaction>>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratesRes, transactionsRes] = await Promise.all([
        supabase.from("crypto_rates").select("*").order("crypto_type"),
        supabase.from("crypto_transactions").select("*").order("created_at", { ascending: false })
      ]);

      if (ratesRes.error) throw ratesRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setRates(ratesRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRate = async (rateId: string) => {
    try {
      const newRate = editedRates[rateId];
      const { error } = await supabase
        .from("crypto_rates")
        .update({ rate_inr: newRate })
        .eq("id", rateId);

      if (error) throw error;

      toast.success("Rate updated successfully");
      setEditingRate(null);
      fetchData();
    } catch (error) {
      console.error("Error updating rate:", error);
      toast.error("Failed to update rate");
    }
  };

  const handleSaveTransaction = async (transactionId: string) => {
    try {
      const updates = editedTransactions[transactionId];
      const { error } = await supabase
        .from("crypto_transactions")
        .update(updates)
        .eq("id", transactionId);

      if (error) throw error;

      toast.success("Transaction updated successfully");
      setEditingTransaction(null);
      fetchData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const getCryptoIcon = (type: string) => {
    const icons: Record<string, string> = {
      bitcoin: "₿",
      ethereum: "Ξ",
      solana: "◎",
      litecoin: "Ł"
    };
    return icons[type] || "₿";
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
      <h2 className="text-2xl font-bold">Crypto Exchange Management</h2>

      <Tabs defaultValue="rates">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rates">Crypto Rates</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <div className="grid gap-4">
            {rates.map((rate) => (
              <Card key={rate.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCryptoIcon(rate.crypto_type)}</span>
                    <div>
                      <h3 className="font-semibold capitalize">{rate.crypto_type}</h3>
                      <p className="text-sm text-muted-foreground">{rate.crypto_symbol}</p>
                    </div>
                  </div>

                  {editingRate === rate.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editedRates[rate.id] ?? rate.rate_inr}
                        onChange={(e) => setEditedRates({
                          ...editedRates,
                          [rate.id]: parseFloat(e.target.value)
                        })}
                        className="w-40"
                      />
                      <Button size="sm" onClick={() => handleSaveRate(rate.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingRate(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">₹{rate.rate_inr.toLocaleString('en-IN')}</span>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingRate(rate.id);
                        setEditedRates({ ...editedRates, [rate.id]: rate.rate_inr });
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                {editingTransaction === transaction.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Username</Label>
                        <Input value={transaction.username} disabled />
                      </div>
                      <div>
                        <Label>Crypto</Label>
                        <Input value={`${transaction.crypto_symbol} (${transaction.quantity})`} disabled />
                      </div>
                      <div>
                        <Label>Total INR</Label>
                        <Input value={transaction.total_inr} disabled />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={editedTransactions[transaction.id]?.status ?? transaction.status}
                          onValueChange={(value) => setEditedTransactions({
                            ...editedTransactions,
                            [transaction.id]: { ...editedTransactions[transaction.id], status: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Transaction ID</Label>
                        <Input
                          value={editedTransactions[transaction.id]?.transaction_id ?? transaction.transaction_id ?? ""}
                          onChange={(e) => setEditedTransactions({
                            ...editedTransactions,
                            [transaction.id]: { ...editedTransactions[transaction.id], transaction_id: e.target.value }
                          })}
                          placeholder="Enter transaction ID"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Admin Notes</Label>
                        <Textarea
                          value={editedTransactions[transaction.id]?.admin_notes ?? transaction.admin_notes ?? ""}
                          onChange={(e) => setEditedTransactions({
                            ...editedTransactions,
                            [transaction.id]: { ...editedTransactions[transaction.id], admin_notes: e.target.value }
                          })}
                          placeholder="Add notes..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveTransaction(transaction.id)}>
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingTransaction(null)}>
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCryptoIcon(transaction.crypto_type)}</span>
                        <div>
                          <h3 className="font-semibold">{transaction.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.quantity} {transaction.crypto_symbol} @ ₹{transaction.rate_inr.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingTransaction(transaction.id);
                        setEditedTransactions({
                          ...editedTransactions,
                          [transaction.id]: {
                            status: transaction.status,
                            transaction_id: transaction.transaction_id,
                            admin_notes: transaction.admin_notes
                          }
                        });
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold ml-2">₹{transaction.total_inr.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`ml-2 font-semibold ${
                          transaction.status === 'approved' ? 'text-green-600' :
                          transaction.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                      {transaction.transaction_id && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">TxID:</span>
                          <span className="ml-2 font-mono text-xs">{transaction.transaction_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
