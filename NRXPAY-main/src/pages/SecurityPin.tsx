import { useState, useEffect } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SecurityPin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pin, setPin] = useState("");
  const [targetRoute, setTargetRoute] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPinSet, setHasPinSet] = useState<boolean | null>(null);
  const [userNumber, setUserNumber] = useState<string>("000000");

  // Fetch user number
  useEffect(() => {
    const fetchUserNumber = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_data')
            .select('user_number')
            .eq('user_id', user.id)
            .single();
          
          if (data && !error) {
            setUserNumber(data.user_number);
          }
        } catch (error) {
          console.error('Failed to fetch user number:', error);
        }
      }
    };
    
    fetchUserNumber();
  }, [user?.id]);

  // Simple hash function for PIN (matches the one in SetPin)
  const hashPin = (pinValue: string) => {
    return btoa(pinValue);
  };

  const verifyPinInDatabase = async (pinValue: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    setLoading(true);
    try {
      // Check if user is suspended (username starts with [SUSPENDED])
      const { data: userData } = await supabase
        .from('user_data')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (userData?.username?.startsWith('[SUSPENDED]')) {
        toast.error("Your account has been suspended. Please contact support.");
        return false;
      }

      const hashedPin = hashPin(pinValue);
      
      const { data: pinRecord, error } = await supabase
        .from('pins')
        .select('pin_hash, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("No PIN set. Please set up your PIN first.");
          navigate("/set-pin");
          return false;
        }
        throw error;
      }

      if (pinRecord && pinRecord.pin_hash === hashedPin) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast.error("Failed to verify PIN. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has PIN set and get target route
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTargetRoute(params.get("target") || "/wallet");
    
    const checkPinExists = async () => {
      if (!user) return;
      
      try {
        const { data: pinRecord, error } = await supabase
          .from('pins')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();
          
        setHasPinSet(!!pinRecord);
      } catch (error) {
        setHasPinSet(false);
      }
    };
    
    checkPinExists();
  }, [user]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length === 4) {
      const isValid = await verifyPinInDatabase(pin);
      
      if (isValid) {
        toast.success("PIN verified successfully!");
        if (targetRoute === "change-bank") {
          navigate("/change-bank");
        } else {
          navigate(targetRoute);
        }
      } else {
        toast.error("Invalid PIN. Please try again.");
        setPin("");
      }
    }
  };

  const [showForgetDialog, setShowForgetDialog] = useState(false);

  const openTelegramSupport = () => {
    setShowForgetDialog(true);
  };

  // Show PIN already set message for users coming from profile or if explicitly checking
  if (hasPinSet === true && (targetRoute === "/profile" || targetRoute === "/set-pin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 max-w-md mx-auto">
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">Security PIN</h1>
          </div>
        </header>
        
        <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
          <div className="w-full max-w-sm animate-scale-in">
            <Card className="p-8 bg-black/30 backdrop-blur-md border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <KeyRound className="h-8 w-8 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">PIN ALREADY ADDED</h2>
                <p className="text-gray-300 text-sm">PIN ALREADY ADDED FOR THE USER</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={openTelegramSupport}
                  variant="outline"
                  className="w-full h-12 text-blue-400 border-blue-400/50 hover:bg-blue-400/10"
                >
                  Forgot pin?
                </Button>
                
                <p className="text-center text-gray-400 text-xs">
                  Contact customer support to reset your PIN
                </p>
              </div>
            </Card>

            {/* Forget PIN Dialog */}
            {showForgetDialog && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="p-6 bg-black/90 backdrop-blur-md border-white/20 shadow-2xl max-w-sm w-full">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Contact Customer Support</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      To reset your Security PIN, please contact our customer support team on Telegram.
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-400/30">
                      <h4 className="text-blue-300 font-semibold mb-2">Step 1: Open Telegram</h4>
                      <p className="text-gray-300 text-sm">Search for @NRXPAYSUPPORT in Telegram</p>
                    </div>

                    <div className="bg-green-950/50 p-4 rounded-lg border border-green-400/30">
                      <h4 className="text-green-300 font-semibold mb-2">Step 2: Send Message</h4>
                      <p className="text-gray-300 text-sm mb-2">Send this message:</p>
                      <div className="bg-gray-800 p-3 rounded border-l-4 border-yellow-400">
                        <p className="text-yellow-200 text-sm font-mono">
                          "Hi, I need to reset my Security PIN. My User Number is: {userNumber}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-400/30">
                      <h4 className="text-purple-300 font-semibold mb-2">Step 3: Wait for Response</h4>
                      <p className="text-gray-300 text-sm">Our support team will assist you with PIN reset within 24 hours.</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowForgetDialog(false)}
                      variant="outline"
                      className="flex-1 text-white border-white/20 hover:bg-white/10"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => window.open('https://t.me/NRXPAYSUPPORT', '_blank')}
                      className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                    >
                      Open Telegram
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (hasPinSet === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 max-w-md mx-auto flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 max-w-md mx-auto">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Security PIN</h1>
        </div>
      </header>
      
      <main className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
        <div className="w-full max-w-sm animate-scale-in">
          <Card className="p-8 bg-black/30 backdrop-blur-md border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <KeyRound className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enter Security PIN</h2>
              <p className="text-gray-300 text-sm">Enter your 4-digit security PIN to continue</p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center space-x-3 mb-8">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                    pin.length > index
                      ? "border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/25"
                      : "border-gray-600 bg-gray-800/50"
                  }`}
                >
                  {pin.length > index && (
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-scale-in" />
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

            <Button
              onClick={handleSubmit}
              disabled={pin.length !== 4 || loading}
              className="w-full h-12 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 disabled:opacity-50 mb-3"
            >
              {loading ? "Verifying..." : "Verify PIN"}
            </Button>

            {/* Forgot PIN option */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={openTelegramSupport}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Forgot pin?
              </Button>
              <p className="text-gray-400 text-xs mt-1">Contact customer support</p>
            </div>
          </Card>

          {/* Forget PIN Dialog for regular PIN entry */}
          {showForgetDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="p-6 bg-black/90 backdrop-blur-md border-white/20 shadow-2xl max-w-sm w-full">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Contact Customer Support</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    To reset your Security PIN, please contact our customer support team on Telegram.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-400/30">
                    <h4 className="text-blue-300 font-semibold mb-2">Step 1: Open Telegram</h4>
                    <p className="text-gray-300 text-sm">Search for @NRXPAYSUPPORT in Telegram</p>
                  </div>

                  <div className="bg-green-950/50 p-4 rounded-lg border border-green-400/30">
                    <h4 className="text-green-300 font-semibold mb-2">Step 2: Send Message</h4>
                    <p className="text-gray-300 text-sm mb-2">Send this message:</p>
                    <div className="bg-gray-800 p-3 rounded border-l-4 border-yellow-400">
                      <p className="text-yellow-200 text-sm font-mono">
                        "Hi, I need to reset my Security PIN. My User Number is: {userNumber}"
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-950/50 p-4 rounded-lg border border-purple-400/30">
                    <h4 className="text-purple-300 font-semibold mb-2">Step 3: Wait for Response</h4>
                    <p className="text-gray-300 text-sm">Our support team will assist you with PIN reset within 24 hours.</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowForgetDialog(false)}
                    variant="outline"
                    className="flex-1 text-white border-white/20 hover:bg-white/10"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => window.open('https://t.me/NRXPAYSUPPORT', '_blank')}
                    className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                  >
                    Open Telegram
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SecurityPin;