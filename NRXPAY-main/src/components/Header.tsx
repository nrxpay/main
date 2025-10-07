import { Bell, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CautionBanner from "./CautionBanner";

const Header = ({ showCaution = true, cautionContent, isDanger = false }: { showCaution?: boolean; cautionContent?: string; isDanger?: boolean }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold">NRX PAY</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/bonus-checklist")}
          >
            <CheckSquare className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {showCaution && <CautionBanner content={cautionContent} isDanger={isDanger} />}
    </header>
  );
};

export default Header;