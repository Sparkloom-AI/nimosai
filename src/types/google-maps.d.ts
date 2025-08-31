// Google Maps API type definitions for the application
declare global {
  interface Window {
    google?: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: any);
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: {
            input: string;
            types?: string[];
            componentRestrictions?: { country: string };
          },
          callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLElement);
        getDetails(
          request: {
            placeId: string;
            fields: string[];
          },
          callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void
        ): void;
      }

      interface AutocompletePrediction {
        place_id: string;
        description: string;
        structured_formatting?: {
          main_text: string;
          secondary_text: string;
        };
      }

      interface PlaceResult {
        place_id?: string;
        formatted_address?: string;
        address_components?: AddressComponent[];
        geometry?: PlaceGeometry;
        name?: string;
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }

      interface PlaceGeometry {
        location: LatLng;
        viewport?: LatLngBounds;
      }

      class LatLng {
        lat(): number;
        lng(): number;
      }

      class LatLngBounds {}

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR'
      }
    }
  }
}

export {};