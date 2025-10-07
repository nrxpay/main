import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CurrentAccountForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    holderName: "",
    ifscCode: "",
    mobileNumber: "",
    accountType: "current",
    aadharPhoto: null as File | null,
    panPhoto: null as File | null,
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
    
    if (!user) {
      toast.error("Please login to submit your account details");
      return;
    }

    if (!formData.bankName || !formData.accountNumber || !formData.holderName || !formData.ifscCode || !formData.mobileNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    
    try {
      let aadharPhotoUrl = null;
      let panPhotoUrl = null;

      // Upload Aadhar photo if provided
      if (formData.aadharPhoto) {
        const aadharFileName = `${user.id}/aadhar_${Date.now()}.${formData.aadharPhoto.name.split('.').pop()}`;
        const { data: aadharData, error: aadharError } = await supabase.storage
          .from('current-docs')
          .upload(aadharFileName, formData.aadharPhoto);

        if (aadharError) throw aadharError;
        aadharPhotoUrl = aadharData.path;
      }

      // Upload PAN photo if provided
      if (formData.panPhoto) {
        const panFileName = `${user.id}/pan_${Date.now()}.${formData.panPhoto.name.split('.').pop()}`;
        const { data: panData, error: panError } = await supabase.storage
          .from('current-docs')
          .upload(panFileName, formData.panPhoto);

        if (panError) throw panError;
        panPhotoUrl = panData.path;
      }

      const { data, error } = await supabase
        .from('current_accounts')
        .insert({
          user_id: user.id,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          account_holder_name: formData.holderName,
          ifsc_code: formData.ifscCode,
          mobile_number: formData.mobileNumber,
          aadhar_photo_url: aadharPhotoUrl,
          pan_photo_url: panPhotoUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Current account application submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error('Error submitting account:', error);
      toast.error("Failed to submit account application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Current Account Form</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 animate-slide-up pb-20">
        {/* Poster with tagline */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">🏦 Current Account Benefits</h2>
            <p className="text-lg font-semibold bg-yellow-400 text-black px-4 py-2 rounded-lg inline-block">
              Earn More with Corporate Account
            </p>
            <p className="text-sm mt-2 text-white/90">
              Upload your current account details and unlock higher earning potential
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Select value={formData.bankName} onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {indianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Enter account number"
                required
              />
            </div>

            <div>
              <Label htmlFor="holderName">Account Holder's Name</Label>
              <Input
                id="holderName"
                value={formData.holderName}
                onChange={(e) => setFormData(prev => ({ ...prev, holderName: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={formData.ifscCode}
                onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                placeholder="Enter IFSC code"
                required
              />
            </div>

            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div>
              <Label>Aadhar Photo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('aadharPhoto', e.target.files?.[0] || null)}
                  className="hidden"
                  id="aadhar"
                />
                <label htmlFor="aadhar" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {formData.aadharPhoto ? formData.aadharPhoto.name : "Click to upload Aadhar photo"}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <Label>PAN Photo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('panPhoto', e.target.files?.[0] || null)}
                  className="hidden"
                  id="pan"
                />
                <label htmlFor="pan" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {formData.panPhoto ? formData.panPhoto.name : "Click to upload PAN photo"}
                  </p>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white">
              Submit Current Account Application
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CurrentAccountForm;