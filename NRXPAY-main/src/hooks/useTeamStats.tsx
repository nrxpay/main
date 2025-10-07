import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TeamStats {
  team_members: number;
  total_earned: number;
  direct_referrals: number;
}

export const useTeamStats = () => {
  const { user } = useAuth();
  const [teamStats, setTeamStats] = useState<TeamStats>({ 
    team_members: 0, 
    total_earned: 0,
    direct_referrals: 0 
  });
  const [loading, setLoading] = useState(true);

  const fetchTeamStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_stats')
        .select('team_members, total_earned, direct_referrals')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setTeamStats(data);
      } else {
        // Create initial team stats for new user
        const { error: insertError } = await supabase
          .from('team_stats')
          .insert({
            user_id: user.id,
            team_members: 0,
            total_earned: 0,
            direct_referrals: 0
          });

        if (insertError) throw insertError;
        
        setTeamStats({ team_members: 0, total_earned: 0, direct_referrals: 0 });
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTeamStats = async (updates: Partial<TeamStats>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('team_stats')
        .upsert({ 
          user_id: user.id,
          ...updates 
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setTeamStats(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error('Error updating team stats:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchTeamStats();
  }, [user?.id]);

  return { teamStats, loading, updateTeamStats, refetch: fetchTeamStats };
};