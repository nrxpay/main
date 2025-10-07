import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InsufficientRechargeMessageProps {
  accountType: 'savings' | 'current' | 'corporate';
}

const InsufficientRechargeMessage = ({ accountType }: InsufficientRechargeMessageProps) => {
  const navigate = useNavigate();

  const getRechargeAmount = () => {
    switch (accountType) {
      case 'savings':
        return '$300';
      case 'current':
        return '$700';
      case 'corporate':
        return '$2000';
      default:
        return '$0';
    }
  };

  const getAccountDisplayName = () => {
    switch (accountType) {
      case 'savings':
        return 'Savings';
      case 'current':
        return 'Current';
      case 'corporate':
        return 'Corporate';
      default:
        return '';
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="h-12 w-12 text-orange-500" />
          <div>
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              Insufficient Recharge
            </h3>
            <p className="text-orange-700 mb-4">
              You need to recharge {getRechargeAmount()} to access your {getAccountDisplayName()} account features.
            </p>
            <Button 
              onClick={() => navigate("/recharge")}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Recharge Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsufficientRechargeMessage;