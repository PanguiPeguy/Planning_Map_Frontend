'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function PositionMap({ latitude, longitude, name }) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady || typeof window === 'undefined') {
    return <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>;
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="h-full w-full"
        style={{zIndex: '1'}}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-blue-900">{name}</h3>
              <p className="text-sm text-gray-600">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}