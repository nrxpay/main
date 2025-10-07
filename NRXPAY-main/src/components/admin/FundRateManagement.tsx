import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

interface FundRate {
  id: string;
  fund_type: string;
  rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function FundRateManagement() {
  const [rates, setRates] = useState<FundRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [newRates, setNewRates] = useState<{ [key: string]: string }>({});

  const fetchRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fund_rates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRates(data || []);
      
      // Initialize newRates with current values
      const ratesObj: { [key: string]: string } = {};
      (data || []).forEach(rate => {
        ratesObj[rate.fund_type] = rate.rate.toString();
      });
      setNewRates(ratesObj);
    } catch (error) {
      console.error('Error fetching fund rates:', error);
      toast.error('Failed to load fund rates');
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (fundType: string) => {
    const newRate = parseFloat(newRates[fundType]);
    
    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }

    setUpdating(fundType);
    try {
      const { error } = await supabase
        .from('fund_rates')
        .update({ rate: newRate })
        .eq('fund_type', fundType);

      if (error) throw error;
      
      toast.success(`${fundType.charAt(0).toUpperCase() + fundType.slice(1)} fund rate updated successfully`);
      await fetchRates();
    } catch (error) {
      console.error('Error updating fund rate:', error);
      toast.error('Failed to update fund rate');
    } finally {
      setUpdating(null);
    }
  };

  const toggleActiveStatus = async (fundType: string, currentStatus: boolean) => {
    setUpdating(fundType);
    try {
      const { error } = await supabase
        .from('fund_rates')
        .update({ is_active: !currentStatus })
        .eq('fund_type', fundType);

      if (error) throw error;
      
      toast.success(`${fundType.charAt(0).toUpperCase() + fundType.slice(1)} fund ${!currentStatus ? 'activated' : 'deactivated'}`);
      await fetchRates();
    } catch (error) {
      console.error('Error toggling fund status:', error);
      toast.error('Failed to toggle fund status');
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const getFundTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Fund';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Fund Rate Management</h2>
        <Button
          onClick={fetchRates}
          variant="outline"
          size="icon"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-6">
        {rates.map((rate) => (
          <Card key={rate.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{getFundTypeLabel(rate.fund_type)}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rate.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {rate.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`rate-${rate.fund_type}`}>Rate (INR)</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`rate-${rate.fund_type}`}
                      type="number"
                      step="0.01"
                      value={newRates[rate.fund_type] || ''}
                      onChange={(e) => setNewRates({
                        ...newRates,
                        [rate.fund_type]: e.target.value
                      })}
                      placeholder="Enter rate"
                      disabled={updating === rate.fund_type}
                    />
                    <Button
                      onClick={() => updateRate(rate.fund_type)}
                      disabled={updating === rate.fund_type}
                    >
                      {updating === rate.fund_type ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => toggleActiveStatus(rate.fund_type, rate.is_active)}
                  variant={rate.is_active ? "destructive" : "default"}
                  disabled={updating === rate.fund_type}
                >
                  {updating === rate.fund_type ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {rate.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Current Rate: ₹{rate.rate} | Last Updated: {new Date(rate.updated_at).toLocaleString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
