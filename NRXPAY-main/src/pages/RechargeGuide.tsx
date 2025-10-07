import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const RechargeGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigate("/recharge")}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">How to Buy Quota</h1>
        <div className="w-9"></div>
      </div>

      <main className="p-4 space-y-6">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold neon-text">How to Buy Quota</h2>
            <p className="text-muted-foreground mt-2">Complete step by step guide</p>
          </div>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold text-blue-600">Select Amount & Proceed</h3>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Go back to Recharge page
                </p>
                <p className="text-sm text-muted-foreground">
                  • Select your desired USDT amount (minimum $100)
                </p>
                <p className="text-sm text-muted-foreground">
                  • Click "Proceed to Deposit" button
                </p>
                <p className="text-sm text-muted-foreground">
                  • Copy the Transaction ID from the payment page
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold text-green-600">Go to Assets in Binance</h3>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Open your Binance app
                </p>
                <p className="text-sm text-muted-foreground">
                  • Navigate to "Assets" or "Wallet" section
                </p>
                <p className="text-sm text-muted-foreground">
                  • Look for your USDT balance
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold text-orange-600">Select On-Chain Withdraw</h3>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-sm text-muted-foreground">
                  • Click on USDT to open options
                </p>
                <p className="text-sm text-muted-foreground">
                  • Select "Withdraw" option
                </p>
                <p className="text-sm text-muted-foreground">
                  • Choose "On-Chain Withdraw" (not internal transfer)
                </p>
                
                {/* Withdraw Method Selection Example */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Example: Select Withdraw Method Screen</p>
                  <img 
                    src="/lovable-uploads/a1df40a8-8951-466a-9a95-b4f20e2ffecb.png" 
                    alt="Binance withdraw method selection showing On-Chain Withdraw option"
                    className="w-full rounded-lg border"
                  />
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h3 className="font-semibold text-purple-600">Select USDT as Coin</h3>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-sm text-muted-foreground">
                  • If USDT is not visible, use the search function
                </p>
                <p className="text-sm text-muted-foreground">
                  • Type "USDT" in the search bar
                </p>
                <p className="text-sm text-muted-foreground">
                  • Select "USDT" from the search results
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <h3 className="font-semibold text-red-600">Complete the Withdrawal</h3>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-sm text-muted-foreground">
                  • Paste the copied Transaction ID in the address field
                </p>
                <p className="text-sm text-muted-foreground">
                  • <strong className="text-red-600">IMPORTANT:</strong> Select 'TRC20' Network only
                </p>
                <p className="text-sm text-muted-foreground">
                  • Enter the amount you want to withdraw
                </p>
                <p className="text-sm text-muted-foreground">
                  • Click the "Withdraw" button at the bottom
                </p>
                <p className="text-sm text-muted-foreground">
                  • Confirm the transaction when prompted
                </p>
                
                {/* USDT Send Example */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Example: USDT Send Screen</p>
                  <img 
                    src="/lovable-uploads/d12d7082-cd0d-4146-bfe1-448ad9996ca8.png" 
                    alt="USDT Send Example showing TRC20 network selection"
                    className="w-full rounded-lg border"
                  />
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Important Notes:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Always double-check the wallet address before sending</li>
                <li>• Only use TRC20 network for USDT transfers</li>
                <li>• Minimum withdrawal amount is $100</li>
                <li>• Processing time: 10-30 minutes after confirmation</li>
                <li>• Wrong network selection will result in loss of funds</li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">💬 Need Help?</h4>
              <p className="text-sm text-blue-700">
                If you face any issues during the process, contact our support team on Telegram: 
                <span className="font-semibold"> @NRXPAYSUPPORT</span>
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default RechargeGuide;