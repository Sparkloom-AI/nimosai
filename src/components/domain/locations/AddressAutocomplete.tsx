import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { loadGoogleMapsAPI, parseAddressComponents, formatAddress, type PlaceDetails } from '@/lib/googleMaps';
import { toast } from 'sonner';
import '@/types/google-maps';

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
  place_id?: string;
  latitude?: number;
  longitude?: number;
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
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  // Load Google Maps API on component mount
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        // Use environment variable for API key in real implementation
        const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // This would come from Supabase secrets in edge function
        
        await loadGoogleMapsAPI({
          apiKey,
          libraries: ['places']
        });

        if (window.google?.maps?.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          
          // Create a hidden div for PlacesService (required by Google Maps API)
          const hiddenDiv = document.createElement('div');
          placesServiceRef.current = new window.google.maps.places.PlacesService(hiddenDiv);
        }
        
        setIsGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        toast.error('Failed to load address autocomplete. Please enter address manually.');
      }
    };

    initGoogleMaps();
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!isGoogleMapsLoaded || !autocompleteServiceRef.current) {
      // Fallback to manual entry
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const request = {
        input,
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'us' }, // Restrict to US for business addresses
      };

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions: any, status: any) => {
        if (status === 'OK' && predictions) {
          const formattedSuggestions: AddressSuggestion[] = predictions.map(prediction => ({
            place_id: prediction.place_id,
            description: prediction.description,
            structured_formatting: {
              main_text: prediction.structured_formatting?.main_text || prediction.description,
              secondary_text: prediction.structured_formatting?.secondary_text || ''
            }
          }));
          
          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const getPlaceDetails = (placeId: string): Promise<PlaceDetails> => {
    return new Promise((resolve, reject) => {
      if (!placesServiceRef.current) {
        reject(new Error('Places service not available'));
        return;
      }

      const request = {
        placeId,
        fields: ['place_id', 'formatted_address', 'address_components', 'geometry', 'name']
      };

      placesServiceRef.current.getDetails(request, (place: any, status: any) => {
        if (status === 'OK' && place) {
          resolve(place);
        } else {
          reject(new Error(`Failed to get place details: ${status}`));
        }
      });
    });
  };

  const parseGooglePlaceToAddressData = async (placeId: string): Promise<AddressData> => {
    try {
      const place = await getPlaceDetails(placeId);
      
      if (!place.address_components) {
        throw new Error('No address components found');
      }

      const components = parseAddressComponents(place.address_components);
      const formattedAddress = formatAddress(components);

      return {
        ...formattedAddress,
        place_id: place.place_id,
        latitude: place.geometry?.location.lat(),
        longitude: place.geometry?.location.lng()
      };
    } catch (error) {
      console.error('Error parsing place details:', error);
      throw error;
    }
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

  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    
    try {
      const addressData = await parseGooglePlaceToAddressData(suggestion.place_id);
      onAddressSelect(addressData);
    } catch (error) {
      console.error('Error getting address details:', error);
      toast.error('Failed to get address details. Please try again.');
    }
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