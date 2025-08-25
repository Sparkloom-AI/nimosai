
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface BusinessSetupCompleteProps {
  onComplete: () => void;
  isLoading?: boolean;
}

const BusinessSetupComplete: React.FC<BusinessSetupCompleteProps> = ({ 
  onComplete, 
  isLoading = false 
}) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">
              All set! You're ready to go
            </h1>
            <p className="text-muted-foreground text-lg">
              Your studio is being set up. You'll have full access to manage your business, team, and appointments through WhatsApp.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-left">
              <h3 className="font-semibold mb-2">What's next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Add your team members and services</li>
                <li>• Set up your business hours and locations</li>
                <li>• Start accepting bookings through WhatsApp</li>
              </ul>
            </div>

            <Button 
              onClick={onComplete} 
              className="w-full h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up your studio...
                </>
              ) : (
                'Go to Dashboard'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block flex-1 bg-muted relative overflow-hidden">
        <img
          src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png"
          alt="Professional using Nimos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Nimos</h2>
          <p className="text-white/90 text-lg">
            Your WhatsApp-first studio management platform is ready to transform how you connect with clients
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetupComplete;
