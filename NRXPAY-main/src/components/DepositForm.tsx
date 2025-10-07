import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, X, Clock, Copy, CheckCircle } from "lucide-react";
import qrCodeImage from "/lovable-uploads/a5da028a-b796-44e4-8d08-3d83acbc44a0.png";

interface DepositFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DepositForm({ amount, onSuccess, onCancel }: DepositFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [copied, setCopied] = useState(false);
  
  const transactionId = "TC8rpNd3nNeN4UaTrmX6Ysy5eLw9o3TQCj";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Time expired! Please start a new transaction.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId);
    setCopied(true);
    toast.success("Transaction ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setProofImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Please log in to submit a deposit");
      return;
    }

    console.log('Submit deposit clicked', { user: user.id, amount, transactionHash });
    
    setLoading(true);
    try {
      let proofImageUrl = null;

      // Upload image if provided (simplified - in real app you'd use Supabase storage)
      if (proofImage) {
        // For demo purposes, we'll just store the file name
        proofImageUrl = `proof_${Date.now()}_${proofImage.name}`;
      }

      console.log('Inserting deposit data:', {
        user_id: user.id,
        amount,
        currency: 'USDT',
        transaction_hash: transactionHash,
        proof_image_url: proofImageUrl,
        status: 'pending'
      });

      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount,
          currency: 'USDT',
          transaction_hash: transactionHash,
          proof_image_url: proofImageUrl,
          status: 'pending'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Deposit submitted successfully');
      toast.success("Deposit request submitted successfully!");
      onSuccess();
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error("Failed to submit deposit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none">
      <Card className="p-3 sm:p-4 mx-0">
        <h3 className="text-lg font-semibold mb-4">Complete Your Deposit</h3>
      
      <div className="space-y-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Amount:</strong> ${amount} USDT
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Send exactly this amount to complete your deposit.
          </p>
        </div>

        <Card className="p-4 space-y-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Clock className="h-5 w-5 text-red-500" />
              <span className={`font-bold text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <h4 className="font-semibold text-lg">Transaction ID</h4>
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm font-mono break-all text-center">
                {transactionId}
              </p>
            </div>

            <Button
              onClick={copyTransactionId}
              className="w-full flex items-center justify-center space-x-2"
              variant={copied ? "secondary" : "default"}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Transaction ID</span>
                </>
              )}
            </Button>

            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">QR Code</h4>
              <div className="flex justify-center">
                <img
                  src={qrCodeImage}
                  alt="QR Code for payment"
                  className="w-48 h-48 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="transaction-hash">Transaction Hash/ID</Label>
          <Input
            id="transaction-hash"
            value={transactionHash}
            onChange={(e) => setTransactionHash(e.target.value)}
            placeholder="Enter transaction hash"
            required
          />
        </div>

        <div>
          <Label htmlFor="proof-image">Upload Payment Proof</Label>
          <div className="mt-2">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Payment proof"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label htmlFor="proof-image" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                </div>
                <input
                  id="proof-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !transactionHash}
            className="flex-1"
          >
            {loading ? "Submitting..." : "Submit Deposit"}
          </Button>
        </div>
      </form>
    </Card>
    </div>
  );
}