import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Bitcoin, Sparkles } from "lucide-react";

interface CryptoExchangeProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoType: string;
  cryptoSymbol: string;
}

interface CryptoRate {
  id: string;
  rate_inr: number;
}

const CryptoExchange = ({ isOpen, onClose, cryptoType, cryptoSymbol }: CryptoExchangeProps) => {
  const { user } = useAuth();
  const [rate, setRate] = useState<CryptoRate | null>(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRate();
    }
  }, [isOpen, cryptoType]);

  const fetchRate = async () => {
    try {
      const { data, error } = await supabase
        .from("crypto_rates")
        .select("id, rate_inr")
        .eq("crypto_type", cryptoType)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      setRate(data);
    } catch (error) {
      console.error("Error fetching rate:", error);
      toast.error("Failed to load rates");
    }
  };

  const totalAmount = rate && quantity ? (parseFloat(quantity) * rate.rate_inr).toFixed(2) : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !rate) {
      toast.error("Please log in to continue");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setLoading(true);

    try {
      // Get username
      const { data: userData } = await supabase
        .from("user_data")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      // Create transaction
      const { error } = await supabase
        .from("crypto_transactions")
        .insert({
          user_id: user.id,
          username: userData?.username,
          crypto_type: cryptoType,
          crypto_symbol: cryptoSymbol,
          quantity: parseFloat(quantity),
          rate_inr: rate.rate_inr,
          total_inr: parseFloat(totalAmount),
          status: "pending"
        });

      if (error) throw error;

      toast.success("Exchange request submitted successfully!");
      setQuantity("");
      onClose();
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast.error(error.message || "Failed to submit exchange request");
    } finally {
      setLoading(false);
    }
  };

  const getCryptoIcon = () => {
    const icons: Record<string, string> = {
      bitcoin: "₿",
      ethereum: "Ξ",
      solana: "◎",
      litecoin: "Ł"
    };
    return icons[cryptoType] || "₿";
  };

  const getCryptoColor = () => {
    const colors: Record<string, string> = {
      bitcoin: "from-orange-400 to-orange-600",
      ethereum: "from-blue-400 to-purple-600",
      solana: "from-purple-400 to-pink-600",
      litecoin: "from-gray-400 to-gray-600"
    };
    return colors[cryptoType] || "from-orange-400 to-orange-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-center text-2xl font-bold bg-gradient-to-r ${getCryptoColor()} bg-clip-text text-transparent flex items-center justify-center gap-2`}>
            <span className="text-3xl">{getCryptoIcon()}</span>
            Exchange {cryptoSymbol}
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Current Rate Display */}
          <div className={`p-6 rounded-xl bg-gradient-to-br ${getCryptoColor()} text-white shadow-xl`}>
            <div className="text-center">
              <p className="text-sm font-medium opacity-90 mb-2">Current Rate</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">₹{rate?.rate_inr.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs opacity-75 mt-2">per {cryptoSymbol}</p>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-semibold">
              Enter Quantity ({cryptoSymbol})
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.00000001"
              placeholder={`0.00000000 ${cryptoSymbol}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-12 text-lg"
              required
            />
          </div>

          {/* Total Amount Display */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">₹{parseFloat(totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !rate}
            className={`w-full h-12 text-lg font-bold bg-gradient-to-r ${getCryptoColor()} hover:opacity-90 text-white shadow-lg`}
          >
            {loading ? "Processing..." : "Submit Exchange Request"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            * Your request will be processed by our team within 24 hours
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoExchange;
