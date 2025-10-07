import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Search, CheckCircle, X, XCircle, Clock, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CurrentAccount {
  id: string;
  user_id: string;
  username: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  mobile_number: string;
  status: string;
  show_recharge_popup?: boolean;
  aadhar_photo_url?: string;
  pan_photo_url?: string;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
}

const CurrentAccountManagement = () => {
  const [accounts, setAccounts] = useState<CurrentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<CurrentAccount | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const fetchCurrentAccounts = async () => {
    setLoading(true);
    try {
      const { data: currentData, error: currentError } = await supabase
        .from('current_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentError) throw currentError;

      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, username');

      if (userError) throw userError;

      const accountsWithUsernames = currentData.map(account => {
        const user = userData.find(u => u.user_id === account.user_id);
        return {
          ...account,
          username: user?.username || 'Unknown User'
        };
      });

      setAccounts(accountsWithUsernames);
    } catch (error) {
      console.error('Error fetching current accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch current accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAccountStatus = async (accountId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('current_accounts')
        .update({
          status,
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Account ${status} successfully`,
      });

      fetchCurrentAccounts();
    } catch (error) {
      console.error('Error updating account status:', error);
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    fetchCurrentAccounts();
  }, []);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.mobile_number.includes(searchTerm);
    const matchesStatus = !statusFilter || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Account Management</CardTitle>
        <CardDescription>
          Manage and verify current account applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, account holder, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Accounts List */}
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{account.username}</h3>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Account Holder:</strong> {account.account_holder_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Bank:</strong> {account.bank_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mobile:</strong> {account.mobile_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Applied:</strong> {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAccount(account)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Current Account Details</DialogTitle>
                        </DialogHeader>
                        {selectedAccount && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Username</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.username}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Account Holder Name</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.account_holder_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Account Number</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.account_number}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Bank Name</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.bank_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">IFSC Code</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.ifsc_code}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Mobile Number</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.mobile_number}</p>
                              </div>
                            </div>
                            
                            {/* Document Images */}
                            {(selectedAccount.aadhar_photo_url || selectedAccount.pan_photo_url) && (
                              <div className="space-y-4">
                                <h4 className="text-sm font-medium">Uploaded Documents</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {selectedAccount.aadhar_photo_url && (
                                    <div>
                                      <label className="text-sm font-medium">Aadhar Document</label>
                                      <img 
                                        src={`${supabase.storage.from('current-docs').getPublicUrl(selectedAccount.aadhar_photo_url).data.publicUrl}`}
                                        alt="Aadhar Document"
                                        className="w-full h-32 object-cover border rounded-lg mt-1"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  {selectedAccount.pan_photo_url && (
                                    <div>
                                      <label className="text-sm font-medium">PAN Document</label>
                                      <img 
                                        src={`${supabase.storage.from('current-docs').getPublicUrl(selectedAccount.pan_photo_url).data.publicUrl}`}
                                        alt="PAN Document"
                                        className="w-full h-32 object-cover border rounded-lg mt-1"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {selectedAccount.status === 'pending' && (
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => {
                                    updateAccountStatus(selectedAccount.id, 'approved');
                                    setDetailsOpen(false);
                                  }}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    updateAccountStatus(selectedAccount.id, 'rejected');
                                    setDetailsOpen(false);
                                  }}
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-2">
                      {account.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateAccountStatus(account.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateAccountStatus(account.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                          )}
                          
                          {/* Clear Status Icons */}
                          {account.status === 'rejected' && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <span className="text-sm font-medium text-red-700">Rejected</span>
                            </div>
                          )}
                          {account.status === 'approved' && (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Approved</span>
                            </div>
                          )}
                      {/* Ready to run status would be determined by checking user balance */}
                      {account.status === 'active' && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                          <Play className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Ready to Run</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAccounts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No current accounts found</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentAccountManagement;