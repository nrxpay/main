import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import Recharge from "./pages/Recharge";
import RechargeGuide from "./pages/RechargeGuide";
import EarningGuide from "./pages/EarningGuide";
import BankGuide from "./pages/BankGuide";
import PinGuide from "./pages/PinGuide";
import SupportGuide from "./pages/SupportGuide";
import AddBank from "./pages/AddBank";
import ChangeBank from "./pages/ChangeBank";
import SecurityPin from "./pages/SecurityPin";
import SetPin from "./pages/SetPin";
import CoinFlip from "./pages/CoinFlip";
import CorporateAccount from "./pages/CorporateAccount";
import CorporateForm from "./pages/CorporateForm";
import CurrentAccount from "./pages/CurrentAccount";
import CurrentAccountForm from "./pages/CurrentAccountForm";
import SavingsAccount from "./pages/SavingsAccount";
import SavingsAccountForm from "./pages/SavingsAccountForm";
import Notifications from "./pages/Notifications";
import TransferPayment from "./pages/TransferPayment";
import Ranking from "./pages/Ranking";
import Team from "./pages/Team";
import LuckyDraw from "./pages/LuckyDraw";
import SpinWheel from "./pages/SpinWheel";
import EditProfile from "./pages/EditProfile";
import BonusChecklist from "./pages/BonusChecklist";
import Admin from "./pages/Admin";
import CryptoExchange from "./pages/CryptoExchange";
import NotFound from "./pages/NotFound";
import SuspendedUserScreen from "./components/SuspendedUserScreen";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isSuspended, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isSuspended) {
    return <SuspendedUserScreen />;
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/team" element={<Team />} />
            <Route path="/lucky-draw" element={<LuckyDraw />} />
            <Route path="/spin-wheel" element={<SpinWheel />} />
            <Route path="/recharge" element={<Recharge />} />
            <Route path="/recharge-guide" element={<RechargeGuide />} />
            <Route path="/earning-guide" element={<EarningGuide />} />
            <Route path="/bank-guide" element={<BankGuide />} />
            <Route path="/pin-guide" element={<PinGuide />} />
            <Route path="/support-guide" element={<SupportGuide />} />
            <Route path="/add-bank" element={<AddBank />} />
            <Route path="/change-bank" element={<ChangeBank />} />
            <Route path="/security-pin" element={<SecurityPin />} />
            <Route path="/set-pin" element={<SetPin />} />
            <Route path="/coin-flip" element={<CoinFlip />} />
            <Route path="/corporate-account" element={<CorporateAccount />} />
            <Route path="/corporate-form" element={<CorporateForm />} />
            <Route path="/current-account" element={<CurrentAccount />} />
            <Route path="/current-account-form" element={<CurrentAccountForm />} />
            <Route path="/savings-account" element={<SavingsAccount />} />
            <Route path="/savings-account-form" element={<SavingsAccountForm />} />
            <Route path="/notifications" element={<Notifications />} />
        <Route path="/transfer-payment" element={<TransferPayment />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/bonus-checklist" element={<BonusChecklist />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/crypto-exchange" element={<CryptoExchange />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
