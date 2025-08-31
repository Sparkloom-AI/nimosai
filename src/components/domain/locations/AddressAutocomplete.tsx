import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressData {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void;
  placeholder?: string;
  value?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  placeholder = "Start typing an address...",
  value: initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock Google Places API response for demo
  const mockSuggestions: AddressSuggestion[] = [
    {
      place_id: '1',
      description: '123 Main Street, New York, NY, USA',
      structured_formatting: {
        main_text: '123 Main Street',
        secondary_text: 'New York, NY, USA'
      }
    },
    {
      place_id: '2', 
      description: '456 Business Ave, Los Angeles, CA, USA',
      structured_formatting: {
        main_text: '456 Business Ave',
        secondary_text: 'Los Angeles, CA, USA'
      }
    },
    {
      place_id: '3',
      description: '789 Studio Blvd, Miami, FL, USA',
      structured_formatting: {
        main_text: '789 Studio Blvd',
        secondary_text: 'Miami, FL, USA'
      }
    }
  ];

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter mock suggestions based on input
    const filtered = mockSuggestions.filter(suggestion =>
      suggestion.description.toLowerCase().includes(input.toLowerCase())
    );

    setSuggestions(filtered);
    setIsLoading(false);
    setShowSuggestions(true);
  };

  const parseAddress = (description: string): AddressData => {
    // Simple parsing logic for demo - in real implementation, 
    // you'd use Google Places Details API to get structured address
    const parts = description.split(', ');
    
    return {
      address: parts[0] || '',
      city: parts[1] || '',
      state: parts[2]?.split(' ')[0] || '',
      postal_code: parts[2]?.split(' ')[1] || '',
      country: parts[3] || 'US'
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    
    const addressData = parseAddress(suggestion.description);
    onAddressSelect(addressData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          <div className="p-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                className={`px-3 py-2 cursor-pointer rounded-sm transition-colors ${
                  index === selectedIndex 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {query.length >= 3 && !isLoading && suggestions.length === 0 && showSuggestions && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <div className="p-4 text-center text-muted-foreground">
            <MapPin className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No addresses found</p>
            <p className="text-xs">Try a different search term</p>
          </div>
        </Card>
      )}
    </div>
  );
};