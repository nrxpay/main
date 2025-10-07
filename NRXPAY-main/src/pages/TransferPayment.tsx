import { useState, useEffect } from "react";
import { ArrowLeft, Copy, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CautionBanner from "@/components/CautionBanner";

const TransferPayment = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

  useEffect(() => {
    setAnimationClass("animate-pulse");
    const timer = setTimeout(() => setAnimationClass(""), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Time expired! Please start a new transaction.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }
    toast.success("Transaction ID submitted successfully!");
    navigate("/wallet");
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className={`text-lg font-semibold text-foreground ${animationClass}`}>
            NRX PAY
          </h1>
        </div>
      </header>
      
      <CautionBanner 
        content="Carefully copy the address and then proceed to pay. Double-check the address before sending payment. Wrong address will result in loss of funds." 
        isDanger={true}
      />
      
      <main className="px-4 py-6 space-y-6 animate-slide-up pb-20">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">₿</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">USDT Transfer</h2>
          <p className="text-sm text-muted-foreground">Send USDT to the address below</p>
        </div>

        <Card className="p-6 space-y-4 border-2 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold text-sm">Important Instructions</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            <li>• Only send USDT (TRC-20) to this address</li>
            <li>• Double-check the address before sending</li>
            <li>• Minimum transfer: 100 USDT</li>
            <li>• Wrong network will result in loss</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Clock className="h-5 w-5 text-red-500" />
              <span className={`font-bold text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <h3 className="font-semibold text-lg">USDT Wallet Address</h3>
            <p className="text-xs text-muted-foreground">TRC-20 Network Only</p>
            
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm font-mono break-all text-center">
                {walletAddress}
              </p>
            </div>

            <Button
              onClick={copyAddress}
              className="w-full flex items-center justify-center space-x-2"
              variant={copied ? "secondary" : "default"}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Address</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h4 className="font-semibold text-sm">Next Steps:</h4>
          <ol className="text-xs text-muted-foreground space-y-2">
            <li>1. Copy the wallet address above</li>
            <li>2. Open your crypto app/wallet</li>
            <li>3. Send USDT (TRC-20) to the copied address</li>
            <li>4. Your balance will be updated within 10-30 minutes</li>
          </ol>
        </Card>

        <Card className="p-4 space-y-4">
          <h4 className="font-semibold text-sm">Submit Transaction ID</h4>
          <div className="space-y-3">
            <Input
              placeholder="Enter your transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={!transactionId.trim() || timeLeft === 0}
              className="w-full"
              variant="neon"
            >
              Submit Transaction
            </Button>
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate("/support-guide")}
          >
            Need Help?
          </Button>
          <Button 
            className="flex-1"
            onClick={() => navigate("/wallet")}
          >
            Check Balance
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TransferPayment;