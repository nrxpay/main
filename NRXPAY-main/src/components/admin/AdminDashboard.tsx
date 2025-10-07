import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  Building, 
  Trophy, 
  Settings,
  Shield,
  ArrowLeft,
  Heart,
  Lock,
  ArrowUpDown,
  Bell,
  CheckCircle,
  Wallet,
  Sparkles,
  Coins
} from "lucide-react";
import { UserManagement } from "./UserManagement";
import { TransactionManagement } from "./TransactionManagement";
import { USDTRateManagement } from "./USDTRateManagement";
import { CorporateAccountManagement } from "./CorporateAccountManagement";
import { PinManagement } from "./PinManagement";
import { DepositManagement } from "./DepositManagement";
import { WithdrawalManagement } from "./WithdrawalManagement";
import CurrentAccountManagement from "./CurrentAccountManagement";
import { RankingManagement } from "./RankingManagement";
import NotificationSender from "./NotificationSender";
import TaskManagement from "./TaskManagement";
import { FundRateManagement } from "./FundRateManagement";
import MinimumWithdrawalManagement from "./MinimumWithdrawalManagement";
import SpinWheelManagement from "./SpinWheelManagement";
import CryptoManagement from "./CryptoManagement";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-2 animate-pulse">
            <span className="text-sm font-medium text-muted-foreground">Made with love by Nawaj</span>
            <Heart className="h-4 w-4 text-red-500 animate-bounce" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="p-4">
            <div className="space-y-1">
              <Button
                variant={activeTab === "users" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("users")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Users className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">User Management</span>
              </Button>
              
              <Button
                variant={activeTab === "transactions" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("transactions")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Transaction Management</span>
              </Button>
              
              <Button
                variant={activeTab === "deposits" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("deposits")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <DollarSign className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Deposit Management</span>
              </Button>
              
              <Button
                variant={activeTab === "withdrawals" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("withdrawals")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <ArrowUpDown className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Withdrawal Management</span>
              </Button>
              
              <Button
                variant={activeTab === "usdt" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("usdt")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Settings className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">USDT Rate Management</span>
              </Button>
              
              <Button
                variant={activeTab === "fund-rates" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("fund-rates")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <DollarSign className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Fund Rate Management</span>
              </Button>
              
              <Button
                variant={activeTab === "min-withdrawal" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("min-withdrawal")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Wallet className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Minimum Withdrawal</span>
              </Button>
              
              <Button
                variant={activeTab === "corporate" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("corporate")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Building className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Corporate Accounts</span>
              </Button>

              <Button
                variant={activeTab === "current" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("current")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Current Accounts</span>
              </Button>
              
              
              <Button
                variant={activeTab === "pins" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("pins")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Shield className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">PIN Management</span>
              </Button>
              
              
              <Button
                variant={activeTab === "rankings" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("rankings")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Trophy className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Ranking Management</span>
              </Button>
              
              <Button
                variant={activeTab === "tasks" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("tasks")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <CheckCircle className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Task Management</span>
              </Button>
              
              <Button
                variant={activeTab === "notifications" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("notifications")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Bell className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Send Notifications</span>
              </Button>
              
              <Button
                variant={activeTab === "spin-wheel" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("spin-wheel")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Sparkles className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Spin Wheel Management</span>
              </Button>
              
              <Button
                variant={activeTab === "crypto" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("crypto")}
                className="w-full justify-start h-12 px-4 hover:bg-gray-50"
              >
                <Coins className="h-5 w-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Crypto Management</span>
              </Button>
            </div>
          </Card>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionManagement />
          </TabsContent>
          
          <TabsContent value="deposits">
            <DepositManagement />
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <WithdrawalManagement />
          </TabsContent>

          <TabsContent value="usdt">
            <USDTRateManagement />
          </TabsContent>

        <TabsContent value="fund-rates">
          <FundRateManagement />
        </TabsContent>

        <TabsContent value="min-withdrawal">
          <MinimumWithdrawalManagement />
        </TabsContent>

        <TabsContent value="corporate">
            <CorporateAccountManagement />
          </TabsContent>

          <TabsContent value="current">
            <CurrentAccountManagement />
          </TabsContent>


          <TabsContent value="pins">
            <PinManagement />
          </TabsContent>


          <TabsContent value="rankings">
            <RankingManagement />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSender />
          </TabsContent>

          <TabsContent value="spin-wheel">
            <SpinWheelManagement />
          </TabsContent>

          <TabsContent value="crypto">
            <CryptoManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}