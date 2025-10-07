import { AlertTriangle } from "lucide-react";

const CautionBanner = ({ content, isDanger = false }: { content?: string; isDanger?: boolean }) => {
  const defaultContent = "Contact the Official Customer support using 'Support' icon in Profile page";
  
  return (
    <div className={`${isDanger ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-200'} border-b overflow-hidden`}>
      <div className={`animate-marquee whitespace-nowrap py-1 px-4 ${isDanger ? 'text-red-700' : 'text-red-700'} text-xs flex items-center`}>
        <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
        <span className="mr-8">
          {content || defaultContent}
        </span>
      </div>
    </div>
  );
};

export default CautionBanner;