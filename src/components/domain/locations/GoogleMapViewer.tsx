import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsAPI } from '@/lib/googleMaps';
import { getGoogleMapsApiKey } from '@/lib/googleMapsApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Google Maps types
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
  }
}

interface Location {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

interface GoogleMapViewerProps {
  location?: Location;
  locations?: Location[];
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  draggable?: boolean;
  showControls?: boolean;
  height?: string;
  zoom?: number;
  className?: string;
}

export const GoogleMapViewer: React.FC<GoogleMapViewerProps> = ({
  location,
  locations,
  onLocationChange,
  draggable = false,
  showControls = true,
  height = '400px',
  zoom = 15,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapContent();
    }
  }, [location, locations]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiKey = await getGoogleMapsApiKey();
      await loadGoogleMapsAPI({
        apiKey,
        libraries: ['places', 'geometry']
      });

      if (!mapRef.current) return;

      const center = getInitialCenter();
      
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls,
        zoomControl: showControls,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      updateMapContent();
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to load map');
      setIsLoading(false);
      toast.error('Failed to load Google Maps');
    }
  };

  const getInitialCenter = () => {
    if (location) {
      return { lat: location.latitude, lng: location.longitude };
    }
    if (locations && locations.length > 0) {
      return { lat: locations[0].latitude, lng: locations[0].longitude };
    }
    // Default to New York City
    return { lat: 40.7128, lng: -74.0060 };
  };

  const updateMapContent = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (location) {
      createSingleLocationMarker();
    } else if (locations && locations.length > 0) {
      createMultipleLocationMarkers();
    }
  };

  const createSingleLocationMarker = () => {
    if (!mapInstanceRef.current || !location) return;

    const position = { lat: location.latitude, lng: location.longitude };
    
    const marker = new google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: location.name,
      draggable,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: 'hsl(var(--primary))',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    });

    if (draggable && onLocationChange) {
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          onLocationChange({
            lat: position.lat(),
            lng: position.lng()
          });
        }
      });
    }

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-medium text-sm">${location.name}</h3>
          <p class="text-xs text-muted-foreground">${location.address}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    markersRef.current.push(marker);
    mapInstanceRef.current.setCenter(position);
  };

  const createMultipleLocationMarkers = () => {
    if (!mapInstanceRef.current || !locations) return;

    const bounds = new google.maps.LatLngBounds();

    locations.forEach((loc, index) => {
      const position = { lat: loc.latitude, lng: loc.longitude };
      
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: loc.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: 'hsl(var(--primary))',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-medium text-sm">${loc.name}</h3>
            <p class="text-xs text-muted-foreground">${loc.address}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (locations.length > 1) {
      mapInstanceRef.current.fitBounds(bounds);
    } else {
      mapInstanceRef.current.setCenter(bounds.getCenter());
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ height }}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full rounded-lg ${className}`}
      style={{ height }}
    />
  );
};