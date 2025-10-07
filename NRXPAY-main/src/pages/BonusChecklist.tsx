import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Circle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BonusTask {
  id: string;
  task_name: string;
  task_description: string | null;
  reward_amount: number;
  task_order: number;
}

interface UserTaskCompletion {
  id: string;
  task_id: string;
  is_completed: boolean;
  is_bonus_active: boolean;
  bonus_credited: boolean;
  completed_at: string | null;
  bonus_credited_at: string | null;
}

const BonusChecklist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bonusTasks, setBonusTasks] = useState<BonusTask[]>([]);
  const [userCompletions, setUserCompletions] = useState<UserTaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchTasksAndCompletions();
    }
  }, [user]);

  const fetchTasksAndCompletions = async () => {
    try {
      // Fetch all bonus tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("bonus_tasks")
        .select("*")
        .order("task_order");

      if (tasksError) throw tasksError;

      // Fetch user's task completions
      const { data: completionsData, error: completionsError } = await supabase
        .from("user_task_completions")
        .select("*")
        .eq("user_id", user?.id);

      if (completionsError && completionsError.code !== 'PGRST116') {
        throw completionsError;
      }

      setBonusTasks(tasksData || []);
      setUserCompletions(completionsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskCompletion = (taskId: string): UserTaskCompletion | null => {
    return userCompletions.find(completion => completion.task_id === taskId) || null;
  };

  const claimBonus = async (taskId: string) => {
    if (!user) return;
    
    const completion = getTaskCompletion(taskId);
    if (!completion || !completion.is_completed || completion.bonus_credited) return;
    
    setClaiming(taskId);
    
    try {
      const task = bonusTasks.find(t => t.id === taskId);
      if (!task) throw new Error("Task not found");

      // Get current balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("user_balances")
        .select("usdt_balance")
        .eq("user_id", user.id)
        .single();

      if (balanceError) throw balanceError;

      // Update USDT balance instead of current_balance
      const newBalance = (balanceData.usdt_balance || 0) + task.reward_amount;
      const { error: updateError } = await supabase
        .from("user_balances")
        .update({ usdt_balance: newBalance })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Mark bonus as credited
      const { error: creditError } = await supabase
        .from("user_task_completions")
        .update({ 
          bonus_credited: true,
          bonus_credited_at: new Date().toISOString()
        })
        .eq("id", completion.id);

      if (creditError) throw creditError;

      toast({
        title: "Bonus Claimed!",
        description: `$${task.reward_amount} USDT has been added to your account`,
      });

      fetchTasksAndCompletions();
    } catch (error) {
      console.error("Error claiming bonus:", error);
      toast({
        title: "Error",
        description: "Failed to claim bonus. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaiming(null);
    }
  };

  const getTotalEarned = (): number => {
    return userCompletions
      .filter(completion => completion.is_completed && completion.bonus_credited)
      .reduce((total, completion) => {
        const task = bonusTasks.find(t => t.id === completion.task_id);
        return total + (task?.reward_amount || 0);
      }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-foreground">Bonus Checklist</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-4 animate-slide-up pb-20">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-bold neon-text">Earn More Rewards</h2>
          <p className="text-sm text-muted-foreground">Complete tasks to unlock bonus rewards</p>
        </div>

        <div className="space-y-3">
          {bonusTasks.map((task) => {
            const completion = getTaskCompletion(task.id);
            const isCompleted = completion?.is_completed || false;
            const isBonusCredited = completion?.bonus_credited || false;
            
            return (
              <Card key={task.id} className={`p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                    <div>
                      <p className={`font-medium text-sm ${isCompleted ? 'text-green-700' : 'text-foreground'}`}>
                        {task.task_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isCompleted ? (isBonusCredited ? 'Bonus Credited' : 'Ready to Claim') : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isCompleted ? 'text-green-600' : 'neon-text'}`}>
                        ${task.reward_amount}
                      </p>
                      <p className="text-xs text-muted-foreground">Reward</p>
                    </div>
                    {isCompleted && !isBonusCredited && (
                      <Button
                        size="sm"
                        onClick={() => claimBonus(task.id)}
                        disabled={claiming === task.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Gift className="h-4 w-4 mr-1" />
                        {claiming === task.id ? 'Claiming...' : 'Claim'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Total Bonus Earned</h3>
            <p className="text-2xl font-bold neon-text">${getTotalEarned()}</p>
            <p className="text-xs text-muted-foreground">Keep completing tasks to earn more!</p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default BonusChecklist;