'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corriger les icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

function LocationMarker({ onLocationChange, initialLat, initialLng }) {
  const [position, setPosition] = useState(
    initialLat && initialLng 
      ? [initialLat, initialLng] 
      : [3.8667, 11.5167] // Yaoundé par défaut
  );

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
    },
  });

  // Centrer la carte sur la position initiale
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
      map.setView([initialLat, initialLng], map.getZoom());
    }
  }, [initialLat, initialLng, map]);

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onLocationChange, initialLat, initialLng }) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return <div className="h-full bg-gray-200 animate-pulse"></div>;
  }

  return (
    <MapContainer
      center={initialLat && initialLng ? [initialLat, initialLng] : [3.8667, 11.5167]}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker 
        onLocationChange={onLocationChange}
        initialLat={initialLat}
        initialLng={initialLng}
      />
    </MapContainer>
  );
}