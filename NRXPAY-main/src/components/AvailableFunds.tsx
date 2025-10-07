import { Card } from "@/components/ui/card";

const AvailableFunds = () => {
  return (
    <Card className="p-6 space-y-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <h3 className="text-lg font-semibold text-emerald-800">💰 Available Funds are :-</h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-sm text-emerald-800">Gaming fund</p>
            <p className="text-xs text-emerald-600">Safe 5% • Less safe 7.5%</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-sm text-emerald-800">Stock fund</p>
            <p className="text-xs text-emerald-600">Safe 13% </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AvailableFunds;