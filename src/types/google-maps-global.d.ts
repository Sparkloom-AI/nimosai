// Global Google Maps API type definitions
declare global {
  interface Window {
    google?: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: any);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
    }
    
    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng | undefined;
      addListener(eventName: string, handler: Function): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
      setContent(content: string): void;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      draggable?: boolean;
      icon?: any;
    }

    interface InfoWindowOptions {
      content?: string;
    }

    namespace SymbolPath {
      const CIRCLE: any;
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: {
            input: string;
            types?: string[];
            componentRestrictions?: { country: string };
          },
          callback: (predictions: any, status: any) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLElement);
        getDetails(
          request: {
            placeId: string;
            fields: string[];
          },
          callback: (place: any, status: any) => void
        ): void;
      }
    }
  }
}

export {};