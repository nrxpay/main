import { useState, useEffect, useRef } from "react";
import { Play, ChevronRight, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import CautionBanner from "@/components/CautionBanner";
import AttentionPopup from "@/components/AttentionPopup";
import RechargeSpinWheel from "@/components/RechargeSpinWheel";
import { useUSDTRates } from "@/hooks/useUSDTRates";
import { useSpinWheelConfig } from "@/hooks/useSpinWheelConfig";

const Home = () => {
  const { rates } = useUSDTRates();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { config: spinConfig } = useSpinWheelConfig();
  const navigate = useNavigate();
  const [showAttentionPopup, setShowAttentionPopup] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [wheelPos, setWheelPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [wheelImgError, setWheelImgError] = useState(false);
  const spinIconSrc = (spinConfig as any)?.icon_url || "/lovable-uploads/spin-wheel.png";

  useEffect(() => {
    // Show popup only once per user session
    const hasSeenPopup = localStorage.getItem('hasSeenAttentionPopup');
    if (!hasSeenPopup) {
      setShowAttentionPopup(true);
    }
  }, []);

  // Initialize floating wheel position and keep within viewport on resize
  useEffect(() => {
    const initPosition = () => {
      const buttonSize = 56;
      const padding = 16;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = Math.max(rect.left + padding, rect.right - buttonSize - padding);
      const y = Math.max(64, Math.min(window.innerHeight - buttonSize - 140, window.innerHeight - buttonSize - 140));
      setWheelPos({ x, y });
    };
    initPosition();
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setWheelPos(prev => {
        const buttonSize = 56;
        const padding = 16;
        const minX = rect.left + padding;
        const maxX = rect.right - buttonSize - padding;
        const x = Math.max(minX, Math.min(maxX, prev.x));
        const y = Math.max(64, Math.min(window.innerHeight - buttonSize - 80, prev.y));
        return { x, y };
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, []);

  const startDrag = () => setIsDraggingWheel(true);
  const endDrag = () => setIsDraggingWheel(false);
  const onDragMove = (clientX: number, clientY: number) => {
    const buttonSize = 56;
    const padding = 16;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const minX = rect.left + padding;
    const maxX = rect.right - buttonSize - padding;
    const clampedX = Math.max(minX, Math.min(maxX, clientX - buttonSize / 2));
    const minY = 64;
    const maxY = window.innerHeight - buttonSize - 80;
    const clampedY = Math.max(minY, Math.min(maxY, clientY - buttonSize / 2));
    setWheelPos({ x: clampedX, y: clampedY });
  };

  const handleClosePopup = () => {
    setShowAttentionPopup(false);
    localStorage.setItem('hasSeenAttentionPopup', 'true');
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background pb-20 max-w-md mx-auto">
      <Header />
      
      <main className="px-4 py-4 space-y-4 animate-slide-up">
        {/* Poster Banner */}
        <div className="w-full">
          <img 
            src="/lovable-uploads/banner-106.png" 
            alt="NRX PAY Promotion Banner - 1 USDT = 106 rs ONLY ON NRX PAY" 
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Floating Spin Wheel CTA */}
        <div
          className="fixed z-50"
          style={{ left: `${wheelPos.x}px`, top: `${wheelPos.y}px` }}
        >
          <button
            aria-label="Open recharge spin wheel"
            onClick={() => setShowSpinWheel(true)}
            onMouseDown={startDrag}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onMouseMove={(e) => isDraggingWheel && onDragMove(e.clientX, e.clientY)}
            onTouchStart={startDrag}
            onTouchEnd={endDrag}
            onTouchCancel={endDrag}
            onTouchMove={(e) => {
              const t = e.touches[0];
              if (t) onDragMove(t.clientX, t.clientY);
            }}
            className="h-16 w-16 rounded-full bg-transparent text-black shadow-none ring-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {wheelImgError ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <path d="M12 2 L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 12 L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 22 L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 12 L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <img
                src={spinIconSrc}
                alt="Spin wheel"
                className="h-16 w-16 object-contain pointer-events-none drop-shadow-lg"
                onError={() => setWheelImgError(true)}
                draggable={false}
              />
            )}
          </button>
        </div>

        {/* Tutorial Section */}
        <Card 
          className="p-4 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg border-0"
          onClick={() => navigate("/earning-guide")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold mb-1 text-white">How to Earn Using NRX PAY</h3>
              <p className="text-xs text-white/90 font-medium">
                Discover earning opportunities & maximize your profits
              </p>
            </div>
            <Play className="h-6 w-6 text-white/90" />
          </div>
        </Card>

        {/* Crypto Exchange Section */}
        <Card 
          className="relative overflow-hidden p-4 bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-600 text-white cursor-pointer hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 rounded-2xl ring-1 ring-white/20"
          onClick={() => navigate("/crypto-exchange")}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold mb-1 text-white">Exchange Crypto at Highest Rates</h3>
              <p className="text-xs text-white/90 font-medium">
                BTC, Ethereum, Solana, Litecoin
              </p>
            </div>
            <Coins className="h-6 w-6 text-white/90" />
          </div>
        </Card>

        {/* Corporate Account Section */}
        <div className="text-sm text-muted-foreground font-medium mb-2">
          Upload Corporate Account
        </div>
        <Card 
          className="p-4 bg-gray-50 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/corporate-account")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm">📋</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Earn <span className="text-xl text-orange-600 font-extrabold">50K</span> every day!
              </h3>
            </div>
          </div>
        </Card>

        {/* Current Account Section */}
        <div className="text-sm text-muted-foreground font-medium mb-2">
          Upload Current Account
        </div>
        <Card 
          className="p-4 bg-gray-50 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/current-account")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-sm">🏦</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Earn <span className="text-xl text-blue-600 font-extrabold">30K</span> every day!
              </h3>
            </div>
          </div>
        </Card>

        {/* Recharge Button */}
        <Button
          onClick={() => navigate("/recharge")}
          className="w-full h-14 text-lg font-bold gradient-success text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <span className="mr-2 text-xl">💳</span>
          Recharge Now
        </Button>

        {/* Guide Section */}
        <div className="space-y-4 mt-8">
          <div className="text-left mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              📖 Guide
            </h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mt-1"></div>
          </div>
          
          {/* Guide Items */}
          <div className="space-y-2">
            <button 
              onClick={() => navigate("/bank-guide")}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">How to add a Bank account?</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
            
            <button 
              onClick={() => navigate("/pin-guide")}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">How to change PIN?</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
            
            <button 
              onClick={() => navigate("/support-guide")}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">How to contact Customer Support?</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          </div>
        </div>

        {/* Join Us & Copyright */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-base font-medium neon-text">Join us</p>
          <p className="text-xs text-muted-foreground">© NRX PAY 2025</p>
        </div>
      </main>

      <AttentionPopup 
        isOpen={showAttentionPopup}
        onClose={handleClosePopup}
        usdtRate={rates?.buy_rate || 99}
      />

      <RechargeSpinWheel 
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
      />

      <BottomNavigation />
    </div>
  );
};

export default Home;