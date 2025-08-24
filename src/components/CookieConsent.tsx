
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import CookiePreferences from './CookiePreferences';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      strictlyNecessary: true,
      targetedAdvertising: true,
      analytics: true,
    }));
    setShowBanner(false);
  };

  const handleOnlyNecessary = () => {
    localStorage.setItem('cookie-consent', 'necessary-only');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      strictlyNecessary: true,
      targetedAdvertising: false,
      analytics: false,
    }));
    setShowBanner(false);
  };

  const handlePreferences = () => {
    setShowPreferences(true);
  };

  const handlePreferencesClose = () => {
    setShowPreferences(false);
    setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto">
        <Card className="p-4 shadow-lg border">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">Your privacy</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Cookies enable us to enhance your experience by personalizing content and 
            analyzing traffic. You can accept all cookies, allow only essentials ones, or manage 
            your preferences. See our{' '}
            <button className="text-primary underline hover:no-underline">
              cookie policy
            </button>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOnlyNecessary}
              className="flex-1"
            >
              Only necessary
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreferences}
              className="flex-1"
            >
              Preferences
            </Button>
            <Button 
              size="sm" 
              onClick={handleAcceptAll}
              className="flex-1"
            >
              Accept all
            </Button>
          </div>
        </Card>
      </div>

      <CookiePreferences 
        isOpen={showPreferences}
        onClose={handlePreferencesClose}
      />
    </>
  );
};

export default CookieConsent;
