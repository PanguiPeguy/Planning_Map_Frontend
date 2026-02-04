"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix pour les icones Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapController({ depart, arrivee, route }) {
  const map = useMap();

  useEffect(() => {
    if (route && route.segments && route.segments.length > 0) {
      const allPoints = [];
      route.segments.forEach(seg => {
        if (seg.startPoint) allPoints.push([seg.startPoint.latitude, seg.startPoint.longitude]);
        if (seg.endPoint) allPoints.push([seg.endPoint.latitude, seg.endPoint.longitude]);
      });
      
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (depart && arrivee) {
      const bounds = L.latLngBounds([
        [depart.lat, depart.lon],
        [arrivee.lat, arrivee.lon],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (depart) {
      map.setView([depart.lat, depart.lon], 13);
    } else if (arrivee) {
      map.setView([arrivee.lat, arrivee.lon], 13);
    }
  }, [depart, arrivee, route, map]);

  return null;
}

export default function ItineraryMap({ depart, arrivee, route }) {
  // Centre par défaut (Yaoundé)
  const defaultCenter = [3.8480, 11.5021];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{zIndex: '1'}}
      className="w-full h-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {depart && (
        <Marker position={[depart.lat, depart.lon]}>
          <Popup>Départ: {depart.name}</Popup>
        </Marker>
      )}

      {arrivee && (
        <Marker position={[arrivee.lat, arrivee.lon]}>
          <Popup>Arrivée: {arrivee.name}</Popup>
        </Marker>
      )}
      
      {route && route.segments && (
        <Polyline 
          positions={route.segments.map(seg => [
            [seg.startPoint.latitude, seg.startPoint.longitude],
            [seg.endPoint.latitude, seg.endPoint.longitude]
          ]).flat()}
          color="#3B82F6"
          weight={6}
          opacity={0.8}
        />
      )}

      <MapController depart={depart} arrivee={arrivee} route={route} />
    </MapContainer>
  );
}
