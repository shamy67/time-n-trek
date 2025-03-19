
import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

interface UseLocationResult extends LocationState {
  getLocation: () => Promise<LocationState>;
}

export function useLocation(): UseLocationResult {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: false,
    error: null,
  });

  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      // For a real app, you would use a geocoding service API like Google Maps or Mapbox
      // This is a mock implementation
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (error) {
      console.error('Error fetching address:', error);
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const getLocation = async (): Promise<LocationState> => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by your browser';
      setState(prev => ({ ...prev, error, loading: false }));
      return { ...state, error, loading: false };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      const address = await fetchAddress(latitude, longitude);

      const newState = {
        latitude,
        longitude,
        address,
        loading: false,
        error: null
      };

      setState(newState);
      return newState;
    } catch (error) {
      let errorMsg = 'Failed to get location';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg = 'The request to get location timed out.';
            break;
        }
      }

      const errorState = {
        ...state,
        loading: false,
        error: errorMsg
      };
      
      setState(errorState);
      return errorState;
    }
  };

  return {
    ...state,
    getLocation
  };
}
