import { useEffect, useRef, useState, type RefObject } from "react";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  GOOGLE_MAPS_API_KEY_HINT,
  isGoogleMapsConfigured,
} from "../config/googleMaps";
import {
  GoogleMapsNotConfiguredError,
  loadGoogleMaps,
} from "../lib/googleMapsLoader";

export type GoogleMapType = "roadmap" | "satellite";

export function useGoogleMap(
  containerRef: RefObject<HTMLDivElement | null>,
  options?: Partial<google.maps.MapOptions>
) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if (!isGoogleMapsConfigured()) {
      setError(GOOGLE_MAPS_API_KEY_HINT);
      return;
    }

    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
          center: DEFAULT_MAP_CENTER,
          zoom: DEFAULT_MAP_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          ...options,
        });

        mapRef.current = map;
        setReady(true);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof GoogleMapsNotConfiguredError) {
          setError(GOOGLE_MAPS_API_KEY_HINT);
          return;
        }
        setError(
          err instanceof Error ? err.message : "Erro ao carregar Google Maps"
        );
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
      setReady(false);
    };
    // options aplicadas apenas na criação do mapa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  const setMapType = (type: GoogleMapType) => {
    mapRef.current?.setMapTypeId(type);
  };

  return { mapRef, ready, error, setMapType };
}
