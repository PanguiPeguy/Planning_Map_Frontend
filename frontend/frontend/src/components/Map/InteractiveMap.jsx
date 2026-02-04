"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { poiService } from "@/src/services/poiService";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Component to auto-fit map bounds to show all markers and routes
 */
function MapBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
}

/**
 * Interactive Map Component
 *
 * @param {Object} props
 * @param {Array} props.route - Route segments from A* algorithm
 * @param {Array} props.pois - POIs to display on map
 * @param {Object} props.startPoint - Start coordinates {lat, lon}
 * @param {Object} props.endPoint - End coordinates {lat, lon}
 * @param {Function} props.onPoiClick - Callback when POI is clicked
 * @param {String} props.className - Additional CSS classes
 * @param {Function} props.onPoisUpdate - Callback pour mettre à jour la liste des POIs après interaction
 */
export default function InteractiveMap({
  route = null,
  pois = [],
  startPoint = null,
  endPoint = null,
  onPoiClick = null,
  className = "",
  onPoisUpdate = null,
}) {
  // État local pour gérer les POIs avec UI optimiste
  const [localPois, setLocalPois] = useState(pois);

  // Synchroniser avec les props
  useEffect(() => {
    setLocalPois(pois);
  }, [pois]);

  // Default center (Yaoundé, Cameroon)
  const defaultCenter = [3.848, 11.5021];
  const defaultZoom = 10;

  // Calculate center from route or use default
  const center =
    route && route.segments && route.segments.length > 0
      ? [route.segments[0].startPoint.latitude, route.segments[0].startPoint.longitude]
      : startPoint
        ? [startPoint.lat, startPoint.lon]
        : defaultCenter;

  // Prepare all positions for bounds calculation
  const allPositions = [];

  // Add route points
  if (route && route.segments) {
    route.segments.forEach((segment) => {
      if (segment.startPoint) allPositions.push([segment.startPoint.latitude, segment.startPoint.longitude]);
      if (segment.endPoint) allPositions.push([segment.endPoint.latitude, segment.endPoint.longitude]);
    });
  }

  // Add POI positions
  localPois.forEach((poi) => {
    allPositions.push([poi.latitude, poi.longitude]);
  });

  // Add start/end points
  if (startPoint) allPositions.push([startPoint.lat, startPoint.lon]);
  if (endPoint) allPositions.push([endPoint.lat, endPoint.lon]);

  // Create custom icons for different marker types
  const createIcon = (color, icon) =>
    new L.DivIcon({
      className: "custom-marker",
      html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${icon}</span>
      </div>
    `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

  const startIcon = createIcon("#22c55e", "🚀");
  const endIcon = createIcon("#ef4444", "🏁");
  const poiIcon = (category) => createIcon("#3b82f6", "📍");

  return (
    <div className={`relative w-full h-full ${className}`} style={{ zIndex: '1' }}>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        className="w-full h-full rounded-xl"
        style={{ zIndex: '1', minHeight: "500px" }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit bounds */}
        {allPositions.length > 0 && <MapBounds positions={allPositions} />}

        {/* Start Marker */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lon]} icon={startIcon}>
            <Popup>
              <div className="font-semibold">Point de départ</div>
              {startPoint.name && (
                <div className="text-sm text-gray-600">{startPoint.name}</div>
              )}
            </Popup>
          </Marker>
        )}

        {/* End Marker */}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lon]} icon={endIcon}>
            <Popup>
              <div className="font-semibold">Point d'arrivée</div>
              {endPoint.name && (
                <div className="text-sm text-gray-600">{endPoint.name}</div>
              )}
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {route && route.segments && route.segments.length > 0 && (
          <Polyline
            positions={route.segments
              .map((seg) => [
                [seg.startPoint.latitude, seg.startPoint.longitude],
                [seg.endPoint.latitude, seg.endPoint.longitude],
              ])
              .flat()}
            pathOptions={{
              color: "#3b82f6",
              weight: 5,
              opacity: 0.7,
              dashArray: "10, 10",
              dashOffset: "0",
            }}
          />
        )}

        {/* POI Markers with Clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {localPois.map((poi) => (
            <POIMarker
              key={poi.poiId}
              poi={poi}
              poiIcon={poiIcon(poi.category?.name)}
              onPoiClick={onPoiClick}
              onPoisUpdate={onPoisUpdate}
              localPois={localPois}
              setLocalPois={setLocalPois}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

/**
 * POI Marker Component with Like/Favorite interactions
 */
function POIMarker({ poi, poiIcon, onPoiClick, onPoisUpdate, localPois, setLocalPois }) {
  const handleLike = async (e) => {
    e.stopPropagation();

    // UI optimiste
    const updatedPois = localPois.map(p => {
      if (p.poiId === poi.poiId) {
        const newIsLiked = !p.isLiked;
        return {
          ...p,
          isLiked: newIsLiked,
          likeCount: newIsLiked ? (p.likeCount || 0) + 1 : Math.max((p.likeCount || 0) - 1, 0)
        };
      }
      return p;
    });
    setLocalPois(updatedPois);

    // Appel API
    try {
      if (poi.isLiked) {
        await poiService.unlikePoi(poi.poiId);
      } else {
        await poiService.likePoi(poi.poiId);
      }
      onPoisUpdate && onPoisUpdate();
    } catch (error) {
      console.error('Erreur lors du like:', error);
      // Rollback en cas d'erreur
      setLocalPois(localPois);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();

    // UI optimiste
    const updatedPois = localPois.map(p => {
      if (p.poiId === poi.poiId) {
        const newIsFavorite = !p.isFavorite;
        return {
          ...p,
          isFavorite: newIsFavorite,
          favoriteCount: newIsFavorite ? (p.favoriteCount || 0) + 1 : Math.max((p.favoriteCount || 0) - 1, 0)
        };
      }
      return p;
    });
    setLocalPois(updatedPois);

    // Appel API
    try {
      if (poi.isFavorite) {
        await poiService.removeFromFavorites(poi.poiId);
      } else {
        await poiService.addToFavorites(poi.poiId);
      }
      onPoisUpdate && onPoisUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise en favoris:', error);
      // Rollback en cas d'erreur
      setLocalPois(localPois);
    }
  };

  return (
    <Marker
      position={[poi.latitude, poi.longitude]}
      icon={poiIcon}
      eventHandlers={{
        click: () => onPoiClick && onPoiClick(poi),
      }}
    >
      <Popup maxWidth={320}>
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{poi.name}</h3>

          {poi.category && (
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {poi.category.name}
              </span>
              {poi.rating && (
                <span className="text-sm text-gray-600">
                  ⭐ {poi.rating.toFixed(1)}
                </span>
              )}
            </div>
          )}

          {poi.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-3">
              {poi.description}
            </p>
          )}

          {poi.address && (
            <div className="text-xs text-gray-500 mb-1">
              📍 {poi.address}
            </div>
          )}

          {poi.phone && (
            <div className="text-xs text-gray-500 mb-2">📞 {poi.phone}</div>
          )}

          {/* Boutons Like et Favoris */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${poi.isLiked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title={poi.isLiked ? 'Retirer le like' : 'Liker'}
            >
              <Heart
                size={16}
                className={poi.isLiked ? 'fill-red-600' : ''}
              />
              <span>{poi.likeCount || 0}</span>
            </button>

            <button
              onClick={handleFavorite}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${poi.isFavorite
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title={poi.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Bookmark
                size={16}
                className={poi.isFavorite ? 'fill-amber-600' : ''}
              />
            </button>
          </div>

          {poi.services && poi.services.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {poi.services.slice(0, 3).map((service, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
