import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, AlertTriangle, Copy, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CryptoExchangeHistory } from "@/components/CryptoExchangeHistory";

interface CryptoOption {
  type: string;
  symbol: string;
  icon: string;
  color: string;
  rate: number;
}

const CryptoExchangePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cryptoRates, setCryptoRates] = useState<CryptoOption[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [quantity, setQuantity] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [quantityError, setQuantityError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [transactionIdCopied, setTransactionIdCopied] = useState(false);

  useEffect(() => {
    fetchCryptoRates();
  }, []);

  const fetchCryptoRates = async () => {
    try {
      const { data, error } = await supabase
        .from("crypto_rates")
        .select("*")
        .eq("is_active", true)
        .order("crypto_type");

      if (error) throw error;

      const options: CryptoOption[] = data.map((rate) => ({
        type: rate.crypto_type,
        symbol: rate.crypto_symbol,
        icon: getCryptoIcon(rate.crypto_type),
        color: getCryptoColor(rate.crypto_type),
        rate: rate.rate_inr,
      }));

      setCryptoRates(options);
    } catch (error) {
      console.error("Error fetching rates:", error);
      toast.error("Failed to load crypto rates");
    }
  };

  const getCryptoIcon = (type: string) => {
    const icons: Record<string, string> = {
      bitcoin: "₿",
      ethereum: "Ξ",
      solana: "◎",
      litecoin: "Ł",
    };
    return icons[type] || "₿";
  };

  const getCryptoColor = (type: string) => {
    // Use Solana theme (purple-pink gradient) for all cryptos
    return "from-purple-400 to-pink-600";
  };

  const getMinQuantity = (type: string) => {
    const map: Record<string, number> = {
      bitcoin: 0.001,
      solana: 0.7,
      litecoin: 1,
      ethereum: 0.025,
    };
    return map[type] ?? 0;
  };

  const handleQuantityChange = (rawValue: string, type: string) => {
    // Allow clearing
    if (rawValue === "") {
      setQuantity("");
      setQuantityError("");
      return;
    }
    const parsed = parseFloat(rawValue);
    if (Number.isNaN(parsed)) {
      // Keep latest raw value attempts if browser allows; otherwise ignore
      setQuantity(rawValue);
      return;
    }
    const min = getMinQuantity(type);
    if (parsed < min) {
      setQuantityError(`Minimum is ${min} ${selectedCrypto?.symbol || ""}`);
    } else {
      setQuantityError("");
    }
    // Always reflect what the user typed; submission will enforce min
    setQuantity(rawValue);
  };

  const getProfitPercentage = (type: string) => {
    const map: Record<string, number> = {
      bitcoin: 35,
      ethereum: 35,
      litecoin: 40,
      solana: 45,
    };
    return map[type] ?? 50;
  };

  const totalAmount = selectedCrypto && quantity
    ? (parseFloat(quantity) * selectedCrypto.rate).toFixed(2)
    : "0.00";

  const copyAddress = () => {
    const address = getCryptoAddress(selectedCrypto?.type || "");
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTransactionId = () => {
    if (transactionId.trim()) {
      navigator.clipboard.writeText(transactionId);
      setTransactionIdCopied(true);
      toast.success("Transaction ID copied to clipboard!");
      setTimeout(() => setTransactionIdCopied(false), 2000);
    } else {
      toast.error("No transaction ID to copy");
    }
  };

  const pasteTransactionId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setTransactionId(text.trim());
        toast.success("Transaction ID pasted from clipboard!");
      } else {
        toast.error("No text found in clipboard");
      }
    } catch (error) {
      toast.error("Failed to paste from clipboard");
    }
  };

  const getCryptoAddress = (type: string) => {
    const addresses: Record<string, string> = {
      bitcoin: "15EcrkUsLH3UigiZfmFiVnh2NFuwdh5nQX",
      ethereum: "0x3c0de1582f8870af1b65c41cfdee45a113fb502e",
      solana: "ABTXB6utC7emXiHBywyoExJ7gmAZSFookG2W72upfSF7",
      litecoin: "LfSisJS3dt2e88EXbJqqbT3x5jBYBbthb4",
    };
    return addresses[type] || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedCrypto) {
      toast.error("Please select a crypto and log in");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const minQty = getMinQuantity(selectedCrypto.type);
    if (parseFloat(quantity) < minQty) {
      toast.error(`Minimum quantity for ${selectedCrypto.symbol} is ${minQty}`);
      return;
    }

    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }

    setLoading(true);

    try {
      // Get username
      const { data: userData } = await supabase
        .from("user_data")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      // Create transaction
      const { error } = await supabase.from("crypto_transactions").insert({
        user_id: user.id,
        username: userData?.username,
        crypto_type: selectedCrypto.type,
        crypto_symbol: selectedCrypto.symbol,
        quantity: parseFloat(quantity),
        rate_inr: selectedCrypto.rate,
        total_inr: parseFloat(totalAmount),
        transaction_id: transactionId,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Exchange request submitted successfully!");
      setQuantity("");
      setTransactionId("");
      setSelectedCrypto(null);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast.error(error.message || "Failed to submit exchange request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white text-black px-4 py-4 shadow-lg rounded-b-2xl">
        <div className="relative flex items-center gap-3">
          <div className="absolute -top-10 right-0 w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (selectedCrypto) {
                setSelectedCrypto(null);
              } else {
                navigate(-1);
              }
            }}
            className="text-black hover:bg-black/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">
              {selectedCrypto ? `Recharge ${selectedCrypto.type.charAt(0).toUpperCase()}${selectedCrypto.type.slice(1)}` : 'Exchange Crypto at Highest Rates'}
            </h1>
            <p className="text-xs opacity-90">
              {selectedCrypto ? selectedCrypto.symbol : ''}
            </p>
          </div>
          {/* Icon removed per request */}
        </div>
      </div>

      <main className="px-4 pt-0 pb-6 space-y-6">
        {/* Moving Disclaimer - fixed under header, no rounded corners */}
        <div className="sticky top-14 z-20 -mx-4 -mt-4 bg-red-50 border-y border-red-200 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap py-2 px-4 text-red-700 text-xs flex items-center">
            <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
            <span className="mr-8">
              Users are advised to recheck payment address and network before processing to payment
            </span>
          </div>
        </div>

        {/* Promotional Poster */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src="/crypto-poster.png.png" 
            alt="Exchange Crypto for Dark Market - Up to 50% Profit on NRX PAY"
            className="w-full h-auto object-cover rounded-2xl"
            onError={(e) => {
              // Fallback to text-based poster if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          {/* Fallback text-based poster */}
          <div className="hidden relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-600 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">EXCHANGE CRYPTO FOR</h2>
                <h1 className="text-4xl font-extrabold mb-2 text-yellow-300">DARK MARKET</h1>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-px bg-white/50 flex-1"></div>
                  <span className="text-sm font-medium">AT UPTO</span>
                  <div className="h-px bg-white/50 flex-1"></div>
                </div>
                <div className="text-6xl font-black text-yellow-300 mb-2">50%</div>
                <div className="text-xl font-bold text-yellow-300 mb-4">PROFIT</div>
                <div className="text-lg font-bold">ON NRX PAY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Crypto Selection */}
        {!selectedCrypto ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Cryptocurrency</h2>
            <div className="space-y-2">
              {cryptoRates.map((crypto) => (
                <Card
                  key={crypto.type}
                  className="p-3 bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedCrypto(crypto)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 capitalize">{crypto.type}</h3>
                      <p className="text-base font-bold text-gray-900">₹{crypto.rate.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      {getProfitPercentage(crypto.type)}% PROFIT
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Caution Banner (below the boxes) */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs shadow-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                <span className="font-semibold">Disclaimer</span> - Use only supported networks for each crypto otherwise funds may be lost. Contact support on Telegram for assistance.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Crypto Display */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  1 {selectedCrypto.symbol} = ₹{selectedCrypto.rate.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-semibold">
                Enter Quantity ({selectedCrypto.symbol})
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                min={getMinQuantity(selectedCrypto.type)}
                placeholder={`0.00000000 ${selectedCrypto.symbol}`}
                inputMode="decimal"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value, selectedCrypto.type)}
                className="h-12 text-lg"
                required
              />
              <div className="text-xs">
                {quantityError ? (
                  <p className="text-red-600">{quantityError}</p>
                ) : (
                  <p className="text-muted-foreground">Minimum: {getMinQuantity(selectedCrypto.type)} {selectedCrypto.symbol}</p>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <Card className="p-4 bg-blue-50 border-2 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Payment Information</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>Transcation address for {selectedCrypto.symbol} :</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-white rounded-lg font-mono text-xs break-all">
                    {getCryptoAddress(selectedCrypto.type)}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <span className="text-green-600 text-xs">Copied!</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Transaction ID Input */}
            <div className="space-y-2">
              <Label htmlFor="transactionId" className="text-base font-semibold">
                Transaction ID <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="transactionId"
                  type="text"
                  placeholder="Enter your transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-12 text-lg flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={pasteTransactionId}
                  className="flex-shrink-0 h-12 px-3"
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the transaction ID from your wallet after sending crypto
              </p>
            </div>

            {/* Total Amount Display */}
            <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">You will receive:</span>
                <span className="text-3xl font-bold text-green-600">
                  ₹{parseFloat(totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-14 text-lg font-bold bg-gradient-to-r ${selectedCrypto.color} hover:opacity-90 text-white shadow-xl`}
            >
              {loading ? "Processing..." : "Submit Exchange Request"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              * Your request will be processed within 24 hours after verification
            </p>
          </form>
        )}

        {/* Crypto Exchange History (visible below content) */}
        <CryptoExchangeHistory />
      </main>
    </div>
  );
};

export default CryptoExchangePage;
