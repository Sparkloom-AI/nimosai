import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

interface LocationSettingsProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
}

const countries = [
  { code: 'ID', name: 'Indonesia', phone: '+62', timezone: '(GMT +07:00) Jakarta', currency: 'Indonesian Rupiah - IDR', flag: '🇮🇩' },
  { code: 'US', name: 'United States', phone: '+1', timezone: '(GMT -05:00) New York', currency: 'US Dollar - USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', phone: '+44', timezone: '(GMT +00:00) London', currency: 'British Pound - GBP', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', phone: '+61', timezone: '(GMT +10:00) Sydney', currency: 'Australian Dollar - AUD', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', phone: '+49', timezone: '(GMT +01:00) Berlin', currency: 'Euro - EUR', flag: '🇩🇪' },
  { code: 'FR', name: 'France', phone: '+33', timezone: '(GMT +01:00) Paris', currency: 'Euro - EUR', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', phone: '+39', timezone: '(GMT +01:00) Rome', currency: 'Euro - EUR', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', phone: '+34', timezone: '(GMT +01:00) Madrid', currency: 'Euro - EUR', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', phone: '+31', timezone: '(GMT +01:00) Amsterdam', currency: 'Euro - EUR', flag: '🇳🇱' },
  { code: 'JP', name: 'Japan', phone: '+81', timezone: '(GMT +09:00) Tokyo', currency: 'Japanese Yen - JPY', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', phone: '+82', timezone: '(GMT +09:00) Seoul', currency: 'South Korean Won - KRW', flag: '🇰🇷' },
  { code: 'CN', name: 'China', phone: '+86', timezone: '(GMT +08:00) Beijing', currency: 'Chinese Yuan - CNY', flag: '🇨🇳' },
  { code: 'IN', name: 'India', phone: '+91', timezone: '(GMT +05:30) New Delhi', currency: 'Indian Rupee - INR', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', phone: '+65', timezone: '(GMT +08:00) Singapore', currency: 'Singapore Dollar - SGD', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', phone: '+60', timezone: '(GMT +08:00) Kuala Lumpur', currency: 'Malaysian Ringgit - MYR', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', phone: '+66', timezone: '(GMT +07:00) Bangkok', currency: 'Thai Baht - THB', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', phone: '+84', timezone: '(GMT +07:00) Ho Chi Minh City', currency: 'Vietnamese Dong - VND', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', phone: '+63', timezone: '(GMT +08:00) Manila', currency: 'Philippine Peso - PHP', flag: '🇵🇭' },
  { code: 'BR', name: 'Brazil', phone: '+55', timezone: '(GMT -03:00) São Paulo', currency: 'Brazilian Real - BRL', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', phone: '+52', timezone: '(GMT -06:00) Mexico City', currency: 'Mexican Peso - MXN', flag: '🇲🇽' },
  { code: 'CA', name: 'Canada', phone: '+1', timezone: '(GMT -05:00) Toronto', currency: 'Canadian Dollar - CAD', flag: '🇨🇦' },
];

const languages = [
  { code: 'bg', name: 'български', flag: '🇧🇬' },
  { code: 'cs', name: 'čeština', flag: '🇨🇿' },
  { code: 'da', name: 'dansk', flag: '🇩🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'español', flag: '🇪🇸' },
  { code: 'fi', name: 'suomi', flag: '🇫🇮' },
  { code: 'fr', name: 'français', flag: '🇫🇷' },
  { code: 'hr', name: 'hrvatski', flag: '🇭🇷' },
  { code: 'hu', name: 'magyar', flag: '🇭🇺' },
  { code: 'it', name: 'italiano', flag: '🇮🇹' },
  { code: 'nb', name: 'norsk bokmål', flag: '🇳🇴' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'polski', flag: '🇵🇱' },
  { code: 'pt', name: 'português (Brasil)', flag: '🇧🇷' },
  { code: 'ro', name: 'română', flag: '🇷🇴' },
  { code: 'sv', name: 'svenska', flag: '🇸🇪' },
  { code: 'ru', name: 'русский', flag: '🇷🇺' },
  { code: 'uk', name: 'українська', flag: '🇺🇦' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'sl', name: 'slovenščina', flag: '🇸🇮' },
  { code: 'lt', name: 'lietuvių', flag: '🇱🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const detectLocationFromTimezone = (): LocationData => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const timezoneCountryMap: { [key: string]: string } = {
    'Asia/Jakarta': 'ID',
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'Europe/London': 'GB',
    'Australia/Sydney': 'AU',
    'Europe/Berlin': 'DE',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Amsterdam': 'NL',
    'Asia/Tokyo': 'JP',
    'Asia/Seoul': 'KR',
    'Asia/Shanghai': 'CN',
    'Asia/Kolkata': 'IN',
    'Asia/Singapore': 'SG',
    'Asia/Kuala_Lumpur': 'MY',
    'Asia/Bangkok': 'TH',
    'Asia/Ho_Chi_Minh': 'VN',
    'Asia/Manila': 'PH',
    'America/Sao_Paulo': 'BR',
    'America/Mexico_City': 'MX',
    'America/Toronto': 'CA',
  };

  const detectedCountryCode = timezoneCountryMap[timezone] || '';
  const country = countries.find(c => c.code === detectedCountryCode);
  
  if (country) {
    return {
      country: country.name,
      countryCode: country.code,
      phonePrefix: country.phone,
      timezone: country.timezone,
      currency: country.currency,
      language: 'English'
    };
  }

  return {
    country: '',
    countryCode: '',
    phonePrefix: '',
    timezone: '',
    currency: '',
    language: 'English'
  };
};

export const LocationSettings: React.FC<LocationSettingsProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(value);

  useEffect(() => {
    if (!value.country) {
      const detected = detectLocationFromTimezone();
      onChange(detected);
    }
  }, []);

  const handleSave = () => {
    onChange(tempSettings);
    setIsOpen(false);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setTempSettings(prev => ({
        ...prev,
        country: country.name,
        countryCode: country.code,
        phonePrefix: country.phone,
        timezone: country.timezone,
        currency: country.currency,
      }));
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <span>{value.country || 'Select country'}</span>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="link" className="text-primary p-0 h-auto">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="country" className="text-sm font-medium">Country</Label>
              <Select value={tempSettings.countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone" className="text-sm font-medium">Time zone</Label>
              <div className="p-2 border rounded-md bg-muted text-sm">
                {tempSettings.timezone || 'Select country first'}
              </div>
            </div>

            <div>
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <div className="p-2 border rounded-md bg-muted text-sm">
                {tempSettings.currency || 'Select country first'}
              </div>
            </div>

            <div>
              <Label htmlFor="language" className="text-sm font-medium">Language</Label>
              <Select value={tempSettings.language} onValueChange={(value) => setTempSettings(prev => ({ ...prev, language: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.name}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { detectLocationFromTimezone };
