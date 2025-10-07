import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMinimumWithdrawal } from "@/hooks/useMinimumWithdrawal";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MinimumWithdrawalManagement = () => {
  const { config, updateConfig, getUserConfig } = useMinimumWithdrawal();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; username: string }>>([]);

  useEffect(() => {
    if (config) {
      setAmount(config.minimum_amount?.toString() || "");
      setCurrency(config.currency || "USDT");
    }
  }, [config]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("user_data")
        .select("user_id, username")
        .order("username");
      
      if (data) {
        setUsers(data.map(u => ({ id: u.user_id, username: u.username })));
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = targetType === "specific" ? selectedUserId : undefined;
    updateConfig({ amount: parseFloat(amount), currency, userId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minimum Withdrawal Configuration</CardTitle>
        <CardDescription>
          Set the minimum withdrawal amount for all users or specific user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetType">Apply To</Label>
            <Select value={targetType} onValueChange={(v: "all" | "specific") => setTargetType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="specific">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {targetType === "specific" && (
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Minimum Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter minimum amount"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="USDT"
              required
            />
          </div>
          <Button type="submit">Update Configuration</Button>
        </form>
        {config && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Current Global Limit: {config.minimum_amount} {config.currency}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MinimumWithdrawalManagement;
