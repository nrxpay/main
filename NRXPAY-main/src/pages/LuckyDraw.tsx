import { useState } from "react";
import { ArrowLeft, Star, Gift, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserBalance } from "@/hooks/useUserBalance";

const LuckyDraw = () => {
  const navigate = useNavigate();
  const { balance, updateBalance } = useUserBalance();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [result, setResult] = useState<{ won: boolean; prize?: number } | null>(null);

  const amounts = [50, 100, 500, 1000, 2000, 5000];
  const cards = Array.from({ length: 6 }, (_, i) => i);

  const startDraw = async () => {
    if (!selectedAmount) return;
    
    if (balance.current_balance < selectedAmount) {
      toast.error("Insufficient balance");
      return;
    }
    
    // Deduct bet amount
    const deductSuccess = await updateBalance(selectedAmount, 'lose');
    if (!deductSuccess) return;
    
    setIsDrawing(true);
    setShowCards(true);
  };

  const selectCard = async (cardIndex: number) => {
    if (selectedCard !== null) return;
    
    setSelectedCard(cardIndex);
    
    setTimeout(async () => {
      const won = Math.random() > 0.6; // 40% chance to win
      const prize = won ? selectedAmount! * (Math.random() * 4 + 1) : 0; // 1x to 5x multiplier
      
      setResult({ won, prize: Math.round(prize) });
      setIsDrawing(false);
      
      if (won) {
        await updateBalance(Math.round(prize), 'win');
        toast.success(`Congratulations! You won ₹${Math.round(prize)}!`);
      } else {
        toast.error("Better luck next time!");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Mystery Card Draw</h1>
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
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎰 Mystery Treasure Hunt
          </h2>
          <p className="text-lg text-muted-foreground font-medium">Uncover hidden treasures behind magical cards!</p>
        </div>

        {/* Card Display */}
        <Card className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-200 shadow-2xl">
          <div className="relative">
            {/* Background magic effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-xl blur-xl"></div>
            
            <div className="relative h-56 rounded-xl flex items-center justify-center overflow-hidden">
              {showCards ? (
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm p-4">
                  {cards.map((card) => (
                    <div
                      key={card}
                      onClick={() => selectCard(card)}
                      className={`relative aspect-[3/4] cursor-pointer transition-all duration-500 transform ${
                        selectedCard === card 
                          ? 'scale-110 rotate-12 z-20' 
                          : selectedCard !== null && selectedCard !== card 
                            ? 'opacity-30 scale-90' 
                            : 'hover:scale-105 hover:-rotate-2'
                      }`}
                    >
                      {/* Card back design */}
                      <div className={`absolute inset-0 rounded-xl border-3 shadow-xl ${
                        selectedCard === card 
                          ? 'border-yellow-400 bg-gradient-to-br from-yellow-300 to-orange-400' 
                          : 'border-purple-300 bg-gradient-to-br from-purple-400 to-pink-500'
                      }`}>
                        {/* Card pattern */}
                         <div className="absolute inset-2 rounded-lg border-2 border-white/30">
                          <div className="w-full h-full flex items-center justify-center">
                            {selectedCard === card && result ? (
                              <div className="text-center animate-pulse">
                                <div className={`text-2xl font-bold mb-1 ${result.won ? 'text-green-200' : 'text-red-200'}`}>
                                  {result.won ? '🏆' : '💔'}
                                </div>
                                <div className={`text-xs font-bold ${result.won ? 'text-green-200' : 'text-red-200'}`}>
                                  {result.won ? 'WIN!' : 'LOSS'}
                                </div>
                              </div>
                            ) : selectedCard === card ? (
                              <div className="text-center animate-pulse">
                                <Sparkles className="w-8 h-8 text-white animate-spin mx-auto mb-1" />
                                <div className="text-xs font-bold text-white">REVEALING</div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Star className="w-6 h-6 text-white/80 mx-auto mb-1" />
                                <div className="w-4 h-4 bg-white/20 rounded-full mx-auto"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Glowing effect for selected card */}
                        {selectedCard === card && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur opacity-60 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center animate-bounce">
                      <Star className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                      <Sparkles className="w-4 h-4 text-yellow-800" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700 mb-2">🃏 Enchanted Cards</p>
                    <p className="text-purple-600 font-medium">Six magical cards await your choice...</p>
                    <p className="text-sm text-purple-500 mt-2">✨ Each card holds a different fortune ✨</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-2">💰 Choose Your Stake</h3>
            <p className="text-sm text-blue-600">Higher stakes, bigger rewards!</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {amounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 transform ${
                  selectedAmount === amount
                    ? "border-yellow-400 bg-gradient-to-br from-yellow-300 to-orange-300 text-orange-800 scale-105 shadow-lg"
                    : amount > balance.current_balance
                      ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-50"
                      : "border-blue-200 bg-white hover:border-blue-400 hover:scale-102 hover:shadow-md"
                }`}
                disabled={amount > balance.current_balance}
              >
                {selectedAmount === amount && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <div className="font-bold text-lg">₹{amount}</div>
                <div className="text-xs opacity-75">Bet Amount</div>
              </button>
            ))}
          </div>
          
          <Button
            onClick={startDraw}
            disabled={isDrawing || !selectedAmount || showCards || (selectedAmount && selectedAmount > balance.current_balance)}
            className="w-full h-14 text-lg font-bold"
            variant="neon"
          >
            {showCards ? (
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 animate-spin" />
                <span>🎯 Pick Your Lucky Card Above</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6" />
                <span>🎭 Reveal the Magic Cards</span>
              </div>
            )}
          </Button>
        </Card>

        {result && (
          <Card className={`p-8 relative overflow-hidden ${
            result.won 
              ? 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 border-2 border-green-300' 
              : 'bg-gradient-to-br from-red-100 via-rose-50 to-pink-50 border-2 border-red-300'
          }`}>
            {/* Background animation */}
            <div className={`absolute inset-0 opacity-20 ${
              result.won ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-red-400 to-rose-400'
            } animate-pulse`}></div>
            
            <div className="relative text-center space-y-6">
              <div className="text-6xl animate-bounce">
                {result.won ? '🎊' : '💔'}
              </div>
              
              <div className={`p-4 rounded-xl ${
                result.won ? 'bg-green-200/50' : 'bg-red-200/50'
              }`}>
                <h3 className={`font-bold text-2xl mb-2 ${
                  result.won ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.won ? '🏆 JACKPOT WINNER! 🏆' : '🎯 So Close! Try Again!'}
                </h3>
                
                {result.won ? (
                  <div className="space-y-3">
                    <p className="text-green-700 font-medium">
                      🎉 The magic worked in your favor! 🎉
                    </p>
                    <div className="flex items-center justify-center space-x-3 bg-yellow-200 rounded-lg p-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">₹</span>
                      </div>
                      <span className="text-3xl font-bold text-yellow-800">₹{result.prize}</span>
                      <Sparkles className="w-6 h-6 text-yellow-600 animate-spin" />
                    </div>
                  </div>
                ) : (
                  <p className="text-red-700 font-medium">
                    🍀 Your lucky card is waiting in the next round! 🍀
                  </p>
                )}
              </div>
              
              <Button
                onClick={() => {
                  setResult(null);
                  setSelectedAmount(null);
                  setShowCards(false);
                  setSelectedCard(null);
                }}
                className={`text-lg font-bold px-8 py-3 ${
                  result.won 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                } text-white`}
              >
                {result.won ? '🎮 Play Again & Win More!' : '🔄 Try Your Luck Again!'}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LuckyDraw;