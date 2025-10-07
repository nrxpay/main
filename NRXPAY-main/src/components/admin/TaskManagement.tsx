import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  user_id: string;
  username: string;
  mobile_number: string;
}

interface BonusTask {
  id: string;
  task_name: string;
  task_description: string | null;
  reward_amount: number;
  task_order: number;
}

interface UserTaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  is_completed: boolean;
  is_bonus_active: boolean;
  bonus_credited: boolean;
  completed_at: string | null;
  bonus_credited_at: string | null;
  bonus_tasks: BonusTask;
}

const TaskManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bonusTasks, setBonusTasks] = useState<BonusTask[]>([]);
  const [userCompletions, setUserCompletions] = useState<UserTaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("user_data")
        .select("user_id, username, mobile_number");

      if (usersError) throw usersError;

      // Fetch all bonus tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("bonus_tasks")
        .select("*")
        .order("task_order");

      if (tasksError) throw tasksError;

      // Fetch all user task completions
      const { data: completionsData, error: completionsError } = await supabase
        .from("user_task_completions")
        .select(`
          *,
          bonus_tasks (*)
        `);

      if (completionsError) throw completionsError;

      setUsers(usersData || []);
      setBonusTasks(tasksData || []);
      setUserCompletions(completionsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch task data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number.includes(searchTerm)
  );

  const getUserTaskCompletion = (userId: string, taskId: string): UserTaskCompletion | null => {
    return userCompletions.find(completion => 
      completion.user_id === userId && completion.task_id === taskId
    ) || null;
  };

  const markTaskAsCompleted = async (userId: string, taskId: string) => {
    try {
      const existing = getUserTaskCompletion(userId, taskId);
      
      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("user_task_completions")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new completion record
        const { error } = await supabase
          .from("user_task_completions")
          .insert({
            user_id: userId,
            task_id: taskId,
            is_completed: true,
            completed_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Task marked as completed",
      });

      fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task completion",
        variant: "destructive",
      });
    }
  };

  const toggleBonusActive = async (completionId: string, isActive: boolean) => {
    try {
      const completion = userCompletions.find(c => c.id === completionId);
      if (!completion) return;

      // If activating bonus and task is completed but not credited yet
      if (isActive && completion.is_completed && !completion.bonus_credited) {
        // Get current balance first
        const { data: balanceData, error: balanceError } = await supabase
          .from("user_balances")
          .select("current_balance")
          .eq("user_id", completion.user_id)
          .single();

        if (balanceError) throw balanceError;

        // Credit bonus to user balance
        const newBalance = (balanceData.current_balance || 0) + completion.bonus_tasks.reward_amount;
        const { error: updateError } = await supabase
          .from("user_balances")
          .update({ current_balance: newBalance })
          .eq("user_id", completion.user_id);

        if (updateError) throw updateError;

        // Update task as bonus credited
        const { error: taskError } = await supabase
          .from("user_task_completions")
          .update({ 
            is_bonus_active: isActive,
            bonus_credited: true,
            bonus_credited_at: new Date().toISOString()
          })
          .eq("id", completionId);

        if (taskError) throw taskError;

        toast({
          title: "Success",
          description: `Bonus activated and $${completion.bonus_tasks.reward_amount} credited to user account`,
        });
      } else {
        // Just update the bonus active status
        const { error } = await supabase
          .from("user_task_completions")
          .update({ is_bonus_active: isActive })
          .eq("id", completionId);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Task bonus ${isActive ? 'activated' : 'deactivated'}`,
        });
      }

      fetchData();
    } catch (error) {
      console.error("Error updating bonus:", error);
      toast({
        title: "Error",
        description: "Failed to update bonus status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Bonus Task Management
        </CardTitle>
        <CardDescription>
          Manage user task completions and bonus activations for the 5 bonus checklist tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.user_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">{user.mobile_number}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {bonusTasks.map((task) => {
                    const completion = getUserTaskCompletion(user.user_id, task.id);
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{task.task_name}</span>
                            {completion?.is_completed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Reward: ${task.reward_amount}</span>
                            {completion?.bonus_credited && (
                              <span className="text-green-600 font-medium">✓ Credited</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!completion?.is_completed ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markTaskAsCompleted(user.user_id, task.id)}
                            >
                              Mark Completed
                            </Button>
                          ) : (
                            <>
                              <span className="text-sm font-medium">
                                {completion.is_bonus_active ? 'Active' : 'Inactive'}
                              </span>
                              <Switch
                                checked={completion.is_bonus_active}
                                onCheckedChange={(checked) => toggleBonusActive(completion.id, checked)}
                                disabled={completion.bonus_credited && !completion.is_bonus_active}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManagement;