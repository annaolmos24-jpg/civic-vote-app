import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngBoundsExpression } from "leaflet";

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
}

export default function PollingMap({ points }: { points: MapPoint[] }) {
  const bounds: LatLngBoundsExpression = points.map((p) => [p.lat, p.lng] as [number, number]);
  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [30, 30], maxZoom: 15 }}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-lg border border-slate-300 sm:h-96"
      aria-label="Map of voting locations"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lng]}
          radius={9}
          pathOptions={{ color: "#fff", weight: 2, fillColor: p.color, fillOpacity: 1 }}
        >
          <Tooltip>{p.label}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
