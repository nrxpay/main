import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Send, Users, User, UserCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const NotificationSender = () => {
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific" | "multiple">("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Fetch users for specific targeting
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_data")
        .select("user_id, username")
        .order("username");
      
      if (error) throw error;
      return data;
    },
    enabled: targetType === "specific" || targetType === "multiple"
  });

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    if (targetType === "specific" && !targetUserId) {
      toast({
        title: "Error", 
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    if (targetType === "multiple" && selectedUserIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      if (targetType === "all") {
        // Send to all users
        const { data: allUsers } = await supabase
          .from("user_data")
          .select("user_id");

        if (allUsers && allUsers.length > 0) {
          const notifications = allUsers.map(user => ({
            user_id: user.user_id,
            title,
            message,
            type: "admin_broadcast",
            is_read: false
          }));

          const { error } = await supabase
            .from("notifications")
            .insert(notifications);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Notification sent to ${allUsers.length} users`,
          });
        }
      } else if (targetType === "specific") {
        // Send to specific user
        const { error } = await supabase
          .from("notifications")
          .insert({
            user_id: targetUserId,
            title,
            message,
            type: "admin_message",
            is_read: false
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Notification sent successfully",
        });
      } else if (targetType === "multiple") {
        // Send to multiple selected users
        const notifications = selectedUserIds.map(userId => ({
          user_id: userId,
          title,
          message,
          type: "admin_message",
          is_read: false
        }));

        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Notification sent to ${selectedUserIds.length} users`,
        });
      }

      // Reset form
      setTitle("");
      setMessage("");
      setTargetUserId("");
      setSelectedUserIds([]);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Notification Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your notification message"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Target Audience</Label>
          <Select value={targetType} onValueChange={(value: "all" | "specific" | "multiple") => setTargetType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Users
                </div>
              </SelectItem>
              <SelectItem value="specific">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Specific User
                </div>
              </SelectItem>
              <SelectItem value="multiple">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Individual User List
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {targetType === "specific" && (
          <div className="space-y-2">
            <Label>Select User</Label>
            <Select value={targetUserId} onValueChange={setTargetUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {targetType === "multiple" && (
          <div className="space-y-2">
            <Label>Select Users ({selectedUserIds.length} selected)</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
              {users?.map((user) => (
                <div key={user.user_id} className="flex items-center space-x-2">
                  <Checkbox
                    id={user.user_id}
                    checked={selectedUserIds.includes(user.user_id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUserIds([...selectedUserIds, user.user_id]);
                      } else {
                        setSelectedUserIds(selectedUserIds.filter(id => id !== user.user_id));
                      }
                    }}
                  />
                  <Label htmlFor={user.user_id} className="cursor-pointer">
                    {user.username}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={sendNotification} 
          disabled={sending}
          className="w-full"
        >
          {sending ? "Sending..." : "Send Notification"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSender;