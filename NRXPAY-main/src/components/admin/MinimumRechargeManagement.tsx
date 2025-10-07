import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Save, RefreshCw } from "lucide-react";

interface MinimumRechargeConfig {
  id: string;
  account_type: string;
  minimum_amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function MinimumRechargeManagement() {
  const [configs, setConfigs] = useState<MinimumRechargeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('minimum_recharge_config')
        .select('*')
        .order('account_type');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch minimum recharge configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMinimumAmount = async (id: string, newAmount: number) => {
    if (newAmount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount cannot be negative",
        variant: "destructive"
      });
      return;
    }

    setUpdating(id);
    try {
      const { error } = await supabase
        .from('minimum_recharge_config')
        .update({ 
          minimum_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Minimum recharge amount updated successfully"
      });

      fetchConfigs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update minimum recharge amount",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const toggleActiveStatus = async (id: string, isActive: boolean) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('minimum_recharge_config')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Configuration ${!isActive ? 'activated' : 'deactivated'} successfully`
      });

      fetchConfigs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update configuration status",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const getAccountTypeDisplay = (type: string) => {
    switch (type) {
      case 'savings': return 'Savings Account';
      case 'current': return 'Current Account';
      case 'corporate': return 'Corporate Account';
      default: return type;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'savings': return 'bg-green-100 text-green-800';
      case 'current': return 'bg-blue-100 text-blue-800';
      case 'corporate': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Minimum Recharge Amount Management
          </div>
          <Button onClick={fetchConfigs} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure minimum recharge amounts for different account types. These amounts will be displayed to users during the recharge process.
          </p>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Minimum Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Badge className={getAccountTypeColor(config.account_type)}>
                        {getAccountTypeDisplay(config.account_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={config.minimum_amount}
                          className="w-32"
                          onBlur={(e) => {
                            const newAmount = parseFloat(e.target.value);
                            if (!isNaN(newAmount) && newAmount !== config.minimum_amount) {
                              updateMinimumAmount(config.id, newAmount);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newAmount = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(newAmount) && newAmount !== config.minimum_amount) {
                                updateMinimumAmount(config.id, newAmount);
                              }
                            }
                          }}
                        />
                        {updating === config.id && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(config.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={config.is_active ? "outline" : "default"}
                        onClick={() => toggleActiveStatus(config.id, config.is_active)}
                        disabled={updating === config.id}
                      >
                        {config.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Current Configuration</h4>
            <div className="space-y-1 text-sm text-blue-800">
              {configs.filter(c => c.is_active).map(config => (
                <div key={config.id} className="flex justify-between">
                  <span>{getAccountTypeDisplay(config.account_type)}:</span>
                  <span className="font-medium">${config.minimum_amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}