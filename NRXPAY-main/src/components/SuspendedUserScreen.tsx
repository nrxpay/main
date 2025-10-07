import { AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const SuspendedUserScreen = () => {
  const { signOut } = useAuth();
  const openTelegramSupport = () => {
    const msg = encodeURIComponent("Mam, my account has been suspended due to violations. Please help me");
    window.open(`https://t.me/NRXPAYSUPPORT?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 max-w-md mx-auto flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl animate-pulse [animation-delay:400ms]"></div>
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-pink-500/10 blur-2xl animate-[ping_3s_linear_infinite]"></div>
      </div>
      {/* Logout button */}
      <button
        onClick={signOut}
        className="absolute top-4 right-4 inline-flex items-center gap-2 text-red-200 hover:text-white text-sm font-medium"
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>

      <Card className="p-8 bg-black/30 backdrop-blur-md border border-red-500/30 shadow-2xl relative overflow-hidden">
        {/* Shimmer border */}
        <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-transparent via-red-400/20 to-transparent animate-[pulse_2.5s_ease-in-out_infinite]"></div>
        <div className="text-center space-y-6 relative">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
            <AlertTriangle className="h-8 w-8 text-white animate-[bounce_2.2s_ease-in-out_infinite]" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-red-400 mb-2 animate-slide-up">Account Suspended</h2>
            <div className="text-gray-300 text-sm leading-relaxed space-y-2 text-left animate-slide-up">
              <p>Your account has been suspended due to violations:</p>
              <ul className="list-decimal list-inside space-y-1">
                <li>Violation of platform's fair use terms and conditions</li>
                <li>Abusing support team</li>
                <li>Exploiting bugs repeatedly to gain false advantage</li>
                <li>Multiple accounts creation prohibited</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={openTelegramSupport}
            className="w-full h-12 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-400/25 transition-all duration-300 animate-slide-up"
          >
            Contact Support on Telegram
          </Button>

          {/* Soft glow underline */}
          <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-red-400/60 to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>
        </div>
      </Card>
    </div>
  );
};

export default SuspendedUserScreen;