
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Country codes with flags and phone prefixes
const countryCodes = [
  { country: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { country: 'United States', code: '+1', flag: '🇺🇸' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { country: 'Germany', code: '+49', flag: '🇩🇪' },
  { country: 'France', code: '+33', flag: '🇫🇷' },
  { country: 'Australia', code: '+61', flag: '🇦🇺' },
  { country: 'Canada', code: '+1', flag: '🇨🇦' },
  { country: 'Singapore', code: '+65', flag: '🇸🇬' },
  { country: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { country: 'Japan', code: '+81', flag: '🇯🇵' },
  { country: 'South Korea', code: '+82', flag: '🇰🇷' },
  { country: 'China', code: '+86', flag: '🇨🇳' },
  { country: 'India', code: '+91', flag: '🇮🇳' },
  { country: 'Thailand', code: '+66', flag: '🇹🇭' },
  { country: 'Vietnam', code: '+84', flag: '🇻🇳' },
  { country: 'Philippines', code: '+63', flag: '🇵🇭' },
  { country: 'Brazil', code: '+55', flag: '🇧🇷' },
  { country: 'Mexico', code: '+52', flag: '🇲🇽' },
  { country: 'Russia', code: '+7', flag: '🇷🇺' },
  { country: 'South Africa', code: '+27', flag: '🇿🇦' },
];

interface MobilePrefixSelectorProps {
  value: string;
  onChange: (value: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
}

export const MobilePrefixSelector: React.FC<MobilePrefixSelectorProps> = ({
  value,
  onChange,
  phoneNumber,
  onPhoneNumberChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countryCodes.filter(
    country =>
      country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
  );

  return (
    <div>
      <label htmlFor="mobile" className="block text-sm font-medium mb-2">
        Mobile number
      </label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-24 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>
            {filteredCountries.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                <span className="flex items-center gap-2">
                  <span>{item.flag}</span>
                  <span>{item.code}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.country}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id="mobile"
          type="tel"
          placeholder="Enter your mobile number"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          className="flex-1 h-12"
        />
      </div>
    </div>
  );
};
