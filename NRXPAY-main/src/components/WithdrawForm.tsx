import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUSDTRates } from "@/hooks/useUSDTRates";
import { useFundRates } from "@/hooks/useFundRates";
import { useMinimumWithdrawal } from "@/hooks/useMinimumWithdrawal";
import { useUserBalance } from "@/hooks/useUserBalance";
import { toast } from "sonner";

interface BankAccount {
  user_id: string;
  account_number: string;
  account_holder_name: string;
  bank_name: string;
  branch_name: string;
  ifsc_code: string;
}

interface WithdrawFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawForm = ({ isOpen, onClose, onSuccess }: WithdrawFormProps) => {
  const { user } = useAuth();
  const { rates } = useUSDTRates();
  const { rates: fundRates, loading: fundRatesLoading } = useFundRates();
  const { config, isLoading: configLoading, getUserConfig } = useMinimumWithdrawal();
  const { balance } = useUserBalance();
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedFundType, setSelectedFundType] = useState<string>("gaming");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [userMinConfig, setUserMinConfig] = useState<any>(null);

  const usdtAmount = parseFloat(amount) || 0;
  const selectedFundRate = fundRates.find(rate => rate.fund_type === selectedFundType);
  const inrAmount = usdtAmount * (selectedFundRate?.rate || 0);
  const minimumWithdrawal = userMinConfig?.minimum_amount || config?.minimum_amount || 100;
  const isValidAmount = usdtAmount >= minimumWithdrawal && usdtAmount <= balance.usdt_balance;
  const hasInsufficientBalance = usdtAmount > balance.usdt_balance;

  useEffect(() => {
    const loadData = async () => {
      if (isOpen && user) {
        fetchBankAccounts();
        const userConfig = await getUserConfig(user.id);
        setUserMinConfig(userConfig);
      }
    };
    loadData();
  }, [isOpen, user]);

  const fetchBankAccounts = async () => {
    if (!user) return;
    
    setLoadingBanks(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Please log in to submit a withdrawal');
      return;
    }
    
    if (hasInsufficientBalance) {
      toast.error('Insufficient USDT balance');
      return;
    }

    if (!isValidAmount || !selectedBank) {
      toast.error('Please fill all fields with valid data');
      return;
    }

    setLoading(true);
    try {
      // Get the selected bank account details
      const bankIndex = parseInt(selectedBank.split('-')[1]);
      const selectedBankAccount = bankAccounts[bankIndex];
      
      console.log('Selected bank account:', selectedBankAccount);
      console.log('Bank account index:', bankIndex);
      console.log('Selected bank value:', selectedBank);
      
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount_usdt: usdtAmount,
          amount_inr: inrAmount,
          bank_account_id: user.id,
          usdt_rate: rates?.sell_rate || 102,
          fund_type: selectedFundType,
          fund_rate: selectedFundRate?.rate || 0,
          status: 'ongoing'
        });

      console.log('Withdrawal submission result:', { error });

      if (error) throw error;

      toast.success('Withdrawal request submitted successfully');
      setAmount("");
      setSelectedBank("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
            <DialogTitle className="text-lg">Withdraw Funds</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount in USDT"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={minimumWithdrawal}
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Minimum withdrawal: ${minimumWithdrawal} USDT | Available: ${balance.usdt_balance.toFixed(2)} USDT
            </p>
            {hasInsufficientBalance && amount && (
              <p className="text-xs text-red-500">Insufficient balance. You have ${balance.usdt_balance.toFixed(2)} USDT</p>
            )}
            {!hasInsufficientBalance && !isValidAmount && amount && (
              <p className="text-xs text-red-500">Minimum amount is ${minimumWithdrawal} USDT</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Select Fund Type</Label>
            {fundRatesLoading ? (
              <div className="text-sm text-muted-foreground">Loading fund types...</div>
            ) : (
              <RadioGroup value={selectedFundType} onValueChange={setSelectedFundType}>
                {fundRates.map((fundRate) => (
                  <div key={fundRate.fund_type} className="flex items-center space-x-2">
                    <RadioGroupItem value={fundRate.fund_type} id={fundRate.fund_type} />
                    <Label htmlFor={fundRate.fund_type} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{fundRate.fund_type} Fund</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          ₹{fundRate.rate}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank Account</Label>
            {loadingBanks ? (
              <div className="text-sm text-muted-foreground">Loading bank accounts...</div>
            ) : bankAccounts.length === 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-red-500 p-3 bg-red-50 border border-red-200 rounded-md">
                  No bank accounts found. Please add a bank account first.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    // Navigate to add bank page - you might need to implement this
                    window.location.href = '/add-bank';
                  }}
                  className="w-full"
                >
                  Add Bank Account First
                </Button>
              </div>
            ) : (
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose bank account" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {bankAccounts.map((bank, index) => (
                    <SelectItem key={`${bank.user_id}-${index}`} value={`${bank.user_id}-${index}`}>
                      {bank.bank_name} - {bank.account_number.slice(-4)} ({bank.account_holder_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {usdtAmount > 0 && selectedFundRate && (
            <Card className="p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>USDT Amount:</span>
                  <span className="font-medium">${usdtAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fund Type:</span>
                  <span className="font-medium capitalize">{selectedFundType} Fund</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate:</span>
                  <span className="font-medium">₹{selectedFundRate.rate}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>INR Amount:</span>
                  <span>₹{inrAmount.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isValidAmount || !selectedBank || bankAccounts.length === 0}
          >
            {loading ? "Processing..." : "Submit Withdrawal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawForm;