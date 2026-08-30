import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useGeolocation(active: boolean) {
  const { updateLocation, pushLocationRecord, syncLocationQueue } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState | 'unknown'>('unknown');
  const watchIdRef = useRef<number | null>(null);

  // Check initial permissions
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        setPermission(status.state);
        status.onchange = () => setPermission(status.state);
      });
    }
  }, []);

  // Offline sync listener
  useEffect(() => {
    const handleOnline = () => {
      syncLocationQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncLocationQueue]);

  // Watch position
  useEffect(() => {
    if (!active) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      // Update instantaneous map location
      updateLocation(longitude, latitude);
      
      // Push to sync queue (store handles de-duplication)
      pushLocationRecord(latitude, longitude);

      // Attempt immediate sync if online
      if (navigator.onLine) {
        syncLocationQueue();
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.error('GPS Error:', err);
      if (err.code === err.PERMISSION_DENIED) {
        setError('GPS permission denied. Please enable location services.');
        setPermission('denied');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setError('GPS signal unavailable. Using last known location or offline cache.');
      } else {
        setError('Network error during location request.');
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true, // Battery-conscious: would drop to false in low-battery mode
        timeout: 10000,
        maximumAge: 5000, // Allow 5-second old cached positions
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [active, updateLocation, pushLocationRecord, syncLocationQueue]);

  return { error, permission };
}
