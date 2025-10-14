"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapViewInner({ lat, lon }:{ lat:number; lon:number }) {
  useEffect(()=>{ (L.Marker.prototype as any).options.icon = markerIcon; }, []);
  return (
    <div className="glass overflow-hidden rounded-xl">
      <MapContainer center={[lat, lon]} zoom={11} style={{ height: 300, width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>{lat.toFixed(3)}, {lon.toFixed(3)}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
