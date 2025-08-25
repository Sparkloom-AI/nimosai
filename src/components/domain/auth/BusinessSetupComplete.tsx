
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface BusinessSetupCompleteProps {
  onComplete: () => void;
}

const BusinessSetupComplete: React.FC<BusinessSetupCompleteProps> = ({ onComplete }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        {/* Animated Success Ball */}
        <div className="mb-8 flex justify-center">
          <div 
            className={`w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center transition-all duration-500 ${
              showAnimation 
                ? 'scale-100 opacity-100 animate-[bounce_0.6s_ease-in-out]' 
                : 'scale-0 opacity-0'
            }`}
          >
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Success Message */}
        <div 
          className={`mb-8 transition-all duration-700 delay-300 ${
            showAnimation 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-3xl font-bold mb-2">
            Your business is set up!
          </h1>
        </div>

        {/* Done Button */}
        <div 
          className={`transition-all duration-700 delay-500 ${
            showAnimation 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <Button 
            onClick={onComplete}
            className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetupComplete;
