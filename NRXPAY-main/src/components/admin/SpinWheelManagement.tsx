import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SpinWheelConfig {
  id: string;
  title: string;
  body_text: string;
  percentages: number[];
  fixed_winning_percentage: number;
  is_active: boolean;
}

interface User {
  id: string;
  username: string;
  mobile_number: string;
}

const SpinWheelManagement = () => {
  const [config, setConfig] = useState<SpinWheelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [percentages, setPercentages] = useState<number[]>([20, 5, 10, 1, 15, 30, 25, 40]);
  const [fixedWinning, setFixedWinning] = useState(20);
  
  // Grant spin section
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [grantingSpinForAll, setGrantingSpinForAll] = useState(false);
  const [showGrantAllDialog, setShowGrantAllDialog] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchUsers();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("spin_wheel_config")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data);
        setTitle(data.title);
        setBodyText(data.body_text);
        setPercentages(data.percentages);
        setFixedWinning(data.fixed_winning_percentage);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Failed to load spin wheel configuration");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("user_id, username, mobile_number")
        .order("username");

      if (error) throw error;

      setUsers(data?.map(u => ({
        id: u.user_id,
        username: u.username,
        mobile_number: u.mobile_number
      })) || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    if (percentages.length !== 8) {
      toast.error("You must provide exactly 8 percentages");
      return;
    }

    if (!percentages.includes(fixedWinning)) {
      toast.error("Fixed winning percentage must be one of the wheel percentages");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("spin_wheel_config")
        .update({
          title,
          body_text: bodyText,
          percentages,
          fixed_winning_percentage: fixedWinning,
        })
        .eq("id", config.id);

      if (error) throw error;

      toast.success("Configuration updated successfully!");
      await fetchConfig();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleGrantSpin = async (userId: string) => {
    try {
      // Reset the spin for this user
      const { error } = await supabase
        .from("recharge_bonus_spins")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Spin granted successfully!");
      setSelectedUserId("");
    } catch (error) {
      console.error("Error granting spin:", error);
      toast.error("Failed to grant spin");
    }
  };

  const handleGrantSpinForAll = async () => {
    setGrantingSpinForAll(true);
    try {
      // Delete all spin records to allow everyone to spin again
      const { error } = await supabase
        .from("recharge_bonus_spins")
        .delete()
        .neq("user_id", "00000000-0000-0000-0000-000000000000"); // Delete all records

      if (error) throw error;

      toast.success("Spins granted to all users!");
      setShowGrantAllDialog(false);
    } catch (error) {
      console.error("Error granting spins:", error);
      toast.error("Failed to grant spins to all users");
    } finally {
      setGrantingSpinForAll(false);
    }
  };

  const handlePercentageChange = (index: number, value: string) => {
    const newPercentages = [...percentages];
    newPercentages[index] = parseInt(value) || 0;
    setPercentages(newPercentages);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number.includes(searchTerm)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spin Wheel Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter wheel title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body Text</Label>
            <Textarea
              id="body"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Wheel Percentages (8 values)</Label>
            <div className="grid grid-cols-4 gap-2">
              {percentages.map((percentage, index) => (
                <Input
                  key={index}
                  type="number"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(index, e.target.value)}
                  placeholder={`Slot ${index + 1}`}
                  min="1"
                  max="100"
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixedWinning">Fixed Winning Percentage</Label>
            <Select
              value={fixedWinning.toString()}
              onValueChange={(value) => setFixedWinning(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {percentages.map((p) => (
                  <SelectItem key={p} value={p.toString()}>
                    {p}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              All users will always win this percentage
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grant Spins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Grant Spin to All Users</Label>
            <Button
              onClick={() => setShowGrantAllDialog(true)}
              variant="outline"
              className="w-full"
              disabled={grantingSpinForAll}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Spins
            </Button>
            <p className="text-sm text-muted-foreground">
              This will allow all users to spin the wheel again
            </p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Label>Grant Spin to Specific User</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or mobile"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-2">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.mobile_number}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleGrantSpin(user.id)}
                    >
                      Grant Spin
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showGrantAllDialog} onOpenChange={setShowGrantAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grant Spins to All Users?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all spin records and allow every user to spin the wheel again. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGrantSpinForAll}
              disabled={grantingSpinForAll}
            >
              {grantingSpinForAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Granting...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SpinWheelManagement;
