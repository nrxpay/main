import { Trophy, Crown, Medal, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface RankingUser {
  id: string;
  rank: number;
  name: string;
  earnings: string;
  icon: any;
  color: string;
  medal?: string;
}

const Ranking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [weeklyUsers, setWeeklyUsers] = useState<RankingUser[]>([]);
  const [dailyUsers, setDailyUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<RankingUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', earnings: '' });
  const [activeTab, setActiveTab] = useState('daily');

  // Load rankings from database
  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        // Fetch weekly rankings
        const { data: weeklyData, error: weeklyError } = await supabase
          .from('weekly_rankings')
          .select('*')
          .order('rank_score', { ascending: false })
          .limit(10);

        if (weeklyError) throw weeklyError;

        // Fetch daily rankings
        const { data: dailyData, error: dailyError } = await supabase
          .from('daily_rankings')
          .select('*')
          .order('rank_score', { ascending: false })
          .limit(10);

        if (dailyError) throw dailyError;

        // Process weekly rankings
        const processedWeeklyUsers = weeklyData.map((ranking, index) => ({
          id: ranking.user_id,
          rank: index + 1,
          name: ranking.username || `User ${ranking.user_id.slice(0, 8)}`,
          earnings: `₹${ranking.total_volume?.toLocaleString() || '0'}`,
          icon: index === 0 ? Crown : index === 1 ? Trophy : index === 2 ? Medal : Star,
          color: index === 0 ? "text-yellow-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-600" : "text-blue-500",
          medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : undefined
        }));

        // Process daily rankings
        const processedDailyUsers = dailyData.map((ranking, index) => ({
          id: ranking.user_id,
          rank: index + 1,
          name: ranking.username || `User ${ranking.user_id.slice(0, 8)}`,
          earnings: `₹${ranking.total_volume?.toLocaleString() || '0'}`,
          icon: index === 0 ? Crown : index === 1 ? Trophy : index === 2 ? Medal : Star,
          color: index === 0 ? "text-yellow-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-600" : "text-blue-500",
          medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : undefined
        }));

        setWeeklyUsers(processedWeeklyUsers);
        setDailyUsers(processedDailyUsers);
        
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
        // Fallback to default data if database fetch fails
        setWeeklyUsers(getDefaultWeeklyUsers());
        setDailyUsers(getDefaultDailyUsers());
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const handleEditUser = (user: RankingUser) => {
    if (!isAdmin) return;
    setEditingUser(user);
    setEditForm({ 
      name: user.name, 
      earnings: user.earnings.replace('₹', '').replace(/,/g, '')
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !isAdmin) return;

    try {
      const earningsAmount = parseFloat(editForm.earnings.replace(/,/g, ''));
      
      // Update the correct table based on active tab
      const tableName = activeTab === 'weekly' ? 'weekly_rankings' : 'daily_rankings';
      
      const { error } = await supabase
        .from(tableName)
        .update({
          username: editForm.name,
          total_volume: earningsAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', editingUser.id);

      if (error) throw error;

      // Refresh only the relevant ranking
      await fetchSpecificRankings(activeTab);
      
      setEditingUser(null);
      toast({
        title: "Success",
        description: `${activeTab === 'weekly' ? 'Weekly' : 'Daily'} ranking updated successfully`
      });
    } catch (error) {
      console.error('Error updating ranking:', error);
      toast({
        title: "Error",
        description: "Failed to update ranking",
        variant: "destructive"
      });
    }
  };

  const fetchSpecificRankings = async (type: string) => {
    try {
      const tableName = type === 'weekly' ? 'weekly_rankings' : 'daily_rankings';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('rank_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      const processedUsers = data.map((ranking, index) => ({
        id: ranking.user_id,
        rank: index + 1,
        name: ranking.username || `User ${ranking.user_id.slice(0, 8)}`,
        earnings: `₹${ranking.total_volume?.toLocaleString() || '0'}`,
        icon: index === 0 ? Crown : index === 1 ? Trophy : index === 2 ? Medal : Star,
        color: index === 0 ? "text-yellow-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-600" : "text-blue-500",
        medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : undefined
      }));

      if (type === 'weekly') {
        setWeeklyUsers(processedUsers);
      } else {
        setDailyUsers(processedUsers);
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} rankings:`, error);
    }
  };

  const getDefaultUsers = (): RankingUser[] => [
    { id: "1", rank: 1, name: "Rajesh Kumar", earnings: "₹2,45,000", icon: Crown, color: "text-yellow-600", medal: "🥇" },
    { id: "2", rank: 2, name: "Priya Singh", earnings: "₹1,98,000", icon: Trophy, color: "text-gray-500", medal: "🥈" },
    { id: "3", rank: 3, name: "Amit Sharma", earnings: "₹1,67,000", icon: Medal, color: "text-orange-600", medal: "🥉" },
    { id: "4", rank: 4, name: "Sneha Patel", earnings: "₹1,45,000", icon: Star, color: "text-blue-500" },
    { id: "5", rank: 5, name: "Rohit Gupta", earnings: "₹1,23,000", icon: Star, color: "text-purple-500" },
    { id: "6", rank: 6, name: "Anita Verma", earnings: "₹1,12,000", icon: Star, color: "text-green-500" },
    { id: "7", rank: 7, name: "Vikash Yadav", earnings: "₹98,500", icon: Star, color: "text-indigo-500" },
    { id: "8", rank: 8, name: "Deepika Rani", earnings: "₹89,200", icon: Star, color: "text-pink-500" },
    { id: "9", rank: 9, name: "Suresh Kumar", earnings: "₹76,800", icon: Star, color: "text-teal-500" },
    { id: "10", rank: 10, name: "Kavita Sharma", earnings: "₹65,400", icon: Star, color: "text-orange-500" },
  ];

  const getDefaultWeeklyUsers = (): RankingUser[] => [
    { id: "w1", rank: 1, name: "Meera Joshi", earnings: "₹125,000", icon: Crown, color: "text-yellow-600", medal: "🥇" },
    { id: "w2", rank: 2, name: "Arjun Singh", earnings: "₹89,500", icon: Trophy, color: "text-gray-500", medal: "🥈" },
    { id: "w3", rank: 3, name: "Kiran Patel", earnings: "₹76,200", icon: Medal, color: "text-orange-600", medal: "🥉" },
    { id: "w4", rank: 4, name: "Ravi Kumar", earnings: "₹65,800", icon: Star, color: "text-blue-500" },
    { id: "w5", rank: 5, name: "Neha Sharma", earnings: "₹58,400", icon: Star, color: "text-purple-500" },
    { id: "w6", rank: 6, name: "Vikram Yadav", earnings: "₹52,100", icon: Star, color: "text-green-500" },
    { id: "w7", rank: 7, name: "Pooja Singh", earnings: "₹47,600", icon: Star, color: "text-indigo-500" },
    { id: "w8", rank: 8, name: "Manish Gupta", earnings: "₹43,200", icon: Star, color: "text-pink-500" },
    { id: "w9", rank: 9, name: "Sonia Verma", earnings: "₹39,800", icon: Star, color: "text-teal-500" },
    { id: "w10", rank: 10, name: "Deepak Jain", earnings: "₹36,500", icon: Star, color: "text-orange-500" },
  ];

  const getDefaultDailyUsers = (): RankingUser[] => [
    { id: "d1", rank: 1, name: "Arun Kumar", earnings: "₹45,000", icon: Crown, color: "text-yellow-600", medal: "🥇" },
    { id: "d2", rank: 2, name: "Sunita Devi", earnings: "₹39,500", icon: Trophy, color: "text-gray-500", medal: "🥈" },
    { id: "d3", rank: 3, name: "Rahul Sharma", earnings: "₹36,200", icon: Medal, color: "text-orange-600", medal: "🥉" },
    { id: "d4", rank: 4, name: "Geeta Singh", earnings: "₹32,800", icon: Star, color: "text-blue-500" },
    { id: "d5", rank: 5, name: "Manoj Yadav", earnings: "₹28,400", icon: Star, color: "text-purple-500" },
    { id: "d6", rank: 6, name: "Rekha Patel", earnings: "₹25,100", icon: Star, color: "text-green-500" },
    { id: "d7", rank: 7, name: "Sanjay Gupta", earnings: "₹22,600", icon: Star, color: "text-indigo-500" },
    { id: "d8", rank: 8, name: "Kavitha Rao", earnings: "₹19,200", icon: Star, color: "text-pink-500" },
    { id: "d9", rank: 9, name: "Amit Joshi", earnings: "₹16,800", icon: Star, color: "text-teal-500" },
    { id: "d10", rank: 10, name: "Priya Nair", earnings: "₹14,500", icon: Star, color: "text-orange-500" },
  ];

  const RankingDisplay = ({ users, title }: { users: RankingUser[], title: string }) => {
    if (loading) {
      return <div className="text-center py-8">Loading rankings...</div>;
    }

    if (!users || users.length === 0) {
      return <div className="text-center py-8">No rankings available</div>;
    }

    return (
      <>
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center space-x-4 mb-6">
          {/* 2nd Place - Left */}
          {users[1] && (
            <div className="text-center">
              <Card className="p-3 bg-gray-50 border-gray-200">
                <div className="text-2xl mb-2">🥈</div>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-6 w-6 text-gray-500" />
                </div>
                <p 
                  className={`font-semibold text-xs ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                  onClick={() => isAdmin && handleEditUser(users[1])}
                >
                  {users[1].name}
                </p>
                <p className="text-xs text-muted-foreground">#{users[1].rank}</p>
                <p 
                  className={`font-bold text-xs text-foreground ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                  onClick={() => isAdmin && handleEditUser(users[1])}
                >
                  {users[1].earnings}
                </p>
              </Card>
            </div>
          )}

          {/* 1st Place - Center (Higher) */}
          {users[0] && (
            <div className="text-center -mt-4">
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="text-3xl mb-2">🥇</div>
                <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                  <Crown className="h-7 w-7 text-yellow-600" />
                </div>
                <p 
                  className={`font-semibold text-sm ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                  onClick={() => isAdmin && handleEditUser(users[0])}
                >
                  {users[0].name}
                </p>
                <p className="text-xs text-muted-foreground">#{users[0].rank}</p>
                <p 
                  className={`font-bold text-sm text-foreground ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                  onClick={() => isAdmin && handleEditUser(users[0])}
                >
                  {users[0].earnings}
                </p>
              </Card>
            </div>
          )}

          {/* 3rd Place - Right */}
          {users[2] && (
            <div className="text-center">
              <Card className="p-3 bg-orange-50 border-orange-200">
                <div className="text-2xl mb-2">🥉</div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                  <Medal className="h-6 w-6 text-orange-600" />
                </div>
                <p 
                  className={`font-semibold text-xs ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                  onClick={() => isAdmin && handleEditUser(users[2])}
                >
                  {users[2].name}
                </p>
                <p className="text-xs text-muted-foreground">#{users[2].rank}</p>
                <p 
                  className={`font-bold text-xs text-foreground ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                  onClick={() => isAdmin && handleEditUser(users[2])}
                >
                  {users[2].earnings}
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* Rest of Rankings */}
        <div className="space-y-3">
          {users.slice(3).map((user, index) => (
            <Card key={user.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">#{user.rank}</span>
                  </div>
                  <div>
                    <p 
                      className={`font-semibold text-sm ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                      onClick={() => isAdmin && handleEditUser(user)}
                    >
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Active user</p>
                  </div>
                </div>
                <div className="text-right">
                  <p 
                    className={`font-bold text-sm text-foreground ${isAdmin ? 'cursor-pointer hover:text-primary' : ''}`}
                    onClick={() => isAdmin && handleEditUser(user)}
                  >
                    {user.earnings}
                  </p>
                  <p className="text-xs text-muted-foreground">{title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <Header 
        cautionContent="Daily Rankings are updated in Real-time as the user recharges. Users on this list are heavy earners." 
        isDanger={false}
      />
      
      <main className="px-4 py-6 space-y-6 animate-slide-up">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Top Earners</h2>
          <p className="text-sm text-muted-foreground">Earnings leaderboard</p>
          {isAdmin && (
            <p className="text-xs text-muted-foreground">Click on names or earnings to edit</p>
          )}
        </div>

        <Tabs defaultValue="daily" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-6 mt-6">
            <RankingDisplay users={weeklyUsers} title="This week" />
            <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="text-center space-y-2">
                <Star className="h-8 w-8 mx-auto text-green-500" />
                <h3 className="font-semibold">Weekly Challenge!</h3>
                <p className="text-xs text-muted-foreground">
                  Complete weekly goals and earn bonus rewards
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-6 mt-6">
            <RankingDisplay users={dailyUsers} title="Today" />
            <Card className="p-4 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="text-center space-y-2">
                <Medal className="h-8 w-8 mx-auto text-red-500" />
                <h3 className="font-semibold">Daily Rush!</h3>
                <p className="text-xs text-muted-foreground">
                  Compete daily and win instant rewards
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ranking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Earnings (₹)</label>
              <Input
                type="number"
                value={editForm.earnings}
                onChange={(e) => setEditForm(prev => ({ ...prev, earnings: e.target.value }))}
                placeholder="Enter earnings amount"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ranking;