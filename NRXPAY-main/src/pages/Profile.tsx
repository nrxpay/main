import { User, RotateCcw, Edit, HelpCircle, Lock, Coins, Gamepad2, Star, Shield, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import CautionBanner from "@/components/CautionBanner";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();
  const [userNumber, setUserNumber] = useState<string>("000000");
  
  useEffect(() => {
    const fetchUserNumber = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_data')
            .select('user_number')
            .eq('user_id', user.id)
            .single();
          
          if (data && !error) {
            setUserNumber(data.user_number);
          }
        } catch (error) {
          console.error('Failed to fetch user number:', error);
        }
      }
    };
    
    fetchUserNumber();
  }, [user?.id]);
  
  const userInfo = {
    name: user?.user_metadata?.username || "User",
    userId: userNumber,
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };

  const actionButtons = [
    { icon: RotateCcw, label: "Reset", color: "bg-red-100 text-red-600", action: () => {} },
    { icon: Edit, label: "Edit", color: "bg-blue-100 text-blue-600", action: () => navigate("/edit-profile") },
    { icon: HelpCircle, label: "Support", color: "bg-green-100 text-green-600", action: () => navigate("/support-guide") },
  ];

  const profileOptions = [
    { icon: Lock, label: "Security PIN", action: () => navigate("/set-pin") },
    { icon: Coins, label: "Coin Flip", action: () => navigate("/coin-flip") },
    { icon: Star, label: "Lucky Draw", action: () => navigate("/lucky-draw") },
    { icon: Shield, label: "Spin Wheel", action: () => navigate("/spin-wheel") },
    { icon: Settings, label: "Account Settings", action: () => navigate("/edit-profile") },
    { icon: HelpCircle, label: "Customer Support", action: () => navigate("/support-guide") },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <Header />
      
      <main className="px-4 py-6 space-y-6 animate-slide-up">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="w-20 h-20 mx-auto">
            <AvatarFallback className="text-2xl neon-gradient text-white">
              <User className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-bold">{userInfo.name}</h2>
            <p className="text-muted-foreground">User ID: {userInfo.userId}</p>
          </div>
        </div>

        {/* Profile Options List */}
        <Card className="p-4">
          <div className="space-y-1">
            {profileOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={option.action}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <option.icon className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">{option.label}</span>
              </Button>
            ))}
            
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="w-full justify-start h-12 px-4 hover:bg-blue-50 text-blue-600"
              >
                <Settings className="h-5 w-5 mr-3 text-blue-600" />
                <span className="text-sm font-medium">Access Admin Panel</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start h-12 px-4 hover:bg-red-50 text-red-600"
            >
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;