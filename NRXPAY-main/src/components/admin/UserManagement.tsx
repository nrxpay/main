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
import { Loader2, Search, UserPlus, Edit, Trash2, Users, Ban, UserX } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface User {
  id: string;
  username: string;
  mobile_number: string;
  created_at: string;
  current_balance: number;
  usdt_balance: number;
  role: string;
  status: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    console.log('Starting to fetch users...');
    
    try {
      // Get user data, balances, and roles in parallel from public tables
      console.log('Fetching data from public tables...');
      const [
        { data: userData, error: userError },
        { data: balanceData, error: balanceError },
        { data: roleData, error: roleError }
      ] = await Promise.all([
        supabase.from('user_data').select('*'),
        supabase.from('user_balances').select('*'),
        supabase.from('user_roles').select('*')
      ]);

      console.log('User data:', userData);
      console.log('Balance data:', balanceData);
      console.log('Role data:', roleData);

      if (userError) {
        console.error('User data error:', userError);
        throw userError;
      }

      // Get all unique user IDs from all tables
      const allUserIds = new Set([
        ...(userData?.map(u => u.user_id) || []),
        ...(balanceData?.map(b => b.user_id) || []),
        ...(roleData?.map(r => r.user_id) || [])
      ]);

      console.log('All user IDs found:', Array.from(allUserIds));

      // Combine all data for each unique user
      const combinedUsers = Array.from(allUserIds).map(userId => {
        const userInfo = userData?.find(u => u.user_id === userId);
        const balance = balanceData?.find(b => b.user_id === userId);
        const role = roleData?.find(r => r.user_id === userId);
        
        return {
          id: userId,
          username: userInfo?.username || 'Unknown User',
          mobile_number: userInfo?.mobile_number || 'N/A',
          created_at: userInfo?.created_at || balance?.created_at || role?.created_at || new Date().toISOString(),
          current_balance: balance?.current_balance || 0,
          usdt_balance: balance?.usdt_balance || 0,
          role: role?.role || 'user',
          status: (userInfo?.username?.startsWith('[SUSPENDED]') ? 'suspended' : 'active')
        };
      });

      console.log('Combined users:', combinedUsers);
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please check your permissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const updateBalance = async (userId: string, balance: number, type: 'current' | 'usdt') => {
    try {
      const updateData = type === 'current' 
        ? { current_balance: balance }
        : { usdt_balance: balance };

      const { error } = await supabase
        .from('user_balances')
        .upsert({ 
          user_id: userId,
          ...updateData 
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Balance updated successfully"
      });

      // Update local state immediately
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, [type === 'current' ? 'current_balance' : 'usdt_balance']: balance }
          : user
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive"
      });
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      // Get current username
      const { data: userData } = await supabase
        .from('user_data')
        .select('username')
        .eq('user_id', userId)
        .single();

      if (!userData) throw new Error('User not found');

      let newUsername = userData.username;
      if (!newUsername.startsWith('[SUSPENDED]')) {
        newUsername = `[SUSPENDED] ${userData.username}`;
      }

      const { error } = await supabase
        .from('user_data')
        .update({ username: newUsername })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User suspended successfully"
      });

      fetchUsers();
      setSuspendDialogOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete from all related tables
      await Promise.all([
        supabase.from('user_data').delete().eq('user_id', userId),
        supabase.from('user_balances').delete().eq('user_id', userId),
        supabase.from('user_roles').delete().eq('user_id', userId),
        supabase.from('pins').delete().eq('user_id', userId)
      ]);

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const activateUser = async (userId: string) => {
    try {
      // Get current username and remove suspension prefix
      const { data: userData } = await supabase
        .from('user_data')
        .select('username')
        .eq('user_id', userId)
        .single();

      if (!userData) throw new Error('User not found');

      let newUsername = userData.username;
      if (newUsername.startsWith('[SUSPENDED] ')) {
        newUsername = newUsername.replace('[SUSPENDED] ', '');
      }

      const { error } = await supabase
        .from('user_data')
        .update({ username: newUsername })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User activated successfully"
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile_number.includes(searchTerm);
    const matchesRole = selectedRole && selectedRole !== "all" ? user.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by username or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-48">
            <Label htmlFor="role-filter">Filter by Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>INR Balance</TableHead>
                <TableHead>USDT Balance</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.mobile_number}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={user.current_balance}
                      onBlur={(e) => updateBalance(user.id, parseFloat(e.target.value) || 0, 'current')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateBalance(user.id, parseFloat(e.currentTarget.value) || 0, 'current');
                        }
                      }}
                      className="w-24 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={user.usdt_balance}
                      onBlur={(e) => updateBalance(user.id, parseFloat(e.target.value) || 0, 'usdt')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateBalance(user.id, parseFloat(e.currentTarget.value) || 0, 'usdt');
                        }
                      }}
                      className="w-24 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      step="0.00000001"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value as 'admin' | 'user')}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? "default" : "destructive"}>
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.status === 'active' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setSuspendDialogOpen(true);
                          }}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => activateUser(user.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Suspend User Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this user? They will not be able to log in until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedUserId && suspendUser(selectedUserId)}
              className="bg-destructive text-destructive-foreground"
            >
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedUserId && deleteUser(selectedUserId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}