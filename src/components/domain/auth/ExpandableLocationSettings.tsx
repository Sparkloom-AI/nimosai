
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { countries, timezones, currencies, languages } from '@/hooks/useIPLocationDetection';

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

interface ExpandableLocationSettingsProps {
  locationData: LocationData;
  onLocationDataChange: (data: LocationData) => void;
}

export const ExpandableLocationSettings: React.FC<ExpandableLocationSettingsProps> = ({
  locationData,
  onLocationDataChange
}) => {
  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      onLocationDataChange({
        country: country.name,
        countryCode: country.code,
        phonePrefix: country.phone,
        timezone: country.timezone,
        currency: country.currency,
        language: country.language,
      });
    }
  };

  const handleTimezoneChange = (timezone: string) => {
    onLocationDataChange({
      ...locationData,
      timezone
    });
  };

  const handleCurrencyChange = (currency: string) => {
    onLocationDataChange({
      ...locationData,
      currency
    });
  };

  const handleLanguageChange = (language: string) => {
    onLocationDataChange({
      ...locationData,
      language
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div>
        <Label htmlFor="location-country" className="text-sm font-medium mb-2 block">
          Country
        </Label>
        <Select value={locationData.countryCode} onValueChange={handleCountryChange}>
          <SelectTrigger id="location-country" className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span>{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location-timezone" className="text-sm font-medium mb-2 block">
          Time zone
        </Label>
        <Select value={locationData.timezone} onValueChange={handleTimezoneChange}>
          <SelectTrigger id="location-timezone" className="w-full">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {timezones.map((timezone) => (
              <SelectItem key={timezone} value={timezone}>
                {timezone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location-currency" className="text-sm font-medium mb-2 block">
          Currency
        </Label>
        <Select value={locationData.currency} onValueChange={handleCurrencyChange}>
          <SelectTrigger id="location-currency" className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {currencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location-language" className="text-sm font-medium mb-2 block">
          Language
        </Label>
        <Select value={locationData.language} onValueChange={handleLanguageChange}>
          <SelectTrigger id="location-language" className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.name}>
                <div className="flex items-center">
                  <span className="text-lg mr-2">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
