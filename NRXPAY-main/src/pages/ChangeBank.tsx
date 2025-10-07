import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ChangeBank = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    branchName: "",
  });

  const indianBanks = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank (PNB)",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "Indian Bank",
    "Central Bank of India",
    "IDBI Bank",
    "UCO Bank",
    "Bank of Maharashtra",
    "Indian Overseas Bank",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error("Account numbers do not match");
      return;
    }
    toast.success("Bank account updated successfully!");
    navigate("/wallet");
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/wallet")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Change Bank Account</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 animate-slide-up pb-20">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Select value={formData.bankName} onValueChange={(value) => handleChange("bankName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {indianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) => handleChange("accountHolderName", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                placeholder="Enter account number"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
              <Input
                id="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={(e) => handleChange("confirmAccountNumber", e.target.value)}
                placeholder="Re-enter account number"
                required
              />
            </div>

            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={formData.ifscCode}
                onChange={(e) => handleChange("ifscCode", e.target.value)}
                placeholder="Enter IFSC code"
                required
              />
            </div>

            <div>
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                value={formData.branchName}
                onChange={(e) => handleChange("branchName", e.target.value)}
                placeholder="Enter branch name"
                required
              />
            </div>

            <div>
              <Label htmlFor="securityPin" className="text-sm font-medium text-muted-foreground">Security PIN</Label>
              <Input
                id="securityPin"
                type="password"
                placeholder="Enter your security PIN"
                className="bg-gray-50 border-gray-200 text-gray-600"
                required
              />
            </div>

            <Button type="submit" className="w-full mt-6" variant="neon">
              Change Bank Account
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ChangeBank;