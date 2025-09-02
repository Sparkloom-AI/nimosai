import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchPlacesText, type AddressSuggestion, type PlacesSearchRequest } from '@/lib/googleMapsApi';
import { toast } from 'sonner';

// Re-export the interface for consistency
export type { AddressSuggestion } from '@/lib/googleMapsApi';

// Address data structure expected by parent components (matching existing interface)
interface AddressData {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void;
  placeholder?: string;
  value?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onAddressSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions using Google Places Text Search API
  const fetchSuggestions = async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('AddressAutocomplete: Fetching suggestions for:', input);
      
      const request: PlacesSearchRequest = {
        textQuery: input.trim()
      };

      const results = await searchPlacesText(request);
      console.log('AddressAutocomplete: Received suggestions:', results.length);
      
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('AddressAutocomplete: Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      toast.error('Failed to search addresses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Parse suggestion to AddressData (simplified since we don't have detailed place info)
  const parseAddressSuggestionToAddressData = (suggestion: AddressSuggestion): AddressData => {
    console.log('AddressAutocomplete: Parsing suggestion:', suggestion);
    
    // Extract basic info from the description
    const parts = suggestion.description.split(', ');
    const streetAddress = suggestion.structured_formatting.main_text || parts[0] || '';
    const remainingParts = parts.slice(1);
    
    // Try to identify city, state, country from remaining parts
    let city = '';
    let state = '';
    let country = '';
    let postalCode = '';
    
    if (remainingParts.length > 0) {
      // Last part is often country
      country = remainingParts[remainingParts.length - 1] || '';
      
      // Second to last might be state/region
      if (remainingParts.length > 1) {
        state = remainingParts[remainingParts.length - 2] || '';
      }
      
      // Earlier parts might be city
      if (remainingParts.length > 2) {
        city = remainingParts.slice(0, -2).join(', ');
      } else if (remainingParts.length === 2) {
        city = remainingParts[0] || '';
      }
    }

    const addressData: AddressData = {
      place_id: suggestion.place_id,
      address: streetAddress,
      city,
      state,
      postal_code: postalCode,
      country,
      latitude: 0, // Note: Text Search API doesn't provide coordinates in this simplified version
      longitude: 0,
    };

    console.log('AddressAutocomplete: Parsed address data:', addressData);
    return addressData;
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    console.log('AddressAutocomplete: Suggestion selected:', suggestion);
    
    setQuery(suggestion.description);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setIsLoading(true);

    try {
      const addressData = parseAddressSuggestionToAddressData(suggestion);
      console.log('AddressAutocomplete: Calling onAddressSelect with:', addressData);
      onAddressSelect(addressData);
    } catch (error) {
      console.error('AddressAutocomplete: Error processing selected address:', error);
      toast.error('Failed to process selected address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced input change handler
  let debounceTimer: NodeJS.Timeout;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous timer
    clearTimeout(debounceTimer);
    
    // Set new timer
    debounceTimer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Handle blur with delay to allow clicks
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

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
          placeholder="Start typing an address..."
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
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {query.length >= 3 && !isLoading && suggestions.length === 0 && showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          <div className="p-4 text-center text-muted-foreground">
            <MapPin className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No addresses found</p>
            <p className="text-xs">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
};