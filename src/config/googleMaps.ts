/** Chave da API Google Maps (Maps JavaScript API no Google Cloud Console) */
export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";

export const isGoogleMapsConfigured = (): boolean =>
  GOOGLE_MAPS_API_KEY.length > 0;

export const DEFAULT_MAP_CENTER: google.maps.LatLngLiteral = {
  lat: -14.235,
  lng: -51.9253,
};

export const DEFAULT_MAP_ZOOM = 5;

export const GOOGLE_MAPS_API_KEY_HINT =
  "Defina VITE_GOOGLE_MAPS_API_KEY no arquivo .env e habilite a Maps JavaScript API no Google Cloud.";
