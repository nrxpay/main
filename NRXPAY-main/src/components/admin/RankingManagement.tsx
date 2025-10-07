import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, RefreshCw, Calendar, Clock, Save, X } from "lucide-react";

interface UserRanking {
  id: string;
  user_id: string;
  username: string;
  total_volume: number;
  total_transactions: number;
  rank_score: number;
  current_rank: number | null;
  created_at: string;
  updated_at: string;
}

export function RankingManagement() {
  const [allTimeRankings, setAllTimeRankings] = useState<UserRanking[]>([]);
  const [weeklyRankings, setWeeklyRankings] = useState<UserRanking[]>([]);
  const [dailyRankings, setDailyRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all-time");
  const [editingRankings, setEditingRankings] = useState<Record<string, { value: string; isEditing: boolean; isLoading: boolean }>>({});
  const { toast } = useToast();

  const fetchRankings = async () => {
    setLoading(true);
    try {
      // Fetch all time rankings
      const { data: rankingData, error: rankingError } = await supabase
        .from('user_rankings')
        .select('*')
        .order('rank_score', { ascending: false });

      if (rankingError) throw rankingError;

      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, username');

      if (userError) throw userError;

      const combinedRankings = rankingData.map((ranking, index) => {
        const user = userData.find(u => u.user_id === ranking.user_id);
        return {
          ...ranking,
          username: user?.username || 'Unknown',
          current_rank: index + 1
        };
      });

      setAllTimeRankings(combinedRankings);
      
      // For weekly rankings, filter by created_at within last 7 days and limit to top 10
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyFiltered = combinedRankings
        .filter(r => new Date(r.updated_at) >= weekAgo)
        .sort((a, b) => b.rank_score - a.rank_score)
        .slice(0, 10)
        .map((ranking, index) => ({ ...ranking, current_rank: index + 1 }));
      
      setWeeklyRankings(weeklyFiltered);
      
      // For daily rankings, filter by created_at within last 24 hours and limit to top 10
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      const dailyFiltered = combinedRankings
        .filter(r => new Date(r.updated_at) >= dayAgo)
        .sort((a, b) => b.rank_score - a.rank_score)
        .slice(0, 10)
        .map((ranking, index) => ({ ...ranking, current_rank: index + 1 }));
      
      setDailyRankings(dailyFiltered);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rankings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditingRankScore = (userId: string, currentScore: number) => {
    setEditingRankings(prev => ({
      ...prev,
      [userId]: { value: currentScore.toString(), isEditing: true, isLoading: false }
    }));
  };

  const cancelEditingRankScore = (userId: string) => {
    setEditingRankings(prev => {
      const { [userId]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateRankScore = async (userId: string, newScore: string) => {
    const numericScore = parseFloat(newScore);
    
    // Validation
    if (isNaN(numericScore) || numericScore < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    setEditingRankings(prev => ({
      ...prev,
      [userId]: { ...prev[userId], isLoading: true }
    }));

    try {
      console.log('Updating ranking for user:', userId, 'with score:', numericScore);
      
      const { error } = await supabase
        .from('user_rankings')
        .update({ 
          rank_score: numericScore,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      console.log('Update result - error:', error);
      
      if (error) {
        console.error('Ranking update error details:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Rank score updated successfully"
      });

      // Remove from editing state
      setEditingRankings(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });

      fetchRankings();
    } catch (error: any) {
      console.error('Ranking update failed:', error);
      
      let errorMessage = "Failed to update rank score";
      
      if (error?.message?.includes('row-level security')) {
        errorMessage = "Permission denied. Admin access required.";
      } else if (error?.message?.includes('invalid input')) {
        errorMessage = "Invalid score value provided.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setEditingRankings(prev => ({
        ...prev,
        [userId]: { ...prev[userId], isLoading: false }
      }));
    }
  };

  const recalculateRankings = async () => {
    try {
      // This would typically involve complex calculations based on user activity
      // For now, we'll just refresh the current rankings
      toast({
        title: "Info",
        description: "Recalculating rankings based on current data..."
      });

      fetchRankings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to recalculate rankings",
        variant: "destructive"
      });
    }
  };

  const createRankingForUser = async (userId: string) => {
    // Validate that userId is a proper UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      toast({
        title: "Error",
        description: "Invalid user ID format. Please provide a valid UUID.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_rankings')
        .upsert({
          user_id: userId,
          total_volume: 0,
          total_transactions: 0,
          rank_score: 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ranking entry created successfully"
      });

      fetchRankings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ranking entry",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const getCurrentRankings = () => {
    switch (activeTab) {
      case "weekly": return weeklyRankings;
      case "daily": return dailyRankings;
      default: return allTimeRankings;
    }
  };

  const filteredRankings = getCurrentRankings().filter(ranking => 
    ranking.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadge = (rank: number | null) => {
    if (!rank) return <Badge variant="secondary">Unranked</Badge>;
    
    if (rank === 1) return <Badge className="bg-yellow-600">🥇 1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">🥈 2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">🥉 3rd</Badge>;
    if (rank <= 10) return <Badge className="bg-blue-600">Top 10</Badge>;
    if (rank <= 50) return <Badge className="bg-green-600">Top 50</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const RankingTable = ({ rankings }: { rankings: UserRanking[] }) => (
    <div 
      className="max-h-96 overflow-y-auto rounded-md border scrollbar-hide" 
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
      }}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Total Volume</TableHead>
            <TableHead>Transactions</TableHead>
            <TableHead>Rank Score</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.map((ranking) => (
            <TableRow key={ranking.id}>
              <TableCell>{getRankBadge(ranking.current_rank)}</TableCell>
              <TableCell className="font-medium">{ranking.username}</TableCell>
              <TableCell>₹{ranking.total_volume.toLocaleString()}</TableCell>
              <TableCell>{ranking.total_transactions}</TableCell>
              <TableCell>
                {editingRankings[ranking.user_id]?.isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editingRankings[ranking.user_id]?.value || ""}
                      onChange={(e) => setEditingRankings(prev => ({
                        ...prev,
                        [ranking.user_id]: { ...prev[ranking.user_id], value: e.target.value }
                      }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateRankScore(ranking.user_id, editingRankings[ranking.user_id]?.value || "0");
                        } else if (e.key === 'Escape') {
                          cancelEditingRankScore(ranking.user_id);
                        }
                      }}
                      onBlur={() => {
                        if (!editingRankings[ranking.user_id]?.isLoading) {
                          updateRankScore(ranking.user_id, editingRankings[ranking.user_id]?.value || "0");
                        }
                      }}
                      className="w-24"
                      step="0.01"
                      min="0"
                      disabled={editingRankings[ranking.user_id]?.isLoading}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateRankScore(ranking.user_id, editingRankings[ranking.user_id]?.value || "0")}
                      disabled={editingRankings[ranking.user_id]?.isLoading}
                      className="h-8 w-8 p-0"
                    >
                      {editingRankings[ranking.user_id]?.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelEditingRankScore(ranking.user_id)}
                      disabled={editingRankings[ranking.user_id]?.isLoading}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 rounded px-2 py-1 min-w-24"
                    onClick={() => startEditingRankScore(ranking.user_id, ranking.rank_score)}
                  >
                    <span className="font-mono">{ranking.rank_score.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to edit
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {new Date(ranking.updated_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchRankings()}
                >
                  Refresh
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            User Ranking Management
          </div>
          <Button onClick={recalculateRankings} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate Rankings
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <Input
              id="search"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-time" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              All Time
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-time">
            <RankingTable rankings={filteredRankings} />
          </TabsContent>

          <TabsContent value="weekly">
            <RankingTable rankings={filteredRankings} />
          </TabsContent>

          <TabsContent value="daily">
            <RankingTable rankings={filteredRankings} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}