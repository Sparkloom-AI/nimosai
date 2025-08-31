// Google Maps API utilities
export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}

let googleMapsPromise: Promise<void> | null = null;

export const loadGoogleMapsAPI = (config: GoogleMapsConfig): Promise<void> => {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create callback function
    const callbackName = `initGoogleMaps_${Date.now()}`;
    (window as any)[callbackName] = () => {
      resolve();
      delete (window as any)[callbackName];
    };

    // Create script element
    const script = document.createElement('script');
    const libraries = config.libraries.join(',');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${libraries}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export const resetGoogleMapsAPI = () => {
  googleMapsPromise = null;
};

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface PlaceGeometry {
  location: {
    lat(): number;
    lng(): number;
  };
  viewport?: any;
}

export interface PlaceDetails {
  place_id?: string;
  formatted_address?: string;
  address_components?: AddressComponent[];
  geometry?: PlaceGeometry;
  name?: string;
}

export const parseAddressComponents = (components: AddressComponent[]) => {
  const result = {
    street_number: '',
    route: '',
    locality: '',
    administrative_area_level_1: '',
    postal_code: '',
    country: ''
  };

  components.forEach(component => {
    const type = component.types[0];
    switch (type) {
      case 'street_number':
        result.street_number = component.long_name;
        break;
      case 'route':
        result.route = component.long_name;
        break;
      case 'locality':
        result.locality = component.long_name;
        break;
      case 'administrative_area_level_1':
        result.administrative_area_level_1 = component.short_name;
        break;
      case 'postal_code':
        result.postal_code = component.long_name;
        break;
      case 'country':
        result.country = component.short_name;
        break;
    }
  });

  return result;
};

export const formatAddress = (components: ReturnType<typeof parseAddressComponents>) => {
  const { street_number, route, locality, administrative_area_level_1, postal_code } = components;
  const street = [street_number, route].filter(Boolean).join(' ');
  
  return {
    address: street,
    city: locality,
    state: administrative_area_level_1,
    postal_code: postal_code,
    country: components.country
  };
};