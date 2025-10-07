import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const PinGuide = () => {
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
          <h1 className="text-lg font-semibold text-foreground">How to Change PIN</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-center mb-4">🔐 Changing Your Security PIN</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔑 Step 1: Access Security Settings</h3>
              <p className="text-sm text-blue-700">Go to Profile → Security PIN from the main menu.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🔒 Step 2: Enter Current PIN</h3>
              <p className="text-sm text-green-700">Input your existing 6-digit security PIN for verification.</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">🆕 Step 3: Set New PIN</h3>
              <p className="text-sm text-purple-700">Choose a new 6-digit PIN that's easy to remember but hard to guess.</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">✅ Step 4: Confirm Changes</h3>
              <p className="text-sm text-orange-700">Re-enter your new PIN to confirm and save the changes.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">🚨 Security Tips:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Don't use obvious numbers like 123456 or 000000</li>
              <li>• Avoid using your birth date or phone number</li>
              <li>• Never share your PIN with anyone</li>
              <li>• Change PIN regularly for better security</li>
              <li>• Use different PIN from your bank accounts</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PinGuide;