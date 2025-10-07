import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Account {
  id: string;
  status: string;
  created_at: string;
}

interface SavingsAccount extends Account {
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  mobile_number: string;
}

interface CurrentAccount extends Account {
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  mobile_number: string;
}

interface CorporateAccount extends Account {
  company_name: string;
  company_type: string;
  registration_number: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
}

interface UserAccountsListProps {
  accountType: 'savings' | 'current' | 'corporate';
  accounts: SavingsAccount[] | CurrentAccount[] | CorporateAccount[];
  onAddNew: () => void;
}

const UserAccountsList = ({ accountType, accounts, onAddNew }: UserAccountsListProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAccountTypeTitle = () => {
    switch (accountType) {
      case 'savings': return 'Savings Accounts';
      case 'current': return 'Current Accounts';
      case 'corporate': return 'Corporate Accounts';
    }
  };

  const renderAccountDetails = (account: any) => {
    if (accountType === 'corporate') {
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Company:</strong> {account.company_name}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Type:</strong> {account.company_type}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Registration:</strong> {account.registration_number}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Contact:</strong> {account.contact_person}
          </p>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Account Holder:</strong> {account.account_holder_name}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Bank:</strong> {account.bank_name}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Account Number:</strong> {account.account_number}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>IFSC:</strong> {account.ifsc_code}
          </p>
        </div>
      );
    }
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
          <h1 className="text-lg font-semibold text-foreground">My {getAccountTypeTitle()}</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6 animate-slide-up pb-20">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Your {getAccountTypeTitle()}</h2>
          <Button onClick={onAddNew} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>

        {accounts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't uploaded any {accountType} accounts yet.
            </p>
            <Button onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-1" />
              Upload Your First Account
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <Card key={account.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={getStatusColor(account.status)}>
                    {account.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(account.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {renderAccountDetails(account)}
                
                {account.status === 'pending' && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                    <p className="text-xs text-yellow-800">
                      Your application is under review. You'll be notified once it's processed.
                    </p>
                  </div>
                )}
                
                {account.status === 'rejected' && (
                  <div className="mt-3 p-2 bg-red-50 rounded-md">
                    <p className="text-xs text-red-800">
                      Your application was rejected. Please contact support for more information.
                    </p>
                  </div>
                )}
                
                {account.status === 'approved' && (
                  <div className="mt-3 p-2 bg-green-50 rounded-md">
                    <p className="text-xs text-green-800">
                      Your account has been approved and is active!
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserAccountsList;