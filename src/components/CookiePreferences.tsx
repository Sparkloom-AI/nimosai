
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

interface CookiePreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CookieSettings {
  strictlyNecessary: boolean;
  targetedAdvertising: boolean;
  analytics: boolean;
}

const CookiePreferences = ({ isOpen, onClose }: CookiePreferencesProps) => {
  const [settings, setSettings] = useState<CookieSettings>({
    strictlyNecessary: true,
    targetedAdvertising: false,
    analytics: false,
  });

  useEffect(() => {
    // Load existing preferences from localStorage
    const savedSettings = localStorage.getItem('cookie-preferences');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    // Save preferences to localStorage
    localStorage.setItem('cookie-preferences', JSON.stringify(settings));
    localStorage.setItem('cookie-consent', 'preferences-set');
    onClose();
  };

  const handleToggle = (key: keyof CookieSettings) => {
    if (key === 'strictlyNecessary') return; // Cannot be disabled
    
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Cookie Preferences
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            You can choose which cookies you're comfortable with us using. If you want more detail on the cookies we use, you can view a full list in our{' '}
            <Link 
              to="/cookie-policy" 
              className="text-primary underline hover:no-underline"
              onClick={onClose}
            >
              cookie policy
            </Link>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            {/* Strictly Necessary */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Strictly necessary</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Essential for basic functionality and cannot be disabled.
                </p>
              </div>
              <Switch 
                checked={settings.strictlyNecessary}
                disabled
                className="mt-0.5"
              />
            </div>

            {/* Targeted Advertising */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Targeted advertising</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Allows us and third parties to serve relevant ads.
                </p>
              </div>
              <Switch 
                checked={settings.targetedAdvertising}
                onCheckedChange={() => handleToggle('targetedAdvertising')}
                className="mt-0.5"
              />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Analytics</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Helps us monitor web traffic to improve services.
                </p>
              </div>
              <Switch 
                checked={settings.analytics}
                onCheckedChange={() => handleToggle('analytics')}
                className="mt-0.5"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookiePreferences;
