import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const BankGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">How to Add Bank Account</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-center mb-4">🏦 Adding Your Bank Account</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Step 1: Navigate to Profile</h3>
              <p className="text-sm text-blue-700">Go to your profile section from the bottom navigation menu.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🏦 Step 2: Add Bank Account</h3>
              <p className="text-sm text-green-700">Tap on "Add Bank Account" option in your profile menu.</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">✍️ Step 3: Fill Details</h3>
              <p className="text-sm text-purple-700">Enter your bank account number, IFSC code, and account holder name carefully.</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">✅ Step 4: Verify & Save</h3>
              <p className="text-sm text-orange-700">Double-check all information and save. Your bank account will be verified within 24 hours.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ensure bank account is in your name only</li>
              <li>• IFSC code must be correct</li>
              <li>• Account should be active and operational</li>
              <li>• Keep bank details handy for quick entry</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default BankGuide;