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
  { code: 'ID', name: 'Indonesia', phone: '+62', timezone: '(GMT +07:00) Jakarta', currency: 'Indonesian Rupiah - IDR', flag: '🇮🇩', language: 'Indonesia' },
  { code: 'US', name: 'United States', phone: '+1', timezone: '(GMT -05:00) New York', currency: 'US Dollar - USD', flag: '🇺🇸', language: 'English' },
  { code: 'GB', name: 'United Kingdom', phone: '+44', timezone: '(GMT +00:00) London', currency: 'British Pound - GBP', flag: '🇬🇧', language: 'English' },
  { code: 'AU', name: 'Australia', phone: '+61', timezone: '(GMT +10:00) Sydney', currency: 'Australian Dollar - AUD', flag: '🇦🇺', language: 'English' },
  { code: 'DE', name: 'Germany', phone: '+49', timezone: '(GMT +01:00) Berlin', currency: 'Euro - EUR', flag: '🇩🇪', language: 'Deutsch' },
  { code: 'FR', name: 'France', phone: '+33', timezone: '(GMT +01:00) Paris', currency: 'Euro - EUR', flag: '🇫🇷', language: 'français' },
  { code: 'IT', name: 'Italy', phone: '+39', timezone: '(GMT +01:00) Rome', currency: 'Euro - EUR', flag: '🇮🇹', language: 'italiano' },
  { code: 'ES', name: 'Spain', phone: '+34', timezone: '(GMT +01:00) Madrid', currency: 'Euro - EUR', flag: '🇪🇸', language: 'español' },
  { code: 'NL', name: 'Netherlands', phone: '+31', timezone: '(GMT +01:00) Amsterdam', currency: 'Euro - EUR', flag: '🇳🇱', language: 'Nederlands' },
  { code: 'JP', name: 'Japan', phone: '+81', timezone: '(GMT +09:00) Tokyo', currency: 'Japanese Yen - JPY', flag: '🇯🇵', language: '日本語' },
  { code: 'KR', name: 'South Korea', phone: '+82', timezone: '(GMT +09:00) Seoul', currency: 'South Korean Won - KRW', flag: '🇰🇷', language: 'English' },
  { code: 'CN', name: 'China', phone: '+86', timezone: '(GMT +08:00) Beijing', currency: 'Chinese Yuan - CNY', flag: '🇨🇳', language: '中文' },
  { code: 'IN', name: 'India', phone: '+91', timezone: '(GMT +05:30) New Delhi', currency: 'Indian Rupee - INR', flag: '🇮🇳', language: 'English' },
  { code: 'SG', name: 'Singapore', phone: '+65', timezone: '(GMT +08:00) Singapore', currency: 'Singapore Dollar - SGD', flag: '🇸🇬', language: 'English' },
  { code: 'MY', name: 'Malaysia', phone: '+60', timezone: '(GMT +08:00) Kuala Lumpur', currency: 'Malaysian Ringgit - MYR', flag: '🇲🇾', language: 'English' },
  { code: 'TH', name: 'Thailand', phone: '+66', timezone: '(GMT +07:00) Bangkok', currency: 'Thai Baht - THB', flag: '🇹🇭', language: 'English' },
  { code: 'VN', name: 'Vietnam', phone: '+84', timezone: '(GMT +07:00) Ho Chi Minh City', currency: 'Vietnamese Dong - VND', flag: '🇻🇳', language: 'Tiếng Việt' },
  { code: 'PH', name: 'Philippines', phone: '+63', timezone: '(GMT +08:00) Manila', currency: 'Philippine Peso - PHP', flag: '🇵🇭', language: 'English' },
  { code: 'BR', name: 'Brazil', phone: '+55', timezone: '(GMT -03:00) São Paulo', currency: 'Brazilian Real - BRL', flag: '🇧🇷', language: 'português (Brasil)' },
  { code: 'MX', name: 'Mexico', phone: '+52', timezone: '(GMT -06:00) Mexico City', currency: 'Mexican Peso - MXN', flag: '🇲🇽', language: 'español' },
  { code: 'CA', name: 'Canada', phone: '+1', timezone: '(GMT -05:00) Toronto', currency: 'Canadian Dollar - CAD', flag: '🇨🇦', language: 'English' },
  { code: 'RU', name: 'Russia', phone: '+7', timezone: '(GMT +03:00) Moscow', currency: 'Russian Ruble - RUB', flag: '🇷🇺', language: 'русский' },
  { code: 'AR', name: 'Argentina', phone: '+54', timezone: '(GMT -03:00) Buenos Aires', currency: 'Argentine Peso - ARS', flag: '🇦🇷', language: 'español' },
  { code: 'CL', name: 'Chile', phone: '+56', timezone: '(GMT -03:00) Santiago', currency: 'Chilean Peso - CLP', flag: '🇨🇱', language: 'español' },
  { code: 'CO', name: 'Colombia', phone: '+57', timezone: '(GMT -05:00) Bogotá', currency: 'Colombian Peso - COP', flag: '🇨🇴', language: 'español' },
  { code: 'PE', name: 'Peru', phone: '+51', timezone: '(GMT -05:00) Lima', currency: 'Peruvian Sol - PEN', flag: '🇵🇪', language: 'español' },
  { code: 'ZA', name: 'South Africa', phone: '+27', timezone: '(GMT +02:00) Johannesburg', currency: 'South African Rand - ZAR', flag: '🇿🇦', language: 'English' },
  { code: 'EG', name: 'Egypt', phone: '+20', timezone: '(GMT +02:00) Cairo', currency: 'Egyptian Pound - EGP', flag: '🇪🇬', language: 'العربية' },
  { code: 'NG', name: 'Nigeria', phone: '+234', timezone: '(GMT +01:00) Lagos', currency: 'Nigerian Naira - NGN', flag: '🇳🇬', language: 'English' },
  { code: 'KE', name: 'Kenya', phone: '+254', timezone: '(GMT +03:00) Nairobi', currency: 'Kenyan Shilling - KES', flag: '🇰🇪', language: 'English' },
  { code: 'MA', name: 'Morocco', phone: '+212', timezone: '(GMT +00:00) Casablanca', currency: 'Moroccan Dirham - MAD', flag: '🇲🇦', language: 'العربية' },
  { code: 'TR', name: 'Turkey', phone: '+90', timezone: '(GMT +03:00) Istanbul', currency: 'Turkish Lira - TRY', flag: '🇹🇷', language: 'English' },
  { code: 'SA', name: 'Saudi Arabia', phone: '+966', timezone: '(GMT +03:00) Riyadh', currency: 'Saudi Riyal - SAR', flag: '🇸🇦', language: 'العربية' },
  { code: 'AE', name: 'United Arab Emirates', phone: '+971', timezone: '(GMT +04:00) Dubai', currency: 'UAE Dirham - AED', flag: '🇦🇪', language: 'العربية' },
  { code: 'IL', name: 'Israel', phone: '+972', timezone: '(GMT +02:00) Jerusalem', currency: 'Israeli Shekel - ILS', flag: '🇮🇱', language: 'עברית' },
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
      language: country.language
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
        language: country.language,
      }));
    }
  };

  // Get unique currencies for the currency dropdown
  const uniqueCurrencies = Array.from(new Set(countries.map(c => c.currency))).sort();

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
              <Select value={tempSettings.timezone} onValueChange={(value) => setTempSettings(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.timezone}>
                      {country.timezone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <Select value={tempSettings.currency} onValueChange={(value) => setTempSettings(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
