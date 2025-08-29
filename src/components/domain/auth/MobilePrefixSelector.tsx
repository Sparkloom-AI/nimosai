
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

  // Create individual entries for each country
  const countryOptions = useMemo(() => {
    return countries.map(country => ({
      phone: country.phone,
      flag: country.flag,
      name: country.name,
      code: country.code,
      searchText: `${country.name} ${country.phone} ${country.code}`
    })).sort((a, b) => {
      // Sort by phone number numerically, then by country name
      const aNum = parseInt(a.phone.replace('+', ''));
      const bNum = parseInt(b.phone.replace('+', ''));
      if (aNum === bNum) {
        return a.name.localeCompare(b.name);
      }
      return aNum - bNum;
    });
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return countryOptions;
    
    return countryOptions.filter(option =>
      option.searchText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.phone.includes(searchQuery)
    );
  }, [countryOptions, searchQuery]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-24 flex-shrink-0 ${className}`}>
        <span className="font-mono text-sm">
          {value || "+62"}
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
          {filteredOptions.map((option, index) => (
            <SelectItem key={`${option.phone}-${option.code}-${index}`} value={option.phone} className="flex items-center py-2">
              <div className="flex items-center">
                <span className="text-lg mr-2">{option.flag}</span>
                <span className="font-mono text-sm font-medium text-primary mr-2">
                  {option.phone}
                </span>
                <span className="font-medium">{option.name}</span>
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
