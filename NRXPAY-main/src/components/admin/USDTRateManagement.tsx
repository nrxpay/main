import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, DollarSign, Plus, Edit, Trash2 } from "lucide-react";

interface USDTRate {
  id: string;
  buy_rate: number;
  sell_rate: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function USDTRateManagement() {
  const [rates, setRates] = useState<USDTRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyRate, setBuyRate] = useState("");
  const [sellRate, setSellRate] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usdt_rates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch USDT rates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRate = async () => {
    if (!buyRate || !sellRate || !user) return;

    try {
      // Deactivate all previous rates
      await supabase
        .from('usdt_rates')
        .update({ is_active: false })
        .eq('is_active', true);

      // Create new rate
      const { error } = await supabase
        .from('usdt_rates')
        .insert({
          buy_rate: parseFloat(buyRate),
          sell_rate: parseFloat(sellRate),
          created_by: user.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "USDT rate created successfully"
      });

      setBuyRate("");
      setSellRate("");
      fetchRates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create USDT rate",
        variant: "destructive"
      });
    }
  };

  const toggleRateStatus = async (rateId: string, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        // If activating this rate, deactivate all others
        await supabase
          .from('usdt_rates')
          .update({ is_active: false })
          .eq('is_active', true);
      }

      const { error } = await supabase
        .from('usdt_rates')
        .update({ is_active: !currentStatus })
        .eq('id', rateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rate ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchRates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rate status",
        variant: "destructive"
      });
    }
  };

  const deleteRate = async (rateId: string) => {
    try {
      const { error } = await supabase
        .from('usdt_rates')
        .delete()
        .eq('id', rateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rate deleted successfully"
      });

      fetchRates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rate",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create New USDT Rate
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These rates will be automatically applied to all poster displays and recharge sections across the platform.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="buy-rate">Buy Rate (INR)</Label>
              <Input
                id="buy-rate"
                type="number"
                placeholder="85.50"
                value={buyRate}
                onChange={(e) => setBuyRate(e.target.value)}
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="sell-rate">Sell Rate (INR)</Label>
              <Input
                id="sell-rate"
                type="number"
                placeholder="84.50"
                value={sellRate}
                onChange={(e) => setSellRate(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={createRate} 
                className="w-full"
                disabled={!buyRate || !sellRate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Rate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>USDT Rate History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buy Rate</TableHead>
                  <TableHead>Sell Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">₹{rate.buy_rate}</TableCell>
                    <TableCell className="font-medium">₹{rate.sell_rate}</TableCell>
                    <TableCell>
                      {rate.is_active ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(rate.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(rate.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleRateStatus(rate.id, rate.is_active)}
                        >
                          {rate.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        {!rate.is_active && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteRate(rate.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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