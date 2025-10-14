// src/components/MapViewInner.tsx
"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import { useEffect } from "react";

// Use a custom default marker so icons load correctly in bundlers like Next.js
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapViewInner({ lat, lon }: { lat: number; lon: number }) {
  // Set the default icon once on mount (no `any` casts needed)
  useEffect(() => {
    L.Marker.prototype.options.icon = markerIcon;
  }, []);

  return (
    <div className="glass overflow-hidden rounded-xl">
      <MapContainer
        center={[lat, lon]}
        zoom={11}
        style={{ height: 300, width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>
            {lat.toFixed(3)}, {lon.toFixed(3)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
