import { useState } from "react";
import { ArrowLeft, Coins, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserBalance } from "@/hooks/useUserBalance";

const CoinFlip = () => {
  const navigate = useNavigate();
  const { balance, updateBalance } = useUserBalance();
  const [amount, setAmount] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [won, setWon] = useState(false);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");

  const handleFlip = async () => {
    const betAmount = parseInt(amount);
    if (betAmount < 50) {
      toast.error("Minimum bet amount is ₹50");
      return;
    }

    if (balance.current_balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    // Deduct bet amount
    const deductSuccess = await updateBalance(betAmount, 'lose');
    if (!deductSuccess) return;

    setIsFlipping(true);
    setShowResult(false);

    // Simulate coin flip after 3 seconds
    setTimeout(async () => {
      const result = Math.random() > 0.5 ? "heads" : "tails";
      const winResult = result === choice;
      setWon(winResult);
      setIsFlipping(false);
      setShowResult(true);
      
      if (winResult) {
        await updateBalance(betAmount, 'win');
        toast.success(`🎉 Congratulations! You won ₹${betAmount * 2}!`);
      } else {
        toast.error(`😢 Better luck next time! You lost ₹${betAmount}`);
      }
    }, 3000);
  };

  const resetGame = () => {
    setShowResult(false);
    setAmount("");
    setChoice("heads");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 max-w-md mx-auto">
      <header className="bg-black/20 backdrop-blur-sm border-b border-yellow-400/20 sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="mr-2 text-yellow-100 hover:bg-yellow-400/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-yellow-100">Coin Flip Game</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6 animate-slide-up pb-20">
        {/* Balance Display */}
        <Card className="p-4 bg-black/30 backdrop-blur-md border-yellow-400/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-100 font-medium">Balance:</span>
            </div>
            <span className="text-yellow-400 font-bold text-lg">₹{balance.current_balance}</span>
          </div>
        </Card>

        {/* Game Header */}
        <Card className="p-6 bg-black/30 backdrop-blur-md border-yellow-400/20 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <Coins className="h-10 w-10 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-100 mb-2">Coin Flip Challenge</h2>
            <p className="text-yellow-200/80 text-sm">Double your money or lose it all!</p>
          </div>
        </Card>

        {/* Game Area */}
        <Card className="p-6 bg-black/30 backdrop-blur-md border-yellow-400/20 shadow-2xl">
          {!showResult && !isFlipping && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="amount" className="text-yellow-100 text-base font-semibold">
                  Bet Amount (₹)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Minimum ₹50"
                  min="50"
                  className="mt-2 bg-black/40 border-yellow-400/30 text-yellow-100 placeholder:text-yellow-300/50"
                />
                <p className="text-yellow-300/70 text-xs mt-1">Minimum bet: ₹50</p>
              </div>

              <div>
                <Label className="text-yellow-100 text-base font-semibold mb-3 block">
                  Choose Your Side
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={choice === "heads" ? "default" : "outline"}
                    onClick={() => setChoice("heads")}
                    className={`h-16 flex flex-col items-center space-y-1 ${
                      choice === "heads"
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-black/40 text-yellow-100 border-yellow-400/30 hover:bg-yellow-400/20"
                    }`}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm font-semibold">HEADS</span>
                  </Button>
                  <Button
                    variant={choice === "tails" ? "default" : "outline"}
                    onClick={() => setChoice("tails")}
                    className={`h-16 flex flex-col items-center space-y-1 ${
                      choice === "tails"
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-black/40 text-yellow-100 border-yellow-400/30 hover:bg-yellow-400/20"
                    }`}
                  >
                    <TrendingDown className="h-6 w-6" />
                    <span className="text-sm font-semibold">TAILS</span>
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleFlip}
                disabled={!amount || parseInt(amount) < 50 || parseInt(amount) > balance.current_balance}
                className="w-full h-14 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 disabled:opacity-50"
              >
                🎲 FLIP COIN
              </Button>
            </div>
          )}

          {/* Flipping Animation */}
          {isFlipping && (
            <div className="text-center py-12">
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl animate-spin">
                  <Coins className="h-16 w-16 text-black" />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto bg-yellow-400/30 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold text-yellow-100 mb-2">Flipping...</h3>
              <p className="text-yellow-200/80">Good luck! 🍀</p>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="text-center py-8">
              <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl ${
                won ? "bg-gradient-to-br from-green-400 to-emerald-500" : "bg-gradient-to-br from-red-400 to-pink-500"
              }`}>
                {won ? (
                  <TrendingUp className="h-16 w-16 text-white" />
                ) : (
                  <TrendingDown className="h-16 w-16 text-white" />
                )}
              </div>
              
              <h3 className={`text-3xl font-bold mb-4 ${won ? "text-green-400" : "text-red-400"}`}>
                {won ? "🎉 YOU WON!" : "😢 YOU LOST!"}
              </h3>
              
              <p className="text-yellow-100 text-lg mb-2">
                {won ? `You won ₹${parseInt(amount) * 2}!` : `You lost ₹${amount}`}
              </p>
              
              <p className="text-yellow-200/80 text-sm mb-6">
                The coin landed on {won ? choice : (choice === "heads" ? "tails" : "heads")}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={resetGame}
                  className="w-full h-12 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold rounded-xl"
                >
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="w-full h-12 bg-black/40 text-yellow-100 border-yellow-400/30 hover:bg-yellow-400/20"
                >
                  Back to Profile
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default CoinFlip;