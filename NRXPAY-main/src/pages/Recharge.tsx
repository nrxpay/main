import { useState } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUSDTRates } from "@/hooks/useUSDTRates";
import { DepositForm } from "@/components/DepositForm";
import { DepositHistory } from "@/components/DepositHistory";
import { toast } from "sonner";

const Recharge = () => {
  const { rates } = useUSDTRates();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const handleProceed = () => {
    if (!selectedAmount) {
      toast.error("Please select an amount");
      return;
    }
    if (selectedAmount < 50) {
      toast.error("Minimum amount is $50");
      return;
    }
    setShowDepositForm(true);
  };

  const handleCustomAmountSet = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 50) {
      toast.error("Please enter a valid amount above $50");
      return;
    }
    setSelectedAmount(amount);
    setCustomAmount("");
    toast.success(`Custom amount $${amount} selected`);
  };

  const handleDepositSuccess = () => {
    setShowDepositForm(false);
    setSelectedAmount(null);
    toast.success("Deposit request submitted! It will be reviewed by admin.");
  };

  const rechargeAmounts = [50, 100, 200, 500, 1000, 2000];

  if (showDepositForm && selectedAmount) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => setShowDepositForm(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Complete Deposit</h1>
          <div className="w-9"></div>
        </div>
        <main className="p-4 space-y-6">
          <DepositForm
            amount={selectedAmount}
            onSuccess={handleDepositSuccess}
            onCancel={() => setShowDepositForm(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Recharge</h1>
        <div className="w-9"></div>
      </div>

      <main className="p-4 space-y-6">
        {/* Exchange Rate */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current Rate</p>
            <div className="text-2xl font-bold">
              <span className="text-foreground">1 USDT = </span>
              <span className="neon-text">{rates?.buy_rate || 98} INR</span>
            </div>
          </div>
        </Card>

        {/* How Buy Quota Button */}
        <button
          onClick={() => navigate("/recharge-guide")}
          className="w-full flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <span className="font-medium text-yellow-800">How Buy Quota</span>
          <HelpCircle className="h-5 w-5 text-yellow-600" />
        </button>

        {/* Recharge Amounts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Amount (USDT)</h3>
          <div className="grid grid-cols-2 gap-3">
            {rechargeAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAmount === amount
                    ? "border-primary bg-primary/10 neon-text"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="text-xl font-bold">${amount}</div>
                <div className="text-sm text-muted-foreground">
                  ≈ ₹{amount * (rates?.buy_rate || 98)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <Card className="p-4">
          <h4 className="font-medium mb-3">Custom Amount (Min: $50)</h4>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter USDT amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="50"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button 
              variant="outline" 
              className="px-6"
              onClick={handleCustomAmountSet}
              disabled={!customAmount.trim()}
            >
              Set
            </Button>
          </div>
          {selectedAmount && !rechargeAmounts.includes(selectedAmount) && (
            <p className="text-sm text-green-600 mt-2">
              Custom amount: ${selectedAmount} selected
            </p>
          )}
        </Card>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Method</h3>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-600">₿</span>
                </div>
                <div>
                  <p className="font-medium">Pay Using Crypto App</p>
                  <p className="text-sm text-muted-foreground">USDT Transfer</p>
                </div>
              </div>
              <input type="radio" name="payment" defaultChecked />
            </div>
          </Card>
        </div>

        {/* Proceed Button */}
        <Button
          variant="neon"
          className="w-full h-12 text-lg font-semibold"
          disabled={!selectedAmount}
          onClick={handleProceed}
        >
          Proceed to Deposit {selectedAmount ? `$${selectedAmount}` : ""}
        </Button>

        {/* Note */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Minimum recharge amount is $50. Processing time: 2-5 minutes.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Recharge;