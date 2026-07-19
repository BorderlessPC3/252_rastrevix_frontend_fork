const carSvg = (size: number, color: string, stroke: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.18" stroke="${stroke}" stroke-width="1.5"/>
    <path fill="${color}" d="M8 14.5 10 9h12l2 5.5v7.5H8V14.5zm2.2 10.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zm11.6 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM11 14.5h10l-1.2-3.5H12.2L11 14.5z"/>
  </svg>`;

const busSvg = (size: number, color: string, stroke: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.18" stroke="${stroke}" stroke-width="1.5"/>
    <path fill="${color}" d="M7 12h18v10H7V12zm2 12.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zm14 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM9 14h14v5H9v-5z"/>
  </svg>`;

const truckSvg = (size: number, color: string, stroke: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.18" stroke="${stroke}" stroke-width="1.5"/>
    <path fill="${color}" d="M6 14h12v8H6v-8zm12 2h4l3 3v3h-7v-6zm-9.8 9.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zm14.6 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z"/>
  </svg>`;

export function createVehicleMarkerIcon(
  tipo?: string,
  isSelected = false
): google.maps.Icon {
  const size = isSelected ? 40 : 32;
  const color = isSelected ? "#fbbf24" : "#22c55e";
  const stroke = isSelected ? "#f59e0b" : "#15803d";
  const svg =
    tipo === "onibus"
      ? busSvg(size, color, stroke)
      : tipo === "caminhao"
        ? truckSvg(size, color, stroke)
        : carSvg(size, color, stroke);

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}

export function createReplayMarkerIcon(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: "#10b981",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };
}
