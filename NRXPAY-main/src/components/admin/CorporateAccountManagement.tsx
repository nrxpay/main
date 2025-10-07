import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building, CheckCircle, XCircle, Eye, Clock, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CorporateAccount {
  id: string;
  user_id: string;
  username: string;
  company_name: string;
  company_type: string;
  registration_number: string;
  gst_number: string;
  pan_number: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  status: string;
  show_recharge_popup?: boolean;
  documents_uploaded: boolean;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
}

export function CorporateAccountManagement() {
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<CorporateAccount | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const fetchCorporateAccounts = async () => {
    setLoading(true);
    try {
      const { data: corporateData, error: corporateError } = await supabase
        .from('corporate_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (corporateError) throw corporateError;

      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, username');

      if (userError) throw userError;

      const combinedAccounts = corporateData.map(account => {
        const user = userData.find(u => u.user_id === account.user_id);
        return {
          ...account,
          username: user?.username || 'Unknown'
        };
      });

      setAccounts(combinedAccounts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch corporate accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAccountStatus = async (accountId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('corporate_accounts')
        .update({
          status,
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Corporate account ${status} successfully`
      });

      fetchCorporateAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} account`,
        variant: "destructive"
      });
    }
  };


  const viewDetails = (account: CorporateAccount) => {
    setSelectedAccount(account);
    setDetailsOpen(true);
  };

  useEffect(() => {
    fetchCorporateAccounts();
  }, []);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter && statusFilter !== "all" ? account.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Corporate Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Accounts</Label>
              <Input
                id="search"
                placeholder="Search by company name, username, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.company_name}</TableCell>
                    <TableCell>{account.username}</TableCell>
                    <TableCell>{account.contact_person}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {account.company_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <Badge variant={account.documents_uploaded ? "default" : "secondary"}>
                        {account.documents_uploaded ? "Uploaded" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(account.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        {/* Status Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDetails(account)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {account.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateAccountStatus(account.id, 'approved')}
                                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateAccountStatus(account.id, 'rejected')}
                                className="h-8 px-3"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {/* Clear Status Icons */}
                          {account.status === 'rejected' && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-xs font-medium text-red-700">Rejected</span>
                            </div>
                          )}
                          {account.status === 'approved' && (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Approved</span>
                            </div>
                          )}
                          {/* Ready to run status would be determined by checking user balance */}
                          {account.status === 'active' && (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1 rounded-lg">
                              <Play className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Ready to Run</span>
                            </div>
                          )}
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Corporate Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Company Name</Label>
                <p className="text-sm">{selectedAccount.company_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Company Type</Label>
                <p className="text-sm">{selectedAccount.company_type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Registration Number</Label>
                <p className="text-sm">{selectedAccount.registration_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">GST Number</Label>
                <p className="text-sm">{selectedAccount.gst_number || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">PAN Number</Label>
                <p className="text-sm">{selectedAccount.pan_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Contact Person</Label>
                <p className="text-sm">{selectedAccount.contact_person}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Contact Email</Label>
                <p className="text-sm">{selectedAccount.contact_email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Contact Phone</Label>
                <p className="text-sm">{selectedAccount.contact_phone}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm">{selectedAccount.address}</p>
              </div>
              
              {/* Document Status */}
              <div className="col-span-2">
                <Label className="text-sm font-medium">Documents Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${selectedAccount.documents_uploaded ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-muted-foreground">
                    {selectedAccount.documents_uploaded ? 'Documents uploaded' : 'No documents uploaded'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}