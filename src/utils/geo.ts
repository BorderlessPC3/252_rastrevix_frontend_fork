/** Distância em km entre dois pontos (fórmula de Haversine). */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  timestamp?: Date | string;
}

export function calcularDistanciaPercorrida(pontos: GeoPoint[]): number {
  let total = 0;
  for (let i = 1; i < pontos.length; i++) {
    const prev = pontos[i - 1];
    const curr = pontos[i];
    if (
      prev.latitude != null &&
      prev.longitude != null &&
      curr.latitude != null &&
      curr.longitude != null
    ) {
      total += haversineKm(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
  }
  return Math.round(total * 100) / 100;
}

export function calcularDuracaoMinutos(
  inicio?: Date | string,
  fim?: Date | string
): number {
  if (!inicio || !fim) return 0;
  const t0 = new Date(inicio).getTime();
  const t1 = new Date(fim).getTime();
  if (Number.isNaN(t0) || Number.isNaN(t1) || t1 <= t0) return 0;
  return Math.round((t1 - t0) / 60000);
}
