import { useState } from "react";
import { ArrowLeft, RotateCw, Star, Trophy, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserBalance } from "@/hooks/useUserBalance";

const SpinWheel = () => {
  const navigate = useNavigate();
  const { balance, updateBalance } = useUserBalance();
  const [amount, setAmount] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ won: boolean; multiplier?: number; prize?: number } | null>(null);

  const prizes = [
    { label: "0.5x", multiplier: 0.5, color: "#ef4444", bgColor: "#fef2f2" },
    { label: "1.5x", multiplier: 1.5, color: "#22c55e", bgColor: "#f0fdf4" },
    { label: "2x", multiplier: 2, color: "#3b82f6", bgColor: "#eff6ff" },
    { label: "0x", multiplier: 0, color: "#6b7280", bgColor: "#f9fafb" },
    { label: "3x", multiplier: 3, color: "#8b5cf6", bgColor: "#faf5ff" },
    { label: "1x", multiplier: 1, color: "#eab308", bgColor: "#fefce8" },
    { label: "5x", multiplier: 5, color: "#f97316", bgColor: "#fff7ed" },
    { label: "2.5x", multiplier: 2.5, color: "#ec4899", bgColor: "#fdf2f8" },
    { label: "4x", multiplier: 4, color: "#06b6d4", bgColor: "#f0fdfa" },
  ];

  const spinWheel = async () => {
    const betAmount = parseInt(amount);
    if (!betAmount || betAmount < 50) {
      toast.error("Minimum bet is ₹50");
      return;
    }

    if (balance.current_balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    // Deduct bet amount
    const deductSuccess = await updateBalance(betAmount, 'lose');
    if (!deductSuccess) return;

    setIsSpinning(true);
    
    setTimeout(async () => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      const prize = betAmount * randomPrize.multiplier;
      
      setResult({ 
        won: randomPrize.multiplier > 1, 
        multiplier: randomPrize.multiplier,
        prize: Math.round(prize) 
      });
      setIsSpinning(false);
      
      if (randomPrize.multiplier > 1) {
        await updateBalance(Math.round(prize) - betAmount, 'win');
        toast.success(`You won ${randomPrize.multiplier}x! Prize: ₹${Math.round(prize)}`);
      } else if (randomPrize.multiplier === 1) {
        await updateBalance(betAmount, 'win');
        toast.info("No loss, no gain!");
      } else {
        toast.error("Better luck next time!");
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Spin Wheel</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6 animate-slide-up">
        {/* Balance Display */}
        <Card className="p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Balance:</span>
            </div>
            <span className="text-purple-600 font-bold text-lg">₹{balance.current_balance}</span>
          </div>
        </Card>

        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
            <RotateCw className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold">Spin & Win</h2>
          <p className="text-muted-foreground">Spin the wheel of fortune!</p>
        </div>

        {/* Wheel Display */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="relative w-72 h-72 mx-auto">
            {/* Wheel container */}
            <div className={`relative w-full h-full rounded-full border-4 border-golden-400 shadow-2xl ${isSpinning ? 'animate-spin' : ''} transition-transform duration-1000`} style={{ 
              animationDuration: isSpinning ? '3s' : '0s',
              animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>
              {/* Wheel segments */}
              <svg className="w-full h-full" viewBox="0 0 400 400">
                {prizes.map((prize, index) => {
                  const angle = (360 / prizes.length) * index;
                  const nextAngle = (360 / prizes.length) * (index + 1);
                  const midAngle = (angle + nextAngle) / 2;
                  const textRadius = 120;
                  const textX = 200 + textRadius * Math.cos((midAngle - 90) * Math.PI / 180);
                  const textY = 200 + textRadius * Math.sin((midAngle - 90) * Math.PI / 180);
                  
                  return (
                    <g key={index}>
                      <path
                        d={`M 200 200 L ${200 + 180 * Math.cos((angle - 90) * Math.PI / 180)} ${200 + 180 * Math.sin((angle - 90) * Math.PI / 180)} A 180 180 0 0 1 ${200 + 180 * Math.cos((nextAngle - 90) * Math.PI / 180)} ${200 + 180 * Math.sin((nextAngle - 90) * Math.PI / 180)} Z`}
                        fill={prize.bgColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="hover:brightness-110 transition-all duration-200"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-lg font-bold pointer-events-none"
                        fill={prize.color}
                        transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                      >
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <RotateCw className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Wheel needle pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
              <div className="relative">
                {/* Needle */}
                <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-full shadow-lg"></div>
                {/* Needle tip */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-600"></div>
                {/* Needle base */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-center">Place Your Bet</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bet Amount (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount (min 50)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
                min="50"
              />
            </div>
            
            <Button
              onClick={spinWheel}
              disabled={isSpinning || !amount || parseInt(amount) < 50 || parseInt(amount) > balance.current_balance}
              className="w-full h-12"
              variant="neon"
            >
              {isSpinning ? (
                <div className="flex items-center space-x-2">
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Spinning...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <RotateCw className="w-5 h-5" />
                  <span>Spin Now</span>
                </div>
              )}
            </Button>
          </div>
        </Card>

        {result && (
          <Card className={`p-6 ${result.won ? 'bg-green-50 border-green-200' : result.multiplier === 1 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-center space-y-3">
              <div className="text-4xl">
                {result.won ? '🎉' : result.multiplier === 1 ? '😐' : '😔'}
              </div>
              <h3 className={`font-bold text-lg ${result.won ? 'text-green-700' : result.multiplier === 1 ? 'text-yellow-700' : 'text-red-700'}`}>
                {result.won ? 'Winner!' : result.multiplier === 1 ? 'Break Even!' : 'Try Again!'}
              </h3>
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="text-xl font-bold">{result.multiplier}x = ₹{result.prize}</span>
              </div>
              <Button
                onClick={() => {
                  setResult(null);
                  setAmount("");
                }}
                variant="outline"
                className="mt-4"
              >
                Spin Again
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SpinWheel;