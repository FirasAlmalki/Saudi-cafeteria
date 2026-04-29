"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import type { Branch } from "@/app/api/places/route";
import BranchCard from "./BranchCard";

// Custom marker icons
function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

const ICON_RED    = makeIcon("#D4241A");
const ICON_GREEN  = makeIcon("#1E7B1E");
const ICON_USER   = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#2563EB;border:3px solid white;
    box-shadow:0 0 0 4px rgba(37,99,235,0.25);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FlyTo({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(pos, 13, { duration: 1.2 }); }, [pos, map]);
  return null;
}

interface MapProps {
  branches: Branch[];
  userLocation: { lat: number; lng: number } | null;
  nearestId: string | null;
  userDistance: (b: Branch) => number;
}

const SA_CENTER: [number, number] = [24.7136, 46.6753];

export default function Map({ branches, userLocation, nearestId, userDistance }: MapProps) {
  return (
    <MapContainer
      center={SA_CENTER}
      zoom={6}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <>
          <FlyTo pos={[userLocation.lat, userLocation.lng]} />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={ICON_USER}>
            <Popup>موقعك الحالي</Popup>
          </Marker>
        </>
      )}

      {branches.map((b) => (
        <Marker
          key={b.id}
          position={[b.lat, b.lng]}
          icon={b.id === nearestId ? ICON_GREEN : ICON_RED}
        >
          <Popup minWidth={220} maxWidth={260}>
            <BranchCard
              branch={b}
              distance={userLocation ? userDistance(b) : null}
              isNearest={b.id === nearestId}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
