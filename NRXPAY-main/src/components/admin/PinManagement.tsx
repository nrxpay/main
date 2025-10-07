import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Search, Trash2, RotateCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface UserPin {
  id: string;
  user_id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function PinManagement() {
  const [pins, setPins] = useState<UserPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPins = async () => {
    setLoading(true);
    try {
      const { data: pinData, error: pinError } = await supabase
        .from('pins')
        .select('*')
        .order('created_at', { ascending: false });

      if (pinError) throw pinError;

      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, username');

      if (userError) throw userError;

      const combinedPins = pinData.map(pin => {
        const user = userData.find(u => u.user_id === pin.user_id);
        return {
          ...pin,
          username: user?.username || 'Unknown'
        };
      });

      setPins(combinedPins);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch PINs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePinStatus = async (pinId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pins')
        .update({ is_active: !currentStatus })
        .eq('id', pinId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `PIN ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchPins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PIN status",
        variant: "destructive"
      });
    }
  };

  const deletePin = async (pinId: string) => {
    try {
      const { error } = await supabase
        .from('pins')
        .delete()
        .eq('id', pinId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "PIN deleted successfully"
      });

      fetchPins();
      setDeleteDialogOpen(false);
      setSelectedPin(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PIN",
        variant: "destructive"
      });
    }
  };

  const resetUserPin = async (userId: string) => {
    try {
      // Delete existing PIN for the user
      const { error } = await supabase
        .from('pins')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User PIN reset successfully. User will need to create a new PIN."
      });

      fetchPins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset PIN",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (pinId: string) => {
    setSelectedPin(pinId);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const filteredPins = pins.filter(pin =>
    pin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Shield className="h-5 w-5" />
            PIN Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search PINs</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{pins.length}</div>
                  <div className="text-sm text-muted-foreground">Total PINs</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {pins.filter(p => p.is_active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active PINs</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {pins.filter(p => !p.is_active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Inactive PINs</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPins.map((pin) => (
                  <TableRow key={pin.id}>
                    <TableCell className="font-medium">{pin.username}</TableCell>
                    <TableCell>{pin.email}</TableCell>
                    <TableCell>
                      <Badge variant={pin.is_active ? "default" : "secondary"}>
                        {pin.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(pin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(pin.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePinStatus(pin.id, pin.is_active)}
                        >
                          {pin.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetUserPin(pin.user_id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDelete(pin.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the PIN and the user will need to create a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedPin && deletePin(selectedPin)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete PIN
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}