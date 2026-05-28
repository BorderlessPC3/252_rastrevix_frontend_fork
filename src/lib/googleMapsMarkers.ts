const vehicleSvg = (size: number, color: string, isBus: boolean) =>
  isBus
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="${color}" d="M4 6h16v11H4V6zm2 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm12 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="${color}" d="M5 11l1.5-5h11L19 11v8H5v-8zm2 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>`;

export function createVehicleMarkerIcon(
  tipo?: string,
  isSelected = false
): google.maps.Icon {
  const size = isSelected ? 32 : 24;
  const color = "#22c55e";
  const isBus = tipo === "onibus";
  const svg = vehicleSvg(size, color, isBus);

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
