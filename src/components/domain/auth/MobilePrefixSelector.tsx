import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { countries } from '@/hooks/useIPLocationDetection';

interface MobilePrefixSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const MobilePrefixSelector: React.FC<MobilePrefixSelectorProps> = ({
  value,
  onValueChange,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Create unique phone prefixes with country info
  const phoneOptions = useMemo(() => {
    const uniquePrefixes = new Map();
    
    countries.forEach(country => {
      const key = country.phone;
      if (!uniquePrefixes.has(key)) {
        uniquePrefixes.set(key, []);
      }
      uniquePrefixes.get(key).push(country);
    });

    return Array.from(uniquePrefixes.entries()).map(([phone, countryList]) => {
      // If multiple countries share the same prefix, show the primary one
      const primaryCountry = countryList[0];
      const additionalCountries = countryList.slice(1);
      
      return {
        phone,
        country: primaryCountry,
        additionalCountries,
        searchText: `${primaryCountry.name} ${phone} ${countryList.map(c => c.name).join(' ')}`
      };
    }).sort((a, b) => {
      // Sort by phone number numerically
      const aNum = parseInt(a.phone.replace('+', ''));
      const bNum = parseInt(b.phone.replace('+', ''));
      return aNum - bNum;
    });
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return phoneOptions;
    
    return phoneOptions.filter(option =>
      option.searchText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.phone.includes(searchQuery)
    );
  }, [phoneOptions, searchQuery]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-32 ${className}`}>
        <span className="font-mono text-sm">
          {value || "+1"}
        </span>
      </SelectTrigger>
      <SelectContent className="w-80">
        <div className="flex items-center border-b px-3 pb-2 mb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search country or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <SelectItem key={option.phone} value={option.phone} className="flex items-center py-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span className="text-lg mr-3">{option.country.flag}</span>
                  <div>
                    <div className="font-medium">{option.country.name}</div>
                    {option.additionalCountries.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{option.additionalCountries.map(c => c.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-mono text-sm font-medium text-primary">
                  {option.phone}
                </div>
              </div>
            </SelectItem>
          ))}
        </div>
        {filteredOptions.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No countries found
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
