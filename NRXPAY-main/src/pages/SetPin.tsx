import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SetPin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState(1); // 1: set pin, 2: confirm pin
  const [loading, setLoading] = useState(false);

  // Simple hash function for PIN (in production, use proper encryption)
  const hashPin = (pinValue: string) => {
    return btoa(pinValue);
  };

  const savePinToDatabase = async (pinValue: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    setLoading(true);
    try {
      const hashedPin = hashPin(pinValue);
      
      // Check if user already has a PIN
      const { data: existingPin } = await supabase
        .from('pins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingPin) {
        // Update existing PIN
        const { error } = await supabase
          .from('pins')
          .update({
            pin_hash: hashedPin,
            email: user.email || '',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new PIN
        const { error } = await supabase
          .from('pins')
          .insert({
            user_id: user.id,
            email: user.email || '',
            pin_hash: hashedPin
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error saving PIN:', error);
      toast.error("Failed to save PIN. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (step === 1) {
      if (pin.length < 4) {
        setPin(prev => prev + digit);
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + digit);
      }
    }
  };

  const handleDelete = () => {
    if (step === 1) {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleNext = async () => {
    if (step === 1 && pin.length === 4) {
      setStep(2);
    } else if (step === 2 && confirmPin.length === 4) {
      if (pin === confirmPin) {
        const success = await savePinToDatabase(pin);
        if (success) {
          toast.success("PIN set successfully!");
          navigate("/profile");
        }
      } else {
        toast.error("PINs do not match. Please try again.");
        setConfirmPin("");
      }
    }
  };

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 max-w-md mx-auto">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="mr-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Set Security PIN</h1>
        </div>
      </header>
      
      <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
        <div className="w-full max-w-sm animate-scale-in">
          <Card className="p-8 bg-black/30 backdrop-blur-md border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <KeyRound className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {step === 1 ? "Set New PIN" : "Confirm PIN"}
              </h2>
              <p className="text-gray-300 text-sm">
                {step === 1 
                  ? "Choose a 4-digit security PIN"
                  : "Re-enter your PIN to confirm"
                }
              </p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center space-x-3 mb-8">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                    currentPin.length > index
                      ? "border-green-400 bg-green-400/20 shadow-lg shadow-green-400/25"
                      : "border-gray-600 bg-gray-800/50"
                  }`}
                >
                  {currentPin.length > index && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-scale-in" />
                  )}
                </div>
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="ghost"
                  onClick={() => handlePinInput(num.toString())}
                  className="h-14 text-xl font-semibold text-white hover:bg-white/20 border border-gray-600 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  {num}
                </Button>
              ))}
              <div />
              <Button
                variant="ghost"
                onClick={() => handlePinInput("0")}
                className="h-14 text-xl font-semibold text-white hover:bg-white/20 border border-gray-600 rounded-xl transition-all duration-200 hover:scale-105"
              >
                0
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="h-14 text-white hover:bg-red-500/20 border border-gray-600 rounded-xl transition-all duration-200 hover:scale-105"
              >
                ←
              </Button>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleNext}
                disabled={currentPin.length !== 4 || loading}
                className="w-full h-12 bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-green-400/25 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Saving..." : step === 1 ? "Continue" : "Set PIN"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/forgot-pin")}
                className="w-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                Forgot Security PIN?
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SetPin;