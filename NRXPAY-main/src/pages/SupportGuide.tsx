import { ArrowLeft, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
const SupportGuide = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Contact Customer Support</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-center mb-4">🤝 Getting Help & Support</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                💬 Live Chat Support
              </h3>
              <p className="text-sm text-blue-700 mb-2">Get instant help through our live chat feature.</p>
              <p className="text-xs text-blue-600">Available: 24/7 | Response time: 2-5 minutes</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                💬 WhatsApp Support
              </h3>
              <p className="text-sm text-green-700 mb-3">Chat with us directly on WhatsApp for instant support.</p>
              <Button
                onClick={() => window.open('https://wa.me/18454405052', '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white mb-2"
              >
                Chat on WhatsApp: +1 8454405052
              </Button>
              <p className="text-xs text-green-600">Available: 24/7 | Quick response guaranteed</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                📧 Email Support
              </h3>
              <p className="text-sm text-purple-700 mb-2">Send detailed queries via email.</p>
              <p className="text-sm font-medium text-purple-800">📬 support@nrxpay.com</p>
              <p className="text-xs text-purple-600">Response time: 4-6 hours</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                🚀 Telegram Support
              </h3>
              <p className="text-sm text-orange-700 mb-3">Get instant help through our official Telegram support.</p>
              <Button
                onClick={() => window.open('https://t.me/NRXPAYSUPPORT', '_blank')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-2"
              >
                Contact @NRXPAYSUPPORT
              </Button>
              <p className="text-xs text-orange-600">Please use English to communicate and Hindi users must use Phone/In App-Support for help.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Before Contacting Support:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check FAQ section for common solutions</li>
              <li>• Have your User ID ready</li>
              <li>• Describe your issue clearly</li>
              <li>• Include screenshots if needed</li>
              <li>• Mention transaction IDs for payment issues</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>;
};
export default SupportGuide;