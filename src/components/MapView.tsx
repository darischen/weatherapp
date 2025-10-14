"use client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
const MapInner = dynamic(()=> import("./MapViewInner"), { ssr: false });
export default function MapView({ lat, lon }:{ lat:number; lon:number }) {
  return <MapInner lat={lat} lon={lon} />;
}
