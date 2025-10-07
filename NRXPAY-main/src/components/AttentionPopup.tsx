import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AttentionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  usdtRate: number;
}

const AttentionPopup = ({ isOpen, onClose, usdtRate }: AttentionPopupProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-sm mx-auto animate-fade-in">
        <AlertDialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <AlertDialogTitle className="text-center text-lg font-bold text-red-600 pt-4">
            ⚠️ Attention
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-base font-bold text-blue-800">
                1 USDT = {usdtRate} INR
              </p>
            </div>
            
            <p className="text-sm font-medium text-orange-600">
              Upload bank accounts manually only on NRX PAY
            </p>
            
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <Button
                onClick={() => window.open('https://t.me/NRXPAYSUPPORT', '_blank')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Contact Telegram Support
              </Button>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AttentionPopup;