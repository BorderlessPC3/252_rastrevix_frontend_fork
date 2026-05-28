import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  GOOGLE_MAPS_API_KEY,
  isGoogleMapsConfigured,
} from "../config/googleMaps";

let configured = false;
let loadPromise: Promise<typeof google> | null = null;

export class GoogleMapsNotConfiguredError extends Error {
  constructor() {
    super("GOOGLE_MAPS_API_KEY_MISSING");
    this.name = "GoogleMapsNotConfiguredError";
  }
}

/** Carrega a API do Google Maps uma única vez (singleton). */
export function loadGoogleMaps(): Promise<typeof google> {
  if (!isGoogleMapsConfigured()) {
    return Promise.reject(new GoogleMapsNotConfiguredError());
  }

  if (!loadPromise) {
    if (!configured) {
      setOptions({ key: GOOGLE_MAPS_API_KEY, v: "weekly" });
      configured = true;
    }
    loadPromise = importLibrary("maps").then(() => google);
  }

  return loadPromise;
}
