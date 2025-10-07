import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const AddBank = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted, user:", user);
    
    if (!user) {
      console.error("No user found");
      toast.error("Please login to add bank account");
      return;
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error("Account numbers do not match");
      return;
    }

    if (!formData.accountNumber || !formData.ifscCode || !formData.accountHolderName || !formData.bankName || !formData.branchName) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Deactivating existing bank accounts for user:", user.id);
      // First, deactivate any existing bank accounts for this user
      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error deactivating existing accounts:', updateError);
        throw updateError;
      }

      console.log("Fetching username for user:", user.id);
      // Get username from user_data table
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userDataError) {
        console.error('Error fetching user data:', userDataError);
        throw new Error('Failed to fetch user information');
      }

      console.log("User data fetched:", userData);
      console.log("Inserting new bank account");
      
      // Insert the new bank account (schema does not include username)
      const { data: insertedData, error: insertError } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          account_holder_name: formData.accountHolderName,
          account_number: formData.accountNumber,
          bank_name: formData.bankName,
          branch_name: formData.branchName,
          ifsc_code: formData.ifscCode.toUpperCase(),
          is_active: true,
        })
        .select();

      if (insertError) {
        console.error('Error inserting bank account:', insertError);
        console.error('Insert error details:', JSON.stringify(insertError));
        throw new Error(insertError.message || 'Failed to add bank account');
      }

      if (!insertedData || insertedData.length === 0) {
        console.error('No data returned from insert');
        throw new Error('Bank account was not created');
      }

      console.log("Bank account added successfully:", insertedData);
      toast.success("Bank account added successfully!");
      
      // Small delay to ensure user sees the success message
      setTimeout(() => {
        navigate("/wallet");
      }, 500);
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      toast.error(error.message || "Failed to add bank account");
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-lg font-semibold text-foreground">Add Bank Account</h1>
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

            <Button 
              type="submit" 
              className="w-full mt-6" 
              variant="neon"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding Account..." : "Add Bank Account"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default AddBank;